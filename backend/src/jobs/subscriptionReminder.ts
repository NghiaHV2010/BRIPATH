import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { createNotificationData, sendEmail } from "../utils";

const mockSubscriptions = [
    // ✅ Sắp hết hạn 3 ngày (2025-09-28)
    {
        id: "sub-001",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-09-29"),
        amount_paid: BigInt(500000),
        is_extended: false,
        status: "on_going",
        user_id: "user-001",
        plan_id: 1,
        payment_id: "pay-001",
        users: { id: "user-001", email: "exe1@edu.vn", fullname: "Dung" },
        membershipPlans: { id: 1, plan_name: "Basic Plan" }
    },

    // ✅ Sắp hết hạn 1 ngày (2025-09-26)
    {
        id: "sub-002",
        start_date: new Date("2025-09-10"),
        end_date: new Date("2025-09-27"),
        amount_paid: BigInt(800000),
        is_extended: false,
        status: "on_going",
        user_id: "user-002",
        plan_id: 2,
        payment_id: "pay-002",
        users: { id: "user-002", email: "exe2@gmail.com", fullname: "Khang" },
        membershipPlans: { id: 2, plan_name: "Pro Plan" }
    },

    // ❌ Đã hết hạn (2025-09-20)
    {
        id: "sub-003",
        start_date: new Date("2025-08-20"),
        end_date: new Date("2025-09-20"),
        amount_paid: BigInt(300000),
        is_extended: false,
        status: "expired",
        user_id: "user-003",
        plan_id: 1,
        payment_id: "pay-003",
        users: { id: "user-003", email: "user3@example.com", fullname: "Le Van C" },
        membershipPlans: { id: 1, plan_name: "Basic Plan" }
    },

    // ✅ Còn hạn dài (2025-10-30)
    {
        id: "sub-004",
        start_date: new Date("2025-09-15"),
        end_date: new Date("2025-10-30"),
        amount_paid: BigInt(1200000),
        is_extended: true,
        status: "on_going",
        user_id: "user-004",
        plan_id: 3,
        payment_id: "pay-004",
        users: { id: "user-004", email: "user4@example.com", fullname: "Pham Thi D" },
        membershipPlans: { id: 3, plan_name: "Premium Plan" }
    }
];

const checkSubscriptionRemainDate = async () => {
    const prisma = new PrismaClient();
    const today = new Date();
    // const today = new Date("2025-09-26");

    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const oneDayLater = new Date(today);
    oneDayLater.setDate(today.getDate() + 1);

    // const expireIn3Days = filterExpiring(mockSubscriptions, 3, today)

    // const expireIn1Day = filterExpiring(mockSubscriptions, 1, today)

    const expireIn3Days = await getExpireIn(threeDaysLater);

    const expireIn1Day = await getExpireIn(oneDayLater);

    // console.log("Sắp hết hạn 3 ngày:", filterExpiring(mockSubscriptions, 3, today));
    // console.log("Sắp hết hạn 1 ngày:", filterExpiring(mockSubscriptions, 1, today));

    for (const sub of expireIn3Days) {
        // console.log("3 days: ", sub);

        const notificationData = createNotificationData(sub.membershipPlans.plan_name, undefined, "pricing_plan", undefined, sub.end_date.toLocaleDateString('vi-VN'));

        await prisma.userNotifications.create({
            data: {
                user_id: sub.user_id,
                title: notificationData.title,
                content: notificationData.content,
                type: notificationData.type,
            }
        }).catch((error) => { console.error("Đã xảy ra lỗi, vui lòng thử lại!", error); });

        sendEmail(
            sub.users.email,
            `Nhắc nhở: Gói ${sub.membershipPlans.plan_name} sắp hết hạn`,
            `Gói của bạn sẽ hết hạn sau 3 ngày (ngày ${sub.end_date.toLocaleDateString('vi-VN')}).`
        );
    }

    for (const sub of expireIn1Day) {
        // console.log("1 day: ", sub);

        const notificationData = createNotificationData(sub.membershipPlans.plan_name, undefined, "pricing_plan", undefined, sub.end_date.toLocaleDateString('vi-VN'));

        await prisma.userNotifications.create({
            data: {
                user_id: sub.user_id,
                title: notificationData.title,
                content: notificationData.content,
                type: notificationData.type,
            }
        }).catch((error) => { console.error("Đã xảy ra lỗi, vui lòng thử lại!", error); });

        sendEmail(
            sub.users.email,
            `Khẩn cấp: Gói ${sub.membershipPlans.plan_name} sắp hết hạn`,
            `Gói của bạn sẽ hết hạn vào ngày mai (${sub.end_date.toLocaleDateString('vi-VN')}).`
        );
    }
}

function filterExpiring(subs: any[], daysBefore: number, today: Date) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysBefore);

    return subs.filter(sub =>
        sub.end_date.toDateString() === targetDate.toDateString()
    );
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