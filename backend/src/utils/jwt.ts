import jwt from 'jsonwebtoken';
import { Response } from "express";
import { ACCESS_SECRET, REFRESH_SECRET } from '../config/env.config';

type cookieConfigResponse = {
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "none" | "strict";
    secure: boolean
}

const accessTokenExpiryTimeInMiliSecond: number = 45 * 60 * 1000;

const refreshTokenExpiryTimeInMiliSecond: number = 24 * 60 * 60 * 1000;

export const generateToken = (userId: string, res: Response) => {
    const accessToken = jwt.sign(
        { userId },
        ACCESS_SECRET,
        { expiresIn: "45m" }
    );
    const refreshToken = jwt.sign(
        { userId },
        REFRESH_SECRET as string,
        { expiresIn: "1d" }
    );


    res.cookie("accessToken", accessToken, cookieConfig(accessTokenExpiryTimeInMiliSecond))
    res.cookie("refreshToken", refreshToken, cookieConfig(refreshTokenExpiryTimeInMiliSecond))
}

export const cookieConfig = (maxAge: number, secure: boolean = false): cookieConfigResponse => {
    return {
        maxAge,
        httpOnly: true,
        sameSite: 'strict',
        secure
    }
}