import { Router, RouterOptions } from "express";
import { register, login, checkAuth, logout } from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";

const authRoute = Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logout', authMiddleware, logout);
authRoute.get('/check', authMiddleware, checkAuth);

export default authRoute;