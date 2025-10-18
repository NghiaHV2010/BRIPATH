import { create } from "zustand";
import type { AxiosError } from "axios";
import {
  fetchAllJobs,
  fetchJobById,
  filterJobs,
  fetchJobsByComId,
  fetchJobLabels,
  saveJobApi,
  unsaveJobApi,
} from "@/api/job_api";
import { useAuthStore } from "./auth";
import type {
  Job,
  JobDetail,
  FetchJobDetailParams,
  FilterJobParams,
  FetchJobByComId,
  FetchJobParams,
  JobLabel,
} from "@/types/job";

// ----------------------
// 🔹 Định nghĩa JobState
// ----------------------
interface JobState {
  jobs: Job[];
  filteredJobs: Job[]; // Danh sách kết quả tìm kiếm
  selectedJob: JobDetail | null;
  jobLabels: JobLabel[];
  totalPages?: number;
  isLoading: boolean;
  error: string | null;
  savedJobs: string[];

  // Actions
  getAllJobs: (params: FetchJobParams) => Promise<void>;
  getJobById: (params: FetchJobDetailParams) => Promise<void>;
  filterJobs: (params: FilterJobParams) => Promise<void>;
  getJobsByCompanyId: (params: FetchJobByComId) => Promise<void>;
  fetchJobLabels: () => Promise<void>;

  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  checkIfSaved: (jobId: string) => boolean;
  clearFilteredJobs: () => void;

  clearError: () => void;
  clearSelectedJob: () => void;
}

// ----------------------
// 🔹 Store Zustand chính
// ----------------------
export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  filteredJobs: [],
  selectedJob: null,
  jobLabels: [],
  isLoading: false,
  error: null,
  totalPages: undefined,
  savedJobs: [],

  // ✅ Lưu job
  saveJob: async (jobId) => {
    try {
      const res = await saveJobApi(jobId);
      if (res?.success) {
        set((state) => ({
          savedJobs: [...new Set([...state.savedJobs, jobId])], // tránh trùng
          // Cập nhật selectedJob nếu đó là job đang được view
          selectedJob: state.selectedJob?.id === jobId 
            ? { ...state.selectedJob, isSaved: true }
            : state.selectedJob,
          // Cập nhật jobs array nếu có
          jobs: state.jobs.map(job => 
            job.id === jobId ? { ...job, isSaved: true } : job
          ),
        }));
      } else {
        alert(res?.message || "Không thể lưu công việc.");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        alert("Vui lòng đăng nhập để lưu công việc.");
      } else {
        alert("Đã xảy ra lỗi khi lưu công việc.");
      }
      console.error("Error saving job:", err);
    }
  },

  // ✅ Bỏ lưu job
  unsaveJob: async (jobId: string) => {
    try {
      const res = await unsaveJobApi(jobId); // API toggle save/unsave
      if (res?.success) {
        set((state) => ({
          savedJobs: state.savedJobs.filter(id => id !== jobId),
          // Cập nhật selectedJob nếu đó là job đang được view
          selectedJob: state.selectedJob?.id === jobId 
            ? { ...state.selectedJob, isSaved: false }
            : state.selectedJob,
          // Cập nhật jobs array nếu có
          jobs: state.jobs.map(job => 
            job.id === jobId ? { ...job, isSaved: false } : job
          ),
        }));
      } else {
        alert(res?.message || "Không thể bỏ lưu công việc.");
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi khi bỏ lưu công việc.");
      console.error("Error unsaving job:", err);
    }
  },

  // ✅ Kiểm tra job đã lưu
  checkIfSaved: (jobId) => {
    const { savedJobs } = get();
    return savedJobs.includes(jobId);
  },

  // ✅ Lấy danh sách job
  getAllJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      // Tự động thêm userId nếu user đã đăng nhập
      const authUser = useAuthStore.getState().authUser;
      const enrichedParams = {
        ...params,
        userId: authUser?.id || params.userId,
      };
      
      const res = await fetchAllJobs(enrichedParams);
      if (res && res.data) {
        // Process jobs để set isSaved từ savedJobs array
        const processedJobs = res.data.map(job => ({
          ...job,
          isSaved: job.savedJobs && job.savedJobs.length > 0
        }));
        
        // Update store savedJobs array để sync với checkIfSaved method
        const savedJobIds = res.data
          .filter(job => job.savedJobs && job.savedJobs.length > 0)
          .map(job => job.id);
        
        set({ 
          jobs: processedJobs, 
          totalPages: res.totalPages || 1,
          savedJobs: savedJobIds
        });
      } else {
        set({ error: "Không thể tải danh sách công việc" });
      }
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message ||
        "Không thể tải danh sách công việc";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Lấy job theo ID
getJobById: async (params) => {
  set({ isLoading: true, error: null });
  try {
    const authUser = useAuthStore.getState().authUser;
    const enrichedParams = {
      ...params,
      userId: authUser?.id || params.userId,
    };

    const data = await fetchJobById(enrichedParams);
    if (data) {
      const processedJob = {
        ...data,
        isSaved: data.savedJobs && data.savedJobs.length > 0,
        isApplied:
          data.applicants?.some(
            (app) => app.cv_id === authUser?.cv_id // hoặc userId nếu bạn lưu theo user
          ) || false,
      };
      set({ selectedJob: processedJob });
    } else {
      set({ selectedJob: null });
    }
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
      // Tự động thêm userId nếu user đã đăng nhập
      const authUser = useAuthStore.getState().authUser;
      const enrichedParams = {
        ...params,
        userId: authUser?.id || params.userId,
      };
      
      const res = await filterJobs(enrichedParams);
      if (res && res.data) {
        // Process jobs để set isSaved từ savedJobs array
        const processedJobs = res.data.map(job => ({
          ...job,
          isSaved: job.savedJobs && job.savedJobs.length > 0
        }));
        
        // Update store savedJobs array
        const savedJobIds = res.data
          .filter(job => job.savedJobs && job.savedJobs.length > 0)
          .map(job => job.id);
        
        set({ 
          filteredJobs: processedJobs, // Lưu vào filteredJobs thay vì jobs
          totalPages: res.totalPages || 1,
          savedJobs: [...new Set([...get().savedJobs, ...savedJobIds])] // Merge với existing
        });
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
      // Tự động thêm userId nếu user đã đăng nhập
      const authUser = useAuthStore.getState().authUser;
      const enrichedParams = {
        ...params,
        userId: authUser?.id || params.userId,
      };
      
      const res = await fetchJobsByComId(enrichedParams);
      if (res && res.data) {
        // Process jobs để set isSaved từ savedJobs array
        const processedJobs = res.data.map(job => ({
          ...job,
          isSaved: job.savedJobs && job.savedJobs.length > 0
        }));
        
        // Update store savedJobs array
        const savedJobIds = res.data
          .filter(job => job.savedJobs && job.savedJobs.length > 0)
          .map(job => job.id);
        
        set({ 
          jobs: processedJobs, 
          totalPages: res.totalPages || 1,
          savedJobs: [...new Set([...get().savedJobs, ...savedJobIds])] // Merge với existing
        });
      } else {
        set({ error: "Không thể tải job theo công ty" });
      }
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message ||
        "Không thể tải job theo công ty";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Lấy job labels
  fetchJobLabels: async () => {
    try {
      const data = await fetchJobLabels();
      set({ jobLabels: data });
    } catch (err) {
      const axiosErr = err as AxiosError;
      const message =
        (axiosErr.response?.data as any)?.message ||
        "Không thể tải danh sách nhãn công việc";
      set({ error: message });
    }
  },

  // ✅ Dọn lỗi
  clearError: () => set({ error: null }),

  // ✅ Xóa job đang chọn
  clearSelectedJob: () => set({ selectedJob: null }),

  // ✅ Clear filtered jobs
  clearFilteredJobs: () => set({ filteredJobs: [] }),
}));
