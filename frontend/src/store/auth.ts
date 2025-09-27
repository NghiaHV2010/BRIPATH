import { create } from "zustand";
import { HTTP_SUCCESS } from "../constants/httpCode";
import type { AxiosResponse } from "axios";
import axiosConfig from "../config/axios.config";

export const useAuthStore = create((set, get) => ({
    isCheckingAuth: true,
    authUser: null,

    checkAuth: async () => {
        try {
            const response: AxiosResponse = await axiosConfig.get('/check');

            if (response.status === HTTP_SUCCESS.OK) {
                set({ authUser: response.data?.data })
            }
        } catch (error) {
            // @ts-ignore
            console.error("Error: ", error.response?.data);

            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    }
}));