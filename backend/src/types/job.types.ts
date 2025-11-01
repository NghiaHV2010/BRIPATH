export type GetJobByIDRequestDto = {
    jobId: string;
    userId?: string;
}

export type FilterJobsRequestDto = {
    name?: string;
    field?: string;
    location?: string;
    salary?: string[];
}

export type CreateJobRequestDto = {
    job_title: string;
    description: string;
    location?: string;
    benefit?: string;
    working_time?: string;
    salary?: string[];
    currency?: string;
    job_type?: 'remote' | 'part_time' | 'full_time' | 'others' | 'hybrid';
    status?: 'on_going';
    job_level: string;
    quantity?: number;
    skill_tags?: string[];
    education?: 'highschool_graduate' | 'phd' | 'master' | 'bachelor' | 'others';
    experience?: string;
    start_date: string | Date;
    end_date?: string | Date;
    category?: string;
    label_type?: 'Việc gấp' | 'Việc chất' | 'Việc Hot';
    jobCategory_id: number;
    label_id?: number;
    label_start_at?: Date;
    label_end_at?: Date;
    company_id: string;
}

export type JobStats = {
    technical: number;
    communication: number;
    teamwork: number;
    problem_solving: number;
    creativity: number;
    leadership: number;
    summary: string;
}