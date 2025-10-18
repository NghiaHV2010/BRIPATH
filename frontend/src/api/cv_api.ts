import type { CVStatsResponse, ResumeListResponse } from "@/types/resume";
import axiosConfig from "../config/axios.config";

type UploadCVResponse<T> = {
  data: T;
  message?: string;
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

export const fetchUserCVs = async () => {
  const response = await axiosConfig.get<ResumeListResponse>("/cv");

  if (!response.data.success) {
    return [];
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