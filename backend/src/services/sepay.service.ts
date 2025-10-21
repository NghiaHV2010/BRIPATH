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
import { SEPAY_VA_NUMBER, SEPAY_BANK_CODE, SEPAY_API_KEY } from '../config/env.config';

class SePayService {
  private config: {
    vaNumber: string;
    bankCode: string;
    baseUrl: string;
    apiKey: string;
  };

  constructor() {
    this.config = {
      ...getDefaultSePayConfig(),
      apiKey: SEPAY_API_KEY
    };
  }

  /**
   * Create SePay order
   * If API key is provided, use SePay API. Otherwise, generate QR locally
   */
  async createOrder(params: SePayCreateOrderParams): Promise<SePayCreateOrderResponse> {
    try {
      const orderId = params.orderId || generateSePayOrderId();
      const amount = formatSePayAmount(params.amount);
      
      // If API key is available, try to use SePay API
      if (this.config.apiKey) {
        console.log('Using SePay API with key:', this.config.apiKey.substring(0, 10) + '...');
        // TODO: Implement actual SePay API call here
        // For now, fall back to local QR generation
      }
      
      // Generate QR code locally (current implementation)
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
}

export default new SePayService();
