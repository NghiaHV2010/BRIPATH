export interface Subscription {
    id: string
    plan_id: number
    plan_name: string
    plan_ai_networking_limit: number
    plan_total_jobs_limit: number
    plan_urgent_jobs_limit: number
    plan_quality_jobs_limit: number
    start_date: string
    end_date: string
    status: 'on_going' | 'over_date' | 'canceled'
    amount_paid: number
    remaining_urgent_jobs: number
    remaining_quality_jobs: number
    remaining_total_jobs: number
    is_extended: boolean
}

export interface SubscriptionResponse {
    success: boolean
    data: Subscription[]
}
