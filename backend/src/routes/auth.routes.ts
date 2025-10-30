import { Router } from "express";
import { login, checkAuth, logout, googleLogin, sendOTP, validateRegisterInput, verifyEmail, verifySMS, changePassword, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { authenticationMiddleware, emailOTPMiddleware, emailVerifyMiddleware } from "../middlewares/auth.middleware";
import passport from "passport";
import { authLimiter } from "../middlewares";

const authRoute = Router();

authRoute.post('/register/validate', authLimiter, validateRegisterInput);
authRoute.get('/register/email/', authLimiter, emailVerifyMiddleware, sendOTP);
authRoute.get('/register/email/:otp', authLimiter, emailVerifyMiddleware, emailOTPMiddleware, verifyEmail);

authRoute.post('/login', authLimiter, login);
authRoute.post('/logout', authLimiter, logout);
authRoute.get('/check', authenticationMiddleware, checkAuth);

authRoute.post('/verify-sms', authLimiter, authenticationMiddleware, verifySMS);

authRoute.post('/change-password', authLimiter, authenticationMiddleware, changePassword);
authRoute.post('/forgot-password', authLimiter, forgotPassword);
authRoute.post('/reset-password/:otp', authLimiter, emailVerifyMiddleware, emailOTPMiddleware, resetPassword);

authRoute.get('/login/google', authLimiter,
    passport.authenticate("google", {
        scope: [
            "profile",
            "email"
        ]
    })
);

authRoute.get('/login/google/callback', authLimiter,
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false
    }),
    googleLogin
);

export default authRoute;