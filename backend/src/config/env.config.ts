import dotenv from "dotenv";

interface Config {
    PORT: number;
    FRONTEND_URL: string;
}

dotenv.config();

const config: Config = {
    PORT: Number(process.env.PORT)!,
    FRONTEND_URL: process.env.FRONTEND_URL!
};

export default config;

