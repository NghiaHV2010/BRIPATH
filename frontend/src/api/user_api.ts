import type { AuthUser } from "@/store/auth";
import axiosConfig from "@/config/axios.config";
import type { NotificationResponse } from "@/types/notification";
import type { ChatResponse } from "@/types/chatbot";
import type { ActivityResponse } from "@/types/activity";
import type { UpdateUserProfileRequest, UserProfileResponse } from "@/types/profile";

export const fetchCurrentUserProfile = async (): Promise<AuthUser | null> => {
  const response = await axiosConfig.get("/check", {
    withCredentials: true,
  });

  if (response?.data?.data) {
    return response.data.data as AuthUser;
  }

  return null;
};

export const getUserProfile = async (): Promise<UserProfileResponse | null> => {
  try {
    const response = await axiosConfig.get("/user/profile", {
      withCredentials: true,
    });

    if (response.status === 200 && response.data.success) {
      return response.data as UserProfileResponse;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserAvatar = async (avatarUrl: string): Promise<UserProfileResponse | null> => {
  try {
    const response = await axiosConfig.put("/user/profile", {
      avatar_url: avatarUrl
    });

    if (response.status === 200 && response.data.success) {
      return response.data as UserProfileResponse;
    }

    return null;
  } catch (error) {
    console.error("Error updating user avatar:", error);
    return null;
  }
};

export const updateUserProfile = async (profileData: UpdateUserProfileRequest): Promise<UserProfileResponse | null> => {
  try {
    const response = await axiosConfig.put("/user/profile", profileData);

    if (response.status === 200 && response.data.success) {
      return response.data as UserProfileResponse;
    }

    return null;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export const changePassword = async (passwordData: ChangePasswordRequest): Promise<ApiResponse | null> => {
  try {
    const response = await axiosConfig.post("/change-password", passwordData, {
      withCredentials: true,
    });

    if (response.status === 200) {
      return response.data as ApiResponse;
    }

    return null;
  } catch (error: any) {
    console.error("Error changing password:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu");
  }
};

export const forgotPassword = async (emailData: ForgotPasswordRequest): Promise<ApiResponse | null> => {
  try {
    const response = await axiosConfig.post("/forgot-password", emailData);

    if (response.status === 200) {
      return response.data as ApiResponse;
    }

    return null;
  } catch (error: any) {
    console.error("Error sending forgot password email:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra khi gửi email");
  }
};

export const resetPassword = async (token: string, passwordData: ResetPasswordRequest): Promise<ApiResponse | null> => {
  try {
    const response = await axiosConfig.post(`/reset-password/${token}`, passwordData);

    if (response.status === 200) {
      return response.data as ApiResponse;
    }

    return null;
  } catch (error: any) {
    console.error("Error resetting password:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu");
  }
};


export const getAllNotifications = async (page: number): Promise<NotificationResponse | null> => {
  const response = await axiosConfig.get(
    `/user/notification?page=${page}`
  );

  if (response.status !== 200) {
    return null;
  }

  console.log(response.data);


  return response.data;
}

export const markNotificationAsRead = async (notificationId: number): Promise<NotificationResponse | null> => {
  try {
    const response = await axiosConfig.put('/user/notification', {
      notification_id: notificationId,
    });

    if (response.status !== 200) {
      return null;
    }


    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

export const getAllChatMessages = async (): Promise<ChatResponse | null> => {
  const response = await axiosConfig.get('/agent-chat');

  if (response.status !== 200) {
    return null;
  }

  return response.data;
}


export const sendMessageToChatbot = async (message: string): Promise<Boolean> => {
  const response = await axiosConfig.post('/agent-chat', {
    content: message,
  });

  if (response.status !== 200) {
    return false;
  }

  return true;
}

export const getAllActivities = async (page: number): Promise<ActivityResponse | null> => {
  const response = await axiosConfig.get(`/user/history?page=${page}`);
  if (response.status !== 200) {
    return null;
  }
  return response.data;
}

export const followCompanyApi = async (
  companyId: string
): Promise<{ success: boolean; message: string; data?: any | null }> => {
  try {
    const response = await axiosConfig.get(`/follow-company/${companyId}`);
    console.log("Followed company:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error following company:", error.response?.data || error.message);
    throw error;
  }
};

export const unfollowCompanyApi = async (
  companyId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosConfig.delete(`/follow-company/${companyId}`);
    console.log("Unfollowed company:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error unfollowing company:", error.response?.data || error.message);
    throw error;
  }
};

export const getFollowedCompanies = async (): Promise<{ success: boolean; data: any[] }> => {
  try {
    const response = await axiosConfig.get('/followed-companies');
    const companies = (response.data?.data || []).map((item: any) => item?.companies).filter(Boolean);
    return { success: true, data: companies };
  } catch (error: any) {
    console.error("Error fetching followed companies:", error.response?.data || error.message);
    return { success: false, data: [] };
  }
};





export const forgotPasswordApi = async (email: string) => {
  try {
    const res = await axiosConfig.post(`/forgot-password`, { email });
    return res.data;
  } catch (err: any) {
    console.error("❌ forgotPasswordApi error:", err.response?.data || err);
    throw err.response?.data || err;
  }
};

export const sendResetOtpApi  = async () => {
  try {
    const res = await axiosConfig.get(`/register/email`);
    return res.data;
  } catch (err: any) {
    console.error("❌ sendResetOtpApi error:", err.response?.data || err);
    throw err.response?.data || err;
  }
};

export const resetPasswordApi = async (otp: string, newPassword: string) => {
  try {
    const res = await axiosConfig.post(`/reset-password/${otp}`, {
      newPassword,
    });
    return res.data;
  } catch (err: any) {
    console.error("❌ resetPasswordApi error:", err.response?.data || err);
    throw err.response?.data || err;
  }
};


export const getAllPricingPlans = async (): Promise<any[]> => {
  try {
    const response = await axiosConfig.get('/pricings');
    return response.data.data;
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return [];
  }
};