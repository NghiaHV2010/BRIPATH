import { PrismaClient } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { CreateJobRequestDto } from "../types/job.types";

export const jobRepository = {
    //Get all jobs
    getAll: async (page: number, numberOfJobs: number, user_id: string, filter?: any[]) => {
        return prisma.jobs.findMany({
            where: {
                AND: filter || {},
            },
            select: {
                id: true,
                job_title: true,
                salary: true,
                currency: true,
                location: true,
                status: true,
                companies: {
                    select: {
                        users: {
                            select: {
                                avatar_url: true,
                                username: true,
                            }
                        }
                    }
                },
                jobCategories: {
                    select: {
                        job_category: true
                    }
                },
                jobLabels: {
                    select: {
                        label_name: true
                    }
                },
                savedJobs: user_id ? {
                    where: {
                        user_id: user_id
                    }
                } : false,
                applicants: user_id ? {
                    where: {
                        cvs: {
                            users_id: user_id
                        }
                    },
                } : false
            },
            orderBy: {
                created_at: 'desc'
            },
            take: numberOfJobs,
            skip: page * numberOfJobs,
        });
    },

    //Count total jobs
    count: async (filter?: any[], company_id?: string) => {
        return prisma.jobs.count({
            where: {
                AND: filter || {},
                company_id: company_id ? company_id : undefined
            }
        });
    },

    getByID: async (jobId: string, userId?: string, company_id?: string) => {
        return prisma.jobs.findFirst({
            where: {
                id: jobId,
                company_id: company_id ? company_id : undefined
            },
            include: {
                jobCategories: {
                    select: {
                        job_category: true
                    }
                },
                jobLabels: {
                    select: {
                        label_name: true
                    }
                },
                savedJobs: userId ? {
                    where: {
                        user_id: userId
                    },
                    select: {
                        saved_at: true,
                    }
                } : false,
                applicants: userId ? {
                    where: {
                        cvs: {
                            users_id: userId
                        }
                    },
                    select: {
                        cv_id: true,
                        apply_date: true,
                        status: true,
                        description: true,
                    }
                } : false,
                companies: {
                    select: {
                        id: true,
                        company_type: true,
                        is_verified: true,
                        users: {
                            select: {
                                username: true,
                                avatar_url: true,
                                address_street: true,
                                address_ward: true,
                                address_city: true,
                                address_country: true,
                            }
                        },
                        fields: {
                            select: {
                                field_name: true
                            }
                        },
                        followedCompanies: userId ? {
                            where: {
                                user_id: userId
                            }
                        } : false
                    }
                }
            },
        });
    },

    //Get jobs by company id
    getByCompanyId: async (company_id: string, page: number, numberOfJobs: number) => {
        return prisma.jobs.findMany({
            where: {
                company_id: company_id
            },
            select: {
                id: true,
                job_title: true,
                salary: true,
                currency: true,
                location: true,
                status: true,
                companies: {
                    select: {
                        users: {
                            select: {
                                avatar_url: true,
                                username: true,
                            }
                        }
                    }
                },
                jobCategories: {
                    select: {
                        job_category: true
                    }
                },
                jobLabels: {
                    select: {
                        label_name: true
                    }
                },
                _count: {
                    select: {
                        applicants: true,
                        job_views: true,
                        savedJobs: true,
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: numberOfJobs,
            skip: page * numberOfJobs,
        });
    },

    // Update job vecotr embedding
    updateEmbedding: async (tx: PrismaClient, job_id: string, embedding: number[][]) => {
        return tx.$queryRaw`UPDATE jobs SET embedding=${embedding} WHERE id=${job_id}`;
    },

    //Create job
    create: async (tx: PrismaClient, jobData: CreateJobRequestDto) => {
        return tx.jobs.create({
            data: jobData,
            include: {
                jobCategories: {
                    select: {
                        job_category: true
                    }
                },
                jobLabels: {
                    select: {
                        label_name: true
                    }
                },
            }
        });
    },

}