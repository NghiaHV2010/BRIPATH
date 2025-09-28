import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { errorHandler } from "../utils/error";

const prisma = new PrismaClient();

export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const { user_id, company_id } = req.user;
        const { company_name, email, phone, address_street, address_ward, address_city, address_country } = req.body;

        console.log(company_id);


        let company;

        await prisma.$transaction(async (tx) => {
            if (company_id) {
                company = await tx.companies.update({
                    where: {
                        id: company_id
                    },
                    data: {
                        company_name,
                        email,
                        phone,
                        address_street,
                        address_ward,
                        address_city,
                        address_country,
                    }
                });
            } else {
                company = await tx.companies.create({
                    data: {
                        company_name,
                        email,
                        phone,
                        address_street,
                        address_ward,
                        address_city,
                        address_country,
                        users: {
                            connect: {
                                id: user_id
                            }
                        }
                    }
                });
            }
        });

        if (company) {
            res.status(HTTP_SUCCESS.CREATED).json({
                message: "Step 1 Successfully!"
            });
        }
    } catch (error) {
        next(error);
    }
}

const getAllCompanies = async (req: Request, res: Response, next: NextFunction) => {
    let page: number = parseInt(req.query?.page as string);
    const user_id: string = req.query?.userId as string;

    const numberOfCompanies = 10;

    if (page - 1 < 0 || isNaN(page)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Invalid page!"));
    }

    page -= 1;

    try {

        const total_companies = await prisma.companies.count();
        const companies = await prisma.companies.findMany({
            select: {
                id: true,
                company_name: true,
                logo_url: true,
                company_type: true,
                address_street: true,
                address_ward: true,
                address_city: true,
                address_country: true,
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
                jobs: {
                    select: {
                        _count: true,
                    }
                },
                followedCompanies: {
                    where: {
                        user_id: user_id ? user_id : ''
                    }
                }
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: companies,
            totalPages: Math.ceil(total_companies / numberOfCompanies)
        })
    } catch (error) {
        next(error);
    }
};

const getCompanyByID = async (req: Request, res: Response, next: NextFunction) => {
    type RequestQuery = {
        companyId: string,
        userId?: string,
    };

    const { companyId, userId }: RequestQuery = req.query as RequestQuery;

    try {
        const company = await prisma.companies.findFirst({
            where: {
                id: companyId
            },
            select: {
                company_name: true,
                address_street: true,
                address_ward: true,
                address_city: true,
                address_country: true,
                logo_url: true,
                background_url: true,
                company_type: true,
                company_website: true,
                description: true,
                employees: true,
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
                        categories: {
                            select: {
                                category_name: true
                            }
                        }
                    }
                },
                followedCompanies: {
                    select: {
                        is_notified: true,
                        followed_at: true,
                    },
                    where: {
                        user_id: userId ? userId : ''
                    }
                }
            }
        });

        return res.status(HTTP_SUCCESS.OK).json({
            data: company
        })
    } catch (error) {
        next(error);
    }
}