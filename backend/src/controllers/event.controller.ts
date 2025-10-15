import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { PrismaClient } from "../generated/prisma";
import { createNotificationData } from "../utils";

const prisma = new PrismaClient();

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    let page: number = parseInt(req.query?.page as string || '1');
    const user_id: string = req.query?.userId as string;

    const numberOfEvents = 10;

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số trang không hợp lệ!"));
    }

    page -= 1;

    try {
        const total_events = await prisma.events.count();
        const events = await prisma.events.findMany({
            take: numberOfEvents,
            skip: page * numberOfEvents,
            include: {
                volunteers: user_id ? {
                    where: {
                        user_id
                    }
                } : false
            },
            where: {
                status: 'approved'
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: events,
            totalPages: Math.ceil(total_events / numberOfEvents)
        });
    } catch (error) {
        next(error);
    }
}

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    type RequestBody = {
        title: string,
        description: string,
        start_date: string,
        end_date?: string,
        quantity?: number,
        working_time?: string,
        banner_url?: string,
    }

    // @ts-ignore
    const user_id = req.user.id;
    const { title, description, start_date, end_date, quantity, working_time, banner_url }: RequestBody = req.body;

    if (title.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Tiêu đề quá ngắn (tối thiểu 10 ký tự)"));
    }

    if (description.length < 20) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mô tả quá ngắn(tối thiểu 20 ký tự)"));
    }

    const convert_startDate = new Date(start_date);
    const convert_endDate = end_date ? new Date(end_date) : new Date();

    // @ts-ignore
    if (isNaN(convert_startDate)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ngày bắt đầu không hợp lệ!"));
    }

    // @ts-ignore
    if (end_date && isNaN(convert_endDate)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ngày kết thúc không hợp lệ!"));
    }

    if (convert_endDate < convert_startDate) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ngày kết thúc không thể trước ngày bắt đầu!"));
    }

    if (quantity && (isNaN(quantity) || quantity < 0)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số lượng tuyển không hợp lệ!"));
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const event = await tx.events.create({
                data: {
                    title,
                    description,
                    start_date: convert_startDate,
                    end_date: convert_endDate,
                    quantity,
                    working_time,
                    banner_url,
                    user_id: user_id
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã tạo sự kiện ${event.title} #${event.id}`,
                    user_id
                }
            });

            await tx.subscriptions.update({
                // @ts-ignore
                where: { id: req.plan.id },
                data: {
                    remaining_total_jobs: { decrement: 1 },
                }
            });

            const notificationData = createNotificationData(event.title, undefined, "system", "user");

            await tx.userNotifications.create({
                data: {
                    user_id,
                    title: notificationData.title,
                    content: notificationData.content,
                    type: notificationData.type,
                }
            });

            return event;
        }).catch((e) => next(errorHandler(HTTP_ERROR.CONFLICT, "Đã xảy ra lỗi, hãy thử lại!")));

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    type RequestBody = {
        title: string,
        description: string,
        start_date: string,
        end_date?: string,
        quantity?: number,
        working_time?: string,
        banner_url?: string,
    }

    // @ts-ignore
    const user_id = req.user.id;
    const { eventId } = req.params;
    const { title, description, start_date, end_date, quantity, working_time, banner_url }: RequestBody = req.body;

    if (title.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Tiêu đề quá ngắn (tối thiểu 10 ký tự)"));
    }

    if (description.length < 20) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mô tả quá ngắn(tối thiểu 20 ký tự)"));
    }

    const convert_startDate = new Date(start_date);
    const convert_endDate = end_date ? new Date(end_date) : new Date();

    // @ts-ignore
    if (isNaN(convert_startDate)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ngày bắt đầu không hợp lệ!"));
    }

    // @ts-ignore
    if (end_date && isNaN(convert_endDate)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ngày kết thúc không hợp lệ!"));
    }

    if (convert_endDate < convert_startDate) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ngày kết thúc không thể trước ngày bắt đầu!"));
    }

    if (quantity && (isNaN(quantity) || quantity < 0)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số lượng tuyển không hợp lệ!"));
    }

    try {
        const isEventExisted = await prisma.events.findFirst({
            where: {
                id: eventId,
                user_id
            }
        });

        if (!isEventExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Sự kiện không tồn tại!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const event = await tx.events.update({
                where: { id: eventId },
                data: {
                    title,
                    description,
                    start_date: convert_startDate,
                    end_date: convert_endDate,
                    quantity,
                    working_time,
                    banner_url
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã cập nhật sự kiện ${event.title} #${event.id}`,
                    user_id
                }
            });

            return event;
        }).catch((e) => next(errorHandler(HTTP_ERROR.CONFLICT, "Đã xảy ra lỗi, hãy thử lại!")));

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const { eventId } = req.params;

    try {
        const isEventExisted = await prisma.events.findFirst({
            where: {
                id: eventId,
                user_id
            }
        });

        if (!isEventExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Sự kiện không tồn tại!"));
        }

        await prisma.$transaction(async (tx) => {
            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã xóa sự kiện ${isEventExisted.title} #${isEventExisted.id}`,
                    user_id
                }
            });

            await tx.events.delete({
                where: { id: eventId }
            });
        }).catch((e) => next(errorHandler(HTTP_ERROR.CONFLICT, "Đã xảy ra lỗi, hãy thử lại!")));

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Xóa sự kiện thành công!"
        });
    } catch (error) {
        next(error);
    }
}

export const getVolunteersByStatus = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const { eventId, status } = req.query as { eventId: string, status: string };

    if (!status || (status !== 'pending' && status !== 'approved' && status !== 'rejected')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ. Vui lòng chọn một trong các trạng thái: 'pending', 'approved', 'rejected'"));
    }

    try {
        const isEventExist = await prisma.events.findFirst({
            where: {
                id: eventId,
                user_id,
                status: 'approved'
            }
        });

        if (!isEventExist) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Sự kiện không tồn tại hoặc đang chờ duyệt!"));
        }

        const volunteers = await prisma.volunteers.findMany({
            where: {
                status,
                event_id: eventId
            },
            include: {
                users: {
                    select: {
                        username: true,
                        gender: true,
                        avatar_url: true
                    }
                }
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: volunteers
        });
    } catch (error) {
        next(error);
    }
}

export const updateVolunteerStatus = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const { volunteerId } = req.params;
    const { event_id, feedback, status } = req.body as { event_id: string, feedback: string, status: string };

    if (!status || (status !== 'approved' && status !== 'rejected')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ. Vui lòng chọn một trong các trạng thái: 'approved', 'rejected'"));
    }

    try {
        const isVolunteerExist = await prisma.volunteers.findUnique({
            where: {
                event_id_user_id: {
                    user_id: volunteerId,
                    event_id,
                },
            },
            include: {
                events: true
            }
        });

        if (!isVolunteerExist) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Tình nguyện viên không tồn tại!"));
        }
        if (isVolunteerExist.events.user_id !== user_id) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn không có quyền cập nhật trạng thái cho tình nguyện viên này!"));
        }
        if (isVolunteerExist.status !== 'pending') {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Chỉ có thể cập nhật trạng thái cho các tình nguyện viên đang chờ duyệt!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const volunteer = await tx.volunteers.update({
                where: {
                    event_id_user_id: {
                        user_id: volunteerId,
                        event_id
                    }
                },
                data: {
                    status,
                    feedback,
                    verified_date: new Date()
                }
            });

            const notificationData = createNotificationData(isVolunteerExist.events.title, status, "applicant", 'user', feedback);

            await tx.userNotifications.create({
                data: {
                    user_id: volunteerId,
                    title: notificationData.title,
                    content: notificationData.content,
                    type: notificationData.type,
                }
            });

            return volunteer;
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getEventsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const userId = req.params.userId;
    let page: number = parseInt(req.query?.page as string || '1');
    const status = req.query?.status as string;

    if (!status || (status !== 'pending' && status !== 'approved' && status !== 'rejected')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ. Vui lòng chọn một trong các trạng thái: 'pending', 'approved', 'rejected'"));
    }

    const numberOfEvents = 10;

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số trang không hợp lệ!"));
    }

    page -= 1;

    if (!userId || userId !== user_id) {
        return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn không có quyền truy cập sự kiện của người dùng này!"));
    }

    try {
        const total_events = await prisma.events.count({
            where: {
                user_id: userId,
            }
        });
        const events = await prisma.events.findMany({
            where: {
                user_id: userId,
                status,
            },
            include: {
                volunteers: status === 'approved' ? {
                    select: {
                        apply_date: true,
                        description: true,
                        status: true,
                        verified_date: true,
                        users: {
                            select: {
                                username: true,
                                avatar_url: true,
                                gender: true,

                            }
                        }
                    }
                } : false
            },
            take: numberOfEvents,
            skip: page * numberOfEvents,
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: events,
            totalPages: Math.ceil(total_events / numberOfEvents)
        });
    } catch (error) {
        next(error);
    }
}

