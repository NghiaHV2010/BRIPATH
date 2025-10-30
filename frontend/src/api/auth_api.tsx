import axiosConfig from "../config/axios.config";

export const login = async (email: string, password: string) => {
  const res = await axiosConfig.post(
    `/login`,
    { email, password },
    { withCredentials: true }
  );
  return res.data;
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
