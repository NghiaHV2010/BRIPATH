export type NotificationType = 'system' | 'pricing_plan' | 'applicant' | 'followed';

export interface Notification {
    id: number;
    user_id: string;
    title: string;
    content: string;
    type: NotificationType;
    is_read: boolean;
    sent_at: string;
    read_at: string | null;
}

export interface NotificationResponse {
    success: boolean;
    data: Notification[];
    totalPages?: number;
}
