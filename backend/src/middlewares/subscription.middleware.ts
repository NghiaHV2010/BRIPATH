// middlewares/checkCompanyPlan.ts
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR } from "../constants/httpCode";

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const prisma = new PrismaClient();

    try {
        // @ts-ignore
        const user_id = req.user.id;
        const { label_type } = req.body; // 'Việc Gấp' hoặc 'Việc Chất'

        const plan = await prisma.subscriptions.findFirst({
            where: {
                user_id,
                end_date: { gte: new Date() }, // gói còn hạn
                status: "on_going", // gói đang hoạt động
            },
        });

        if (!plan) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn chưa mua gói nào hoặc gói của bạn đã hết hạn."));
        }

        // Kiểm tra slot
        if (label_type === "Việc Gấp" && plan.remaining_urgent_jobs <= 0) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn đã hết lượt đăng 'Việc Gấp'."));
        }

        if (label_type === "Việc Chất" && plan.remaining_quality_jobs <= 0) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn đã hết lượt đăng 'Việc Chất'."));
        }

        if (plan.remaining_total_jobs === 0) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn đã hết lượt đăng công việc."));
        }

        // @ts-ignore
        req.plan = plan;
        next();
    } catch (error) {
        next(error);
    }
};


export const subscriptionPermissionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const prisma = new PrismaClient();
    try {
        // @ts-ignore
        const user_id = req.user.id;
        const plan = await prisma.subscriptions.findFirst({
            where: {
                user_id,
                end_date: { gte: new Date() }, // gói còn hạn
                status: "on_going", // gói đang hoạt động
            },
            include: {
                membershipPlans: true
            }
        });

        if (!plan) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn chưa mua gói nào hoặc gói của bạn đã hết hạn."));
        }

        // @ts-ignore
        req.plan = plan.membershipPlans;
        next();
    } catch (error) {
        next(error);
    }
};