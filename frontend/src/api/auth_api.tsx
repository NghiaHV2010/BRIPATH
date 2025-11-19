import axiosConfig from "../config/axios.config";

export const login = async (email: string, password: string) => {
  try {
    const response = await axiosConfig.post('/login', { email, password });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const logout = async () => {
  const res = await axiosConfig.post(`/logout`, {}, { withCredentials: true });
  return res.data;
};

export const registerValidate = async (
  username: string,
  email: string,
  password: string
) => {
  const res = await axiosConfig.post(
    `/register/validate`,
    { username, email, password },
    { withCredentials: true }
  );
  return res.data;
};

export const sendRegisterEmail = async () => {
  const res = await axiosConfig.get(`/register/email`, {
    withCredentials: true,
  });
  return res.data;
};

export const verifyRegisterEmail = async (token: string) => {
  const res = await axiosConfig.get(`/register/email/${token}`);
  return res.data;
};

export const verifySMS = async (token: string) => {
  const res = await axiosConfig.post(`/verify-sms`, { token });
  return res.data;
};

export const create2FAQR = async () => {
  try {
    const response = await axiosConfig.get('/enable-2fa');

    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const verify2FA = async (token: string) => {
  try {
    const response = await axiosConfig.post('/verify-2fa', { token });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const disable2FA = async (token: string) => {
  try {
    const response = await axiosConfig.post('/disable-2fa', { token });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const verify2FALogin = async (tempToken: string, token: string) => {
  try {
    const response = await axiosConfig.post('/login/verify-2fa', {
      temp_token: tempToken,
      token
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};