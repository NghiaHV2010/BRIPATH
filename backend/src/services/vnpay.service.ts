import axios from 'axios';
import {
    VNPayCreateOrderResponse,
    VNPayQueryResponse,
    CreateOrderParams,
    QueryOrderParams
} from '../types/vnpay.types';
import {
    createOrderData,
    createQueryData
} from '../utils/vnpay.utils';
import { vnpayOrderMapping, saveVnpOrderMapping } from '../utils/payment.utils';
import { PrismaClient } from '../generated/prisma';
import { VNPAY_API } from '../config/env.config';

class VNPayService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = VNPAY_API;
    }

    async createOrder(params: CreateOrderParams, req: any): Promise<VNPayCreateOrderResponse> {
        try {
            const orderData = createOrderData(params, req);
            // Remember mapping for IPN/return later
            try {
                //@ts-ignore
                const userId = req.user?.id as string | undefined;
                if (userId) {
                    vnpayOrderMapping.set(orderData.vnp_TxnRef, { user_id: userId, amount: params.amount });
                    // Also persist to DB for reliability
                    const prisma = new PrismaClient();
                    await saveVnpOrderMapping(prisma, orderData.vnp_TxnRef, userId, params.amount);
                }
            } catch {}

            return {
                vnp_TxnRef: orderData.vnp_TxnRef,
                payment_url: orderData.payment_url
            };
        } catch (error) {
            console.error('VNPay create order error:', error);
            throw new Error('Failed to create VNPay order');
        }
    }

    async queryOrder(params: QueryOrderParams, req: any): Promise<VNPayQueryResponse> {
        try {
            const queryData = createQueryData(params, req);
            const response = await axios.post(this.apiUrl, queryData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('VNPay query order error:', error);
            throw new Error('Failed to query VNPay order');
        }
    }

}

export default new VNPayService();
