import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { CreatePaymentRequest, UpdatePaymentRequest, PaymentQueryParams } from '../types/payment.types';

const prisma = new PrismaClient();

export const createPayment = async (req: Request, res: Response) => {
    try {
        const { amount, currency, payment_gateway, payment_method, transaction_id, status, user_id }: CreatePaymentRequest = req.body;

        if (!amount || !payment_gateway || !payment_method || !status || !user_id) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const user = await prisma.users.findUnique({
            where: { id: user_id }
        });

        if (!user) {
            return res.status(HTTP_ERROR.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        const payment = await prisma.payments.create({
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

        res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            message: 'Payment created successfully',
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
        console.error('Create payment error:', error);
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
        console.error('Get payments error:', error);
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
                message: 'Payment not found'
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
