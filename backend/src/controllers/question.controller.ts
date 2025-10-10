import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { errorHandler } from "../utils/error";
import { generateCareerPath } from "../utils";

const prisma = new PrismaClient();

export const getAnswersByQuestion = async (req: Request, res: Response, next: NextFunction) => {
    const question_id: number = parseInt(req.params.questionId);
    if (question_id < 1 || isNaN(question_id)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mã câu hỏi không hợp lệ!"));
    }

    try {
        const answers = await prisma.answers.findMany({
            where: {
                question_id
            }
        })

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: answers
        })
    } catch (error) {
        next(error);
    }
}

export const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const questions = await prisma.questions.findMany();
        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: questions
        });
    } catch (error) {
        next(error);
    }
}

export const createUserAnswer = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const { question_id, answer_id }: { question_id: number, answer_id: number[] } = req.body;

    await prisma.$transaction(async (tx) => {
        for (const ans of answer_id) {
            await tx.personalityTestResults.createMany({
                data: {
                    answer_id: ans,
                    user_id,
                    question_id
                }
            });
        }

    }).catch((error) => {
        next(errorHandler(HTTP_ERROR.CONFLICT, "Đã xảy ra lỗi, vui lòng thử lại!"));
    });

    return res.status(HTTP_SUCCESS.CREATED).json({
        success: true
    });
}

export const getSuitableJobCategories = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;

    try {
        const data = await prisma.$queryRaw`
            WITH scored_specialized AS (
                SELECT 
                    jc.id AS category_id,
                    jc.job_category,
                    jc.description AS category_description,
                    js.id AS job_id,
                    js.job_type,
                    js.description AS job_description,
                    1 - (js.embedding <=> user_score.avg_embedding) AS job_score,
                    1 - (jc.embedding <=> user_score.avg_embedding) AS category_score,
                    ROW_NUMBER() OVER (PARTITION BY jc.id ORDER BY 1 - (js.embedding <=> user_score.avg_embedding) DESC) AS rn
                FROM "jobCategories" jc
                INNER JOIN "jobSpecialized" js
                    ON js.jobcategory_id = jc.id
                CROSS JOIN (
                    SELECT AVG(ans.embedding) AS avg_embedding
                    FROM "personalityTestResults" AS result
                    LEFT JOIN answers AS ans
                        ON result.answer_id = ans.id
                    WHERE result.user_id = ${user_id}
                ) AS user_score
                WHERE 1 - (jc.embedding <=> user_score.avg_embedding) > 0.5
            )
            SELECT 
                category_id AS id,
                job_category,
                category_description AS description,
                json_agg(
                    json_build_object(
                        'id', job_id,
                        'job_type', job_type,
                        'description', job_description,
                        'score', job_score
                    )
                ) AS job_types,
                MAX(category_score) AS score
            FROM scored_specialized
            WHERE rn <= 3
            GROUP BY category_id, job_category, category_description
            ORDER BY score DESC
            LIMIT 3;
        `;

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data
        })

    } catch (error) {
        next(error);
    }
}

export const restartUserAnswer = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user;

    try {
        await prisma.personalityTestResults.deleteMany({
            where: {
                user_id
            }
        });

        return res.status(HTTP_SUCCESS.NO_CONTENT);
    } catch (error) {
        next(error);
    }
}

export const createCareerPath = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    const { id, jobSpecialize }: { id: number, jobSpecialize: string } = req.body;

    try {
        const isJobSpecializeExisted = await prisma.jobSpecialized.findUnique({
            where: {
                id,
                job_type: jobSpecialize
            }
        });

        if (!isJobSpecializeExisted) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy nghành nghề!"))
        }

        const careerPathData = await generateCareerPath(jobSpecialize).catch((e) => next(e));

        console.log(careerPathData);
        if (!careerPathData || careerPathData instanceof Error) {
            return next(errorHandler(HTTP_ERROR.INTERNAL_SERVER_ERROR, "Tạo lộ trình thất bại"));
        }

        const careerPath = await prisma.careerPaths.create({
            data: {
                user_id,
                title: careerPathData.title,
                description: careerPathData.description,
                resources: careerPathData.resources,
                level: careerPathData.level,
                estimate_duration: careerPathData.estimate_duration,
                jobspecialized_id: isJobSpecializeExisted.id,
                careerPathSteps: {
                    createMany: {
                        data: careerPathData.careerPathSteps
                    }
                }
            },
            include: {
                careerPathSteps: true
            }
        });

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            data: careerPath
        })
    } catch (error) {
        next(error);
    }
}