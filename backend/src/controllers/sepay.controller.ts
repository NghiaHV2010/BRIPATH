import { Request, Response, NextFunction } from 'express';
import SePayService from '../services/sepay.service';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { PaymentGateway, PaymentMethod, PaymentStatus, NotificationsType, PrismaClient } from '@prisma/client';
import { hasPaymentByTransactionId, saveSePayOrderMapping, getSePayOrderMapping, deleteSePayOrderMapping } from '../utils/payment.utils';
import { generateSePayOrderId } from '../utils/sepay.utils';
import { SePayWebhookData } from '../types/sepay.types';
import { prisma } from '../libs/prisma';
import { sendEmailWithRetry } from '../utils/emailHandler';
import { errorHandler } from '../utils/error';
import { invoiceEmailTemplate } from '../constants/emailTemplate';
import { SEPAY_WEBHOOK_URL, SEPAY_RETURN_URL, SEPAY_SECRET } from '../config/env.config';

/**
 * Create SePay order
 */
export const createSePayOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, description, planId, companyId } = req.body;
    //@ts-ignore
    const userId = req.user?.id;

    if (!amount || !description) {
      return res.status(HTTP_ERROR.BAD_REQUEST).json({
        success: false,
        message: 'Amount and description are required'
      });
    }

    if (!userId) {
      return res.status(HTTP_ERROR.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const orderId = generateSePayOrderId();

    // Save order mapping FIRST before creating order
    try {
      await saveSePayOrderMapping(prisma, orderId, userId, Number(amount), Number(planId) || 0, companyId);
      console.log('SePay order mapping saved:', { orderId, userId, amount, planId, companyId });
    } catch (mappingError) {
      console.error('SePay order mapping error:', mappingError);
      return res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to save order mapping'
      });
    }

    // Ensure transfer content uses backend-generated orderId
    const safeDescription = (description as string) || '';
    const transferContent = safeDescription.replace(/SEPAY_\d+_[a-z0-9]+/i, orderId);

    // Use SePay service to create order (will use API key if available)
    const result = await SePayService.createOrder({
      amount: Number(amount),
      description: transferContent,
      orderId,
      planId: Number(planId) || 0,
      companyId
    });

    res.status(HTTP_SUCCESS.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Create SePay order error:', error);
    next(error);
  }
};

/**
 * Query SePay order status
 */
export const querySePayOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(HTTP_ERROR.BAD_REQUEST).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    const result = await SePayService.queryOrder({ orderId });

    res.status(HTTP_SUCCESS.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Query SePay order error:', error);
    next(error);
  }
};

/**
 * Handle SePay webhook - Optimized version
 */
export const handleSePayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  console.log('🔔 Webhook request received');
  console.log('📍 URL:', req.originalUrl || req.url);
  console.log('🌐 Method:', req.method);
  console.log('📦 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📄 Body:', JSON.stringify(req.body, null, 2));

  if (SEPAY_SECRET) {
    const authHeader = req.headers.authorization;
    const expectedAuth = `Apikey ${SEPAY_SECRET}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.error('❌ Webhook authentication failed');
      console.error('Received Authorization:', authHeader);
      console.error('Expected Authorization:', expectedAuth);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid API Key'
      });
    }
    console.log('✅ Webhook authentication successful');
  }

  const webhookData: SePayWebhookData = req.body;

  try {
    console.log('=== SePay Webhook Received ===');
    console.log('Transaction ID:', webhookData.id);
    console.log('Content:', webhookData.content);
    console.log('Amount:', webhookData.transferAmount);
    console.log('Type:', webhookData.transferType);
    console.log('Full webhook data:', JSON.stringify(webhookData, null, 2));
    console.log('================================');

    // Early validation - fail fast
    if (!webhookData.id || !webhookData.transferType || !webhookData.transferAmount) {
      console.error('Invalid webhook data:', webhookData);
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook data'
      });
    }

    // Only process successful incoming transactions
    if (webhookData.transferType !== 'in' || webhookData.transferAmount <= 0) {
      return res.status(201).json({
        success: true,
        message: 'Transaction ignored (not incoming or zero amount)'
      });
    }

    // Respond to SePay immediately (within 3 seconds requirement)
    res.status(201).json({
      success: true,
      message: 'Webhook received, processing in background'
    });

    // Process payment asynchronously
    processSePayPayment(webhookData).catch((error) => {
      console.error('Background payment processing error:', error);
    });

  } catch (error: any) {
    console.error('❌ SePay webhook error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    console.error('Error details:', JSON.stringify(error, null, 2));

    // If we haven't sent a response yet
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      });
    } else {
      console.error('⚠️ Response already sent, cannot send error response');
    }
  }
};

/**
 * Process SePay payment in background
 */
async function processSePayPayment(webhookData: SePayWebhookData): Promise<void> {
  try {
    console.log('🔄 Starting payment processing...');
    console.log('📄 Webhook content:', webhookData.content);
    console.log('📄 Webhook description:', webhookData.description);

    // Extract order ID and plan code
    const orderId = extractOrderIdFromContent(webhookData.content) ||
      extractOrderIdFromContent(webhookData.description);

    if (!orderId) {
      console.error('❌ No order ID found in webhook content');
      console.error('Content:', webhookData.content);
      console.error('Description:', webhookData.description);
      return;
    }

    const planCode = extractPlanCodeFromContent(webhookData.content) ||
      extractPlanCodeFromContent(webhookData.description);

    console.log('🔄 Processing payment for order:', orderId);
    console.log('📋 Plan code:', planCode);

    // Check for duplicate payment (idempotency)
    const exists = await hasPaymentByTransactionId(prisma, orderId);
    if (exists) {
      console.log('⚠️ Payment already processed for order:', orderId);
      return;
    }

    // Get order mapping
    const mapping = await getSePayOrderMapping(prisma, orderId);
    if (!mapping) {
      console.log('❌ No mapping found for order:', orderId);
      console.log('💡 This might mean the order was not created properly or already processed');
      return;
    }

    console.log('✅ Found mapping:', {
      user_id: mapping.user_id,
      amount: mapping.amount,
      plan_id: mapping.plan_id,
      company_id: mapping.company_id
    });

    // Process payment in a single transaction
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // Fetch data in parallel
      const [user, plan, existingTag] = await Promise.all([
        tx.users.findFirst({
          where: { id: mapping.user_id },
          select: { email: true }
        }),
        tx.membershipPlans.findFirst({
          where: { id: mapping.plan_id }
        }),
        mapping.company_id
          ? tx.tags.findFirst({ where: { label_name: "Đề xuất" } })
          : Promise.resolve(null)
      ]);

      if (!user || !plan) {
        throw new Error('User or plan not found');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration_months);

      // Create payment record
      const payment = await tx.payments.create({
        data: {
          amount: BigInt(webhookData.transferAmount),
          currency: 'VND',
          payment_gateway: 'SePay' as PaymentGateway,
          payment_method: 'bank_transfer' as PaymentMethod,
          transaction_id: orderId,
          status: 'success' as PaymentStatus,
          user_id: mapping.user_id
        },
      });

      // Create subscription and related records in parallel
      const [subscription] = await Promise.all([
        tx.subscriptions.create({
          data: {
            user_id: mapping.user_id,
            amount_paid: BigInt(webhookData.transferAmount),
            payment_id: payment.id,
            plan_id: plan.id,
            start_date: startDate,
            end_date: endDate,
            status: 'on_going',
            remaining_urgent_jobs: plan.urgent_jobs_limit || 0,
            remaining_quality_jobs: plan.quality_jobs_limit || 0,
            remaining_total_jobs: plan.total_jobs_limit || 0
          }
        }),
        // Create activity history
        tx.userActivitiesHistory.create({
          data: {
            user_id: mapping.user_id,
            activity_name: `Thanh toán gói ${plan.plan_name} thành công qua SePay${planCode ? ` (${planCode})` : ''}`,
          }
        }),
        // Create notification
        tx.userNotifications.create({
          data: {
            title: 'Gói dịch vụ đã được kích hoạt!',
            content: `Gói ${plan.plan_name} của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu sử dụng các tính năng nâng cao ngay bây giờ.`,
            type: 'pricing_plan' as NotificationsType,
            user_id: mapping.user_id
          } as any
        }),
        // Update company verification if applicable
        mapping.company_id && existingTag
          ? tx.companies.update({
            where: { id: mapping.company_id },
            data: {
              is_verified: true,
              companyTags: {
                connectOrCreate: {
                  where: {
                    company_id_tag_id: {
                      company_id: mapping.company_id,
                      tag_id: existingTag.id
                    }
                  },
                  create: {
                    tag_id: existingTag.id
                  }
                }
              }
            }
          })
          : Promise.resolve(null)
      ]);

      return {
        email: user.email,
        transaction_id: payment.transaction_id,
        plan_name: plan.plan_name,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        amount_paid: subscription.amount_paid
      };
    }, {
      maxWait: 10000, // Maximum time to wait for transaction to start
      timeout: 20000, // Maximum time for entire transaction
    });

    // Clean up mapping after successful processing
    await deleteSePayOrderMapping(prisma, orderId);
    console.log('✅ Payment processed successfully for order:', orderId);
    console.log('📧 Invoice email will be sent to:', result.email);

    // Send email asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        await sendEmailWithRetry(
          result.email,
          "BRIPATH - Hóa đơn điện tử",
          invoiceEmailTemplate(
            result.transaction_id,
            result.plan_name,
            result.start_date.toLocaleDateString(),
            result.end_date.toLocaleDateString(),
            result.amount_paid.toString(),
            'Chuyển khoản'
          )
        );
        console.log('Invoice email sent successfully to:', result.email);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
        // Don't throw - email failure shouldn't fail the payment
      }
    });

  } catch (error: any) {
    console.error('❌ SePay payment processing error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw error;
  }
}

/**
 * Extract order ID from SePay transaction content - Optimized
 */
const extractOrderIdFromContent = (content: string): string | null => {
  if (!content) return null;

  // Use regex exec for better performance
  const match = /SEPAY_\d+_[a-z0-9]+/i.exec(content);
  return match ? match[0] : null;
};

/**
 * Extract plan code from SePay transaction content - Optimized
 */
const extractPlanCodeFromContent = (content: string): string | null => {
  if (!content) return null;

  // Use indexOf for faster splitting
  const firstSpace = content.indexOf(' ');
  if (firstSpace === -1) return null;

  const secondSpace = content.indexOf(' ', firstSpace + 1);
  if (secondSpace === -1) return null;

  return content.slice(secondSpace + 1).trim() || null;
};

/**
 * Get SePay payment instructions
 */
export const getSePayInstructions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, amount, description } = req.query;

    if (!orderId || !amount) {
      return res.status(HTTP_ERROR.BAD_REQUEST).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    const instructions = SePayService.generatePaymentInstructions(
      orderId as string,
      Number(amount),
      description as string || 'Thanh toán dịch vụ'
    );

    res.status(HTTP_SUCCESS.OK).json({
      success: true,
      data: instructions
    });
  } catch (error) {
    console.error('Get SePay instructions error:', error);
    next(error);
  }
};

/**
 * Cancel/Delete SePay order mapping
 */
export const cancelSePayOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    //@ts-ignore
    const userId = req.user?.id;

    if (!orderId) {
      return res.status(HTTP_ERROR.BAD_REQUEST).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!userId) {
      return res.status(HTTP_ERROR.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if order mapping exists and belongs to user
    const mapping = await getSePayOrderMapping(prisma, orderId);

    if (!mapping) {
      return res.status(HTTP_ERROR.NOT_FOUND).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (mapping.user_id !== userId) {
      return res.status(HTTP_ERROR.FORBIDDEN).json({
        success: false,
        message: 'You can only cancel your own orders'
      });
    }
    // Check if payment already exists (don't allow cancel if paid)
    const existingPayment = await prisma.payments.findFirst({
      where: {
        transaction_id: orderId,
        payment_gateway: 'SePay' as PaymentGateway
      }
    });

    if (existingPayment) {
      return res.status(HTTP_ERROR.BAD_REQUEST).json({
        success: false,
        message: 'Cannot cancel order that has already been paid'
      });
    }

    // Delete the mapping
    await deleteSePayOrderMapping(prisma, orderId);

    res.status(HTTP_SUCCESS.OK).json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel SePay order error:', error);
    next(error);
  }
};

/**
 * Cancel all pending SePay orders for user
 */
export const cancelAllPendingOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //@ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(HTTP_ERROR.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get all pending orders for user
    const pendingOrders = await prisma.sepayOrders.findMany({
      where: {
        user_id: userId
      }
    });

    let cancelledCount = 0;

    for (const order of pendingOrders) {
      // Check if payment already exists
      const existingPayment = await prisma.payments.findFirst({
        where: {
          transaction_id: order.order_id,
          payment_gateway: 'SePay' as PaymentGateway
        }
      });

      // Only cancel if no payment exists
      if (!existingPayment) {
        await deleteSePayOrderMapping(prisma, order.order_id);
        cancelledCount++;
      }
    }

    res.status(HTTP_SUCCESS.OK).json({
      success: true,
      message: `Cancelled ${cancelledCount} pending orders`,
      cancelledCount
    });

  } catch (error) {
    console.error('Cancel all pending orders error:', error);
    next(error);
  }
};

/**
 * Check payment status by order ID
 */
export const checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(HTTP_ERROR.BAD_REQUEST).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Check if payment exists in database
    const payment = await prisma.payments.findFirst({
      where: {
        transaction_id: orderId,
        payment_gateway: 'SePay' as PaymentGateway
      },
      include: {
        subscriptions: true
      }
    });

    if (payment) {
      return res.status(HTTP_SUCCESS.OK).json({
        success: true,
        data: {
          orderId,
          status: payment.status === 'success' ? 'success' : 'pending',
          amount: Number(payment.amount),
          transactionId: payment.transaction_id,
          transactionDate: payment.created_at,
          message: payment.status === 'success' ? 'Payment completed successfully' : 'Payment is being processed'
        }
      });
    }

    // If no payment found, check if order mapping exists
    const mapping = await getSePayOrderMapping(prisma, orderId);
    if (mapping) {
      return res.status(HTTP_SUCCESS.OK).json({
        success: true,
        data: {
          orderId,
          status: 'pending',
          amount: mapping.amount,
          message: 'Payment not yet received. Please complete the transfer.'
        }
      });
    }

    // Order not found
    return res.status(HTTP_ERROR.NOT_FOUND).json({
      success: false,
      message: 'Order not found'
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    next(error);
  }
};