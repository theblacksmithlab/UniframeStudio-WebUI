import { SUPPORTED_VIDEO_FORMATS, MAX_FILE_SIZE } from '$lib/types/api_types';

export interface ValidationError {
	code: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	error?: ValidationError;
}

export function validateVideoFile(file: File): ValidationResult {
	if (file.size > MAX_FILE_SIZE) {
		return {
			isValid: false,
			error: {
				code: 'FILE_TOO_LARGE',
				message: `File size exceeds 1GB limit. Current size: ${formatFileSize(file.size)}`
			}
		};
	}

	const fileExtension = getFileExtension(file.name);
	if (!SUPPORTED_VIDEO_FORMATS.includes(fileExtension as typeof SUPPORTED_VIDEO_FORMATS[number])) {
		return {
			isValid: false,
			error: {
				code: 'UNSUPPORTED_FORMAT',
				message: `Unsupported file format: ${fileExtension}. Supported formats: ${SUPPORTED_VIDEO_FORMATS.join(', ')}`
			}
		};
	}

	if (!file.type.startsWith('video/')) {
		return {
			isValid: false,
			error: {
				code: 'INVALID_MIME_TYPE',
				message: `Invalid file type. Expected video file, got: ${file.type}`
			}
		};
	}

	return { isValid: true };
}

function getFileExtension(filename: string): string {
	const lastDot = filename.lastIndexOf('.');
	if (lastDot === -1) return '';
	return filename.substring(lastDot).toLowerCase();
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateDubbingConfig(config: {
	targetLanguage?: string;
	ttsProvider?: string;
	ttsVoice?: string;
}): ValidationResult {
	if (!config.targetLanguage) {
		return {
			isValid: false,
			error: {
				code: 'MISSING_TARGET_LANGUAGE',
				message: 'Target language is required'
			}
		};
	}

	if (!config.ttsProvider) {
		return {
			isValid: false,
			error: {
				code: 'MISSING_TTS_PROVIDER',
				message: 'TTS provider is required'
			}
		};
	}

	if (!config.ttsVoice) {
		return {
			isValid: false,
			error: {
				code: 'MISSING_TTS_VOICE',
				message: 'TTS voice is required'
			}
		};
	}

	return { isValid: true };
}