<script lang="ts">
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';
	import type { TranscriptionData, TranscriptionSegment } from '$lib/types/api_types';
	import { apiClient } from '$lib/api/client';

	$: config = $dubbing;
	$: isVisible = config.showReviewModal;
	$: reviewFileUrl = config.reviewFileUrl;

	let isLoading = true;
	let isSaving = false;
	let error = '';
	let originalData: TranscriptionData | null = null;
	let segments: TranscriptionSegment[] = [];
	let hasChanges = false;

	$: if (isVisible && reviewFileUrl) {
		loadTranscriptionFile();
	}

	$: if (!isVisible) {
		isLoading = true;
		error = '';
		originalData = null;
		segments = [];
		hasChanges = false;
	}

	async function loadTranscriptionFile() {
		if (!reviewFileUrl) return;

		try {
			isLoading = true;
			error = '';

			const response = await fetch(reviewFileUrl);
			if (!response.ok) {
				throw new Error(`Failed to load file: ${response.statusText}`);
			}

			const data: TranscriptionData = await response.json();
			originalData = data;
			segments = data.segments.map(segment => ({ ...segment }));

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load transcription file';
		} finally {
			isLoading = false;
		}
	}

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	function handleSegmentChange(segmentId: number, newTranslation: string) {
		segments = segments.map(segment =>
			segment.id === segmentId
				? { ...segment, translated_text: newTranslation }
				: segment
		);

		hasChanges = segments.some(segment => {
			const original = originalData?.segments.find(s => s.id === segment.id);
			return original && original.translated_text !== segment.translated_text;
		});
	}

	async function handleContinueAsIs() {
		if (!originalData || !config.jobId) {
			error = 'No transcription data available';
			return;
		}

		try {
			isSaving = true;
			await apiClient.submitTranscriptionReview(config.jobId, originalData);

			dubbingActions.markReviewProcessed();

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to upload original file';
			isSaving = false;
		}
	}

	async function handleApproveChanges() {
		if (!originalData || !config.jobId) {
			error = 'No transcription data available';
			return;
		}

		try {
			isSaving = true;

			const updatedData: TranscriptionData = {
				...originalData,
				segments: segments,
				translated_text: segments.map(s => s.translated_text).join(' ')
			};

			await apiClient.submitTranscriptionReview(config.jobId, updatedData);

			dubbingActions.markReviewProcessed();

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save changes';
			isSaving = false;
		}
	}

	function handleClose() {
		handleContinueAsIs();
	}
</script>

{#if isVisible}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm cursor-default"
		on:click={handleClose}
		aria-label="Close modal"
	></button>

	<!-- Modal без оверлея, прямо поверх контента -->
	html<div class="fixed top-8 bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[66vw] bg-black rounded-2xl border border-white/10 overflow-hidden flex flex-col z-[99999]">

		<!-- Header -->
		<div class="p-6 border-b border-white/10 flex-shrink-0 bg-gradient-to-r from-blue-900/30 via-black to-purple-900/30">
			<div class="flex justify-between items-start">
				<div>
					<h2 class="text-2xl font-bold text-white mb-2 drop-shadow-lg">Review Translation</h2>
					<p class="text-white mb-2">
						Your video has been transcribed and translated. Please review the translation and make any necessary corrections.
					</p>
				</div>
				<button
					on:click={handleClose}
					class="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 p-2 rounded-lg"
					aria-label="Close modal"
					disabled={isSaving}
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Content с темным фоном и прокруткой -->
		<div class="flex-1 overflow-y-auto bg-black/80">
			{#if isLoading}
				<div class="p-8 text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
					<p class="text-white/80">Loading transcription...</p>
				</div>
			{:else if error}
				<div class="p-8 text-center">
					<div class="text-red-400 mb-4">
						<svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<p class="text-white mb-4">Error: {error}</p>
					<button
						on:click={loadTranscriptionFile}
						class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg"
					>
						Retry
					</button>
				</div>
			{:else if segments.length > 0}
				<div class="mx-6 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
					<div class="flex-shrink-0">
						<svg class="w-6 h-6 text-amber-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
					<p class="text-yellow-300/90 text-sm text-center flex-1">
						Avoid substantially changing the translation text to prevent noticeable speech speed changes in the dubbed audio track.
					</p>
					<div class="flex-shrink-0">
						<svg class="w-6 h-6 text-amber-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
				</div>

				<div class="p-6 space-y-4">
					{#each segments as segment (segment.id)}
						<div class="bg-white/8 rounded-lg p-4 border border-white/15 hover:border-white/25 transition-all duration-200">
							<div class="flex justify-between items-center mb-3">
								<h4 class="text-lg font-semibold text-white">
									Segment #{segment.id + 1}
								</h4>
								<span class="text-white/70 text-sm bg-white/10 px-3 py-1 rounded-full">
									{formatTime(segment.start)} - {formatTime(segment.end)}
								</span>
							</div>

							<div class="space-y-3">
								<div>
									<label for="original-{segment.id}" class="block text-sm font-medium text-blue-300/80 mb-1">
										Original:
									</label>
									<p id="original-{segment.id}" class="text-white/70 bg-black/50 p-3 rounded border border-white/15">
										{segment.text}
									</p>
								</div>

								<div>
									<label for="translation-{segment.id}" class="block text-sm font-medium text-purple-300/80 mb-1">
										Translation:
									</label>
									<textarea
										id="translation-{segment.id}"
										bind:value={segment.translated_text}
										on:input={(e) => {
											const target = e.target;
											if (target && 'value' in target) {
												handleSegmentChange(segment.id, String(target.value));
											}
										}}
										class="w-full p-3 bg-black/50 border border-white/20 rounded-lg text-white
											   placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400
											   focus:border-blue-400 resize-none transition-all duration-200"
										rows="3"
										placeholder="Enter translation..."
										disabled={isSaving}
									></textarea>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer с освеженным дизайном -->
		{#if !isLoading && !error && segments.length > 0}
			<div class="p-6 border-t border-white/15 flex justify-between items-center flex-shrink-0 bg-gradient-to-r from-purple-900/30 via-black to-blue-900/30">
				<div class="text-sm">
					{#if isSaving}
						<span class="text-blue-400 flex items-center gap-2">
							<div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
							Saving changes...
						</span>
					{:else if hasChanges}
						<span class="text-orange-400 flex items-center gap-2">
							<div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
							You have unsaved changes
						</span>
					{:else}
						<span class="text-white/70">No changes made</span>
					{/if}
				</div>

				<div class="flex gap-3">
					<button
						on:click={handleContinueAsIs}
						class="px-6 py-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/30
							   hover:border-white/50 rounded-lg transition-all duration-200"
						disabled={isSaving}
					>
						Continue as is
					</button>

					{#if hasChanges}
						<button
							on:click={handleApproveChanges}
							class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600
								   hover:to-purple-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
							disabled={isSaving}
						>
							Approve Changes
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}