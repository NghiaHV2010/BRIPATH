import { PrismaClient } from "@prisma/client"
import { CreateCompanyRequestDto } from "../types/company.types"

export const companyRepository = {
    //Create or Update company
    upsert: async (tx: PrismaClient, data: CreateCompanyRequestDto, user_id: string, company_id?: string) => {
        return tx.companies.upsert({
            where: { id: company_id ?? "" },
            update: {
                ...data,
                status: "pending"
            },
            create: {
                ...data,
                users: {
                    connect: {
                        id: user_id
                    }
                }
            }
        });
    },
}
