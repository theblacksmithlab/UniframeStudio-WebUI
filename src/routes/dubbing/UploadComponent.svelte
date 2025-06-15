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

			const prepareResponse = await apiClient.prepareUpload({
				filename: generateSafeFilename(file.name),
				content_type: file.type
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
				prepareResponse.job_id
			);

		} catch (error) {
			console.error('Upload failed:', error);
			dubbingActions.setError(error instanceof Error ? error.message : 'Upload failed');
		}
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

<!-- Upload зона -->
<div class="text-center">
	<!-- Заголовок -->
	<div class="mb-8">
		<h2 class="text-3xl font-bold text-white mb-4">
			Upload Your Video
		</h2>
		<p class="text-white/70 text-lg">
			Drag and drop your video file or click to browse
		</p>
	</div>

	<!-- Drag & Drop зона -->
	<div
		class="relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer group"
		class:border-white-30={!isDragOver}
	class:bg-white-5={!isDragOver}
	class:border-blue-400={isDragOver}
	class:bg-blue-500-10={isDragOver}
	class:hover:border-white-50={!isDragOver}
	class:hover:bg-white-10={!isDragOver}
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:click={openFileDialog}
	role="button"
	tabindex="0"
	on:keydown={handleKeyDown}
	>
	<!-- Центральная иконка -->
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

	<!-- Текст -->
	<div class="mb-6">
		<p class="text-xl font-semibold text-white mb-2">
			{isDragOver ? 'Drop your video here' : 'Drop your video here'}
		</p>
		<p class="text-white/60">
			or <span class="text-blue-400 underline">click to browse file</span>
		</p>
	</div>

	<!-- Поддерживаемые форматы -->
	<div class="text-sm text-white/50">
		<p class="mb-1">Supported formats:</p>
		<p>MP4, AVI, MOV, MKV, WEBM, FLV, WMV, 3GP, M4V</p>
		<p class="mt-2">Maximum file size: 1GB</p>
	</div>

	<!-- Скрытый input для выбора файлов -->
	<input
		bind:this={fileInput}
		type="file"
		accept="video/*,.mp4,.avi,.mov,.mkv,.webm,.flv,.wmv,.3gp,.m4v"
		on:change={handleFileSelect}
		class="hidden"
	/>
</div>

<!-- Важные требования к видео -->
<div class="mt-6 p-6 bg-amber-500/10 border border-amber-400/30 rounded-2xl">
	<div class="flex items-start gap-4">
		<!-- Иконка предупреждения -->
		<div class="flex-shrink-0">
			<svg class="w-6 h-6 text-amber-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		</div>

		<!-- Контент предупреждения -->
		<div class="flex-1">
			<h3 class="text-lg font-semibold text-amber-300 mb-3">
				📋 Video Requirements & Limitations
			</h3>

			<div class="space-y-2 text-amber-100/90 text-sm leading-relaxed">
				<p>
					<strong>Audio Quality:</strong> For best results, use videos with clear speech and minimal background noise.
					Loud music or overlapping voices may affect dubbing quality.
				</p>

				<p>
					<strong>Duration:</strong> Videos longer than 30 minutes may take significantly more time to process.
					Consider splitting very long videos for faster turnaround.
				</p>

				<p>
					<strong>Language Detection:</strong> Our AI works best with videos where the primary language is spoken clearly.
					Mixed languages or heavy accents may require manual language selection.
				</p>

				<p>
					<strong>Processing Time:</strong> Typical processing takes 2-5 minutes per minute of video content.
					Complex audio or premium features may extend processing time.
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Ошибка валидации -->
{#if uploadError}
	<div class="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg">
		<p class="text-red-300 font-medium">
			{uploadError}
		</p>
	</div>
{/if}

<!-- Дополнительная информация -->
<div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
	<div class="p-4 bg-white/5 rounded-lg">
		<div class="text-2xl mb-2">🎯</div>
		<h3 class="text-white font-semibold mb-1">High Quality</h3>
		<p class="text-white/60 text-sm">AI-powered dubbing maintains original video quality</p>
	</div>

	<div class="p-4 bg-white/5 rounded-lg">
		<div class="text-2xl mb-2">⏱</div>
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