import rateLimit from 'express-rate-limit';
import {
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_AUTH_MAX,
    RATE_LIMIT_API_MAX
} from '../config/env.config';
import { Request, Response } from "express";

/**
 * General rate limiting for all requests
 * Default: 1000 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.',
        retryAfter: `${RATE_LIMIT_WINDOW_MS / 60000} phút`,
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    handler: (req: Request, res: Response) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.',
            retryAfter: `${RATE_LIMIT_WINDOW_MS / 60000} phút`,
            error: 'RATE_LIMIT_EXCEEDED',
            limit: RATE_LIMIT_MAX_REQUESTS,
            window: `${RATE_LIMIT_WINDOW_MS / 60000} phút`
        });
    }
});

/**
 * Strict rate limiting for authentication endpoints
 * Default: 20 requests per 15 minutes
 */
export const authLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_AUTH_MAX,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu xác thực, vui lòng thử lại sau.',
        retryAfter: `${RATE_LIMIT_WINDOW_MS / 60000} phút`,
        error: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        console.warn(`Auth rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Quá nhiều yêu cầu xác thực, vui lòng thử lại sau. Điều này giúp bảo vệ tài khoản của bạn.',
            retryAfter: `${RATE_LIMIT_WINDOW_MS / 60000} phút`,
            error: 'AUTH_RATE_LIMIT_EXCEEDED',
            limit: RATE_LIMIT_AUTH_MAX,
            window: `${RATE_LIMIT_WINDOW_MS / 60000} phút`
        });
    }
});

/**
 * Moderate rate limiting for API-heavy endpoints
 * Default: 100 requests per minute
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: RATE_LIMIT_API_MAX,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu API, vui lòng giảm tốc độ gửi yêu cầu.',
        retryAfter: '1 phút',
        error: 'API_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        console.warn(`API rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Quá nhiều yêu cầu API, vui lòng giảm tốc độ gửi yêu cầu.',
            retryAfter: '1 phút',
            error: 'API_RATE_LIMIT_EXCEEDED',
            limit: RATE_LIMIT_API_MAX,
            window: '1 phút'
        });
    }
});

/**
 * Very strict rate limiting for sensitive operations
 * Default: 5 requests per 15 minutes
 */
export const strictLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 5,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu nhạy cảm, vui lòng thử lại sau.',
        retryAfter: `${RATE_LIMIT_WINDOW_MS / 60000} phút`,
        error: 'STRICT_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        console.warn(`Strict rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Quá nhiều yêu cầu nhạy cảm từ IP này. Vui lòng thử lại sau.',
            retryAfter: `${RATE_LIMIT_WINDOW_MS / 60000} phút`,
            error: 'STRICT_RATE_LIMIT_EXCEEDED',
            limit: 5,
            window: `${RATE_LIMIT_WINDOW_MS / 60000} phút`
        });
    }
});

/**
 * Custom rate limiter factory
 * @param options - Rate limit options
 */
export const createRateLimiter = (options: {
    windowMs?: number;
    max?: number;
    message?: string;
    errorCode?: string;
}) => {
    const {
        windowMs = RATE_LIMIT_WINDOW_MS,
        max = RATE_LIMIT_MAX_REQUESTS,
        message = 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
        errorCode = 'CUSTOM_RATE_LIMIT_EXCEEDED'
    } = options;

    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message,
            retryAfter: `${windowMs / 60000} phút`,
            error: errorCode
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: Request, res: Response) => {
            console.warn(`Custom rate limit (${errorCode}) exceeded for IP: ${req.ip} on ${req.method} ${req.path}`);
            res.status(429).json({
                success: false,
                message,
                retryAfter: `${windowMs / 60000} phút`,
                error: errorCode,
                limit: max,
                window: `${windowMs / 60000} phút`
            });
        }
    });
};