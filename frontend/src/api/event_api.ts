import axiosConfig from "@/config/axios.config";

export interface Event {
  id?: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  quantity: number;
  working_time?: string;
  banner_url?: string;
  status?: "pending" | "approved" | "rejected";
  approved_at?: string | null;
  user_id?: string;
  volunteers?: Volunteer[]; // For checking if user has applied
  users?: {
    username: string;
    avatar_url?: string;
  };
  created_at?: string;
  likes_count?: number;
  bookmarks_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface EventCreateRequest {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  quantity?: number;
  working_time?: string;
  banner_url?: string;
}

export interface Volunteer {
  id?: string;
  name: string;
  email?: string;
  status?: "pending" | "approved" | "rejected";
  applied_at?: string | null;
  user_id?: string;
}

export interface EventResponse {
  success: boolean;
  data: Event[];
  totalPages: number;
  volunteers?: Volunteer[]; // For getEventsByUserId
}

// Get all events with pagination
export const getAllEvents = async (page: number = 1): Promise<EventResponse> => {
  const response = await axiosConfig.get<EventResponse>('/events', {
    params: { page },
  });
  return response.data;
};

// Get events by user ID with status filter
export const getEventsByUserId = async (
  userId: string,
  page: number = 1,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<EventResponse> => {
  const response = await axiosConfig.get<EventResponse>(`/events/${userId}`, {
    params: { page, ...(status && { status }) },
  });
  return response.data;
};

// Apply to an event
export const applyEvent = async (eventId: string, description: string) => {
  const response = await axiosConfig.post(`/apply-event/${eventId}`, {
    description,
  });
  return response.data;
};

// Create new event
export const createEvent = async (event: EventCreateRequest) => {
  try {
    const response = await axiosConfig.post('/event', event);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Update event
export const updateEvent = async (
  eventId: string,
  title: string,
  description: string,
  start_date: string,
  end_date?: string,
  quantity?: number,
  working_time?: string,
  banner_url?: string
) => {
  const response = await axiosConfig.put(`/event/${eventId}`, {
    title,
    description,
    start_date,
    end_date,
    quantity,
    working_time,
    banner_url
  });
  return response.data;
};

// Delete event
export const deleteEvent = async (eventId: string) => {
  const response = await axiosConfig.delete(`/event/${eventId}`);
  return response.data;
};

// Get volunteers by event ID and status
export const getVolunteerByStatus = async (
  eventId: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<EventResponse> => {
  const response = await axiosConfig.get<EventResponse>('/volunteers', {
    params: { eventId, status },
  });
  return response.data;
};

// Like an event
export const likeEvent = async (eventId: string) => {
  const response = await axiosConfig.post(`/event/${eventId}/like`);
  return response.data;
};

// Unlike an event
export const unlikeEvent = async (eventId: string) => {
  const response = await axiosConfig.delete(`/event/${eventId}/like`);
  return response.data;
};

// Bookmark an event
export const bookmarkEvent = async (eventId: string) => {
  const response = await axiosConfig.post(`/event/${eventId}/bookmark`);
  return response.data;
};

// Unbookmark an event
export const unbookmarkEvent = async (eventId: string) => {
  const response = await axiosConfig.delete(`/event/${eventId}/bookmark`);
  return response.data;
};

// Get recommended jobs
export const getRecommendedJobs = async () => {
  try {
    const response = await axiosConfig.get('/recommend-jobs');
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

// Get recommended companies
export const getRecommendedCompanies = async (userId?: string) => {
  try {
    const response = await axiosConfig.get('/recommended-companies', {
      params: userId ? { userId } : {},
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};