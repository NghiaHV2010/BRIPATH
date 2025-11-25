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
 * Generate SePay QR Code URL using VietQR API
 * VietQR is a reliable Vietnamese QR code service
 */
export const generateSePayQRUrl = (
  vaNumber: string,
  bankCode: string,
  amount: number,
  orderId: string
): string => {
  // SePay VA format: TKP + VA number + order ID
  const description = `TKP${vaNumber} ${orderId}`;

  // Use VietQR API for QR code generation
  // Format: https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact.png?amount={amount}&addInfo={description}
  const params = new URLSearchParams({
    amount: amount.toString(),
    addInfo: description
  });

  return `https://img.vietqr.io/image/${bankCode}-${vaNumber}-compact.png?${params.toString()}`;
};

/**
 * Generate SePay payment URL for direct bank transfer link
 * Uses VietQR transfer URL format
 */
export const generateSePayPaymentUrl = (
  vaNumber: string,
  bankCode: string,
  amount: number,
  orderId: string
): string => {
  // SePay VA format: TKP + VA number + order ID
  const description = `TKP${vaNumber} ${orderId}`;

  // Use VietQR transfer URL format
  // Format: https://www.vietqr.io/transfer/{bankCode}-{accountNumber}?amount={amount}&addInfo={description}
  const params = new URLSearchParams({
    amount: amount.toString(),
    addInfo: description
  });

  return `https://www.vietqr.io/transfer/${bankCode}-${vaNumber}?${params.toString()}`;
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
  if (!content) return null;

  // Try new format first (without underscores): SEPAY + timestamp + random
  // Pattern: SEPAY followed by digits, then alphanumeric
  let match = content.match(/SEPAY\d+[a-z0-9]+/i);
  if (match) {
    return match[0];
  }

  // Fallback to old format (with underscores): SEPAY_timestamp_random
  match = content.match(/SEPAY_\d+_[a-z0-9]+/i);
  return match ? match[0] : null;
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
    baseUrl: 'https://www.vietqr.io'
  };
};
