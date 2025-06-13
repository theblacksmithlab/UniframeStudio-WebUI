import { writable } from 'svelte/store';
import type { DubbingPipelineStatus } from '$lib/types/api_types';

export type DubbingStage = 'idle' | 'uploading' | 'configuring' | 'processing' | 'completed' | 'error';

export interface DubbingData {
	stage: DubbingStage;

	uploadProgress?: number;
	videoS3Url?: string;
	pipelineId?: string;
	jobId?: string;

	targetLanguage?: string;
	sourceLanguage?: string;
	ttsProvider?: 'openai' | 'elevenlabs';
	ttsVoice?: string;

	processingStatus?: DubbingPipelineStatus;

	resultUrls?: Record<string, string>;

	error?: string;
}

export const dubbing = writable<DubbingData>({ stage: 'idle' });

export const dubbingActions = {
	reset() {
		dubbing.set({ stage: 'idle' });
	},

	startUpload() {
		dubbing.update(state => ({ ...state, stage: 'uploading', uploadProgress: 0 }));
	},

	setUploadProgress(progress: number) {
		dubbing.update(state => ({ ...state, uploadProgress: progress }));
	},

	uploadComplete(videoS3Url: string, pipelineId: string, jobId: string) {
		dubbing.update(state => ({
			...state,
			stage: 'configuring',
			videoS3Url,
			pipelineId,
			jobId,
			// Defaults
			ttsProvider: 'openai',
			ttsVoice: 'onyx'
		}));
	},

	updateConfig(config: Partial<Pick<DubbingData, 'targetLanguage' | 'sourceLanguage' | 'ttsProvider' | 'ttsVoice'>>) {
		dubbing.update(state => ({ ...state, ...config }));
	},

	startProcessing(pipelineId: string, status: DubbingPipelineStatus) {
		dubbing.update(state => ({ ...state, stage: 'processing', pipelineId, processingStatus: status }));
	},

	updateStatus(status: DubbingPipelineStatus) {
		dubbing.update(state => ({ ...state, processingStatus: status }));
	},

	complete(resultUrls: Record<string, string>) {
		dubbing.update(state => ({ ...state, stage: 'completed', resultUrls }));
	},

	setError(error: string) {
		dubbing.update(state => ({ ...state, stage: 'error', error }));
	}
};
