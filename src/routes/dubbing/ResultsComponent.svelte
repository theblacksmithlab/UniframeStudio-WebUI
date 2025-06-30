<script lang="ts">
	import { dubbing, dubbingActions } from '$lib/stores/dubbing';
	import { goto } from '$app/navigation';

	$: config = $dubbing;
	$: resultUrls = config.resultUrls || {};

	$: hasRegularVideo = !!resultUrls.video;
	$: hasPremiumVideo = !!resultUrls.video_premium;
	$: isPremiumUser = !hasRegularVideo && hasPremiumVideo;

	$: displayVideoUrl = hasRegularVideo ? resultUrls.video : resultUrls.video_premium;
	$: hasVideo = !!displayVideoUrl;

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

	function handleUpgrade() {
		alert('Upgrade to Premium - Coming Soon!');
	}

	function getFilename(url: string, prefix: string): string {
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			const filename = pathname.split('/').pop() || 'video.mp4';
			return `${prefix}_${filename}`;
		} catch {
			return `${prefix}_video.mp4`;
		}
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
		<!-- Video-player -->
		<div class="mb-8">
			<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">

				<!-- Title -->
				<div class="mb-6">
					<h3 class="text-xl font-semibold text-white flex items-center gap-2">
						<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						Your Dubbed Video {isPremiumUser ? '(Premium Version)' : '(Free Version)'}
					</h3>
				</div>

				<!-- Video-player -->
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

					<!-- Info about video -->
					<div class="mt-4 text-center">
						{#if !isPremiumUser}
							<div class="p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg">
								<p class="text-amber-300 text-sm flex items-center justify-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									The free version contains branding elements. Purchase the clean version without ads and watermark via the link below.
								</p>
							</div>
						{:else}
							<div class="p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
								<p class="text-green-300 text-sm flex items-center justify-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									You can download the result in the corresponding section below
								</p>
							</div>
						{/if}
					</div>
				</div>

			</div>
		</div>
	{/if}

	<!-- Actions and info -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

		<!-- Downloading -->
		<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
			<h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
				<svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				Download Your Video
			</h3>

			<div class="space-y-3">
				{#if hasVideo}
					<button
						on:click={() => downloadFile(displayVideoUrl, getFilename(displayVideoUrl, isPremiumUser ? 'dubbed_premium' : 'dubbed'))}
						class="w-full p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/50 rounded-lg transition-all duration-200 flex items-center justify-between text-white group cursor-pointer"
					>
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
							</div>
							<div class="text-left">
								<p class="font-semibold">Dubbed Video {isPremiumUser ? '(Premium)' : '(with ads)'}</p>
								<p class="text-sm text-white/60">Your processed video with Uniframe Smart Dubbing</p>
							</div>
						</div>
						<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M7 13h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
						</svg>
					</button>
				{/if}

				<!-- Upgrade button for common users -->
				{#if !isPremiumUser && hasRegularVideo}
					<button
						on:click={handleUpgrade}
						class="w-full p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-400/50 rounded-lg transition-all duration-200 flex items-center justify-between text-white group cursor-pointer"
					>
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
								<svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
								</svg>
							</div>
							<div class="text-left">
								<p class="font-semibold">Get Premium Version</p>
								<p class="text-sm text-white/60">Remove ads and get pristine quality</p>
							</div>
						</div>
						<div class="text-right">
							<span class="text-xs bg-yellow-400/20 px-2 py-1 rounded text-yellow-300">Coming Soon</span>
						</div>
					</button>
				{/if}

				{#if !hasVideo}
					<div class="p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-center">
						<p class="text-red-300">No video file available for download</p>
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
					<span class="text-white/60">Account Type:</span>
					<span class="text-white font-medium flex items-center gap-2">
            {isPremiumUser ? 'Premium' : 'Free'}
						{#if isPremiumUser}
              <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            {/if}
          </span>
				</div>
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

	<!-- Actions -->
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