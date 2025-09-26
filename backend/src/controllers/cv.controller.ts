import { NextFunction, Request, Response } from "express";
import { embeddingData, extractTextFromCV, formatText } from "../utils/cvHandler";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { PrismaClient } from "../generated/prisma";
import { convertDate } from "../utils";
import { errorHandler } from "../utils/error";

interface IFILE {
    name: string;
    data: Buffer<ArrayBufferLike>;
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

const prisma = new PrismaClient();

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

        const vector = await embeddingData(content);

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

            console.log(cv);
        });

        res.status(HTTP_SUCCESS.OK).json({
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
            include: {
                awards: true,
                certificates: true,
                educations: true,
                experiences: true,
                languages: true,
                projects: true,
                references: true,
            }
        })

        res.status(HTTP_SUCCESS.OK).json({
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
        const cv = await prisma.cvs.delete({
            where: {
                users_id: user_id,
                id: parseInt(cv_id)
            }
        });

        res.status(HTTP_SUCCESS.NO_CONTENT);
    } catch (error) {
        next(errorHandler(HTTP_ERROR.NOT_FOUND, "CV not found!"));
    }
}