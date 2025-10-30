// SePay API Types based on webhook documentation

export interface SePayWebhookData {
  id: number;                              // ID giao dịch trên SePay
  gateway: string;                         // Brand name của ngân hàng
  transactionDate: string;                 // Thời gian xảy ra giao dịch phía ngân hàng
  accountNumber: string;                   // Số tài khoản ngân hàng
  code: string | null;                    // Mã code thanh toán (sepay tự nhận diện)
  content: string;                         // Nội dung chuyển khoản
  transferType: 'in' | 'out';             // Loại giao dịch. in là tiền vào, out là tiền ra
  transferAmount: number;                  // Số tiền giao dịch
  accumulated: number;                     // Số dư tài khoản (lũy kế)
  subAccount: string | null;              // Tài khoản ngân hàng phụ (tài khoản định danh)
  referenceCode: string;                   // Mã tham chiếu của tin nhắn sms
  description: string;                     // Toàn bộ nội dung tin nhắn sms
}

export interface SePayCreateOrderParams {
  amount: number;
  description: string;
  orderId: string;
  userId?: string;
  planId?: number;
  companyId?: string;
}

export interface SePayCreateOrderResponse {
  orderId: string;
  vaNumber: string;
  bankCode: string;
  qrCodeUrl: string;
  paymentUrl: string;
  amount: number;
  description: string;
  success?: boolean;
  qrCode?: string;
  message?: string;
}

export interface SePayQueryOrderParams {
  orderId: string;
}

export interface SePayQueryOrderResponse {
  orderId: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  transactionId?: string;
  transactionDate?: string;
  message?: string;
}

export interface SePayWebhookResponse {
  success: boolean;
  message?: string;
}

// SePay order mapping for database
export interface SePayOrderMapping {
  orderId: string;
  userId: string;
  amount: number;
  planId: number;
  companyId?: string;
  createdAt: Date;
}

// SePay status constants
export const SEPAY_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
} as const;

// SePay transfer types
export const SEPAY_TRANSFER_TYPE = {
  IN: 'in',
  OUT: 'out'
} as const;
