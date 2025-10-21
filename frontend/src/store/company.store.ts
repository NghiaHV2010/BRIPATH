import { create } from "zustand";
import { useAuthStore } from "./auth";
import type { CompanyDetail, CompanySummary } from "@/types/company";
import {
  getAllCompanies,
  getCompanyDetails,
  apiFilterCompanies,

} from "@/api/company_api";
import { followCompanyApi, unfollowCompanyApi } from "@/api";

interface CompanyStore {
  companies: (CompanySummary & { isFollowed?: boolean })[];
  filteredCompanies: (CompanySummary & { isFollowed?: boolean })[];
  companyDetail: (CompanyDetail & { isFollowed?: boolean }) | null;
  totalPages: number;
  isLoading: boolean;

  fetchCompanies: (page: number) => Promise<void>;
  fetchCompanyDetail: (companyId: string, page?: number) => Promise<void>;
  filterCompanies: (
    page: number,
    name?: string,
    location?: string,
    field?: string
  ) => Promise<void>;
  clearFilteredCompanies: () => void;

  followCompany: (companyId: string) => Promise<void>;
  unfollowCompany: (companyId: string) => Promise<void>;
  checkIfFollowed: (companyId: string) => boolean;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],
  filteredCompanies: [],
  companyDetail: null,
  totalPages: 1,
  isLoading: false,

  // ✅ Lấy danh sách công ty
  fetchCompanies: async (page) => {
    set({ isLoading: true });
    try {
      const authUser = useAuthStore.getState().authUser;
      const userId = authUser?.id;

      const res = await getAllCompanies(page, userId!);

      const companiesWithFollow = res.data.map((company: any) => ({
        ...company,
        isFollowed:
          Array.isArray(company.followedCompanies) &&
          company.followedCompanies.length > 0,
      }));

      set({
        companies: companiesWithFollow,
        totalPages: res.totalPages ?? 1,
      });
    } catch (err) {
      console.error("❌ Lỗi fetchCompanies:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Lấy chi tiết công ty
  fetchCompanyDetail: async (companyId, page = 1) => {
    set({ isLoading: true });
    try {
      const authUser = useAuthStore.getState().authUser;
      const userId = authUser?.id;

      const res = await getCompanyDetails(userId!, companyId, page);

      const companyDetailWithFollow = {
        ...res.data,
        isFollowed:
          Array.isArray(res.data?.followedCompanies) &&
          res.data?.followedCompanies.length > 0,
      } as CompanyDetail & { isFollowed: boolean };

      set({
        companyDetail: companyDetailWithFollow,
        totalPages: res.totalPages ?? 1,
      });
    } catch (err) {
      console.error("❌ Lỗi fetchCompanyDetail:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Lọc công ty
  filterCompanies: async (page, name, location, field) => {
    set({ isLoading: true });
    try {
      const authUser = useAuthStore.getState().authUser;
      const userId = authUser?.id;

      const data = await apiFilterCompanies(page, name, location, field, userId);

      const companiesWithFollow = data.map((company: any) => ({
        ...company,
        isFollowed:
          Array.isArray(company.followedCompanies) &&
          company.followedCompanies.length > 0,
      }));

      set({ filteredCompanies: companiesWithFollow });
    } catch (err) {
      console.error("❌ Lỗi filterCompanies:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  clearFilteredCompanies: () => set({ filteredCompanies: [] }),

  // ✅ Follow công ty
  followCompany: async (companyId) => {
    try {
      const res = await followCompanyApi(companyId);
      if (res.success) {
        const updatedCompanies = get().companies.map((comp) =>
          comp.id === companyId ? { ...comp, isFollowed: true } : comp
        );
        set({ companies: updatedCompanies });

        const detail = get().companyDetail;
        if (detail?.id === companyId) {
          set({ companyDetail: { ...detail, isFollowed: true } });
        }
      }
    } catch (err) {
      console.error("❌ Error followCompany:", err);
    }
  },

  // ✅ Unfollow công ty
  unfollowCompany: async (companyId) => {
    try {
      const res = await unfollowCompanyApi(companyId);
      if (res.success) {
        const updatedCompanies = get().companies.map((comp) =>
          comp.id === companyId ? { ...comp, isFollowed: false } : comp
        );
        set({ companies: updatedCompanies });

        const detail = get().companyDetail;
        if (detail?.id === companyId) {
          set({ companyDetail: { ...detail, isFollowed: false } });
        }
      }
    } catch (err) {
      console.error("❌ Error unfollowCompany:", err);
    }
  },

  // ✅ Kiểm tra đã follow
  checkIfFollowed: (companyId) => {
    const { companies, companyDetail } = get();
    const fromList = companies.find((c) => c.id === companyId)?.isFollowed;
    const fromDetail =
      companyDetail?.id === companyId ? companyDetail.isFollowed : undefined;
    return !!(fromList || fromDetail);
  },
}));
