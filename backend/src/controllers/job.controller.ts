import { companies } from './../generated/prisma/index.d';
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { createNotificationData } from "../utils";
import { embeddingData } from "../utils/cvHandler";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
const numberOfJobs = 16;

export const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    let page: number = parseInt(req.query?.page as string);
    const user_id: string = req.query?.userId as string;

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_GATEWAY, "Trang không hợp lệ!"));
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
                companies: {
                    select: {
                        users: {
                            select: {
                                avatar_url: true,
                            }
                        }
                    }
                },
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
            success: true,
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
            jobCategories: {
                is: {
                    job_category: { equals: field }
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
                companies: {
                    select: {
                        users: {
                            select: {
                                avatar_url: true,
                            }
                        }
                    }
                },
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
        job_type?: 'remote' | 'part_time' | 'full_time' | 'others' | 'hybrid',
        status?: 'on_going',
        job_level: string,
        quantity?: number,
        skill_tags?: string[],
        education?: 'highschool_graduate' | 'phd' | 'master' | 'bachelor' | 'others',
        experience?: string,
        start_date: string,
        end_date?: string,
        category?: string,
        label_type?: 'Việc gấp' | 'Việc chất' | 'Việc Hot',
    }

    //@ts-ignore
    const { id, username, company_id } = req.user;


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
        label_type,
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

    let convert_endDate: Date | undefined = undefined;

    if (end_date) {
        convert_endDate = new Date(end_date);

        // @ts-ignore
        if (isNaN(convert_endDate)) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Sai định dạng ngày kết thúc(YYYY-MM-DD)"))
        }
    }

    try {
        let isLabelExisted: { id: number, duration_days: number | null } | null = null;
        let labelEndDate: Date | null = null;

        if (label_type) {
            isLabelExisted = await prisma.jobLabels.findUnique({
                where: {
                    label_name: label_type
                },
                select: {
                    id: true,
                    duration_days: true,
                }
            });

            if (!isLabelExisted) {
                return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Nhãn công việc không tồn tại!"));
            }

            labelEndDate = new Date();
            labelEndDate.setDate(labelEndDate.getDate() + (isLabelExisted.duration_days || 1));
        }

        const isJobCategoryExisted = await prisma.jobCategories.findUnique({
            where: {
                job_category: category
            }
        });

        if (!isJobCategoryExisted) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Danh mục công việc không tồn tại!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const job = await tx.jobs.create({
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
                    jobCategory_id: isJobCategoryExisted.id,
                    label_id: isLabelExisted ? isLabelExisted.id : null,
                    label_start_at: isLabelExisted ? new Date() : null,
                    label_end_at: isLabelExisted ? labelEndDate : null,
                },
                include: {
                    jobCategories: {
                        select: {
                            job_category: true
                        }
                    }
                }
            });

            await tx.subscriptions.update({
                // @ts-ignore
                where: { id: req.plan.id },
                data: {
                    ...(isLabelExisted && label_type === "Việc gấp" ?
                        { remaining_urgent_jobs: { decrement: 1 } } :
                        isLabelExisted && label_type === "Việc chất" &&
                        { remaining_quality_jobs: { decrement: 1 } }
                    ),
                    remaining_total_jobs: { decrement: 1 }
                },
            });

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã tạo công việc ${job.job_title} #${job.id}`,
                    user_id: id
                }
            });

            const usersFollowed = await tx.followedCompanies.findMany({
                where: {
                    company_id: company_id,
                    is_notified: true,
                },
                select: {
                    user_id: true,
                }
            });

            if (usersFollowed.length > 0) {
                const notificationData = createNotificationData(username, undefined, "followed", 'user');

                const notifications = usersFollowed.map((user) => ({
                    title: notificationData.title,
                    content: notificationData.content,
                    type: notificationData.type,
                    user_id: user.user_id,
                }));

                await tx.userNotifications.createMany({
                    data: notifications,
                });
            }

            const content = `
                Tiêu đề: ${job_title}.
                Kỹ năng: ${skill_tags?.toString()}.
                Kinh nghiệm: ${experience}.
                Học vấn: ${education}.
                Mô tả: ${description}.
                Địa chỉ: ${location}.
            `;

            const vector = await embeddingData(content);
            await tx.$queryRaw`UPDATE jobs SET embedding=${vector} WHERE id=${job.id}`;

            return job;
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error);
    }
}

export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
    type RequestBody = {
        job_title: string,
        description: string,
        location?: string,
        benefit?: string,
        working_time?: string,
        salary?: string[],
        currency?: string,
        job_type?: 'remote' | 'part_time' | 'full_time' | 'others' | 'hybrid',
        status?: 'over_due' | 'on_going',
        job_level: string,
        quantity?: number,
        skill_tags?: string[],
        education?: 'highschool_graduate' | 'phd' | 'master' | 'bachelor' | 'others',
        experience?: string,
        start_date: string,
        end_date?: string,
        category?: string,
    }

    //@ts-ignore
    const { id, company_id } = req.user;
    const { jobId } = req.params;

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

    try {
        const existedJob = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                company_id: company_id
            }
        });

        if (!existedJob) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc không tồn tại!"));
        }

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

        const jobCategory = await prisma.jobCategories.findUnique({
            where: {
                job_category: category
            }
        });

        if (!jobCategory) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Danh mục công việc không tồn tại!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const job = await tx.jobs.update({
                where: {
                    company_id,
                    id: jobId
                },
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

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã cập nhật công việc ${job.job_title} #${job.id}`,
                    user_id: id
                }
            });

            return job;
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error);
    }
}

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const { id, company_id } = req.user;
    const { jobId } = req.params;

    try {
        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                company_id
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Công việc không tồn tại!"));
        }

        await prisma.$transaction(async (tx) => {
            const job = await tx.jobs.delete({
                where: {
                    id: jobId
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: `Bạn đã xóa công việc ${job.job_title} #${job.id}`,
                    user_id: id
                }
            });

        });

        return res.status(HTTP_SUCCESS.NO_CONTENT);
    } catch (error) {
        next(error);
    }
}


export const getAllJobCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobCategories = await prisma.jobCategories.findMany();

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: jobCategories
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

export const getAllJobLabels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobLabels = await prisma.jobLabels.findMany();

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: jobLabels
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}


//Delete this
// export const createMockJob = async (req: Request, res: Response, next: NextFunction) => {
//     const {
//         job_title,
//         description,
//         location,
//         salary,
//         currency,
//         job_type,
//         status,
//         job_level,
//         quantity,
//         skill_tags,
//         education,
//         experience,
//         start_date,
//         company_id,
//         embedding
//     } = req.body;

//     if (!job_title) {
//         return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập tiêu đề"));
//     }

//     if (!job_level) {
//         return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập cấp bậc công việc"));
//     }

//     if (!start_date) {
//         return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập ngày bắt đầu"))
//     }

//     const convert_startDate = new Date(start_date);

//     // @ts-ignore
//     if (isNaN(convert_startDate)) {
//         return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Sai định dạng ngày bắt đầu(YYYY-MM-DD)"))
//     }

//     try {
//         const isExisted = await prisma.jobs.findFirst({
//             where: {
//                 job_title,
//                 company_id
//             }
//         });

//         if (isExisted) {
//             return res.status(HTTP_SUCCESS.OK).json({
//                 success: true,
//                 message: "This job is exited"
//             })
//         }

//         const job = await prisma.jobs.create({
//             data: {
//                 job_title,
//                 description: description ? description : "Không có",
//                 location,
//                 salary,
//                 currency,
//                 job_type,
//                 status,
//                 job_level,
//                 quantity,
//                 skill_tags,
//                 education,
//                 experience,
//                 start_date: convert_startDate,
//                 company_id,
//                 jobCategory_id: 19
//             }
//         });

//         await prisma.$queryRaw`UPDATE jobs SET embedding=${embedding} WHERE id=${job.id}`;

//         return res.status(HTTP_SUCCESS.CREATED).json({
//             success: true,
//             data: job.id
//         })
//     } catch (error) {
//         next(error);
//     }
// }

// export const createMockCompany = async (req: Request, res: Response, next: NextFunction) => {
//     const { logo, address, company_name, description, website }: { logo?: string, address?: string, company_name: string, description?: string, website?: string } = req.body;

//     try {
//         await prisma.$transaction(async (tx) => {
//             const isCompanyExited = await tx.users.findFirst({
//                 where: {
//                     username: company_name
//                 },
//             });

//             if (isCompanyExited) {
//                 return res.status(HTTP_SUCCESS.OK).json({
//                     success: false,
//                     data: isCompanyExited.company_id
//                 })
//             }

//             const mockemail = company_name.trim().split(' ').slice(-4);

//             const salt = await bcrypt.genSalt(10);
//             const hashPassword = await bcrypt.hash("123456", salt);

//             const user = await tx.users.create({
//                 data: {
//                     username: company_name,
//                     email: `${mockemail}@gmail.com`,
//                     password: hashPassword,
//                     avatar_url: logo,
//                     role_id: 2
//                 }
//             });

//             const company = await tx.companies.create({
//                 data: {
//                     description,
//                     status: "approved",
//                     fax_code: "0123456789",
//                     is_verified: true,
//                     company_website: website,
//                     users: {
//                         connect: {
//                             id: user.id
//                         }
//                     }
//                 }
//             })

//             return res.status(HTTP_SUCCESS.OK).json({
//                 success: true,
//                 data: company.id
//             })
//         })

//     } catch (error) {
//         next(error);
//     }
// }

export const filterSuitableCVforJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { company_id } = req.user;
    // @ts-ignore
    const { ai_matchings } = req.plan;
    const jobId = req.params.jobId;

    try {
        if (!ai_matchings) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Gói của bạn không có quyền sử dụng tính năng này!"));
        }

        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                company_id
            }
        });
        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc không tồn tại!"));
        }

        // Lấy ra tất cả các cv đã ứng tuyển mà phù hợp với job nhất
        const suitableCVs = await prisma.$queryRaw`
            SELECT 
                c.id,
                c.fullname,
                a.status,
                1 - (c.embedding <=> j.embedding) AS score
            FROM applicants a
            INNER JOIN cvs c ON a.cv_id = c.id
            CROSS JOIN (
                SELECT embedding
                FROM jobs
                WHERE id = ${jobId}
            ) AS j
            WHERE a.job_id = ${jobId} AND a.status = 'Đang chờ'
            ORDER BY score DESC
            LIMIT 20;
        `;

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: suitableCVs
        });
    } catch (error) {
        next(error);
    }
}

export const getAllSuitableCVs = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { company_id } = req.user;
    // @ts-ignore
    const { ai_matchings, ai_networking_limit } = req.plan;
    const jobId = req.params.jobId;

    try {
        if (!ai_matchings) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Gói của bạn không có quyền sử dụng tính năng này!"));
        }

        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                company_id
            }
        });
        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc không tồn tại!"));
        }

        // Lấy ra tất cả các cv bên ngoài phạm vi đã ứng tuyển mà phù hợp với job nhất
        const suitableCVs = await prisma.$queryRaw`
            SELECT 
                c.id,
                c.fullname,
                1 - (c.embedding <=> j.embedding) AS score
            FROM cvs c
            CROSS JOIN (
                SELECT embedding 
                FROM jobs 
                WHERE id = ${jobId}
            ) AS j
            WHERE c.id NOT IN (
                SELECT a.cv_id 
                FROM applicants a 
                WHERE a.job_id = ${jobId}
            )
            ORDER BY score DESC
            LIMIT ${ai_networking_limit};
        `;

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: suitableCVs
        });
    } catch (error) {
        next(error);
    }
}

