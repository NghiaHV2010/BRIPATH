import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/env.config";
import { CAREERPATHPROMPT } from "../constants/prompt";

export function convertDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
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
                        notification.content = `Nhà tuyển dụng đã chấp nhận hồ sơ ứng tuyển cho "${title}". \n ${feedback}`;
                        break;
                    case 'rejected':
                        notification.title = 'Hồ sơ của bạn đã bị từ chối!';
                        notification.content = `Nhà tuyển dụng đã từ chối hồ sơ ứng tuyển cho "${title}". \n ${feedback}`;
                        break;
                    case 'pending':
                        notification.title = `Hồ sơ của bạn đang chờ phê duyệt cho ${title.toUpperCase()}`;
                        notification.content = 'Vui lòng chờ nhà tuyển dụng xem xét hồ sơ ứng tuyển của bạn.';
                        break;
                }
            } else if (role === 'company') {
                switch (status) {
                    case 'pending':
                        notification.title = `Có hồ sơ ứng tuyển mới cần phê duyệt cho ${title.toUpperCase()}`;
                        notification.content = `${feedback}`;
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