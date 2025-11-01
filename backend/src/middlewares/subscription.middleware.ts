import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR } from "../constants/httpCode";
import { AuthUserRequestDto } from "../types/auth.types";
import { subscriptionRepository } from "../repositories/subscription.repository";

interface SubscriptionMiddlewareOptions {
    checkSlots?: boolean;
}

export const subscriptionMiddleware = (options: SubscriptionMiddlewareOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: user_id } = req.user as AuthUserRequestDto;
            const plan = await subscriptionRepository.findByUserId(user_id);

            if (!plan) {
                return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn chưa mua gói nào hoặc gói của bạn đã hết hạn."));
            }

            // If checkSlots is true, validate job posting limits
            if (options.checkSlots) {
                const { label_type } = req.body;

                if (label_type === "Việc Gấp" && plan.remaining_urgent_jobs <= 0) {
                    return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn đã hết lượt đăng 'Việc Gấp'."));
                }

                if (label_type === "Việc Chất" && plan.remaining_quality_jobs <= 0) {
                    return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn đã hết lượt đăng 'Việc Chất'."));
                }

                if (plan.remaining_total_jobs === 0) {
                    return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn đã hết lượt đăng công việc."));
                }
            }

            req.plan = plan;
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Usage examples:
// For permission check only: subscriptionMiddleware()
// For slot validation: subscriptionMiddleware({ checkSlots: true })