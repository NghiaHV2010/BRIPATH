import crypto from 'crypto';
import config from '../config/env.config';

export const generateVNPaySignature = (data: string, secretKey: string): string => {
    return crypto
        .createHmac('sha512', secretKey)
        .update(Buffer.from(data, 'utf-8'))
        .digest('hex');
};

export const getCurrentTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

export const generateOrderId = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${hours}${minutes}${seconds}`;
};

export const sortObject = (obj: Record<string, any>): Record<string, any> => {
    const sorted: Record<string, any> = {};
    const str: string[] = [];
    
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    
    str.sort();
    
    for (let i = 0; i < str.length; i++) {
        sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+');
    }
    
    return sorted;
};

export const createPaymentUrl = (params: Record<string, any>): string => {
    const sortedParams = sortObject(params);
    const querystring = require('qs');
    return config.VNPAY_URL + '?' + querystring.stringify(sortedParams, { encode: false });
};

export const formatAmount = (amount: number): number => {
    return Math.round(amount * 100);
};

export const parseAmount = (amount: string): number => {
    return parseInt(amount) / 100;
};

export const getClientIP = (req: any): string => {
    return req.headers['x-forwarded-for'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.connection.socket.remoteAddress ||
           '127.0.0.1';
};

export const createOrderData = (params: {
    amount: number;
    orderInfo: string;
    bankCode?: string;
    locale?: string;
    orderType?: string;
}, req: any): Record<string, any> => {
    const orderId = generateOrderId();
    const createDate = getCurrentTimestamp();
    const ipAddr = getClientIP(req);
    
    const vnpParams: Record<string, any> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.VNPAY_TMN_CODE,
        vnp_Locale: params.locale || 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: params.orderInfo || `Thanh toan cho ma GD: ${orderId}`,
        vnp_OrderType: params.orderType || 'other',
        vnp_Amount: formatAmount(params.amount),
        vnp_ReturnUrl: config.VNPAY_RETURN_URL,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };
    
    if (params.bankCode && params.bankCode !== '') {
        vnpParams.vnp_BankCode = params.bankCode;
    }
    
    const sortedParams = sortObject(vnpParams);
    const querystring = require('qs');
    const signData = querystring.stringify(sortedParams, { encode: false });
    const secureHash = generateVNPaySignature(signData, config.VNPAY_HASH_SECRET);
    
    vnpParams.vnp_SecureHash = secureHash;
    
    return {
        ...vnpParams,
        payment_url: createPaymentUrl(vnpParams)
    };
};

export const createQueryData = (params: {
    orderId: string;
    transDate: string;
}, req: any): Record<string, any> => {
    const now = new Date();
    // Tạo requestId unique với milliseconds để tránh trùng lặp
    const requestId = now.getHours().toString().padStart(2, '0') + 
                     now.getMinutes().toString().padStart(2, '0') + 
                     now.getSeconds().toString().padStart(2, '0') +
                     now.getMilliseconds().toString().padStart(3, '0');
    const createDate = getCurrentTimestamp();
    const ipAddr = getClientIP(req);
    
    const orderInfo = `Truy van GD ma ${params.orderId}`;
    const data = `${requestId}|2.1.0|querydr|${config.VNPAY_TMN_CODE}|${params.orderId}|${params.transDate}|${createDate}|${ipAddr}|${orderInfo}`;
    const secureHash = generateVNPaySignature(data, config.VNPAY_HASH_SECRET);
    
    
    return {
        vnp_RequestId: requestId,
        vnp_Version: '2.1.0',
        vnp_Command: 'querydr',
        vnp_TmnCode: config.VNPAY_TMN_CODE,
        vnp_TxnRef: params.orderId,
        vnp_OrderInfo: orderInfo,
        vnp_TransactionDate: params.transDate,
        vnp_CreateDate: createDate,
        vnp_IpAddr: ipAddr,
        vnp_SecureHash: secureHash
    };
};


export const verifyReturnSignature = (params: Record<string, any>): boolean => {
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    
    const sortedParams = sortObject(params);
    const querystring = require('qs');
    const signData = querystring.stringify(sortedParams, { encode: false });
    const signed = generateVNPaySignature(signData, config.VNPAY_HASH_SECRET);
    
    return secureHash === signed;
};

export const verifyIPNSignature = (params: Record<string, any>): boolean => {
    return verifyReturnSignature(params);
};

