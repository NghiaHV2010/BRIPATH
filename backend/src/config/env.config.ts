import dotenv from "dotenv";

interface Config {
    PORT: number;
    FRONTEND_URL: string;
    DATABASE_URL: string;
    ACCESS_SECRET: string;
    REFRESH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
}

dotenv.config();

const config: Config = {
    PORT: Number(process.env.PORT)!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    DATABASE_URL: process.env.DATABASE_URL!,
    ACCESS_SECRET: process.env.ACCESS_SECRET!,
    REFRESH_SECRET: process.env.REFRESH_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!
};

export default config;

