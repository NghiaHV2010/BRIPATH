import { Router } from "express";
import { login, checkAuth, logout, googleLogin, sendOTP, validateRegisterInput, verifyEmail, verifySMS } from "../controllers/auth.controller";
import { authenticationMiddleware, emailOTPMiddleware, emailVerifyMiddleware } from "../middlewares/auth.middleware";
import passport from "passport";

const authRoute = Router();

authRoute.post('/register', sendOTP);

authRoute.post('/register/validate', validateRegisterInput);
authRoute.get('/register/email/', emailVerifyMiddleware, sendOTP);
authRoute.get('/register/email/:otp', emailVerifyMiddleware, emailOTPMiddleware, verifyEmail);

authRoute.post('/login', login);
authRoute.post('/logout', authenticationMiddleware, logout);
authRoute.get('/check', authenticationMiddleware, checkAuth);

authRoute.post('/verify-sms', authenticationMiddleware, verifySMS)

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