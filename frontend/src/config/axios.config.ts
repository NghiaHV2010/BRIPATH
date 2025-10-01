import axios, { AxiosError } from "axios";

// Determine backend URL with multiple fallbacks (typed access)
type ViteEnv = { VITE_BACKEND_URL?: string; BACKEND_URL?: string };
const viteEnv: ViteEnv = (import.meta as unknown as { env: ViteEnv }).env || {};
const envUrl = viteEnv.VITE_BACKEND_URL || viteEnv.BACKEND_URL;
const fallbackUrl = "http://localhost:3000/api"; // final fallback for local dev
const baseURL = envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0 ? envUrl : fallbackUrl;

const axiosConfig = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor (add future auth token if needed)
axiosConfig.interceptors.request.use(
    (config) => {
        // Example: attach token if stored later
        return config;
    },
    (error) => Promise.reject(error)
);

// Helper to extract meaningful message
const extractMessage = (data: unknown): string | null => {
    if (!data || typeof data !== 'object') return null;
    const record = data as Record<string, unknown>;
    const cand = [record.message, record.error, record.msg];
    for (const c of cand) {
        if (typeof c === 'string' && c.trim()) return c;
    }
    return null;
};

// Response interceptor to normalize errors
axiosConfig.interceptors.response.use(
    (response) => response,
        (error: AxiosError) => {
            interface ExtendedAxiosError extends AxiosError {
                normalizedMessage?: string;
            }
            const extErr = error as ExtendedAxiosError;
            if (extErr.response) {
                const normalized = extractMessage(extErr.response.data) || `HTTP ${extErr.response.status}`;
                extErr.normalizedMessage = normalized;
            } else if (extErr.request) {
                extErr.normalizedMessage = "Không nhận được phản hồi từ máy chủ";
            } else {
                extErr.normalizedMessage = extErr.message || "Lỗi không xác định";
            }
            return Promise.reject(extErr);
        }
);

export default axiosConfig;