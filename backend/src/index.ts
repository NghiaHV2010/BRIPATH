import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRoute,cvRouter, vnpayRoutes, zalopayRoutes, paymentRoutes, dashboardRoutes } from './routes';
import passport from './config/passport.config';
import { FRONTEND_URL, PORT } from './config/env.config';
import fileUpload from "express-fileupload";
import "./jobs/subscriptionReminder";

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

// App routes
app.use('/api', authRoute);
app.use('/api/vnpay', vnpayRoutes);
app.use('/api/zalopay', zalopayRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', cvRouter);

// App error middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: http://localhost:${PORT}`);
})

