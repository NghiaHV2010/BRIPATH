import type { FetchJobByComId, FetchJobDetailParams, FetchJobParams, FilterJobParams, JobDetail } from '@/types/job';
import axiosConfig from "@/config/axios.config";




export const fetchAllJobs = async <T>(params: FetchJobParams): Promise<T | null> => {
  try {
    const response = await axiosConfig.get("/jobs", { params: {
        page: params.page,
        userId: params.userId || undefined, // nếu userId không được cung cấp, gửi undefined để bỏ qua tham số này
      } });
    return response.data as T;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return null;
  }
};
    

export const fetchJobById = async (params: FetchJobDetailParams): Promise<{ data: JobDetail } | null> => {
  try {
   const response = await axiosConfig.get("/job", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    return null;
  }
};

export const filterJobs = async <T>(params: FilterJobParams): Promise<T | null> => {
    try {
        const response = await axiosConfig.get("/filter-jobs", { params: {
            page: params.page,
            userId: params.userId || undefined,
            name: params.name || undefined,
            field: params.field || undefined,
            location: params.location || undefined,
            salary: params.salary || undefined,
        } });
        return response.data as T;
    } catch (error) {
        console.error("Error filtering jobs:", error);
        return null;
    }
};


export const fetchJobsByComId = async <T>(params: FetchJobByComId): Promise<T | null> => {
    try {
        const response = await axiosConfig.get(`/jobs/${params.companyId}`, { params: {
            page: params.page,
            userId: params.userId || undefined,
        } });
        return response.data as T;
    } catch (error) {
        console.error("Error fetching jobs by company ID:", error);
        return null;
    }
};



