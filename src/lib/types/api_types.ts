export interface DubbingPipelineRequest {
	pipeline_id: string;
	job_id: string;
	video_url: string;
	target_language: string;
	tts_provider: string;
	tts_voice: string;
	source_language?: string;
}

export interface DubbingPipelineResponse {
	pipeline_id: string;
	job_id: string;
	status: string;
	created_at: string;
}

export interface DubbingPipelineStatus {
	pipeline_id: string;
	job_id: string;
	status: string;
	step_description: string;
	progress_percentage?: number;
	created_at: string;
	updated_at: string;
	completed_at?: string;
	result_urls?: Record<string, string>;
	error_message?: string;
	processing_steps?: string[];
}

export interface PrepareUploadRequest {
	filename: string;
	content_type: string;
}

export interface PrepareUploadResponse {
	pipeline_id: string;
	job_id: string;
	upload_url: string;
	video_s3_url: string;
	expires_in: number;
}

export interface ApiError {
	code: string;
	message: string;
}

export const SUPPORTED_VIDEO_FORMATS = [
	'.mp4', '.avi', '.mov', '.mkv', '.webm',
	'.flv', '.wmv', '.3gp', '.m4v'
] as const;

export const MAX_FILE_SIZE = 1024 * 1024 * 1024;

export const SUPPORTED_LANGUAGES = [
	{ code: 'en', name: 'English' },
	{ code: 'ru', name: 'Русский' },
	{ code: 'es', name: 'Español' },
	{ code: 'fr', name: 'Français' },
	{ code: 'de', name: 'Deutsch' },
	{ code: 'it', name: 'Italiano' },
	{ code: 'pt', name: 'Português' },
	{ code: 'zh', name: '中文' },
	{ code: 'ja', name: '日本語' },
	{ code: 'ko', name: '한국어' }
] as const;

export const TTS_PROVIDERS = [
	{ id: 'openai', name: 'OpenAI' },
	{ id: 'elevenlabs', name: 'ElevenLabs' }
] as const;

export const OPENAI_VOICES = [
	{ id: 'alloy', name: 'Alloy' },
	{ id: 'echo', name: 'Echo' },
	{ id: 'fable', name: 'Fable' },
	{ id: 'onyx', name: 'Onyx' },
	{ id: 'nova', name: 'Nova' },
	{ id: 'shimmer', name: 'Shimmer' }
] as const;