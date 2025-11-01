export interface membershipPlans {
    ai_matchings: boolean;
    ai_networking_limit: number;
    id?: number;
    plan_name?: string;
    description?: string;
    price?: number;
    duration_months?: number;
    is_active?: boolean;
    urgent_jobs_limit?: number;
    quality_jobs_limit?: number;
    total_jobs_limit?: number;
    verified_badge?: boolean;
    recommended_labels?: boolean;
    highlighted_hot_jobs?: boolean;
    created_at?: Date;
    updated_at?: Date;
}


export interface SubscriptionDto {
    id: string;
    remaining_urgent_jobs: number;
    remaining_quality_jobs: number;
    remaining_total_jobs: number;
    membershipPlans: membershipPlans;
    start_date?: Date;
    end_date?: Date;
    amount_paid?: number;
    is_extended?: boolean;
    status?: 'on_going' | 'over_date' | 'canceled';
    user_id?: string;
    plan_id?: number;
    payment_id?: string;
}