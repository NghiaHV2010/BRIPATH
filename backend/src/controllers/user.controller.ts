import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";

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
                id: company_id
            },
            include: {
                followedCompanies: {
                    where: {
                        user_id
                    },
                    select: {
                        user_id: true,
                        company_id: true
                    }
                }
            }
        });

        if (!isCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Company not found!"));
        }

        if (isCompanyExisted.followedCompanies[0]?.user_id) {
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
    const { id, company_id } = req.user.id;
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
                    select: {
                        job_id: true,
                        user_id: true
                    }
                },
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Job not found!"));
        }

        if (isJobExisted.company_id === company_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You cannot save yours job!"));
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

        if (isJobExisted.applicants[0]?.cv_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "You already apply for this jobs!"));
        }

        await prisma.applicants.create({
            data: {
                cv_id,
                job_id,
                description
            }
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
                id: company_id
            },
            include: {
                feedbacks: {
                    where: {
                        user_id
                    },
                    select: {
                        company_id: true,
                        user_id: true
                    }
                }
            }
        });

        if (!isCompanyExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Not found company!"));
        }

        if (isCompanyExisted.feedbacks[0]?.user_id) {
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

