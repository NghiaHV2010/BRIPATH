import { Request, Response, NextFunction } from 'express';
import { HTTP_ERROR } from '../constants/httpCode';

export const validateCreateOrderRequest = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { app_user, amount, description, item } = req.body;

        if (!app_user || !amount || !description || !item) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Missing required fields: app_user, amount, description, item'
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

        if (amount > 10000000) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Maximum amount is 10,000,000 VND'
            });
        }

        next();
    } catch (error) {
        console.error('ZaloPay create order validation error:', error);
        return res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const validateQueryOrderRequest = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { app_trans_id } = req.params;

        if (!app_trans_id) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'app_trans_id is required'
            });
        }

        const appTransIdPattern = /^\d{6}_\d{6}$/;
        if (!appTransIdPattern.test(app_trans_id)) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Invalid app_trans_id format'
            });
        }

        next();
    } catch (error) {
        console.error('ZaloPay query order validation error:', error);
        return res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

