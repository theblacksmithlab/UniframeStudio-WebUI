<script lang="ts">
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';
	import { apiClient } from '$lib/api/client';
	import { SUPPORTED_LANGUAGES, TTS_PROVIDERS, OPENAI_VOICES } from '$lib/types/api_types';
	import { validateDubbingConfig } from '$lib/utils/validation';

	const ELEVENLABS_ENABLED = false;

	const availableProviders = TTS_PROVIDERS.map(provider => ({
		...provider,
		disabled: provider.id === 'elevenlabs' && !ELEVENLABS_ENABLED,
		displayName: provider.id === 'elevenlabs' && !ELEVENLABS_ENABLED
			? `${provider.name} (Coming Soon)`
			: provider.name
	}));

	$: config = $dubbing;
	$: canStartProcessing = config.targetLanguage && config.ttsProvider && config.ttsVoice;

	let sourceLanguage = '';
	let targetLanguage = '';
	let ttsProvider = 'openai';
	let ttsVoice = 'alloy';

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
			ttsVoice: provider === 'openai' ? 'alloy' : ''
		});
	}

	function handleTtsVoiceChange() {
		dubbingActions.updateConfig({ ttsVoice: ttsVoice });
	}

	async function handleStartProcessing() {
		configError = '';

		const validation = validateDubbingConfig({
			targetLanguage: config.targetLanguage,
			ttsProvider: config.ttsProvider,
			ttsVoice: config.ttsVoice
		});

		if (!validation.isValid) {
			configError = validation.error!.message;
			return;
		}

		if (!config.videoS3Url || !config.pipelineId || !config.jobId) {
			configError = 'Missing upload data. Please upload video again.';
			return;
		}

		try {
			isStarting = true;

			const response = await apiClient.startPipeline({
				pipeline_id: config.pipelineId!,
				job_id: config.jobId!,
				video_url: config.videoS3Url,
				target_language: config.targetLanguage!,
				tts_provider: config.ttsProvider!,
				tts_voice: config.ttsVoice!,
				source_language: config.sourceLanguage,
			});

			dubbingActions.startProcessing(response.pipeline_id, {
				pipeline_id: response.pipeline_id,
				job_id: response.job_id,
				status: response.status,
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
	<!-- Заголовок -->
	<div class="text-center mb-8">
		<h2 class="text-3xl font-bold text-white mb-4">
			Configure Dubbing Settings
		</h2>
		<p class="text-white/70 text-lg">
			Choose your preferred language and voice settings for AI dubbing
		</p>
	</div>

	<!-- Основная форма настроек -->
	<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">

			<!-- Левая колонка: Языковые настройки -->
			<div class="space-y-6">
				<h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
					<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
					</svg>
					Language Settings
				</h3>

				<!-- Исходный язык (опционально) -->
				<div>
					<label for="source-language" class="block text-white/80 font-medium mb-2">
						Source Language (optional)
					</label>
					<select
						id="source-language"
						bind:value={sourceLanguage}
						on:change={handleSourceLanguageChange}
						class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="">Auto-detect</option>
						{#each SUPPORTED_LANGUAGES as lang (lang.code)}
							<option value={lang.code} class="bg-slate-800">{lang.name}</option>
						{/each}
					</select>
					<p class="text-white/50 text-sm mt-1">Leave empty for automatic detection</p>
				</div>

				<!-- Целевой язык (обязательно) -->
				<div>
					<label for="target-language" class="block text-white/80 font-medium mb-2">
						Target Language *
					</label>
					<select
						id="target-language"
						bind:value={targetLanguage}
						on:change={handleTargetLanguageChange}
						class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

			<!-- Правая колонка: Настройки голоса -->
			<div class="space-y-6">
				<h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
					<svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
					</svg>
					Voice Settings
				</h3>

				<!-- TTS Провайдер -->
				<div>
					<label for="tts-provider" class="block text-white/80 font-medium mb-2">
						TTS Provider *
					</label>
					<select
						id="tts-provider"
						bind:value={ttsProvider}
						on:change={handleTtsProviderChange}
						class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

				<!-- Выбор голоса -->
				<div>
					<label for="tts-voice" class="block text-white/80 font-medium mb-2">
						Voice *
					</label>
					{#if ttsProvider === 'openai'}
						<select
							id="tts-voice"
							bind:value={ttsVoice}
							on:change={handleTtsVoiceChange}
							class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
				</div>
				<p class="text-white/50 text-sm mt-1">Choose voice for speech synthesis</p>
			</div>

		</div>

		<!-- Ошибка конфигурации -->
		{#if configError}
			<div class="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg">
				<p class="text-red-300 font-medium">
					{configError}
				</p>
			</div>
		{/if}

		<!-- Кнопка запуска -->
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
					Start Video Processing
				{/if}
			</button>

			{#if !canStartProcessing}
				<p class="text-white/50 text-sm mt-2">
					Please fill in all required fields to continue
				</p>
			{/if}
		</div>

	</div>

</div>