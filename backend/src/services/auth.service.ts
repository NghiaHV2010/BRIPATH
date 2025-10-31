import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR } from "../constants/httpCode";
import { generateToken } from "../utils/jwt";
import { userRepository } from "../repositories/user.repository";
import { PrismaClient } from "@prisma/client";
import { activityRepository } from "../repositories/activity.repository";
import { clearCookie, setCookie } from "../utils/cookie.util";
import { ACCESS_SECRET } from '../config/env.config';
import { GoogleLoginRequestDto, RegisterRequestDto } from '../types/auth.types';

export const loginService = async (email: string, password: string, res: Response) => {
    try {
        const isUserExisted = await userRepository.findByEmail(email);

        if (!isUserExisted) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Thông tin đăng nhập không hợp lệ!");
        }

        const isPasswordValid = await bcrypt.compare(password, isUserExisted.password);

        if (!isPasswordValid) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Thông tin đăng nhập không hợp lệ!");
        }

        const result = await prisma.$transaction(async (tx: PrismaClient) => {
            const user = await userRepository.updateLastLoggedIn(tx, email);

            if (user) {
                await activityRepository.create(tx, user.id, "Bạn đã đăng nhập vào hệ thống.");
            }

            return user;
        });

        generateToken(result.id, res);

        return {
            id: result.id,
            username: result.username,
            email: result.email,
            avatar_url: result.avatar_url,
            roles: {
                role_name: result.roles.role_name
            }
        };
    } catch (error) {
        throw error;
    }
}

export const logoutService = async (req: Request, res: Response): Promise<void> => {
    clearCookie(res, "accessToken");
    clearCookie(res, "refreshToken");
    const accessToken = req.cookies?.accessToken;

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, ACCESS_SECRET) as { userId: string };

            if (decoded && decoded.userId) {
                await activityRepository.create(prisma, decoded.userId, "Bạn đã đăng xuất khỏi hệ thống.");
            }
        } catch (tokenError) {
            throw errorHandler(HTTP_ERROR.UNAUTHORIZED, "Token không hợp lệ!");
        }
    }

    return;
}

export const googleLoginService = async (user: GoogleLoginRequestDto, res: Response): Promise<void> => {
    try {
        const result = await prisma.$transaction(async (tx: PrismaClient) => {
            const updatedUser = await userRepository.updateLastLoggedIn(tx, user.email);

            // Create activity history
            await activityRepository.create(tx, updatedUser.id, "Bạn đã đăng nhập vào hệ thống.");

            return updatedUser;
        });

        // Generate tokens
        generateToken(result.id, res);

        return;
    } catch (error) {
        throw error;
    }
}

export const changePasswordService = async (user_id: string, oldPassword: string, newPassword: string): Promise<void> => {
    try {
        const user = await userRepository.findById(user_id);

        if (!user) {
            throw errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy người dùng!");
        }

        // Verify old password
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Mật khẩu cũ không chính xác!");
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await prisma.$transaction(async (tx: PrismaClient) => {
            await userRepository.updatePassword(tx, user_id, hashNewPassword);

            await activityRepository.create(tx, user_id, "Bạn đã thay đổi mật khẩu thành công.");
        });

        return;
    } catch (error) {
        throw error;
    }
}

export const verifyEmailService = async (user: RegisterRequestDto, res: Response): Promise<void> => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    try {
        await userRepository.create({
            username: user.username,
            email: user.email,
            password: hashPassword
        });

        clearCookie(res, "data");
        clearCookie(res, "otp");

        return;
    } catch (error) {
        throw error;
    }
}

export const validateRegisterService = async (user: RegisterRequestDto, res: Response): Promise<void> => {
    try {
        const isExisted = await userRepository.findByEmail(user.email);

        if (isExisted) {
            throw errorHandler(HTTP_ERROR.CONFLICT, "Email đã tồn tại!");
        }

        const data = jwt.sign(
            {
                username: user.username,
                email: user.email,
                password: user.password
            },
            ACCESS_SECRET,
            { expiresIn: "30m" }
        );

        setCookie(res, "data", data, 30 * 60 * 1000);
        return;
    } catch (error) {
        throw error;
    }
}

export const sendOTPService = (res: Response): string => {
    const buf = crypto.randomBytes(32);
    const otp = jwt.sign(
        { otp: buf.toString('hex') },
        ACCESS_SECRET,
        { expiresIn: "10m" }
    );

    setCookie(res, "otp", otp, 10 * 60 * 1000);

    return otp;
}

export const forgotPasswordService = async (email: string, res: Response): Promise<void> => {
    try {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw errorHandler(HTTP_ERROR.NOT_FOUND, "Email không tồn tại trong hệ thống!");
        }

        const data = jwt.sign(
            { email: user.email },
            ACCESS_SECRET,
            { expiresIn: "30m" }
        );

        setCookie(res, "data", data, 30 * 60 * 1000);
        return;
    } catch (error) {
        throw error;
    }
}

export const resetPasswordService = async (email: string, newPassword: string, res: Response): Promise<void> => {
    try {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Người dùng không tồn tại!");
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        await prisma.$transaction(async (tx: PrismaClient) => {
            await userRepository.updatePassword(tx, user.id, hashPassword);

            await activityRepository.create(tx, user.id, "Bạn đã đặt lại mật khẩu thành công.");
        });

        clearCookie(res, "data");
        clearCookie(res, "otp");
        return;
    } catch (error) {
        throw error;
    }
}

export const verifySMSService = async (user_id: string, phone: string): Promise<any> => {
    try {
        const result = await prisma.$transaction(async (tx: PrismaClient) => {
            const user = await userRepository.updatePhoneVerification(tx, user_id, phone);

            await activityRepository.create(tx, user_id, "Bạn đã xác thực số điện thoại.");

            return user;
        });

        return result;
    } catch (error) {
        throw error;
    }
}