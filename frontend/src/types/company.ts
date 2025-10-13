// ========================
// USER TYPE
// ========================
export interface CompInfor {
  username: string;
  avatar_url?: string | null;
  address_street?: string | null;
  address_ward?: string | null;
  address_city?: string | null;
  address_country?: string | null;
}

// ========================
// JOB TYPE (for CompanyDetail)
// ========================
export interface JobSummary {
  id: string;
  job_title: string;
  status: string;
  location: string;
  salary: string[];
  currency: string;
  jobCategories?: {
    job_category: string;
  };
  jobLabels?: any | null;
}

// ========================
// COMPANY LIST TYPE
// ========================
export interface CompanySummary {
  id: string;
  company_type: string;
  users?: CompInfor | null;
  companyLabels?: any | null;
  fields?: any | null;
  _count?: {
    jobs?: number;
  };
}

// ========================
// COMPANY DETAIL TYPE
// ========================
export interface CompanyDetail {
  success: boolean;
  data: {
    id: string;
    background_url?: string | null;
    description?: string | null;
    employees?: number | null;
    users?: CompInfor | null;
    _count?: {
      followedCompanies?: number;
      jobs?: number;
    };
    companyLabels?: any | null;
    feedbacks?: any[];
    is_verified?: boolean;
    company_type?: string;
    fields?: any | null;
    jobs?: JobSummary[];
  };
  totalPages: number;
}

export interface CompanyField {
  id: number;
  field_name: string;
}