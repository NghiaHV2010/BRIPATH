import axiosConfig from "../config/axios.config";
import type { CompanyRegistrationForm, CompanyCreationResponse, Company } from "../types/company";

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export const createCompany = async (companyData: CompanyRegistrationForm) => {
  const response = await axiosConfig.post<CompanyCreationResponse>(
    "/company",
    companyData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const updateCompany = async (companyId: string, companyData: Partial<CompanyRegistrationForm>) => {
  const response = await axiosConfig.put<CompanyCreationResponse>(
    `/company/${companyId}`,
    companyData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getCompanyById = async <T = Company>(companyId: string) => {
  const response = await axiosConfig.get<ApiResponse<T>>(`/company/${companyId}`, {
    withCredentials: true,
  });

  return response.data.data;
};

export const getAllCompanies = async <T = Company[]>(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);

  const response = await axiosConfig.get<ApiResponse<T>>(`/companies?${searchParams.toString()}`, {
    withCredentials: true,
  });

  return response.data.data;
};

// Upload file for company (business certificate, logo, background)
export const uploadCompanyFile = async (file: File, fileType: 'business_certificate' | 'logo' | 'background') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', fileType);

  const response = await axiosConfig.post<ApiResponse<{ url: string }>>(
    "/company/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );

  return response.data.data;
};