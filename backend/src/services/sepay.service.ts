import {
  SePayCreateOrderParams,
  SePayCreateOrderResponse,
  SePayQueryOrderParams,
  SePayQueryOrderResponse,
  SePayWebhookData,
  SePayWebhookResponse
} from '../types/sepay.types';
import {
  generateSePayOrderId,
  generateSePayQRUrl,
  generateSePayPaymentUrl,
  getDefaultSePayConfig,
  formatSePayAmount
} from '../utils/sepay.utils';
import { SEPAY_VA_NUMBER, SEPAY_BANK_CODE, SEPAY_WEBHOOK_URL, SEPAY_RETURN_URL } from '../config/env.config';

class SePayService {
  private config: {
    vaNumber: string;
    bankCode: string;
    baseUrl: string;
    webhookUrl: string;
    returnUrl: string;
  };

  constructor() {
    this.config = {
      ...getDefaultSePayConfig(),
      webhookUrl: SEPAY_WEBHOOK_URL,
      returnUrl: SEPAY_RETURN_URL
    };
  }

  /**
   * Create SePay order
   * If API key is provided, use SePay API. Otherwise, generate QR locally
   */
  async createOrder(params: SePayCreateOrderParams): Promise<SePayCreateOrderResponse> {
    try {
      // Check for existing pending order for this user and plan
      if (params.userId && params.planId) {
        const existingOrder = await this.findPendingOrder(params.userId, params.planId);
        if (existingOrder) {
          console.log('Found existing pending order, returning it:', existingOrder.orderId);
          return {
            orderId: existingOrder.orderId,
            vaNumber: this.config.vaNumber,
            bankCode: this.config.bankCode,
            qrCodeUrl: existingOrder.qrCode,
            paymentUrl: generateSePayPaymentUrl(this.config.vaNumber, this.config.bankCode, existingOrder.amount, existingOrder.orderId),
            amount: existingOrder.amount,
            description: params.description,
            success: true,
            message: 'Existing pending order found'
          };
        }
      }
      
      const orderId = params.orderId || generateSePayOrderId();
      const amount = formatSePayAmount(params.amount);
      
      // Try to create dynamic QR from SePay using qr.sepay.vn service
      // This uses SePay's QR generation service (not SDK)
      try {
        console.log('🔄 Attempting to create dynamic QR from SePay service...');
        const sepayQRResult = await this.createDynamicQRFromSePay({
          orderId,
          amount: params.amount,
          description: params.description,
          webhookUrl: this.config.webhookUrl,
          returnUrl: this.config.returnUrl
        });

        if (sepayQRResult) {
          console.log('✅ Dynamic QR created from SePay service');
          return {
            orderId,
            vaNumber: sepayQRResult.vaNumber || this.config.vaNumber,
            bankCode: sepayQRResult.bankCode || this.config.bankCode,
            qrCodeUrl: sepayQRResult.qrCodeUrl,
            paymentUrl: sepayQRResult.paymentUrl,
            amount: params.amount,
            description: params.description,
            success: true,
            message: 'Dynamic QR created from SePay service'
          };
        }
      } catch (error: any) {
        console.warn('⚠️ Failed to create dynamic QR from SePay, using fallback:', error.message);
        // Fall through to local generation
      }
      
      // Fallback: Use local QR generation (VietQR)
      console.log('📱 Using local QR generation (VietQR)');
      const qrCodeUrl = generateSePayQRUrl(
        this.config.vaNumber,
        this.config.bankCode,
        amount,
        orderId
      );
      
      const paymentUrl = generateSePayPaymentUrl(
        this.config.vaNumber,
        this.config.bankCode,
        amount,
        orderId
      );

      return {
        orderId,
        vaNumber: this.config.vaNumber,
        bankCode: this.config.bankCode,
        qrCodeUrl,
        paymentUrl,
        amount: params.amount,
        description: params.description
      };
    } catch (error) {
      console.error('SePay create order error:', error);
      throw new Error('Failed to create SePay order');
    }
  }

  /**
   * Query SePay order status
   * Since SePay doesn't have a query API, we return pending status
   * The actual status will be updated via webhook
   */
  async queryOrder(params: SePayQueryOrderParams): Promise<SePayQueryOrderResponse> {
    try {
      // SePay doesn't provide query API
      // Status is updated via webhook only
      return {
        orderId: params.orderId,
        status: 'pending',
        amount: 0,
        message: 'Status will be updated via webhook'
      };
    } catch (error) {
      console.error('SePay query order error:', error);
      throw new Error('Failed to query SePay order');
    }
  }

  /**
   * Process SePay webhook
   */
  async processWebhook(webhookData: SePayWebhookData): Promise<SePayWebhookResponse> {
    try {
      // Validate webhook data
      if (!webhookData.id || !webhookData.transferType || !webhookData.transferAmount) {
        return {
          success: false,
          message: 'Invalid webhook data'
        };
      }

      // Check if it's a successful incoming transaction
      if (webhookData.transferType === 'in' && webhookData.transferAmount > 0) {
        return {
          success: true,
          message: 'Transaction processed successfully'
        };
      }

      return {
        success: false,
        message: 'Transaction not processed'
      };
    } catch (error) {
      console.error('SePay webhook processing error:', error);
      return {
        success: false,
        message: 'Webhook processing failed'
      };
    }
  }

  /**
   * Generate payment instructions for SePay
   */
  generatePaymentInstructions(orderId: string, amount: number, description: string) {
    return {
      vaNumber: this.config.vaNumber,
      bankCode: this.config.bankCode,
      amount,
      orderId,
      description,
      instructions: [
        `Chuyển khoản chính xác số tiền: ${amount.toLocaleString('vi-VN')} VND`,
        `Đến tài khoản: ${this.config.vaNumber}`,
        `Ngân hàng: ${this.config.bankCode}`,
        `Nội dung chuyển khoản: ${orderId}`,
        `Giao dịch sẽ được xử lý tự động trong vòng 5-10 phút`
      ]
    };
  }

  /**
   * Create dynamic QR from SePay using qr.sepay.vn service
   * Format: https://qr.sepay.vn/img?acc=SO_TAI_KHOAN&bank=NGAN_HANG&amount=SO_TIEN&des=NOI_DUNG
   * 
   * Reference: https://qr.sepay.vn (SePay QR Code Generator)
   */
  private async createDynamicQRFromSePay(params: {
    orderId: string;
    amount: number;
    description: string;
    webhookUrl: string;
    returnUrl: string;
  }): Promise<{
    vaNumber: string;
    bankCode: string;
    qrCodeUrl: string;
    paymentUrl: string;
  } | null> {
    // Use VA number (account number) for QR generation
    // If merchant_id is provided and different from VA, you can use it
    const accountNumber = this.config.vaNumber;
    
    if (!accountNumber || !this.config.bankCode) {
      console.warn('⚠️ Missing account number or bank code for SePay QR');
      return null;
    }

    try {
      // Create SePay dynamic QR URL using qr.sepay.vn service
      // Format: https://qr.sepay.vn/img?acc=SO_TAI_KHOAN&bank=NGAN_HANG&amount=SO_TIEN&des=NOI_DUNG
      const qrParams = new URLSearchParams({
        acc: accountNumber,
        bank: this.config.bankCode,
        amount: params.amount.toString(),
        des: params.description
        // template: 'compact' // Optional: 'compact' or 'qronly'
      });

      const qrCodeUrl = `https://qr.sepay.vn/img?${qrParams.toString()}`;
      
      // Payment URL - SePay might have a transfer URL, or use the same QR URL
      // For now, we'll use the QR URL as payment URL
      const paymentUrl = qrCodeUrl;

      console.log('✅ Created dynamic QR from SePay service (qr.sepay.vn)');
      console.log('📱 QR URL:', qrCodeUrl);

      return {
        vaNumber: accountNumber,
        bankCode: this.config.bankCode,
        qrCodeUrl,
        paymentUrl
      };
      
    } catch (error: any) {
      console.error('❌ Error creating dynamic QR from SePay:', error);
      return null;
    }
  }

  /**
   * Find existing pending order for user and plan
   */
  private async findPendingOrder(userId: string, planId: number): Promise<{
    orderId: string;
    qrCode: string;
    amount: number;
  } | null> {
    try {
      // Check if there's an existing pending order in the database
      // This would need to be implemented based on your database schema
      // For now, we'll return null to indicate no existing order
      return null;
    } catch (error) {
      console.error('Error finding pending order:', error);
      return null;
    }
  }
}

export default new SePayService();
