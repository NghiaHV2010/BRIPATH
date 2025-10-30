import type { CVStatsResponse, Resume, ResumeListItem, ResumeListResponse, ResumeResponse } from "@/types/resume";
import axiosConfig from "../config/axios.config";

type UploadCVResponse<T> = {
  data: T;
  message?: string;
};

type FeedbackJobResponse = {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    role: string;
    job_id: string;
    cv_id: number;
    is_good: boolean;
    saved_at: string;
  };
};

export const uploadUserCV = async <T>(file: File) => {
  const formData = new FormData();
  formData.append("cv", file);

  const response = await axiosConfig.post<UploadCVResponse<T>>(
    "/cv/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    }
  );

  return response.data.data;
};

export const fetchUserCVs = async (): Promise<ResumeListItem[]> => {
  const response = await axiosConfig.get<ResumeListResponse>("/cv");

  if (!response.data.success) {
    return [];
  }

  return response.data.data;
};

export const fetchUserCVById = async (cvId: number): Promise<Resume | null> => {
  const response = await axiosConfig.get<ResumeResponse>(`/cv/${cvId}`);

  if (!response.data.success) {
    throw new Error("Có lỗi xảy ra khi lấy thông tin CV");
  }

  return response.data.data;
};

export const deleteUserCV = async (cvId: number) => {
  await axiosConfig.delete(`/cv/${cvId}`);
};

export const fetchSuitableJobs = async <T>(cvId: number) => {
  const response = await axiosConfig.get<UploadCVResponse<T>>(`/cv/suitable/${cvId}`);
  if (response.status !== 200) {
    return [];
  }

  return response.data.data;
};


export const fetchCVStats = async (cvId: number) => {
  const response = await axiosConfig.get<CVStatsResponse>(`/cv-stats/${cvId}`);
  if (!response.data.success) {
    return null;
  }

  return response.data.data;
};

export const feedbackJobForCV = async (jobId: string, cvId: number, isGood: boolean) => {
  const response = await axiosConfig.post<FeedbackJobResponse>(`/feedback/job/${jobId}`, {
    cv_id: cvId,
    is_good: isGood
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to submit job feedback");
  }

  return response.data.data;
};