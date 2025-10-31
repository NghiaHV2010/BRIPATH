import { NextFunction, Request, Response } from "express";
import { analystDataStats, embeddingData, extractTextFromCV, formatText } from "../utils/cvHandler";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { convertDate } from "../utils";
import { errorHandler } from "../utils/error";
import { CVSTATSPROMPT } from "../constants/prompt";
import { prisma } from "../libs/prisma";

interface IFILE {
    name: string;
    data: Buffer;
    size: number;
    mimetype: string;
}

interface CV {
    fullname: string;
    email?: string | undefined;
    phone?: string | undefined;
    dob?: string | undefined;
    address?: string | undefined;
    primarySkills?: string[] | undefined;
    projects: [
        {
            project_title: string,
            project_description?: string | undefined,
            project_startDate?: string | undefined;
            project_endDate?: string | undefined;
        }
    ];
    experiences: [
        {
            startDate?: string | undefined;
            endDate?: string | undefined;
            company?: string | undefined;
            title?: string | undefined;
            description?: string | undefined;
        }
    ];
    educations: [
        {
            startDate?: string | undefined;
            endDate?: string | undefined;
            school?: string | undefined;
            gpa?: string | undefined;
            graduate_type?: string | undefined;
        }
    ];
    certificates: [
        {
            startDate?: string | undefined;
            endDate?: string | undefined;
            name?: string | undefined;
            link?: string | undefined;
            description?: string | undefined;
        }
    ];
    summary?: string | undefined;
    languages: [
        {
            name: string;
            certificate?: string | undefined;
            level?: string | undefined;
        }
    ];
    apply_job?: string | undefined;
    career_goal?: string | undefined;
    softSkills?: string[] | undefined;
    references: [
        {
            name: string;
            phone?: string | undefined;
            email?: string | undefined;
        }
    ];
    awards: [
        {
            title: string;
            description?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
        }
    ];
}

interface CVStats {
    technical: number;
    communication: number;
    teamwork: number;
    problem_solving: number;
    creativity: number;
    leadership: number;
    summary: string
}

export const uploadCV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const user_id = req.user.id;
        let cv;

        const file: IFILE = req.files?.cv as IFILE;

        const rawText = await extractTextFromCV(file.data, file.mimetype);

        const formatedCV: CV = await formatText(rawText);

        const content = `
            Tiêu đề: ${formatedCV.apply_job}.
            Kỹ năng: ${formatedCV.primarySkills?.toString()}.
            Kinh nghiệm: ${JSON.stringify(formatedCV.experiences)}.
            Dự án: ${JSON.stringify(formatedCV.projects)}.
            Học vấn: ${JSON.stringify(formatedCV.educations)}.
            Chứng chỉ: ${JSON.stringify(formatedCV.certificates)}.
            Mô tả: ${formatedCV.summary || formatedCV.career_goal}.
            Địa chỉ: ${formatedCV.address}.
            `;

        const [vector, cvStatsResult] = await Promise.all([
            embeddingData(content),
            analystDataStats(CVSTATSPROMPT + JSON.stringify(formatedCV))
        ]);

        if (!cvStatsResult) {
            throw new Error('Failed to analyze CV stats');
        }

        // @ts-ignore
        const cvStats: CVStats = cvStatsResult as CVStats;

        await prisma.$transaction(async (tx) => {
            cv = await tx.cvs.create({
                data: {
                    users_id: user_id,
                    fullname: formatedCV.fullname,
                    email: formatedCV.email,
                    phone: formatedCV.phone,
                    address: formatedCV.address,
                    primary_skills: formatedCV.primarySkills,
                    soft_skills: formatedCV.softSkills,
                    apply_job: formatedCV.apply_job,
                    career_goal: formatedCV.career_goal,
                    introduction: formatedCV.summary,
                    awards: {
                        create: formatedCV.awards?.map(e => ({
                            title: e.title,
                            description: e.description,
                            start_date: convertDate(e.startDate),
                            end_date: convertDate(e.endDate),
                        }))
                    },
                    experiences: {
                        create: formatedCV.experiences?.map(e => ({
                            company_name: e.company,
                            title: e.title,
                            description: e.description,
                            start_date: convertDate(e.startDate),
                            end_date: convertDate(e.endDate),
                        }))
                    },
                    educations: {
                        create: formatedCV.educations?.map(e => ({
                            school: e.school,
                            gpa: e.gpa ? parseFloat(e.gpa) : null,
                            graduated_type: e.graduate_type,
                            start_date: convertDate(e.startDate),
                            end_date: convertDate(e.endDate),
                        }))
                    },
                    certificates: {
                        create: formatedCV.certificates?.map(e => ({
                            title: e.name,
                            description: e.description,
                            link: e.link,
                            start_date: convertDate(e.startDate),
                            end_date: convertDate(e.endDate),
                        }))
                    },
                    projects: {
                        create: formatedCV.projects?.map(e => ({
                            title: e.project_title,
                            description: e.project_description,
                            start_date: convertDate(e.project_startDate),
                            end_date: convertDate(e.project_endDate),
                        }))
                    },
                    references: {
                        create: formatedCV.references?.map(e => ({
                            name: e.name,
                            email: e.email,
                            phone: e.phone
                        }))
                    },
                    languages: {
                        create: formatedCV.languages?.map(e => ({
                            name: e.name,
                            level: e.level,
                            certificate: e.certificate,
                        }))
                    }
                },
                include: {
                    awards: true,
                    certificates: true,
                    educations: true,
                    experiences: true,
                    languages: true,
                    projects: true,
                    references: true
                }
            });

            await tx.$queryRaw`UPDATE cvs SET embedding=${vector} WHERE id=${cv.id}`;

            await tx.cv_stats.create({
                data: {
                    cv_id: cv.id,
                    technical: cvStats.technical,
                    communication: cvStats.communication,
                    teamwork: cvStats.teamwork,
                    problem_solving: cvStats.problem_solving,
                    creativity: cvStats.creativity,
                    leadership: cvStats.leadership,
                    summary: cvStats.summary
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    user_id,
                    activity_name: `Bạn vừa đăng tải CV #${cv.id} lên hệ thống.`
                }
            });
        }).catch((e) => next(errorHandler(HTTP_ERROR.CONFLICT, "Đã xảy ra lỗi! Vui lòng thử lại")));

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: cv
        });
    } catch (error) {
        next(error);
    }
};

export const getUserCV = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;

    try {
        const cv = await prisma.cvs.findMany({
            where: {
                users_id: user_id
            },
            select: {
                id: true,
                fullname: true,
                apply_job: true,
                created_at: true,
                primary_skills: true,
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

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: cv
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCV = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const cv_id = req.params.id;

    try {
        await prisma.$transaction(async (tx) => {
            const cv = await tx.cvs.delete({
                where: {
                    users_id: user_id,
                    id: parseInt(cv_id)
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    user_id,
                    activity_name: `Bạn vừa xóa CV #${cv.id} khỏi hệ thống.`
                }
            });
        })

        return res.status(HTTP_SUCCESS.NO_CONTENT).send();
    } catch (error) {
        next(errorHandler(HTTP_ERROR.NOT_FOUND, "CV không tồn tại!"));
    }
}

export const getSuitableJobs = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const cv_id = parseInt(req.params.id);

    if (cv_id < 1 || isNaN(cv_id)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "CV không hợp lệ!"));
    }

    try {
        const isCvExisted = await prisma.cvs.findUnique({
            where: {
                id: cv_id,
                users_id: user_id
            }
        });

        if (!isCvExisted) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Hồ sơ không tồn tại!"));
        }

        // tính trọng số động
        const savedCount = await prisma.savedJobs.count({ where: { user_id } });
        const feedbackCount = await prisma.aiFeedbacks.count({ where: { cv_id, is_good: true } });

        const alpha = 0.6;
        const beta = Math.min(0.1 + savedCount * 0.05, 0.3);
        const gamma = Math.min(0.1 + feedbackCount * 0.05, 0.4);

        const jobs = await prisma.$queryRawUnsafe(`
        WITH user_profile AS (
            SELECT embedding FROM (
            SELECT (
                ((
                    SELECT embedding
                    FROM cvs 
                    WHERE users_id='${user_id}' AND id=${cv_id})
                    * (
                        SELECT ('[' || string_agg('${alpha}', ',') || ']')::vector(3072)
                        FROM generate_series(1, 3072)
                    )
                ) +
                (COALESCE(
                    (SELECT AVG(j.embedding) AS embedding
                    FROM "savedJobs" s
                    JOIN jobs j ON j.id = s.job_id
                    WHERE s.user_id = '${user_id}')
                    * (
                        SELECT ('[' || string_agg('${beta}', ',') || ']')::vector(3072)
                        FROM generate_series(1, 3072)
                    ),
                    (SELECT ('[' || string_agg('0', ',') || ']')::vector(3072)
                    FROM generate_series(1, 3072))
                )) +
                (COALESCE(
                    (SELECT AVG(j.embedding) AS embedding
                    FROM "aiFeedbacks" f
                    JOIN jobs j ON j.id = f.job_id
                    WHERE f.is_good = true AND f.cv_id = ${cv_id})
                    * (
                        SELECT ('[' || string_agg('${gamma}', ',') || ']')::vector(3072)
                        FROM generate_series(1, 3072)
                    ),
                    (SELECT ('[' || string_agg('0', ',') || ']')::vector(3072)
                    FROM generate_series(1, 3072))
                ))
            ) AS embedding) AS t
        )
        SELECT 
            j.id, 
            j.job_title,
            j.salary,
            j.currency,
            j.location,
            j.status,
            jc.job_category,
            jl.label_name,
            u.avatar_url,
            u.username,
            af.is_good,
            1 - (j.embedding <=> up.embedding) AS score
        FROM jobs j
        JOIN user_profile up ON true
        LEFT JOIN "jobCategories" jc ON jc.id = j."jobCategory_id"
        LEFT JOIN "jobLabels" jl ON jl.id = j."label_id"
        LEFT JOIN companies c ON c.id = j."company_id"
        LEFT JOIN users u ON u."company_id" = c.id
        LEFT JOIN applicants a ON a.job_id = j.id
        LEFT JOIN "aiFeedbacks" af ON af.job_id = j.id AND af.cv_id = ${cv_id} AND af.role = 'User'
        WHERE af.is_good IS DISTINCT FROM false
        ORDER BY score DESC
        LIMIT 10;
        `);


        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        next(error);
    }
}

export const getUserCVById = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const cv_id = parseInt(req.params.id as string);

    if (cv_id < 1 || isNaN(cv_id)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "CV không hợp lệ!"));
    }

    try {
        const cv = await prisma.cvs.findFirst({
            where: {
                id: cv_id,
                users_id: user_id
            },
            include: {
                awards: true,
                certificates: true,
                projects: true,
                educations: true,
                experiences: true,
                languages: true,
                references: true,
            },
        });

        if (!cv) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "CV không tồn tại!"));
        }
        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: cv
        });
    } catch (error) {
        next(error);
    }
};

export const getCVStats = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const cv_id = parseInt(req.params.id as string);

    if (cv_id < 1 || isNaN(cv_id)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "CV không hợp lệ!"));
    }

    try {
        const cvStats = await prisma.cv_stats.findFirst({
            where: {
                cv_id,
                cvs: {
                    users_id: user_id
                }
            }
        });
        if (!cvStats) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Thống kê CV không tồn tại!"));
        }

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: cvStats
        });
    } catch (error) {
        next(error);
    }
};