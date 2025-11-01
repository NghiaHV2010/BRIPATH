import { prisma } from "../libs/prisma";

export const jobCategoryRepository = {
    //Get all job categories
    getAll: async () => {
        return prisma.jobCategories.findMany();
    },

    //Get job category by name
    getByName: async (name: string) => {
        return prisma.jobCategories.findUnique({
            where: { job_category: name }
        });
    }
}