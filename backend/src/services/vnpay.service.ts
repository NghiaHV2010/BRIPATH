import axios from 'axios';
import config from '../config/env.config';
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

class VNPayService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = config.VNPAY_API;
    }

    async createOrder(params: CreateOrderParams, req: any): Promise<VNPayCreateOrderResponse> {
        try {
            const orderData = createOrderData(params, req);
            
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
