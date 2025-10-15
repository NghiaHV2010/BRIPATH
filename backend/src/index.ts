import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from "http";
import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRoute, cvRouter, vnpayRoutes, zalopayRoutes, paymentRoutes, dashboardRoutes, companyRouter, userRouter, jobRouter, questionRouter, eventRouter, pricingRouter } from './routes';
import passport from './config/passport.config';
import { FRONTEND_URL, PORT } from './config/env.config';
import fileUpload from "express-fileupload";
import "./jobs/subscriptionReminder";
import './jobs/subscriptionJob';
import { setupWebSocket } from './libs/wsServer';

import testRouter from './routes/test.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(fileUpload());

app.use(passport.initialize());

const middlePath = '/api';

// App routes
app.use(`${middlePath}`, authRoute);
app.use(`${middlePath}`, pricingRouter);
app.use(`${middlePath}`, companyRouter);
app.use(`${middlePath}`, jobRouter);
app.use(`${middlePath}`, eventRouter);
app.use(`${middlePath}`, cvRouter);
app.use(`${middlePath}`, userRouter);
app.use(`${middlePath}`, questionRouter);
app.use(`${middlePath}/vnpay`, vnpayRoutes);
app.use(`${middlePath}/zalopay`, zalopayRoutes);
app.use(`${middlePath}/payments`, paymentRoutes);
app.use(`${middlePath}/dashboard`, dashboardRoutes);

// app.use(testRouter);

// App error middleware
app.use(errorMiddleware);

// 🧩 Tạo server HTTP để dùng chung với WebSocket
const server = http.createServer(app);

// 🧩 Gắn WebSocket server vào cùng cổng
setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 Server (HTTP + WS) chạy tại: http://localhost:${PORT}`);
});
