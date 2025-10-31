import { create } from "zustand";
import { HTTP_SUCCESS } from "../constants/httpCode";
import type { AxiosError, AxiosResponse } from "axios";
import axiosConfig from "../config/axios.config";
import { registerValidate as apiRegisterValidate, sendRegisterEmail as apiSendRegisterEmail, login as apiLogin, logout as apiLogout } from "../api/auth_api";

// Reflect backend /check response shape (subset). Feel free to expand as needed.
export interface AuthUser {
	id: string;
	username: string;
	avatar_url?: string | null;
	email: string;
	phone_verified: boolean;
	company_id?: string | null;
	roles: {
		role_name: string;
	};
	_count: {
		userNotifications: number;
	};
}
interface AuthState {
	isCheckingAuth: boolean;
	isProcessing: boolean;
	authUser: AuthUser | null;
	error: string | null;
	checkAuth: () => Promise<void>;
	registerValidate: (u: string, e: string, p: string) => Promise<void>;
	sendRegisterEmail: () => Promise<void>;
	clearError: () => void;
	login?: (email: string, password: string) => Promise<void>;
	logout?: () => Promise<void>;
	updateUser: (updates: Partial<AuthUser>) => void;
	// Helper methods for role checking
	isCompany: () => boolean;
	isCandidate: () => boolean;
	hasCompany: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	isCheckingAuth: true,
	isProcessing: false,
	authUser: null,
	error: null,

	checkAuth: async () => {
		try {
			const response: AxiosResponse = await axiosConfig.get('/check');
			if (response.status === HTTP_SUCCESS.OK && response.data?.data) {
				set({ authUser: response.data.data as AuthUser });
			} else {
				set({ authUser: null });
			}
		} catch {
			// swallow; user stays unauth
			set({ authUser: null });
		} finally {
			set({ isCheckingAuth: false });
		}
	},

	registerValidate: async (username: string, email: string, password: string) => {
		set({ isProcessing: true, error: null });
		try {
			await apiRegisterValidate(username, email, password);
		} catch (err) {
			const axiosErr = err as AxiosError<unknown>;
			const data = (axiosErr.response?.data || {}) as Record<string, unknown>;
			const message = (typeof data.message === 'string' && data.message) || (typeof data.error === 'string' && data.error) || 'Đăng ký không thành công';
			set({ error: message });
			throw err;
		} finally {
			set({ isProcessing: false });
		}
	},

	sendRegisterEmail: async () => {
		set({ isProcessing: true, error: null });
		try {
			await apiSendRegisterEmail();
		} catch (err) {
			const axiosErr = err as AxiosError<unknown>;
			const data = (axiosErr.response?.data || {}) as Record<string, unknown>;
			const message = (typeof data.message === 'string' && data.message) || (typeof data.error === 'string' && data.error) || 'Gửi email xác minh thất bại';
			set({ error: message });
			throw err;
		} finally {
			set({ isProcessing: false });
		}
	},

	clearError: () => set({ error: null }),

	updateUser: (updates: Partial<AuthUser>) => {
		const { authUser } = get();
		if (authUser) {
			set({ authUser: { ...authUser, ...updates } });
		}
	},

	login: async (email: string, password: string) => {
		set({ isProcessing: true, error: null });
		try {
			// Trim to prevent accidental space issues that can cause 400 invalid credentials
			const cleanEmail = email.trim();
			const cleanPassword = password.trim();
			const data = await apiLogin(cleanEmail, cleanPassword);
			// giả định backend trả user ở data.data || data.user
			const user = (data && (data.data || data.user)) || null;
			set({ authUser: user });
		} catch (err) {
			const axiosErr = err as AxiosError<unknown>;
			const resp = (axiosErr.response?.data || {}) as Record<string, unknown>;
			const message = (typeof resp.message === 'string' && resp.message) || (typeof resp.error === 'string' && resp.error) || 'Đăng nhập thất bại';
			set({ error: message, authUser: null });
			throw err;
		} finally {
			set({ isProcessing: false });
		}
	},

	logout: async () => {
		set({ isProcessing: true });
		try {
			await apiLogout();
		} catch (err) {
			// Even if logout API fails, we should clear local state
			console.error('Logout error', err);
		} finally {
			// Always clear local auth state regardless of API response
			set({ authUser: null, isProcessing: false });
		}
	},

	// Helper methods for role checking
	isCompany: () => {
		const { authUser } = get();
		return authUser?.roles.role_name === "Company";
	},

	isCandidate: () => {
		const { authUser } = get();
		return authUser?.roles.role_name === "Candidate";
	},

	isAdmin: () => {
		const { authUser } = get();
		return authUser?.roles.role_name === "Admin";
	},

	hasCompany: () => {
		const { authUser } = get();
		return !!authUser?.company_id;
	}
}));