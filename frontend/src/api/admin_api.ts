import axiosConfig from "../config/axios.config";

// Dashboard API functions
export const getRevenueStats = async () => {
  const response = await axiosConfig.get('/dashboard/revenue');
  return response.data;
};

export const getPaymentStats = async (period: number = 30) => {
  const response = await axiosConfig.get(`/dashboard/payments?period=${period}`);
  return response.data;
};

export const getUserAccessStats = async (period: number = 30) => {
  const response = await axiosConfig.get(`/dashboard/users?period=${period}`);
  return response.data;
};

// Company management
export const getCompaniesByStatus = async (status: 'pending' | 'approved' | 'rejected') => {
  const response = await axiosConfig.get(`/dashboard/company?status=${status}`);
  return response.data;
};

export const updateCompanyStatus = async (companyId: string, status: 'approved' | 'rejected') => {
  const response = await axiosConfig.put(`/dashboard/company/${companyId}`, { status });
  return response.data;
};

// Event management
export const getEventsByStatus = async (status: 'pending' | 'approved' | 'rejected') => {
  const response = await axiosConfig.get(`/dashboard/event?status=${status}`);
  return response.data;
};

export const updateEventStatus = async (eventId: string, status: 'approved' | 'rejected') => {
  const response = await axiosConfig.put(`/dashboard/event/${eventId}`, { status });
  return response.data;
};

// Label management
export const createCompanyLabel = async (labelName: string) => {
  const response = await axiosConfig.post('/company/labels', { label_name: labelName });
  return response.data;
};

export const createJobLabel = async (labelName: string) => {
  const response = await axiosConfig.post('/job-labels', { label_name: labelName });
  return response.data;
};
