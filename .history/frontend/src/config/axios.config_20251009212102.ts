import axios from "axios";

const axiosConfig = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
});

export default axiosConfig;