
export interface ZaloPayCreateOrderRequest {
    app_id: string;
    app_user: string;
    app_trans_id: string;
    app_time: number;
    amount: number;
    item: string;
    description: string;
    embed_data?: string;
    bank_code?: string;
    callback_url: string;
}

export interface ZaloPayCreateOrderResponse {
    return_code: number;
    return_message: string;
    sub_return_code?: number;
    sub_return_message?: string;
    zp_trans_token?: string;
    order_url?: string;
    app_trans_id?: string;
}

export interface ZaloPayCallbackData {
    app_id: string;
    app_trans_id: string;
    zp_trans_id: string;
    amount: number;
    status: number;
    checksum: string;
}

export interface ZaloPayQueryOrderRequest {
    app_id: string;
    app_trans_id: string;
    mac: string;
}

export interface ZaloPayQueryOrderResponse {
    return_code: number;
    return_message: string;
    sub_return_code?: number;
    sub_return_message?: string;
    is_processing?: boolean;
    zp_trans_id?: string;
    amount?: number;
    status?: number;
}


export interface ZaloPayOrderStatus {
    PENDING: 1;
    PAID: 2;
    FAILED: 3;
    CANCELLED: 4;
}

export const ZALOPAY_ORDER_STATUS: ZaloPayOrderStatus = {
    PENDING: 1,
    PAID: 2,
    FAILED: 3,
    CANCELLED: 4
};

export interface CreateOrderParams {
    app_user: string;
    amount: number;
    description: string;
    item: string;
    bank_code?: string;
    embed_data?: string;
}
