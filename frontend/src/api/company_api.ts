import axiosConfig from "@/config/axios.config";
import type { CompanyDetail, CompanySummary, CompanyField } from "@/types/company";
// ========================
// Get all companies
// ========================
export const getAllCompanies = async (
  page: number,
  userId?: string
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
export const getCompanyDetails = async (
  companyId: string,
  userId?: string,
  page: number = 1
): Promise<CompanyDetail> => {
  const response = await axiosConfig.get<CompanyDetail>("/company", {
    params: { companyId, userId, page },
  });
  return response.data;
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
  try {
    const response = await axiosConfig.post(`/feedback/cv/${cvId}`, {
      is_good,
      job_id,
    });

    return response.data;
  } catch (error: unknown) {
    throw error; // Ném lỗi để xử lý ở nơi gọi hàm
  }
};

