import { PrismaClient } from "@prisma/client";

export const followedCompanyRepository = {
    //Find all users following a company by company ID
    findUsersByCompanyId: async (tx: PrismaClient, company_id: string) => {
        return tx.followedCompanies.findMany({
            where: {
                company_id,
                is_notified: true,
            },
            select: {
                user_id: true,
            }
        });
    }
}