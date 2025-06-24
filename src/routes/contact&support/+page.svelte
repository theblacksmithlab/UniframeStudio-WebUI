<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let isLoaded = false;

	function handleHomeClick() {
		goto('/');
	}

	onMount(() => {
		setTimeout(() => {
			isLoaded = true;
		}, 300);
	});
</script>

<svelte:head>
	<title>Contact & Support - Uniframe Studio</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-black bg-cover bg-center bg-no-repeat" style="background-image: url('/main-background.png');">
	<!-- Page overlay -->
	<div class="absolute inset-0 bg-gradient-to-r from-black/10 via-black/80 to-black/10"></div>

	<div class="relative z-10 min-h-screen flex flex-col">
		<!-- Header (10%) -->
		<header class="h-[10vh] flex items-center justify-center bg-black/40 backdrop-blur-md px-[3.3vh] relative">
			<!-- Return Home Button - Left -->
			<button
				on:click={handleHomeClick}
				class="absolute left-[3.3vh] flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Home
			</button>

			<!-- Centered Logo -->
			<div class="flex flex-col items-center">
				<img
					src="/logo.png"
					alt="Uniframe Studio Logo"
					class="h-[2.5vh] object-contain mb-3"
				/>
				<h1 class="text-white text-lg font-limelight tracking-wider">
					UNIFRAME STUDIO
				</h1>
			</div>
		</header>

		<!-- Divider -->
		<div class="w-full h-px relative">
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
		</div>

		<!-- Main Content (80%) -->
		<main class="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12" class:loaded={isLoaded}>

				<!-- About Block -->
				<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 fade-in-block">
					<h2 class="text-3xl font-bold text-white mb-6 flex items-center gap-3 font-limelight">
						<svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						About
					</h2>

					<div class="space-y-6 text-white/80">
						<div>
							<h3 class="text-xl font-semibold text-white mb-3">Uniframe Studio</h3>
							<p class="leading-relaxed">
								An intelligent dubbing system designed to automate the process of video dubbing and lip-syncing with high temporal precision.
							</p>
						</div>

						<div class="border-t border-white/10 pt-6">
							<p class="text-lg font-medium text-white mb-4">
								Brought to you by <span class="text-blue-400">Blacksmith Lab Co. Ltd.</span>
							</p>
						</div>

						<div class="border-t border-white/10 pt-6">
							<h4 class="text-lg font-semibold text-white mb-4">Find us on:</h4>
							<div class="flex gap-4">
								<a
									href="https://www.blacksmith-lab.com"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 text-white/80 hover:text-white"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
									</svg>
									Website
								</a>
								<a
									href="https://github.com/theblacksmithlab"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 text-white/80 hover:text-white"
								>
									<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
									</svg>
									GitHub
								</a>
								<a
									href="https://www.youtube.com/@blacksmith-lab"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 text-white/80 hover:text-white"
								>
									<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
										<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
									</svg>
									YouTube
								</a>
							</div>
						</div>
					</div>
				</div>

				<!-- Contact & Support Block -->
				<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 fade-in-block">
					<h2 class="text-3xl font-bold text-white mb-6 flex items-center gap-3 font-limelight">
						<svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
						Contact & Support
					</h2>

					<div class="space-y-8 text-white/80">
						<!-- Email -->
						<div class="flex items-start gap-4">
							<div class="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
								<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-white mb-2">Email</h3>
								<a
									href="mailto:0xthecableguy@proton.me"
									class="text-blue-300 hover:text-blue-200 transition-colors text-lg"
								>
									0xthecableguy@proton.me
								</a>
							</div>
						</div>

						<!-- Telegram Channel -->
						<div class="flex items-start gap-4">
							<div class="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
								<svg class="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-white mb-2">Telegram Channel</h3>
								<a
									href="https://t.me/the_viper_room"
									target="_blank"
									rel="noopener noreferrer"
									class="text-cyan-300 hover:text-cyan-200 transition-colors text-lg"
								>
									@the_viper_room
								</a>
								<p class="text-sm text-white/60 mt-1">Latest updates and announcements</p>
							</div>
						</div>

						<!-- Telegram Support -->
						<div class="flex items-start gap-4">
							<div class="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
								<svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
									<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-white mb-2">Telegram Support</h3>
								<a
									href="https://t.me/the_viper_room_chat"
									target="_blank"
									rel="noopener noreferrer"
									class="text-green-300 hover:text-green-200 transition-colors text-lg"
								>
									@the_viper_room_chat
								</a>
								<p class="text-sm text-white/60 mt-1">Technical support and assistance</p>
							</div>
						</div>

						<!-- Response Time -->
						<div class="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 mt-6">
							<div class="flex items-center gap-2 text-yellow-400 mb-2">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span class="font-semibold">E-mail Response Time</span>
							</div>
							<p class="text-white/80 text-sm">
								We typically respond within 24 hours. For urgent issues, please use Telegram support for faster assistance.
							</p>
						</div>
					</div>
				</div>

			</div>
		</main>

		<div class="w-full h-px relative">
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
		</div>

		<!-- Footer (10%) -->
		<footer class="h-[10vh] flex items-center justify-center bg-black/80 backdrop-blur-md px-[3.3vh]">
			<p class="text-gray-500 text-xs sm:text-xs md:text-sm opacity-60 font-light">
				© 2025 Uniframe Studio - AI Video Processing Platform
			</p>
		</footer>
	</div>
</div>

<style>
    /*@font-face {*/
    /*    font-family: 'Limelight';*/
    /*    src: url('/fonts/Limelight-Regular.ttf') format('truetype');*/
    /*    font-weight: normal;*/
    /*    font-style: normal;*/
    /*}*/

    /*.font-limelight {*/
    /*    font-family: 'Limelight', sans-serif;*/
    /*}*/

    .fade-in-block {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .loaded .fade-in-block {
        opacity: 1;
        transform: translateY(0);
    }

    .loaded .fade-in-block:nth-child(1) {
        animation-delay: 0.2s;
    }

    .loaded .fade-in-block:nth-child(2) {
        animation-delay: 0.4s;
    }
</style>