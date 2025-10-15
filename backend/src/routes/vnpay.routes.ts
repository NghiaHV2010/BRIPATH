import { Router, Request, Response } from 'express';
import {
    validateCreateOrderRequest,
    validateQueryOrderRequest
} from '../middlewares/vnpay.middleware';
import { VNPAY_RESPONSE_CODE } from '../types/vnpay.types';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { verifyReturnSignature, parseAmount, sortObject, generateVNPaySignature } from '../utils/vnpay.utils';
import { VNPAY_HASH_SECRET } from '../config/env.config';
import VNPayService from '../services/vnpay.service';
import { PrismaClient, PaymentGateway, PaymentMethod, PaymentStatus } from '../generated/prisma';
import { hasPaymentByTransactionId, vnpayOrderMapping, getVnpOrderMapping, deleteVnpOrderMapping } from '../utils/payment.utils';

const vnPayRouter = Router();
const prisma = new PrismaClient();

vnPayRouter.post('/create-payment-url', validateCreateOrderRequest, async (req: Request, res: Response) => {
    try {
        const { amount, orderInfo, bankCode, locale, orderType } = req.body;

        const result = await VNPayService.createOrder({
            amount,
            orderInfo,
            bankCode,
            locale,
            orderType
        }, req);

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Create payment URL error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

vnPayRouter.get('/return', async (req: Request, res: Response) => {
    try {
        const vnpParams = req.query;
        const isValidSignature = verifyReturnSignature(vnpParams as Record<string, any>);

        if (!isValidSignature) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        const responseCode = vnpParams.vnp_ResponseCode as string;
        const txnRef = vnpParams.vnp_TxnRef as string;
        const amount = parseAmount(vnpParams.vnp_Amount as string);

        let status = 'failed';
        let message = 'Payment failed';

        if (responseCode === VNPAY_RESPONSE_CODE.SUCCESS) {
            status = 'success';
            message = 'Payment successful';
            try {
                //@ts-ignore
                let userId = (req.user?.id as string | undefined);
                const exists = await hasPaymentByTransactionId(prisma, txnRef);
                if (!exists) {
                    if (!userId) {
                        // Fallback: try mapping from memory or DB
                        let mapping = vnpayOrderMapping.get(txnRef);
                        if (!mapping) {
                            const dbMap = await getVnpOrderMapping(prisma, txnRef);
                            if (dbMap) mapping = dbMap;
                        }
                        userId = mapping?.user_id;
                    }
                    if (userId) {
                        await prisma.payments.create({
                            data: {
                                amount: BigInt(amount),
                                currency: 'VND',
                                payment_gateway: PaymentGateway.Bank,
                                payment_method: PaymentMethod.bank_card,
                                transaction_id: txnRef,
                                status: PaymentStatus.success,
                                user_id: userId
                            }
                        });
                        vnpayOrderMapping.delete(txnRef);
                        await deleteVnpOrderMapping(prisma, txnRef);
                    }
                }
            } catch (err) {
                console.error('Failed to save VNPay payment (return):', err);
            }
        }

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                vnp_TxnRef: txnRef,
                vnp_ResponseCode: responseCode,
                amount: amount,
                status: status,
                message: message
            }
        });
    } catch (error) {
        console.error('VNPay return error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

vnPayRouter.get('/ipn', async (req: Request, res: Response) => {
    let result: any = {};

    try {
        const vnpParams = req.query;
        const secureHash = vnpParams.vnp_SecureHash as string;
        const orderId = vnpParams.vnp_TxnRef as string;
        const responseCode = vnpParams.vnp_ResponseCode as string;

        const paramsCopy = { ...vnpParams };
        delete paramsCopy.vnp_SecureHash;
        delete paramsCopy.vnp_SecureHashType;

        const sortedParams = sortObject(paramsCopy as Record<string, any>);
        const querystring = require('qs');
        const signData = querystring.stringify(sortedParams, { encode: false });
        const signed = generateVNPaySignature(signData, VNPAY_HASH_SECRET);

        if (secureHash !== signed) {
            result.RspCode = VNPAY_RESPONSE_CODE.CHECKSUM_FAILED;
            result.Message = 'Fail checksum';
            return res.status(200).json(result);
        }

        const checkOrderId = true;
        if (!checkOrderId) {
            result.RspCode = VNPAY_RESPONSE_CODE.ORDER_NOT_FOUND;
            result.Message = 'Order not found';
            return res.status(200).json(result);
        }

        const checkAmount = true;
        if (!checkAmount) {
            result.RspCode = VNPAY_RESPONSE_CODE.INVALID_AMOUNT;
            result.Message = 'Amount invalid';
            return res.status(200).json(result);
        }

        const paymentStatus = '0';
        if (paymentStatus !== '0') {
            result.RspCode = VNPAY_RESPONSE_CODE.DUPLICATE_ORDER;
            result.Message = 'This order has been updated to the payment status';
            return res.status(200).json(result);
        }

        if (responseCode === VNPAY_RESPONSE_CODE.SUCCESS) {
            try {
                const amount = parseAmount(vnpParams.vnp_Amount as string);
                const exists = await hasPaymentByTransactionId(prisma, orderId);
                if (!exists) {
                    let mapping = vnpayOrderMapping.get(orderId);
                    if (!mapping) {
                        const dbMap = await getVnpOrderMapping(prisma, orderId);
                        if (dbMap) mapping = dbMap;
                    }
                    await prisma.payments.create({
                    data: {
                        amount: BigInt(amount),
                        currency: 'VND',
                        payment_gateway: PaymentGateway.Bank,
                        payment_method: PaymentMethod.bank_card,
                            transaction_id: orderId,
                            status: PaymentStatus.success,
                            user_id: mapping?.user_id || 'unknown'
                        }
                    });
                    vnpayOrderMapping.delete(orderId);
                    await deleteVnpOrderMapping(prisma, orderId);
                }
            } catch (e) {
                console.error('Failed to save VNPay payment (ipn):', e);
            }
            result.RspCode = VNPAY_RESPONSE_CODE.SUCCESS;
            result.Message = 'Success';
        } else {
            result.RspCode = VNPAY_RESPONSE_CODE.SUCCESS;
            result.Message = 'Success';
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('VNPay IPN error:', error);
        result.RspCode = VNPAY_RESPONSE_CODE.FAILED;
        result.Message = 'Internal error';
        res.status(200).json(result);
    }
});

vnPayRouter.post('/query', validateQueryOrderRequest, async (req: Request, res: Response) => {
    try {
        const { orderId, transDate } = req.body;

        const result = await VNPayService.queryOrder({
            orderId,
            transDate
        }, req);

        if (result.vnp_ResponseCode === VNPAY_RESPONSE_CODE.SUCCESS) {
            res.status(HTTP_SUCCESS.OK).json({
                success: true,
                data: {
                    vnp_TxnRef: result.vnp_TxnRef,
                    vnp_Amount: result.vnp_Amount,
                    vnp_ResponseCode: result.vnp_ResponseCode,
                    vnp_TransactionStatus: result.vnp_TransactionStatus,
                    vnp_BankCode: result.vnp_BankCode,
                    vnp_BankTranNo: result.vnp_BankTranNo,
                    vnp_CardType: result.vnp_CardType,
                    vnp_OrderInfo: result.vnp_OrderInfo,
                    vnp_PayDate: result.vnp_PayDate,
                    vnp_TransactionNo: result.vnp_TransactionNo
                }
            });
        } else {
            res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Query failed',
                response_code: result.vnp_ResponseCode
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

export default vnPayRouter;