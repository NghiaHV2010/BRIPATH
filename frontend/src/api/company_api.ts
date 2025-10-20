
import axiosConfig from "@/config/axios.config";
import type { CompanySummary, CompanyField, CompanyDetailResponse } from "@/types/company";
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