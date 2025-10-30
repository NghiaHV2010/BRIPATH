export interface ApplicantResponse<T> {
    success: boolean;
    data: {
        applicants: Applicant<T>[];
        total_pending: number;
        total_approved: number;
        total_rejected: number;
    };
    totalPages: number;
}

export interface Applicant<T> {
    cv_id: number;
    job_id: string;
    description: string;
    apply_date: string;
    verified_date: string | null;
    status: 'pending' | 'approved' | 'rejected';
    feedback: string | null;
    cvs: T;
}

export interface ApplicantSummary {
    id: number;
    fullname: string;
    apply_job: string;
    created_at: string;
    primary_skills: string[];
    users: {
        id: string;
        avatar_url: string;
    };
    _count: {
        projects: number;
        experiences: number;
        educations: number;
        certificates: number;
        languages: number;
        references: number;
        awards: number;
    };
}
