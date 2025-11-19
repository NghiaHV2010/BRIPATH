import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

import { redis } from '../libs/redis';
import { prisma } from "../libs/prisma";
import { Response } from "express";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR } from "../constants/httpCode";
import { generateToken } from "../utils/jwt";
import { userRepository } from "../repositories/user.repository";
import { PrismaClient } from "@prisma/client";
import { activityRepository } from "../repositories/activity.repository";
import { clearCookie, setCookie } from "../utils/cookie.util";
import { ACCESS_SECRET } from '../config/env.config';
import { GoogleLoginRequestDto, RegisterRequestDto } from '../types/auth.types';
import { infobipClient } from '../config/infobip.config';
import { decrypt, encrypt } from '../utils/encryption';

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

        // Check if 2FA is enabled
        if (isUserExisted.is_2fa_enabled) {
            // Generate temporary session token for 2FA verification
            const tempToken = crypto.randomBytes(32).toString('hex');

            // Store pending login session in Redis (expires in 10 minutes)
            await redis.set(
                `2fa_pending:${tempToken}`,
                JSON.stringify({
                    user_id: isUserExisted.id,
                    email: isUserExisted.email,
                    timestamp: Date.now()
                }),
                'EX',
                600 // 10 minutes
            );

            return {
                requires_2fa: true,
                temp_token: tempToken,
                email: isUserExisted.email
            };
        }

        // Normal login flow without 2FA
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
            is_2fa_enabled: result.is_2fa_enabled,
            roles: {
                role_name: result.roles.role_name
            }
        };
    } catch (error) {
        throw error;
    }
}

// Add new service for 2FA login verification
export const verify2FALoginService = async (tempToken: string, token: string, res: Response) => {
    try {
        // Get pending session from Redis
        const pendingSession = await redis.get(`2fa_pending:${tempToken}`);

        if (!pendingSession) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        }

        const sessionData = JSON.parse(pendingSession);
        const { user_id, email } = sessionData;

        // Verify 2FA token
        const user = await userRepository.findById(user_id);

        if (!user || !user.secret_2fa) {
            throw errorHandler(HTTP_ERROR.NOT_FOUND, "Người dùng không tồn tại hoặc chưa bật 2FA!");
        }

        const originalSecret = decrypt(user.secret_2fa);

        const isTokenValid = speakeasy.totp.verify({
            secret: originalSecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (!isTokenValid) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Mã xác thực không hợp lệ!");
        }

        // Delete pending session from Redis
        await redis.del(`2fa_pending:${tempToken}`);

        // Complete login process
        const result = await prisma.$transaction(async (tx: PrismaClient) => {
            const updatedUser = await userRepository.updateLastLoggedIn(tx, email);

            if (updatedUser) {
                await activityRepository.create(tx, updatedUser.id, "Bạn đã đăng nhập vào hệ thống.");
            }

            return updatedUser;
        });

        // Generate actual tokens
        generateToken(result.id, res);

        return {
            id: result.id,
            username: result.username,
            email: result.email,
            avatar_url: result.avatar_url,
            is_2fa_enabled: result.is_2fa_enabled,
            roles: {
                role_name: result.roles.role_name
            }
        };
    } catch (error) {
        throw error;
    }
}

export const logoutService = async (res: Response, user_id: string): Promise<void> => {
    try {
        const cacheKey = `check_auth:${user_id}`;
        const cacheProfileKey = `profile:${user_id}`;

        await Promise.all([
            redis.del(cacheKey),
            redis.del(cacheProfileKey),
            activityRepository.create(prisma, user_id, "Bạn đã đăng xuất khỏi hệ thống.")
        ]);

        clearCookie(res, "accessToken");
        clearCookie(res, "refreshToken");
        return;
    } catch (tokenError) {
        throw errorHandler(HTTP_ERROR.UNAUTHORIZED, "Token không hợp lệ!");
    }

}

export const googleLoginService = async (user: GoogleLoginRequestDto, res: Response): Promise<any> => {
    try {
        // Check if user has 2FA enabled
        const userWithSettings = await userRepository.findById(user.id);

        if (!userWithSettings) {
            throw errorHandler(HTTP_ERROR.NOT_FOUND, "Người dùng không tồn tại!");
        }

        // If 2FA is enabled, create pending session instead of direct login
        if (userWithSettings.is_2fa_enabled) {
            const tempToken = crypto.randomBytes(32).toString('hex');

            // Store pending login session in Redis (expires in 10 minutes)
            await redis.set(
                `2fa_pending:${tempToken}`,
                JSON.stringify({
                    user_id: userWithSettings.id,
                    email: userWithSettings.email,
                    timestamp: Date.now(),
                    login_type: 'google'
                }),
                'EX',
                600 // 10 minutes
            );

            return {
                requires_2fa: true,
                temp_token: tempToken,
                email: userWithSettings.email
            };
        }

        // Normal Google login without 2FA
        const result = await prisma.$transaction(async (tx: PrismaClient) => {
            const updatedUser = await userRepository.updateLastLoggedIn(tx, user.email);

            // Create activity history
            await activityRepository.create(tx, updatedUser.id, "Bạn đã đăng nhập vào hệ thống qua Google.");

            return updatedUser;
        });

        // Generate tokens
        generateToken(result.id, res);

        return {
            id: result.id,
            username: result.username,
            email: result.email,
            avatar_url: result.avatar_url,
            is_2fa_enabled: result.is_2fa_enabled,
            roles: {
                role_name: result.roles.role_name
            }
        };
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

        const cacheKey = `check_auth:${result.id}`;

        await redis.del(cacheKey);
        console.log('CACHE INVALIDATED');

        return result;
    } catch (error) {
        throw error;
    }
}

export const sendSMSOTPService = async (res: Response, phone: string): Promise<void> => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const smsText = `Ma xac thuc cua ban la: ${otp}. Ma nay co hieu luc trong ${10} phut.`;

    try {
        const requestBody = {
            messages: [
                {
                    from: 'InfoSMS',
                    destinations: [
                        {
                            to: phone
                        }
                    ],
                    text: smsText
                }
            ]
        };

        const response = await infobipClient.post(
            '/sms/2/text/advanced',
            requestBody
        );

        const messageData = response.data.messages[0];
        const { messageId, status } = messageData;

        console.log('✅ SMS sent successfully:', {
            messageId,
            phone,
            status: status.name,
            description: status.description
        });

        const data = jwt.sign(
            { phone, otp },
            ACCESS_SECRET,
            { expiresIn: "10m" }
        );

        setCookie(res, "otp", data, 10 * 60 * 1000);
        return;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}

export const verifySMSOTPService = async (res: Response, user_id: string, phone: string): Promise<any> => {
    try {
        const result = await prisma.$transaction(async (tx: PrismaClient) => {
            const user = await userRepository.updatePhoneVerification(tx, user_id, phone);

            await activityRepository.create(tx, user_id, "Bạn đã xác thực số điện thoại.");

            return user;
        });

        const cacheKey = `check_auth:${result.id}`;

        await redis.del(cacheKey);
        console.log('CACHE INVALIDATED');

        return result;
    }
    catch (error) {
        throw error;
    }
}

export const checkAuthenticationService = async (user_id: string): Promise<any> => {
    try {
        const cacheKey = `check_auth:${user_id}`;

        const cachedUser = await redis.get(cacheKey);

        if (cachedUser) {
            return JSON.parse(cachedUser);
        }

        const user = await userRepository.checkById(user_id);

        if (!user) {
            throw errorHandler(HTTP_ERROR.NOT_FOUND, "Người dùng không tồn tại!");
        }

        await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);

        return user;
    } catch (error) {
        throw error;
    }
}

export const enable2FAService = async (user_id: string, email: string): Promise<any> => {
    try {
        const secret = speakeasy.generateSecret({
            name: `BRIPATH (${email})`
        });

        const encryptedSecret = encrypt(secret.base32);


        const [user, qrCodeDataURL] = await Promise.all([
            userRepository.update2FA(user_id, {
                secret_2fa: encryptedSecret,
            }),
            qrcode.toDataURL(secret.otpauth_url!)
        ])

        return { qrCodeDataURL };
    } catch (error) {
        throw error;
    }
}

export const verify2FAService = async (user_id: string, token: string, isDisabled: boolean): Promise<void> => {
    try {
        const user = await userRepository.findById(user_id);
        if (!user || !user.secret_2fa) {
            throw errorHandler(HTTP_ERROR.NOT_FOUND, "Người dùng không tồn tại hoặc chưa bật 2FA!");
        }

        const originalSecret = decrypt(user.secret_2fa);

        const isTokenValid = speakeasy.totp.verify({
            secret: originalSecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (!isTokenValid) {
            throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Mã xác thực không hợp lệ!");
        }

        if (!user.is_2fa_enabled && !isDisabled) {
            await userRepository.update2FA(user_id, {
                is_2fa_enabled: true
            });
        } else if (user.is_2fa_enabled && isDisabled) {
            await userRepository.update2FA(user_id, {
                is_2fa_enabled: false,
                secret_2fa: null
            });
        }

        const cacheKey = `check_auth:${user_id}`;
        const cacheProfileKey = `profile:${user_id}`;

        await Promise.all([
            redis.del(cacheKey),
            redis.del(cacheProfileKey)
        ]);

        return;
    } catch (error) {
        throw error;
    }
}