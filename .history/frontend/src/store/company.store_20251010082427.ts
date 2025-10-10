import { getCompanyDetails, getAllCompanies, apiFilterCompanies } from './../api/company_api';
import type { CompanyDetail, CompanySummary } from "@/types/company";
import { create } from "zustand";

interface CompanyStore {
  companies: CompanySummary[];              
  filteredCompanies: CompanySummary[];      // Danh sách kết quả tìm kiếm
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
  filteredCompanies: [], // thêm state này
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

  // Filter companies (search)
  filterCompanies: async (page, name, location, field, userId) => {
    set({ isLoading: true });
    try {
      const data = await apiFilterCompanies(page, name, location, field, userId);
      set({ filteredCompanies: data }); // cập nhật filteredCompanies, không đụng đến companies
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear search results
  clearFilteredCompanies: () => set({ filteredCompanies: [] }),
}));


fetchFields: async () => {
  const res = await axios.get(`${baseUrl}/company/fields`);
  set({ fields: res.data.data });
},
fields: [] as { id: number; field_name: string }[],