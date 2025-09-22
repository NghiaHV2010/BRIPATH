import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { errorHandler } from "../utils/error";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;

        const isExisted = await prisma.users.findFirst({
            where: {
                email
            },
            omit: {
                password: true
            }
        });

        if (isExisted) {
            return next(errorHandler(HTTP_ERROR.CONFLICT, "Email is already existed!"));
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await prisma.users.create({
            data: {
                username,
                email,
                password: hashPassword,
                role_id: 1
            }
        });

        if (user) {
            return res.status(HTTP_SUCCESS.CREATED).json({
                message: "Register Successfully!"
            });
        }
    } catch (error) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findFirst({
            where: {
                email
            }
        });

        if (!user) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Invalid Credentials!"));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return next(errorHandler(HTTP_ERROR.BAD_REQUEST, "Invalid Credentials!"));
        }

        generateToken(user.id, res);

        return res.status(HTTP_SUCCESS.OK).json({
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar_url
            }
        });
    } catch (error) {
        next(error);
    }
}

export const logout = (req: Request, res: Response) => {
    res.cookie("accessToken", '', { maxAge: 0 });
    res.cookie("refreshToken", '', { maxAge: 0 });

    return res.status(HTTP_SUCCESS.OK).json({
        message: "Logout successfully!"
    });
}

export const checkAuth = (req: Request, res: Response) => {
    res.status(HTTP_SUCCESS.OK).json({
        // @ts-ignore
        data: req.user
    });
}

export const googleLogin = (req: Request, res: Response) => {
    type userDTO = {
        id: string;
        username: string;
        email: string;
        avatar_url: string;
    }

    const user: userDTO = req.user as userDTO;

    generateToken(user.id, res);

    return res.status(HTTP_SUCCESS.OK).json({
        data: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar_url
        }
    });
}