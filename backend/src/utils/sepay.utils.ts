import crypto from 'crypto';
import { SEPAY_VA_NUMBER, SEPAY_BANK_CODE } from '../config/env.config';

/**
 * Generate SePay order ID
 */
export const generateSePayOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `SEPAY_${timestamp}_${random}`;
};

/**
 * Generate SePay QR Code URL
 */
export const generateSePayQRUrl = (
  vaNumber: string,
  bankCode: string,
  amount: number,
  orderId: string
): string => {
  const baseUrl = 'https://qr.sepay.vn/img';
  // SePay VA format: TKP + VA number + order ID
  const description = `TKP${vaNumber} ${orderId}`;
  const params = new URLSearchParams({
    acc: vaNumber,
    bank: bankCode,
    amount: amount.toString(),
    des: description
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generate SePay payment URL (same as QR but for direct link)
 */
export const generateSePayPaymentUrl = (
  vaNumber: string,
  bankCode: string,
  amount: number,
  orderId: string
): string => {
  return generateSePayQRUrl(vaNumber, bankCode, amount, orderId);
};

/**
 * Verify SePay webhook signature
 * Based on SePay documentation, they use API Key authentication
 */
export const verifySePayWebhookSignature = (
  data: string,
  signature: string,
  apiSecret: string
): boolean => {
  try {
    // SePay uses HMAC-SHA256 for webhook verification
    const expectedSignature = crypto
      .createHmac('sha256', apiSecret)
      .update(data)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('SePay signature verification error:', error);
    return false;
  }
};

/**
 * Generate SePay webhook response
 */
export const generateSePayWebhookResponse = (
  success: boolean,
  message?: string
): { success: boolean; message?: string } => {
  return {
    success,
    message: message || (success ? 'Success' : 'Failed')
  };
};

/**
 * Parse SePay webhook data
 */
export const parseSePayWebhookData = (body: any): any => {
  try {
    // SePay sends JSON data in webhook
    if (typeof body === 'string') {
      return JSON.parse(body);
    }
    return body;
  } catch (error) {
    console.error('SePay webhook data parsing error:', error);
    return null;
  }
};

/**
 * Validate SePay order data
 */
export const validateSePayOrderData = (data: any): boolean => {
  const requiredFields = ['id', 'transferType', 'transferAmount', 'content'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  return true;
};

/**
 * Check if SePay transaction is successful
 */
export const isSePayTransactionSuccess = (data: any): boolean => {
  return (
    data.transferType === 'in' &&
    data.transferAmount > 0 &&
    data.content && // Should contain order ID
    data.id // Transaction ID exists
  );
};

/**
 * Extract order ID from SePay transaction content
 */
export const extractOrderIdFromContent = (content: string): string | null => {
  // Look for order ID pattern in transaction content
  const orderIdMatch = content.match(/SEPAY_\d+_[a-z0-9]+/i);
  return orderIdMatch ? orderIdMatch[0] : null;
};

/**
 * Format amount for SePay (convert to cents if needed)
 */
export const formatSePayAmount = (amount: number): number => {
  // SePay expects amount in VND (no conversion needed)
  return Math.round(amount);
};

/**
 * Get default SePay configuration
 */
export const getDefaultSePayConfig = () => {
  return {
    vaNumber: SEPAY_VA_NUMBER,
    bankCode: SEPAY_BANK_CODE,
    baseUrl: 'https://qr.sepay.vn'
  };
};
