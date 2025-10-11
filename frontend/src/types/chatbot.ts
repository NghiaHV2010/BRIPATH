export interface ChatMessage {
    id?: number;
    message_content: string;
    response_content?: string;
    created_at?: string;
    user_id?: string;
}

export interface ChatResponse {
    success: boolean;
    data: ChatMessage[];
}

export interface SendMessageRequest {
    content: string;
}
