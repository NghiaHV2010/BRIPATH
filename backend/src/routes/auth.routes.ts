import { Router } from "express";
import { login, checkAuth, logout, googleLogin, sendOTP, validateRegisterInput, verifyEmail, verifySMS, changePassword, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { authenticationMiddleware, emailOTPMiddleware, emailVerifyMiddleware } from "../middlewares/auth.middleware";
import passport from "passport";

const authRoute = Router();

authRoute.post('/register/validate', validateRegisterInput);
authRoute.get('/register/email/', emailVerifyMiddleware, sendOTP);
authRoute.get('/register/email/:otp', emailVerifyMiddleware, emailOTPMiddleware, verifyEmail);

authRoute.post('/login', login);
authRoute.post('/logout', logout);
authRoute.get('/check', authenticationMiddleware, checkAuth);

authRoute.post('/verify-sms', authenticationMiddleware, verifySMS);

authRoute.post('/change-password', authenticationMiddleware, changePassword);
authRoute.post('/forgot-password', forgotPassword);
authRoute.post('/reset-password/:otp', emailVerifyMiddleware, emailOTPMiddleware, resetPassword);

authRoute.get('/login/google',
    passport.authenticate("google", {
        scope: [
            "profile",
            "email"
        ]
    })
);

authRoute.get('/login/google/callback',
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false
    }),
    googleLogin
);

export default authRoute;