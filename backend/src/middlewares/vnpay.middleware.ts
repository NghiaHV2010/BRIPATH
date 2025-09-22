import { Request, Response, NextFunction } from 'express';
import { HTTP_ERROR } from '../constants/httpCode';

export const validateCreateOrderRequest = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount, orderInfo, bankCode, locale, orderType } = req.body;

        if (!amount || !orderInfo) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Missing required fields: amount, orderInfo'
            });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }

        if (amount < 1000) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Minimum amount is 1000 VND'
            });
        }

        if (amount > 100000000) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Maximum amount is 100,000,000 VND'
            });
        }

        if (typeof orderInfo !== 'string' || orderInfo.trim().length === 0) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Order info must be a non-empty string'
            });
        }

        next();
    } catch (error) {
        console.error('VNPay create order validation error:', error);
        return res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const validateQueryOrderRequest = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, transDate } = req.body;

        if (!orderId || !transDate) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Missing required fields: orderId, transDate'
            });
        }

        if (typeof orderId !== 'string' || orderId.trim().length === 0) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Order ID must be a non-empty string'
            });
        }

        if (typeof transDate !== 'string' || transDate.trim().length === 0) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Transaction date must be a non-empty string'
            });
        }

        const datePattern = /^\d{8}$/;
        if (!datePattern.test(transDate)) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Transaction date must be in format YYYYMMDD'
            });
        }

        next();
    } catch (error) {
        console.error('VNPay query order validation error:', error);
        return res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

