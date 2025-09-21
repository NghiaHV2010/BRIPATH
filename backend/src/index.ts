import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import config from './config/env.config';
import { errorMiddleware } from './middlewares/error.middleware';
import routes from './routes';

const { PORT, FRONTEND_URL } = config;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(routes);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: http://localhost:${PORT}`);
})

