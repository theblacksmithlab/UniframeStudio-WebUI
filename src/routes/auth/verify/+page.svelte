<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/api/client';
	import { auth } from '$lib/stores/auth';

	let loading = true;
	let verifying = false;
	let error = '';
	let success = false;

	onMount(async () => {
		const token = $page.url.searchParams.get('token');

		if (!token) {
			error = 'Invalid verification link. Token is missing.';
			loading = false;
			return;
		}

		await verifyToken(token);
	});

	async function verifyToken(token: string) {
		verifying = true;
		error = '';

		try {
			const response = await apiClient.verifyToken({ token });

			if (response.success && response.session_token) {
				localStorage.setItem('session_token', response.session_token);

				try {
					const sessionData = await apiClient.checkSession();

					auth.setSession(response.session_token, sessionData.user_email);

					success = true;

					setTimeout(() => {
						goto('/');
					}, 2000);
				} catch (sessionError) {
					console.error('Failed to get session data:', sessionError);
					auth.setSession(response.session_token, '');
					success = true;

					setTimeout(() => {
						goto('/');
					}, 2000);
				}

			} else {
				error = response.message || 'Verification failed';
			}
		} catch (err) {
			console.error('Token verification error:', err);
			error = err instanceof Error ? err.message : 'Verification failed';
		} finally {
			loading = false;
			verifying = false;
		}
	}

	function handleBackToLogin() {
		goto('/auth/login');
	}

	function handleGoHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Verify Email - Uniframe Studio</title>
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
							on:click={handleGoHome}
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
							Email Verification
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

				<div class="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center">

					{#if loading || verifying}
						<!-- Loading -->
						<div class="mb-6">
							<div class="w-16 h-16 mx-auto mb-4 relative">
								<svg class="animate-spin w-16 h-16 text-blue-400" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							</div>
							<h2 class="text-2xl font-bold text-white mb-2">
								Verifying Email
							</h2>
							<p class="text-white/70">
								Please wait while we verify your email address...
							</p>
						</div>

					{:else if success}
						<!-- Success -->
						<div class="mb-6">
							<div class="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
								<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<h2 class="text-2xl font-bold text-white mb-2">
								Email Verified!
							</h2>
							<p class="text-white/70 mb-4">
								Your email has been successfully verified. You're now signed in.
							</p>
							<p class="text-blue-300 text-sm">
								Redirecting to Home Page in 2 seconds...
							</p>
						</div>

						<!-- Redirecting progress -->
						<div class="w-full bg-white/10 rounded-full h-2 mb-6">
							<div class="bg-blue-500 h-2 rounded-full animate-pulse" style="width: 100%; animation-duration: 2s;"></div>
						</div>

						<button
							on:click={() => goto('/')}
							class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
						>
							Continue to Home Page
						</button>

					{:else if error}
						<!-- Error -->
						<div class="mb-6">
							<div class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
								<svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h2 class="text-2xl font-bold text-white mb-2">
								Verification Failed
							</h2>
							<p class="text-red-300 mb-6">
								{error}
							</p>
						</div>

						<!-- Error actions -->
						<div class="space-y-3">
							<button
								on:click={handleBackToLogin}
								class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
							>
								Request New Magic Link
							</button>

							<button
								on:click={handleGoHome}
								class="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-all duration-200"
							>
								Back to Home
							</button>
						</div>

						<!-- Help -->
						<div class="mt-6 p-4 bg-amber-500/10 border border-amber-400/30 rounded-lg">
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div class="text-left">
									<p class="text-amber-300 font-medium text-sm">
										Common issues:
									</p>
									<ul class="text-amber-200/80 text-sm mt-1 space-y-1">
										<li>• The link may have expired (valid for 1 hour)</li>
										<li>• The link can only be used once</li>
										<li>• Make sure you're opening the full link from your email</li>
									</ul>
								</div>
							</div>
						</div>
					{/if}

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