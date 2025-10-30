import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HTTP_ERROR, HTTP_SUCCESS } from '../constants/httpCode';

const prisma = new PrismaClient();

export const getUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const user_id = req.user?.id;

    const subscriptions = await prisma.subscriptions.findMany({
      where: { user_id },
      include: {
        membershipPlans: true
      },
      orderBy: { end_date: 'desc' }
    });

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(HTTP_SUCCESS.OK).json({ success: true, data: [] });
    }

    const subscriptionData = subscriptions.map(subscription => ({
      id: subscription.id,
      plan_id: subscription.plan_id,
      plan_name: subscription.membershipPlans?.plan_name,
      plan_ai_networking_limit: subscription.membershipPlans.ai_networking_limit,
      plan_total_jobs_limit: subscription.membershipPlans.total_jobs_limit,
      plan_urgent_jobs_limit: subscription.membershipPlans.urgent_jobs_limit,
      plan_quality_jobs_limit: subscription.membershipPlans.quality_jobs_limit,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      status: subscription.status,
      amount_paid: Number(subscription.amount_paid),
      remaining_urgent_jobs: subscription.remaining_urgent_jobs,
      remaining_quality_jobs: subscription.remaining_quality_jobs,
      remaining_total_jobs: subscription.remaining_total_jobs,
      is_extended: subscription.is_extended,
    }));

    return res.status(HTTP_SUCCESS.OK).json({
      success: true,
      data: subscriptionData
    });
  } catch (error) {
    next(error);
  }
};


