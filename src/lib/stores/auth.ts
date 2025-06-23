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

	let initPromise: Promise<void> | null = null;

	return {
		subscribe,

		init: async () => {
			if (initPromise) return initPromise;

			initPromise = (async () => {
				if (!browser) {
					set({ isAuthenticated: false, sessionToken: null, userEmail: null, loading: false });
					return;
				}

				const token = localStorage.getItem('session_token');
				if (!token) {
					set({ isAuthenticated: false, sessionToken: null, userEmail: null, loading: false });
					return;
				}

				try {
					const response = await apiClient.checkSession(token);

					if (response.valid) {
						set({
							isAuthenticated: true,
							sessionToken: token,
							userEmail: response.user_email,
							loading: false
						});
					} else {
						localStorage.removeItem('session_token');
						set({ isAuthenticated: false, sessionToken: null, userEmail: null, loading: false });
					}
				} catch (error) {
					console.error('Auth check failed:', error);
					localStorage.removeItem('session_token');
					set({ isAuthenticated: false, sessionToken: null, userEmail: null, loading: false });
				}
			})();

			return initPromise;
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
			initPromise = null;
		}
	};
};

export const auth = createAuthStore();
