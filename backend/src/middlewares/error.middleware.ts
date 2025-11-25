import { NextFunction, Request, Response } from "express";
import { HTTP_ERROR } from "../constants/httpCode";

interface Error {
    status: number;
    message: string;
}

// export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
//     try {
//         res.status(err.status || HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
//             success: false,
//             message: err.message || 'Internal server error.'
//         });
//     } catch (error) {
//         next(error);
//     }
// }

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    try {
        // Log error details for debugging
        console.error('🚨 Error Middleware triggered');
        console.error('📍 URL:', req.originalUrl || req.url);
        console.error('🌐 Method:', req.method);
        console.error('❌ Error status:', err.status);
        console.error('❌ Error message:', err.message);
        console.error('❌ Full error:', JSON.stringify(err, null, 2));

        // Don't send error response if headers already sent (e.g., webhook already responded)
        if (res.headersSent) {
            console.error('⚠️ Headers already sent, cannot send error response');
            return next(err);
        }

        res.status(err.status || HTTP_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: err.message || 'Internal server error.'
        });
    } catch (error) {
        console.error('🚨 Error in error middleware:', error);
        next(error);
    }
}