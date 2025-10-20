import axiosConfig from "@/config/axios.config";

export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  working_time?: string;
  banner_url?: string;
  quantity?: number;
  status: ApplicantStatus;
  approved_at?: Date;
  user_id: string;
}

export interface EventResponse {
  data: Event[];
  totalPages: number;
}



export type ApplicantStatus = 'pending' | 'approved' | 'rejected';

export const getAllEvents = async (page: number = 1): Promise<EventResponse> => {
  const response = await axiosConfig.get<EventResponse>('/events', {
    params: { page },
  });
  return response.data;
};


export const getEventsByUserId = async (
  userId: string,
  page: number = 1,
  status?: ApplicantStatus
): Promise<EventResponse> => {
  const response = await axiosConfig.get<EventResponse>(`/events/${userId}`, {
    params: { page, status },
  });
  return response.data;
};


export const applyEvent = async (eventId: number, description: string) => {
  const response = await axiosConfig.post(`/apply-event/${eventId}`, {
    description,
  });
  return response.data;
};


export const createEvent = async (
  title: string,
  description: string,
  start_date: string,
  end_date?: string,
  quantity?: number,
  working_time?: string,
  banner_url?: string
) => {
  const response = await axiosConfig.post(`/events`, {
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


export const updateEvent = async (
  eventId: number,
  title: string,
  description: string,
  start_date: string,
  end_date?: string,
  quantity?: number,
  working_time?: string,
  banner_url?: string
) => {
  const response = await axiosConfig.put(`/events/${eventId}`, {
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


export const deleteEvent = async (eventId: number) => {
  const response = await axiosConfig.delete(`/events/${eventId}`);
  return response.data;
};




