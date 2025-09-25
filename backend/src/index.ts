import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { PORT, FRONTEND_URL } from './config/env.config';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRoute, vnpayRoutes, zalopayRoutes, paymentRoutes, dashboardRoutes } from './routes';
import passport from './config/passport.config';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(passport.initialize());

// App routes
app.use('/api/auth', authRoute);
app.use('/api/vnpay', vnpayRoutes);
app.use('/api/zalopay', zalopayRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// App error middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: http://localhost:${PORT}`);
})

