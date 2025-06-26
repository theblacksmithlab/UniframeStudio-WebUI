<script lang="ts">
	import { goto } from '$app/navigation';
	import DropdownMenu from '$lib/utils/DropdownMenu.svelte';
	import SubmitIdeaModal from '$lib/components/SubmitIdeaModal.svelte';
	import { onMount } from 'svelte';

	let leftHovered = false;
	let rightHovered = false;
	let showComingSoon = false;
	let isLoaded = false;
	let showIdeaModal = false;

	let leftTypedText = '';
	let rightTypedText = '';
	let leftTypingInterval: NodeJS.Timeout | null = null;
	let rightTypingInterval: NodeJS.Timeout | null = null;

	const leftFullText = 'AI-powered video dubbing system';
	const rightFullText = 'Cutting-edge lip-sync technology';

	const dubLetters = ['//', 'D', 'U', 'B'];
	// const itLetters = ['I', 'T', '!'];
	const syncLetters = ['//', 'S', 'Y', 'N', 'C'];

	let logoFlickering = false;

	onMount(() => {
		setTimeout(() => {
			isLoaded = true;
			setTimeout(() => {
				startAutoTyping();
			}, 2000);
		}, 500);
	});

	onMount(() => {
		setTimeout(() => {
			startLogoFlickering();
		}, 1000);
	});

	function openIdeaModal() { showIdeaModal = true; }

	function startLogoFlickering() {
		logoFlickering = true;

		setTimeout(() => {
			logoFlickering = false;
		}, 3000);
	}

	function handleDubClick() {
		goto('/dubbing');
	}

	function handleSyncClick() {
		showComingSoon = true;
		setTimeout(() => {
			showComingSoon = false;
		}, 5000);
	}

	function startAutoTyping() {
		startTypingText(true);

		setTimeout(() => {
			startTypingText(false);
		}, 500);
	}

	function startTypingText(isLeft: boolean) {
		const text = isLeft ? leftFullText : rightFullText;
		const speed = 50;

		if (isLeft) {
			if (leftTypingInterval) clearInterval(leftTypingInterval);
			leftTypedText = '';
			let currentIndex = 0;

			leftTypingInterval = setInterval(() => {
				if (currentIndex < text.length) {
					leftTypedText += text[currentIndex];
					currentIndex++;
				} else {
					if (leftTypingInterval) clearInterval(leftTypingInterval);
					leftTypingInterval = null;
				}
			}, speed);
		} else {
			if (rightTypingInterval) clearInterval(rightTypingInterval);
			rightTypedText = '';
			let currentIndex = 0;

			rightTypingInterval = setInterval(() => {
				if (currentIndex < text.length) {
					rightTypedText += text[currentIndex];
					currentIndex++;
				} else {
					if (rightTypingInterval) clearInterval(rightTypingInterval);
					rightTypingInterval = null;
				}
			}, speed);
		}
	}
</script>

<svelte:head>
	<title>Uniframe Studio</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-black bg-cover bg-center bg-no-repeat" style="background-image: url('/main-background.png');">
	<!-- Page overlay -->
	<div class="absolute inset-0 bg-black/20"></div>

	<div class="relative z-10 min-h-screen flex flex-col">
		<!-- Header (10%) -->
		<header class="h-[10vh] flex items-center justify-between bg-black/40 backdrop-blur-md px-[3.3vh] relative z-50">
			<!-- Left side (logo) -->
			<div class="h-full flex items-center">
				<img
					src="/logo.png"
					alt="Uniframe Studio Logo"
					class="h-1/3 object-contain logo-image"
					class:flickering={logoFlickering}
				/>
			</div>

			<!-- Right side (DropdownMenu) -->
			<div class="h-[5vh] w-[5vh] flex items-center justify-center">
				<DropdownMenu />
			</div>
		</header>

		<!-- Divider -->
		<div class="w-full h-px relative">
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
		</div>

		<!-- Main Interactive Area (80%) -->
		<main class="h-[80vh] flex relative overflow-hidden">
			<!-- Left Half - DUB IT! -->
			<div
				class="w-1/2 relative cursor-pointer transition-all duration-300 ease-out"
				on:mouseenter={() => {
					leftHovered = true;
				}}
				on:mouseleave={() => {
					leftHovered = false;
				}}
				on:click={handleDubClick}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && handleDubClick()}
			>
				<!-- Content -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div
						class="text-center neural-text"
						class:loaded={isLoaded}
					>
						<div class="relative transform transition-all duration-700 ease-out"
								 class:magnetic={leftHovered}
								 style="transform: scale({leftHovered ? 1.1 : 1});">
							<h2 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-2 sm:mb-4 tracking-wider drop-shadow-2xl font-limelight">
								{#each dubLetters as letter, i (letter + i)}
									<span
										class="neural-letter blue-theme"
										style="animation-delay: {Math.random() * 2 + 0.5}s"
									>
										{letter}
									</span>
								{/each}
							</h2>
<!--							<h3 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-wider drop-shadow-2xl font-limelight">-->
<!--								{#each itLetters as letter, i (letter + i + 'it')}-->
<!--									<span-->
<!--										class="neural-letter blue-theme"-->
<!--										style="animation-delay: {Math.random() * 2 + 0.5}s"-->
<!--									>-->
<!--										{letter}-->
<!--									</span>-->
<!--								{/each}-->
<!--							</h3>-->
						</div>

						<div class="h-8 mt-6 flex items-center justify-center">
							{#if leftTypedText}
								<p class="text-xs sm:text-sm md:text-base lg:text-xl text-white/90 font-medium drop-shadow-lg typing-text px-4 sm:px-2 md:px-0">
									{leftTypedText}
								</p>
							{/if}
						</div>

					</div>
				</div>

				<div
					class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent transition-opacity duration-500 pointer-events-none"
					class:opacity-100={leftHovered}
					class:opacity-0={!leftHovered}
				></div>
			</div>

			<!-- Right Half - SYNC IT! -->
			<div
				class="w-1/2 relative cursor-pointer transition-all duration-300 ease-out"
				on:mouseenter={() => {
					rightHovered = true;
				}}
				on:mouseleave={() => {
					rightHovered = false;
				}}
				on:click={handleSyncClick}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && handleSyncClick()}
			>
				<!-- Content -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div
						class="text-center neural-text"
						class:loaded={isLoaded}
					>
						<div class="relative transform transition-all duration-700 ease-out"
								 class:magnetic={rightHovered}
								 style="transform: scale({rightHovered ? 1.1 : 1});">
							<h2 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-2 sm:mb-4 tracking-wider drop-shadow-2xl font-limelight">
								{#each syncLetters as letter, i (letter + i + 'sync')}
									<span
										class="neural-letter pink-theme"
										style="animation-delay: {Math.random() * 2 + 0.5}s"
									>
										{letter}
									</span>
								{/each}
							</h2>
<!--							<h3 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-wider drop-shadow-2xl font-limelight">-->
<!--								{#each itLetters as letter, i (letter + i + 'sync-it')}-->
<!--									<span-->
<!--										class="neural-letter pink-theme"-->
<!--										style="animation-delay: {Math.random() * 2 + 0.5}s"-->
<!--									>-->
<!--										{letter}-->
<!--									</span>-->
<!--								{/each}-->
<!--							</h3>-->
						</div>

						<div class="h-8 mt-6 flex items-center justify-center">
							{#if rightTypedText}
								<p class="text-xs sm:text-sm md:text-base lg:text-xl text-white/90 font-medium drop-shadow-lg typing-text px-4 sm:px-2 md:px-0">
									{rightTypedText}
								</p>
							{/if}
						</div>

					</div>
				</div>

				<div
					class="absolute inset-0 bg-gradient-to-l from-pink-500/10 to-transparent transition-opacity duration-500 pointer-events-none"
					class:opacity-100={rightHovered}
					class:opacity-0={!rightHovered}
				></div>
			</div>
		</main>

		<div class="w-full h-px relative">
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
		</div>

		<!-- Footer (10%) -->
		<footer class="h-[10vh] flex items-center justify-center bg-black/80 backdrop-blur-md px-[3.3vh] relative">
			<!-- Centered text -->
			<p class="text-gray-500 text-xs sm:text-xs md:text-sm opacity-60 font-light">
				© 2025 Uniframe Studio - AI Video Processing Platform
			</p>

			<!-- Контейнер с кнопками справа -->
			<div class="absolute right-[3.3vh] flex items-center gap-[1.2rem]">
				<!-- Submit Idea Button -->
				<button
					on:click={openIdeaModal}
					class="flex items-center gap-2 px-4 py-2
				text-rose-400 hover:text-rose-300
				hover:bg-rose-500/10
				rounded-lg transition-all duration-200
				text-xs sm:text-sm font-medium cursor-pointer
				border border-rose-400/20 hover:border-rose-500/40
				drop-shadow-[0_0_6px_rgba(236,72,153,0.4)] hover:drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M12 2a7 7 0 00-4 12v2a1 1 0 001 1h6a1 1 0 001-1v-2a7 7 0 00-4-12zM10 18h4m-4 2h4" />
					</svg>
					Submit Idea
				</button>

				<!-- Contact & Support Button -->
				<button
					on:click={() => goto('/contact&support')}
					class="flex items-center gap-2 px-4 py-2
				text-blue-400 hover:text-blue-300
				hover:bg-blue-500/10
				rounded-lg transition-all duration-200
				text-xs sm:text-sm font-medium cursor-pointer
				border border-blue-400/20 hover:border-blue-500/40
				drop-shadow-[0_0_6px_rgba(96,165,250,0.5)] hover:drop-shadow-[0_0_12px_rgba(96,165,250,0.7)]"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
					Contact & Support
				</button>
			</div>
		</footer>
	</div>

	{#if showComingSoon}
		<div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
			<div class="coming-soon-notification text-center">
				<div class="flex items-center gap-3 justify-center">
					<div class="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>

					<span class="text-white text-xl font-medium leading-snug text-center">
				LIP-SYNC<br>is coming soon!
			</span>

					<div class="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
				</div>

				<p class="text-white/70 text-sm mt-2 text-center">
					This feature is currently in development
				</p>
			</div>
		</div>
	{/if}
</div>

<SubmitIdeaModal
	isOpen={showIdeaModal}
	onClose={() => showIdeaModal = false}
/>

<div id="modal-root"></div>

<style>
    .neural-text {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .neural-text.loaded {
        opacity: 1;
        transform: translateY(0);
    }

    .neural-letter {
        display: inline-block;
        opacity: 0;
        animation: fadeInLetter 0.8s ease-out forwards;
        position: relative;
    }

    @keyframes fadeInLetter {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    .neural-letter.blue-theme {
        text-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
    }

    .neural-letter.pink-theme {
        text-shadow: 0 0 20px rgba(236, 72, 153, 0.6);
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .coming-soon-notification {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px 32px;
        animation: slideInFromTop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }

    @keyframes slideInFromTop {
        0% {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .typing-text {
        opacity: 1;
        animation: fadeInUp 0.3s ease-out forwards;
    }

    .logo-image {
        opacity: 0.8;
        transition: filter 0.1s ease;
    }

    .logo-image.flickering {
        animation: flickerLogo 3s ease-out forwards;
    }

    .logo-image:not(.flickering) {
        filter: drop-shadow(0 0 10px rgba(64, 224, 255, 0.3)) drop-shadow(0 0 15px rgba(147, 51, 234, 0.3));
    }

    @keyframes flickerLogo {
        0% {
            filter: none;
        }
        5% {
            filter: drop-shadow(0 0 5px rgba(64, 224, 255, 0.1));
        }
        10% {
            filter: none;
        }
        15% {
            filter: drop-shadow(0 0 8px rgba(64, 224, 255, 0.2)) drop-shadow(0 0 10px rgba(147, 51, 234, 0.2));
        }
        20% {
            filter: none;
        }
        25% {
            filter: drop-shadow(0 0 3px rgba(64, 224, 255, 0.1));
        }
        30% {
            filter: none;
        }
        40% {
            filter: drop-shadow(0 0 12px rgba(64, 224, 255, 0.4)) drop-shadow(0 0 18px rgba(147, 51, 234, 0.4));
        }
        45% {
            filter: drop-shadow(0 0 6px rgba(64, 224, 255, 0.2));
        }
        50% {
            filter: none;
        }
        60% {
            filter: drop-shadow(0 0 8px rgba(64, 224, 255, 0.3));
        }
        70% {
            filter: drop-shadow(0 0 15px rgba(64, 224, 255, 0.5)) drop-shadow(0 0 20px rgba(147, 51, 234, 0.5));
        }
        75% {
            filter: drop-shadow(0 0 8px rgba(64, 224, 255, 0.2));
        }
        80% {
            filter: drop-shadow(0 0 12px rgba(64, 224, 255, 0.4)) drop-shadow(0 0 15px rgba(147, 51, 234, 0.4));
        }
        90% {
            filter: drop-shadow(0 0 10px rgba(64, 224, 255, 0.3)) drop-shadow(0 0 15px rgba(147, 51, 234, 0.3));
        }
        100% {
            filter: drop-shadow(0 0 10px rgba(64, 224, 255, 0.3)) drop-shadow(0 0 15px rgba(147, 51, 234, 0.3));
        }
    }
</style>