<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/api/client';
	import type { UserJob } from '$lib/types/api_types';

	export let isOpen = false;
	export let onClose: () => void;

	let allJobs: UserJob[] = [];
	let displayedJobs: UserJob[] = [];
	let loading = false;
	let error = '';
	let displayCount = 10;

	async function loadJobs() {
		if (!isOpen || loading) return;

		loading = true;
		error = '';

		try {
			const jobs = await apiClient.getUserJobs();
			allJobs = jobs.sort((a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
			displayedJobs = allJobs.slice(0, displayCount);
		} catch (err) {
			console.error('Error loading jobs:', err);
			error = 'Failed to load jobs';
		} finally {
			loading = false;
		}
	}

	function showMore() {
		displayCount += 10;
		displayedJobs = allJobs.slice(0, displayCount);
	}

	function selectJob(jobId: string) {
		onClose();
		goto(`/jobs/${jobId}`);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'completed': return 'text-green-400';
			case 'processing': return 'text-yellow-400';
			case 'failed': return 'text-red-400';
			default: return 'text-gray-400';
		}
	}

	function formatFileName(fileName: string) {
		return fileName.replace(/\.[^/.]+$/, '');
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	let prevIsOpen = false;
	$: {
		if (isOpen && !prevIsOpen) {
			displayCount = 10;
			loadJobs();
		}
		prevIsOpen = isOpen;
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
			on:click={onClose}
			aria-label="Close"
		></button>

		<!-- Modal -->
		<div class="relative bg-black/80 rounded-lg border border-white/10 shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-white/10">
				<h2 class="text-xl font-semibold text-white">My Jobs</h2>
				<button
					on:click={onClose}
					class="p-2 hover:bg-white/10 rounded-lg transition-colors"
					aria-label="Close"
				>
					<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6">
				{#if loading}
					<div class="flex justify-center py-8">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
					</div>
				{:else if error}
					<div class="text-center py-8">
						<p class="text-red-400">{error}</p>
					</div>
				{:else if displayedJobs.length === 0}
					<div class="text-center py-8">
						<p class="text-gray-400">No jobs found</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each displayedJobs as job (job.job_id)}
							<button
								on:click={() => selectJob(job.job_id)}
								class="w-full p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left group"
							>
								<div class="flex items-center justify-between">
									<div class="flex-1 min-w-0">
										<h3 class="text-white font-medium truncate">
											{formatFileName(job.original_file_name)}
										</h3>
										<div class="flex items-center gap-4 mt-1 text-sm">
                      <span class={getStatusColor(job.status)}>
                        {job.status}
                      </span>
											<span class="text-gray-500">
                        {formatDate(job.created_at)}
                      </span>
										</div>
									</div>
									<svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</button>
						{/each}
					</div>

					{#if allJobs.length > displayedJobs.length}
						<div class="mt-6 text-center">
							<button
								on:click={showMore}
								class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
							>
								Show More ({allJobs.length - displayedJobs.length} remaining)
							</button>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}