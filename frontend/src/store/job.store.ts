import { create } from "zustand";
import type { AxiosError } from "axios";
import {
  fetchAllJobs,
  fetchJobById,
  filterJobs,
  fetchJobsByComId,
} from "@/api/job_api";
import type {
  Job,
  FetchJobDetailParams,
  FilterJobParams,
  FetchJobByComId,
  FetchJobParams,
} from "@/types/job";

interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  totalPages?: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  getAllJobs: (params: FetchJobParams) => Promise<void>;
  getJobById: (params: FetchJobDetailParams) => Promise<void>;
  filterJobs: (params: FilterJobParams) => Promise<void>;
  getJobsByCompanyId: (params: FetchJobByComId) => Promise<void>;

  clearError: () => void;
  clearSelectedJob: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,

  // ✅ Lấy tất cả job
  getAllJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAllJobs<{ data: Job[]; totalPages: number }>(params);
      set({ jobs: data?.data || [] });
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message || "Không thể tải danh sách công việc";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  getJobById: async (params) => {
  set({ isLoading: true, error: null });
  try {
    const data = await fetchJobById(params);
    set({ selectedJob: data?.data || null });
  } catch (err) {
    const axiosErr = err as AxiosError;
    const message =
      (axiosErr.response?.data as any)?.message || "Không thể tải chi tiết công việc";
    set({ error: message });
  } finally {
    set({ isLoading: false });
  }
},

  // ✅ Lọc job
  filterJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await filterJobs<{ data: Job[] }>(params);
      set({ jobs: data?.data || [] });
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message || "Không thể lọc công việc";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Lấy job theo công ty
  getJobsByCompanyId: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJobsByComId<{ data: Job[]; totalPages: number }>(params);
      set({ jobs: data?.data || [] });
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message || "Không thể tải job theo công ty";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Helper
  clearError: () => set({ error: null }),
  clearSelectedJob: () => set({ selectedJob: null }),
}));
