import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { HTTP_SUCCESS } from "../constants/httpCode";

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
            })
        }
    } catch (error) {
        next(error);
    }
}