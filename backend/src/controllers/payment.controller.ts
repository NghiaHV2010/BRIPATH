import { Request, Response } from 'express';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { CreatePaymentRequest, UpdatePaymentRequest, PaymentQueryParams } from '../types/payment.types';
import { createNotificationData } from '../utils';
import { prisma } from '../libs/prisma';

export const createPayment = async (req: Request, res: Response) => {
    //@ts-ignore
    const { id: user_id } = req.user;
    const { amount, currency, payment_gateway, payment_method, transaction_id, status, plan_id }: CreatePaymentRequest = req.body;

    try {
        if (!amount || !payment_gateway || !payment_method || !status) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Thông tin thanh toán không hợp lệ'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const payment = await tx.payments.create({
                data: {
                    amount: BigInt(amount),
                    currency: currency || 'VND',
                    payment_gateway,
                    payment_method,
                    transaction_id,
                    status,
                    user_id
                }
            });

            // Create activity history
            await tx.userActivitiesHistory.create({
                data: {
                    user_id,
                    activity_name: `Bạn đã thanh toán ${amount} ${currency || 'VND'} thành công qua ${payment_gateway}. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
                }
            });

            // Create notification
            await tx.userNotifications.create({
                data: {
                    title: 'Thanh toán thành công!',
                    content: `Bạn đã thanh toán đơn hàng ${transaction_id} thành công với số tiền ${amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
                    type: 'pricing_plan',
                    user_id: user_id
                }
            });

            // Create subscription if plan_id is provided and payment is successful
            if (plan_id && status === 'success') {
                const plan = await tx.membershipPlans.findUnique({
                    where: { id: plan_id }
                });

                if (plan) {
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + plan.duration_months);

                    await tx.subscriptions.create({
                        data: {
                            user_id: user_id,
                            amount_paid: BigInt(amount),
                            payment_id: payment.id,
                            plan_id: plan.id,
                            start_date: startDate,
                            end_date: endDate,
                            status: 'on_going',
                            remaining_urgent_jobs: plan.urgent_jobs_limit || 0,
                            remaining_quality_jobs: plan.quality_jobs_limit || 0,
                            remaining_total_jobs: plan.total_jobs_limit || 0
                        }
                    });

                    // // Create additional activity history for subscription
                    // await tx.userActivitiesHistory.create({
                    //     data: {
                    //         user_id,
                    //         activity_name: `Gói ${plan.plan_name} đã được kích hoạt thành công. Bạn có thể bắt đầu sử dụng các tính năng nâng cao ngay bây giờ!`,
                    //     }
                    // });

                    // // Create additional notification for subscription activation
                    // await tx.userNotifications.create({
                    //     data: {
                    //         title: 'Gói dịch vụ đã được kích hoạt!',
                    //         content: `Gói ${plan.plan_name} của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu sử dụng các tính năng nâng cao ngay bây giờ.`,
                    //         type: 'pricing_plan',
                    //         user_id: user_id
                    //     }
                    // });
                }
            }

            if (status === 'success') {
                // Get user's company
                const userCompany = await tx.users.findUnique({
                    where: { id: user_id },
                    select: {
                        company_id: true,
                    }
                });

                if (userCompany?.company_id) {
                    const tag = await tx.tags.findFirst({
                        where: { label_name: "Đề xuất" }
                    });

                    if (tag) {
                        await tx.companies.update({
                            where: { id: userCompany.company_id },
                            data: {
                                is_verified: true,
                                companyTags: {
                                    connectOrCreate: {
                                        where: {
                                            company_id_tag_id: {
                                                company_id: userCompany.company_id,
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
            }

            return payment;
        });

        res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            message: 'Thanh toán thành công',
            data: {
                id: result.id,
                amount: Number(result.amount),
                currency: result.currency,
                payment_gateway: result.payment_gateway,
                payment_method: result.payment_method,
                transaction_id: result.transaction_id,
                status: result.status,
                created_at: result.created_at,
                user_id: result.user_id
            }
        });
    } catch (error) {
        console.error('Tạo thanh toán thất bại:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getPayments = async (req: Request, res: Response) => {
    try {
        const { user_id, status, payment_gateway, page = 1, limit = 10 }: PaymentQueryParams = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {};
        if (user_id) where.user_id = user_id;
        if (status) where.status = status;
        if (payment_gateway) where.payment_gateway = payment_gateway;

        const [payments, total] = await Promise.all([
            prisma.payments.findMany({
                where,
                skip,
                take,
                orderBy: { created_at: 'desc' },
                include: {
                    users: {
                        select: {
                            id: true,
                            email: true,
                            username: true
                        }
                    }
                }
            }),
            prisma.payments.count({ where })
        ]);

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                payments: payments.map((payment: any) => ({
                    id: payment.id,
                    amount: Number(payment.amount),
                    currency: payment.currency,
                    payment_gateway: payment.payment_gateway,
                    payment_method: payment.payment_method,
                    transaction_id: payment.transaction_id,
                    status: payment.status,
                    created_at: payment.created_at,
                    user_id: payment.user_id,
                    user: payment.users || null
                })),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error('Lấy danh sách thanh toán thất bại:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getPaymentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payments.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        if (!payment) {
            return res.status(HTTP_ERROR.NOT_FOUND).json({
                success: false,
                message: 'Không tìm thấy thanh toán'
            });
        }

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                id: payment.id,
                amount: Number(payment.amount),
                currency: payment.currency,
                payment_gateway: payment.payment_gateway,
                payment_method: payment.payment_method,
                transaction_id: payment.transaction_id,
                status: payment.status,
                created_at: payment.created_at,
                user_id: payment.user_id,
                user: payment.users || null
            }
        });
    } catch (error) {
        console.error('Get payment by ID error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updatePayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData: UpdatePaymentRequest = req.body;

        // Check if payment exists
        const existingPayment = await prisma.payments.findUnique({
            where: { id }
        });

        if (!existingPayment) {
            return res.status(HTTP_ERROR.NOT_FOUND).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const updateFields: any = {};
        if (updateData.amount !== undefined) updateFields.amount = BigInt(updateData.amount);
        if (updateData.currency !== undefined) updateFields.currency = updateData.currency;
        if (updateData.payment_gateway !== undefined) updateFields.payment_gateway = updateData.payment_gateway;
        if (updateData.payment_method !== undefined) updateFields.payment_method = updateData.payment_method;
        if (updateData.transaction_id !== undefined) updateFields.transaction_id = updateData.transaction_id;
        if (updateData.status !== undefined) updateFields.status = updateData.status;

        const payment = await prisma.payments.update({
            where: { id },
            data: updateFields
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: 'Payment updated successfully',
            data: {
                id: payment.id,
                amount: Number(payment.amount),
                currency: payment.currency,
                payment_gateway: payment.payment_gateway,
                payment_method: payment.payment_method,
                transaction_id: payment.transaction_id,
                status: payment.status,
                created_at: payment.created_at,
                user_id: payment.user_id
            }
        });
    } catch (error) {
        console.error('Update payment error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deletePayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if payment exists
        const existingPayment = await prisma.payments.findUnique({
            where: { id }
        });

        if (!existingPayment) {
            return res.status(HTTP_ERROR.NOT_FOUND).json({
                success: false,
                message: 'Payment not found'
            });
        }

        await prisma.payments.delete({
            where: { id }
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: 'Payment deleted successfully'
        });
    } catch (error) {
        console.error('Delete payment error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
