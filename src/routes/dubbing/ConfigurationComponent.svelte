<script lang="ts">
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';
	import { apiClient } from '$lib/api/client';
	import { SUPPORTED_LANGUAGES, TTS_PROVIDERS, OPENAI_VOICES } from '$lib/types/api_types';
	import { validateDubbingConfig } from '$lib/utils/validation';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const ELEVENLABS_ENABLED = false;

	const availableProviders = TTS_PROVIDERS.map(provider => ({
		...provider,
		disabled: provider.id === 'elevenlabs' && !ELEVENLABS_ENABLED,
		displayName: provider.id === 'elevenlabs' && !ELEVENLABS_ENABLED
			? `${provider.name} (Coming Soon)`
			: provider.name
	}));

	let isCheckingBalance = false;

	$: config = $dubbing;

	$: hasRequiredFields = config.targetLanguage && config.ttsProvider && config.ttsVoice;
	$: hasEnoughBalance = config.user_balance && config.estimated_cost_usd ?
		config.user_balance.balance_usd >= config.estimated_cost_usd : false;
	$: hasAvailableSlot = config.user_balance ?
		config.user_balance.active_dubbing_jobs < config.user_balance.max_concurrent_dubbing_jobs : false;

	$: canProcessJob = hasEnoughBalance && hasAvailableSlot;
	$: canStartProcessing = hasRequiredFields && canProcessJob && !isCheckingBalance;

	function handleTopUp() {
		goto('/billing');
		console.log('Will redirect to balance control page');
	}

	onMount(async () => {
		if (config.estimated_cost_usd) {
			await checkBalance();
		}
	});

	async function checkBalance() {
		if (!config.estimated_cost_usd) return;

		isCheckingBalance = true;
		try {
			await dubbingActions.checkUserBalance(config.estimated_cost_usd);
		} finally {
			isCheckingBalance = false;
		}
	}

	let sourceLanguage = '';
	let targetLanguage = '';
	let ttsProvider = 'openai';
	let ttsVoice = 'onyx';
	let transcriptionKeywords = '';

	let isStarting = false;
	let configError = '';

	function handleSourceLanguageChange() {
		dubbingActions.updateConfig({ sourceLanguage: sourceLanguage || undefined });
	}

	function handleTargetLanguageChange() {
		dubbingActions.updateConfig({ targetLanguage: targetLanguage });
	}

	function handleTtsProviderChange() {
		const selectedProvider = availableProviders.find(p => p.id === ttsProvider);
		if (selectedProvider?.disabled) {
			ttsProvider = 'openai';
			return;
		}

		const provider = ttsProvider as 'openai' | 'elevenlabs';
		dubbingActions.updateConfig({
			ttsProvider: provider,
			ttsVoice: provider === 'openai' ? 'onyx' : ''
		});
	}

	function handleTtsVoiceChange() {
		dubbingActions.updateConfig({ ttsVoice: ttsVoice });
	}

	function handleTranscriptionKeywordsChange() {
		dubbingActions.updateConfig({ transcriptionKeywords: transcriptionKeywords || undefined });
	}

	async function handleStartProcessing() {
		configError = '';

		if (config.estimated_cost_usd) {
			const canStart = await dubbingActions.checkUserBalance(config.estimated_cost_usd);
			if (!canStart) {
				configError = 'Insufficient balance or concurrent job limit exceeded';
				return;
			}
		}

		const validation = validateDubbingConfig({
			targetLanguage: config.targetLanguage,
			ttsProvider: config.ttsProvider,
			ttsVoice: config.ttsVoice
		});

		if (!validation.isValid) {
			configError = validation.error!.message;
			return;
		}

		if (!config.videoS3Url || !config.jobId) {
			configError = 'Missing upload data. Please upload video again.';
			return;
		}

		try {
			isStarting = true;

			const response = await apiClient.startPipeline({
				job_id: config.jobId!,
				video_url: config.videoS3Url,
				target_language: config.targetLanguage!,
				tts_provider: config.ttsProvider!,
				tts_voice: config.ttsVoice!,
				source_language: config.sourceLanguage,
				transcription_keywords: config.transcriptionKeywords,
			});

			dubbingActions.startProcessing(response.job_id, {
				job_id: response.job_id,
				status: response.status,
				stage: "preparation",
				step_description: 'Initializing system components...',
				created_at: response.created_at,
				updated_at: response.created_at
			});

		} catch (error) {
			console.error('Failed to start processing:', error);
			configError = error instanceof Error ? error.message : 'Failed to start processing';
		} finally {
			isStarting = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto">
	<!-- Title -->
	<div class="text-center mb-8">
		<h2 class="text-3xl font-bold text-white mb-4">
			Configure Dubbing Settings
		</h2>
		<p class="text-white/70 text-lg">
			Choose your preferred language and voice settings for AI dubbing
		</p>
	</div>

	<!-- Estimated cost -->
	{#if config.estimated_cost_usd}
		<div class="space-y-4 mb-6">
			<!-- Estimated processing cost -->
			<div class="bg-blue-500/20 backdrop-blur-md rounded-2xl border border-blue-400/30 p-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
						</svg>
						<div>
							<h3 class="text-lg font-semibold text-white">Processing Cost</h3>
							{#if config.video_duration_seconds}
								<p class="text-blue-200/80 text-sm">Source Video Duration: {Math.round(config.video_duration_seconds / 60)} minutes</p>
							{:else}
								<p class="text-blue-200/80 text-sm">Source Video Duration: calculating...</p>
							{/if}
						</div>
					</div>
					<div class="text-right">
						<div class="text-2xl font-bold text-white">${config.estimated_cost_usd.toFixed(2)}</div>
						<p class="text-blue-200/80 text-sm">Will be charged on start</p>
					</div>
				</div>
			</div>

			<!-- Balance info -->
			{#if isCheckingBalance}
				<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
					<div class="flex items-center gap-3">
						<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
						<span class="text-white">Checking your balance...</span>
					</div>
				</div>
			{:else if config.user_balance}
				<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
					<!-- Info about balance and rate limits -->
					<div class="mb-4">
						<h3 class="text-lg font-semibold text-white mb-3">Your Balance and Limit Rates</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
							<div>
								<p class="text-white/60">Available Balance:</p>
								<p class="text-white font-semibold text-lg">
									<span class="text-green-400">${config.user_balance.balance_usd.toFixed(2)}</span>
								</p>
							</div>
							<div>
								<p class="text-white/60">Active Dubbing Jobs:</p>
								<p class="text-white font-semibold text-lg">
									{config.user_balance.active_dubbing_jobs}/{config.user_balance.max_concurrent_dubbing_jobs}
								</p>
							</div>
						</div>
					</div>

					<!-- Status and actions -->
					{#if canProcessJob}
						<!-- All's good -->
						<div class="flex items-center gap-2 text-green-400 bg-green-500/10 rounded-lg p-3">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="font-medium">Ready to process</span>
						</div>
					{:else}
						<!-- There are problems -->
						<div class="space-y-3">
							{#if !hasEnoughBalance}
								<div class="flex items-start gap-3 text-red-400 bg-red-500/10 rounded-lg p-3">
									<svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
									<div class="flex-1">
										<p class="font-medium">Insufficient balance</p>
										<p class="text-red-300 text-sm">
											Need ${(config.estimated_cost_usd - config.user_balance.balance_usd).toFixed(2)} more
										</p>
									</div>
								</div>
							{/if}

							{#if !hasAvailableSlot}
								<div class="flex items-start gap-3 text-yellow-400 bg-yellow-500/10 rounded-lg p-3">
									<svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
									<div class="flex-1">
										<p class="font-medium">Job limit reached</p>
										<p class="text-yellow-300 text-sm">
											Maximum concurrent jobs reached. Please wait for current jobs to complete.
										</p>
									</div>
								</div>
							{/if}

							<!-- Balance top-up button -->
							{#if !hasEnoughBalance}
								<div class="pt-2">
									<button
										on:click={handleTopUp}
										class="w-full sm:w-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
									>
										Top Up Balance
									</button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{:else if config.balance_check_error}
				<div class="bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-400/30 p-6">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
							<div>
								<h3 class="text-lg font-semibold text-red-300">Balance Check Failed</h3>
								<p class="text-red-200/80 text-sm">{config.balance_check_error}</p>
							</div>
						</div>
						<button
							on:click={checkBalance}
							class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
						>
							Retry
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Main settings form -->
	<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">

			<!-- Left column: Language settings -->
			<div class="space-y-6">
				<h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
					<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
					</svg>
					Language Settings
				</h3>

				<!-- Source language (optional) -->
				<div>
					<label for="source-language" class="block text-white/80 font-medium mb-2">
						Source Language (optional)
					</label>
					<select
						id="source-language"
						bind:value={sourceLanguage}
						on:change={handleSourceLanguageChange}
						class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
					>
						<option value="">Auto-detect</option>
						{#each SUPPORTED_LANGUAGES as lang (lang.code)}
							<option value={lang.code} class="bg-slate-800">{lang.name}</option>
						{/each}
					</select>
					<p class="text-white/50 text-sm mt-1">Leave empty for automatic detection</p>
				</div>

				<!-- Target language -->
				<div>
					<label for="target-language" class="block text-white/80 font-medium mb-2">
						Target Language *
					</label>
					<select
						id="target-language"
						bind:value={targetLanguage}
						on:change={handleTargetLanguageChange}
						class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
						required
					>
						<option value="" class="bg-slate-800">Select target language</option>
						{#each SUPPORTED_LANGUAGES as lang (lang.code)}
							<option value={lang.code} class="bg-slate-800">{lang.name}</option>
						{/each}
					</select>
				</div>
				<p class="text-white/50 text-sm mt-1">Choose dubbing language</p>
			</div>

			<!-- Right Column: Voice Settings -->
			<div class="space-y-6">
				<h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
					<svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
					</svg>
					Voice Settings
				</h3>

				<!-- TTS Provider -->
				<div>
					<label for="tts-provider" class="block text-white/80 font-medium mb-2">
						TTS Provider *
					</label>
					<select
						id="tts-provider"
						bind:value={ttsProvider}
						on:change={handleTtsProviderChange}
						class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
					>
						{#each availableProviders as provider (provider.id)}
							<option
								value={provider.id}
								class="bg-slate-800"
								disabled={provider.disabled}
								class:text-gray-500={provider.disabled}
							>
								{provider.displayName}
							</option>
						{/each}
					</select>
					<p class="text-white/50 text-sm mt-1">Choose your preferred voice synthesis provider</p>
				</div>

				<!-- Voice selection -->
				<div>
					<label for="tts-voice" class="block text-white/80 font-medium mb-2">
						Voice *
					</label>
					{#if ttsProvider === 'openai'}
						<select
							id="tts-voice"
							bind:value={ttsVoice}
							on:change={handleTtsVoiceChange}
							class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
						>
							{#each OPENAI_VOICES as voice (voice.id)}
								<option value={voice.id} class="bg-slate-800">{voice.name}</option>
							{/each}
						</select>
					{:else}
						<input
							type="text"
							id="tts-voice"
							placeholder="Enter ElevenLabs voice ID"
							bind:value={ttsVoice}
							on:input={handleTtsVoiceChange}
							class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						/>
						<p class="text-white/50 text-sm mt-1">Enter your custom ElevenLabs voice ID</p>
					{/if}
					<p class="text-white/50 text-sm mt-1">Choose voice for speech synthesis</p>
				</div>
			</div>

		</div>

		<!-- Configuration Error -->
		{#if configError}
			<div class="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg">
				<p class="text-red-300 font-medium">
					{configError}
				</p>
			</div>
		{/if}

		<!-- A field for transcription keywords -->
		<div class="mt-8 pt-8 border-t border-white/20">
			<h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
				<svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
				</svg>
				Advanced Transcription Settings
			</h3>

			<div>
				<label for="transcription-keywords" class="block text-white/80 font-medium mb-2">
					Keywords for Better Voice Recognition (optional)
				</label>
				<textarea
					id="transcription-keywords"
					bind:value={transcriptionKeywords}
					on:input={handleTranscriptionKeywordsChange}
					placeholder="Enter specific words from your video, separated by commas..."
					rows="3"
					class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
				></textarea>
				<p class="text-white/50 text-sm mt-1">
					Add technical terms, names, or brand words to improve transcription accuracy
				</p>
				<div class="mt-2 text-xs text-green-400/80 bg-green-500/10 rounded-lg p-2 border border-green-500/20">
					<strong>💡 Tip:</strong> Include proper nouns, technical jargon, or uncommon words that appear in your video (e.g., "TensorFlow, OpenAI, machine learning")
				</div>
			</div>
		</div>

		<!-- Start button -->
		<div class="mt-8 text-center">
			<button
				on:click={handleStartProcessing}
				disabled={!canStartProcessing || isStarting}
				class="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
			>
				{#if isStarting}
					<div class="flex items-center gap-2">
						<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
						Starting Processing...
					</div>
				{:else}
					<div class="flex flex-col items-center leading-tight">
						<span>Start Video Processing</span>
						<span class="text-xs font-normal text-white/70 mt-1">Payment will be charged upon starting</span>
					</div>
				{/if}
			</button>

			<!-- Updating messaged under the main button -->
			{#if !canStartProcessing && !isCheckingBalance && !isStarting}
				<p class="text-white/50 text-sm mt-2">
					{#if !hasRequiredFields}
						Please fill in all required fields to continue
					{:else if !config.user_balance}
						Checking balance...
					{:else if !hasEnoughBalance}
						Insufficient balance - please top up your account
					{:else if !hasAvailableSlot}
						Maximum concurrent jobs reached - please wait for current jobs to complete
					{:else}
						Please check your balance to continue
					{/if}
				</p>
			{/if}

		</div>

	</div>

</div>