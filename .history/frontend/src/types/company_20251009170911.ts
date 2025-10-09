export type CompanySummary = {
  id: string;
  company_type: string;
  users?: AuthUser | null;
  companyLabels?: any | null;
  fields?: any | null;
  _count?: {
    jobs?: number;
  };
};

export interface CompanyDetail {
  id: string;
  background_url?: string | null;
  description?: string | null;
  employees?: number | null;
  users: AuthUser;
  _count: {
    followedCompanies: number;
  };
  companyLabels?: any | null;
  feedbacks?: any[];
  fields?: any | null;
  jobs?: JobSummary[];
}

export interface JobSummary {
  id: string;
  job_title: string;
  salary: string[];
  currency: string;
  location: string;
  status: string;
  jobCategories?: {
    job_category: string;
  };
  jobLabels?: any | null;
}
