
import { getCompanyDetails, getAllCompanies, filterCompanies } from './../api/company_api';
import type { CompanyDetail, CompanySummary } from "@/types/company";
import { create } from "zustand";

interface CompanyFilters {
  name?: string;
  location?: string;
  field?: string;
}

interface CompanyStore {
  companies: CompanySummary[];
  allCompanies: CompanySummary[]; // Store original unfiltered data
  companyDetail: CompanyDetail | null;
  isLoading: boolean;
  currentFilters: CompanyFilters;
  isFiltered: boolean;
  fetchCompanies: (page: number, userId?: string) => Promise<void>;
  fetchCompanyDetail: (companyId: string, userId?: string) => Promise<void>;
  filterCompanies: (
    page: number,
    filters: CompanyFilters,
    userId?: string
  ) => Promise<void>;
  resetFilters: () => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  companies: [],
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
  fetchFilterCompanies: async (page, name, location, field, userId) => {
    set({ isLoading: true });
    try {
      const data = await filterCompanies(page, name, location, field, userId);
      set({ companies: data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
