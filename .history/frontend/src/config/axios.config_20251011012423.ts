import axios from "axios";

const axiosConfig = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
});

// Add response interceptor to handle 304
axiosConfig.interceptors.response.use(
    (response) => {
        // For 304, axios might not populate response.data properly
        if (response.status === 304) {
            console.warn("304 Not Modified received");
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosConfig;