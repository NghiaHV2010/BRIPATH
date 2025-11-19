import { PrismaClient } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { RegisterRequestDto } from "../types/auth.types";

export const userRepository = {
    //Create new user
    create: async (user: RegisterRequestDto) => {
        return prisma.users.create({
            data: {
                username: user.username,
                email: user.email,
                password: user.password,
                avatar_url: user.avatar_url || null,
                last_loggedIn: user.last_loggedIn || null,
                role_id: 1
            }
        });
    },

    //Find user by email
    findByEmail: async (email: string) => {
        return prisma.users.findFirst({
            where: { email },
        });
    },

    //Update user Last Logged In
    updateLastLoggedIn: async (tx: PrismaClient, email: string) => {
        return tx.users.update({
            where: {
                email
            },
            data: {
                last_loggedIn: new Date()
            },
            include: {
                roles: {
                    select: {
                        role_name: true
                    }
                }
            },
            omit: {
                firebase_uid: true,
                password: true,
                is_deleted: true,
            }
        });
    },

    //Find user by ID
    findById: async (user_id: string) => {
        return prisma.users.findUnique({
            where: {
                id: user_id,
                is_deleted: false
            },
            include: {
                roles: {
                    select: {
                        role_name: true
                    }
                }
            }
        });
    },

    //Update new password
    updatePassword: async (tx: PrismaClient, user_id: string, newPassword: string) => {
        return tx.users.update({
            where: { id: user_id },
            data: { password: newPassword }
        });
    },

    //Update phone verification status
    updatePhoneVerification: async (tx: PrismaClient, user_id: string, phone: string) => {
        return tx.users.update({
            where: {
                id: user_id
            },
            data: {
                phone,
                phone_verified: true
            },
            omit: {
                password: true,
                is_deleted: true,
            }
        });
    },

    //Check
    checkById: async (user_id: string) => {
        return prisma.users.findFirst({
            where: {
                id: user_id,
                is_deleted: false
            },
            include: {
                roles: {
                    select: {
                        role_name: true
                    }
                },
                _count: {
                    select: {
                        userNotifications: {
                            where: {
                                is_read: false
                            }
                        }
                    }
                },
            },
            omit: {
                address_street: true,
                address_ward: true,
                address_city: true,
                address_country: true,
                role_id: true,
                phone: true,
                gender: true,
                created_at: true,
                updated_at: true,
                last_loggedIn: true,
                firebase_uid: true,
                password: true,
                is_deleted: true,
                secret_2fa: true,
            }
        });
    },

    //get user's profile
    getUserProfile: async (user_id: string, company_id?: string) => {
        return prisma.users.findFirst({
            where: {
                id: user_id
            },
            include: {
                companies: company_id ? {
                    select: {
                        jobs: {
                            select: {
                                _count: {
                                    select: {
                                        applicants: {
                                            where: {
                                                status: 'pending'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        status: true,
                        company_type: true,
                        fax_code: true,
                        company_website: true,
                        is_verified: true,
                        background_url: true,
                        business_certificate: true,
                        description: true,
                        longitude: true,
                        latitude: true,
                        employees: true,
                        companyTags: {
                            select: {
                                tags: {
                                    select: {
                                        label_name: true
                                    }
                                }
                            }
                        },
                        fields: {
                            select: {
                                field_name: true
                            }
                        },
                    }
                } : false,
                roles: {
                    select: {
                        role_name: true
                    }
                },
                events: {
                    where: {
                        status: 'approved',
                    },
                    select: {
                        _count: {
                            select: {
                                volunteers: {
                                    where: {
                                        status: 'pending'
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        userNotifications: {
                            where: {
                                is_read: false
                            }
                        },
                        followedCompanies: true,
                        savedJobs: true,
                    }
                }
            },
            omit: {
                password: true,
                firebase_uid: true,
                is_deleted: true,
                role_id: true,
                secret_2fa: true,
            }
        });
    },

    update2FA: async (user_id: string, updateData: { secret_2fa?: string, is_2fa_enabled?: boolean }) => {
        return prisma.users.update({
            where: {
                id: user_id
            },
            data: {
                ...updateData
            }
        });
    }
}