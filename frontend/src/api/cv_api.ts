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
      },
      withCredentials: true,
    }
  );

  return response.data.data;
};

export const fetchUserCVs = async <T>() => {
  const response = await axiosConfig.get<UploadCVResponse<T>>("/cv", {
    withCredentials: true,
  });

  return response.data.data;
};

export const deleteUserCV = async (cvId: number) => {
  await axiosConfig.delete(`/cv/${cvId}`, {
    withCredentials: true,
  });
};

export const fetchSuitableJobs = async <T>(cvId: number) => {
  const response = await axiosConfig.get<UploadCVResponse<T>>(`/cv/suitable/${cvId}`, {
    withCredentials: true,
  });

  return response.data.data;
};
