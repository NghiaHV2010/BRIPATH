import { GMAIL_USER } from "../config/env.config";
import transporter from "../config/nodemailer.config";

/**
 * Validate email
 * @param email - chuỗi email cần validate
 * @returns true nếu email hợp lệ, false nếu không
 */
export function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}


export function convertDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
}

export function sendEmail(email: string, subject: string, content: string) {
    transporter.sendMail({
        from: GMAIL_USER,
        to: email,
        subject: subject,
        html: content
    },
        (error, info) => {
            if (error) throw new Error("Send email failed!");
        }
    );
}