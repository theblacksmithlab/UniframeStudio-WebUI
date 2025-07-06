<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';
	import { apiClient } from '$lib/api/client';
	import { goto } from '$app/navigation';

	$: config = $dubbing;
	$: pipelineStatus = config.processingStatus;
	$: progress = pipelineStatus?.progress_percentage || 0;
	$: currentStepDescription = pipelineStatus?.step_description || 'Initializing system components...';

	$: currentStage = pipelineStatus?.stage || 'preparation';

	$: pythonSteps = pipelineStatus?.processing_steps || [];
	$: currentPythonStepIndex = pipelineStatus?.current_step_index ?? -1;

	$: isReviewRequired = pipelineStatus?.step === 11;
	$: reviewFileUrl = pipelineStatus?.review_required_url;

	let reviewProcessedAtStep: number | null = null;

	$: if (isReviewRequired && reviewFileUrl && !config.showReviewModal) {
		if (reviewProcessedAtStep !== pipelineStatus?.step) {
			dubbingActions.showReview(reviewFileUrl);
		}
	}

	$: if (!config.showReviewModal && config.reviewProcessedUrl) {
		reviewProcessedAtStep = pipelineStatus?.step || null;
	}

	$: if (pipelineStatus?.step && pipelineStatus.step !== reviewProcessedAtStep) {
		reviewProcessedAtStep = null;
	}

	let elapsedTime = 0;
	let timeInterval: ReturnType<typeof setInterval>;
	let startTime = Date.now();

	let cancelPolling: (() => void) | null = null;

	onMount(() => {
		if (pipelineStatus?.created_at) {
			startTime = new Date(pipelineStatus.created_at).getTime();
		}

		timeInterval = setInterval(() => {
			elapsedTime = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);

		if (config.jobId) {
			startPolling();
		}
	});

	onDestroy(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
		}
		if (cancelPolling) {
			cancelPolling();
		}
	});

	async function startPolling() {
		if (!config.jobId) return;

		cancelPolling = await apiClient.pollPipelineStatus(
			config.jobId,
			(newStatus) => {
				dubbingActions.updateStatus(newStatus);
			},
			(finalStatus) => {
				if (finalStatus.result_urls) {
					dubbingActions.complete(finalStatus.result_urls);
				} else {
					dubbingActions.setError('Processing completed but no results received');
				}
			},
			(error) => {
				dubbingActions.setError(error);
			}
		);
	}

	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	}

	function handleCancel() {
		if (cancelPolling) {
			cancelPolling();
		}

		dubbingActions.reset();

		goto('/');
	}
</script>

<div class="max-w-4xl mx-auto">
	<!-- Title -->
	<div class="text-center mb-8">
		<h2 class="text-3xl font-bold text-white mb-4">
			Processing Your Video
		</h2>
		<p class="text-white/70 text-lg">
			The system is working on your video dubbing.<br>Processing time depends on the length of the original video.
		</p>
	</div>

	<!-- Main status card -->
	<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8">

		<!-- Overall progress -->
		<div class="mb-8">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-xl font-semibold text-white">Overall Progress</h3>
				<div class="text-right">
					<div class="text-2xl font-bold text-white">{progress}%</div>
					<div class="text-white/60 text-sm">Complete</div>
				</div>
			</div>

			<!-- Main progress-bar -->
			<div class="w-full bg-white/10 rounded-full h-4 overflow-hidden mb-4">
				<div
					class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
					style="width: {progress}%"
				>
					<!-- Animated blink -->
					<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
				</div>
			</div>

			<!-- Current stage -->
			<div class="text-center">
				<p class="text-lg font-medium text-white mb-1">{currentStepDescription}</p>
				<p class="text-white/60 text-sm">
					Elapsed: {formatTime(elapsedTime)}
				</p>
			</div>
		</div>

		<!-- Processing visualization -->
		<div class="space-y-6">
			<!-- Stage 1: Preparation (Rust) -->
			<div class="space-y-3">
				<h4 class="text-lg font-semibold text-white mb-2 flex items-center gap-2">
					<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					System Preparation
				</h4>

				<div class={`p-4 rounded-lg border transition-all duration-300 ${
					currentStage === 'preparation'
						? 'bg-blue-500/20 border-blue-400/50'
						: currentStage === 'processing' || currentStage === 'finalization'
							? 'bg-green-500/10 border-green-400/30'
							: 'bg-white/5 border-white/20'
				}`}>
					{#if currentStage === 'preparation'}
						<div class="flex items-center gap-3">
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
							<span class="text-white">{currentStepDescription}</span>
						</div>
					{:else}
						<div class="flex items-center gap-3">
							<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-white/70">Environment prepared successfully</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Stage 2: Processing (Python) -->
			<div class="space-y-3">
				<h4 class="text-lg font-semibold text-white mb-2 flex items-center gap-2">
					<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Video Processing
				</h4>

				{#if pythonSteps.length > 0}
					<div class="space-y-2">
						{#each pythonSteps as step, index (step)}
							<div class={`p-3 rounded-lg border transition-all duration-300 ${
								currentStage === 'processing' && currentPythonStepIndex === index
									? 'bg-purple-500/20 border-purple-400/50'
									: currentStage === 'processing' && index < currentPythonStepIndex || currentStage === 'finalization'
										? 'bg-green-500/10 border-green-400/30'
										: 'bg-white/5 border-white/20'
							}`}>
								<div class="flex items-center gap-3">
									{#if currentStage === 'processing' && currentPythonStepIndex === index}
										<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
									{:else if (currentStage === 'processing' && index < currentPythonStepIndex) || currentStage === 'finalization'}
										<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
									{:else}
										<div class="w-4 h-4 rounded-full bg-white/20"></div>
									{/if}
									<span class={`${
										currentStage === 'processing' && currentPythonStepIndex === index
											? 'text-white font-medium'
											: 'text-white/70'
									}`}>{step}</span>
								</div>
							</div>
						{/each}
					</div>
				{:else if currentStage === 'preparation'}
					<div class="p-4 bg-white/5 rounded-lg border border-white/20 text-center text-white/50">
						Processing steps will appear here once video analysis begins
					</div>
				{/if}
			</div>

			<!-- Stage 3: Finalization (Rust) -->
			<div class="space-y-3">
				<h4 class="text-lg font-semibold text-white mb-2 flex items-center gap-2">
					<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
					Finalizing Results
				</h4>

				<div class={`p-4 rounded-lg border transition-all duration-300 ${
					currentStage === 'finalization'
						? 'bg-emerald-500/20 border-emerald-400/50'
						: 'bg-white/5 border-white/20'
				}`}>
					{#if currentStage === 'finalization'}
						<div class="flex items-center gap-3">
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
							<span class="text-white">{currentStepDescription}</span>
						</div>
					{:else}
						<span class="text-white/50">Waiting for processing to complete</span>
					{/if}
				</div>
			</div>
		</div>

	</div>

	<!-- Info and actions -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

		<!-- Processing info -->
		<div class="bg-white/5 rounded-xl p-6">
			<h4 class="text-lg font-semibold text-white mb-4">Processing Information</h4>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span class="text-white/60">Job ID:</span>
					<span class="text-white font-mono">{config.jobId}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-white/60">Started:</span>
					<span class="text-white">{pipelineStatus?.created_at ? new Date(pipelineStatus.created_at).toLocaleTimeString() : 'Unknown'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-white/60">Stage:</span>
					<span class="text-white capitalize">{currentStage}</span>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="bg-white/5 rounded-xl p-6">
			<h4 class="text-lg font-semibold text-white mb-4">Actions</h4>
			<div class="space-y-4">
				<p class="text-white/70 text-sm">
					Processing cannot be stopped once started. You can leave this page, and the process will continue in the background.
				</p>
				<button
					on:click={handleCancel}
					class="w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 text-sm cursor-pointer"
				>
					Return Home
				</button>
			</div>
		</div>

	</div>
</div>