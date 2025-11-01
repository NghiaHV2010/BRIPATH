import { errorHandler } from "../utils/error";
import { jobRepository } from "../repositories/job.repository";
import { HTTP_ERROR } from "../constants/httpCode";
import { CreateJobRequestDto, JobStats } from "../types/job.types";
import { jobLabelRepository } from "../repositories/jobLabel.repository";
import { jobCategoryRepository } from "../repositories/jobCategory.repository";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { JOBSTATSPROMPT } from "../constants/prompt";
import { analystDataStats, embeddingData } from "../utils/cvHandler";
import { createNotificationData } from "../utils";
import { activityRepository } from "../repositories/activity.repository";
import { jobStatsRepository } from "../repositories/jobStats.repository";
import { userNotificationRepository } from "../repositories/userNotification.repository";
import { followedCompanyRepository } from "../repositories/followedCompany.repository";
import { subscriptionRepository } from "../repositories/subscription.repository";

const numberOfJobs = 16;

export const getAllJobsService = async (page: number, user_id: string) => {
    try {
        const total_jobs = await jobRepository.count();
        const jobs = await jobRepository.getAll(page, numberOfJobs, user_id);
        return { jobs, total_jobs };
    } catch (error) {
        throw error;
    }
}

export const getJobByIDService = async (jobId: string, userId?: string) => {
    try {
        const job = await jobRepository.getByID(jobId, userId);

        if (!job) {
            throw errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy công việc!");
        }
        return job;
    } catch (error) {
        throw error;
    }
}

export const getJobsByFilterService = async (page: number, user_id: string, filter?: any) => {
    try {
        const total_jobs = await jobRepository.count(filter);
        const jobs = await jobRepository.getAll(page, numberOfJobs, user_id, filter);

        return { jobs, total_jobs };
    } catch (error) {
        throw error;
    }
}

export const getJobsByCompanyIdService = async (page: number, company_id: string) => {
    try {
        const total_jobs = await jobRepository.count(undefined, company_id);

        const jobs = await jobRepository.getByCompanyId(company_id, page, numberOfJobs);
        return { jobs, total_jobs };
    } catch (error) {
        throw error;
    }
}

export const getJobDetailsByCompanyIdService = async (jobId: string, company_id: string) => {
    try {
        const job = await jobRepository.getByID(jobId, undefined, company_id);

        if (!job) {
            throw errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy công việc!");
        }
        return job;
    } catch (error) {
        throw error;
    }
}

export const createJobService = async (jobData: CreateJobRequestDto, username: string, user_id: string, company_id: string, subscription_id: string): Promise<any> => {
    const { job_title,
        description,
        location,
        benefit,
        working_time,
        salary,
        currency,
        job_type,
        status,
        job_level,
        quantity,
        skill_tags,
        education,
        experience,
        start_date,
        end_date,
        label_type,
        category
    } = jobData;

    try {
        const [labelData, jobCategoryData] = await Promise.all([
            label_type ? jobLabelRepository.getByName(label_type) : Promise.resolve(null),
            category ? jobCategoryRepository.getByName(category) : Promise.resolve(null)
        ]);

        if (label_type && !labelData) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Nhãn công việc không tồn tại!");
        }

        if (category && !jobCategoryData) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Danh mục công việc không tồn tại!");
        }

        // Pre-calculate label end date if needed
        let labelEndDate: Date | null = null;
        if (labelData) {
            labelEndDate = new Date();
            labelEndDate.setDate(labelEndDate.getDate() + (labelData.duration_days || 1));
        }

        // Prepare content for AI processing (to be used later)
        const content = `
            Tiêu đề: ${job_title}.
            Kỹ năng: ${skill_tags?.toString()}.
            Kinh nghiệm: ${experience}.
            Học vấn: ${education}.
            Mô tả: ${description}.
            Địa chỉ: ${location}.
        `;

        const result = await prisma.$transaction(async (tx: PrismaClient) => {
            // Create job first
            const job = await jobRepository.create(tx, {
                job_title,
                description,
                location,
                benefit,
                working_time,
                salary,
                currency,
                job_type,
                status,
                job_level,
                quantity,
                skill_tags,
                education,
                experience,
                start_date,
                end_date,
                company_id,
                jobCategory_id: jobCategoryData?.id || null,
                label_id: labelData?.id || null,
                label_start_at: labelData ? new Date() : null,
                label_end_at: labelData ? labelEndDate : null,
            });

            // Parallel database operations for better performance
            const operations = [];

            // Subscription update
            operations.push(
                subscriptionRepository.updateRemainingJobs(
                    tx,
                    subscription_id,
                    labelData && label_type === "Việc gấp" ? 1 : 0,
                    labelData && label_type === "Việc chất" ? 1 : 0,
                    1
                )
            );

            // User activity history
            operations.push(
                activityRepository.create(tx, user_id, `Bạn đã tạo công việc ${job.job_title} #${job.id}`)
            );

            // Execute database operations in parallel
            await Promise.all(operations);

            // Get followed users for notifications
            const usersFollowed = await followedCompanyRepository.findUsersByCompanyId(tx, company_id);

            // Create notifications if there are followers
            if (usersFollowed.length > 0) {
                const notificationData = createNotificationData(username, undefined, "followed", 'user');

                const notifications = usersFollowed.map((user) => ({
                    title: notificationData.title,
                    content: notificationData.content,
                    type: notificationData.type,
                    user_id: user.user_id,
                }));

                userNotificationRepository.createMany(tx, notifications);
            }

            // AI processing in parallel - this is the most time-consuming part
            const [jobStatsResult, vector] = await Promise.all([
                analystDataStats(JOBSTATSPROMPT + content),
                embeddingData(content)
            ]);

            if (!jobStatsResult) {
                throw new Error('Failed to analyze CV stats');
            }

            const jobStats = jobStatsResult as JobStats;

            // Final database operations in parallel
            await Promise.all([
                jobRepository.updateEmbedding(tx, job.id, vector),
                jobStatsRepository.create(tx, job.id, jobStats),
            ]);

            return job;
        }, { timeout: 30000 });

        return result;
    } catch (error) {
        throw error;
    }
}