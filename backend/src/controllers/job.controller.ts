import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";

const prisma = new PrismaClient();

export const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    let page: number = parseInt(req.query?.page as string);
    const user_id: string = req.query?.userId as string;

    const numberOfJobs = 12;

    if (page - 1 < 0 || isNaN(page)) {
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
                savedJobs: {
                    where: {
                        user_id: user_id ? user_id : ''
                    }
                }
            },
            take: numberOfJobs,
            skip: page * numberOfJobs,

        });
        console.log(jobs);


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
                savedJobs: {
                    where: {
                        user_id: userId ? userId : ''
                    },
                    select: {
                        saved_at: true,
                    }
                },
                applicants: {
                    where: {
                        cvs: {
                            users_id: userId ? userId : ''
                        }
                    },
                    select: {
                        cv_id: true,
                        apply_date: true,
                        status: true,
                        description: true,
                    }
                },
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
                        followedCompanies: {
                            where: {
                                user_id: userId ? userId : ''
                            }
                        }
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