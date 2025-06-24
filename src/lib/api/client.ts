import type {
	DubbingPipelinePrepareRequest,
	DubbingPipelinePrepareResponse,
	DubbingPipelineRequest,
	DubbingPipelineResponse,
	DubbingPipelineStatus,
	ApiError as ApiErrorType, SendMagicLinkRequest, AuthResponse, VerifyTokenRequest,
	SessionCheckResponse, UserJob, TranscriptionData, UserBalance
} from '$lib/types/api_types';
import { goto } from '$app/navigation';

const API_BASE_URL = 'https://api.blacksmith-lab.com';
const API_TIMEOUT = 30000;

export class ApiClientError extends Error {
	constructor(
		public code: string,
		message: string,
		public status?: number
	) {
		super(message);
		this.name = 'ApiClientError';
	}
}

class ApiClient {
	private pollingTimeouts = new Map<string, NodeJS.Timeout>();

	private readonly baseUrl: string;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	private getAuthHeaders(): Record<string, string> {
		if (typeof window === 'undefined') return {};

		const token = localStorage.getItem('session_token');
		return token ? { 'Authorization': `Bearer ${token}` } : {};
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const config: RequestInit = {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...this.getAuthHeaders(),
				...options.headers,
			},
		};

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
		config.signal = controller.signal;

		try {
			const response = await fetch(url, config);
			clearTimeout(timeoutId);

			if (!response.ok) {
				let errorData: ApiErrorType;
				try {
					errorData = await response.json();
				} catch {
					errorData = {
						code: 'UNKNOWN_ERROR',
						message: `HTTP ${response.status}: ${response.statusText}`
					};
				}

				if (response.status === 401) {
					if (typeof window !== 'undefined') {
						localStorage.removeItem('session_token');
						const { auth } = await import('$lib/stores/auth');
						auth.logout();
						await goto('/auth/login');
					}
				}

				throw new ApiClientError(errorData.code, errorData.message, response.status);
			}

			return await response.json();
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof ApiClientError) {
				throw error;
			}

			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					throw new ApiClientError('TIMEOUT', 'Request timeout');
				}
				throw new ApiClientError('NETWORK_ERROR', `Network error: ${error.message}`);
			}

			throw new ApiClientError('UNKNOWN_ERROR', 'Unknown error occurred');
		}
	}

	async prepareUpload(request: DubbingPipelinePrepareRequest): Promise<DubbingPipelinePrepareResponse> {
		console.log('prepareUpload: ', request);
		return this.request<DubbingPipelinePrepareResponse>('/api/uniframe/dubbing/prepare', {
			method: 'POST',
			body: JSON.stringify(request),
		});
	}

	async uploadFile(
		uploadUrl: string,
		file: File,
		onProgress?: (progress: number) => void
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable && onProgress) {
					const progress = Math.round((event.loaded / event.total) * 100);
					onProgress(progress);
				}
			};

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve();
				} else {
					reject(new ApiClientError('UPLOAD_FAILED', `Upload failed: ${xhr.statusText}`));
				}
			};

			xhr.onerror = () => {
				reject(new ApiClientError('UPLOAD_ERROR', 'Upload network error'));
			};

			xhr.ontimeout = () => {
				reject(new ApiClientError('UPLOAD_TIMEOUT', 'Upload timeout'));
			};

			xhr.open('PUT', uploadUrl);
			xhr.setRequestHeader('Content-Type', file.type);
			xhr.timeout = 600000;
			xhr.send(file);
		});
	}

	async startPipeline(request: DubbingPipelineRequest): Promise<DubbingPipelineResponse> {
		return this.request<DubbingPipelineResponse>('/api/uniframe/dubbing/start', {
			method: 'POST',
			body: JSON.stringify(request),
		});
	}
	
	async getPipelineStatus(jobId: string): Promise<DubbingPipelineStatus> {
		return this.request<DubbingPipelineStatus>(`/api/uniframe/dubbing/${jobId}/status`);
	}

	async pollPipelineStatus(
		jobId: string,
		onUpdate: (status: DubbingPipelineStatus) => void,
		onComplete: (status: DubbingPipelineStatus) => void,
		onError: (error: string) => void
	): Promise<() => void> {
		const pollInterval = 3000;
		let consecutiveErrors = 0;
		const maxConsecutiveErrors = 10;
		let isPolling = true;

		const startTime = Date.now();
		const maxDuration = 24 * 60 * 60 * 1000;

		const poll = async () => {
			if (!isPolling) return

			if (Date.now() - startTime > maxDuration) {
				await this.refundFailedJob(jobId);
				onError('Pipeline timeout - maximum duration exceeded (24 hours)');
				return;
			}

			try {
				const status = await this.getPipelineStatus(jobId);
				consecutiveErrors = 0;
				onUpdate(status);

				if (status.status === 'completed') {
					onComplete(status);
					return;
				}

				if (status.status === 'failed' || status.error_message) {
					await this.refundFailedJob(jobId);
					onError(status.error_message || 'Pipeline failed');
					return;
				}

				const timeoutId = setTimeout(poll, pollInterval);
				this.pollingTimeouts.set(jobId, timeoutId)

			} catch (error) {
				consecutiveErrors++;

				if (consecutiveErrors >= maxConsecutiveErrors) {
					await this.refundFailedJob(jobId);

					if (error instanceof ApiClientError) {
						onError(`Too many consecutive errors: ${error.message}`);
					} else {
						onError('Too many consecutive errors while checking pipeline status');
					}
					return;
				}

				console.warn(`Pipeline status check failed (${consecutiveErrors}/${maxConsecutiveErrors}):`, error);
				const errorInterval = Math.min(pollInterval * consecutiveErrors, 30000); // 3s, 6s, 9s... до 30s
				const timeoutId = setTimeout(poll, errorInterval);
				this.pollingTimeouts.set(jobId, timeoutId);
			}
		};

		await poll();

		return () => {
			isPolling = false;
			const timeoutId = this.pollingTimeouts.get(jobId);
			if (timeoutId) {
				clearTimeout(timeoutId);
				this.pollingTimeouts.delete(jobId);
			}
		};
	}

	async sendMagicLink(request: SendMagicLinkRequest): Promise<AuthResponse> {
		return this.request<AuthResponse>('/api/uniframe/auth/send_magic_link', {
			method: 'POST',
			body: JSON.stringify(request),
		});
	}

	async verifyToken(request: VerifyTokenRequest): Promise<AuthResponse> {
		return this.request<AuthResponse>('/api/uniframe/auth/verify_token', {
			method: 'POST',
			body: JSON.stringify(request),
		});
	}

	async checkSession(token?: string): Promise<SessionCheckResponse> {
		const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

		return this.request<SessionCheckResponse>('/api/uniframe/auth/check_session', {
			method: 'GET',
			headers
		});
	}

	async getUserJobs(): Promise<UserJob[]> {
		return this.request<UserJob[]>('/api/uniframe/user/jobs', {
			method: 'GET'
		});
	}

	async getUserBalance(): Promise<UserBalance> {
		return this.request<UserBalance>('/api/uniframe/user/balance', {
			method: 'GET'
		});
	}

	async refundFailedJob(jobId: string): Promise<void> {
		try {
			await this.request<{ success: boolean }>(`/api/uniframe/user/refund/${jobId}`, {
				method: 'POST'
			});
			console.log(`Refund processed for job: ${jobId}`);
		} catch (error) {
			console.error(`Failed to refund job ${jobId}:`, error);
		}
	}

	async submitTranscriptionReview(jobId: string, transcriptionData: TranscriptionData): Promise<string> {
		const response = await this.request<{ upload_url: string }>(`/api/uniframe/dubbing/${jobId}/submit_review`, {
			method: 'GET'
		});

		const uploadUrl = response.upload_url;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

		try {
			const uploadResponse = await fetch(uploadUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(transcriptionData),
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!uploadResponse.ok) {
				throw new ApiClientError('UPLOAD_FAILED', `Upload failed: ${uploadResponse.statusText}`);
			}

			return uploadUrl;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof ApiClientError) {
				throw error;
			}

			if (error instanceof Error && error.name === 'AbortError') {
				throw new ApiClientError('TIMEOUT', 'Upload timeout');
			}

			throw new ApiClientError('UPLOAD_ERROR', 'Upload network error');
		}
	}
}

export const apiClient = new ApiClient();
