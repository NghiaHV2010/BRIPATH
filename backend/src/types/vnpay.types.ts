export interface VNPayCreateOrderRequest {
    vnp_Version: string;
    vnp_Command: string;
    vnp_TmnCode: string;
    vnp_Locale: string;
    vnp_CurrCode: string;
    vnp_TxnRef: string;
    vnp_OrderInfo: string;
    vnp_OrderType: string;
    vnp_Amount: number;
    vnp_ReturnUrl: string;
    vnp_IpAddr: string;
    vnp_CreateDate: string;
    vnp_BankCode?: string;
    vnp_SecureHash: string;
}

export interface VNPayCreateOrderResponse {
    vnp_TxnRef: string;
    payment_url: string;
}

export interface VNPayReturnData {
    vnp_TmnCode: string;
    vnp_Amount: string;
    vnp_BankCode: string;
    vnp_BankTranNo: string;
    vnp_CardType: string;
    vnp_OrderInfo: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
    vnp_SecureHashType?: string;
    vnp_TransactionNo: string;
    vnp_TransactionStatus: string;
}

export interface VNPayIPNData {
    vnp_TmnCode: string;
    vnp_Amount: string;
    vnp_BankCode: string;
    vnp_BankTranNo: string;
    vnp_CardType: string;
    vnp_OrderInfo: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
    vnp_SecureHashType?: string;
    vnp_TransactionNo: string;
    vnp_TransactionStatus: string;
}

export interface VNPayQueryRequest {
    vnp_RequestId: string;
    vnp_Version: string;
    vnp_Command: string;
    vnp_TmnCode: string;
    vnp_TxnRef: string;
    vnp_OrderInfo: string;
    vnp_TransactionDate: string;
    vnp_CreateDate: string;
    vnp_IpAddr: string;
    vnp_SecureHash: string;
}

export interface VNPayQueryResponse {
    vnp_ResponseCode: string;
    vnp_TransactionStatus: string;
    vnp_TxnRef: string;
    vnp_Amount: string;
    vnp_BankCode: string;
    vnp_BankTranNo: string;
    vnp_CardType: string;
    vnp_OrderInfo: string;
    vnp_PayDate: string;
    vnp_TransactionNo: string;
}


export interface CreateOrderParams {
    amount: number;
    orderInfo: string;
    bankCode?: string;
    locale?: string;
    orderType?: string;
}

export interface QueryOrderParams {
    orderId: string;
    transDate: string;
}


export const VNPAY_RESPONSE_CODE = {
    SUCCESS: '00',
    FAILED: '07',
    INVALID_AMOUNT: '04',
    ORDER_NOT_FOUND: '01',
    DUPLICATE_ORDER: '02',
    CHECKSUM_FAILED: '97'
} as const;

export const VNPAY_TRANSACTION_STATUS = {
    PENDING: '0',
    SUCCESS: '1',
    FAILED: '2'
} as const;
