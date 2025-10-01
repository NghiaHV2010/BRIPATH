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
        const events = await prisma.events.findMany({
            take: numberOfEvents,
            skip: Math.ceil(page * numberOfEvents),
            include: {
                volunteers: {
                    where: {
                        user_id
                    }
                }
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: events
        });
    } catch (error) {
        next(error);
    }
}

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    type RequestBody = {
        title: string,
        description: string,
        start_date: Date,
        end_date?: Date,
        quantity?: number,
        working_time?: string,
        banner_url?: string,
    }

    // @ts-ignore
    const user_id = req.user.id;
    const { title, description, start_date, end_date, quantity, working_time, banner_url }: RequestBody = req.body;

    try {

    } catch (error) {
        next(error);
    }
}