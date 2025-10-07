import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_MODEL } from "../config/env.config";

const prisma = new PrismaClient();

export const followCompany = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id as string;
    const company_id = req.params.companyId;

    // @ts-ignore
    if (req.user.company_id === company_id) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You cannot follow your self!"));
    }

    try {
        const isCompanyExisted = await prisma.companies.findFirst({
            where: {
                id: company_id,
                status: "approved"
            },
            include: {
                followedCompanies: {
                    where: {
                        user_id
                    },
                }
            }
        });

        if (!isCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Company not found!"));
        }

        if (isCompanyExisted.followedCompanies.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Already followed!"));
        }

        await prisma.followedCompanies.create({
            data: {
                company_id,
                user_id,
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            message: "Successfully!"
        })
    } catch (error) {
        next(error);
    }
}

export const saveJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id, company_id } = req.user;
    const job_id = req.params.jobId;

    try {
        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: job_id
            },
            include: {
                savedJobs: {
                    where: {
                        user_id: id
                    },
                },
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Job not found!"));
        }

        if (isJobExisted.company_id === company_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You cannot save yours job!"));
        }

        if (isJobExisted.savedJobs.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already saved this job!"));
        }

        await prisma.savedJobs.create({
            data: {
                job_id,
                user_id: id
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            message: "Successfully!"
        });
    } catch (error) {
        next(error);
    }
}

export const applyJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id, company_id } = req.user;
    const job_id = req.params.jobId
    const { cv_id, description } = req.body;

    if (description && description.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Description must be at least 10"));
    }

    try {
        const isCvExisted = await prisma.cvs.findFirst({
            where: {
                id: cv_id,
                users_id: id
            }
        });

        if (!isCvExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "This cv is not found!"));
        }

        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: job_id
            },
            include: {
                applicants: {
                    where: {
                        cv_id
                    }
                },
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Not found jobs"));
        }

        if (isJobExisted.company_id === company_id) {
            return next(errorHandler(HTTP_ERROR.BAD_GATEWAY, "You cannot apply yours job!"));
        }

        if (isJobExisted.applicants.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already apply for this jobs!"));
        }

        await prisma.applicants.create({
            data: {
                cv_id,
                job_id,
                description
            }
        }).catch((e) => (next(errorHandler(HTTP_ERROR.CONFLICT, "Failed to apply to this job, try again!"))));

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true
        })
    } catch (error) {
        next(error);
    }
}

export const feedbackCompany = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const company_id = req.params.companyId;
    const { description, stars, benefit, work_environment }: { description: string, stars: number, benefit: string, work_environment: string } = req.body;

    // @ts-ignore
    if (req.user.company_id === company_id) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You cannot feedback your self!"));
    }

    if (description.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Description must be at least 10"));
    }

    if (stars < 1 || stars > 5) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Rating stars must be between 1 to 5!"));
    }

    if (benefit && benefit.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Benefit must be at least 10"));
    }

    if (work_environment && work_environment.length < 10) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Work environemnt must be at least 10"));
    }

    try {
        const isCompanyExisted = await prisma.companies.findFirst({
            where: {
                id: company_id,
                status: "approved"
            },
            include: {
                feedbacks: {
                    where: {
                        user_id
                    },
                }
            }
        });

        if (!isCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Not found company!"));
        }

        if (isCompanyExisted.feedbacks.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already feedback!"));
        }

        const feedback = await prisma.feedbacks.create({
            data: {
                description,
                stars,
                benefit,
                work_environment,
                company_id,
                user_id
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: feedback
        })
    } catch (error) {
        next(error);
    }
}

export const getLastestUserChat = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;

    try {
        const messages = await prisma.messages.findMany({
            where: {
                user_id
            },
            take: 20
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: messages
        });
    } catch (error) {
        next(error);
    }
}

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    // @ts-ignore
    const user_id = req.user.id;
    const { content } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: "Bạn là trợ lý ảo của BRIPATH, ứng dụng tìm việc và tuyển dụng online." },
                { role: "user", content: content }
            ],
        });

        if (response.choices[0].message) {
            const message = await prisma.messages.create({
                data: {
                    user_id,
                    message_content: content,
                    response_content: response.choices[0].message.content
                }
            });

            return res.status(HTTP_SUCCESS.OK).json({
                data: message
            });
        }

        return res.status(HTTP_ERROR.CONFLICT).json({
            message: "Something went wrong! Please try again"
        });
    } catch (error) {
        next(error);
    }
}

export const applyEvent = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const event_id = req.params.eventId;

    const { description } = req.body;

    if (!description || description.length < 20) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Description must be at least 20 character"));
    }

    try {
        const isEventExisted = await prisma.events.findFirst({
            where: {
                id: event_id,
                status: "approved"
            },
            include: {
                volunteers: {
                    where: {
                        user_id
                    }
                }
            }
        });

        if (!isEventExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Not found event!"));
        }

        if (isEventExisted.user_id === user_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You can not apply your event!"));
        }

        if (isEventExisted.volunteers.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already volunteered"));
        }

        await prisma.volunteers.create({
            data: {
                event_id,
                user_id,
                description
            }
        }).catch((e) => (errorHandler(HTTP_ERROR.CONFLICT, "Failed to apply this event, try again!")));

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true
        });
    } catch (error) {
        next(error);
    }
}

export const feedbackJob = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const job_id = req.params.jobId;
    const { cv_id, is_good }: { cv_id: number, is_good: boolean } = req.body;

    try {
        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: job_id
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy công việc!"));
        }

        const isCvExisted = await prisma.cvs.findFirst({
            where: {
                id: cv_id,
                users_id: user_id
            },
            include: {
                aiFeedbacks: {
                    where: {
                        job_id,
                        role: "User"
                    }
                }
            }
        });

        if (!isCvExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy CV!"));
        }

        if (isCvExisted.aiFeedbacks.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn đã phản hồi công việc này cho CV này!"));
        }

        const feedback = await prisma.aiFeedbacks.create({
            data: {
                cv_id,
                job_id,
                role: "User",
                is_good,
            }
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        next(error);
    }
}
