export interface UserNotificationDto {
    title: string;
    content: string;
    type: "system" | "pricing_plan" | "applicant" | "followed";
    user_id: string;
}