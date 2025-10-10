// ========================
// USER TYPE
// ========================
export interface CompInfor {
  username: string;
  avatar_url?: string | null;
  phone?: string | null;
  address_street?: string | null;
  address_ward?: string | null;
  address_city?: string | null;
  address_country?: string | null;
  gender?: string | null;
  last_loggedIn?: string;
  created_at?: string;
  updated_at?: string;
  role_id?: number;
  phone_verified?: boolean;
  company_id?: string | null;
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
  id: string;
  background_url?: string | null;
  description?: string | null;
  employees?: number | null;
  users?: CompInfor | null;
  _count?: {
    followedCompanies?: number;
  };
  companyLabels?: any | null;
  feedbacks?: any[];
  fields?: any | null;
  jobs?: JobSummary[];
}





export interface CompanyField {
  id: number;
  field_name: string;
}