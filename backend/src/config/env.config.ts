import dotenv from "dotenv";

interface Config {
    PORT: number;
    FRONTEND_URL: string;
    ZALOPAY_APP_ID: string;
    ZALOPAY_KEY1: string;
    ZALOPAY_KEY2: string;
    ZALOPAY_ENDPOINT: string;
    ZALOPAY_CALLBACK_URL: string;
    VNPAY_TMN_CODE: string;
    VNPAY_HASH_SECRET: string;
    VNPAY_URL: string;
    VNPAY_API: string;
    VNPAY_RETURN_URL: string;
    DATABASE_URL: string;
    ACCESS_SECRET: string;
    REFRESH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
}

dotenv.config();

const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    ZALOPAY_APP_ID: process.env.ZALOPAY_APP_ID || '',
    ZALOPAY_KEY1: process.env.ZALOPAY_KEY1 || '',
    ZALOPAY_KEY2: process.env.ZALOPAY_KEY2 || '',
    ZALOPAY_ENDPOINT: process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2',
    ZALOPAY_CALLBACK_URL: process.env.ZALOPAY_CALLBACK_URL || 'http://localhost:3000/api/zalopay/callback',
    VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE || '',
    VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET || '',
    VNPAY_URL: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    VNPAY_API: process.env.VNPAY_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction', 
    VNPAY_RETURN_URL: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/vnpay/return',
    DATABASE_URL: process.env.DATABASE_URL!,
    ACCESS_SECRET: process.env.ACCESS_SECRET!,
    REFRESH_SECRET: process.env.REFRESH_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!
};

export default config;

