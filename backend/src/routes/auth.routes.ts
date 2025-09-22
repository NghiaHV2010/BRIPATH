import { Router, RouterOptions } from "express";
import { register, login, checkAuth, logout, googleLogin } from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import passport from "passport";

const authRoute = Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logout', authMiddleware, logout);
authRoute.get('/check', authMiddleware, checkAuth);

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