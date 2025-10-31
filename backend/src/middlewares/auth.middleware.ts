import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR } from "../constants/httpCode";
import { ACCESS_SECRET, REFRESH_SECRET } from "../config/env.config";
import { setCookie } from "../utils/cookie.util";
import { AuthUserRequestDto } from "../types/auth.types";
import { userRepository } from "../repositories/user.repository";
import { checkAuthenticationService } from "../services/auth.service";

export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let newAccessToken: string;
    let userId: string;

    try {
        // Bypass auth for payment gateways (server-to-server callbacks/returns)
        const url = (req.originalUrl || req.url || '').toLowerCase();
        if (url.startsWith('/api/sepay/webhook')) {
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

            newAccessToken = jwt.sign(
                { userId },
                ACCESS_SECRET,
                { expiresIn: "45m" }
            );

            setCookie(res, "accessToken", newAccessToken, 45 * 60 * 1000);
        } else {
            const accessTokenDecoded = jwt.verify(accessToken, ACCESS_SECRET);

            if (!accessTokenDecoded) {
                return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Chưa xác thực - Token không hợp lệ!"));
            }

            //@ts-ignore
            userId = accessTokenDecoded.userId;
        }

        const user = await checkAuthenticationService(userId);

        req.user = user as AuthUserRequestDto;
        next();
    } catch (error) {
        next(error);
    }
}

export const emailVerifyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.cookies?.data;

    if (!user) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "Vui lòng điền lại thông tin!"));
    }

    const userDecoded = jwt.verify(user, ACCESS_SECRET);

    if (!userDecoded) {
        return next(errorHandler(HTTP_ERROR.REQUEST_TIMEOUT, "Vui lòng điền lại thông tin!"));
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
        const { id: user_id } = req.user as AuthUserRequestDto;

        try {
            const user = await userRepository.findById(user_id);

            if (user?.roles.role_name !== role) {
                return next(errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn không có quyền thực hiện yêu cầu này"));
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}

export const twoFactorMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { phone_verified } = req.user as AuthUserRequestDto;

    if (!phone_verified)
        return next(errorHandler(HTTP_ERROR.UNAUTHORIZED, "Vui lòng xác thực số điện thoại"));

    next();
}