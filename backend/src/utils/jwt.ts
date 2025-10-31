import jwt from "jsonwebtoken";
import { Response } from "express";
import {
    ACCESS_SECRET,
    REFRESH_SECRET
} from "../config/env.config";
import { setCookie } from "../utils/cookie.util";

const ACCESS_EXP_MS = 45 * 60 * 1000; // 45 phút
const REFRESH_EXP_MS = 24 * 60 * 60 * 1000; // 1 ngày

export const generateToken = (userId: string, res: Response) => {
    const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "45m" });
    const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "1d" });

    setCookie(res, "accessToken", accessToken, ACCESS_EXP_MS);
    setCookie(res, "refreshToken", refreshToken, REFRESH_EXP_MS);
};
