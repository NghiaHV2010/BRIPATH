import { Router, Request, Response } from 'express';
import {
    validateCreateOrderRequest,
    validateQueryOrderRequest
} from '../middlewares/zalopay.middleware';
import { ZALOPAY_ORDER_STATUS } from '../types/zalopay.types';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { generateZaloPaySignature } from '../utils/zalopay.utils';
import { ZALOPAY_KEY2 } from '../config/env.config';
import ZaloPayService from '../services/zalopay.service';

const zaloPayRouter = Router();

zaloPayRouter.post('/create-order', validateCreateOrderRequest, async (req: Request, res: Response) => {
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

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Create ZaloPay order error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

zaloPayRouter.get('/query-order/:app_trans_id', validateQueryOrderRequest, async (req: Request, res: Response) => {
    try {
        const { app_trans_id } = req.params;

        const result = await ZaloPayService.queryOrder(app_trans_id);

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Query ZaloPay order error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

zaloPayRouter.post('/callback', async (req: Request, res: Response) => {
    let result: any = {};

    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;

        if (!dataStr || !reqMac) {
            result.return_code = -1;
            result.return_message = "Missing data or mac";
            return res.json(result);
        }

        const mac = generateZaloPaySignature(dataStr, ZALOPAY_KEY2);

        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            let dataJson = JSON.parse(dataStr);
            // Process the callback data here
            result.return_code = 1;
            result.return_message = "success";
        }

        res.json(result);
    } catch (error) {
        console.error('ZaloPay callback error:', error);
        result.return_code = -1;
        result.return_message = "Internal error";
        res.json(result);
    }
});

export default zaloPayRouter;