import axiosConfig from "@/config/axios.config";
import type { Applicant, ApplicantResponse, ApplicantSummary } from "@/types/applicant";
import type { CompanySummary, CompanyField, CompanyDetailResponse, CompanyRegistrationPayload, CompanyRegisterResponse } from "@/types/company";
import type { Resume, ResumeUserAvatar } from "@/types/resume";
// ========================
// Get all companies
// ========================
export const getAllCompanies = async (
  page: number,
  userId: string
): Promise<{ data: CompanySummary[]; totalPages: number }> => {
  const response = await axiosConfig.get<{
    data: CompanySummary[];
    totalPages: number;
  }>(
    "/companies",
    {
      params: {
        page,
        userId,
      },
    }
  );
  return response.data;
};
// ========================
// Get company details by ID
// ========================
// 📁 src/api/company_api.ts
export const getCompanyDetails = async (
  userId: string,
  companyId: string,
  page: number = 1
): Promise<CompanyDetailResponse> => {
  const res = await axiosConfig.get<CompanyDetailResponse>("/company", {
    params: { userId, companyId, page },
  });

  if (!res.data.success) {
    throw new Error("Failed to fetch company details");
  }

  return res.data;
};


// ========================
// Filter companies
// ========================
export const apiFilterCompanies = async (
  page: number | 1,
  name?: string,
  location?: string,
  field?: string,
  userId?: string
): Promise<CompanySummary[]> => {
  const response = await axiosConfig.get<{ data: CompanySummary[] }>(
    "/filter-companies",
    {
      params: {
        page: page || '',
        name: name || '',
        location: location || '',
        field: field || '',
        userId: userId || ''
      },
    }
  );
  return response.data.data;
};


export const fetchFields = async (): Promise<CompanyField[]> => {
  try {
    const response = await axiosConfig.get<{ data: CompanyField[] }>("/company/fields");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching fields:", error);
    throw error;
  }
}

// ========================
// Feedback CV
// ========================
export const feedbackCV = async (
  cvId: string,
  is_good: boolean,
  job_id: string
): Promise<{
  success: boolean;
  data: {
    id: number;
    role: string;
    job_id: string;
    cv_id: number;
    is_good: boolean;
    saved_at: string;
  };
}> => {
  const response = await axiosConfig.post(`/feedback/cv/${cvId}`, {
    is_good,
    job_id,
  });

  return response.data;
};

// ========================
// Feedback Company (User -> Company)
// ========================
export const feedbackCompany = async (
  companyId: string,
  payload: {
    description: string;
    stars: number;
    benefit?: string;
    work_environment?: string;
  }
): Promise<{
  success: boolean;
  data: {
    id: number;
    description: string;
    stars: number;
    benefit?: string | null;
    work_environment?: string | null;
    company_id: string;
    user_id: string;
    created_at: string;
  };
}> => {
  const res = await axiosConfig.post(`/feedback/company/${companyId}`, payload);
  return res.data;
};

// ========================
// follow company
// ========================
export const followCompany = async (companyId: number): Promise<{ success: boolean; data: any }> => {
  try {
    const response = await axiosConfig.get(`/follow-company/${companyId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error following company:", error.response?.data || error.message);
    return { success: false, data: null };
  }
};


export const unfollowCompany = async (
  companyId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosConfig.delete(`/follow-company/${companyId}`);
    console.log("Unfollow comp:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error unfollowing company:", error.response?.data || error.message);
    throw error;
  }
};

export const getCompanyFields = async (): Promise<CompanyField[]> => {
  try {
    const response = await axiosConfig.get('/company/fields');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching company fields:', error);
    throw error;
  }
};

export const registerCompany = async (
  payload: CompanyRegistrationPayload
): Promise<CompanyRegisterResponse> => {
  try {
    const res = await axiosConfig.post<
      CompanyRegisterResponse
    >("/company", payload);
    return res.data;
  } catch (error) {
    console.error("Error registering company:", error);
    throw error;
  }
};

export const getApplicantsByJobId = async (
  jobId: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<ApplicantResponse<ApplicantSummary>> => {
  try {
    const response = await axiosConfig.get(`/applicants/${jobId}?status=${status}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching applicants by job ID:", error);
    throw error;
  }
};

// Update the function signature and implementation
export const updateApplicantStatus = async (
  applicants: Array<{
    applicant_id: number;
    job_id: string;
    feedback?: string;
    status: 'approved' | 'rejected';
  }>
): Promise<{
  success: boolean;
  data: {
    count: number;
    applicants: Array<{
      cv_id: number;
      job_id: string;
      status: string;
      feedback: string | null;
      verified_date: string;
      cvs: {
        id: number;
        fullname: string;
        email: string;
        users_id: string;
      };
    }>;
  };
}> => {
  try {
    const response = await axiosConfig.put('/applicants/status', {
      applicants
    });

    if (!response.data.success) {
      throw new Error('Failed to update applicant status');
    }

    return response.data;
  } catch (error) {
    console.error("Error updating applicant status:", error);
    throw error;
  }
};

// Keep the old function for single updates if needed (backward compatibility)
export const updateSingleApplicantStatus = async (
  applicantId: number,
  job_id: string,
  feedback: string,
  status: 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const response = await updateApplicantStatus([{
      applicant_id: applicantId,
      job_id,
      feedback,
      status
    }]);

    return response.success;
  } catch (error) {
    console.error("Error updating applicant status:", error);
    throw error;
  }
};

export const getApplicantByID = async (
  applicantId: number,
  status: 'pending' | 'approved' | 'rejected',
  jobId: string
): Promise<Applicant<Resume & ResumeUserAvatar> | null> => {
  const response = await axiosConfig.get(`/applicant/${applicantId}?status=${status}&jobId=${jobId}`);

  if (!response.data.success)
    throw new Error("Có lỗi xảy ra khi lấy thông tin ứng viên");

  return response.data.data;
};

export interface ComparisonStats {
  cv: {
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
  };
  job: {
    id: number;
    job_id: string;
    technical: number;
    communication: number;
    teamwork: number;
    problem_solving: number;
    creativity: number;
    leadership: number;
    summary: string;
    created_at: string;
    updated_at: string;
  };
}

export const compareCvAndJobStats = async (cvId: number, jobId: string): Promise<ComparisonStats | null> => {
  try {
    const response = await axiosConfig.get(`/compare-stats/${cvId}/${jobId}`);

    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error comparing CV and job stats:", error);
    throw error;
  }
};

export interface UpdateCompanyProfileRequest {
  background_url?: string;
  company_website?: string;
  description?: string;
  employees?: number;
  // Add other fields as needed
}

export const updateCompanyProfile = async (companyId: string, data: UpdateCompanyProfileRequest) => {
  try {
    const response = await axiosConfig.put(`/company/${companyId}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const getRecommendedCompanies = async () => {
  try {
    const response = await axiosConfig.get('/recommended-companies');
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

// Add this interface
export interface AllApplicantsResponse {
  success: boolean;
  data: {
    job_title: string;
    applicants: Array<{
      cv_id: number;
      job_id: string;
      description: string | null;
      apply_date: string;
      verified_date: string | null;
      status: string;
      feedback: string | null;
      cvs: {
        id: number;
        fullname: string;
        age: number | null;
        gender: string | null;
        email: string;
        phone: string;
        address: string;
        introduction: string | null;
        soft_skills: string[];
        primary_skills: string[];
        hobbies: string | null;
        others: string | null;
        apply_job: string;
        career_goal: string | null;
        awards: Array<{
          title: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
        }>;
        certificates: Array<{
          title: string;
          link: string | null;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
        }>;
        projects: Array<{
          title: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
        }>;
        educations: Array<{
          school: string;
          graduated_type: string;
          gpa: number | null;
          start_date: string | null;
          end_date: string | null;
        }>;
        experiences: Array<{
          company_name: string;
          title: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
        }>;
        languages: Array<{
          name: string;
          certificate: string | null;
          level: string;
        }>;
        references: any[];
      };
    }>;
    total: number;
    status: string;
  };
}

// Add this function
export const getAllApplicantsByJobId = async (
  jobId: string,
  status?: 'pending' | 'approved'
): Promise<AllApplicantsResponse> => {
  try {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }

    const response = await axiosConfig.get(
      `/all-applicants/${jobId}${params.toString() ? `?${params.toString()}` : ''}`
    );

    if (!response.data.success) {
      throw new Error('Failed to fetch all applicants');
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching all applicants:", error);
    throw error;
  }
};

// Add these interfaces
export interface SuitableApplicant {
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
  score: number;
  status?: string;
}

export interface SuitableApplicantsResponse {
  success: boolean;
  data: SuitableApplicant[];
}

// Add these functions
export const filterSuitableApplicants = async (
  jobId: string
): Promise<SuitableApplicantsResponse> => {
  try {
    const response = await axiosConfig.get(`/suitable-applicants/${jobId}`);

    if (!response.data.success) {
      throw new Error('Failed to fetch suitable applicants');
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching suitable applicants:", error);
    throw error;
  }
};

export const getAllSuitableApplicants = async (
  jobId: string
): Promise<SuitableApplicantsResponse> => {
  try {
    const response = await axiosConfig.get(`/suitable-all-applicants/${jobId}`);

    if (!response.data.success) {
      throw new Error('Failed to fetch all suitable applicants');
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching all suitable applicants:", error);
    throw error;
  }
};