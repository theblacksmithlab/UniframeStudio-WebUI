<script lang="ts">
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';
	import { goto } from '$app/navigation';

	$: config = $dubbing;
	$: resultUrls = config.resultUrls || {};

	$: hasVideo = !!resultUrls.final_video;
	$: hasAudio = !!resultUrls.audio_stereo;
	$: displayVideoUrl = resultUrls.final_video;

	function downloadFile(url: string, filename: string) {
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.target = '_blank';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function startNew() {
		dubbingActions.reset();
	}

	function goHome() {
		dubbingActions.reset();
		goto('/');
	}

	function getFilename(url: string, prefix: string): string {
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			const filename = pathname.split('/').pop() || '';
			const extension = filename.includes('.') ? filename.split('.').pop() : '';
			const baseName = filename.replace(`.${extension}`, '') || 'processed';
			return `${prefix}_${baseName}.${extension}`;
		} catch {
			return `${prefix}_processed.mp4`;
		}
	}

	function getAudioFilename(url: string): string {
		return getFilename(url, 'dubbed_audio').replace('.mp4', '.mp3');
	}
</script>

<div class="max-w-6xl mx-auto">
	<!-- Success title -->
	<div class="text-center mb-8">
		<div class="mb-4">
			<div class="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
				<svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>
		</div>
		<h2 class="text-3xl font-bold text-white mb-4">
			Video Dubbing Completed! 🎉
		</h2>
		<p class="text-white/70 text-lg">
			Your video has been successfully processed with the Uniframe Dubbing System
		</p>
	</div>

	{#if hasVideo}
		<!-- Video player -->
		<div class="mb-8">
			<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
				<!-- Title -->
				<div class="mb-6">
					<h3 class="text-xl font-semibold text-white flex items-center gap-2">
						<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						Your Dubbed Video
					</h3>
				</div>

				<!-- Video player -->
				<div class="max-w-4xl mx-auto">
					<div class="relative bg-black rounded-lg overflow-hidden">
						<!-- svelte-ignore a11y-media-has-caption -->
						<video
							src={displayVideoUrl}
							controls
							class="w-full h-auto cursor-pointer"
							preload="metadata"
						>
							Your browser does not support the video tag.
						</video>
					</div>

					<!-- Success message -->
					<div class="mt-4 text-center">
						<div class="p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
							<p class="text-green-300 text-sm flex items-center justify-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Processing completed successfully! You can download your files below.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Actions and info -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
		<!-- Download section -->
		<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
			<h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
				<svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				Download Your Files
			</h3>

			<div class="space-y-3">
				{#if hasVideo}
					<!-- Video download -->
					<button
						on:click={() => downloadFile(displayVideoUrl, getFilename(displayVideoUrl, 'dubbed_video'))}
						class="w-full p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/50 rounded-lg transition-all duration-200 flex items-center justify-between text-white group cursor-pointer"
					>
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
							</div>
							<div class="text-left">
								<p class="font-semibold">Dubbed Video</p>
								<p class="text-sm text-white/60">Your processed video with Uniframe Smart Dubbing</p>
							</div>
						</div>
						<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M7 13h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
						</svg>
					</button>
				{/if}

				{#if hasAudio}
					<!-- Audio download -->
					<button
						on:click={() => downloadFile(resultUrls.audio_stereo, getAudioFilename(resultUrls.audio_stereo))}
						class="w-full p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/50 rounded-lg transition-all duration-200 flex items-center justify-between text-white group cursor-pointer"
					>
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
								</svg>
							</div>
							<div class="text-left">
								<p class="font-semibold">Audio Track (Stereo)</p>
								<p class="text-sm text-white/60">High-quality stereo audio track</p>
							</div>
						</div>
						<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M7 13h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
						</svg>
					</button>
				{/if}

				{#if !hasVideo && !hasAudio}
					<div class="p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-center">
						<p class="text-red-300">No files available for download</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Process summary -->
		<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
			<h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
				<svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				Process Summary
			</h3>

			<div class="space-y-3 text-sm">
				<div class="flex justify-between items-center py-2 border-b border-white/10">
					<span class="text-white/60">Target Language:</span>
					<span class="text-white font-medium">{config.targetLanguage || 'Unknown'}</span>
				</div>
				<div class="flex justify-between items-center py-2 border-b border-white/10">
					<span class="text-white/60">TTS Provider:</span>
					<span class="text-white font-medium">{config.ttsProvider || 'Unknown'}</span>
				</div>
				<div class="flex justify-between items-center py-2 border-b border-white/10">
					<span class="text-white/60">Voice:</span>
					<span class="text-white font-medium">{config.ttsVoice || 'Unknown'}</span>
				</div>
				{#if config.video_duration_seconds}
					<div class="flex justify-between items-center py-2 border-b border-white/10">
						<span class="text-white/60">Duration:</span>
						<span class="text-white font-medium">{Math.round(config.video_duration_seconds)}s</span>
					</div>
				{/if}
				{#if config.estimated_cost_usd}
					<div class="flex justify-between items-center py-2 border-b border-white/10">
						<span class="text-white/60">Processing Cost:</span>
						<span class="text-white font-medium">${config.estimated_cost_usd.toFixed(2)}</span>
					</div>
				{/if}
				<div class="flex justify-between items-center py-2 border-b border-white/10">
					<span class="text-white/60">Job ID:</span>
					<span class="text-white font-mono text-xs">{config.jobId || 'Unknown'}</span>
				</div>
				<div class="flex justify-between items-center py-2">
					<span class="text-white/60">Status:</span>
					<span class="text-green-400 font-medium">Completed Successfully</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Action buttons -->
	<div class="text-center space-x-4">
		<button
			on:click={startNew}
			class="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
		>
			Process Another Video
		</button>

		<button
			on:click={goHome}
			class="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer"
		>
			Back to Home
		</button>
	</div>
</div>
