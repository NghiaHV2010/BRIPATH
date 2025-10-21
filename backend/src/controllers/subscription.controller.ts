import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';

const prisma = new PrismaClient();

export const getUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as { userId?: string };

    if (!userId) {
      return res.status(HTTP_ERROR.BAD_REQUEST).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const subscription = await prisma.subscriptions.findFirst({
      where: { user_id: userId },
      orderBy: { end_date: 'desc' }
    });

    if (!subscription) {
      return res.status(HTTP_SUCCESS.OK).json({ success: true, data: null });
    }

    const plan = await prisma.membershipPlans.findUnique({ where: { id: subscription.plan_id } });

    return res.status(HTTP_SUCCESS.OK).json({
      success: true,
      data: {
        id: subscription.id,
        user_id: subscription.user_id,
        plan_id: subscription.plan_id,
        plan_name: plan?.plan_name ?? null,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        status: subscription.status,
        amount_paid: Number(subscription.amount_paid),
        remaining_urgent_jobs: subscription.remaining_urgent_jobs,
        remaining_quality_jobs: subscription.remaining_quality_jobs,
        remaining_total_jobs: subscription.remaining_total_jobs,
        is_extended: subscription.is_extended,
      }
    });
  } catch (error) {
    next(error);
  }
};


