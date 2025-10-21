// ========================
// USER TYPE

import type { Job } from "./job";

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
  _count?: {
    applications?: number | 0;
    savedJobs?: number | 0;
    aiFeedbacks?: number | 0;
  };
  id: string;
  job_title: string;
  status: string;
  location: string;
  salary: string[]; // keep as array if API returns array
  currency: string;
  jobCategories?: {
    job_category: string;
  };
}

// ========================
// FEEDBACK TYPE
// ========================
export interface CompanyFeedback {
  stars: number;
  description: string;
  work_environment?: string | null;
  benefit?: string | null;
  created_at: string;
  users: {
    avatar_url?: string | null;
    gender?: string | null;
    username: string;
  };
}

// ========================
// FOLLOW RECORD TYPE
// (represents items inside `followedCompanies`)
// There are two shapes from API:
// - list response: { user_id, company_id, followed_at, is_notified }
// - detail response: { followed_at, is_notified }
// We keep optional fields to cover both.
// ========================
export interface FollowRecord {
  user_id?: string;
  company_id?: string;
  followed_at?: string; // ISO datetime
  is_notified?: boolean;
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
  is_verified?: boolean;

  // flag managed by frontend/store based on `followedCompanies` from API
  isFollowed?: boolean;

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
    jobs?: number;
  };
  companyTags?: any[] | null;
  feedbacks?: CompanyFeedback[] | null;
  is_verified?: boolean;
  company_type?: string;
  fields?: any | null;
  jobs?: Job[];

  followedCompanies?: FollowRecord[];

  isFollowed?: boolean;
}

export interface CompanyDetailResponse {
  success: boolean;
  data?: CompanyDetail;
  totalPages?: number;
}

export interface CompanyField {
  id: number;
  field_name: string;
}
