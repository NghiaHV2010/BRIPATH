import axios from 'axios';
import config from '../config/env.config';
import {
    ZaloPayCreateOrderResponse,
    ZaloPayQueryOrderResponse,
    CreateOrderParams
} from '../types/zalopay.types';
import {
    createOrderData,
    getZaloPayEndpoint,
    createMac,
    getCurrentTimestamp,
    parseAmount,
    generateZaloPaySignature
} from '../utils/zalopay.utils';

class ZaloPayService {
    private endpoint: string;

    constructor() {
        this.endpoint = getZaloPayEndpoint();
    }
    async createOrder(params: CreateOrderParams): Promise<ZaloPayCreateOrderResponse> {
        try {
            const orderData = createOrderData(params);
            
            const response = await axios.post(`${this.endpoint}/create`, null, {
                params: orderData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            return {
                ...response.data,
                app_trans_id: orderData.app_trans_id
            };
        } catch (error) {
            console.error('ZaloPay create order error:', error);
            throw new Error('Failed to create ZaloPay order');
        }
    }

    async queryOrder(app_trans_id: string): Promise<ZaloPayQueryOrderResponse> {
        try {
            const postData: any = {
                app_id: config.ZALOPAY_APP_ID,
                app_trans_id
            };

            // Query order MAC format: appid|app_trans_id|key1
            const macData = `${postData.app_id}|${postData.app_trans_id}|${config.ZALOPAY_KEY1}`;
            postData.mac = generateZaloPaySignature(macData, config.ZALOPAY_KEY1);

            const response = await axios.post(`${this.endpoint}/query`, postData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error) {
            console.error('ZaloPay query order error:', error);
            throw new Error('Failed to query ZaloPay order');
        }
    }




}

export default new ZaloPayService();
