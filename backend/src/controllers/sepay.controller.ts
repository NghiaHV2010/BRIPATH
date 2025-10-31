import { Request, Response, NextFunction } from 'express';
import SePayService from '../services/sepay.service';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { PaymentGateway, PaymentMethod, PaymentStatus, NotificationsType } from '@prisma/client';
import { hasPaymentByTransactionId, saveSePayOrderMapping, getSePayOrderMapping, deleteSePayOrderMapping } from '../utils/payment.utils';
import { generateSePayOrderId } from '../utils/sepay.utils';
import { SePayWebhookData } from '../types/sepay.types';
import { prisma } from '../libs/prisma';

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
 * Handle SePay webhook
 */
export const handleSePayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookData: SePayWebhookData = req.body;

    console.log('=== SePay Webhook Received ===');
    console.log('Full webhook data:', JSON.stringify(webhookData, null, 2));
    console.log('Content:', webhookData.content);
    console.log('Description:', webhookData.description);
    console.log('Transfer Amount:', webhookData.transferAmount);
    console.log('Transfer Type:', webhookData.transferType);
    console.log('================================');

    // Validate webhook data
    if (!webhookData.id || !webhookData.transferType || !webhookData.transferAmount) {
      console.error('Invalid webhook data:', webhookData);
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook data'
      });
    }

    // Check if it's a successful incoming transaction
    if (webhookData.transferType === 'in' && webhookData.transferAmount > 0) {
      try {
        // Extract order ID from transaction content
        // SePay users put order ID in the transfer content/description
        const orderId = extractOrderIdFromContent(webhookData.content) ||
          extractOrderIdFromContent(webhookData.description);

        // Extract plan code for logging
        const planCode = extractPlanCodeFromContent(webhookData.content) ||
          extractPlanCodeFromContent(webhookData.description);

        console.log('Extracted order ID:', orderId);
        console.log('Extracted plan code:', planCode);

        if (orderId) {
          const exists = await hasPaymentByTransactionId(prisma, orderId);

          if (!exists) {
            // Get order mapping
            const mapping = await getSePayOrderMapping(prisma, orderId);

            if (mapping) {
              console.log('Processing payment for mapping:', mapping);

              await prisma.$transaction(async (tx: any) => {
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
                  }
                });

                // Create notification
                await tx.userNotifications.create({
                  data: {
                    user_id: mapping.user_id,
                    title: 'Thanh toán thành công',
                    content: `Bạn đã thanh toán đơn hàng ${orderId} thành công với số tiền ${webhookData.transferAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}${planCode ? ` cho gói ${planCode}` : ''}. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
                    type: 'pricing_plan' as NotificationsType,
                  } as any
                });

                // Create activity history
                const plan = await tx.membershipPlans.findFirst({
                  where: { id: mapping.plan_id }
                });

                await tx.userActivitiesHistory.create({
                  data: {
                    user_id: mapping.user_id,
                    activity_name: `Thanh toán gói ${plan?.plan_name || 'dịch vụ'} thành công qua SePay${planCode ? ` (${planCode})` : ''}`,
                  }
                });

                // Create subscription if plan exists
                if (plan) {
                  await tx.subscriptions.create({
                    data: {
                      user_id: mapping.user_id,
                      amount_paid: BigInt(webhookData.transferAmount),
                      payment_id: payment.id,
                      plan_id: plan.id,
                      start_date: new Date(),
                      end_date: new Date(new Date().setMonth(new Date().getMonth() + plan.duration_months)),
                      status: 'on_going',
                      remaining_urgent_jobs: plan.urgent_jobs_limit || 0,
                      remaining_quality_jobs: plan.quality_jobs_limit || 0,
                      remaining_total_jobs: plan.total_jobs_limit || 0
                    }
                  });

                  // Create additional activity history for subscription
                  // await tx.userActivitiesHistory.create({
                  //   data: {
                  //     user_id: mapping.user_id,
                  //     activity_name: `Gói ${plan.plan_name} đã được kích hoạt thành công. Bạn có thể bắt đầu sử dụng các tính năng nâng cao ngay bây giờ!`,
                  //   }
                  // });

                  // // Create additional notification for subscription activation
                  // await tx.userNotifications.create({
                  //   data: {
                  //     title: 'Gói dịch vụ đã được kích hoạt!',
                  //     content: `Gói ${plan.plan_name} của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu sử dụng các tính năng nâng cao ngay bây giờ.`,
                  //     type: 'pricing_plan' as NotificationsType,
                  //     user_id: mapping.user_id
                  //   } as any
                  // });
                }

                // Update company verification if applicable
                if (mapping.company_id) {
                  const tag = await tx.tags.findFirst({
                    where: { label_name: "Đề xuất" }
                  });

                  if (tag) {
                    await tx.companies.update({
                      where: { id: mapping.company_id },
                      data: {
                        is_verified: true,
                        companyTags: {
                          connectOrCreate: {
                            where: {
                              company_id_tag_id: {
                                company_id: mapping.company_id,
                                tag_id: tag.id
                              }
                            },
                            create: {
                              tag_id: tag.id
                            }
                          }
                        }
                      }
                    });
                  }
                }
              });

              // Clean up mapping
              await deleteSePayOrderMapping(prisma, orderId);
              console.log('Payment processed successfully for order:', orderId);
            } else {
              console.log('No mapping found for order:', orderId);
            }
          } else {
            console.log('Payment already exists for order:', orderId);
          }
        } else {
          console.log('No order ID found in content:', webhookData.content);
        }
      } catch (paymentError) {
        console.error('SePay payment processing error:', paymentError);
      }
    }

    // Return success response for SePay (HTTP 201 as per SePay docs)
    res.status(201).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('SePay webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * Extract order ID from SePay transaction content
 */
const extractOrderIdFromContent = (content: string): string | null => {
  if (!content) return null;

  // Look for order ID pattern in transaction content
  // Format: TKP69880428888 SEPAY_1234567890_abc123 PLANCODE
  // or: TKP69880428888 SEPAY_1234567890_abc123
  const orderIdMatch = content.match(/SEPAY_\d+_[a-z0-9]+/i);
  return orderIdMatch ? orderIdMatch[0] : null;
};

/**
 * Extract plan code from SePay transaction content
 */
const extractPlanCodeFromContent = (content: string): string | null => {
  if (!content) return null;

  // Look for plan code after order ID
  // Format: TKP69880428888 SEPAY_1234567890_abc123 PLANCODE
  const parts = content.split(' ');
  if (parts.length >= 3) {
    return parts[2]; // Plan code is the third part
  }
  return null;
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
