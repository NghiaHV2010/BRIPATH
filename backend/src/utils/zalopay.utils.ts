import crypto from 'crypto';
import { ZALOPAY_APP_ID, ZALOPAY_CALLBACK_URL, ZALOPAY_ENDPOINT, ZALOPAY_KEY1 } from '../config/env.config';
export const generateZaloPaySignature = (data: string, key: string): string => {
    return crypto
        .createHmac('sha256', key)
        .update(data)
        .digest('hex');
};

export const getCurrentTimestamp = (): number => {
    return Date.now(); // milliseconds like in the reference code
};

export const generateAppTransId = (): string => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    return `${yy}${mm}${dd}_${randomNum}`;
};

export const createMac = (data: Record<string, any>, key: string): string => {
    // ZaloPay uses specific format: appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const macData = `${data.app_id}|${data.app_trans_id}|${data.app_user}|${data.amount}|${data.app_time}|${data.embed_data || ''}|${data.item}`;

    return generateZaloPaySignature(macData, key);
};


export const formatAmount = (amount: number): number => {
    return Math.round(amount * 100);
};

export const parseAmount = (amount: number): number => {
    return amount / 100;
};


export const getZaloPayEndpoint = (): string => {
    return ZALOPAY_ENDPOINT;
};

export const createOrderData = (params: {
    app_user: string;
    amount: number;
    description: string;
    item: string;
    bank_code?: string;
    embed_data?: string;
}): Record<string, any> => {
    try {
        const transID = Math.floor(Math.random() * 1000000);
        const app_trans_id = generateAppTransId();
        const app_time = getCurrentTimestamp();

        const embed_data = params.embed_data || '{}';
        const items = [{}];

        const order: any = {
            app_id: ZALOPAY_APP_ID,
            app_trans_id,
            app_user: params.app_user,
            app_time,
            item: JSON.stringify(items),
            embed_data: embed_data,
            amount: params.amount,
            description: params.description,
            bank_code: params.bank_code || 'zalopayapp',
            callback_url: ZALOPAY_CALLBACK_URL
        };

        // Create MAC using format: appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const macData = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = generateZaloPaySignature(macData, ZALOPAY_KEY1);

        return order;
    } catch (error) {
        console.error('Error in createOrderData:', error);
        throw error;
    }
};
