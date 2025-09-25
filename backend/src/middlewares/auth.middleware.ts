import { next } from './../../node_modules/effect/src/Cron';
import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR } from "../constants/httpCode";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";
import { ACCESS_SECRET, REFRESH_SECRET } from "../config/env.config";


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const prisma = new PrismaClient();

    let newAccessToken: string;
    let userId: string;

    try {
        const accessToken: string = req.cookies?.accessToken;

        if (!accessToken) {
            const refreshToken: string = req.cookies?.refreshToken;

            if (!refreshToken) {
                return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Unauthorized - Please login!"));
            }

            const refreshTokenDecoded = jwt.verify(refreshToken, REFRESH_SECRET);

            if (!refreshTokenDecoded) {
                return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Unauthorized - Invalid token!"));
            }

            //@ts-ignore
            userId = refreshToken.userId;

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
                return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Unauthorized - Invalid token!"));
            }

            //@ts-ignore
            userId = accessTokenDecoded.userId;
        }

        const user = await prisma.users.findFirst({
            where: {
                id: userId
            },
            omit: {
                password: true
            }
        });

        if (!user) {
            next(errorHandler(HTTP_ERROR.NOT_FOUND, "User not found!"));
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
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "Please register again!"));
    }

    const userDecoded = jwt.verify(user, ACCESS_SECRET);

    if (!userDecoded) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "Please register again!"));
    }

    req.user = userDecoded;
    next();
}

export const emailOTPMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const otp = req.cookies?.otp;

    if (!otp) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "OTP Timeout!"));
    }

    const otpDecoded = jwt.verify(otp, ACCESS_SECRET);

    if (!otpDecoded) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "OTP Timeout!"));
    }

    // @ts-ignore
    req.otp = otpDecoded;
    next();
}