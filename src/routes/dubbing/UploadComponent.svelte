<script lang="ts">
	import { dubbingActions } from '$lib/stores/dubbing';
	import { validateVideoFile } from '$lib/utils/validation';
	import { apiClient } from '$lib/api/client';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let isDragOver = false;
	let fileInput: HTMLInputElement;
	let uploadError = '';

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFile(files[0]);
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			handleFile(files[0]);
		}
	}

	function generateSafeFilename(originalFilename: string): string {
		const extension = originalFilename.split('.').pop()?.toLowerCase() || 'mp4';

		const uuid = crypto.randomUUID();

		return `${uuid}.${extension}`;
	}

	async function handleFile(file: File) {
		if (!$auth.isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		uploadError = '';

		const validation = validateVideoFile(file);
		if (!validation.isValid) {
			uploadError = validation.error!.message;
			return;
		}

		try {
			dubbingActions.startUpload(file.name);

			let videoDurationSeconds;
			try {
				videoDurationSeconds = await getVideoDuration(file);
				console.log('Video duration:', videoDurationSeconds, 'seconds');
			} catch (error) {
				console.error('Failed to get video duration:', error);
				uploadError = 'Failed to get video file duration. Try again with another file.';
				dubbingActions.setError(uploadError);
				return;
			}

			const prepareResponse = await apiClient.prepareUpload({
				system_file_name: generateSafeFilename(file.name),
				original_file_name: file.name,
				content_type: file.type,
				video_duration_seconds: videoDurationSeconds
			});

			await apiClient.uploadFile(
				prepareResponse.upload_url,
				file,
				(progress) => {
					dubbingActions.setUploadProgress(progress);
				}
			);

			dubbingActions.uploadComplete(
				prepareResponse.video_s3_url,
				prepareResponse.job_id,
				prepareResponse.video_duration_seconds,
				prepareResponse.estimated_cost_usd,
			);

		} catch (error) {
			console.error('Upload failed:', error);
			uploadError = error instanceof Error ? error.message : 'Upload failed';
			dubbingActions.setError(uploadError);
		}
	}

	function getVideoDuration(file: File): Promise<number> {
		return new Promise((resolve, reject) => {
			const video = document.createElement('video');
			video.preload = 'metadata';

			video.onloadedmetadata = () => {
				URL.revokeObjectURL(video.src);
				resolve(video.duration);
			};

			video.onerror = () => {
				URL.revokeObjectURL(video.src);
				reject(new Error('Error getting video duration'));
			};

			video.src = URL.createObjectURL(file);
		});
	}

	function openFileDialog() {
		fileInput.click();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openFileDialog();
		}
	}
</script>

<div class="absolute inset-0 bg-black/20"></div>
<!-- Upload zone -->
<div class="text-center">
	<!-- Title -->
	<div class="mb-8">
		<h2 class="text-3xl font-bold text-white mb-4">
			Upload Your Video
		</h2>
		<p class="text-white/70 text-lg">
			Drag and drop your video file or click to browse
		</p>
	</div>

	<!-- Drag & Drop zone -->
	<div
		class="relative border-2 border-dotted rounded-2xl p-12 transition-all duration-300 cursor-pointer group upload-zone"
		class:drag-over={isDragOver}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
		on:click={openFileDialog}
		role="button"
		tabindex="0"
		on:keydown={handleKeyDown}
	>
	<!-- Central icon -->
	<div class="mb-6">
		<svg
			class="w-16 h-16 mx-auto text-white/40 group-hover:text-white/60 transition-colors duration-300"
			class:text-blue-400={isDragOver}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
			/>
		</svg>
	</div>

	<!-- Text -->
	<div class="mb-6">
		<p class="text-xl font-semibold text-white mb-2">
			{isDragOver ? 'Drop your video here' : 'Drop your video here'}
		</p>
		<p class="text-white/60">
			or <span class="text-blue-400 underline">click to browse file</span>
		</p>
	</div>

	<!-- Supported formats -->
	<div class="text-sm text-white/50">
		<p class="mb-1">Supported formats:</p>
		<p>MP4, AVI, MOV, MKV, WEBM, FLV, WMV, 3GP, M4V</p>
		<p class="mt-2">Maximum file size: 1GB</p>
	</div>

	<!-- File browser -->
	<input
		bind:this={fileInput}
		type="file"
		accept="video/*,.mp4,.avi,.mov,.mkv,.webm,.flv,.wmv,.3gp,.m4v"
		on:change={handleFileSelect}
		class="hidden"
	/>
</div>

<!-- Requirements -->
<div class="mt-6 p-6 bg-amber-500/10 border border-amber-400/30 rounded-2xl">
	<div class="flex items-start gap-4">
		<!-- Attention icon -->
		<div class="flex-shrink-0">
			<svg class="w-6 h-6 text-amber-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		</div>

		<!-- Warnings -->
		<div class="flex-1">
			<h3 class="text-lg font-semibold text-amber-300 mb-3">
				📋 Video Requirements & Limitations
			</h3>

			<div class="space-y-2 text-amber-100/90 text-sm leading-relaxed text-left">
				<p>
					<strong>🎙 Audio:</strong> For best results, use videos with clear speech and minimal background noise.
					<br>Loud music or overlapping voices may affect dubbing quality.
				</p>

				<p>
					<strong>🎬 Content Type:</strong> The system performs best with lecture-style content, monologues, narrations, or structured dialogues.
					<br>Action-heavy scenes with overlapping speech, loud sound effects, or background noise <strong>will</strong> reduce dubbing quality.
				</p>

				<p>
					<strong>🕒 Source Video Duration/Processing Time:</strong> Longer videos will take significantly more time to process.
				</p>

				<p>
					<strong>🌐 Language Detection:</strong> To improve accuracy, we recommend manually setting the source language, especially for content with accents, mixed languages, or non-standard pronunciation.
				</p>
			</div>
		</div>

		<div class="flex-shrink-0">
			<svg class="w-6 h-6 text-amber-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		</div>
	</div>
</div>

<!-- Validation error -->
{#if uploadError}
	<div class="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg">
		<p class="text-red-300 font-medium">
			{uploadError}
		</p>
	</div>
{/if}

<!-- Additional info -->
<div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
	<div class="p-4 bg-white/5 rounded-lg">
		<div class="text-2xl mb-2">🎯</div>
		<h3 class="text-white font-semibold mb-1">High Quality</h3>
		<p class="text-white/60 text-sm">AI-powered dubbing system maintains original video quality</p>
	</div>

	<div class="p-4 bg-white/5 rounded-lg">
		<div class="text-2xl mb-2">⌚</div>
		<h3 class="text-white font-semibold mb-1">Flawless timing</h3>
		<p class="text-white/60 text-sm">Algorithm ensures every word and every pause lands exactly where it should</p>
	</div>

	<div class="p-4 bg-white/5 rounded-lg">
		<div class="text-2xl mb-2">🔒</div>
		<h3 class="text-white font-semibold mb-1">Secure Upload</h3>
		<p class="text-white/60 text-sm">Your files are encrypted and safely stored</p>
	</div>
</div>
</div>

<style>
    .upload-zone {
        border-color: rgba(255, 255, 255, 0.3);
        background-color: rgba(255, 255, 255, 0.05);
    }

    .upload-zone:hover:not(.drag-over) {
        border-color: rgba(255, 255, 255, 0.5);
        background-color: rgba(255, 255, 255, 0.08);
    }

    .upload-zone.drag-over {
        border-color: #60a5fa; /* blue-400 */
        background-color: rgba(59, 130, 246, 0.1); /* blue-500/10 */
    }
</style>