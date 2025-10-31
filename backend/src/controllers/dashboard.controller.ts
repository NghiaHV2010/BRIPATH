import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';
import { createNotificationData } from '../utils';
import { errorHandler } from '../utils/error';

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

        // Tổng số user (không xóa)
        const totalActiveUsers = await prisma.users.count({
            where: {
                is_deleted: false
            }
        });

        // Tỷ lệ user hoạt động
        const activeUserRate = totalActiveUsers > 0 ? (totalUsersLoggedIn / totalActiveUsers) * 100 : 0;

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                overview: {
                    totalUsersLoggedIn,
                    totalActiveUsers,
                    activeUserRate: Math.round(activeUserRate * 100) / 100,
                    newUsersThisMonth
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