import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { HTTP_SUCCESS } from "../constants/httpCode";

const prisma = new PrismaClient();

export const getAllPricings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const plans = await prisma.membershipPlans.findMany({
            include: {
                features: true
            }
        });

        const formattedPlans = plans.map(plan => ({
            ...plan,
            price: plan.price ? Number(plan.price) : 0,
        }));

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: formattedPlans,
        })
    } catch (error) {
        next(error);
    }
};
