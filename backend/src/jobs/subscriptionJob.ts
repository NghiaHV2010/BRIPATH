import cron from "node-cron";
import { broadcastToClients } from "../libs/wsServer";
import { prisma } from "../libs/prisma";


// Cron mỗi 5 phút kiểm tra "Việc gấp" trong giờ vàng
cron.schedule("* * * * *", async () => {
    const currentTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
    const vietnamTime = new Date(currentTimeString);
    const currentHour = vietnamTime.getHours();

    const isGoldenHour = (currentHour >= 12 && currentHour < 14) || (currentHour >= 19 && currentHour < 24);

    if (isGoldenHour) {
        const urgentJobs = await prisma.$queryRaw`
        SELECT 
            j.id,
            j.job_title,
            j.salary,
            j.currency,
            j.location,
            j.status,
            jc.job_category,
            jl.label_name,
            u.avatar_url,
            u.username
        FROM jobs j
        LEFT JOIN "jobCategories" jc ON jc.id = j."jobCategory_id"
        LEFT JOIN "jobLabels" jl ON jl.id = j."label_id"
        LEFT JOIN companies c ON c.id = j."company_id"
        LEFT JOIN users u ON u."company_id" = c.id
        LEFT JOIN applicants a ON a.job_id = j.id
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
