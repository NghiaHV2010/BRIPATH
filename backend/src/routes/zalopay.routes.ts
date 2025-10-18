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
        const { app_user, amount, description, item, bank_code, embed_data, plan_id, company_id } = req.body as { app_user: string; amount: number; description: string; item: string; bank_code?: string; embed_data?: string; plan_id?: number; company_id?: string };

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
            await saveZaloOrderMapping(prisma, result.app_trans_id as string, authUserId, Number(amount), Number(plan_id || 0), company_id);
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
                    await prisma.$transaction(async (tx) => {
                        const payment = await tx.payments.create({
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

                        await tx.userNotifications.create({
                            data: {
                                user_id: appUser || 'unknown',
                                title: 'Thanh toán thành công',
                                content: `Bạn đã thanh toán đơn hàng ${transId} thành công với số tiền ${(amount / 100).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
                                type: 'pricing_plan'
                            }
                        });

                        const plan = await tx.membershipPlans.findFirst({
                            where: { id: map?.plan_id! } // Default plan, adjust as needed
                        });

                        await tx.userActivitiesHistory.create({
                            data: {
                                user_id: appUser || 'unknown',
                                activity_name: `Thanh toán gói ${plan?.plan_name} thành công`,
                            }
                        });


                        if (plan) {
                            await tx.subscriptions.create({
                                data: {
                                    user_id: appUser || 'unknown',
                                    amount_paid: BigInt(amount),
                                    payment_id: payment.id,
                                    plan_id: plan.id,
                                    start_date: new Date(),
                                    end_date: new Date(new Date().setMonth(new Date().getMonth() + plan.duration_months)), // 1 month duration
                                    status: 'on_going',
                                    remaining_urgent_jobs: plan.urgent_jobs_limit!,
                                    remaining_quality_jobs: plan.quality_jobs_limit!,
                                    remaining_total_jobs: plan.total_jobs_limit!
                                }
                            });
                        }

                        if (map?.company_id) {
                            const tag = await tx.tags.findFirst({
                                where: { label_name: "Đề xuất" }
                            })

                            if (tag) {
                                await tx.companies.update({
                                    where: { id: map.company_id! },
                                    data: {
                                        is_verified: true,
                                        companyTags: {
                                            connectOrCreate: {
                                                where: {
                                                    company_id_tag_id: {
                                                        company_id: map.company_id!,
                                                        tag_id: tag.id
                                                    }
                                                },
                                                create: {
                                                    tag_id: tag.id
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                    await deleteZaloOrderMapping(prisma, app_trans_id);
                } else {
                    // Already persisted earlier; cleanup mapping just in case
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
                let map: { user_id: string; amount: number; plan_id: number; company_id?: string } | null = null;
                if (!appUser && dataJson.app_trans_id) {
                    map = await getZaloOrderMapping(prisma, dataJson.app_trans_id);
                    if (map) appUser = map.user_id;
                }
                const exists = await hasPaymentByTransactionId(prisma, transId);
                if (!exists) {
                    await prisma.$transaction(async (tx) => {
                        const payment = await tx.payments.create({
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

                        await tx.userNotifications.create({
                            data: {
                                user_id: appUser || 'unknown',
                                title: 'Thanh toán thành công',
                                content: `Bạn đã thanh toán đơn hàng ${transId} thành công với số tiền ${(amount / 100).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
                                type: 'pricing_plan'
                            }
                        });

                        console.log(map);

                        const plan = await tx.membershipPlans.findFirst({
                            where: { id: map?.plan_id }
                        });

                        await tx.userActivitiesHistory.create({
                            data: {
                                user_id: appUser || 'unknown',
                                activity_name: `Thanh toán gói ${plan?.plan_name} thành công`,
                            }
                        });


                        if (plan) {
                            await tx.subscriptions.create({
                                data: {
                                    user_id: appUser || 'unknown',
                                    amount_paid: BigInt(amount),
                                    payment_id: payment.id,
                                    plan_id: plan.id,
                                    start_date: new Date(),
                                    end_date: new Date(new Date().setMonth(new Date().getMonth() + plan.duration_months)), // 1 month duration
                                    status: 'on_going',
                                    remaining_urgent_jobs: plan.urgent_jobs_limit!,
                                    remaining_quality_jobs: plan.quality_jobs_limit!,
                                    remaining_total_jobs: plan.total_jobs_limit!
                                }
                            });
                        }

                        if (map?.company_id) {
                            const tag = await tx.tags.findFirst({
                                where: { label_name: "Đề xuất" }
                            })

                            if (tag) {
                                await tx.companies.update({
                                    where: { id: map.company_id! },
                                    data: {
                                        is_verified: true,
                                        companyTags: {
                                            connectOrCreate: {
                                                where: {
                                                    company_id_tag_id: {
                                                        company_id: map.company_id!,
                                                        tag_id: tag.id
                                                    }
                                                },
                                                create: {
                                                    tag_id: tag.id
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                    if (dataJson.app_trans_id) {
                        await deleteZaloOrderMapping(prisma, dataJson.app_trans_id);
                    }
                } else {
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