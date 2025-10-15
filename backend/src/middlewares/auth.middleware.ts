import { next } from './../../node_modules/effect/src/Cron';
import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR } from "../constants/httpCode";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";
import { ACCESS_SECRET, REFRESH_SECRET } from "../config/env.config";

const prisma = new PrismaClient();

export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let newAccessToken: string;
    let userId: string;

    try {
        // Bypass auth for payment gateways (server-to-server callbacks/returns)
        const url = (req.originalUrl || req.url || '').toLowerCase();
        if (url.startsWith('/api/vnpay') || url.startsWith('/api/zalopay')) {
            return next();
        }

        const accessToken: string = req.cookies?.accessToken;

        if (!accessToken) {
            const refreshToken: string = req.cookies?.refreshToken;

            if (!refreshToken) {
                return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Chưa xác thực - Vui lòng đăng nhập!"));
            }

            const refreshTokenDecoded = jwt.verify(refreshToken, REFRESH_SECRET);

            if (!refreshTokenDecoded) {
                return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Chưa xác thực - Token không hợp lệ!"));
            }

            //@ts-ignore
            userId = refreshTokenDecoded.userId;

            newAccessToken = jwt.sign({ userId }, ACCESS_SECRET, {
                expiresIn: "45m"
            });

            res.cookie("accessToken", newAccessToken, {
                maxAge: 45 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: false //true when https - false when http
            });
        } else {
            const accessTokenDecoded = jwt.verify(accessToken, ACCESS_SECRET);

            if (!accessTokenDecoded) {
                return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Chưa xác thực - Token không hợp lệ!"));
            }

            //@ts-ignore
            userId = accessTokenDecoded.userId;
        }

        const user = await prisma.users.findFirst({
            where: {
                id: userId,
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
                password: true,
                is_deleted: true,
                firebase_uid: true
            }
        });

        if (!user) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Người dùng không tồn tại!"));
        }

        //@ts-ignore
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

export const emailVerifyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.cookies?.data;

    if (!user) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "Vui lòng đăng ký lại!"));
    }

    const userDecoded = jwt.verify(user, ACCESS_SECRET);

    if (!userDecoded) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "Vui lòng đăng ký lại!"));
    }

    req.user = userDecoded;
    next();
}

export const emailOTPMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const otp = req.cookies?.otp;

    if (!otp) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "Mã OTP hết hạn!"));
    }

    const otpDecoded = jwt.verify(otp, ACCESS_SECRET);

    if (!otpDecoded) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "Mã OTP hết hạn!"));
    }

    // @ts-ignore
    req.otp = otpDecoded;
    next();
}

export const authorizationMiddleware = (role: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            const user_id = req.user.id;

            const user = await prisma.users.findFirst({
                where: {
                    id: user_id
                },
                include: {
                    roles: true
                }
            });

            if (user?.roles.role_name !== role) {
                return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn không có quyền thực hiện yêu cầu này"));
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}

export const eventAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    type UserDTO = {
        id: string,
        phone: string,
        phone_verified: boolean
    }

    try {
        const { id, phone, phone_verified }: UserDTO = req.user as UserDTO;

        if (!phone || !phone_verified) {
            return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Vui lòng xác thực số điện thoại"));
        }

        const subscription = await prisma.subscriptions.findFirst({
            where: {
                user_id: id,
                status: 'on_going',
                end_date: {
                    gt: new Date()
                },
                membershipPlans: {
                    is: {
                        plan_name: "Gói đăng tuyển cộng tác viên"
                    }
                }
            }
        });

        if (!subscription) {
            next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn chưa mua gói đăng tuyển cộng tác viên"));
        }

        next();
    } catch (error) {
        next(error);
    }
}