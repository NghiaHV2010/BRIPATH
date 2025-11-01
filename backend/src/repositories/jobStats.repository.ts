import { PrismaClient } from "@prisma/client";
import { JobStats } from "../types/job.types";

export const jobStatsRepository = {
    //Create job stats
    create: async (tx: PrismaClient, job_id: string, stats: JobStats) => {
        return tx.job_stats.create({
            data: {
                ...stats,
                job_id,
            }
        });
    }
}