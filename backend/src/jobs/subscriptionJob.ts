import cron from "node-cron";
import { PrismaClient } from "../generated/prisma";
import { broadcastToClients } from "../libs/wsServer";

const prisma = new PrismaClient();

// Cron mỗi phút kiểm tra "Việc gấp" trong giờ vàng
cron.schedule("*/5 * * * *", async () => {
    const currentTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
    const vietnamTime = new Date(currentTimeString);
    const currentHour = vietnamTime.getHours();

    const isGoldenHour = (currentHour >= 12 && currentHour < 14) || (currentHour >= 19 && currentHour < 23);

    if (isGoldenHour) {
        const urgentJobs = await prisma.$queryRaw`
        SELECT  j.id,
                j.job_title,
                j.location
        FROM jobs j
        INNER JOIN "jobLabels" l ON j.label_id = l.id
        ORDER BY RANDOM()
        LIMIT 12;
        `.catch((error) => {
            console.error("Error fetching urgent jobs:", error);
            return [];
        });

        broadcastToClients({
            type: "urgentJobsUpdate",
            data: urgentJobs,
            timestamp: vietnamTime,
        });

        console.log(`📢 Sent urgent jobs to clients at ${vietnamTime.toLocaleTimeString("vi-VN")}`);
    }
}, { timezone: 'Asia/Ho_Chi_Minh' });

// Cron mỗi ngày lúc 0h: ẩn job hết hạn nhãn
cron.schedule("0 0 * * *", async () => {
    const Expriredsubscriptions = await prisma.subscriptions.updateMany({
        where: {
            end_date: { lt: new Date() },
            status: "on_going"
        },
        data: {
            status: "over_date",
        },
    }).catch((error) => {
        console.error("Error updating expired subscriptions:", error);
        return null;
    });

    await prisma.jobs.updateMany({
        where: { label_end_at: { lt: new Date() } },
        data: {
            label_id: null,
            label_start_at: null,
            label_end_at: null,
        },
    }).catch((error) => {
        console.error("Error resetting expired job labels:", error);
        return null;
    });

    console.log("🌙 Reset expired job labels at midnight");
}, { timezone: 'Asia/Ho_Chi_Minh' });
