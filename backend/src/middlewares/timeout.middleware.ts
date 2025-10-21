import { Request, Response, NextFunction } from 'express';
import { REQUEST_TIMEOUT_MS } from '../config/env.config';

/**
 * Request timeout middleware
 * Applies configurable timeout to both request and response
 */
export const timeoutMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Set request timeout
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
        if (!res.headersSent) {
            res.status(408).json({
                success: false,
                message: 'Yêu cầu hết thời gian chờ - Máy chủ mất quá nhiều thời gian để phản hồi',
                error: 'REQUEST_TIMEOUT',
                timeout: REQUEST_TIMEOUT_MS
            });
        }
    });

    // Set response timeout
    res.setTimeout(REQUEST_TIMEOUT_MS, () => {
        if (!res.headersSent) {
            res.status(408).json({
                success: false,
                message: 'Phản hồi hết thời gian chờ - Máy chủ mất quá nhiều thời gian để phản hồi',
                error: 'RESPONSE_TIMEOUT',
                timeout: REQUEST_TIMEOUT_MS
            });
        }
    });

    next();
};

/**
 * Custom timeout middleware with specific timeout duration
 * @param timeout - Timeout duration in milliseconds
 */
export const customTimeoutMiddleware = (timeout: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.setTimeout(timeout, () => {
            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    message: `Yêu cầu hết thời gian chờ sau ${timeout}ms`,
                    error: 'CUSTOM_TIMEOUT',
                    timeout: timeout
                });
            }
        });

        res.setTimeout(timeout, () => {
            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    message: `Phản hồi hết thời gian chờ sau ${timeout}ms`,
                    error: 'CUSTOM_RESPONSE_TIMEOUT',
                    timeout: timeout
                });
            }
        });

        next();
    };
};