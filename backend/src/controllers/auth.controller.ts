import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET } from "../config/env.config";
import crypto from "crypto";
import emailTemplate from "../constants/emailTemplate";
import { sendEmail, validateEmail } from "../utils";
import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json";

const prisma = new PrismaClient();

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
            sameSite: "strict",
            secure: false
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
    const { email } = req.user as { email: string };

    const buf = crypto.randomBytes(32);
    const otp = jwt.sign({ otp: buf.toString('hex') }, ACCESS_SECRET, { expiresIn: "10m" });

    const url = `http://localhost:5173/register/email/${otp}`;

    try {
        sendEmail(email, "BRIPATH - Verify Email", emailTemplate(url));

        res.cookie("otp", otp, {
            maxAge: 10 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: false
        });

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Email đã được gửi đến hộp thư của bạn"
        })
    } catch (error) {
        next(error);
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

        res.cookie("data", '', { maxAge: 0 });

        res.cookie("otp", '', { maxAge: 0 });

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
                avatar: result.avatar_url,
                role: result.roles.role_name
            }
        });
    } catch (error) {
        next(error);
    }
}

export const logout = async (req: Request, res: Response) => {
    // @ts-ignore
    const user_id = req.user as string;
    res.cookie("accessToken", '', { maxAge: 0 });
    res.cookie("refreshToken", '', { maxAge: 0 });

    await prisma.userActivitiesHistory.create({
        data: {
            user_id,
            activity_name: "Bạn đã đăng xuất khỏi hệ thống."
        }
    })

    return res.status(HTTP_SUCCESS.OK).json({
        success: true,
        message: "Đăng xuất thành công!"
    });
}

export const checkAuth = (req: Request, res: Response) => {
    res.status(HTTP_SUCCESS.OK).json({
        // @ts-ignore
        data: req.user
    });
}

export const googleLogin = (req: Request, res: Response) => {
    type userDTO = {
        id: string;
        username: string;
        email: string;
        avatar_url: string;
    }

    const user: userDTO = req.user as userDTO;

    generateToken(user.id, res);
    const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8" />
            <title>Đăng nhập...</title>
            <style>html,body{background:#0d1117;color:#fff;font-family:system-ui;margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-size:14px;} .fade{opacity:.6}</style>
            </head><body>
            <div>Đăng nhập Google thành công. Cửa sổ sẽ đóng...</div>
            <script>
                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage({ source:'bripath-google-auth', status:'success' }, '*');
                    }
                    setTimeout(() => window.close(), 400);
                } catch (e) { setTimeout(() => window.close(), 600); }
            </script>
            </body></html>`;

    res.status(200).send(html);
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
