import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET, FRONTEND_URL } from "../config/env.config";
import { emailForgotPasswordTemplate, emailVerifyTemplate } from "../constants/emailTemplate";
import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json";
import { sendEmailWithRetry, validateEmail } from "../utils/emailHandler";
import { changePasswordService, forgotPasswordService, googleLoginService, loginService, logoutService, resetPasswordService, sendOTPService, validateRegisterService, verifyEmailService, verifySMSService } from "../services/auth.service";
import { AuthUserRequestDto, GoogleLoginRequestDto, RegisterRequestDto, SendOTPRequestDto } from "../types/auth.types";

export const validateRegisterInput = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body as RegisterRequestDto;

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

    try {
        await validateRegisterService({
            username,
            email,
            password
        }, res);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Thành công!"
        });
    } catch (error) {
        next(error);
    }
}


export const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    const { id, email } = req.user as SendOTPRequestDto;
    let url: string;

    try {
        const otp = sendOTPService(res);

        if (id) {
            url = `${FRONTEND_URL}/forgot/password/${otp}`;
        } else {
            url = `${FRONTEND_URL}/register/email/${otp}`;
        }

        res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Email đã được gửi đến hộp thư của bạn"
        });


        (async () => {
            try {
                await sendEmailWithRetry(
                    email,
                    "BRIPATH - Xác thực email",
                    id ? emailForgotPasswordTemplate(url) : emailVerifyTemplate(url)
                );
            } catch (error) {
                next(errorHandler(HTTP_ERROR.INTERNAL_SERVER_ERROR, "Không thể gửi email. Vui lòng thử lại sau."));
            }
        })();
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        next(errorHandler(HTTP_ERROR.INTERNAL_SERVER_ERROR, "Không thể gửi email. Vui lòng thử lại sau."));
    }

}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as RegisterRequestDto;
    const { otp } = req.params as { otp: string };

    if (!otp) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "OTP không hợp lệ!"));
    }

    try {
        const otpDecoded = jwt.verify(otp, ACCESS_SECRET);

        // @ts-ignore
        if (req.otp.otp !== otpDecoded.otp) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "OTP không hợp lệ!"));
        }

        await verifyEmailService(user, res);

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
        const { email, password } = req.body as { email: string, password: string };

        const loginResult = await loginService(email, password, res);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: loginResult
        });
    } catch (error) {
        next(error);
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await logoutService(req, res);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Đăng xuất thành công!"
        });
    } catch (error) {
        next(error);
    }
}

export const checkAuth = (req: Request, res: Response) => {
    res.status(HTTP_SUCCESS.OK).json({
        data: req.user as AuthUserRequestDto
    });
}

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as GoogleLoginRequestDto;

        if (!user || !user.id) {
            return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
        }

        await googleLoginService(user, res);

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
    const { id: user_id } = req.user as AuthUserRequestDto;
    const { token } = req.body as { token: string };

    try {
        const decoded = await admin.auth().verifyIdToken(token);

        if (decoded) {
            const result = await verifySMSService(user_id, decoded.phone_number);

            return res.status(HTTP_SUCCESS.OK).json({
                success: true,
                data: result
            });
        }
    } catch (error) {
        next(error);
    }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: user_id } = req.user as AuthUserRequestDto;
        const { oldPassword, newPassword } = req.body as { oldPassword: string, newPassword: string };

        if (!oldPassword || !newPassword) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng điền đầy đủ thông tin!"));
        }

        if (newPassword.length < 8) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Mật khẩu mới không đủ mạnh! (Tối thiểu 8 ký tự)"));
        }

        await changePasswordService(user_id, oldPassword, newPassword);


        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Đổi mật khẩu thành công!"
        });

    } catch (error) {
        next(error);
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as { email: string };

    if (!email) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Vui lòng nhập email!"));
    }

    if (!validateEmail(email)) {
        return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Email không hợp lệ!"));
    }

    try {
        await forgotPasswordService(email, res);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Thành công!"
        });
    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.user as AuthUserRequestDto;
    const { newPassword } = req.body as { newPassword: string };
    const { otp } = req.params as { otp: string };

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
        await resetPasswordService(email, newPassword, res);

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            message: "Đặt lại mật khẩu thành công!"
        });
    } catch (error) {
        next(error);
    }
}
