import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from "http";
import express from 'express';
import { errorMiddleware, timeoutMiddleware, generalLimiter, apiLimiter } from './middlewares';
import { authRoute, cvRouter, paymentRoutes, dashboardRoutes, companyRouter, userRouter, jobRouter, questionRouter, eventRouter, pricingRouter, sepayRoutes, subscriptionsRouter, settingRouter, blogRouter } from './routes';
import passport from './config/passport.config';
import { FRONTEND_URLS, PORT, NODE_ENV } from './config/env.config';
import fileUpload from "express-fileupload";
import "./jobs/subscriptionReminder";
import './jobs/subscriptionJob';
import { setupWebSocket } from './libs/wsServer';
import { SubscriptionDto } from './types/subscription.types';

const app = express();

declare global {
    namespace Express {
        interface Request {
            plan?: SubscriptionDto;
        }
    }
}

// Configure trust proxy securely based on environment
if (NODE_ENV === 'production') {
    // In production, trust only the first proxy (Render's load balancer)
    app.set('trust proxy', 1);
} else {
    // In development, no proxy needed
    app.set('trust proxy', false);
}

// Apply timeout middleware
app.use(timeoutMiddleware);

// Apply general rate limiting to all requests
app.use(generalLimiter);

app.use(express.json({ limit: '10mb' })); // Add size limit for JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Add size limit for URL encoded data
app.use(cookieParser());
interface CorsOriginCallback {
    (err: Error | null, allow?: boolean): void;
}

interface CorsOriginChecker {
    (origin: string | undefined, callback: CorsOriginCallback): void;
}

app.use(cors({
    origin: ((origin: string | undefined, callback: CorsOriginCallback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        // Check if the origin is in the allowed list
        if (FRONTEND_URLS.includes(origin)) {
            return callback(null, true);
        }

        // Log rejected origins for debugging
        console.warn(`CORS rejected origin: ${origin}`);
        console.log(`Allowed origins: ${FRONTEND_URLS.join(', ')}`);

        return callback(new Error('Not allowed by CORS'), false);
    }) as CorsOriginChecker,
    credentials: true,
}));

app.use(fileUpload());

app.use(passport.initialize());

const middlePath = '/api';

app.use(`${middlePath}`, authRoute);
app.use(`${middlePath}`, apiLimiter, blogRouter);
app.use(`${middlePath}`, apiLimiter, pricingRouter); // Apply API rate limiting
app.use(`${middlePath}`, apiLimiter, companyRouter);
app.use(`${middlePath}`, apiLimiter, jobRouter);
app.use(`${middlePath}`, apiLimiter, eventRouter);
app.use(`${middlePath}`, apiLimiter, cvRouter);
app.use(`${middlePath}`, apiLimiter, userRouter);
app.use(`${middlePath}`, apiLimiter, settingRouter);
app.use(`${middlePath}`, apiLimiter, questionRouter);
app.use(`${middlePath}/sepay`, sepayRoutes);
app.use(`${middlePath}/subscriptions`, subscriptionsRouter);
app.use(`${middlePath}/payments`, paymentRoutes);
app.use(`${middlePath}/dashboard`, dashboardRoutes);

// App error middleware
app.use(errorMiddleware);

// 🧩 Tạo server HTTP để dùng chung với WebSocket
const server = http.createServer(app);

// 🧩 Gắn WebSocket server vào cùng cổng
setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 Server (HTTP + WS) chạy tại: http://localhost:${PORT}`);
});
