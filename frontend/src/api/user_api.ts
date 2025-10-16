import type { AuthUser } from "@/store/auth";
import axiosConfig from "@/config/axios.config";
import type { NotificationResponse } from "@/types/notification";
import type { ChatResponse } from "@/types/chatbot";
import type { ActivityResponse } from "@/types/activity";

export const fetchCurrentUserProfile = async (): Promise<AuthUser | null> => {
  const response = await axiosConfig.get("/check", {
    withCredentials: true,
  });

  if (response?.data?.data) {
    return response.data.data as AuthUser;
  }

  return null;
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