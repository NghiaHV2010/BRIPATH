import { PrismaClient } from "@prisma/client";

export const activityRepository = {
    create: async (tx: PrismaClient, userId: string, activity_name: string) => {
        await tx.userActivitiesHistory.create({
            data: {
                user_id: userId,
                activity_name
            }
        });
    }
};
