import { NextFunction, Request, Response } from "express";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { errorHandler } from "../utils/error";
import { createNotificationData } from "../utils";
import { prisma } from "../libs/prisma";
import { redis } from "../libs/redis";
import { AuthUserRequestDto } from "src/types/auth.types";

const numberOfCompanies = 12;

export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
    type RequestBody = {
        fax_code: string,
        business_certificate: string,
        company_type: "business_househole" | "business",
        field: string
    }

    // @ts-ignore
    const { id, company_id } = req.user;
    const { fax_code, business_certificate, company_type, field } = req.body as RequestBody;

    try {
        const isFieldExisted = await prisma.fields.findUnique({
            where: {
                field_name: field
            }
        });

        if (!isFieldExisted) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Lĩnh vực không hợp lệ!"));
        }

        const isPhoneVerified = await prisma.users.findUnique({
            where: {
                id: id
            },
            select: {
                phone_verified: true,
                companies: company_id ? {
                    where: {
                        id: company_id
                    },
                    select: {
                        status: true,
                    }
                } : false
            }
        });

        if (!isPhoneVerified?.phone_verified) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn chưa xác thực số điện thoại!"));
        }

        if (isPhoneVerified.companies && (isPhoneVerified.companies.status === "pending" || isPhoneVerified.companies.status === "approved")) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Hồ sơ của bạn đang/đã được phê duyệt"));
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

        const faxCodeData = (await isFaxCodeExisted.json()) as { data?: unknown };


        if (!faxCodeData.data) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mã số thuế không hợp lệ!"));
        }

        if (!business_certificate) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng tải lên giấy phép kinh doanh!"));
        }
        const result = await prisma.$transaction(async (tx) => {
            const company = await tx.companies.upsert({
                where: {
                    id: company_id ? company_id : ''
                },
                update: {
                    fax_code,
                    business_certificate,
                    company_type,
                    status: "pending"
                },
                create: {
                    fax_code,
                    business_certificate,
                    company_type,
                    users: {
                        connect: { id: id }
                    },
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    activity_name: "Bạn đã tạo tài khoản doanh nghiệp.",
                    user_id: id
                }
            });

            const notificationData = createNotificationData(undefined, undefined, "system", "company");


            await tx.userNotifications.create({
                data: {
                    user_id: id,
                    type: notificationData.type,
                    title: notificationData.title,
                    content: notificationData.content
                }
            });
            return company;
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            message: "Tạo công ty thành công! Vui lòng chờ duyệt.",
            data: result
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
        const cacheKey = `companies:user:${user_id || 'guest'}:page:${page}`;

        const cachedCompanies = await redis.get(cacheKey);

        if (cachedCompanies) {
            return res.status(HTTP_SUCCESS.OK).json(JSON.parse(cachedCompanies));
        }

        const total_companies = await prisma.companies.count();
        const companies = await prisma.companies.findMany({
            where: {
                status: "approved"
            },
            select: {
                id: true,
                company_type: true,
                is_verified: true,
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
                companyTags: {
                    select: {
                        tags: {
                            select: {
                                label_name: true
                            }
                        }
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

        await redis.set(cacheKey, JSON.stringify({
            success: true,
            data: companies,
            totalPages: Math.ceil(total_companies / numberOfCompanies)
        }), 'EX', 300);

        return res.status(HTTP_SUCCESS.OK).json({
            data: companies,
            totalPages: Math.ceil(total_companies / numberOfCompanies)
        })
    } catch (error) {
        next(error);
    }
};

export const getCompanyByID = async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.query.companyId as string;
    const user_id = req.query.userId as string | undefined;
    let page = parseInt(req.query.page as string);

    if (page < 1 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trang không hợp lệ!"));
    }

    page -= 1;

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
                is_verified: true,
                latitude: true,
                longitude: true,
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
                        jobs: true
                    }
                },
                companyTags: {
                    select: {
                        tags: {
                            select: {
                                label_name: true
                            }
                        }
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
                                        username: true,
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
                    take: numberOfCompanies,
                    skip: page * numberOfCompanies,
                },
                followedCompanies: user_id ? {
                    select: {
                        is_notified: true,
                        followed_at: true,
                    },
                    where: {
                        user_id: user_id
                    }
                } : false
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: company,
            totalPages: company ? Math.ceil(company?._count.jobs / numberOfCompanies) : 0
        })
    } catch (error) {
        next(error);
    }
}

export const getRecommendedCompanies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Raw query to get recommended companies
        const companies = await prisma.$queryRawUnsafe(`
    SELECT 
        c.id,
        c.company_type,
        c.is_verified,
        u.username,
        u.avatar_url,
        u.address_street,
        u.address_ward,
        u.address_city,
        u.address_country,
        f.field_name,
        (
            SELECT COUNT(*)::int 
            FROM jobs j 
            WHERE j.company_id = c.id
        ) AS jobs_count,
        (
            SELECT json_agg(
                json_build_object('label_name', t.label_name)
            )
            FROM "companyTags" ct
            INNER JOIN tags t ON ct.tag_id = t.id
            WHERE ct.company_id = c.id
        ) AS "companyTags"
    FROM companies c
    INNER JOIN users u ON c.id = u.company_id
    LEFT JOIN fields f ON c.field_id = f.id
    LEFT JOIN "companyTags" ct ON c.id = ct.company_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    WHERE c.status = 'Chấp nhận'
      AND t.label_name = 'Đề xuất'
    ORDER BY RANDOM()
    LIMIT 3;
`);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: companies,
        });
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
                is_verified: true,
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
                companyTags: {
                    select: {
                        tags: {
                            select: {
                                label_name: true
                            }
                        }
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
    const { company_id } = req.user as AuthUserRequestDto;
    const { jobId } = req.params;
    const { page, status } = req.query as { page: string, status: string };
    const numberOfApplicantsToShow = 10;

    let pageNumber = parseInt(page);
    if (isNaN(pageNumber) || pageNumber < 1) {
        pageNumber = 1;
    }
    pageNumber -= 1;

    if (!status || (status !== 'pending' && status !== 'approved' && status !== 'rejected')) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ. Vui lòng chọn một trong các trạng thái: 'pending', 'approved', 'rejected'"));
    }

    try {
        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                company_id
            },
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc không tồn tại!"));
        }

        const applicantCounts = await prisma.applicants.groupBy({
            by: ['status'],
            where: {
                job_id: jobId
            },
            _count: {
                status: true
            }
        });

        const counts = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        };

        applicantCounts.forEach(item => {
            counts.total += item._count.status;
            if (item.status === 'pending') counts.pending = item._count.status;
            if (item.status === 'approved') counts.approved = item._count.status;
            if (item.status === 'rejected') counts.rejected = item._count.status;
        });


        const applicants = await prisma.applicants.findMany({
            where: {
                status,
                job_id: isJobExisted.id
            },
            include: {
                cvs: {
                    select: {
                        id: true,
                        fullname: true,
                        apply_job: true,
                        created_at: true,
                        primary_skills: true,
                        users: {
                            select: {
                                id: true,
                                avatar_url: true,
                            }
                        },
                        _count: {
                            select: {
                                projects: true,
                                experiences: true,
                                educations: true,
                                certificates: true,
                                languages: true,
                                references: true,
                                awards: true,
                            }
                        }
                    }
                }
            },
            take: numberOfApplicantsToShow,
            skip: pageNumber * numberOfApplicantsToShow
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                applicants,
                total_pending: counts.pending,
                total_approved: counts.approved,
                total_rejected: counts.rejected
            },
            totalPages: Math.ceil(counts.total / numberOfApplicantsToShow)
        });

    } catch (error) {
        next(error);
    }
}

export const updateApplicantStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { company_id } = req.user as AuthUserRequestDto;
    const { applicants } = req.body as {
        applicants: Array<{
            applicant_id: number;
            job_id: string;
            feedback?: string;
            status: 'approved' | 'rejected';
        }>
    };

    // Validate applicants array
    if (!applicants || !Array.isArray(applicants) || applicants.length === 0) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Danh sách ứng viên không hợp lệ!"));
    }

    // Validate each applicant object
    for (const applicant of applicants) {
        if (!applicant.applicant_id || isNaN(applicant.applicant_id)) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "ID ứng viên không hợp lệ!"));
        }
        if (!applicant.job_id) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "ID công việc không hợp lệ!"));
        }
        if (!applicant.status || (applicant.status !== 'approved' && applicant.status !== 'rejected')) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ. Vui lòng chọn 'approved' hoặc 'rejected'"));
        }
    }

    try {
        // Get all unique applicant IDs and job IDs for querying
        const applicantIds = applicants.map(a => a.applicant_id);
        const jobIds = [...new Set(applicants.map(a => a.job_id))];

        // Verify all applicants exist and belong to the company
        const existingApplicants = await prisma.applicants.findMany({
            where: {
                cv_id: {
                    in: applicantIds
                },
                job_id: {
                    in: jobIds
                }
            },
            include: {
                cvs: {
                    select: {
                        users_id: true,
                        fullname: true
                    }
                },
                jobs: {
                    select: {
                        company_id: true,
                        job_title: true
                    }
                }
            }
        });

        // Create a map for quick lookup
        const applicantMap = new Map(
            existingApplicants.map(a => [`${a.cv_id}-${a.job_id}`, a])
        );

        // Validate all requested applicants exist
        const missingApplicants: string[] = [];
        const invalidApplicants: string[] = [];
        const nonPendingApplicants: string[] = [];

        for (const applicant of applicants) {
            const key = `${applicant.applicant_id}-${applicant.job_id}`;
            const existing = applicantMap.get(key);

            if (!existing) {
                missingApplicants.push(`CV ID: ${applicant.applicant_id}, Job ID: ${applicant.job_id}`);
                continue;
            }

            if (existing.jobs.company_id !== company_id) {
                invalidApplicants.push(existing.cvs.fullname);
                continue;
            }

            if (existing.status !== 'pending') {
                nonPendingApplicants.push(existing.cvs.fullname);
            }
        }

        // Return validation errors
        if (missingApplicants.length > 0) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, `Không tìm thấy ứng viên: ${missingApplicants.join('; ')}`));
        }

        if (invalidApplicants.length > 0) {
            return next(errorHandler(HTTP_ERROR.FORBIDDEN, `Bạn không có quyền cập nhật trạng thái cho: ${invalidApplicants.join(', ')}`));
        }

        if (nonPendingApplicants.length > 0) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, `Chỉ có thể cập nhật ứng viên đang chờ duyệt. Ứng viên không phù hợp: ${nonPendingApplicants.join(', ')}`));
        }

        // Perform bulk update in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const updatePromises = applicants.map(async (applicant) => {
                const key = `${applicant.applicant_id}-${applicant.job_id}`;
                const existing = applicantMap.get(key)!;

                // Update individual applicant
                const updated = await tx.applicants.update({
                    where: {
                        cv_id_job_id: {
                            cv_id: applicant.applicant_id,
                            job_id: applicant.job_id
                        }
                    },
                    data: {
                        status: applicant.status,
                        feedback: applicant.feedback || null,
                        verified_date: new Date()
                    },
                    include: {
                        cvs: {
                            select: {
                                id: true,
                                fullname: true,
                                email: true,
                                users_id: true
                            }
                        }
                    }
                });

                // Create notification for this applicant
                const notificationData = createNotificationData(
                    existing.jobs.job_title,
                    applicant.status,
                    "applicant",
                    "user",
                    applicant.feedback
                );

                await tx.userNotifications.create({
                    data: {
                        user_id: existing.cvs.users_id,
                        title: notificationData.title,
                        content: notificationData.content,
                        type: notificationData.type,
                    }
                });

                return updated;
            });

            const updatedApplicants = await Promise.all(updatePromises);

            return {
                count: updatedApplicants.length,
                applicants: updatedApplicants
            };
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getAllApplicants = async (req: Request, res: Response, next: NextFunction) => {
    const { company_id } = req.user as AuthUserRequestDto;
    const { status } = req.query as { status?: 'pending' | 'approved' };
    const { jobId } = req.params;

    // Validate status
    if (status && status !== 'pending' && status !== 'approved') {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trạng thái không hợp lệ! Chỉ chấp nhận 'pending' hoặc 'approved'"));
    }

    try {
        // Verify job belongs to company
        const isJobExisted = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                company_id
            },
            select: {
                id: true,
                job_title: true
            }
        });

        if (!isJobExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc không tồn tại hoặc bạn không có quyền truy cập!"));
        }

        // Build where clause
        const whereClause: any = {
            job_id: jobId
        };

        if (status) {
            whereClause.status = status;
        }

        const applicants = await prisma.applicants.findMany({
            where: whereClause,
            include: {
                cvs: {
                    include: {
                        awards: true,
                        certificates: true,
                        projects: true,
                        educations: true,
                        experiences: true,
                        languages: true,
                        references: true,
                    }
                }
            },
            orderBy: {
                apply_date: 'desc'
            }
        });

        // Mask sensitive data for non-approved applicants
        const maskedApplicants = applicants.map(applicant => {
            const masked = { ...applicant };

            if (applicant.status !== 'approved') {
                // Mask phone
                if (masked.cvs.phone) {
                    const phone = masked.cvs.phone;
                    const lastFourDigits = phone.slice(-4);
                    const maskedPart = '*'.repeat(Math.max(phone.length - 4, 0));
                    masked.cvs.phone = maskedPart + lastFourDigits;
                }

                // Mask email
                if (masked.cvs.email) {
                    const email = masked.cvs.email;
                    const atIndex = email.indexOf('@');
                    if (atIndex > 0) {
                        const domainPart = email.substring(atIndex);
                        masked.cvs.email = '***' + domainPart;
                    }
                }

                // Mask address
                if (masked.cvs.address) {
                    const addressParts = masked.cvs.address.split(',').map(part => part.trim());
                    if (addressParts.length > 2) {
                        const lastTwoParts = addressParts.slice(-2).join(', ');
                        masked.cvs.address = lastTwoParts;
                    }
                }
            }
            return masked;
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                job_title: isJobExisted.job_title,
                applicants: maskedApplicants,
                total: maskedApplicants.length,
                status: status || 'all'
            }
        });
    } catch (error) {
        next(error);
    }
}


export const getAllCompanyFields = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fields = await prisma.fields.findMany();

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: fields
        })
    } catch (error) {
        next(error);
    }
}

export const getAllCompanyLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fields = await prisma.tags.findMany({
            select: { label_name: true }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: fields
        })
    } catch (error) {
        next(error);
    }
}

export const updateCompanyProfile = async (req: Request, res: Response, next: NextFunction) => {
    type RequestBody = {
        company_website?: string,
        description?: string,
        background_url?: string,
        employees?: number
    };

    // @ts-ignore
    const { id, company_id } = req.user;
    const { company_website, description, background_url, employees } = req.body as RequestBody;

    if (company_website && !company_website?.includes("http")) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Trang web không hợp lệ!"));
    }

    if (description && !description?.includes("http")) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mô tả không hợp lệ!"));
    }

    if (background_url && !background_url?.includes("http")) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Hình nền không hợp lệ!"));
    }

    if (employees && (employees < 1 || isNaN(employees))) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Số lượng nhân viên không hợp lệ!"));
    }

    try {
        const updateData: Partial<RequestBody> = {};

        if (company_website) {
            updateData.company_website = company_website;
        }
        if (description) {
            updateData.description = description;
        }
        if (background_url) {
            updateData.background_url = background_url;
        }
        if (employees) {
            updateData.employees = employees;
        }

        const result = await prisma.$transaction(async (tx) => {
            const company = await tx.companies.update({
                where: {
                    id: company_id
                },
                data: updateData,
                include: {
                    users: {
                        omit: {
                            password: true,
                            is_deleted: true,
                            firebase_uid: true
                        }
                    }
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    user_id: id,
                    activity_name: "Bạn vừa cập nhât hồ sơ"
                }
            });

            return company;
        })

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getFeedbackByCompanyID = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId } = req.params as { companyId: string };

        const feedbacks = await prisma.feedbacks.findMany({
            where: {
                company_id: companyId
            },
            include: {
                users: {
                    select: {
                        username: true,
                        avatar_url: true,
                        gender: true
                    }
                }
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: feedbacks
        });
    } catch (error) {
        next(error);
    }
}

export const compareCvandJob = async (req: Request, res: Response, next: NextFunction) => {
    const { cvId, jobId } = req.query as { cvId: string, jobId: string };

    try {
        const [cv, job] = await Promise.all([
            prisma.cv_stats.findUnique({
                where: {
                    cv_id: parseInt(cvId)
                },
            }),
            prisma.job_stats.findFirst({
                where: {
                    job_id: jobId,
                }
            })
        ]);
        if (!cv) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "CV không tồn tại!"));
        }
        if (!job) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc không tồn tại!"));
        }
        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                cv,
                job
            }
        });
    } catch (error) {
        next(error);
    }
}


export const getApplicantByID = async (req: Request, res: Response, next: NextFunction) => {
    const applicantId: number = parseInt(req.params.applicantId);
    const { jobId, status } = req.query as { jobId: string, status: 'pending' | 'approved' | 'rejected' };

    if (!applicantId || isNaN(applicantId)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Ứng viên không hợp lệ!"));
    }

    try {
        const isApplicantExisted = await prisma.applicants.findFirst({
            where: {
                job_id: jobId,
                cv_id: applicantId,
                status
            },
            include: {
                cvs: {
                    include: {
                        awards: true,
                        certificates: true,
                        projects: true,
                        educations: true,
                        experiences: true,
                        languages: true,
                        references: true,
                        users: {
                            select: {
                                avatar_url: true,
                            }
                        },
                    },
                }
            },
        });

        if (!isApplicantExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Ứng viên không tồn tại!"));
        }

        // Mask sensitive data if status is not 'approved'
        if (status !== 'approved') {
            if (isApplicantExisted.cvs.phone) {
                const phone = isApplicantExisted.cvs.phone;
                const lastFourDigits = phone.slice(-4);
                const maskedPart = '*'.repeat(Math.max(phone.length - 4, 0));
                isApplicantExisted.cvs.phone = maskedPart + lastFourDigits;
            }

            if (isApplicantExisted.cvs.email) {
                const email = isApplicantExisted.cvs.email;
                const atIndex = email.indexOf('@');
                if (atIndex > 0) {
                    const domainPart = email.substring(atIndex);
                    isApplicantExisted.cvs.email = '***' + domainPart;
                }
            }

            if (isApplicantExisted.cvs.address) {
                const addressParts = isApplicantExisted.cvs.address.split(',').map(part => part.trim());
                if (addressParts.length > 2) {
                    const lastTwoParts = addressParts.slice(-2).join(', ');
                    isApplicantExisted.cvs.address = lastTwoParts;
                } else if (addressParts.length > 0) {
                    // If less than or equal to 2 parts, just show them
                    isApplicantExisted.cvs.address = addressParts.join(', ');
                }
            }
        }

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: isApplicantExisted
        });
    } catch (error) {
        next(error);
    }
}

export const compareCvandJobStats = async (req: Request, res: Response, next: NextFunction) => {
    const { cvId, jobId } = req.params as { cvId: string, jobId: string };
    try {
        const [cv, job] = await Promise.all([
            prisma.cv_stats.findUnique({
                where: {
                    cv_id: parseInt(cvId)
                },
            }),
            prisma.job_stats.findFirst({
                where: {
                    job_id: jobId,
                }
            })
        ]);
        if (!cv) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "CV không tồn tại!"));
        }
        if (!job) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Công việc không tồn tại!"));
        }
        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                cv,
                job
            }
        });
    } catch (error) {
        next(error);
    }
}


export const filterSuitableApplicants = async (req: Request, res: Response, next: NextFunction) => {
    const { company_id } = req.user as AuthUserRequestDto;
    // @ts-ignore
    const { ai_matchings } = req.plan.membershipPlans;
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

        // Get suitable CV IDs with scores first
        const suitableCVsWithScores = await prisma.$queryRaw<Array<{ id: number; score: number; status: string }>>`
            SELECT 
                c.id,
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

        // Get the CV IDs
        const cvIds = suitableCVsWithScores.map(cv => cv.id);

        // Fetch full CV data with all required relations
        const suitableCVs = await prisma.cvs.findMany({
            where: {
                id: {
                    in: cvIds
                }
            },
            select: {
                id: true,
                fullname: true,
                apply_job: true,
                created_at: true,
                primary_skills: true,
                users: {
                    select: {
                        id: true,
                        avatar_url: true,
                    }
                },
                _count: {
                    select: {
                        projects: true,
                        experiences: true,
                        educations: true,
                        certificates: true,
                        languages: true,
                        references: true,
                        awards: true,
                    }
                }
            }
        });

        // Merge scores with CV data and sort by score
        const suitableCVsWithData = suitableCVs.map(cv => {
            const scoreData = suitableCVsWithScores.find(s => s.id === cv.id);
            return {
                ...cv,
                score: scoreData?.score || 0,
                status: scoreData?.status || 'pending'
            };
        }).sort((a, b) => b.score - a.score);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: suitableCVsWithData
        });
    } catch (error) {
        next(error);
    }
}

export const getAllSuitableApplicants = async (req: Request, res: Response, next: NextFunction) => {
    const { company_id } = req.user as AuthUserRequestDto;
    // @ts-ignore
    const { ai_matchings, ai_networking_limit } = req.plan.membershipPlans;
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

        // Get suitable CV IDs with scores first
        const suitableCVsWithScores = await prisma.$queryRaw<Array<{ id: number; score: number }>>`
            SELECT 
                c.id,
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

        // Get the CV IDs
        const cvIds = suitableCVsWithScores.map(cv => cv.id);

        // Fetch full CV data with all required relations
        const suitableCVs = await prisma.cvs.findMany({
            where: {
                id: {
                    in: cvIds
                }
            },
            select: {
                id: true,
                fullname: true,
                apply_job: true,
                created_at: true,
                primary_skills: true,
                users: {
                    select: {
                        id: true,
                        avatar_url: true,
                    }
                },
                _count: {
                    select: {
                        projects: true,
                        experiences: true,
                        educations: true,
                        certificates: true,
                        languages: true,
                        references: true,
                        awards: true,
                    }
                }
            }
        });

        // Merge scores with CV data and sort by score
        const suitableCVsWithData = suitableCVs.map(cv => {
            const scoreData = suitableCVsWithScores.find(s => s.id === cv.id);
            return {
                ...cv,
                score: scoreData?.score || 0
            };
        }).sort((a, b) => b.score - a.score);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: suitableCVsWithData
        });
    } catch (error) {
        next(error);
    }
}