import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRoute, cvRouter, vnpayRoutes, zalopayRoutes, paymentRoutes, dashboardRoutes, companyRouter, userRouter, jobRouter, questionRouter, eventRouter } from './routes';
import passport from './config/passport.config';
import { FRONTEND_URL, PORT } from './config/env.config';
import fileUpload from "express-fileupload";
import "./jobs/subscriptionReminder";
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
app.use('/api', authRoute);
app.use('/api', companyRouter);
app.use('/api', jobRouter);
app.use('/api', eventRouter);
app.use('/api/vnpay', vnpayRoutes);
app.use('/api/zalopay', zalopayRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', cvRouter);
app.use('/api', userRouter);
app.use('/api', questionRouter);

app.use(testRouter);

// App error middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: http://localhost:${PORT}`);
})

