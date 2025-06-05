<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';
	import { apiClient } from '$lib/api/client';

	$: config = $dubbing;
	$: pipelineStatus = config.processingStatus;
	$: progress = pipelineStatus?.progress_percentage || 0;
	$: currentStepDescription = pipelineStatus?.step_description || 'Initializing system components...';

	$: pythonSteps = pipelineStatus?.processing_steps || [];

	$: isRustStage = currentStepDescription.includes('retrieving') ||
		currentStepDescription.includes('generating') ||
		currentStepDescription.includes('pipeline_completed');

	$: currentPythonStepIndex = pythonSteps.findIndex(step => step === currentStepDescription);

	$: estimatedStepIndex = isRustStage ? pythonSteps.length :
		currentPythonStepIndex >= 0 ? currentPythonStepIndex :
			Math.floor((progress / 100) * pythonSteps.length);

	$: displaySteps = [...pythonSteps, "Finalizing results..."];

	$: currentDisplayIndex = isRustStage ? displaySteps.length - 1 : estimatedStepIndex;

	let elapsedTime = 0;
	let timeInterval: ReturnType<typeof setInterval>;
	let startTime = Date.now();

	onMount(() => {
		if (pipelineStatus?.created_at) {
			startTime = new Date(pipelineStatus.created_at).getTime();
		}

		timeInterval = setInterval(() => {
			elapsedTime = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);

		if (config.pipelineId) {
			startPolling();
		}
	});

	onDestroy(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
		}
	});

	function startPolling() {
		if (!config.pipelineId) return;

		apiClient.pollPipelineStatus(
			config.pipelineId,
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
		dubbingActions.setError('Processing cancelled by user');
	}
</script>

<div class="max-w-4xl mx-auto">
	<!-- Заголовок -->
	<div class="text-center mb-8">
		<h2 class="text-3xl font-bold text-white mb-4">
			Processing Your Video
		</h2>
		<p class="text-white/70 text-lg">
			AI is working on your video dubbing. This may take several minutes.
		</p>
	</div>

	<!-- Основная карточка статуса -->
	<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8">

		<!-- Общий прогресс -->
		<div class="mb-8">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-xl font-semibold text-white">Overall Progress</h3>
				<div class="text-right">
					<div class="text-2xl font-bold text-white">{progress}%</div>
					<div class="text-white/60 text-sm">Complete</div>
				</div>
			</div>

			<!-- Главный прогресс-бар -->
			<div class="w-full bg-white/10 rounded-full h-4 overflow-hidden mb-4">
				<div
					class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
					style="width: {progress}%"
				>
					<!-- Анимированный блик -->
					<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
				</div>
			</div>

			<!-- Текущий этап -->
			<div class="text-center">
				<p class="text-lg font-medium text-white mb-1">{currentStepDescription}</p>
				<p class="text-white/60 text-sm">
					Step {Math.max(1, currentDisplayIndex + 1)} of {displaySteps.length} • Elapsed: {formatTime(elapsedTime)}
				</p>
			</div>
		</div>

		<!-- Список этапов -->
		<div class="space-y-3">
			<h4 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
				<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				Processing Steps
			</h4>

			<div class="grid gap-2 max-h-80 overflow-y-auto">
				{#each displaySteps as step, index (step)}
					<div
						class="flex items-center gap-3 p-3 rounded-lg transition-all duration-300"
						class:bg-blue-500-20={index === currentDisplayIndex}
					class:bg-green-500-20={index < currentDisplayIndex}
					class:bg-white-5={index > currentDisplayIndex}
					>
					<!-- Иконка статуса -->
					<div class="flex-shrink-0">
						{#if index < currentDisplayIndex}
							<!-- Завершено -->
							<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
						{:else if index === currentDisplayIndex}
							<!-- Текущий -->
							<div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
								<div class="w-2 h-2 bg-white rounded-full"></div>
							</div>
						{:else}
							<!-- Ожидание -->
							<div class="w-6 h-6 bg-white/20 rounded-full border border-white/30"></div>
						{/if}
					</div>

					<!-- Текст этапа -->
					<div class="flex-1 min-w-0">
						<p
							class="font-medium transition-colors duration-300"
							class:text-white={index <= currentDisplayIndex}
							class:text-white-60={index > currentDisplayIndex}
						>
						{step}
						</p>
						{#if index === displaySteps.length - 1 && isRustStage}
							<p class="text-sm text-white/70">
								{currentStepDescription}
							</p>
						{/if}
					</div>

					<!-- Номер этапа -->
					<div class="text-white/40 text-sm font-mono">
						{index + 1}/{displaySteps.length}
					</div>
					</div>
				{/each}
			</div>
		</div>

	</div>

	<!-- Информация и действия -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

		<!-- Информация о процессе -->
		<div class="bg-white/5 rounded-xl p-6">
			<h4 class="text-lg font-semibold text-white mb-4">Process Information</h4>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span class="text-white/60">Pipeline ID:</span>
					<span class="text-white font-mono">{config.pipelineId}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-white/60">Job ID:</span>
					<span class="text-white font-mono">{config.jobId}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-white/60">Started:</span>
					<span class="text-white">{pipelineStatus?.created_at ? new Date(pipelineStatus.created_at).toLocaleTimeString() : 'Unknown'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-white/60">Status:</span>
					<span class="text-green-400">{pipelineStatus?.status || 'processing'}</span>
				</div>
			</div>
		</div>

		<!-- Действия -->
		<div class="bg-white/5 rounded-xl p-6">
			<h4 class="text-lg font-semibold text-white mb-4">Actions</h4>
			<div class="space-y-4">
				<p class="text-white/70 text-sm">
					Processing cannot be stopped once started. Please wait for completion.
				</p>
				<button
					on:click={handleCancel}
					class="w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 text-sm"
				>
					Cancel & Return Home
				</button>
			</div>
		</div>

	</div>

</div>