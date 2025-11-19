export interface IFILE {
    name: string;
    data: Buffer;
    size: number;
    mimetype: string;
}

export interface CV {
    fullname: string;
    email?: string | undefined;
    phone?: string | undefined;
    dob?: string | undefined;
    address?: string | undefined;
    primarySkills?: string[] | undefined;
    projects: [
        {
            project_title: string,
            project_description?: string | undefined,
            project_startDate?: string | undefined;
            project_endDate?: string | undefined;
        }
    ];
    experiences: [
        {
            startDate?: string | undefined;
            endDate?: string | undefined;
            company?: string | undefined;
            title?: string | undefined;
            description?: string | undefined;
        }
    ];
    educations: [
        {
            startDate?: string | undefined;
            endDate?: string | undefined;
            school?: string | undefined;
            gpa?: string | undefined;
            graduate_type?: string | undefined;
        }
    ];
    certificates: [
        {
            startDate?: string | undefined;
            endDate?: string | undefined;
            name?: string | undefined;
            link?: string | undefined;
            description?: string | undefined;
        }
    ];
    summary?: string | undefined;
    languages: [
        {
            name: string;
            certificate?: string | undefined;
            level?: string | undefined;
        }
    ];
    apply_job?: string | undefined;
    career_goal?: string | undefined;
    softSkills?: string[] | undefined;
    references: [
        {
            name: string;
            phone?: string | undefined;
            email?: string | undefined;
        }
    ];
    awards: [
        {
            title: string;
            description?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
        }
    ];
}

export interface CVStats {
    technical: number;
    communication: number;
    teamwork: number;
    problem_solving: number;
    creativity: number;
    leadership: number;
    summary: string
}