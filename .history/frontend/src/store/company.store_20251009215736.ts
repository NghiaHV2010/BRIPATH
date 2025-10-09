
import { getCompanyDetails, getAllCompanies, apiFilterCompanies } from './../api/company_api';
import type { CompanyDetail, CompanySummary } from "@/types/company";
import { create } from "zustand";

interface CompanyStore {
  companies: CompanySummary[];
  filteredCompanies: CompanySummary[];
  companyDetail: CompanyDetail | null;
  isLoading: boolean;
  fetchCompanies: (page: number, userId?: string) => Promise<void>;
  fetchCompanyDetail: (companyId: string, userId?: string) => Promise<void>;
  filterCompanies: (
    page: number,
    name?: string,
    location?: string,
    field?: string,
    userId?: string
  ) => Promise<void>;
  clearFilteredCompanies: () => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  companies: [],
  filteredCompanies: CompanySummary[];
  companyDetail: null,
  isLoading: false,

  // Fetch all companies
  fetchCompanies: async (page, userId) => {
    set({ isLoading: true });
    try {
      const data = await getAllCompanies(page, userId);
      set({ companies: data });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch single company detail
  fetchCompanyDetail: async (companyId, userId) => {
    set({ isLoading: true });
    try {
      const data = await getCompanyDetails(companyId, userId);
      set({ companyDetail: data });
    } finally {
      set({ isLoading: false });
    }
  },

  // Filter companies
 filterCompanies: async (page, name, location, field, userId) => {
    set({ isLoading: true });
    try {
      const data = await apiFilterCompanies(page, name, location, field, userId);
      set({ filteredCompanies: data }); // 🔹 chỉ lưu vào filteredCompanies
    } finally {
      set({ isLoading: false });
    }
  },

  clearFilteredCompanies: () => set({ filteredCompanies: [] }),
}));
