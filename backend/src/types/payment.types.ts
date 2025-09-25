import { PaymentGateway, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CreatePaymentRequest {
    amount: number;
    currency?: string;
    payment_gateway: PaymentGateway;
    payment_method: PaymentMethod;
    transaction_id?: string;
    status: PaymentStatus;
    user_id: string;
}

export interface UpdatePaymentRequest {
    amount?: number;
    currency?: string;
    payment_gateway?: PaymentGateway;
    payment_method?: PaymentMethod;
    transaction_id?: string;
    status?: PaymentStatus;
}

export interface PaymentResponse {
    id: string;
    amount: number;
    currency?: string;
    payment_gateway: PaymentGateway;
    payment_method: PaymentMethod;
    transaction_id?: string;
    status: PaymentStatus;
    created_at: Date;
    user_id: string;
}

export interface PaymentQueryParams {
    user_id?: string;
    status?: PaymentStatus;
    payment_gateway?: PaymentGateway;
    page?: number;
    limit?: number;
}
