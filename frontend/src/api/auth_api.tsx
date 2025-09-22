import axios from "axios";

export const login = async (email: string, password: string) => {
  const res = await axios.post("/api/auth/login", { email, password });
  return res.data;
};

export const register = async (email: string, password: string) => {
  const res = await axios.post("/api/auth/register", { email, password });
  return res.data;
};

export const loginGoogle = async (googleToken: string) => {
  const res = await axios.post("/api/auth/google", { token: googleToken });
  return res.data;
};
