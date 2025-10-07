import type { AuthUser } from "@/store/auth";
import axiosConfig from "@/config/axios.config";

export const fetchCurrentUserProfile = async (): Promise<AuthUser | null> => {
  const response = await axiosConfig.get("/check", {
    withCredentials: true,
  });

  if (response?.data?.data) {
    return response.data.data as AuthUser;
  }

  return null;
};
