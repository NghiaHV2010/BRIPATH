import { create } from "zustand";
import type { AxiosError } from "axios";
import {
  getAllCompanies,
  getCompanyDetails,
  filterCompanies,
  createCompany,
} from "@/api/company_api";
import type {
  CompanyDetail,
  CompanySummary,
  CreateCompanyData,
  CreateCompanyResponse,
} from "@/types/company";

interface CompanyState {
  companies: CompanySummary[];
  selectedCompany: CompanyDetail | null;
  totalPages?: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  getAllCompanies: (page: number, userId?: string) => Promise<void>;
  getCompanyById: (companyId: string, userId?: string) => Promise<void>;
  filterCompanies: (
    page: number,
    name?: string,
    location?: string,
    field?: string,
    userId?: string
  ) => Promise<void>;
  createCompany: (companyData: CreateCompanyData) => Promise<CreateCompanyResponse | null>;

  clearError: () => void;
  clearSelectedCompany: () => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  selectedCompany: null,
  isLoading: false,
  error: null,

  // ✅ Lấy tất cả companies
  getAllCompanies: async (page: number, userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const companies = await getAllCompanies(page, userId);
      set({ 
        companies,
        isLoading: false 
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      set({
        error: axiosError.message || "Failed to fetch companies",
        isLoading: false,
      });
    }
  },

  // ✅ Lấy chi tiết company theo ID
  getCompanyById: async (companyId: string, userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const company = await getCompanyDetails(companyId, userId);
      set({ 
        selectedCompany: company,
        isLoading: false 
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      set({
        error: axiosError.message || "Failed to fetch company details",
        isLoading: false,
      });
    }
  },

  // ✅ Lọc companies theo điều kiện
  filterCompanies: async (
    page: number,
    name?: string,
    location?: string,
    field?: string,
    userId?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const companies = await filterCompanies(page, name, location, field, userId);
      set({ 
        companies,
        isLoading: false 
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      set({
        error: axiosError.message || "Failed to filter companies",
        isLoading: false,
      });
    }
  },

  // ✅ Tạo company mới
  createCompany: async (companyData: CreateCompanyData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await createCompany(companyData);
      set({ isLoading: false });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError;
      set({
        error: axiosError.message || "Failed to create company",
        isLoading: false,
      });
      return null;
    }
  },

  // ✅ Clear error
  clearError: () => {
    set({ error: null });
  },

  // ✅ Clear selected company
  clearSelectedCompany: () => {
    set({ selectedCompany: null });
  },
}));