import { NextFunction, Request, Response } from "express";
import { analystDataStats, embeddingData, extractTextFromCV, formatText } from "../utils/cvHandler";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { convertDate } from "../utils";
import { errorHandler } from "../utils/error";
import { CVSTATSPROMPT } from "../constants/prompt";
import { prisma } from "../libs/prisma";
import { CV, CVStats, IFILE } from "../types/cv.types";
import { AuthUserRequestDto } from "../types/auth.types";

// Store for SSE clients and processing status
const sseClients = new Map<string, Response>();
const processingStatus = new Map<string, any>();
const processingLocks = new Map<string, boolean>(); // Add lock to prevent duplicate processing

// Regular POST endpoint for uploading CV
export const uploadCV = async (req: Request, res: Response, next: NextFunction) => {
    const maxCVsAllowed = 2; // Set maximum CVs allowed per user
    const { id: user_id } = req.user as AuthUserRequestDto;
    const file = req.files?.cv as IFILE;

    // Generate unique session ID
    const sessionId = `${user_id}_${Date.now()}`;

    try {
        const totalCVs = await prisma.cvs.count({ where: { users_id: user_id } });

        if (totalCVs >= maxCVsAllowed) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, `Bạn chỉ được phép tải lên tối đa ${maxCVsAllowed} CV.`));
        }

        // Initialize processing status
        processingStatus.set(sessionId, {
            status: 'initializing',
            message: 'Đang khởi tạo...',
            progress: 0
        });

        // Send initial response with session ID
        res.status(HTTP_SUCCESS.ACCEPTED).json({
            success: true,
            sessionId,
            message: 'CV upload started. Connect to SSE endpoint for progress.'
        });

        // Start background processing (non-blocking)
        setImmediate(() => processCV(sessionId, user_id, file));

    } catch (error) {
        processingStatus.delete(sessionId);
        processingLocks.delete(sessionId);
        next(error);
    }
};

// SSE endpoint for real-time updates
export const uploadCVStream = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Session ID is required"));
    }

    // Check if session exists
    if (!processingStatus.has(sessionId)) {
        return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Session not found or expired"));
    }

    // Prevent duplicate connections for the same session
    if (sseClients.has(sessionId)) {
        return next(errorHandler(HTTP_ERROR.CONFLICT, "Session already has an active connection"));
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Store client connection
    sseClients.set(sessionId, res);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({
        status: 'connected',
        message: 'Connected to upload stream',
        progress: 0
    })}\n\n`);

    // Send current status
    const currentStatus = processingStatus.get(sessionId);
    if (currentStatus && currentStatus.status !== 'initializing') {
        res.write(`data: ${JSON.stringify(currentStatus)}\n\n`);
    }

    // Handle client disconnect
    req.on('close', () => {
        sseClients.delete(sessionId);
        console.log(`SSE client disconnected: ${sessionId}`);
    });
};

// Background CV processing function
async function processCV(sessionId: string, user_id: string, file: IFILE) {
    // Check if already processing
    if (processingLocks.get(sessionId)) {
        console.log(`Session ${sessionId} is already being processed`);
        return;
    }

    // Set processing lock
    processingLocks.set(sessionId, true);

    const sendUpdate = (data: any) => {
        processingStatus.set(sessionId, data);
        const client = sseClients.get(sessionId);

        if (client && !client.writableEnded) {
            try {
                client.write(`data: ${JSON.stringify(data)}\n\n`);
            } catch (error) {
                console.error(`Error writing to SSE client ${sessionId}:`, error);
                sseClients.delete(sessionId);
            }
        }
    };

    try {
        // Step 1: Extract text
        sendUpdate({
            status: 'extracting',
            message: 'Đang trích xuất văn bản từ CV...',
            progress: 10
        });

        const rawText = await extractTextFromCV(file.data, file.mimetype);

        // Step 2: Format CV
        sendUpdate({
            status: 'formatting',
            message: 'Đang phân tích CV...',
            progress: 30
        });

        const formatedCV: CV = await formatText(sessionId, rawText, sendUpdate);

        // Step 3: Create embeddings
        sendUpdate({
            status: 'embedding',
            message: 'Đang định dạng CV...',
            progress: 70
        });

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

        const cvStats = cvStatsResult as CVStats;

        // Step 4: Save to database
        sendUpdate({
            status: 'saving',
            message: 'Đang lưu CV vào hệ thống...',
            progress: 90
        });

        const result = await prisma.$transaction(async (tx) => {
            const cv = await tx.cvs.create({
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

            await Promise.all([
                tx.$queryRaw`UPDATE cvs SET embedding=${vector} WHERE id=${cv.id}`,
                tx.cv_stats.create({
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
                }),
                tx.userActivitiesHistory.create({
                    data: {
                        user_id,
                        activity_name: `Bạn vừa đăng tải CV #${cv.id} lên hệ thống.`
                    }
                })
            ])

            return cv;
        });

        // Step 5: Complete
        sendUpdate({
            status: 'complete',
            message: 'Tải CV thành công!',
            progress: 100,
            data: result
        });

        // Close connection and cleanup after delay
        setTimeout(() => {
            const client = sseClients.get(sessionId);
            if (client && !client.writableEnded) {
                try {
                    client.end();
                } catch (error) {
                    console.error(`Error closing SSE client ${sessionId}:`, error);
                }
            }
            sseClients.delete(sessionId);
            processingStatus.delete(sessionId);
            processingLocks.delete(sessionId);
        }, 2000);

    } catch (error) {
        sendUpdate({
            status: 'error',
            message: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
            progress: 0
        });

        // Close connection and cleanup on error
        setTimeout(() => {
            const client = sseClients.get(sessionId);
            if (client && !client.writableEnded) {
                try {
                    client.end();
                } catch (error) {
                    console.error(`Error closing SSE client ${sessionId}:`, error);
                }
            }
            sseClients.delete(sessionId);
            processingStatus.delete(sessionId);
            processingLocks.delete(sessionId);
        }, 2000);
    }
}

// Cleanup old sessions periodically (run every 10 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [sessionId] of processingStatus) {
        const sessionTime = parseInt(sessionId.split('_')[1]);
        // Remove sessions older than 30 minutes
        if (now - sessionTime > 30 * 60 * 1000) {
            const client = sseClients.get(sessionId);
            if (client && !client.writableEnded) {
                try {
                    client.end();
                } catch (error) {
                    console.error(`Error cleaning up session ${sessionId}:`, error);
                }
            }
            sseClients.delete(sessionId);
            processingStatus.delete(sessionId);
            processingLocks.delete(sessionId);
            console.log(`Cleaned up expired session: ${sessionId}`);
        }
    }
}, 10 * 60 * 1000);

export const getUserCV = async (req: Request, res: Response, next: NextFunction) => {
    const { id: user_id } = req.user as AuthUserRequestDto;

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
    const { id: user_id } = req.user as AuthUserRequestDto;
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
    const { id: user_id } = req.user as AuthUserRequestDto;
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
    const { id: user_id } = req.user as AuthUserRequestDto;
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
    const { id: user_id } = req.user as AuthUserRequestDto;
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