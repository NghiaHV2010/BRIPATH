import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';

const prisma = new PrismaClient();

export const getRevenueStats = async (req: Request, res: Response) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        // Lấy tháng trước
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        // Tổng doanh thu tất cả thời gian
        const totalRevenue = await prisma.payments.aggregate({
            where: {
                status: 'success'
            },
            _sum: {
                amount: true
            }
        });

        // Doanh thu tháng hiện tại
        const currentMonthRevenue = await prisma.payments.aggregate({
            where: {
                status: 'success',
                created_at: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1)
                }
            },
            _sum: {
                amount: true
            }
        });

        // Doanh thu tháng trước
        const lastMonthRevenue = await prisma.payments.aggregate({
            where: {
                status: 'success',
                created_at: {
                    gte: new Date(lastMonthYear, lastMonth - 1, 1),
                    lt: new Date(lastMonthYear, lastMonth, 1)
                }
            },
            _sum: {
                amount: true
            }
        });

        // Tính tăng trưởng
        const currentAmount = Number(currentMonthRevenue._sum.amount || 0);
        const lastAmount = Number(lastMonthRevenue._sum.amount || 0);
        
        let growthRate = 0;
        if (lastAmount > 0) {
            growthRate = ((currentAmount - lastAmount) / lastAmount) * 100;
        } else if (currentAmount > 0) {
            growthRate = 100; // 100% tăng trưởng nếu tháng trước = 0
        }

        // Doanh thu theo từng tháng (12 tháng gần nhất)
        const monthlyRevenue = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1 - i, 1);
            const nextDate = new Date(currentYear, currentMonth - i, 1);
            
            const monthRevenue = await prisma.payments.aggregate({
                where: {
                    status: 'success',
                    created_at: {
                        gte: date,
                        lt: nextDate
                    }
                },
                _sum: {
                    amount: true
                }
            });

            monthlyRevenue.push({
                month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                revenue: Number(monthRevenue._sum.amount || 0),
                year: date.getFullYear(),
                monthNumber: date.getMonth() + 1
            });
        }

        // Doanh thu theo payment gateway
        const revenueByGateway = await prisma.payments.groupBy({
            by: ['payment_gateway'],
            where: {
                status: 'success'
            },
            _sum: {
                amount: true
            },
            _count: {
                id: true
            }
        });

        // Số lượng giao dịch
        const totalTransactions = await prisma.payments.count({
            where: {
                status: 'success'
            }
        });

        const currentMonthTransactions = await prisma.payments.count({
            where: {
                status: 'success',
                created_at: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1)
                }
            }
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                totalRevenue: Number(totalRevenue._sum.amount || 0),
                currentMonthRevenue: currentAmount,
                lastMonthRevenue: lastAmount,
                growthRate: Math.round(growthRate * 100) / 100,
                totalTransactions,
                currentMonthTransactions,
                monthlyRevenue,
                revenueByGateway: revenueByGateway.map(item => ({
                    gateway: item.payment_gateway,
                    revenue: Number(item._sum.amount || 0),
                    transactions: item._count.id
                })),
                summary: {
                    totalRevenueFormatted: new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(Number(totalRevenue._sum.amount || 0)),
                    currentMonthFormatted: new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(currentAmount),
                    growthText: growthRate >= 0 ? 
                        `Tăng ${Math.abs(growthRate).toFixed(1)}%` : 
                        `Giảm ${Math.abs(growthRate).toFixed(1)}%`
                }
            }
        });
    } catch (error) {
        console.error('Dashboard revenue stats error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getPaymentStats = async (req: Request, res: Response) => {
    try {
        const { period = '30' } = req.query; // days
        const days = parseInt(period as string);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Thống kê theo trạng thái
        const statusStats = await prisma.payments.groupBy({
            by: ['status'],
            _count: {
                id: true
            },
            _sum: {
                amount: true
            }
        });

        // Thống kê theo payment gateway
        const gatewayStats = await prisma.payments.groupBy({
            by: ['payment_gateway'],
            _count: {
                id: true
            },
            _sum: {
                amount: true
            }
        });

        // Thống kê theo payment method
        const methodStats = await prisma.payments.groupBy({
            by: ['payment_method'],
            _count: {
                id: true
            },
            _sum: {
                amount: true
            }
        });

        // Giao dịch gần đây
        const recentTransactions = await prisma.payments.findMany({
            where: {
                created_at: {
                    gte: startDate
                }
            },
            include: {
                users: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 10
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                period: `${days} days`,
                statusStats: statusStats.map(item => ({
                    status: item.status,
                    count: item._count.id,
                    revenue: Number(item._sum.amount || 0)
                })),
                gatewayStats: gatewayStats.map(item => ({
                    gateway: item.payment_gateway,
                    count: item._count.id,
                    revenue: Number(item._sum.amount || 0)
                })),
                methodStats: methodStats.map(item => ({
                    method: item.payment_method,
                    count: item._count.id,
                    revenue: Number(item._sum.amount || 0)
                })),
                recentTransactions: recentTransactions.map(transaction => ({
                    id: transaction.id,
                    amount: Number(transaction.amount),
                    currency: transaction.currency,
                    payment_gateway: transaction.payment_gateway,
                    payment_method: transaction.payment_method,
                    status: transaction.status,
                    created_at: transaction.created_at,
                    user: transaction.users
                }))
            }
        });
    } catch (error) {
        console.error('Dashboard payment stats error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
