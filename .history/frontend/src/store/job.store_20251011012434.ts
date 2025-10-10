import { create } from "zustand";
import type { AxiosError } from "axios";
import {
  fetchAllJobs,
  fetchJobById,
  filterJobs,
  fetchJobsByComId,
  fetchJobLabels,
} from "@/api/job_api";
import type {
  Job,
  JobDetail,
  FetchJobDetailParams,
  FilterJobParams,
  FetchJobByComId,
  FetchJobParams,
  JobLabel,
} from "@/types/job";

interface JobState {
  jobs: Job[];
  selectedJob: JobDetail | null;
  jobLabels: JobLabel[]; // ✅ Job labels for filter dropdown
  totalPages?: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  getAllJobs: (params: FetchJobParams) => Promise<void>;
  getJobById: (params: FetchJobDetailParams) => Promise<void>;
  filterJobs: (params: FilterJobParams) => Promise<void>;
  getJobsByCompanyId: (params: FetchJobByComId) => Promise<void>;
  fetchJobLabels: () => Promise<void>; // ✅ Fetch job labels

  clearError: () => void;
  clearSelectedJob: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  selectedJob: null,
  jobLabels: [], // ✅ Initialize empty job labels
  isLoading: false,
  error: null,
  totalPages: undefined,

  // ✅ Lấy tất cả job
  getAllJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetchAllJobs(params);
      if (res?.success) {
        set({ jobs: res.data, totalPages: res.totalPages || 1 });
      } else if (res === null) {
        // Handle 304 case - keep existing data, just stop loading
        console.log("304 Not Modified - keeping existing data");
      } else {
        set({ error: "Không thể tải danh sách công việc" });
      }
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message || "Không thể tải danh sách công việc";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Lấy job theo ID (trang chi tiết)
  getJobById: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJobById(params);
      set({ selectedJob: data || null });
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
      const res = await filterJobs(params);
      if (res?.success) {
        set({ jobs: res.data, totalPages: res.totalPages || 1 });
      } else {
        set({ error: "Không thể lọc công việc" });
      }
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
      const res = await fetchJobsByComId(params);
      if (res?.success) {
        set({ jobs: res.data, totalPages: res.totalPages || 1 });
      } else {
        set({ error: "Không thể tải job theo công ty" });
      }
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message || "Không thể tải job theo công ty";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Lấy job labels cho filter dropdown
  fetchJobLabels: async () => {
    try {
      const data = await fetchJobLabels();
      set({ jobLabels: data });
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message || "Không thể tải job labels";
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),
  clearSelectedJob: () => set({ selectedJob: null }),
}));
