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

export const fetchAllJobs = async (
  params: FetchJobParams
): Promise<JobResponse | null> => {
  try {
    const response = await axiosConfig.get("/jobs", {
      params: {
        page: params.page,
        userId: params.userId || undefined,
        // Cache busting for development
        _t: Date.now(),
      },
    });
    
    // Handle 304 Not Modified - data still exists in response
    if (response.status === 304 || !response.data) {
      console.warn("304 Not Modified - using cached data");
      return null;
    }
    
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
