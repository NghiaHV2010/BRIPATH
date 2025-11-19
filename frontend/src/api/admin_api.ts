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
  const response = await axiosConfig.post('/dashboard/company/labels', { label_name: labelName });
  return response.data;
};

export const createJobLabel = async (labelName: string) => {
  const response = await axiosConfig.post('/dashboard/job-labels', { label_name: labelName });
  return response.data;
};

// Get all job labels
export const getAllJobLabels = async () => {
  const response = await axiosConfig.get('/job/labels');
  return response.data;
};

// Get all company labels
export const getAllCompanyLabels = async () => {
  const response = await axiosConfig.get('/company/label');
  return response.data;
};

// Reports management
export const getAllReports = async (page: number = 1, status?: 'pending' | 'approved' | 'rejected') => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  if (status) {
    params.append('status', status);
  }
  const response = await axiosConfig.get(`/dashboard/reports?${params.toString()}`);
  return response.data;
};

export const updateReportStatus = async (reportId: number, status: 'approved' | 'rejected') => {
  const response = await axiosConfig.put(`/dashboard/report/${reportId}`, { status });
  return response.data;
};

// User management
export const getAllUsers = async (page: number = 1, search?: string, roleId?: number | null) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  if (search) {
    params.append('search', search);
  }
  if (roleId !== null && roleId !== undefined) {
    params.append('roleId', roleId.toString());
  }
  const response = await axiosConfig.get(`/dashboard/users/list?${params.toString()}`);
  return response.data;
};

// Dashboard quick stats and recent activities
export const getDashboardQuickStats = async () => {
  const response = await axiosConfig.get('/dashboard/quick-stats');
  return response.data;
};

export const getRecentActivities = async () => {
  const response = await axiosConfig.get('/dashboard/recent-activities');
  return response.data;
};