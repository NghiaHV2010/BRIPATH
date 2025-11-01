import { PrismaClient } from "@prisma/client";
import { UserNotificationDto } from "../types/userNotification.types";

export const userNotificationRepository = {

    //Create user notification
    create: async (tx: PrismaClient, notificationData: UserNotificationDto) => {
        return tx.userNotifications.create({
            data: notificationData
        });
    },

    //Create many user notifications
    createMany: async (tx: PrismaClient, notificationsData: UserNotificationDto[]) => {
        return tx.userNotifications.createMany({
            data: notificationsData
        });
    }
}