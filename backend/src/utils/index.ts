import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, GMAIL_USER } from "../config/env.config";
import transporter from "../config/nodemailer.config";
import { CAREERPATHPROMPT } from "../constants/prompt";

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

export function sendEmail(email: string, subject: string, content: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Validate inputs
        if (!email || !validateEmail(email)) {
            console.error('Invalid email address:', email);
            return reject(new Error('Invalid email address'));
        }

        if (!subject || !content) {
            console.error('Missing subject or content');
            return reject(new Error('Missing subject or content'));
        }

        const mailOptions = {
            from: GMAIL_USER,
            to: email,
            subject: subject,
            html: content
        };

        // Log email attempt (without sensitive data)
        console.log(`Attempting to send email to: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending failed:', {
                    error: error.message,
                    code: (error as any).code || 'UNKNOWN',
                    command: (error as any).command || 'UNKNOWN',
                    to: email.replace(/(.{2}).*(@.*)/, '$1***$2')
                });

                // Return a more specific error message based on error type
                const errorCode = (error as any).code;
                if (errorCode === 'EAUTH') {
                    return reject(new Error('Email authentication failed - check credentials'));
                } else if (errorCode === 'ECONNECTION') {
                    return reject(new Error('Email connection failed - check network'));
                } else if (errorCode === 'ETIMEDOUT') {
                    return reject(new Error('Email sending timed out'));
                } else {
                    return reject(new Error(`Email sending failed: ${error.message}`));
                }
            }

            console.log('Email sent successfully:', {
                messageId: info.messageId,
                to: email.replace(/(.{2}).*(@.*)/, '$1***$2')
            });

            resolve(true);
        });
    });
}

// Enhanced email sending with retry mechanism for production
export async function sendEmailWithRetry(
    email: string,
    subject: string,
    content: string,
    maxRetries: number = 3
): Promise<boolean> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Email sending attempt ${attempt}/${maxRetries} to: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

            await sendEmail(email, subject, content);
            console.log(`Email sent successfully on attempt ${attempt}`);
            return true;

        } catch (error) {
            lastError = error as Error;
            console.error(`Email sending attempt ${attempt} failed:`, lastError.message);

            // Don't retry for authentication errors
            if (lastError.message.includes('authentication failed')) {
                throw lastError;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw new Error(`Email sending failed after ${maxRetries} attempts: ${lastError!.message}`);
}

type CareerPathReturnType = {
    title: string,
    description: string,
    resources: string,
    level: string,
    estimate_duration: string,
    careerPathSteps: [
        {
            title: string,
            description: string,
            resources: string
        }
    ]
}

export const generateCareerPath = async (jobSpecialize: string): Promise<CareerPathReturnType | Error> => {

    const AI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    try {
        const response = await AI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: jobSpecialize,
            config: {
                systemInstruction: CAREERPATHPROMPT,
                responseMimeType: "application/json"
            }
        });

        const data = JSON.parse(response.text!);
        return data as CareerPathReturnType;
    } catch (error) {
        return error as Error;
    }
}

type NotificationType = {
    title: string;
    content: string;
    type: 'system' | 'pricing_plan' | 'applicant' | 'followed';
};

type StatusType =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'on_going'
    | 'over_date'
    | 'canceled';

type RoleType = 'user' | 'company';

export const createNotificationData = (
    title?: string,
    status?: StatusType,
    type: NotificationType['type'] = 'system',
    role?: RoleType,
    feedback?: string
): NotificationType => {
    const notification: NotificationType = {
        title: '',
        content: '',
        type,
    };

    switch (type) {
        // ======================= SYSTEM =======================
        case 'system':
            if (role === 'user') {
                switch (status) {
                    case 'approved':
                        notification.title = 'Quản trị viên đã phê duyệt sự kiện của bạn!';
                        notification.content = `Tin "${title}" đã được hiển thị công khai trên hệ thống. \n ${feedback}`;
                        break;
                    case 'rejected':
                        notification.title = 'Quản trị viên đã từ chối sự kiện của bạn!';
                        notification.content = `Tin "${title}" không đạt yêu cầu, vui lòng kiểm tra lại thông tin. \n ${feedback}`;
                        break;
                    default:
                        notification.title = `Tin ${title} đang chờ phê duyệt`;
                        notification.content = 'Hệ thống sẽ xử lý trong vòng 24 giờ.';
                        break;
                }
            } else if (role === 'company') {
                switch (status) {
                    case 'approved':
                        notification.title = 'Tài khoản doanh nghiệp đã được phê duyệt!';
                        notification.content = `Bạn đã có thể đăng tải các công việc lên hệ thống. \n ${feedback}`;
                        break;
                    case 'rejected':
                        notification.title = 'Tài khoản doanh nghiệp bị từ chối!';
                        notification.content = `Vui lòng kiểm tra hoặc bổ sung thông tin. \n ${feedback}`;
                        break;
                    default:
                        notification.title = 'Tài khoản đang chờ phê duyệt';
                        notification.content = 'Hệ thống sẽ xử lý trong vòng 24 giờ.';
                        break;
                }
            }
            break;

        // ======================= PRICING PLAN =======================
        case 'pricing_plan':
            switch (status) {
                case 'on_going':
                    notification.title = 'Gói đăng tuyển đang hoạt động';
                    notification.content = `Gói ${title} của bạn đang được sử dụng.`;
                    break;
                case 'over_date':
                    notification.title = 'Gói đăng tuyển đã hết hạn';
                    notification.content = `Gói ${title} của bạn đã hết hạn, vui lòng gia hạn để tiếp tục.`;
                    break;
                case 'canceled':
                    notification.title = 'Gói đăng tuyển đã bị hủy';
                    notification.content = `Gói ${title} của bạn đã bị hủy, liên hệ quản trị viên để biết thêm chi tiết.`;
                    break;
                default:
                    notification.title = `Gói ${title} sắp hết hạn.`;
                    notification.content = `Gói ${title} sẽ ngừng hoạt động vào ngày ${feedback}. Vui lòng gia hạn để tiếp tục sử dụng.`;
                    break;
            }
            break;

        // ======================= APPLICANT =======================
        case 'applicant':
            if (role === 'user') {
                switch (status) {
                    case 'approved':
                        notification.title = 'Xin chúc mừng! Hồ sơ của bạn đã được phê duyệt!';
                        notification.content = `Nhà tuyển dụng đã chấp nhận hồ sơ ứng tuyển cho sự kiện "${title}". \n ${feedback}`;
                        break;
                    case 'rejected':
                        notification.title = 'Hồ sơ của bạn đã bị từ chối!';
                        notification.content = `Nhà tuyển dụng đã từ chối hồ sơ ứng tuyển cho sự kiện "${title}". \n ${feedback}`;
                        break;
                    case 'pending':
                        notification.title = 'Hồ sơ của bạn đang chờ phê duyệt';
                        notification.content = 'Vui lòng chờ nhà tuyển dụng xem xét hồ sơ ứng tuyển của bạn.';
                        break;
                }
            } else if (role === 'company') {
                switch (status) {
                    case 'approved':
                        notification.title = 'Hồ sơ ứng tuyển của bạn đã được phê duyệt!';
                        notification.content = `Nhà tuyển dụng đã chấp nhận hồ sơ ứng tuyển cho công việc "${title}". \n ${feedback}`;
                        break;
                    case 'rejected':
                        notification.title = 'Hồ sơ ứng tuyển của bạn đã bị từ chối!';
                        notification.content = `Nhà tuyển dụng đã từ chối hồ sơ ứng tuyển cho công việc "${title}". \n ${feedback}`;
                        break;
                    case 'pending':
                        notification.title = 'Hồ sơ ứng tuyển của bạn đang chờ phê duyệt';
                        notification.content = 'Vui lòng chờ nhà tuyển dụng xem xét hồ sơ ứng tuyển của bạn.';
                        break;
                }
            }
            break;

        // ======================= FOLLOWED =======================
        case 'followed':
            if (role === 'user') {
                notification.title = `Có công việc mới được đăng tải!`;
                notification.content = `${title} vừa đăng tải công việc mới.`;
            } else if (role === 'company') {
                notification.title = `Có người mới theo dõi bạn!`;
                notification.content = `${title ?? 'Người dùng'} vừa theo dõi bạn.`;
            }
            break;
    }

    return notification;
};

// ============== VNPay in-memory order mapping (dev/sandbox only) ==============
const vnpayOrderStore: Map<string, { user_id: string; amount: number }> = new Map();

export const vnpayOrderMapping = {
    set(txnRef: string, data: { user_id: string; amount: number }) {
        vnpayOrderStore.set(txnRef, data);
    },
    get(txnRef: string) {
        return vnpayOrderStore.get(txnRef);
    },
    delete(txnRef: string) {
        vnpayOrderStore.delete(txnRef);
    }
};

// ============== Idempotency helper ==============
export const hasPaymentByTransactionId = async (prisma: any, transactionId?: string): Promise<boolean> => {
    if (!transactionId) return false;
    const existing = await prisma.payments.findFirst({ where: { transaction_id: transactionId } });
    return !!existing;
};