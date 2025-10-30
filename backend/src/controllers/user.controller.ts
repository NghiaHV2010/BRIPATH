import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_MODEL } from "../config/env.config";
import { createNotificationData } from "../utils";

const prisma = new PrismaClient();

export const followCompany = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id as string;
    const company_id = req.params.companyId;

    // @ts-ignore
    if (req.user.company_id === company_id) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn không thể theo dõi chính mình!"));
    }

    try {
        const isCompanyExisted = await prisma.companies.findFirst({
            where: {
                id: company_id,
                status: "approved"
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
                followedCompanies: {
                    where: {
                        user_id
                    },
                }
            }
        });

        if (!isCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy công ty!"));
        }

        if (isCompanyExisted.followedCompanies.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Đã theo dõi công ty này!"));
        }

        await prisma.$transaction(async (tx) => {
            await tx.followedCompanies.create({
                data: {
                    company_id,
                    user_id,
                }
            });


            if (isCompanyExisted.users) {
                await tx.userActivitiesHistory.create({
                    data: {
                        activity_name: `Bạn đã theo dõi công ty ${isCompanyExisted.users.username}`,
                        user_id
                    }
                });

                const notificationData = createNotificationData(undefined, undefined, "followed", "company");

                await tx.userNotifications.create({
                    data: {
                        title: notificationData.title,
                        content: notificationData.content,
                        type: notificationData.type,
                        user_id: isCompanyExisted.users.id
                    }
                });
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Thành công!"
        });
    } catch (error) {
        next(error);
    }
}

export const saveJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id, company_id } = req.user;
    const job_id = req.params.jobId;

    try {
        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: job_id
            },
            include: {
                savedJobs: {
                    where: {
                        user_id: id
                    },
                },
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy công việc!"));
        }

        if (isJobExisted.company_id === company_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn không thể lưu công việc của mình!"));
        }

        if (isJobExisted.savedJobs.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn đã lưu công việc này!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const savedJob = await tx.savedJobs.create({
                data: {
                    job_id,
                    user_id: id
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã lưu công việc ${isJobExisted.job_title}`,
                    user_id: id
                }
            });

            return savedJob;
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Thành công!",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const unsaveJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const job_id = req.params.jobId;

    try {
        const isSavedJobExisted = await prisma.savedJobs.findFirst({
            where: {
                job_id,
                user_id
            },
            include: {
                jobs: { select: { job_title: true } }
            }
        });

        if (!isSavedJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc chưa được lưu!"));
        }

        await prisma.$transaction(async (tx) => {
            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã hủy lưu công việc ${isSavedJobExisted.jobs.job_title}`,
                    user_id
                }
            });

            await tx.savedJobs.delete({
                where: {
                    user_id_job_id: {
                        user_id,
                        job_id
                    }
                }
            });
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Thành công!"
        });
    } catch (error) {
        next(error);
    }
}

export const unfollowCompany = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const company_id = req.params.companyId;

    try {
        const isFollowedCompanyExisted = await prisma.followedCompanies.findFirst({
            where: {
                company_id,
                user_id
            },
            select: {
                companies: {
                    select: {
                        users: {
                            select: {
                                username: true
                            },
                            where: {
                                company_id
                            }
                        }
                    }
                }
            }
        });

        if (!isFollowedCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công ty chưa được theo dõi!"));
        }

        await prisma.$transaction(async (tx) => {
            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã hủy theo dõi công ty ${isFollowedCompanyExisted.companies.users?.username}`,
                    user_id
                }
            });

            await tx.followedCompanies.delete({
                where: {
                    user_id_company_id: {
                        user_id,
                        company_id
                    }
                }
            });
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Thành công!"
        });
    }
    catch (error) {
        next(error);
    }
}

export const applyJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id, company_id } = req.user;
    const job_id = req.params.jobId
    const { cv_id, description } = req.body;

    if (description && description.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mô tả hồ sơ ứng tuyển phải có ít nhất 10 ký tự!"));
    }

    try {
        const isCvExisted = await prisma.cvs.findFirst({
            where: {
                id: cv_id,
                users_id: id
            }
        });

        if (!isCvExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy hồ sơ này!"));
        }

        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: job_id
            },
            include: {
                companies: {
                    select: {
                        users: {
                            select: {
                                id: true,
                                username: true,
                            }
                        }
                    }
                },
                applicants: {
                    where: {
                        cv_id
                    }
                },
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy công việc!"));
        }

        if (isJobExisted.company_id === company_id) {
            return next(errorHandler(HTTP_ERROR.BAD_GATEWAY, "Bạn không thể ứng tuyển vào công việc của mình!"));
        }

        if (isJobExisted.applicants.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn đã ứng tuyển vào công việc này!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const applicant = await tx.applicants.create({
                data: {
                    cv_id,
                    job_id,
                    description
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã ứng tuyển vào công việc ${isJobExisted.job_title}`,
                    user_id: id
                }
            });

            const userNotificationData = createNotificationData(isJobExisted.job_title, 'pending', "applicant", 'user', description);
            const companyNotificationData = createNotificationData(isJobExisted.job_title, 'pending', "applicant", 'company', description);

            await tx.userNotifications.createMany({
                data: [
                    {
                        title: userNotificationData.title,
                        content: userNotificationData.content,
                        type: userNotificationData.type,
                        user_id: id
                    },
                    {
                        title: companyNotificationData.title,
                        content: companyNotificationData.content,
                        type: companyNotificationData.type,
                        user_id: isJobExisted.companies.users.id
                    }
                ]
            });

            return applicant;
        }).catch((e) => (next(errorHandler(HTTP_ERROR.CONFLICT, "Đã xảy ra lỗi, vui lòng thử lại!"))));

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error);
    }
}

export const feedbackCompany = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const company_id = req.params.companyId;
    const { description, stars, benefit, work_environment }: { description: string, stars: number, benefit: string, work_environment: string } = req.body;

    // @ts-ignore
    if (req.user.company_id === company_id) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn không thể phản hồi chính mình!"));
    }

    if (description.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mô tả phải có ít nhất 10 ký tự!"));
    }

    if (stars < 1 || stars > 5) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số sao đánh giá phải từ 1 đến 5!"));
    }

    if (benefit && benefit.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Lợi ích phải có ít nhất 10 ký tự!"));
    }

    if (work_environment && work_environment.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Môi trường làm việc phải có ít nhất 10 ký tự!"));
    }

    try {
        const isCompanyExisted = await prisma.companies.findFirst({
            where: {
                id: company_id,
                status: "approved"
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
                feedbacks: {
                    where: {
                        user_id
                    },
                }
            }
        });

        if (!isCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy công ty!"));
        }

        if (isCompanyExisted.feedbacks.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn đã phản hồi công ty này!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const feedback = await tx.feedbacks.create({
                data: {
                    description,
                    stars,
                    benefit,
                    work_environment,
                    company_id,
                    user_id
                }
            });

            if (isCompanyExisted.users) {
                await tx.userActivitiesHistory.create({
                    data: {
                        activity_name: `Bạn đã theo dõi công ty ${isCompanyExisted.users.username}`,
                        user_id
                    }
                });

                const notificationData = createNotificationData(undefined, undefined, "followed", "company");

                await tx.userNotifications.create({
                    data: {
                        title: notificationData.title,
                        content: notificationData.content,
                        type: notificationData.type,
                        user_id: isCompanyExisted.users.id
                    }
                });
            }

            return feedback;
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error);
    }
}

export const getLastestUserChat = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;

    try {
        const messages = await prisma.messages.findMany({
            where: {
                user_id
            },
            take: 20
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
}

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    // @ts-ignore
    const user_id = req.user.id;
    const { content } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: "Bạn là trợ lý ảo của BRIPATH, ứng dụng tìm việc và tuyển dụng online." },
                { role: "user", content: content }
            ],
        });

        if (response.choices[0].message) {
            const message = await prisma.messages.create({
                data: {
                    user_id,
                    message_content: content,
                    response_content: response.choices[0].message.content
                }
            });

            return res.status(HTTP_SUCCESS.OK).json({
                success: true,
                data: message
            });
        }

        return res.status(HTTP_ERROR.CONFLICT).json({
            message: "Đã xảy ra lỗi, vui lòng thử lại!"
        });
    } catch (error) {
        next(error);
    }
}

export const applyEvent = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const event_id = req.params.eventId;

    const { description } = req.body;

    if (!description || description.length < 20) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mô tả phải có ít nhất 20 ký tự!"));
    }

    try {
        const isEventExisted = await prisma.events.findFirst({
            where: {
                id: event_id,
                status: "approved"
            },
            include: {
                volunteers: {
                    where: {
                        user_id
                    }
                }
            }
        });

        if (!isEventExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy sự kiện!"));
        }

        if (isEventExisted.user_id === user_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn không thể đăng ký sự kiện của chính mình!"));
        }

        if (isEventExisted.volunteers.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn đã đăng ký tình nguyện cho sự kiện này!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const volunteer = await tx.volunteers.create({
                data: {
                    event_id,
                    user_id,
                    description
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã đăng ký tình nguyện cho sự kiện ${isEventExisted.title}`,
                    user_id
                }
            });

            const notificationData = createNotificationData(undefined, 'pending', "applicant", 'user');

            await tx.userNotifications.create({
                data: {
                    title: notificationData.title,
                    content: notificationData.content,
                    type: notificationData.type,
                    user_id: isEventExisted.user_id
                }
            });

            return volunteer;
        }).catch((e) => (errorHandler(HTTP_ERROR.CONFLICT, "Đã xảy ra lỗi, vui lòng thử lại!")));

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const feedbackJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const job_id = req.params.jobId;
    const { cv_id, is_good }: { cv_id: number, is_good: boolean } = req.body;

    try {
        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: job_id
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy công việc!"));
        }

        const isCvExisted = await prisma.cvs.findFirst({
            where: {
                id: cv_id,
                users_id: user_id
            },
            include: {
                aiFeedbacks: {
                    where: {
                        job_id,
                        role: "User"
                    }
                }
            }
        });

        if (!isCvExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy CV!"));
        }

        if (isCvExisted.aiFeedbacks.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn đã phản hồi công việc này cho CV này!"));
        }

        const feedback = await prisma.aiFeedbacks.create({
            data: {
                cv_id,
                job_id,
                role: "User",
                is_good,
            }
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        next(error);
    }
}

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id, company_id } = req.user;

    try {
        const user = await prisma.users.findFirst({
            where: {
                id
            },
            include: {
                companies: company_id ? {
                    select: {
                        jobs: {
                            select: {
                                _count: {
                                    select: {
                                        applicants: {
                                            where: {
                                                status: 'pending'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        status: true,
                        background_url: true,
                        business_certificate: true,
                        description: true,

                    }
                } : false,
                roles: {
                    select: {
                        role_name: true
                    }
                },
                events: {
                    where: {
                        status: 'approved',
                    },
                    select: {
                        _count: {
                            select: {
                                volunteers: {
                                    where: {
                                        status: 'pending'
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        userNotifications: {
                            where: {
                                is_read: false
                            }
                        },
                        followedCompanies: true,
                        savedJobs: true,
                    }
                }
            },
            omit: {
                password: true,
                firebase_uid: true,
                is_deleted: true,
                role_id: true
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    type RequestBody = {
        username?: string,
        avatar_url?: string,
        address_street?: string,
        address_ward?: string,
        address_city?: string,
        address_country?: string,
        gender?: 'male' | 'female' | 'others',
    }
    // @ts-ignore
    const { id, company_id } = req.user;
    const { username, avatar_url, address_street, address_ward, address_city, address_country, gender } = req.body as RequestBody

    if (username && username?.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Tên người dùng quá ngắn, tối thiểu 10 ký tự!"));
    }

    if (avatar_url && !avatar_url?.includes("http")) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ảnh đại diện không hợp lệ!"));
    }

    if (gender && (gender !== 'male' && gender !== 'female' && gender !== 'others')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Giới tính không hợp lệ!"));
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.users.update({
                where: {
                    id
                },
                data: {
                    username,
                    avatar_url,
                    address_street,
                    address_ward,
                    address_city,
                    address_country,
                    gender
                },
                include: {
                    companies: company_id ? {
                        select: {
                            jobs: {
                                select: {
                                    _count: {
                                        select: {
                                            applicants: {
                                                where: {
                                                    status: 'pending'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } : false,
                    roles: {
                        select: {
                            role_name: true
                        }
                    },
                    events: {
                        where: {
                            status: 'approved',
                        },
                        select: {
                            _count: {
                                select: {
                                    volunteers: {
                                        where: {
                                            status: 'pending'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            userNotifications: {
                                where: {
                                    is_read: false
                                }
                            }
                        }
                    }
                },
                omit: {
                    password: true,
                    firebase_uid: true,
                    is_deleted: true,
                    role_id: true
                }
            });



            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã cập nhật hồ sơ cá nhân`,
                    user_id: id
                }
            });

            return user;
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getUserNotification = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    let page = parseInt(req.query.page as string || '1');
    const numberOfNotifications = 20;

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số trang không hợp lệ!"));
    }

    page -= 1;

    try {
        const totalNotifications = await prisma.userNotifications.count({
            where: {
                user_id
            }
        });

        const notifications = await prisma.userNotifications.findMany({
            where: {
                user_id
            },
            orderBy: {
                sent_at: 'desc'
            },
            take: numberOfNotifications,
            skip: page * numberOfNotifications
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: notifications,
            totalPages: Math.ceil(totalNotifications / numberOfNotifications)
        });
    } catch (error) {
        next(error);
    }
}

export const updateUserNotification = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const { notification_id } = req.body as { notification_id: number };

    if (notification_id < 1 || isNaN(notification_id)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mã thông báo không hợp lệ"));
    }

    try {
        const isNotificationExisted = await prisma.userNotifications.findUnique({
            where: {
                id_user_id: {
                    user_id,
                    id: notification_id
                }
            }
        });

        if (!isNotificationExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy thông báo!"));
        }

        const notification = await prisma.userNotifications.update({
            where: {
                id_user_id: {
                    id: notification_id,
                    user_id
                }
            },
            data: {
                is_read: true,
                read_at: new Date()
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: notification
        })
    } catch (error) {
        next(error);
    }
}

export const getUserActivityHistory = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    let page = parseInt(req.query.page as string || '1');
    const numberOfActivities = 20;

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số trang không hợp lệ!"));
    }

    page -= 1;

    try {
        const totalActivities = await prisma.userActivitiesHistory.count({
            where: {
                user_id
            }
        });

        const activities = await prisma.userActivitiesHistory.findMany({
            where: {
                user_id
            },
            orderBy: {
                time: 'desc'
            },
            take: numberOfActivities,
            skip: page * numberOfActivities
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: activities,
            totalPages: Math.ceil(totalActivities / numberOfActivities)
        });
    } catch (error) {
        next(error);
    }
}

export const getAllUserSavedJobs = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;

    try {
        const savedJobs = await prisma.savedJobs.findMany({
            where: {
                user_id
            },
            select: {
                jobs: {
                    select: {
                        id: true,
                        job_title: true,
                        salary: true,
                        currency: true,
                        location: true,
                        status: true,
                        companies: {
                            select: {
                                users: {
                                    select: {
                                        avatar_url: true,
                                        username: true,
                                    }
                                }
                            }
                        },
                        jobCategories: {
                            select: {
                                job_category: true
                            }
                        },
                        jobLabels: {
                            select: {
                                label_name: true
                            }
                        },
                        savedJobs: user_id ? {
                            where: {
                                user_id: user_id
                            }
                        } : false,
                        applicants: user_id ? {
                            where: {
                                cvs: {
                                    users_id: user_id
                                }
                            },
                        } : false
                    }
                },
                saved_at: true,
            },
            orderBy: {
                saved_at: 'desc'
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: savedJobs
        });
    } catch (error) {
        next(error);
    }
}

export const getAllUserFollowedCompanies = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;

    try {
        const followedCompanies = await prisma.followedCompanies.findMany({
            where: {
                user_id
            },
            include: {
                companies: {
                    select: {
                        id: true,
                        is_verified: true,
                        users: {
                            select: {
                                username: true,
                                avatar_url: true,
                                address_city: true,
                            }
                        },
                        _count: {
                            select: {
                                jobs: true,
                                followedCompanies: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: followedCompanies
        });
    } catch (error) {
        next(error);
    }
}

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const { title, description } = req.body as { title: string, description?: string };

    try {
        const report = await prisma.reports.create({
            data: {
                user_id,
                title,
                description,
            }
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
}