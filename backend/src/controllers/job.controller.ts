import e, { NextFunction, Request, Response } from "express";
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
                jobCategories: {
                    select: {
                        job_category: true
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
                } : false,
                applicants: user_id ? {
                    where: {
                        cvs: {
                            users_id: user_id
                        }
                    },
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
                id: jobId,
            },
            include: {
                jobCategories: {
                    select: {
                        job_category: true
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
                        id: true,
                        users: {
                            select: {
                                username: true,
                                avatar_url: true,
                                address_street: true,
                                address_ward: true,
                                address_city: true,
                                address_country: true,
                            }
                        },
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
                jobCategories: {
                    select: {
                        job_category: true
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
                } : false,
                applicants: userId ? {
                    where: {
                        cvs: {
                            users_id: userId
                        }
                    },
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

export const getJobsByCompanyId = async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.params.companyId;
    let page: number = parseInt(req.query?.page as string || '1');
    const user_id: string = req.query?.userId as string;


    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trang không hợp lệ!"));
    }

    page -= 1;
    try {

        const total_jobs = await prisma.jobs.count({
            where: {
                company_id: companyId
            }
        });

        const jobs = await prisma.jobs.findMany({
            where: {
                company_id: companyId
            },
            select: {
                id: true,
                job_title: true,
                salary: true,
                currency: true,
                location: true,
                status: true,
                jobCategories: {
                    select: {
                        job_category: true
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
                } : false,
                applicants: user_id ? {
                    where: {
                        cvs: {
                            users_id: user_id
                        }
                    },
                } : false,
                companies: user_id ? {
                    select: {
                        users: {
                            where: {
                                company_id: companyId,
                            }
                        }
                    }
                } : false
            },
            take: numberOfJobs,
            skip: page * numberOfJobs,
        });
        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: jobs,
            totalPages: Math.ceil(total_jobs / numberOfJobs)
        });
    } catch (error) {
        next(error);
    }
}

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
    type RequestBody = {
        job_title: string,
        description: string,
        location?: string,
        benefit?: string,
        working_time?: string,
        salary?: string[],
        currency?: string,
        job_type?: 'remote' | 'part_time' | 'full_time' | 'others',
        status?: 'over_due' | 'on_going',
        job_level: string,
        quantity?: number,
        skill_tags?: string[],
        education?: 'highschool_graduate' | 'phd' | 'mastter' | 'bachelor' | 'others',
        experience?: string,
        start_date: string,
        end_date?: string,
        category?: string,
    }

    //@ts-ignore
    const { company_id } = req.user;

    const {
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
        category,
    } = req.body as RequestBody;

    if (!job_title) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập tiêu đề"));
    }

    if (!description) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập mô tả"));
    }

    if (!job_level) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập cấp bậc công việc"));
    }

    if (!start_date) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập ngày bắt đầu"))
    }

    const convert_startDate = new Date(start_date);

    // @ts-ignore
    if (isNaN(convert_startDate)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Sai định dạng ngày bắt đầu(YYYY-MM-DD)"))
    }

    let convert_endDate: Date;

    if (end_date) {
        convert_endDate = new Date(end_date);
    }

    // @ts-ignore
    if (isNaN(convert_endDate)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Sai định dạng ngày kết thúc(YYYY-MM-DD)"))
    }

    try {
        const jobCategory = await prisma.jobCategories.findUnique({
            where: {
                job_category: category
            }
        });

        if (!jobCategory) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Danh mục công việc không tồn tại!"));
        }

        const job = await prisma.jobs.create({
            data: {
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
                jobCategory_id: jobCategory.id
            }
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: job
        })
    } catch (error) {
        next(error);
    }
}

export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
}