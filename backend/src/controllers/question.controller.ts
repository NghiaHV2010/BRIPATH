import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { errorHandler } from "../utils/error";

const prisma = new PrismaClient();

export const getAnswersByQuestion = async (req: Request, res: Response, next: NextFunction) => {
    const question_id: number = parseInt(req.params.questionId);
    if (question_id < 1 || isNaN(question_id)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Invalid Question ID!"));
    }

    try {
        const answers = await prisma.answers.findMany({
            where: {
                question_id
            }
        })

        return res.status(HTTP_SUCCESS.OK).json({
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
            data: questions
        });
    } catch (error) {
        next(error);
    }
}

export const createMyAnswer = async (req: Request, res: Response, next: NextFunction) => {
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
        next(errorHandler(HTTP_ERROR.CONFLICT, "Please try again!"));
    });

    return res.status(HTTP_SUCCESS.CREATED).json({
        success: true
    });
}

export const getSuitableJobCategories = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user_id = req.user.id;
    console.log("Hello");


    try {
        const data = await prisma.$queryRaw`
            SELECT  jc.id,
                    jc.job_category,
                    jc.description,
                    1 - (jc.embedding <=> user_score.avg_embedding) AS score
            FROM "jobCategories" jc,
            (
                SELECT AVG(ans.embedding) AS avg_embedding
                FROM "personalityTestResults" AS result
                LEFT JOIN answers AS ans
                ON result.answer_id = ans.id
                WHERE result.user_id = ${user_id}
            ) AS user_score
            WHERE 1 - (jc.embedding <=> user_score.avg_embedding) > 0.6
            ORDER BY score DESC
            LIMIT 3
        `;

        console.log(data);

        return res.status(HTTP_SUCCESS.OK).json({
            data
        })

    } catch (error) {
        next(error);
    }
}