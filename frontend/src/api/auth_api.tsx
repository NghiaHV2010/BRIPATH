import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/login`, { email, password }, { withCredentials: true });
  return res.data;
};

export const logout = async () => {
  const res = await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
  return res.data;
};

export const registerValidate = async (username: string, email: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/register/validate`, { username, email, password }, { withCredentials: true });
  return res.data;
};

export const sendRegisterEmail = async () => {
  const res = await axios.get(`${BASE_URL}/register/email`, { withCredentials: true });
  return res.data;
};

export const verifyRegisterEmail = async (token: string) => {
  const res = await axios.get(`${BASE_URL}/register/email/${token}`, { withCredentials: true });
  return res.data;
};

export const getGoogleLoginUrl = () => `${BASE_URL}/login/google`;
