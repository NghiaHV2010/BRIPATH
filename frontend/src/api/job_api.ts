import axiosConfig from "@/config/axios.config";
import type {
  CRUDJobParams,
  FetchJobByComId,
  FetchJobDetailParams,
  FetchJobParams,
  FilterJobParams,
  JobDetail,
  JobResponse,
  CreateJobResponse,
  JobLabel,
} from "@/types/job";

export interface CV {
  id: number;
  fullname: string;
  email: string;
  apply_job: string;
  phone: string;
  address: string;
  career_goal: string;
  introduction: string;
  soft_skills: string[];
  primary_skills: string[];
  created_at: string;
  age?: number | null;
  gender?: string | null;
  hobbies?: string | null;
  others?: string | null;
  users_id?: string;
  awards?: any[];
  certificates?: any[];
  educations?: any[];
  experiences?: any[];
  languages?: any[];
  projects?: any[];
  references?: any[];
}

export const fetchAllJobs = async (
  params: FetchJobParams
): Promise<JobResponse | null> => {
  try {
    const response = await axiosConfig.get("/jobs", {
      params: {
        page: params.page,
        userId: params.userId || undefined,
      },
    });
    return response.data as JobResponse;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return null;
  }
};

export const fetchJobById = async (
  params: FetchJobDetailParams
): Promise<JobDetail | null> => {
  try {
    const response = await axiosConfig.get("/job", { params });
    // Backend trả về { data: JobDetail }
    return response.data?.data as JobDetail;
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    return null;
  }
};

export const filterJobs = async (
  params: FilterJobParams
): Promise<JobResponse | null> => {
  try {
    const response = await axiosConfig.get("/filter-jobs", {
      params: {
        page: params.page,
        userId: params.userId || undefined,
        name: params.name || undefined,
        field: params.field || undefined,
        location: params.location || undefined,
        salary: params.salary || undefined,
      },
    });
    return response.data as JobResponse;
  } catch (error) {
    console.error("Error filtering jobs:", error);
    return null;
  }
};

export const fetchJobsByComId = async (
  params: FetchJobByComId
): Promise<JobResponse | null> => {
  try {
    const response = await axiosConfig.get(`/jobs/${params.companyId}`, {
      params: {
        page: params.page,
        userId: params.userId || undefined,
      },
    });
    return response.data as JobResponse;
  } catch (error) {
    console.error("Error fetching jobs by company ID:", error);
    return null;
  }
};

export const createJob = async (
  jobData: CRUDJobParams
): Promise<CreateJobResponse> => {
  try {
    const response = await axiosConfig.post<CreateJobResponse>("/job", jobData);
    return response.data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const updateJob = async (
  jobId: string,
  jobData: Partial<CRUDJobParams>
): Promise<CreateJobResponse> => {
  try {
    const response = await axiosConfig.put<CreateJobResponse>(
      `/job/${jobId}`,
      jobData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

export const deleteJob = async (
  jobId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosConfig.delete<{ success: boolean; message: string }>(
      `/job/${jobId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

// ========================
// Get job labels for filter dropdown
// ========================
export const fetchJobLabels = async (): Promise<JobLabel[]> => {
  try {
    const response = await axiosConfig.get<{ data: JobLabel[] }>("/job/labels");
    console.log("✅ Fetched job labels successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching job labels:", error);
    throw error;
  }
};


export const saveJobApi = async (
  jobId: string
): Promise<{ success: boolean; message: string, data?: any | null }> => {
  try {
    const response = await axiosConfig.get(`/save-job/${jobId}`);
    console.log("Saved job:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error saving job:", error.response?.data || error.message);
    throw error;
  }
};

// API để lấy danh sách job IDs đã save
export const getSavedJobIds = async (): Promise<{ success: boolean; data: string[] }> => {
  try {
    const response = await axiosConfig.get('/save-jobs');
    console.log("Fetched saved job IDs:", response.data);
    // Giả sử backend trả về array jobs, extract IDs
    const jobIds = response.data?.data?.map((job: any) => job.id) || [];
    return { success: true, data: jobIds };
  } catch (error: any) {
    console.error("Error fetching saved job IDs:", error.response?.data || error.message);
    return { success: false, data: [] };
  }
};

export const getSavedJobs = async (): Promise<{ success: boolean; data: any[] }> => {
  try {
    const response = await axiosConfig.get('/save-jobs');
    // Backend trả về dạng: [{ jobs: { ... } }, ...]
    const jobs = (response.data?.data || []).map((item: any) => item?.jobs).filter(Boolean);
    return { success: true, data: jobs };
  } catch (error: any) {
    console.error("Error fetching saved jobs:", error.response?.data || error.message);
    return { success: false, data: [] };
  }
};

export const unsaveJobApi = async (
  jobId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosConfig.delete(`/save-job/${jobId}`);
    console.log("Unsaved job:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error unsaving job:", error.response?.data || error.message);
    throw error;
  }
};

export const applyjob = async (
  jobId: string, cv_id: number, description?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosConfig.post(`/apply-job/${jobId}`, { cv_id, description });
    console.log("Applied to job:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error applying to job:", error.response?.data || error.message);
    throw error;
  } 
};


export const getUserCVs = async (): Promise<CV[]> => {
  try {
    const response = await axiosConfig.get('/cv');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching CVs:", error.response?.data || error.message);
    throw error;
  }
};
  

