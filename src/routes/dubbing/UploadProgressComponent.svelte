<script lang="ts">
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';

	$: progress = $dubbing.uploadProgress || 0;
	$: fileName = $dubbing.originalFileName || 'video file';

	function handleCancel() {
		dubbingActions.reset();
	}

	$: uploadStatus = progress === 0
		? 'Preparing upload...'
		: progress < 100
			? 'Uploading to cloud storage...'
			: 'Upload complete! Processing...';
</script>
<div class="absolute inset-0 bg-black/20"></div>
<div class="text-center max-w-2xl mx-auto">
	<!-- Заголовок -->
	<div class="mb-8">
		<h2 class="text-3xl font-bold text-white mb-4">
			Uploading Video
		</h2>
		<p class="text-white/70 text-lg">
			Please wait while we upload your video to our secure cloud storage
		</p>
	</div>

	<!-- Карточка с прогрессом -->
	<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">

		<!-- Иконка файла -->
		<div class="mb-6">
			<div class="w-20 h-20 mx-auto bg-blue-500/20 rounded-2xl flex items-center justify-center">
				<svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
				</svg>
			</div>
		</div>

		<!-- Информация о файле -->
		<div class="mb-6">
			<h3 class="text-xl font-semibold text-white mb-2">
				{fileName}
			</h3>
			<p class="text-white/60">
				Video file • Uploading...
			</p>
		</div>

		<!-- Прогресс бар -->
		<div class="mb-6">
			<div class="flex justify-between items-center mb-2">
				<span class="text-white/80 font-medium">{uploadStatus}</span>
				<span class="text-white font-bold">{progress}%</span>
			</div>

			<!-- Основной прогресс бар -->
			<div class="w-full bg-white/10 rounded-full h-3 overflow-hidden">
				<div
					class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
					style="width: {progress}%"
				>
					<!-- Анимированный блик -->
					<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
				</div>
			</div>
		</div>

		<!-- Детали процесса -->
		<div class="mb-8 space-y-2">
			<div class="flex items-center justify-between text-sm">
				<span class="text-white/60">Status:</span>
				<span class="text-white">{uploadStatus}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-white/60">Progress:</span>
				<span class="text-white">{progress}% complete</span>
			</div>
			{#if progress === 100}
				<div class="flex items-center justify-between text-sm">
					<span class="text-white/60">Next:</span>
					<span class="text-green-400">Configure dubbing settings</span>
				</div>
			{/if}
		</div>

		<!-- Кнопка отмены (только если загрузка не завершена) -->
		{#if progress < 100}
			<button
				on:click={handleCancel}
				class="px-6 py-2 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200"
			>
				Cancel Upload
			</button>
		{/if}

	</div>

	<!-- Дополнительная информация -->
	<div class="mt-8 p-4 bg-white/5 rounded-lg">
		<div class="flex items-center justify-center gap-2 text-white/60 text-sm">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
			</svg>
			<span>Your video is being securely uploaded and encrypted</span>
		</div>
	</div>

	<!-- Индикатор загрузки (спиннер) для состояния 0% -->
	{#if progress === 0}
		<div class="mt-6 flex justify-center">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
		</div>
	{/if}

</div>