import { PrismaClient } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { SubscriptionDto } from "../types/subscription.types";

export const subscriptionRepository = {
    //Update subscription remaining job posts
    updateRemainingJobs: async (tx: PrismaClient, subscription_id: string, remaining_urgent_jobs: number, remaining_quality_jobs: number, remaining_total_jobs: number) => {
        return tx.subscriptions.update({
            where: {
                id: subscription_id,
            },
            data: {
                remaining_urgent_jobs: {
                    decrement: remaining_urgent_jobs
                },
                remaining_quality_jobs: {
                    decrement: remaining_quality_jobs
                },
                remaining_total_jobs: {
                    decrement: remaining_total_jobs
                },
            }
        });
    },

    //Find by user ID
    findByUserId: async (user_id: string, subscription_id?: string): Promise<SubscriptionDto | null> => {
        return prisma.subscriptions.findFirst({
            where: {
                id: subscription_id,
                user_id,
                end_date: { gte: new Date() }, // gói còn hạn
                status: "on_going", // gói đang hoạt động
            },
            select: {
                id: true,
                remaining_urgent_jobs: true,
                remaining_quality_jobs: true,
                remaining_total_jobs: true,
                membershipPlans: {
                    select: {
                        ai_matchings: true,
                        ai_networking_limit: true
                    }
                }
            },
            orderBy: {
                remaining_total_jobs: 'desc'
            }
        });
    },
}