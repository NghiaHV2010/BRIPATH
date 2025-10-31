import { Response } from "express";
import {
    COOKIE_CONFIG_SAME_SITE,
    COOKIE_CONFIG_SECURE,
    DOMAIN
} from "../config/env.config";

type SameSiteOption = "lax" | "none" | "strict";

export type CookieConfig = {
    maxAge?: number;
    httpOnly?: boolean;
    sameSite?: SameSiteOption;
    secure?: boolean;
    path?: string;
    domain?: string;
};

/**
 * 🔧 Tạo config cookie chung
 */
export const getCookieOptions = (
    maxAge?: number,
    path: string = "/",
    domain: string = DOMAIN,
    secure: boolean = COOKIE_CONFIG_SECURE,
    sameSite: SameSiteOption = COOKIE_CONFIG_SAME_SITE
): CookieConfig => ({
    maxAge,
    httpOnly: true,
    sameSite,
    secure,
    path,
    domain,
});

/**
 * 🍪 Hàm helper để đặt cookie (tạo hoặc xóa)
 * @param res Response object
 * @param name Tên cookie
 * @param value Giá trị (nếu xóa thì truyền '')
 * @param maxAge Thời gian sống (ms) - nếu = 0 hoặc không truyền => xóa cookie
 */
export const setCookie = (
    res: Response,
    name: string,
    value: string = "",
    maxAge: number = 0
) => {
    const options = getCookieOptions(maxAge);
    res.cookie(name, value, options);
};

/**
 * ❌ Xóa cookie
 */
export const clearCookie = (res: Response, name: string) => {
    res.cookie(name, "", getCookieOptions(0));
};
