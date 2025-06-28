export interface DubbingPipelinePrepareRequest {
	system_file_name: string;
	original_file_name: string;
	content_type: string;
	video_duration_seconds: number;
}

export interface DubbingPipelinePrepareResponse {
	job_id: string;
	upload_url: string;
	video_s3_url: string;
	expires_in: number;
	estimated_cost_usd: number,
	video_duration_seconds: number,
}

export interface DubbingPipelineRequest {
	job_id: string;
	video_url: string;
	target_language: string;
	tts_provider: string;
	tts_voice: string;
	source_language?: string;
	transcription_keywords?: string;
}

export interface DubbingPipelineResponse {
	job_id: string;
	status: string;
	created_at: string;
}

export interface DubbingPipelineStatus {
	job_id: string;
	status: string;
	progress_percentage?: number;
	step?: number;
	stage: 'preparation' | 'processing' | 'finalization';
	step_description: string;

	current_step_index?: number;
	processing_steps?: string[];

	error_message?: string;
	result_urls?: Record<string, string>;
	created_at: string;
	updated_at: string;
	completed_at?: string;

	original_file_name?: string;
	review_required_url?: string;
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

export interface SendMagicLinkRequest {
	email: string;
	captcha_token: string;
}

export interface VerifyTokenRequest {
	token: string;
}

export interface AuthResponse {
	success: boolean;
	message: string;
	session_token?: string;
}

export interface SessionCheckResponse {
	valid: boolean;
	user_email: string;
}

export interface UserJob {
	job_id: string;
	original_file_name: string;
	status: string;
	created_at: string;
}

export interface TranscriptionSegment {
	id: number;
	start: number;
	end: number;
	text: string;
	translated_text: string;
}

export interface TranscriptionData {
	text: string;
	segments: TranscriptionSegment[];
	translated_text: string;
}

export interface UserBalance {
	balance_usd: number;
	active_dubbing_jobs: number;
	active_lipsync_jobs: number;
	max_concurrent_dubbing_jobs: number;
	max_concurrent_lipsync_jobs: number;
}

export interface TopUpRequest {
	amount_usd: number;
}

export interface TopUpResponse {
	payment_url: string;
	order_id: string;
	amount_usd: number;
}
