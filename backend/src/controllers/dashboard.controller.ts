import { NextFunction, Request, Response } from 'express';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { createNotificationData } from '../utils';
import { errorHandler } from '../utils/error';
import { prisma } from '../libs/prisma';

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

        // Giao dịch tháng trước
        const lastMonthTransactions = await prisma.payments.count({
            where: {
                status: 'success',
                created_at: {
                    gte: new Date(lastMonthYear, lastMonth - 1, 1),
                    lt: new Date(lastMonthYear, lastMonth, 1)
                }
            }
        });

        // Tính % tăng trưởng giao dịch
        let transactionsGrowthRate = 0;
        if (lastMonthTransactions > 0) {
            transactionsGrowthRate = ((currentMonthTransactions - lastMonthTransactions) / lastMonthTransactions) * 100;
        } else if (currentMonthTransactions > 0) {
            transactionsGrowthRate = 100;
        }

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                totalRevenue: Number(totalRevenue._sum.amount || 0),
                currentMonthRevenue: currentAmount,
                lastMonthRevenue: lastAmount,
                growthRate: Math.round(growthRate * 100) / 100,
                totalTransactions,
                currentMonthTransactions,
                lastMonthTransactions,
                transactionsGrowthRate: Math.round(transactionsGrowthRate * 100) / 100,
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
        const { period = '30', page = '1', limit = '20' } = req.query;
        const days = parseInt(period as string);

        const currentPage = Math.max(parseInt(page as string, 10) || 1, 1);
        const pageSize = Math.max(parseInt(limit as string, 10) || 20, 1);
        const skip = (currentPage - 1) * pageSize;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Thống kê theo trạng thái (trong khoảng period ngày)
        const statusStats = await prisma.payments.groupBy({
            by: ['status'],
            where: {
                created_at: {
                    gte: startDate
                }
            },
            _count: {
                id: true
            },
            _sum: {
                amount: true
            }
        });

        // Thống kê theo payment gateway (trong khoảng period ngày)
        const gatewayStats = await prisma.payments.groupBy({
            by: ['payment_gateway'],
            where: {
                created_at: {
                    gte: startDate
                }
            },
            _count: {
                id: true
            },
            _sum: {
                amount: true
            }
        });

        // Thống kê theo payment method (trong khoảng period ngày)
        const methodStats = await prisma.payments.groupBy({
            by: ['payment_method'],
            where: {
                created_at: {
                    gte: startDate
                }
            },
            _count: {
                id: true
            },
            _sum: {
                amount: true
            }
        });

        const recentWhere = {
            created_at: {
                gte: startDate
            }
        };

        const totalRecentTransactions = await prisma.payments.count({
            where: recentWhere
        });

        const recentTransactions = await prisma.payments.findMany({
            where: recentWhere,
            include: {
                users: {
                    select: {
                        avatar_url: true,
                        username: true,
                        email: true,
                        roles: {
                            select: {
                                role_name: true
                            }
                        }
                    }
                },
                subscriptions: {
                    select: {
                        status: true,
                        end_date: true,
                        membershipPlans: {
                            select: {
                                plan_name: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            skip,
            take: pageSize
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
                    user: transaction.users,
                    subscription: transaction.subscriptions
                })),
                recentTransactionsPagination: {
                    page: currentPage,
                    limit: pageSize,
                    total: totalRecentTransactions,
                    totalPages: Math.ceil(totalRecentTransactions / pageSize)
                }
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

export const getUserAccessStats = async (req: Request, res: Response) => {
    try {
        const { period = '30' } = req.query; // days
        const days = parseInt(period as string);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Tổng số user đã từng đăng nhập
        const totalUsersLoggedIn = await prisma.users.count({
            where: {
                last_loggedIn: {
                    not: null
                },
                is_deleted: false
            }
        });

        // Số user đã đăng nhập trong khoảng thời gian
        const usersLoggedInInPeriod = await prisma.users.count({
            where: {
                last_loggedIn: {
                    gte: startDate
                },
                is_deleted: false
            }
        });

        // Số user đăng nhập hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const usersLoggedInToday = await prisma.users.count({
            where: {
                last_loggedIn: {
                    gte: today,
                    lt: tomorrow
                },
                is_deleted: false
            }
        });

        // Số user đăng nhập tuần này
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const usersLoggedInThisWeek = await prisma.users.count({
            where: {
                last_loggedIn: {
                    gte: startOfWeek
                },
                is_deleted: false
            }
        });

        // Số user đăng nhập tháng này
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const usersLoggedInThisMonth = await prisma.users.count({
            where: {
                last_loggedIn: {
                    gte: startOfMonth
                },
                is_deleted: false
            }
        });

        // Thống kê theo ngày (7 ngày gần nhất)
        const dailyUserStats = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const usersLoggedInOnDay = await prisma.users.count({
                where: {
                    last_loggedIn: {
                        gte: date,
                        lt: nextDate
                    },
                    is_deleted: false
                }
            });

            dailyUserStats.push({
                date: date.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                }),
                users: usersLoggedInOnDay,
                fullDate: date.toISOString().split('T')[0]
            });
        }

        // Thống kê theo tháng (12 tháng gần nhất)
        const monthlyUserStats = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const nextDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);

            const usersLoggedInInMonth = await prisma.users.count({
                where: {
                    last_loggedIn: {
                        gte: date,
                        lt: nextDate
                    },
                    is_deleted: false
                }
            });

            monthlyUserStats.push({
                month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                users: usersLoggedInInMonth,
                year: date.getFullYear(),
                monthNumber: date.getMonth() + 1
            });
        }

        // User mới đăng ký trong tháng này
        const newUsersThisMonth = await prisma.users.count({
            where: {
                created_at: {
                    gte: startOfMonth
                },
                is_deleted: false
            }
        });

        // User mới đăng ký tháng trước
        const lastMonthStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEndDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const newUsersLastMonth = await prisma.users.count({
            where: {
                created_at: {
                    gte: lastMonthStartDate,
                    lt: lastMonthEndDate
                },
                is_deleted: false
            }
        });

        // Tính % tăng trưởng user mới
        let newUsersGrowthRate = 0;
        if (newUsersLastMonth > 0) {
            newUsersGrowthRate = ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;
        } else if (newUsersThisMonth > 0) {
            newUsersGrowthRate = 100;
        }

        // Tổng số user (không xóa)
        const totalActiveUsers = await prisma.users.count({
            where: {
                is_deleted: false
            }
        });

        // Tỷ lệ user hoạt động
        const activeUserRate = totalActiveUsers > 0 ? (totalUsersLoggedIn / totalActiveUsers) * 100 : 0;

        // Tính % tăng trưởng tỷ lệ user hoạt động (so sánh với tháng trước)
        const usersLoggedInLastMonth = await prisma.users.count({
            where: {
                last_loggedIn: {
                    not: null
                },
                created_at: {
                    lt: lastMonthEndDate
                },
                is_deleted: false
            }
        });
        const totalActiveUsersLastMonth = await prisma.users.count({
            where: {
                created_at: {
                    lt: lastMonthEndDate
                },
                is_deleted: false
            }
        });
        const activeUserRateLastMonth = totalActiveUsersLastMonth > 0 ? (usersLoggedInLastMonth / totalActiveUsersLastMonth) * 100 : 0;
        const activeUserRateGrowth = activeUserRateLastMonth > 0 ? ((activeUserRate - activeUserRateLastMonth) / activeUserRateLastMonth) * 100 : 0;

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                overview: {
                    totalUsersLoggedIn,
                    totalActiveUsers,
                    activeUserRate: Math.round(activeUserRate * 100) / 100,
                    newUsersThisMonth,
                    newUsersLastMonth,
                    newUsersGrowthRate: Math.round(newUsersGrowthRate * 100) / 100,
                    activeUserRateGrowth: Math.round(activeUserRateGrowth * 100) / 100
                },
                periodStats: {
                    period: `${days} days`,
                    usersLoggedInInPeriod,
                    usersLoggedInToday,
                    usersLoggedInThisWeek,
                    usersLoggedInThisMonth
                },
                dailyStats: dailyUserStats,
                monthlyStats: monthlyUserStats,
                summary: {
                    activeUserText: `${totalUsersLoggedIn.toLocaleString()} / ${totalActiveUsers.toLocaleString()} users`,
                    activityRateText: `${activeUserRate.toFixed(1)}% users active`,
                    periodText: `${usersLoggedInInPeriod.toLocaleString()} users in last ${days} days`
                }
            }
        });
    } catch (error) {
        console.error('Dashboard user access stats error:', error);
        res.status(HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getCompaniesByStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;

    if (!status || (status !== 'pending' && status !== 'approved' && status !== 'rejected')) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: 'Trạng thái không hợp lệ. Vui lòng sử dụng "pending", "approved" hoặc "rejected".'
        });
    }

    try {
        const companies = await prisma.companies.findMany({
            where: {
                status: status
            },
            include: {
                users: {
                    omit: {
                        password: true,
                    }
                }
            }
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: companies
        });
    } catch (error) {
        next(error);
    }
};

export const getEventsByStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;

    if (!status || (status !== 'pending' && status !== 'approved' && status !== 'rejected')) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: 'Trạng thái không hợp lệ. Vui lòng sử dụng "pending", "approved" hoặc "rejected".'
        });
    }

    try {
        const events = await prisma.events.findMany({
            where: {
                status: status
            },
            include: {
                users: {
                    omit: {
                        password: true
                    }
                }
            }
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

export const updateEventStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;
    const { status, feedback } = req.body;

    if (!status || (status !== 'approved' && status !== 'rejected')) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: 'Trạng thái không hợp lệ. Vui lòng sử dụng "approved" hoặc "rejected".'
        });
    }

    try {
        const isEventExisted = await prisma.events.findFirst({
            where: {
                id: eventId
            }
        });

        if (!isEventExisted) {
            return res.status(HTTP_ERROR.NOT_FOUND).json({
                success: false,
                message: 'Sự kiện không tồn tại hoặc đã được duyệt.'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const event = await tx.events.update({
                where: {
                    id: eventId,
                    status: 'pending'
                },
                data: {
                    status: status,
                    approved_at: new Date()
                }
            });

            const notificationData = createNotificationData(isEventExisted.title, status, "system", "user", feedback);

            await tx.userNotifications.create({
                data: {
                    user_id: isEventExisted.user_id,
                    title: notificationData.title,
                    content: notificationData.content,
                    type: notificationData.type,
                }
            });

            return event;
        });


        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const updateCompanyStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { companyId } = req.params;
    const { status, feedback } = req.body;

    if (!status || (status !== 'approved' && status !== 'rejected')) {
        return res.status(HTTP_ERROR.BAD_REQUEST).json({
            success: false,
            message: 'Trạng thái không hợp lệ. Vui lòng sử dụng "approved" hoặc "rejected".'
        });
    }

    try {
        const isCompanyExisted = await prisma.companies.findFirst({
            where: {
                id: companyId,
                status: 'pending'
            }
        });

        if (!isCompanyExisted) {
            return res.status(HTTP_ERROR.NOT_FOUND).json({
                success: false,
                message: 'Công ty không tồn tại hoặc đã được duyệt.'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const roleId = await tx.roles.findFirst({
                where: {
                    role_name: 'Company'
                },
                select: { id: true }
            });

            const company = await tx.companies.update({
                where: {
                    id: companyId,
                    status: 'pending'
                },
                data: {
                    status: status,
                    approved_at: new Date(),
                    users: {
                        update: {
                            role_id: roleId?.id || 2 // default to 'Company' role if not found
                        }
                    }
                },
                include: {
                    users: {
                        omit: {
                            password: true,
                        }
                    }
                }
            });

            const notificationData = createNotificationData(undefined, status, "system", "company", feedback);

            if (company.users) {
                await tx.userNotifications.create({
                    data: {
                        user_id: company.users?.id,
                        title: notificationData.title,
                        content: notificationData.content,
                        type: notificationData.type,
                    }
                });
            }

            return company;
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const createJobLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { label_name } = req.body as { label_name?: string };

        if (!label_name || typeof label_name !== 'string') {
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Nhãn không hợp lệ"));
        }

        const name = label_name.trim();

        if (name.length === 0) {
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Nhãn không được để trống"));
        }

        if (name.length > 50) { // schema uses VarChar(50)
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Nhãn phải có tối đa 50 ký tự"));
        }

        const existed = await prisma.jobLabels.findFirst({ where: { label_name: name } });
        if (existed) {
            return next(errorHandler(HTTP_ERROR.CONFLICT, "Nhãn đã tồn tại"));
        }

        const created = await prisma.jobLabels.create({ data: { label_name: name } });
        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: created
        });
    } catch (error) {
        next(error);
    }
}

export const createCompanyLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { label_name } = req.body as { label_name?: string };

        if (!label_name || typeof label_name !== 'string') {
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "label_name is required"));
        }

        const name = label_name.trim();

        if (name.length === 0) {
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "label_name cannot be empty"));
        }

        if (name.length > 100) {
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "label_name must be at most 100 characters"));
        }

        const existed = await prisma.tags.findFirst({
            where: { label_name: name }
        });

        if (existed) {
            return next(errorHandler(HTTP_ERROR.CONFLICT, "Label already exists"));
        }

        const created = await prisma.tags.create({
            data: { label_name: name }
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            data: created
        });
    } catch (error) {
        next(error);
    }
}

export const createBlogPost = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user?.id;
    const { title, cover_image_url, description_url }: { title: string; cover_image_url: string; description_url: string } = req.body;

    if (!title || !cover_image_url || !description_url) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng điền đầy đủ thông tin"));
    }

    if (title.length < 10 || title.length > 255) {
        return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Tiêu đề phải từ 10 đến 255 ký tự"));
    }

    if (!description_url.includes('http')) {
        return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Nội dung không hợp lệ"));
    }

    if (!cover_image_url.includes('http')) {
        return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Ảnh bìa không hợp lệ"));
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const blogPost = await tx.blogs.create({
                data: {
                    title,
                    cover_image_url,
                    description_url,
                    user_id
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    user_id,
                    activity_name: `Bạn đã tạo bài viết mới trên hệ thống \n ${title} #${blogPost.id}`,
                }
            });

            return blogPost;
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Math.max(parseInt((req.query.page as string) || '1'), 1);
        const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '12'), 1), 100);
        const skip = (page - 1) * limit;

        const [total, blogs] = await Promise.all([
            prisma.blogs.count(),
            prisma.blogs.findMany({
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            })
        ]);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: blogs,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
}

export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const blogId = parseInt(req.params.blogId as string);
        if (isNaN(blogId)) {
            return res.status(HTTP_ERROR.BAD_REQUEST).json({ success: false, message: 'blogId không hợp lệ' });
        }
        const blog = await prisma.blogs.findFirst({ where: { id: blogId } });
        if (!blog) {
            return res.status(HTTP_ERROR.NOT_FOUND).json({ success: false, message: 'Bài viết không tồn tại' });
        }
        return res.status(HTTP_SUCCESS.OK).json({ success: true, data: blog });
    } catch (error) {
        next(error);
    }
}

export const updateBlogPost = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user?.id;
    const blogId = parseInt(req.params.blogId as string);
    const { title, cover_image_url, description_url }: { title: string; cover_image_url: string; description_url: string } = req.body;

    if (isNaN(blogId)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "blogId không hợp lệ"));
    }

    if (!title || !cover_image_url || !description_url) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng điền đầy đủ thông tin"));
    }

    if (title.length < 10 || title.length > 255) {
        return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Tiêu đề phải từ 10 đến 255 ký tự"));
    }

    if (!description_url.includes('http')) {
        return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Nội dung không hợp lệ"));
    }

    if (!cover_image_url.includes('http')) {
        return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "Ảnh bìa không hợp lệ"));
    }

    try {
        const isBlogsExisted = await prisma.blogs.findFirst({
            where: {
                id: blogId
            }
        });

        if (!isBlogsExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Bài viết không tồn tại"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const blogPost = await tx.blogs.update({
                where: { id: blogId },
                data: {
                    title,
                    cover_image_url,
                    description_url,
                    user_id
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    user_id,
                    activity_name: `Bạn đã cập nhật bài viết \n ${title} #${blogPost.id}`,
                }
            });

            return blogPost;
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const deleteBlogPost = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user?.id;
    const blogId = parseInt(req.params.blogId as string);

    if (isNaN(blogId)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "blogId không hợp lệ"));
    }

    try {
        const isBlogsExisted = await prisma.blogs.findFirst({
            where: {
                id: blogId
            }
        });

        if (!isBlogsExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Bài viết không tồn tại"));
        }

        await prisma.$transaction(async (tx) => {
            await tx.blogs.delete({
                where: { id: blogId }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    user_id,
                    activity_name: `Bạn đã xóa bài viết \n ${isBlogsExisted.title} #${blogId}`,
                }
            });
        });

        return res.status(HTTP_SUCCESS.OK).json({ success: true, message: 'Xóa bài viết thành công' });
    } catch (error) {
        next(error);
    }
}

export const getAllReports = async (req: Request, res: Response, next: NextFunction) => {
    let page = parseInt(req.query.page as string || '1');
    const status = req.query.status as 'pending' | 'approved' | 'rejected';
    const numberOfReports = 20;

    if (status && (status !== 'pending' && status !== 'approved' && status !== 'rejected')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ"));
    }

    if (isNaN(page) || page < 1) page = 1;
    page -= 1;
    try {
        const totalReports = await prisma.reports.count();

        const reports = await prisma.reports.findMany({
            where: status ? { status } : {},
            orderBy: {
                created_at: 'desc'
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                        avatar_url: true,
                    }
                }
            },
            skip: page * numberOfReports,
            take: numberOfReports
        });
        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: reports,
            totalPages: Math.ceil(totalReports / numberOfReports),
        });
    } catch (error) {
        next(error);
    }
}

export const updateReportStatus = async (req: Request, res: Response, next: NextFunction) => {
    const reportId = parseInt(req.params.reportId);
    const { status } = req.body;

    if (!status || (status !== 'approved' && status !== 'rejected')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ"));
    }

    try {
        const isReportExisted = await prisma.reports.findFirst({
            where: {
                id: reportId
            }
        });

        if (!isReportExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Báo cáo không tồn tại"));
        }

        const result = await prisma.reports.update({
            where: { id: reportId },
            data: { status }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = parseInt(req.query.page as string || '1');
        const search = req.query.search as string;
        const roleId = req.query.roleId ? parseInt(req.query.roleId as string) : null;
        const numberOfUsers = 20;

        if (isNaN(page) || page < 1) page = 1;
        page -= 1;

        const where: any = {
            is_deleted: false,
            role_id: {
                not: 3
            }
        };

        if (roleId !== null && !isNaN(roleId)) {
            if (roleId === 3) {
                return res.status(HTTP_SUCCESS.OK).json({
                    success: true,
                    data: [],
                    totalPages: 0,
                    totalUsers: 0
                });
            }
            where.role_id = roleId;
        }

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get total count
        const totalUsers = await prisma.users.count({ where });

        // Get users with pagination
        const users = await prisma.users.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                avatar_url: true,
                phone: true,
                address_street: true,
                address_ward: true,
                address_city: true,
                address_country: true,
                gender: true,
                last_loggedIn: true,
                created_at: true,
                updated_at: true,
                role_id: true,
                phone_verified: true,
                company_id: true
            },
            orderBy: {
                created_at: 'desc'
            },
            skip: page * numberOfUsers,
            take: numberOfUsers
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: users,
            totalPages: Math.ceil(totalUsers / numberOfUsers),
            totalUsers
        });
    } catch (error) {
        next(error);
    }
}

export const getDashboardQuickStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Số công ty chờ duyệt
        const pendingCompanies = await prisma.companies.count({
            where: { status: 'pending' }
        });

        // Số sự kiện chờ duyệt
        const pendingEvents = await prisma.events.count({
            where: { status: 'pending' }
        });

        // Số báo cáo chờ duyệt
        const pendingReports = await prisma.reports.count({
            where: { status: 'pending' }
        });

        // Giao dịch hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTransactions = await prisma.payments.count({
            where: {
                created_at: {
                    gte: today,
                    lt: tomorrow
                },
                status: 'success'
            }
        });

        // Người dùng mới hôm nay
        const todayNewUsers = await prisma.users.count({
            where: {
                created_at: {
                    gte: today,
                    lt: tomorrow
                },
                is_deleted: false
            }
        });

        // Tỷ lệ chuyển đổi (có thể tính từ số giao dịch thành công / tổng giao dịch)
        const totalTransactions = await prisma.payments.count();
        const successTransactions = await prisma.payments.count({
            where: { status: 'success' }
        });
        const conversionRate = totalTransactions > 0 ? (successTransactions / totalTransactions) * 100 : 0;

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                pendingCompanies,
                pendingEvents,
                pendingReports,
                todayTransactions,
                todayNewUsers,
                conversionRate: Math.round(conversionRate * 100) / 100
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getRecentActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const activities = [];

        // Công ty mới được duyệt (24h gần nhất)
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const recentApprovedCompanies = await prisma.companies.findMany({
            where: {
                status: 'approved',
                approved_at: {
                    gte: last24Hours
                }
            },
            include: {
                users: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                approved_at: 'desc'
            },
            take: 5
        });

        recentApprovedCompanies.forEach(company => {
            activities.push({
                type: 'company_approved',
                message: `Công ty ${company.users?.username || 'N/A'} đã được duyệt`,
                time: company.approved_at,
                color: 'green'
            });
        });

        // Giao dịch mới (24h gần nhất)
        const recentPayments = await prisma.payments.findMany({
            where: {
                status: 'success',
                created_at: {
                    gte: last24Hours
                }
            },
            include: {
                users: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 5
        });

        recentPayments.forEach(payment => {
            activities.push({
                type: 'payment',
                message: `Giao dịch mới: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(payment.amount))}`,
                time: payment.created_at,
                color: 'blue'
            });
        });

        // Sự kiện mới chờ duyệt (lấy 5 sự kiện pending gần nhất)
        const recentPendingEvents = await prisma.events.findMany({
            where: {
                status: 'pending'
            },
            include: {
                users: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                start_date: 'desc'
            },
            take: 5
        });

        recentPendingEvents.forEach(event => {
            activities.push({
                type: 'event_pending',
                message: `Sự kiện mới chờ duyệt: ${event.title}`,
                time: event.start_date,
                color: 'yellow'
            });
        });

        // Người dùng mới đăng ký (24h gần nhất)
        const recentNewUsers = await prisma.users.findMany({
            where: {
                created_at: {
                    gte: last24Hours
                },
                is_deleted: false
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 5
        });

        recentNewUsers.forEach(user => {
            activities.push({
                type: 'user_registered',
                message: `Người dùng mới đăng ký: ${user.username}`,
                time: user.created_at,
                color: 'purple'
            });
        });

        // Sắp xếp theo thời gian mới nhất
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        // Lấy 10 hoạt động gần nhất
        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: activities.slice(0, 10)
        });
    } catch (error) {
        next(error);
    }
}