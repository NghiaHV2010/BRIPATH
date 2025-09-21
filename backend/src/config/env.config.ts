import dotenv from "dotenv";

interface Config {
    PORT: number;
    FRONTEND_URL: string;
    ZALOPAY_APP_ID: string;
    ZALOPAY_KEY1: string;
    ZALOPAY_KEY2: string;
    ZALOPAY_ENDPOINT: string;
    ZALOPAY_CALLBACK_URL: string;
}

dotenv.config();

const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    ZALOPAY_APP_ID: process.env.ZALOPAY_APP_ID || '',
    ZALOPAY_KEY1: process.env.ZALOPAY_KEY1 || '',
    ZALOPAY_KEY2: process.env.ZALOPAY_KEY2 || '',
    ZALOPAY_ENDPOINT: process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2',
    ZALOPAY_CALLBACK_URL: process.env.ZALOPAY_CALLBACK_URL || 'http://localhost:3000/api/zalopay/callback'
};

export default config;

