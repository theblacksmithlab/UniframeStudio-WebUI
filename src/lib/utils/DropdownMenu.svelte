<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import JobsModal from '$lib/components/JobsModal.svelte';
	import { browser } from '$app/environment';

	let dropdownOpen = false;
	let jobsModalOpen = false;

	function teleportModal(node: HTMLElement) {
		if (!browser) return;

		const modalRoot = document.getElementById('modal-root');
		if (modalRoot) {
			modalRoot.appendChild(node);
		}

		return {
			'destroy'() {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			}
		};
	}
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			dropdownOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function handleLogin() {
		dropdownOpen = false;
		goto('/auth/login');
	}

	function handleLogout() {
		dropdownOpen = false;
		auth.logout();
	}

	function handleMyJobs() {
		dropdownOpen = false;
		jobsModalOpen = true;
	}
</script>

<div class="relative dropdown-container">
	<button
		class="flex items-center justify-center p-2 rounded-lg transition-all duration-300 cursor-pointer group"
		on:click={toggleDropdown}
	>
		<img
			src="/menu-icon.png"
			alt="Menu"
			class="w-full h-full object-contain transition-all duration-300 opacity-80 group-hover:opacity-100"
			class:menu-glow={$auth.isAuthenticated}
		/>
	</button>

	<!-- Dropdown content -->
	{#if dropdownOpen}
		<div class="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-[9999]">
			{#if $auth.isAuthenticated}
				<!-- Authorized user -->
				<div class="p-4 border-b border-white/10">
					<div class="flex items-center gap-3">
						<!-- Avatar -->
						<div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
							<span class="text-white font-semibold text-sm">
								{$auth.userEmail?.charAt(0).toUpperCase() || 'U'}
							</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-white font-medium truncate">
								{$auth.userEmail || 'User'}
							</p>
							<p class="text-gray-400 text-xs">
								Signed in
							</p>
						</div>
					</div>
				</div>

				<div class="p-2">
					<!-- My Jobs -->
					<button
						class="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-colors duration-200 cursor-pointer"
						on:click={handleMyJobs}
					>
						<!-- List icon -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
						</svg>
						<span>My Jobs</span>
					</button>

					<!-- Sign Out -->
					<button
						class="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-colors duration-200 cursor-pointer"
						on:click={handleLogout}
					>
						<!-- Sign out icon -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
						</svg>
						<span>Sign out</span>
					</button>
				</div>
			{:else}
				<!-- Unauthorized user -->
				<div class="p-2">
					<button
						class="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-colors duration-200 cursor-pointer"
						on:click={handleLogin}
					>
						<!-- Sign in icon -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
						</svg>
						<span>Sign in</span>
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Jobs Modal -->
{#if jobsModalOpen}
	<div use:teleportModal>
		<JobsModal
			isOpen={jobsModalOpen}
			onClose={() => jobsModalOpen = false}
		/>
	</div>
{/if}

<style>
    .menu-glow {
        filter: drop-shadow(0 0 10px rgba(64, 224, 255, 0.8)) drop-shadow(0 0 15px rgba(147, 51, 234, 0.8));
    }
</style>