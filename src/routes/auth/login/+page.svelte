<script lang="ts">
	import { apiClient } from '$lib/api/client';
	import { goto } from '$app/navigation';

	let email = '';
	let loading = false;
	let message = '';
	let error = '';

	async function handleSubmit() {
		if (!email.trim()) {
			error = 'Please enter your email address';
			return;
		}

		if (!isValidEmail(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		loading = true;
		error = '';
		message = '';

		try {
			const response = await apiClient.sendMagicLink({ email: email.trim() });

			if (response.success) {
				message = response.message;
			} else {
				error = response.message || 'Failed to send magic link';
			}
		} catch (err) {
			console.error('Magic link error:', err);
			error = err instanceof Error ? err.message : 'Failed to send magic link';
		} finally {
			loading = false;
		}
	}

	function isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	}

	function handleBackClick() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Sign in - Uniframe Studio</title>
</svelte:head>

<div class="min-h-screen bg-black bg-cover bg-center bg-no-repeat" style="background-image: url('/main-background.png');">
	<!-- Page Overlay -->
	<div class="absolute inset-0 bg-gradient-to-r from-black/10 via-black/50 to-black/10"></div>

	<div class="relative z-10 min-h-screen flex flex-col">

		<!-- Header -->
		<header class="h-16 sm:h-18 md:h-20 lg:h-24 bg-black/40 backdrop-blur-md border-b border-white/10">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 h-full">
				<div class="flex items-center justify-between h-full">
					<!-- Left side: return home button + page title -->
					<div class="flex items-center gap-4 sm:gap-6">
						<button
							on:click={handleBackClick}
							class="flex items-center gap-2 px-3 py-2 sm:px-4 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm sm:text-base"
						>
							<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
							<span class="hidden sm:inline">Back to Home</span>
							<span class="sm:hidden">Back</span>
						</button>

						<div class="h-6 sm:h-8 w-px bg-white/20"></div>

						<h1 class="text-lg sm:text-xl md:text-2xl font-bold text-white">
							Sign In
						</h1>
					</div>

					<!-- Right side: logo -->
					<div class="flex items-center h-full">
						<img
							src="/logo.png"
							alt="Uniframe Studio Logo"
							class="logo-size object-contain logo-glow"
						/>
					</div>
				</div>
			</div>
		</header>

		<!-- Main content -->
		<main class="flex-1 flex items-center justify-center px-6 py-12">
			<div class="w-full max-w-md">

				<!-- Authorization form -->
				<div class="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">

					<!-- Title -->
					<div class="text-center mb-8">
						<h2 class="text-3xl font-bold text-white mb-2">
							Welcome Back
						</h2>
						<p class="text-white/70">
							Enter your email to continue with video dubbing
						</p>
					</div>

					<!-- Form -->
					<form on:submit|preventDefault={handleSubmit}>
						<div class="mb-6">
							<label for="email" class="block text-sm font-medium text-white/80 mb-2">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								bind:value={email}
								on:keydown={handleKeyDown}
								placeholder="Enter your email"
								class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								disabled={loading}
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading || !email.trim()}
							class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
						>
							{#if loading}
								<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Sending Magic Link...
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								Send Magic Link
							{/if}
						</button>
					</form>

					<!-- Messages -->
					{#if message}
						<div class="mt-6 p-4 bg-green-500/20 border border-green-400/50 rounded-lg">
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<div>
									<p class="text-green-300 font-medium">
										Magic link sent!
									</p>
									<p class="text-green-200 text-sm mt-1">
										{message}
									</p>
								</div>
							</div>
						</div>
					{/if}

					{#if error}
						<div class="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg">
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p class="text-red-300 font-medium">
									{error}
								</p>
							</div>
						</div>
						{/if}

						<!-- Auth link info -->
						<div class="mt-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div>
									<p class="text-blue-300 font-medium text-sm">
										No passwords needed!
									</p>
									<p class="text-blue-200/80 text-sm mt-1">
										We'll send you a secure magic link to sign in. Just click the link in your email to access your account.
									</p>
								</div>
							</div>
						</div>

						</div>

						<!-- Additional info -->
						<div class="text-center mt-6">
							<p class="text-white/60 text-sm">
								New to Uniframe Studio? No problem! <br>
								<span class="text-white/80">Just enter your email and we'll create your account automatically.</span>
							</p>
						</div>

			</div>
		</main>

	</div>
</div>

<style>
    .logo-glow {
        filter: drop-shadow(0 0 10px rgba(64, 224, 255, 0.3)) drop-shadow(0 0 15px rgba(147, 51, 234, 0.3));
        opacity: 0.8;
    }

    .logo-size {
        height: calc(100% / 2.5);
    }
</style>
