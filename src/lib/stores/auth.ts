import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { apiClient } from '$lib/api/client';

interface AuthState {
	isAuthenticated: boolean;
	sessionToken: string | null;
	userEmail: string | null;
	loading: boolean;
}

const createAuthStore = () => {
	const { subscribe, set } = writable<AuthState>({
		isAuthenticated: false,
		sessionToken: null,
		userEmail: null,
		loading: true
	});

	return {
		subscribe,

		init: async () => {
			if (!browser) return;

			const token = localStorage.getItem('session_token');
			if (!token) {
				set({ isAuthenticated: false, sessionToken: null, userEmail: null, loading: false });
				return;
			}

			try {
				const response = await apiClient.checkSession(token);

				set({
					isAuthenticated: response.valid,
					sessionToken: token,
					userEmail: response.user_email,
					loading: false
				});
			} catch (error) {
				console.error('Auth check failed:', error);
				set({ isAuthenticated: false, sessionToken: null, userEmail: null, loading: false });
			}
		},

		setSession: (token: string, email: string) => {
			if (browser) {
				localStorage.setItem('session_token', token);
			}
			set({ isAuthenticated: true, sessionToken: token, userEmail: email, loading: false });

			console.log(token, email);
			const isToken = localStorage.getItem('session_token');
			console.log(isToken);
		},

		logout: () => {
			if (browser) {
				localStorage.removeItem('session_token');
			}
			set({ isAuthenticated: false, sessionToken: null, userEmail: null, loading: false });
		}
	};
};

export const auth = createAuthStore();
