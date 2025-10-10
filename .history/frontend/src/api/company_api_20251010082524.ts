import axiosConfig from "@/config/axios.config";
import type { CompanyDetail, CompanySummary } from "@/types/company";
// ========================
// Get all companies
// ========================
export const getAllCompanies = async (
  page: number,
  userId?: string
): Promise<CompanySummary[]> => {
  const response = await axiosConfig.get<{ data: CompanySummary[] }>(
    "/companies",
    {
      params: { 
        page, 
        userId,
      },
    }
  );
  return response.data.data;
};

// ========================
// Get company details by ID
// ========================
export const getCompanyDetails = async (
  companyId: string,
  userId?: string
): Promise<CompanyDetail> => {
  const response = await axiosConfig.get<{ data: CompanyDetail }>("/company", {
    params: { companyId, userId },
  });
  return response.data.data;
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


export const fetchFields = async (): Promise<string[]> => {
  const response = await axiosConfig.get<{ data: string[] }>("/companyfields");
  return response.data.data;
}