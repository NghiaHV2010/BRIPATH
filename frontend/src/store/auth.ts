import { create } from "zustand";
import { login as apiLogin, logout as apiLogout, registerValidate, sendRegisterEmail } from "../api/auth_api";

function getErrorMessage(e: unknown, fallback: string): string {
	if (typeof e === 'object' && e !== null && 'response' in e) {
		const resp = (e as Record<string, unknown>).response as Record<string, unknown> | undefined;
		const data = resp && typeof resp === 'object' ? (resp.data as Record<string, unknown> | undefined) : undefined;
		const message = data && typeof data === 'object' ? (data.message as string | undefined) : undefined;
		if (typeof message === 'string') return message;
	}
	return fallback;
}

type User = {
	username?: string;
	email?: string;
	// add more fields as backend returns
};

type AuthState = {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	registerValidate: (username: string, email: string, password: string) => Promise<void>;
		sendRegisterEmail: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,
	loading: false,
	error: null,
		login: async (email, password) => {
		set({ loading: true, error: null });
		try {
			const data = await apiLogin(email, password);
			set({ user: data?.user ?? null, isAuthenticated: true, loading: false });
				} catch (e: unknown) {
					set({ error: getErrorMessage(e, 'Đăng nhập thất bại'), loading: false, isAuthenticated: false });
			throw e;
		}
	},
	logout: async () => {
		set({ loading: true, error: null });
		try {
			await apiLogout();
		} finally {
			set({ user: null, isAuthenticated: false, loading: false });
		}
	},
		registerValidate: async (username, email, password) => {
		set({ loading: true, error: null });
		try {
			await registerValidate(username, email, password);
			set({ loading: false });
				} catch (e: unknown) {
					set({ error: getErrorMessage(e, 'Đăng ký thất bại'), loading: false });
			throw e;
		}
	},
			sendRegisterEmail: async () => {
		set({ loading: true, error: null });
		try {
					await sendRegisterEmail();
			set({ loading: false });
				} catch (e: unknown) {
					set({ error: getErrorMessage(e, 'Gửi OTP thất bại'), loading: false });
			throw e;
		}
	},
}));

