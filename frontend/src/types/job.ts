
export type JobCategory = {
  job_category: string;
};


export interface Job {
  id: string; // UUID format
  job_title: string;
  salary?: string[]; // Array of salary ranges
  currency?: string; // "VND", "USD", etc.
  location?: string;
  status?: "on_going" | "closed" | "draft"; // Job status enum
  jobCategories?: JobCategory | null;
  jobLabels?: any | null; 
}


// chi tiết cho trang job detail
export interface JobDetail extends Job {
  description?: string;
  benefit?: string | null;
  working_time?: string | null;
  job_type?: string;
  job_level?: string;
  quantity?: number;
  skill_tags?: string[];
  education?: string;
  experience?: string;
  start_date?: string;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
  jobCategory_id?: number;
  label_id?: string | null;
  company_id?: string;

  companies?: {
    id: string;
    users: {
      username: string;
      avatar_url?: string;
      address_street?: string | null;
      address_ward?: string | null;
      address_city?: string | null;
      address_country?: string | null;
    };
    fields?: any;
  };
}

export interface FetchJobParams {
  page: number;      // bắt buộc
  userId?: string;   // tuỳ chọn — có thể bỏ qua
}

export interface FetchJobDetailParams {
  jobId: string;     // bắt buộc
  userId?: string;   // tuỳ chọn — có thể bỏ qua
}

export interface FilterJobParams {
  page: number;               // bắt buộc
  userId?: string;            // optional — để kiểm tra saved/applied jobs
  name?: string;              // optional — tìm kiếm theo tên job
  field?: string | string[];  // optional — thực chất là job category
  location?: string;          // optional — địa điểm
  salary?: string;            // optional — mức lương
}


export interface FetchJobByComId {
    companyId: string; // bắt buộc
    page: number; // bắt buộc
    userId?: string; // tuỳ chọn — có thể bỏ quas
}


export interface JobResponse {
    success : boolean;
  data: Job[];
  totalPages?: number | null;
}

export interface SingleJobResponse {
  data: Job[];
}