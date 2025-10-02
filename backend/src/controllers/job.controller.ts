import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";

const prisma = new PrismaClient();
const numberOfJobs = 12;

export const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    let page: number = parseInt(req.query?.page as string);
    const user_id: string = req.query?.userId as string;

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_GATEWAY, "Invalid Page!"));
    }

    page -= 1;

    try {
        const total_jobs = await prisma.jobs.count();
        const jobs = await prisma.jobs.findMany({
            select: {
                id: true,
                job_title: true,
                salary: true,
                currency: true,
                location: true,
                status: true,
                categories: {
                    select: {
                        category_name: true
                    }
                },
                jobLabels: {
                    select: {
                        label_name: true
                    }
                },
                savedJobs: user_id ? {
                    where: {
                        user_id: user_id
                    }
                } : false
            },
            take: numberOfJobs,
            skip: page * numberOfJobs,
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: jobs,
            totalPages: Math.ceil(total_jobs / numberOfJobs)
        });
    } catch (error) {
        next(error);
    }
}

export const getJobByID = async (req: Request, res: Response, next: NextFunction) => {
    type RequestQuery = {
        jobId: string,
        userId?: string
    };

    const { jobId, userId }: RequestQuery = req.query as RequestQuery;

    try {
        const job = await prisma.jobs.findFirst({
            where: {
                id: jobId
            },
            include: {
                categories: {
                    select: {
                        category_name: true
                    }
                },
                jobLabels: {
                    select: {
                        label_name: true
                    }
                },
                savedJobs: userId ? {
                    where: {
                        user_id: userId
                    },
                    select: {
                        saved_at: true,
                    }
                } : false,
                applicants: userId ? {
                    where: {
                        cvs: {
                            users_id: userId
                        }
                    },
                    select: {
                        cv_id: true,
                        apply_date: true,
                        status: true,
                        description: true,
                    }
                } : false,
                companies: {
                    select: {
                        company_name: true,
                        logo_url: true,
                        address_street: true,
                        address_ward: true,
                        address_city: true,
                        address_country: true,
                        fields: {
                            select: {
                                field_name: true
                            }
                        },
                        followedCompanies: userId ? {
                            where: {
                                user_id: userId
                            }
                        } : false
                    }
                }
            },
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: job
        });
    } catch (error) {
        next(error);
    }
}

export const getJobsByFilter = async (req: Request, res: Response, next: NextFunction) => {
    type RequestQuery = {
        userId?: string,
        name?: string,
        field?: string,
        location?: string,
        salary?: string[],
    }

    const { userId, name, field, location, salary }: RequestQuery = req.query;
    let page: number = parseInt(req.query?.page as string || '1');
    const filters: any[] = [];

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số trang không hợp lệ!"));
    }

    page -= 1;

    if (name) {
        filters.push({
            job_title: { contains: name, mode: 'insensitive' }
        });
    }

    if (location) {
        filters.push({
            location: { contains: location, mode: 'insensitive' }
        });
    }

    if (salary && salary.length > 0) {
        filters.push({
            salary: { hasSome: salary }
        });
    }

    if (field) {
        filters.push({
            categories: {
                is: {
                    category_name: { equals: field }
                }
            }
        });
    }

    try {
        const jobs = await prisma.jobs.findMany({
            where: {
                AND: filters
            },
            select: {
                id: true,
                job_title: true,
                salary: true,
                currency: true,
                location: true,
                status: true,
                categories: {
                    select: {
                        category_name: true
                    }
                },
                jobLabels: {
                    select: {
                        label_name: true
                    }
                },
                savedJobs: userId ? {
                    where: {
                        user_id: userId
                    }
                } : false
            },
            take: numberOfJobs,
            skip: page * numberOfJobs
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: jobs
        })
    } catch (error) {
        next(error);
    }
}