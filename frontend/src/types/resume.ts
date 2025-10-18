export interface Award {
    id: number;
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    cv_id?: number;
}

export interface Certificate {
    id: number;
    title?: string;
    link?: string;
    description?: string;
    start_date?: string | null;
    end_date?: string | null;
    cv_id?: number;
}

export interface Project {
    id: number;
    title?: string;
    description?: string;
    start_date?: string | null;
    end_date?: string | null;
    cv_id?: number;
}

export interface Education {
    id: number;
    school?: string;
    graduated_type?: string;
    gpa?: number | null;
    start_date?: string;
    end_date?: string;
    cv_id?: number;
}

export interface Experience {
    id: number;
    company_name?: string;
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string | null;
    cv_id?: number;
}

export interface Language {
    id: number;
    name?: string;
    certificate?: string;
    level?: string;
    cv_id?: number;
}

export interface Reference {
    id: number;
    name?: string;
    phone?: string;
    email?: string;
    cv_id?: number;
}

export interface Resume {
    id: number;
    fullname?: string;
    age?: number | null;
    gender?: string | null;
    address?: string;
    email?: string;
    introduction?: string;
    soft_skills?: string[];
    primary_skills?: string[];
    phone?: string;
    hobbies?: string | null;
    others?: string | null;
    apply_job?: string;
    career_goal?: string;
    created_at?: string;
    users_id?: string;
    awards?: Award[];
    certificates?: Certificate[];
    projects?: Project[];
    educations?: Education[];
    experiences?: Experience[];
    languages?: Language[];
    references?: Reference[];
}

export interface ResumeResponse {
    success: boolean;
    data: Resume;
}

export interface ResumeListItem {
    id: number;
    fullname: string;
    apply_job: string;
    created_at: string;
    primary_skills: string[];
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

export interface ResumeListResponse {
    success: boolean;
    data: ResumeListItem[];
}

export interface CVStats {
    id: number;
    cv_id: number;
    technical: number;
    communication: number;
    teamwork: number;
    problem_solving: number;
    creativity: number;
    leadership: number;
    summary: string;
    created_at: string;
    updated_at: string;
}

export interface CVStatsResponse {
    success: boolean;
    data: CVStats;
}
