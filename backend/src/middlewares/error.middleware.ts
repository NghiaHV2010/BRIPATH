import { NextFunction, Request, Response } from "express";
import { HTTP_ERROR } from "../constants/httpCode";

interface Error {
    status: number;
    message: string;
}

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(err.status || HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            message: err.message || 'Internal server error.'
        });
    } catch (error) {
        next(error);
    }
}