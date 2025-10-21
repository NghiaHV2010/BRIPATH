import dotenv from "dotenv";

interface Config {
    PORT: number;
    FRONTEND_URL: string;
    FRONTEND_URLS: string[]; // Array of allowed origins
    DATABASE_URL: string;
    ACCESS_SECRET: string;
    REFRESH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GMAIL_USER: string;
    GMAIL_APP_PASSWORD: string;
    GEMINI_API_KEY: string;
    OPENAI_API_KEY: string;
    OPENAI_MODEL: string;
    COOKIE_CONFIG_SAME_SITE: "none" | "lax" | "strict";
    COOKIE_CONFIG_SECURE: boolean;
    NODE_ENV: string;
    RESEND_API_KEY: string;
    SEPAY_API_KEY: string;
    SEPAY_WEBHOOK_URL: string;
    SEPAY_RETURN_URL: string;
    SEPAY_VA_NUMBER: string;
    SEPAY_BANK_CODE: string;
    // Rate limiting configuration
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    RATE_LIMIT_AUTH_MAX: number;
    RATE_LIMIT_API_MAX: number;
    REQUEST_TIMEOUT_MS: number;
}

dotenv.config();

const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    FRONTEND_URLS: process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
        : ['http://localhost:5173'],
    DATABASE_URL: process.env.DATABASE_URL!,
    ACCESS_SECRET: process.env.ACCESS_SECRET!,
    REFRESH_SECRET: process.env.REFRESH_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    GMAIL_USER: process.env.GMAIL_USER!,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    OPENAI_MODEL: process.env.OPENAI_MODEL!,
    COOKIE_CONFIG_SAME_SITE: process.env.COOKIE_CONFIG_SAME_SITE as "none" | "lax" | "strict" || 'none',
    COOKIE_CONFIG_SECURE: process.env.COOKIE_CONFIG_SECURE === 'true',
    NODE_ENV: process.env.NODE_ENV || 'development',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    SEPAY_API_KEY: process.env.SEPAY_API_KEY!,
    SEPAY_WEBHOOK_URL: process.env.SEPAY_WEBHOOK_URL!,
    SEPAY_RETURN_URL: process.env.SEPAY_RETURN_URL!,
    SEPAY_VA_NUMBER: process.env.SEPAY_VA_NUMBER!,
    SEPAY_BANK_CODE: process.env.SEPAY_BANK_CODE!,
    // Rate limiting configuration with defaults
    RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // 1000 requests per window
    RATE_LIMIT_AUTH_MAX: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20, // 20 auth attempts per window
    RATE_LIMIT_API_MAX: Number(process.env.RATE_LIMIT_API_MAX) || 100, // 100 API requests per minute
    REQUEST_TIMEOUT_MS: Number(process.env.REQUEST_TIMEOUT_MS) || 30000, // 30 seconds
};

export const {
    PORT,
    FRONTEND_URL,
    FRONTEND_URLS,
    DATABASE_URL,
    ACCESS_SECRET,
    REFRESH_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    GEMINI_API_KEY,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    COOKIE_CONFIG_SAME_SITE,
    COOKIE_CONFIG_SECURE,
    NODE_ENV,
    RESEND_API_KEY,
    SEPAY_API_KEY,
    SEPAY_WEBHOOK_URL,
    SEPAY_RETURN_URL,
    SEPAY_VA_NUMBER,
    SEPAY_BANK_CODE,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_AUTH_MAX,
    RATE_LIMIT_API_MAX,
    REQUEST_TIMEOUT_MS,
} = config;

