<script lang="ts">
	import { goto } from '$app/navigation';
	import DropdownMenu from '$lib/utils/DropdownMenu.svelte';
	import { onMount } from 'svelte';

	let leftHovered = false;
	let rightHovered = false;
	let showComingSoon = false;
	let isLoaded = false;

	let leftTypedText = '';
	let rightTypedText = '';
	let leftTypingInterval: NodeJS.Timeout | null = null;
	let rightTypingInterval: NodeJS.Timeout | null = null;

	const leftFullText = 'AI-powered video dubbing system';
	const rightFullText = 'Cutting-edge lip-sync technology';

	const dubLetters = ['D', 'U', 'B'];
	const itLetters = ['I', 'T', '!'];
	const syncLetters = ['S', 'Y', 'N', 'C'];

	onMount(() => {
		setTimeout(() => {
			isLoaded = true;
		}, 500);
	});

	function handleDubClick() {
		goto('/dubbing');
	}

	function handleSyncClick() {
		showComingSoon = true;
		setTimeout(() => {
			showComingSoon = false;
		}, 5000);
	}

	function startTyping(isLeft: boolean) {
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

	function stopTyping(isLeft: boolean) {
		if (isLeft) {
			if (leftTypingInterval) {
				clearInterval(leftTypingInterval);
				leftTypingInterval = null;
			}
			leftTypedText = '';
		} else {
			if (rightTypingInterval) {
				clearInterval(rightTypingInterval);
				rightTypingInterval = null;
			}
			rightTypedText = '';
		}
	}
</script>

<svelte:head>
	<title>Uniframe Studio - Smart Dubbing</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-900 bg-cover bg-center bg-no-repeat" style="background-image: url('/main-background.png');">
	<!-- Полупрозрачный оверлей для читаемости текста -->
	<div class="absolute inset-0 bg-black/20"></div>

	<!-- Контент поверх фона -->
	<div class="relative z-10 min-h-screen flex flex-col">
		<!-- Header (10%) -->
		<header class="h-[10vh] flex items-center justify-between bg-black/40 backdrop-blur-md px-12">
			<div class="flex items-center gap-4">
				<!-- Логотип -->
				<img
					src="/logo.png"
					alt="Uniframe Studio Logo"
					class="h-12 w-12"
					style="filter: drop-shadow(0 0 10px rgba(64, 224, 255, 0.3)) drop-shadow(0 0 15px rgba(147, 51, 234, 0.3));"
				/>
				<!-- Название с кастомным шрифтом и увеличенными отступами между буквами -->
<!--				<h1 class="text-2xl text-white" style="font-family: 'Limelight', sans-serif;">-->
<!--					UNIFRAME STUDIO-->
<!--				</h1>-->
			</div>

			<!-- Пустое место для кнопки (чтобы layout не сломался) -->
			<div class="w-16 h-16"></div>
		</header>

		<!-- Разделитель Header -->
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
        startTyping(true);
    }}
				on:mouseleave={() => {
        leftHovered = false;
        stopTyping(true);
    }}
				on:click={handleDubClick}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && handleDubClick()}
			>
				<!-- Content -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div
						class="text-center transform transition-all duration-700 ease-out neural-text"
						class:loaded={isLoaded}
						class:magnetic={leftHovered}
						style="transform: scale({leftHovered ? 1.1 : 1});"
					>
						<div class="relative">
							<h2 class="text-8xl font-black text-white mb-4 tracking-wider drop-shadow-2xl">
								{#each dubLetters as letter, i (letter + i)}
									<span
										class="neural-letter blue-theme"
										style="animation-delay: {[0.8, 0.2, 1.1][i]}s"
									>
										{letter}
									</span>
								{/each}
							</h2>
							<h3 class="text-6xl font-black text-white tracking-wider drop-shadow-2xl">
								{#each itLetters as letter, i (letter + i + 'it')}
									<span
										class="neural-letter blue-theme"
										style="animation-delay: {[1.5, 0.4, 1.8][i]}s"
									>
										{letter}
									</span>
								{/each}
							</h3>
						</div>

						<div class="h-8 mt-6 flex items-center justify-center">
							{#if leftTypedText}
								<p class="text-xl text-white/90 font-medium drop-shadow-lg typing-text">
									{leftTypedText}<span class="typing-cursor">|</span>
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
					startTyping(false);
				}}
				on:mouseleave={() => {
					rightHovered = false;
					stopTyping(false);
				}}
				on:click={handleSyncClick}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && handleSyncClick()}
			>
				<!-- Content -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div
						class="text-center transform transition-all duration-700 ease-out neural-text"
						class:loaded={isLoaded}
						class:magnetic={rightHovered}
						style="transform: scale({rightHovered ? 1.1 : 1});"
					>
						<div class="relative">
							<h2 class="text-8xl font-black text-white mb-4 tracking-wider drop-shadow-2xl">
								{#each syncLetters as letter, i (letter + i + 'sync')}
									<span
										class="neural-letter pink-theme"
										style="animation-delay: {[1.2, 0.3, 1.6, 0.7][i]}s"
									>
										{letter}
									</span>
								{/each}
							</h2>
							<h3 class="text-6xl font-black text-white tracking-wider drop-shadow-2xl">
								{#each itLetters as letter, i (letter + i + 'sync-it')}
									<span
										class="neural-letter pink-theme"
										style="animation-delay: {[0.9, 1.7, 0.5][i]}s"
									>
										{letter}
									</span>
								{/each}
							</h3>
						</div>

						<div class="h-8 mt-6 flex items-center justify-center">
							{#if rightTypedText}
								<p class="text-xl text-white/90 font-medium drop-shadow-lg typing-text">
									{rightTypedText}<span class="typing-cursor">|</span>
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

		<!-- Разделитель Footer -->
		<div class="w-full h-px relative">
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
		</div>

		<!-- Footer (10%) -->
		<footer class="h-[10vh] flex items-center justify-center bg-black/80 backdrop-blur-md">
			<p class="text-gray-300 text-sm">
				© 2025 Uniframe Studio - AI Video Processing Platform
			</p>
		</footer>
	</div>

	<div class="absolute right-6 z-50" style="top: 2rem; right: 1.5rem;">
		<DropdownMenu />
	</div>

	<!-- Красивое уведомление Coming Soon -->
	{#if showComingSoon}
		<div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
			<div class="coming-soon-notification">
				<div class="flex items-center gap-3">
					<div class="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
					<span class="text-white text-xl font-medium">Lip-sync is coming soon!</span>
					<div class="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
				</div>
				<p class="text-white/70 text-sm mt-2 text-center">This feature is currently in development</p>
			</div>
		</div>
	{/if}
</div>

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

    .neural-text.magnetic {
        filter: brightness(1.1) saturate(1.2);
        transform-origin: center;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
            transform: translateY(10px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
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

    /* Coming Soon Notification */
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

    /* Typing Effect */
    .typing-text {
        opacity: 1;
        animation: fadeInUp 0.3s ease-out forwards;
    }

    .typing-cursor {
        animation: blink 1s infinite;
    }

    @keyframes blink {
        0%, 50% {
            opacity: 1;
        }
        51%, 100% {
            opacity: 0;
        }
    }
</style>