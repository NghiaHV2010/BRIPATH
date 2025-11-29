import { prisma } from "../libs/prisma";

export const companyFieldRepository = {
    //Find company field by name
    findByName: async (field_name: string) => {
        return prisma.fields.findUnique({
            where: { field_name }
        });
    },
}