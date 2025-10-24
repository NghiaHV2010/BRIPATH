import jwt from 'jsonwebtoken';
import { Response } from "express";
import { ACCESS_SECRET, COOKIE_CONFIG_SAME_SITE, COOKIE_CONFIG_SECURE, REFRESH_SECRET, NODE_ENV } from '../config/env.config';

type cookieConfigResponse = {
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "none" | "strict";
    secure: boolean;
    path: string;
    domain?: string;
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

    const cookieOptions = cookieConfig(accessTokenExpiryTimeInMiliSecond);
    const refreshCookieOptions = cookieConfig(refreshTokenExpiryTimeInMiliSecond);

    // Debug logging for production
    if (NODE_ENV === 'production') {
        console.log('Setting cookies with options:', {
            sameSite: cookieOptions.sameSite,
            secure: cookieOptions.secure,
            httpOnly: cookieOptions.httpOnly,
            path: cookieOptions.path,
            domain: cookieOptions.domain
        });
    }

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
}

export const cookieConfig = (maxAge: number, secure?: boolean, path?: string): cookieConfigResponse => {
    const config: cookieConfigResponse = {
        maxAge,
        httpOnly: true,
        sameSite: COOKIE_CONFIG_SAME_SITE,
        secure: secure !== undefined ? secure : COOKIE_CONFIG_SECURE,
        path: path || '/'
    };

    // Set domain for production to work across subdomains
    if (NODE_ENV === 'production') {
        config.domain = '.bripath.online';
    }

    return config;
}