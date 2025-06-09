<script lang="ts">
	import { goto } from '$app/navigation';

	let leftHovered = false;
	let rightHovered = false;

	function handleDubClick() {
		goto('/dubbing');
	}

	function handleSyncClick() {
		alert('SYNC IT! - Coming Soon!');
	}
</script>

<svelte:head>
	<title>Uniframe Studio - AI Video Processing</title>
</svelte:head>

<!-- Основной контейнер с фоном -->
<div class="min-h-screen flex flex-col bg-slate-900 bg-cover bg-center bg-no-repeat" style="background-image: url('/main-background.png');">
	<!-- Полупрозрачный оверлей для читаемости текста -->
	<div class="absolute inset-0 bg-black/20"></div>

	<!-- Контент поверх фона -->
	<div class="relative z-10 min-h-screen flex flex-col">
		<!-- Header (10%) -->
		<header class="h-[10vh] flex items-center justify-between bg-black/40 backdrop-blur-md px-6">
			<div class="flex items-center gap-4">
				<!-- Логотип -->
				<img
					src="/logo.png"
					alt="Uniframe Studio Logo"
					class="h-24 w-24"
				/>
				<!-- Название с кастомным шрифтом и увеличенными отступами между буквами -->
				<h1 class="text-2xl text-white" style="font-family: 'Limelight', sans-serif;">
					UNIFRAME STUDIO
				</h1>
			</div>

			<!-- Кнопка меню справа -->
			<button class="flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
				<img
					src="/menu-icon.png"
					alt="Menu"
					class="h-12 w-12"
				/>
			</button>
		</header>

		<!-- Разделитель Header -->
		<div class="w-full h-px relative">
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
		</div>

		<!-- Main Interactive Area (80%) -->
		<main class="h-[80vh] flex relative overflow-hidden">
			<!-- Left Half - DUB IT! -->
			<div
				class="w-1/2 relative cursor-pointer transition-all duration-500 ease-out group"
				on:mouseenter={() => leftHovered = true}
				on:mouseleave={() => leftHovered = false}
				on:click={handleDubClick}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && handleDubClick()}
			>
				<!-- Полупрозрачный градиент фон -->
				<div
					class="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 opacity-0 transition-opacity duration-500"
					class:opacity-30={leftHovered}
				></div>
				<!-- Content -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div
						class="text-center transform transition-all duration-700 ease-out"
						class:scale-110={leftHovered}
						class:translate-y-0={leftHovered}
						class:translate-y-4={!leftHovered}
						class:opacity-100={leftHovered}
						class:opacity-0={!leftHovered}
					>
						<h2 class="text-8xl font-black text-white mb-4 tracking-wider drop-shadow-2xl">
							DUB
						</h2>
						<h3 class="text-6xl font-black text-white tracking-wider drop-shadow-2xl">
							IT!
						</h3>
						<p class="text-xl text-white/90 mt-6 font-medium drop-shadow-lg">
							AI-powered video dubbing
						</p>
					</div>
				</div>

				<!-- Hover glow effect -->
				<div
					class="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-transparent transition-opacity duration-500"
					class:opacity-100={leftHovered}
					class:opacity-0={!leftHovered}
				></div>
			</div>

			<!-- Center Divider -->
			<div class="w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

			<!-- Right Half - SYNC IT! -->
			<div
				class="w-1/2 relative cursor-pointer transition-all duration-500 ease-out group"
				on:mouseenter={() => rightHovered = true}
				on:mouseleave={() => rightHovered = false}
				on:click={handleSyncClick}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && handleSyncClick()}
			>
				<!-- Полупрозрачный градиент фон -->
				<div
					class="absolute inset-0 bg-gradient-to-bl from-emerald-600 to-teal-600 opacity-0 transition-opacity duration-500"
					class:opacity-30={rightHovered}
				></div>

				<!-- Content -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div
						class="text-center transform transition-all duration-700 ease-out"
						class:scale-110={rightHovered}
						class:translate-y-0={rightHovered}
						class:translate-y-4={!rightHovered}
						class:opacity-100={rightHovered}
						class:opacity-0={!rightHovered}
					>
						<h2 class="text-8xl font-black text-white mb-4 tracking-wider drop-shadow-2xl">
							SYNC
						</h2>
						<h3 class="text-6xl font-black text-white tracking-wider drop-shadow-2xl">
							IT!
						</h3>
						<p class="text-xl text-white/90 mt-6 font-medium drop-shadow-lg">
							AI lip-sync technology
						</p>
						<div class="mt-4 px-4 py-2 bg-amber-500/30 backdrop-blur-sm rounded-full border border-amber-400/50">
							<span class="text-amber-200 text-sm font-semibold">COMING SOON</span>
						</div>
					</div>
				</div>

				<!-- Hover glow effect -->
				<div
					class="absolute inset-0 bg-gradient-to-l from-emerald-500/30 to-transparent transition-opacity duration-500"
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
</div>

<style>
    .group:hover {
        box-shadow: inset 0 0 100px rgba(255, 255, 255, 0.1);
    }
</style>