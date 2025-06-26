<script lang="ts">
	import { goto } from '$app/navigation';
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';
	import TranscriptionReviewModal from '$lib/components/TranscriptionReviewModal.svelte';

	function handleBackClick() {
		dubbingActions.reset();
		goto('/');
	}

	$: currentStage = $dubbing.stage;
	$: isProcessing = currentStage === 'uploading' || currentStage === 'processing';
</script>

<svelte:head>
	<title>Video Dubbing - Uniframe Studio</title>
</svelte:head>

<div class="min-h-screen bg-black bg-cover bg-center bg-no-repeat" style="background-image: url('/main-background.png');">
	<!-- Page overlay -->
	<div class="absolute inset-0 bg-gradient-to-r from-black/10 via-black/80 to-black/10"></div>

	<div class="relative z-10 min-h-screen flex flex-col">

		<!-- Header -->
		<header class="bg-black/40 backdrop-blur-md border-b border-white/10">
			<div class="max-w-7xl mx-auto px-6 py-4">
				<div class="flex items-center justify-between">
					<!-- Left side: return home button + page title -->
					<div class="flex items-center gap-6">
						<button
							on:click={handleBackClick}
							class="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer"
							disabled={isProcessing}
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
							Back to Home
						</button>

						<div class="h-8 w-px bg-white/20"></div>

						<h1 class="text-2xl font-bold text-white">
							Video Dubbing
						</h1>
					</div>

					<!-- right side: processing stage indicator -->
					<div class="flex items-center gap-3">
						<div class="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span class="text-white/90 text-sm font-medium">
                {#if currentStage === 'idle'}
                  Ready to Upload
                {:else if currentStage === 'uploading'}
                  Uploading...
                {:else if currentStage === 'configuring'}
                  Configure Settings
                {:else if currentStage === 'processing'}
                  Processing Video
                {:else if currentStage === 'completed'}
                  Completed
                {:else if currentStage === 'error'}
                  Error Occurred
                {/if}
              </span>
						</div>
					</div>
				</div>
			</div>
		</header>

		<!-- Main content -->
		<main class="flex-1 max-w-7xl mx-auto w-full px-6 py-8">

			<!-- Components container -->
			<div class="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 min-h-[600px] p-8">

				<!-- Components conditional rendering -->
				{#if currentStage === 'idle'}
					<!-- UploadComponent -->
					{#await import('./UploadComponent.svelte') then { default: UploadComponent }}
						<UploadComponent />
					{/await}

				{:else if currentStage === 'uploading'}
					<!-- UploadProgressComponent -->
					{#await import('./UploadProgressComponent.svelte') then { default: UploadProgressComponent }}
						<UploadProgressComponent />
					{/await}

				{:else if currentStage === 'configuring'}
					<!-- ConfigurationComponent -->
					{#await import('./ConfigurationComponent.svelte') then { default: ConfigurationComponent }}
						<ConfigurationComponent />
					{/await}

				{:else if currentStage === 'processing'}
					<!-- ProcessingStatusComponent -->
					{#await import('./ProcessingStatusComponent.svelte') then { default: ProcessingStatusComponent }}
						<ProcessingStatusComponent />
					{/await}

				{:else if currentStage === 'completed'}
					<!-- ResultsComponent -->
					{#await import('./ResultsComponent.svelte') then { default: ResultsComponent }}
						<ResultsComponent />
					{/await}

				{:else if currentStage === 'error'}
					<!-- Error -->
					<div class="text-center text-red-400">
						<h2 class="text-xl font-semibold mb-4">Error</h2>
						<p class="mb-6">{$dubbing.error || 'Unknown error occurred'}</p>
						<button
							on:click={() => dubbingActions.reset()}
							class="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-lg transition-colors duration-200"
						>
							Start Over
						</button>
					</div>
				{/if}

			</div>

		</main>

	</div>
</div>

<!-- Review Modal -->
<TranscriptionReviewModal />