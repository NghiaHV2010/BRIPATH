import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { errorHandler } from "../utils/error";

const prisma = new PrismaClient();
const numberOfCompanies = 10;

export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const { id, company_id } = req.user;
        const { fax_code, business_certificate, company_type } = req.body;

        const isPhoneVerified = await prisma.users.findFirst({
            where: {
                id: id
            },
            select: {
                phone_verified: true,
            }
        });

        console.log(isPhoneVerified);


        if (!isPhoneVerified?.phone_verified) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn chưa xác thực số điện thoại!"));
        }

        const isFaxCodeExisted = await fetch(
            `https://api.vietqr.io/v2/business/${fax_code}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const faxCodeData = await isFaxCodeExisted.json();


        if (!faxCodeData.data) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mã số thuế không hợp lệ!"));
        }

        if (!business_certificate) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng tải lên giấy phép kinh doanh!"));
        }

        const company = await prisma.companies.create({
            data: {
                fax_code,
                business_certificate,
                company_type,
                users: {
                    connect: { id: id }
                },
            }
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            message: "Tạo công ty thành công! Vui lòng chờ duyệt.",
            data: company
        });

    } catch (error) {
        next(error);
    }
}

export const createCompanyLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { label_name } = req.body as { label_name?: string };

        if (!label_name || typeof label_name !== 'string') {
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "label_name is required"));
        }

        const name = label_name.trim();

        if (name.length === 0) {
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "label_name cannot be empty"));
        }

        if (name.length > 100) {
            return next(errorHandler(HTTP_ERROR.UNPROCESSABLE_ENTITY, "label_name must be at most 100 characters"));
        }

        const existed = await prisma.companyLabels.findFirst({
            where: { label_name: name }
        });

        if (existed) {
            return next(errorHandler(HTTP_ERROR.CONFLICT, "Label already exists"));
        }

        const created = await prisma.companyLabels.create({
            data: { label_name: name }
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            data: created
        });
    } catch (error) {
        next(error);
    }
}

export const getAllCompanies = async (req: Request, res: Response, next: NextFunction) => {
    let page: number = parseInt(req.query?.page as string);
    const user_id: string = req.query?.userId as string;

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Invalid page!"));
    }

    page -= 1;

    try {

        const total_companies = await prisma.companies.count();
        const companies = await prisma.companies.findMany({
            where: {
                status: "approved"
            },
            select: {
                id: true,
                company_type: true,
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
                companyLabels: {
                    select: {
                        label_name: true
                    }
                },
                fields: {
                    select: {
                        field_name: true
                    }
                },
                _count: {
                    select: {
                        jobs: true
                    }
                },
                followedCompanies: user_id ? {
                    where: {
                        user_id: user_id
                    }
                } : false
            },
            take: numberOfCompanies,
            skip: page * numberOfCompanies
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: companies,
            totalPages: Math.ceil(total_companies / numberOfCompanies)
        })
    } catch (error) {
        next(error);
    }
};

export const getCompanyByID = async (req: Request, res: Response, next: NextFunction) => {
    type RequestQuery = {
        companyId: string,
        userId?: string,
    };

    const { companyId, userId }: RequestQuery = req.query as RequestQuery;

    try {
        const company = await prisma.companies.findFirst({
            where: {
                id: companyId,
                status: "approved"
            },
            select: {
                id: true,
                background_url: true,
                description: true,
                employees: true,
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
                _count: {
                    select: {
                        followedCompanies: true,
                    }
                },
                companyLabels: {
                    select: {
                        label_name: true
                    }
                },
                feedbacks: {
                    select: {
                        stars: true,
                        description: true,
                        work_environment: true,
                        benefit: true,
                        created_at: true,
                        users: {
                            select: {
                                avatar_url: true,
                                gender: true,
                                username: true
                            }
                        }
                    }
                },
                fields: {
                    select: {
                        field_name: true
                    }
                },
                jobs: {
                    select: {
                        _count: true,
                        id: true,
                        job_title: true,
                        status: true,
                        location: true,
                        salary: true,
                        currency: true,
                        jobCategories: {
                            select: {
                                job_category: true
                            }
                        }
                    }
                },
                followedCompanies: userId ? {
                    select: {
                        is_notified: true,
                        followed_at: true,
                    },
                    where: {
                        user_id: userId
                    }
                } : false
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: company
        })
    } catch (error) {
        next(error);
    }
}

export const getCompaniesByFilter = async (req: Request, res: Response, next: NextFunction) => {
    type RequestQuery = {
        name?: string,
        location?: string,
        field?: string,
        userId?: string
    }

    const { name, location, field, userId }: RequestQuery = req.query;
    let page = parseInt(req.query?.page as string || '1');
    const filter: any[] = [];

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số trang không hợp lệ!"));
    }

    page -= 1;

    if (name) {
        filter.push({
            users: {
                is: {
                    username: {
                        contains: name,
                        mode: "insensitive"
                    }
                }
            }
        });
    }

    if (location) {
        filter.push({
            users: {
                is: {
                    address_city: {
                        contains: location,
                        mode: "insensitive"
                    }
                }
            }
        });
    }

    if (field) {
        filter.push({
            fields: {
                is: {
                    field_name: { equals: field }
                }
            }
        });
    }

    try {
        const companies = await prisma.companies.findMany({
            where: {
                AND: [
                    ...filter,
                    { status: "approved" }
                ]
            },
            select: {
                id: true,
                company_type: true,
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
                companyLabels: {
                    select: {
                        label_name: true
                    }
                },
                fields: {
                    select: {
                        field_name: true
                    }
                },
                _count: {
                    select: {
                        jobs: true
                    }
                },
                followedCompanies: userId ? {
                    where: {
                        user_id: userId
                    }
                } : false
            },
            take: numberOfCompanies,
            skip: page * numberOfCompanies
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: companies
        })
    } catch (error) {
        next(error);
    }
}

export const feedbackCV = async (req: Request, res: Response, next: NextFunction) => {
    const cvId: number = parseInt(req.params.cvId);
    const { is_good, job_id }: { is_good: boolean, job_id: string } = req.body;

    if (!cvId || isNaN(cvId)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "CV không hợp lệ!"));
    }

    try {
        const isCvExisted = await prisma.cvs.findFirst({
            where: {
                id: cvId
            },
            include: {
                aiFeedbacks: {
                    where: {
                        job_id,
                        role: "Company"
                    }
                }
            }
        });

        if (!isCvExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "CV không tồn tại"));
        }

        // Check if feedback already exists
        if (isCvExisted.aiFeedbacks.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Bạn đã phản hồi CV này cho công việc này rồi!"));
        }

        // Create feedback
        const feedback = await prisma.aiFeedbacks.create({
            data: {
                is_good,
                role: "Company",
                cv_id: cvId,
                job_id
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

export const getApplicantsByStatus = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { company_id } = req.user;
    const { jobId, status } = req.query as { jobId: string, status: string };

    if (!status || (status !== 'pending' && status !== 'approved' && status !== 'rejected')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ. Vui lòng chọn một trong các trạng thái: 'pending', 'approved', 'rejected'"));
    }

    try {
        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                company_id
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc không tồn tại!"));
        }

        const applicants = await prisma.applicants.findMany({
            where: {
                status,
                job_id: jobId
            },
            include: {
                cvs: true
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: applicants
        });
    } catch (error) {
        next(error);
    }
}

export const updateApplicantStatus = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { company_id } = req.user;
    const applicantId: number = parseInt(req.params.applicantId);
    const { job_id, feedback, status } = req.body as { job_id: string, feedback: string, status: string };
    if (!status || (status !== 'approved' && status !== 'rejected')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ. Vui lòng chọn một trong các trạng thái: 'approved', 'rejected'"));
    }

    if (!applicantId || isNaN(applicantId)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ứng viên không hợp lệ!"));
    }

    try {
        const isApplicantExisted = await prisma.applicants.findUnique({
            where: {
                cv_id_job_id: {
                    job_id,
                    cv_id: applicantId
                }
            },
            include: {
                jobs: true
            }
        });

        if (!isApplicantExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Ứng viên không tồn tại!"));
        }
        if (isApplicantExisted.jobs.company_id !== company_id) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn không có quyền cập nhật trạng thái cho ứng viên này!"));
        }
        if (isApplicantExisted.status !== 'pending') {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Chỉ có thể cập nhật trạng thái cho các ứng viên đang chờ duyệt!"));
        }

        const applicant = await prisma.applicants.update({
            where: {
                cv_id_job_id: {
                    job_id,
                    cv_id: applicantId
                }
            },
            data: {
                status,
                feedback,
                verified_date: new Date()
            },
            include: {
                cvs: true
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: applicant
        });
    } catch (error) {
        next(error);
    }
}

