export interface Activity {
    id: number;
    activity_name: string;
    time: string;
    user_id: string;
}

export interface ActivityResponse {
    success: boolean;
    data: Activity[];
    totalPages: number;
}
