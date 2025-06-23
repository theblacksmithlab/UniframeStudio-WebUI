import { writable } from 'svelte/store';
import type { DubbingPipelineStatus, UserBalance } from '$lib/types/api_types';
import { apiClient } from '$lib/api/client';

export type DubbingStage = 'idle' | 'uploading' | 'configuring' | 'processing' | 'completed' | 'error';

export interface DubbingData {
	stage: DubbingStage;

	originalFileName?: string;
	filename?: string;

	uploadProgress?: number;
	videoS3Url?: string;
	jobId?: string;

	targetLanguage?: string;
	sourceLanguage?: string;
	ttsProvider?: 'openai' | 'elevenlabs';
	ttsVoice?: string;
	transcriptionKeywords?: string;

	processingStatus?: DubbingPipelineStatus;

	resultUrls?: Record<string, string>;

	error?: string;
	isLoadedJob?: boolean;

	showReviewModal?: boolean;
	reviewFileUrl?: string;
	reviewFileContent?: string;
	reviewProcessedUrl?: string;

	video_duration_seconds?: number;
	estimated_cost_usd?: number;
	user_balance?: UserBalance;
	balance_check_error?: string;
}

export const dubbing = writable<DubbingData>({ stage: 'idle' });

export const dubbingActions = {
	reset() {
		dubbing.set({ stage: 'idle' });
	},

	startUpload(originalFileName: string) {
		dubbing.update(state => ({ ...state, stage: 'uploading', uploadProgress: 0, originalFileName }));
	},

	setUploadProgress(progress: number) {
		dubbing.update(state => ({ ...state, uploadProgress: progress }));
	},

	uploadComplete(videoS3Url: string, jobId: string, video_duration_seconds: number, estimated_cost_usd: number,) {
		dubbing.update(state => ({
			...state,
			stage: 'configuring',
			videoS3Url: videoS3Url,
			jobId: jobId,
			ttsProvider: 'openai',
			ttsVoice: 'onyx',
			video_duration_seconds: video_duration_seconds,
			estimated_cost_usd: estimated_cost_usd,
		}));
	},

	updateConfig(config: Partial<Pick<DubbingData, 'targetLanguage' | 'sourceLanguage' | 'ttsProvider' | 'ttsVoice' | 'transcriptionKeywords'>>) {
		dubbing.update(state => ({ ...state, ...config }));
	},

	startProcessing(jobId: string, status: DubbingPipelineStatus) {
		dubbing.update(state => ({ ...state, stage: 'processing', jobId, processingStatus: status }));
	},

	updateStatus(status: DubbingPipelineStatus) {
		dubbing.update(state => ({ ...state, processingStatus: status }));
	},

	complete(resultUrls: Record<string, string>) {
		dubbing.update(state => ({ ...state, stage: 'completed', resultUrls }));
	},

	setError(error: string) {
		dubbing.update(state => ({ ...state, stage: 'error', error }));
	},

	loadExistingJob(jobData: DubbingPipelineStatus) {
		dubbing.update(state => ({
			...state,
			jobId: jobData.job_id,
			originalFileName: jobData.original_file_name || 'Unknown file',
			stage: jobData.status === 'completed' ? 'completed' :
				jobData.status === 'failed' ? 'error' :
					'processing',
			processingStatus: jobData,
			resultUrls: jobData.result_urls || undefined,
			error: jobData.error_message || undefined,
			isLoadedJob: true
		}));
	},

	async checkUserBalance(estimated_cost: number) {
		try {
			const balance = await apiClient.getUserBalance();

			dubbing.update(state => ({
				...state,
				user_balance: balance,
				balance_check_error: undefined
			}));

			return balance.balance_usd >= estimated_cost &&
				balance.active_dubbing_jobs < balance.max_concurrent_dubbing_jobs;
		} catch (error) {
			console.error('Failed to check user balance:', error);
			dubbing.update(state => ({
				...state,
				user_balance: undefined,
				balance_check_error: error instanceof Error ? error.message : 'Failed to check balance'
			}));
			return false;
		}
	},

	showReview(fileUrl: string) {
		dubbing.update(state => ({
			...state,
			showReviewModal: true,
			reviewFileUrl: fileUrl
		}));
	},

	hideReview() {
		dubbing.update(state => ({
			...state,
			showReviewModal: false,
			reviewFileUrl: undefined,
			reviewFileContent: undefined
		}));
	},

	markReviewProcessed() {
		dubbing.update(state => ({
			...state,
			showReviewModal: false,
			reviewProcessedUrl: state.reviewFileUrl,
			reviewFileUrl: undefined,
			reviewFileContent: undefined
		}));
	}
};
