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
import { PrismaClient, PaymentGateway, PaymentMethod, PaymentStatus } from '../generated/prisma';
import { hasPaymentByTransactionId, saveZaloOrderMapping, getZaloOrderMapping, deleteZaloOrderMapping } from '../utils/payment.utils';

const zaloPayRouter = Router();
const prisma = new PrismaClient();

zaloPayRouter.post('/create-order', validateCreateOrderRequest, async (req: Request, res: Response) => {
    try {
        const { app_user, amount, description, item, bank_code, embed_data } = req.body as { app_user: string; amount: number; description: string; item: string; bank_code?: string; embed_data?: string };

        const result = await ZaloPayService.createOrder({
            app_user,
            amount,
            description,
            item,
            bank_code,
            embed_data
        });
        // Save mapping app_trans_id -> user_id for later callback/query usage
        try {
            //@ts-ignore
            const authUserId = (req.user?.id as string | undefined) || String(app_user);
            await saveZaloOrderMapping(prisma, result.app_trans_id as string, authUserId, Number(amount));
        } catch (mapErr) {
            console.error('Save ZaloPay order mapping error:', mapErr);
        }

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

        // Fallback: if transaction succeeded and callback didn't persist, save here
        try {
            const isSuccess = result?.return_code === 1 && result?.sub_return_code === 1;
            if (isSuccess) {
                const transId = app_trans_id || result?.zp_trans_id?.toString();
                const exists = await hasPaymentByTransactionId(prisma, transId);
                if (!exists) {
                    const amount = Number(result?.amount) || 0;
                    let appUser: string | undefined;
                    const map = await getZaloOrderMapping(prisma, app_trans_id);
                    if (map) appUser = map.user_id;
                    await prisma.payments.create({
                        data: {
                            amount: BigInt(amount),
                            currency: 'VND',
                            payment_gateway: PaymentGateway.ZaloPay,
                            payment_method: PaymentMethod.e_wallet,
                            transaction_id: transId,
                            status: PaymentStatus.success,
                            user_id: appUser || 'unknown'
                        }
                    });
                    await deleteZaloOrderMapping(prisma, app_trans_id);
                }
            }
        } catch (persistErr) {
            console.error('ZaloPay query-order persist fallback error:', persistErr);
        }

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
            // Save successful payment to DB when ZaloPay callback is valid
            try {
                const amount = dataJson.amount as number;
                let appUser = dataJson.app_user as string | undefined;
                const transId = dataJson.app_trans_id || dataJson.zp_trans_id?.toString();
                if (!appUser && dataJson.app_trans_id) {
                    const map = await getZaloOrderMapping(prisma, dataJson.app_trans_id);
                    if (map) appUser = map.user_id;
                }
                const exists = await hasPaymentByTransactionId(prisma, transId);
                if (!exists) {
                    await prisma.payments.create({
                        data: {
                            amount: BigInt(amount),
                            currency: 'VND',
                            payment_gateway: PaymentGateway.ZaloPay,
                            payment_method: PaymentMethod.e_wallet,
                            transaction_id: transId,
                            status: PaymentStatus.success,
                            user_id: appUser || 'unknown'
                        }
                    });
                    if (dataJson.app_trans_id) {
                        await deleteZaloOrderMapping(prisma, dataJson.app_trans_id);
                    }
                }
            } catch (err) {
                console.error('Failed to save ZaloPay payment (callback):', err);
            }
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