import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import bcrypt from "bcryptjs";
import { generateToken, cookieConfig } from "../utils/jwt";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET, COOKIE_CONFIG_SAME_SITE, COOKIE_CONFIG_SECURE, DOMAIN, FRONTEND_URL } from "../config/env.config";
import crypto from "crypto";
import emailTemplate from "../constants/emailTemplate";
import { sendEmail, sendEmailWithRetry, validateEmail } from "../utils";
import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json";

const prisma = new PrismaClient();

const cookieOptions = {
    maxAge: 0,
    httpOnly: true,
    sameSite: COOKIE_CONFIG_SAME_SITE,
    secure: COOKIE_CONFIG_SECURE,
    path: '/',
    domain: DOMAIN
};

export const validateRegisterInput = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng điền đầy đủ thông tin!"));
        }

        if (username.length < 6) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Tên người dùng quá ngắn! (Tối thiểu 6 ký tự)"));
        }

        if (password.length < 8) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mật khẩu không đủ mạnh! (Tối thiểu 8 ký tự)"));
        }

        if (!validateEmail(email)) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Email không hợp lệ!"));
        }

        const isExisted = await prisma.users.findFirst({
            where: {
                email
            },
            omit: {
                password: true
            }
        });

        if (isExisted) {
            return next(errorHandler(HTTP_ERROR.CONFLICT, "Email đã tồn tại!"));
        }

        const data = jwt.sign({ username, email, password }, ACCESS_SECRET, { expiresIn: "30m" });

        res.cookie("data", data, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: COOKIE_CONFIG_SAME_SITE,
            secure: COOKIE_CONFIG_SECURE,
            path: '/',
            domain: DOMAIN
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Thành công!"
        });
    } catch (error) {
        next(error);
    }
}


export const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    const { id, email } = req.user as { id?: string; email: string };

    const buf = crypto.randomBytes(32);
    const otp = jwt.sign({ otp: buf.toString('hex') }, ACCESS_SECRET, { expiresIn: "10m" });

    let url;

    if (id) {
        url = `${FRONTEND_URL}/forgot/password/${otp}`;
    } else {
        url = `${FRONTEND_URL}/register/email/${otp}`;
    }

    try {
        await sendEmailWithRetry(email, "BRIPATH - Xác thực email", emailTemplate(url));

        res.cookie("otp", otp, {
            maxAge: 10 * 60 * 1000,
            httpOnly: true,
            sameSite: COOKIE_CONFIG_SAME_SITE,
            secure: COOKIE_CONFIG_SECURE,
            path: '/',
            domain: DOMAIN
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Email đã được gửi đến hộp thư của bạn"
        })
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        next(errorHandler(HTTP_ERROR.INTERNAL_SERVER_ERROR, "Không thể gửi email. Vui lòng thử lại sau."));
    }

}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        type user = {
            email: string,
            username: string,
            password: string,
        }

        const { email, username, password }: user = req.user as user;

        const { otp }: { otp: string } = req.params as { otp: string };

        if (!otp) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "OTP không hợp lệ!"));
        }

        const otpDecoded = jwt.verify(otp, ACCESS_SECRET);

        // @ts-ignore
        if (req.otp.otp !== otpDecoded.otp) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "OTP không hợp lệ!"));
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    username,
                    email,
                    password: hashPassword,
                    role_id: 1
                }
            });
        });

        res.cookie("data", '', cookieOptions);

        res.cookie("otp", '', cookieOptions);

        return res.status(HTTP_SUCCESS.CREATED).json({
            success: true,
            message: "Đăng ký thành công!"
        });

    } catch (error) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const isUserExisted = await prisma.users.findFirst({
            where: {
                email
            }
        });

        if (!isUserExisted) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Thông tin đăng nhập không hợp lệ!"));
        }

        const isPasswordValid = await bcrypt.compare(password, isUserExisted.password);

        if (!isPasswordValid) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Thông tin đăng nhập không hợp lệ!"));
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.users.update({
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

            if (user) {
                await tx.userActivitiesHistory.create({
                    data: {
                        user_id: user.id,
                        activity_name: "Bạn đã đăng nhập vào hệ thống."
                    }
                });
            }

            return user;
        });

        generateToken(result.id, res);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: {
                id: result.id,
                username: result.username,
                email: result.email,
                avatar_url: result.avatar_url,
                roles: {
                    role_name: result.roles.role_name
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Clear cookies with proper production settings
        res.cookie("accessToken", '', cookieOptions);
        res.cookie("refreshToken", '', cookieOptions);

        // Try to get user from token if available and log activity
        const accessToken = req.cookies?.accessToken;
        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, ACCESS_SECRET) as { userId: string };

                if (decoded && decoded.userId) {
                    await prisma.userActivitiesHistory.create({
                        data: {
                            user_id: decoded.userId,
                            activity_name: "Bạn đã đăng xuất khỏi hệ thống."
                        }
                    });
                }
            } catch (tokenError) {
                // Token is invalid, just continue with logout
                console.log('Token invalid during logout, continuing...');
            }
        }

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Đăng xuất thành công!"
        });
    } catch (error) {
        res.cookie("accessToken", '', cookieOptions);
        res.cookie("refreshToken", '', cookieOptions);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Đăng xuất thành công!"
        });
    }
}

export const checkAuth = (req: Request, res: Response) => {
    res.status(HTTP_SUCCESS.OK).json({
        // @ts-ignore
        data: req.user
    });
}

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        type userDTO = {
            id: string;
            username: string;
            email: string;
            avatar_url: string;
        }

        const user: userDTO = req.user as userDTO;

        if (!user || !user.id) {
            return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
        }

        // Get complete user data and update last login
        const result = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.users.update({
                where: {
                    id: user.id
                },
                data: {
                    last_loggedIn: new Date()
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
                    }
                },
                omit: {
                    firebase_uid: true,
                    password: true,
                    is_deleted: true,
                }
            });

            // Create activity history
            await tx.userActivitiesHistory.create({
                data: {
                    user_id: user.id,
                    activity_name: "Bạn đã đăng nhập vào hệ thống bằng Google."
                }
            });

            return updatedUser;
        });

        // Generate tokens
        generateToken(result.id, res);

        // Redirect with success
        res.redirect(`${FRONTEND_URL}/?login=success`);
    } catch (error) {
        console.error('Google login error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
}

export const verifySMS = async (req: Request, res: Response, next: NextFunction) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
    });
    // @ts-ignore
    const user_id = req.user.id;
    const { token } = req.body;

    try {
        const decoded = await admin.auth().verifyIdToken(token);

        if (decoded) {
            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.users.update({
                    where: {
                        id: user_id
                    },
                    data: {
                        phone: decoded.phone_number,
                        phone_verified: true
                    },
                    omit: {
                        password: true,
                        is_deleted: true,
                    }
                });

                await tx.userActivitiesHistory.create({
                    data: {
                        user_id,
                        activity_name: "Bạn đã xác thực số điện thoại."
                    }
                })


                return user;
            });

            return res.status(HTTP_SUCCESS.OK).json({
                success: true,
                data: {
                    success: true,
                    uid: decoded.uid,
                    ...result
                }
            });
        }
    } catch (error) {
        next(error);
    }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng điền đầy đủ thông tin!"));
        }

        if (newPassword.length < 8) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mật khẩu mới không đủ mạnh! (Tối thiểu 8 ký tự)"));
        }

        // Get user with password
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy người dùng!"));
        }

        // Verify old password
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mật khẩu cũ không chính xác!"));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await prisma.$transaction(async (tx) => {
            await tx.users.update({
                where: { id: userId },
                data: { password: hashNewPassword }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    user_id: userId,
                    activity_name: "Bạn đã thay đổi mật khẩu."
                }
            });
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Đổi mật khẩu thành công!"
        });

    } catch (error) {
        next(error);
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập email!"));
        }

        if (!validateEmail(email)) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Email không hợp lệ!"));
        }

        // Check if user exists
        const user = await prisma.users.findFirst({
            where: { email },
            omit: { password: true }
        });

        if (!user) {
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Email không tồn tại trong hệ thống!"));
        }

        const data = jwt.sign({ id: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: "30m" });

        res.cookie("data", data, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            sameSite: COOKIE_CONFIG_SAME_SITE,
            secure: COOKIE_CONFIG_SECURE,
            path: '/',
            domain: DOMAIN
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Thành công!"
        });

    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id, email } = req.user;
    const { newPassword } = req.body;
    const { otp }: { otp: string } = req.params as { otp: string };

    if (!newPassword) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập mật khẩu mới!"));
    }

    if (newPassword.length < 8) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mật khẩu mới không đủ mạnh! (Tối thiểu 8 ký tự)"));
    }

    if (!otp) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "OTP không hợp lệ!"));
    }

    const otpDecoded = jwt.verify(otp, ACCESS_SECRET);

    // @ts-ignore
    if (req.otp.otp !== otpDecoded.otp) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "OTP không hợp lệ!"));
    }

    try {
        // Find user with valid reset token
        const user = await prisma.users.findFirst({
            where: {
                id,
                email
            }
        });

        if (!user) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Người dùng không tồn tại!"));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        await prisma.$transaction(async (tx) => {
            await tx.users.update({
                where: { id: user.id },
                data: {
                    password: hashPassword
                }
            });

            await tx.userActivitiesHistory.create({
                data: {
                    user_id: user.id,
                    activity_name: "Bạn đã đặt lại mật khẩu."
                }
            });
        });

        res.cookie("data", '', cookieOptions);

        res.cookie("otp", '', cookieOptions);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Đặt lại mật khẩu thành công!"
        });

    } catch (error) {
        next(error);
    }
}
