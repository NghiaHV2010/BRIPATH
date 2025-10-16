import { getCompanyDetails, getAllCompanies, apiFilterCompanies } from './../api/company_api';
import type { CompanyDetail, CompanySummary } from "@/types/company";
import { create } from "zustand";

interface CompanyStore {
  companies: CompanySummary[];
  filteredCompanies: CompanySummary[];      // Danh sách kết quả tìm kiếm
  companyDetail: CompanyDetail | null;
  totalPages: number;
  isLoading: boolean;

  fetchCompanies: (page: number, userId?: string) => Promise<void>;

  fetchCompanyDetail: (userId?: string, companyId: string,  page?: number) => Promise<void>;
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
  totalPages: 1,
  isLoading: false,

  // Fetch all companies
  fetchCompanies: async (page, userId) => {
    set({ isLoading: true });
    try {
      const response = await getAllCompanies(page, userId);
      set({ companies: response.data, totalPages: response.totalPages });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch single company detail
  fetchCompanyDetail: async (userId, companyId, page = 1) => {
  set({ isLoading: true });
  try {
    const res = await getCompanyDetails(userId!, companyId!, page);
    set({
      companyDetail: res.data,
      totalPages: res.totalPages,
    });
  } catch (err) {
    console.error("❌ Lỗi khi gọi fetchCompanyDetail:", err);
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


