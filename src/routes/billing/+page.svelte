<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import type { UserBalance, UserJob } from '$lib/types/api_types';

	let userBalance: UserBalance | null = null;
	let userJobs: UserJob[] = [];
	let isLoading = false;
	let error = '';

	let topUpAmount = '';
	let isTopUpProcessing = false;
	let topUpError = '';
	let topUpSuccess = false;

	function handleHomeClick() {
		goto('/');
	}

	async function loadBalanceData() {
		isLoading = true;
		error = '';

		try {
			const [balance, jobs] = await Promise.all([
				apiClient.getUserBalance(),
				apiClient.getUserJobs()
			]);

			userBalance = balance;
			userJobs = jobs.filter(job => job.status === 'processing' || job.status === 'pending');
		} catch (err) {
			console.error('Failed to load balance data:', err);
			error = err instanceof Error ? err.message : 'Failed to load balance data';
		} finally {
			isLoading = false;
		}
	}

	async function handleTopUp() {
		const amount = parseFloat(topUpAmount);

		if (!amount || amount <= 0) {
			topUpError = 'Please enter a valid amount';
			return;
		}

		if (amount < 1) {
			topUpError = 'Minimum top-up amount is $1.00';
			return;
		}

		if (amount > 1000) {
			topUpError = 'Maximum top-up amount is $1,000.00';
			return;
		}

		isTopUpProcessing = true;
		topUpError = '';
		topUpSuccess = false;

		try {
			const response = await apiClient.topUpBalance({ amount_usd: amount });

			window.location.href = response.payment_url;

			// // Simulate API call for now
			// await new Promise(resolve => setTimeout(resolve, 2000));
			//
			// topUpSuccess = true;
			// topUpAmount = '';
			//
			// // Reload balance data
			// await loadBalanceData();
			//
			// // Hide success message after 3 seconds
			// setTimeout(() => {
			// 	topUpSuccess = false;
			// }, 3000);

		} catch (err) {
			console.error('Top-up failed:', err);
			topUpError = err instanceof Error ? err.message : 'Top-up failed';
		} finally {
			isTopUpProcessing = false;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	onMount(() => {
		loadBalanceData();
	});
</script>

<svelte:head>
	<title>Billing & Balance - Uniframe Studio</title>
</svelte:head>

<div class="min-h-screen bg-black bg-cover bg-center bg-no-repeat" style="background-image: url('/main-background.png');">
	<!-- Page overlay -->
	<div class="absolute inset-0 bg-gradient-to-r from-black/10 via-black/80 to-black/10"></div>

	<div class="relative z-10 min-h-screen flex flex-col">

		<!-- Header -->
		<header class="bg-black/40 backdrop-blur-md border-b border-white/10">
			<div class="max-w-7xl mx-auto px-6 py-4">
				<div class="flex items-center justify-between">
					<!-- Left side: return home button + page title -->
					<div class="flex items-center gap-6">
						<button
							on:click={handleHomeClick}
							class="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
							Back to Home
						</button>

						<div class="h-8 w-px bg-white/20"></div>

						<h1 class="text-2xl font-bold text-white">
							Billing & Balance
						</h1>
					</div>

					<!-- Right side: reload button -->
					<div class="flex items-center gap-3">
						<button
							on:click={loadBalanceData}
							disabled={isLoading}
							class="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50"
						>
							<svg class="w-4 h-4 {isLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Refresh
						</button>
					</div>
				</div>
			</div>
		</header>

		<!-- Main content -->
		<main class="flex-1 max-w-7xl mx-auto w-full px-6 py-8">

			{#if error}
				<div class="bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-400/30 p-6 mb-8">
					<div class="flex items-center gap-3">
						<svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
						<div>
							<h3 class="text-lg font-semibold text-red-300">Error Loading Data</h3>
							<p class="text-red-200/80 text-sm">{error}</p>
						</div>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

				<!-- Balance Overview -->
				<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
					<h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
						<svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
						</svg>
						Account Balance
					</h2>

					{#if isLoading}
						<div class="flex items-center justify-center py-12">
							<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
						</div>
					{:else if userBalance}
						<div class="space-y-6">
							<!-- Current Balance -->
							<div class="bg-green-500/20 rounded-xl p-6 border border-green-400/30">
								<p class="text-green-200/80 text-sm font-medium mb-1">Available Balance</p>
								<p class="text-4xl font-bold text-green-400">
									${userBalance.balance_usd.toFixed(2)}
								</p>
							</div>

							<!-- Usage Limits -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div class="bg-white/5 rounded-lg p-4 border border-white/10">
									<p class="text-white/60 text-sm mb-1">Active Jobs</p>
									<p class="text-xl font-semibold text-white">
										{userBalance.active_dubbing_jobs}
									</p>
								</div>
								<div class="bg-white/5 rounded-lg p-4 border border-white/10">
									<p class="text-white/60 text-sm mb-1">Max Concurrent Jobs</p>
									<p class="text-xl font-semibold text-white">
										{userBalance.max_concurrent_dubbing_jobs}
									</p>
								</div>
							</div>

							<!-- Status Indicator -->
							{#if userBalance.active_dubbing_jobs < userBalance.max_concurrent_dubbing_jobs}
								<div class="flex items-center gap-2 text-green-400 bg-green-500/10 rounded-lg p-3">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									<span class="font-medium">Ready to process new jobs</span>
								</div>
							{:else}
								<div class="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 rounded-lg p-3">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01" />
									</svg>
									<span class="font-medium">Maximum concurrent jobs reached</span>
								</div>
							{/if}
						</div>
					{:else}
						<div class="text-center py-12">
							<p class="text-white/50">No balance data available</p>
						</div>
					{/if}
				</div>

				<!-- Top-up Section -->
				<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
					<h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
						<svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						Add Funds (via Cryptocurrency)
					</h2>

					<div class="space-y-6">
						<!-- Amount Input -->
						<div>
							<label for="topup-amount" class="block text-white/80 font-medium mb-2">
								Amount (USD)
							</label>
							<div class="relative">
								<span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg">$</span>
								<input
									id="topup-amount"
									type="number"
									min="1"
									max="1000"
									step="0.01"
									placeholder="0.00"
									bind:value={topUpAmount}
									disabled={isTopUpProcessing}
									class="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
								/>
							</div>
							<p class="text-white/50 text-sm mt-1">Minimum: $1.00 • Maximum: $1,000.00</p>
						</div>

						<!-- Quick Amount Buttons -->
						<div class="grid grid-cols-3 gap-3">
							{#each [10, 25, 50] as amount (amount)}
								<button
									on:click={() => topUpAmount = amount.toString()}
									disabled={isTopUpProcessing}
									class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white transition-colors disabled:opacity-50"
								>
									${amount}
								</button>
							{/each}
						</div>

						<!-- Success Message -->
						{#if topUpSuccess}
							<div class="flex items-center gap-2 text-green-400 bg-green-500/10 rounded-lg p-3">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span class="font-medium">Balance topped up successfully!<br>Just kidding, we are waiting for the payment service moderation now 😁</span>
							</div>
						{/if}

						<!-- Error Message -->
						{#if topUpError}
							<div class="flex items-center gap-2 text-red-400 bg-red-500/10 rounded-lg p-3">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01" />
								</svg>
								<span class="font-medium">{topUpError}</span>
							</div>
						{/if}

						<!-- Top-up Button -->
						<button
							on:click={handleTopUp}
							disabled={!topUpAmount || isTopUpProcessing}
							class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
						>
							{#if isTopUpProcessing}
								<div class="flex items-center justify-center gap-2">
									<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
									Processing...
								</div>
							{:else}
								Add Funds
							{/if}
						</button>

						<!-- Payment Info -->
						<div class="text-xs text-white/50 bg-white/5 rounded-lg p-3 border border-white/10 text-center">
							<p class="font-medium mb-1">🔐 Secure Crypto Payment</p>
							<p>Payments processed via cryptocurrency. Funds are added instantly upon confirmation.</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Active Jobs Section -->
			{#if userJobs.length > 0}
				<div class="mt-8">
					<div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
						<h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
							<svg class="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							Active Jobs
						</h2>

						<div class="space-y-4">
							{#each userJobs as job (job.job_id)}
								<div class="bg-white/5 rounded-lg p-4 border border-white/10">
									<div class="flex items-center justify-between">
										<div class="flex-1">
											<div class="flex items-center gap-3 mb-2">
												<span class="text-white font-medium">Job {job.job_id.slice(0, 8)}...</span>
												<span class="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
													{job.status}
												</span>
											</div>
											<p class="text-white/60 text-sm mb-1">
												File: {job.original_file_name}
											</p>
											<p class="text-white/60 text-sm">
												Started: {formatDate(job.created_at)}
											</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

		</main>

	</div>
</div>