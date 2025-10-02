import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    let page: number = parseInt(req.query?.page as string);
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
        await prisma.events.create({
            data: {
                title,
                description,
                start_date: convert_startDate,
                user_id: user_id
            }
        }).catch((e) => next(errorHandler(HTTP_ERROR.CONFLICT, "Đã xảy ra lỗi, hãy thử lại!")));

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true
        })
    } catch (error) {
        next(error);
    }
}

