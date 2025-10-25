import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { createNotificationData, sendEmail } from "../utils";
import { emailPricingNotificationTemplate } from "../constants/emailTemplate";

const checkSubscriptionRemainDate = async () => {
    const prisma = new PrismaClient();
    const today = new Date();

    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const oneDayLater = new Date(today);
    oneDayLater.setDate(today.getDate() + 1);


    const expireIn3Days = await getExpireIn(threeDaysLater);

    const expireIn1Day = await getExpireIn(oneDayLater);


    // Process 3-day expiration notifications
    if (expireIn3Days.length > 0) {
        // Prepare notifications data for bulk creation
        const notifications3Days = expireIn3Days.map(sub => {
            const notificationData = createNotificationData(sub.membershipPlans.plan_name, undefined, "pricing_plan", undefined, sub.end_date.toLocaleDateString('vi-VN'));
            return {
                user_id: sub.user_id,
                title: notificationData.title,
                content: notificationData.content,
                type: notificationData.type,
            };
        });

        // Bulk create notifications
        await prisma.userNotifications.createMany({
            data: notifications3Days,
            skipDuplicates: true
        }).catch((error) => { console.error("Đã xảy ra lỗi khi tạo thông báo 3 ngày:", error); });

        // Send bulk emails
        const emailPromises3Days = expireIn3Days.map(sub =>
            sendEmail(
                sub.users.email,
                `BRIPATH: Gói ${sub.membershipPlans.plan_name} còn 3 ngày hiệu lực`,
                emailPricingNotificationTemplate(sub.membershipPlans.plan_name, sub.end_date.toLocaleDateString('vi-VN'))
            ).catch((error) => {
                console.error(`Lỗi gửi email đến ${sub.users.email}:`, error);
                return null; // Continue with other emails even if one fails
            })
        );

        // Gửi song song tối đa 5 email một lúc (để tránh spam server)
        const chunkSize = 5;
        for (let i = 0; i < emailPromises3Days.length; i += chunkSize) {
            const chunk = emailPromises3Days.slice(i, i + chunkSize);
            await Promise.allSettled(chunk);
            console.log(`Đã xử lý ${Math.min(i + chunkSize, emailPromises3Days.length)}/${emailPromises3Days.length} email nhắc nhở 3 ngày`);
        }
        console.log(`Hoàn thành gửi ${expireIn3Days.length} email nhắc nhở 3 ngày`);
    }

    // Process 1-day expiration notifications
    if (expireIn1Day.length > 0) {
        // Prepare notifications data for bulk creation
        const notifications1Day = expireIn1Day.map(sub => {
            const notificationData = createNotificationData(sub.membershipPlans.plan_name, undefined, "pricing_plan", undefined, sub.end_date.toLocaleDateString('vi-VN'));
            return {
                user_id: sub.user_id,
                title: notificationData.title,
                content: notificationData.content,
                type: notificationData.type,
            };
        });

        // Bulk create notifications
        await prisma.userNotifications.createMany({
            data: notifications1Day,
            skipDuplicates: true
        }).catch((error) => { console.error("Đã xảy ra lỗi khi tạo thông báo 1 ngày:", error); });

        // Send bulk emails
        const emailPromises1Day = expireIn1Day.map(sub =>
            sendEmail(
                sub.users.email,
                `BRIPATH: Gói ${sub.membershipPlans.plan_name} chỉ còn 1 ngày hiệu lực`,
                emailPricingNotificationTemplate(sub.membershipPlans.plan_name, sub.end_date.toLocaleDateString('vi-VN'))
            ).catch((error) => {
                console.error(`Lỗi gửi email đến ${sub.users.email}:`, error);
                return null; // Continue with other emails even if one fails
            })
        );

        // Gửi song song tối đa 5 email một lúc (để tránh spam server)
        const chunkSize = 5;
        for (let i = 0; i < emailPromises1Day.length; i += chunkSize) {
            const chunk = emailPromises1Day.slice(i, i + chunkSize);
            await Promise.allSettled(chunk);
            console.log(`Đã xử lý ${Math.min(i + chunkSize, emailPromises1Day.length)}/${emailPromises1Day.length} email nhắc nhở 1 ngày`);
        }
        console.log(`Hoàn thành gửi ${expireIn1Day.length} email nhắc nhở 1 ngày`);
    }
}

const getExpireIn = async (daysLater: Date) => {
    const prisma = new PrismaClient();
    try {
        const data = await prisma.subscriptions.findMany({
            where: {
                end_date: {
                    gte: new Date(daysLater.setHours(0, 0, 0, 0)),
                    lt: new Date(daysLater.setHours(23, 59, 59, 999))
                }
            },
            include: {
                users: {
                    omit: {
                        password: true,
                        firebase_uid: true,
                        is_deleted: true,
                    }
                },
                membershipPlans: true
            }
        });

        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

cron.schedule('0 16 * * *', checkSubscriptionRemainDate, { timezone: 'Asia/Ho_Chi_Minh' });