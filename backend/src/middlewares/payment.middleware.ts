import { Request, Response, NextFunction } from 'express';
import { HTTP_ERROR } from '../constants/httpCode';
import { PaymentGateway, PaymentMethod, PaymentStatus } from '../generated/prisma';

export const validateCreatePaymentRequest = (req: Request, res: Response, next: NextFunction) => {
    const { amount, payment_gateway, payment_method, status, user_id } = req.body;

    if (!amount || !payment_gateway || !payment_method || !status || !user_id) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: 'Missing required fields: amount, payment_gateway, payment_method, status, user_id'
        });
    }

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: 'Amount must be a positive number'
        });
    }

    if (!Object.values(PaymentGateway).includes(payment_gateway)) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: `Invalid payment gateway. Must be one of: ${Object.values(PaymentGateway).join(', ')}`
        });
    }

    if (!Object.values(PaymentMethod).includes(payment_method)) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: `Invalid payment method. Must be one of: ${Object.values(PaymentMethod).join(', ')}`
        });
    }

    if (!Object.values(PaymentStatus).includes(status)) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: `Invalid status. Must be one of: ${Object.values(PaymentStatus).join(', ')}`
        });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user_id)) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: 'Invalid user_id format'
        });
    }

    next();
};

export const validateUpdatePaymentRequest = (req: Request, res: Response, next: NextFunction) => {
    const { amount, payment_gateway, payment_method, status } = req.body;

    if (amount !== undefined) {
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }
    }

    if (payment_gateway !== undefined && !Object.values(PaymentGateway).includes(payment_gateway)) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: `Invalid payment gateway. Must be one of: ${Object.values(PaymentGateway).join(', ')}`
        });
    }

    if (payment_method !== undefined && !Object.values(PaymentMethod).includes(payment_method)) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: `Invalid payment method. Must be one of: ${Object.values(PaymentMethod).join(', ')}`
        });
    }

    if (status !== undefined && !Object.values(PaymentStatus).includes(status)) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: `Invalid status. Must be one of: ${Object.values(PaymentStatus).join(', ')}`
        });
    }

    next();
};
