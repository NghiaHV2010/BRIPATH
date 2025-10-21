import dotenv from "dotenv";

interface Config {
    PORT: number;
    FRONTEND_URL: string;
    SEPAY_API_KEY: string;
    SEPAY_VA_NUMBER: string;
    SEPAY_BANK_CODE: string;
    SEPAY_WEBHOOK_URL: string;
    SEPAY_RETURN_URL: string;
    DATABASE_URL: string;
    ACCESS_SECRET: string;
    REFRESH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    ARCJET_ENV: string;
    ARCJET_KEY: string;
    GMAIL_USER: string;
    GMAIL_APP_PASSWORD: string;
    GEMINI_API_KEY: string;
    OPENAI_API_KEY: string;
    OPENAI_MODEL: string;
    COOKIE_CONFIG_SAME_SITE: "none" | "lax" | "strict";
    COOKIE_CONFIG_SECURE: boolean;
    NODE_ENV: string;
}

dotenv.config();

const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    SEPAY_API_KEY: process.env.SEPAY_API_KEY || '',
    SEPAY_VA_NUMBER: process.env.SEPAY_VA_NUMBER || '69880428888',
    SEPAY_BANK_CODE: process.env.SEPAY_BANK_CODE || 'TPBank',
    SEPAY_WEBHOOK_URL: process.env.SEPAY_WEBHOOK_URL || 'http://localhost:3000/api/sepay/webhook',
    SEPAY_RETURN_URL: process.env.SEPAY_RETURN_URL || 'http://localhost:3000/api/sepay/return',
    DATABASE_URL: process.env.DATABASE_URL!,
    ACCESS_SECRET: process.env.ACCESS_SECRET!,
    REFRESH_SECRET: process.env.REFRESH_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    ARCJET_ENV: process.env.ARCJET_ENV || 'development',
    ARCJET_KEY: process.env.ARCJET_KEY!,
    GMAIL_USER: process.env.GMAIL_USER!,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    OPENAI_MODEL: process.env.OPENAI_MODEL!,
    COOKIE_CONFIG_SAME_SITE: process.env.COOKIE_CONFIG_SAME_SITE as "none" | "lax" | "strict" || 'none',
    COOKIE_CONFIG_SECURE: process.env.COOKIE_CONFIG_SECURE === 'true',
    NODE_ENV: process.env.NODE_ENV || 'development',
};

export const {
    PORT,
    FRONTEND_URL,
    SEPAY_API_KEY,
    SEPAY_VA_NUMBER,
    SEPAY_BANK_CODE,
    SEPAY_WEBHOOK_URL,
    SEPAY_RETURN_URL,
    DATABASE_URL,
    ACCESS_SECRET,
    REFRESH_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    ARCJET_ENV,
    ARCJET_KEY,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    GEMINI_API_KEY,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    COOKIE_CONFIG_SAME_SITE,
    COOKIE_CONFIG_SECURE,
    NODE_ENV
} = config;

