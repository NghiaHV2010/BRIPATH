import nodemailer from 'nodemailer';
import { GMAIL_APP_PASSWORD, GMAIL_USER } from './env.config';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});

export default transporter;