import { prisma } from "../libs/prisma";

export const jobLabelRepository = {
    //Get all job labels
    getAll: async () => {
        return prisma.jobLabels.findMany();
    },

    //Get job label by name
    getByName: async (label_name: string) => {
        return prisma.jobLabels.findUnique({
            where: { label_name },
            select: {
                id: true,
                duration_days: true
            }
        });
    },
}
