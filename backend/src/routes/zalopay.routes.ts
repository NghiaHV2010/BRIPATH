import { Router, Request, Response } from 'express';
import ZaloPayService from '../services/zalopay.service';
import {
    validateCreateOrderRequest,
    validateQueryOrderRequest
} from '../middlewares/zalopay.middleware';
import { ZALOPAY_ORDER_STATUS } from '../types/zalopay.types';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { generateZaloPaySignature } from '../utils/zalopay.utils';
import config from '../config/env.config';

const router = Router();

router.post('/create-order', validateCreateOrderRequest, async (req: Request, res: Response) => {
    try {
        const { app_user, amount, description, item, bank_code, embed_data } = req.body;

        const result = await ZaloPayService.createOrder({
            app_user,
            amount,
            description,
            item,
            bank_code,
            embed_data
        });

        if (result.return_code === 1) {
            res.status(HTTP_SUCCESS.OK).json({
                success: true,
                data: {
                    order_url: result.order_url,
                    zp_trans_token: result.zp_trans_token,
                    app_trans_id: result.app_trans_id
                }
            });
        } else {
            res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: result.return_message,
                sub_message: result.sub_return_message
            });
        }
    } catch (error) {
        console.error('Create order error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

router.get('/query-order/:app_trans_id', validateQueryOrderRequest, async (req: Request, res: Response) => {
    try {
        const { app_trans_id } = req.params;

        const result = await ZaloPayService.queryOrder(app_trans_id);

        if (result.return_code === 1) {
            const statusText = getOrderStatusText(result.status || 0);
            
            res.status(HTTP_SUCCESS.OK).json({
                success: true,
                data: {
                    app_trans_id: app_trans_id,
                    zp_trans_id: result.zp_trans_id,
                    amount: result.amount,
                    status: result.status,
                    status_text: statusText,
                    is_processing: result.is_processing
                }
            });
        } else {
            res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: result.return_message,
                sub_message: result.sub_return_message
            });
        }
    } catch (error) {
        console.error('Query order error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


router.post('/callback', async (req: Request, res: Response) => {
    let result: any = {};

    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;

        if (!dataStr || !reqMac) {
            result.return_code = -1;
            result.return_message = "Missing data or mac";
            return res.json(result);
        }

        const mac = generateZaloPaySignature(dataStr, config.ZALOPAY_KEY2);

        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            let dataJson = JSON.parse(dataStr);


            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex: any) {
        console.error('Callback error:', ex);
        result.return_code = 0; // ZaloPay will retry (max 3 times)
        result.return_message = ex.message;
    }

    res.json(result);
});



function getOrderStatusText(status: number): string {
    switch (status) {
        case ZALOPAY_ORDER_STATUS.PENDING:
            return 'PENDING';
        case ZALOPAY_ORDER_STATUS.PAID:
            return 'PAID';
        case ZALOPAY_ORDER_STATUS.FAILED:
            return 'FAILED';
        case ZALOPAY_ORDER_STATUS.CANCELLED:
            return 'CANCELLED';
        default:
            return 'UNKNOWN';
    }
}

export default router;