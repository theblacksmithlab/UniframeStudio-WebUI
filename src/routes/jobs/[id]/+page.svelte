<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { dubbingActions } from '$lib/stores/dubbing';
	import { apiClient } from '$lib/api/client';

	let loading = true;
	let error = '';

	onMount(async () => {
		const jobId = window.location.pathname.split('/').pop();

		try {
			const jobData = await apiClient.getPipelineStatus(jobId!);
			dubbingActions.loadExistingJob(jobData);
			await goto('/dubbing');
		} catch (err) {
			console.error('Error loading job:', err);
			error = 'Failed to load job. Please try again.';
			loading = false;
		}
	});
</script>

<div class="min-h-screen bg-slate-900 flex items-center justify-center">
	{#if loading}
		<div class="text-center">
			<div class="text-white text-xl mb-4">Loading job...</div>
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
		</div>
	{:else if error}
		<div class="text-center">
			<div class="text-red-400 text-xl mb-4">{error}</div>
			<button
				on:click={() => goto('/')}
				class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
			>
				Back to Home
			</button>
		</div>
	{/if}
</div>