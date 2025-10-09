import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_MODEL } from "../config/env.config";

const prisma = new PrismaClient();

export const followCompany = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id as string;
    const company_id = req.params.companyId;

    // @ts-ignore
    if (req.user.company_id === company_id) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You cannot follow your self!"));
    }

    try {
        const isCompanyExisted = await prisma.companies.findFirst({
            where: {
                id: company_id,
                status: "approved"
            },
            include: {
                followedCompanies: {
                    where: {
                        user_id
                    },
                }
            }
        });

        if (!isCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Company not found!"));
        }

        if (isCompanyExisted.followedCompanies.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Already followed!"));
        }

        await prisma.followedCompanies.create({
            data: {
                company_id,
                user_id,
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            message: "Successfully!"
        })
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
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Job not found!"));
        }

        if (isJobExisted.company_id === company_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You cannot save yours job!"));
        }

        if (isJobExisted.savedJobs.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already saved this job!"));
        }

        await prisma.savedJobs.create({
            data: {
                job_id,
                user_id: id
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            message: "Successfully!"
        });
    } catch (error) {
        next(error);
    }
}

export const applyJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id, company_id } = req.user;
    const job_id = req.params.jobId
    const { cv_id, description } = req.body;

    if (description && description.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Description must be at least 10"));
    }

    try {
        const isCvExisted = await prisma.cvs.findFirst({
            where: {
                id: cv_id,
                users_id: id
            }
        });

        if (!isCvExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "This cv is not found!"));
        }

        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: job_id
            },
            include: {
                applicants: {
                    where: {
                        cv_id
                    }
                },
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Not found jobs"));
        }

        if (isJobExisted.company_id === company_id) {
            return next(errorHandler(HTTP_ERROR.BAD_GATEWAY, "You cannot apply yours job!"));
        }

        if (isJobExisted.applicants.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already apply for this jobs!"));
        }

        await prisma.applicants.create({
            data: {
                cv_id,
                job_id,
                description
            }
        }).catch((e) => (next(errorHandler(HTTP_ERROR.CONFLICT, "Failed to apply to this job, try again!"))));

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true
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
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You cannot feedback your self!"));
    }

    if (description.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Description must be at least 10"));
    }

    if (stars < 1 || stars > 5) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Rating stars must be between 1 to 5!"));
    }

    if (benefit && benefit.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Benefit must be at least 10"));
    }

    if (work_environment && work_environment.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Work environemnt must be at least 10"));
    }

    try {
        const isCompanyExisted = await prisma.companies.findFirst({
            where: {
                id: company_id,
                status: "approved"
            },
            include: {
                feedbacks: {
                    where: {
                        user_id
                    },
                }
            }
        });

        if (!isCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Not found company!"));
        }

        if (isCompanyExisted.feedbacks.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already feedback!"));
        }

        const feedback = await prisma.feedbacks.create({
            data: {
                description,
                stars,
                benefit,
                work_environment,
                company_id,
                user_id
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: feedback
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
                data: message
            });
        }

        return res.status(HTTP_ERROR.CONFLICT).json({
            message: "Something went wrong! Please try again"
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
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Description must be at least 20 character"));
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
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Not found event!"));
        }

        if (isEventExisted.user_id === user_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You can not apply your event!"));
        }

        if (isEventExisted.volunteers.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already volunteered"));
        }

        await prisma.volunteers.create({
            data: {
                event_id,
                user_id,
                description
            }
        }).catch((e) => (errorHandler(HTTP_ERROR.CONFLICT, "Failed to apply this event, try again!")));

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true
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
        const user = await prisma.users.update({
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

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: user
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
                is_read: true
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