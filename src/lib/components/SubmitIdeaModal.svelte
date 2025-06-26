<script lang="ts">
	import { fade } from 'svelte/transition';
	import { apiClient } from '$lib/api/client';
	import { Turnstile } from 'svelte-turnstile';
	import { env } from '$env/dynamic/public';

	export let isOpen = false;
	export let onClose: () => void;

	let ideaText = '';
	let isSubmitting = false;
	let submitError = '';
	let submitSuccess = false;
	let captchaToken = '';
	let turnstileReset: (() => void) | undefined;

	const MAX_CHARACTERS = 1000;

	function closeModal() {
		if (!isSubmitting) {
			onClose();
			resetForm();
		}
	}

	function resetForm() {
		ideaText = '';
		submitError = '';
		submitSuccess = false;
		isSubmitting = false;
		captchaToken = '';
		turnstileReset?.();
	}

	function handleBackdropClick() {
		closeModal();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	function handleTurnstileCallback(event: CustomEvent<{ token: string }>) {
		captchaToken = event.detail.token;
	}

	function handleTurnstileError() {
		captchaToken = '';
		submitError = 'Captcha error. Please try again.';
	}

	async function submitIdea() {
		if (!ideaText.trim() || isSubmitting || !captchaToken) return;

		isSubmitting = true;
		submitError = '';

		try {
			await apiClient.submitIdea(ideaText.trim(), captchaToken);

			submitSuccess = true;
			setTimeout(() => {
				closeModal();
			}, 3000);

		} catch (error) {
			if (error instanceof Error) {
				submitError = error.message;
			} else {
				submitError = 'An error occurred while submitting';
			}
			// Сброс капчи при ошибке
			turnstileReset?.();
			captchaToken = '';
		} finally {
			isSubmitting = false;
		}
	}

	$: remainingCharacters = MAX_CHARACTERS - ideaText.length;
	$: isTextValid = ideaText.trim().length > 0 && ideaText.length <= MAX_CHARACTERS;
	$: canSubmit = isTextValid && captchaToken && !isSubmitting;
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
			on:click={handleBackdropClick}
			aria-label="Close"
		></button>

		<!-- Modal -->
		<div class="relative bg-black/80 rounded-lg border border-white/10 shadow-xl max-w-md w-full"
				 transition:fade={{ duration: 200 }}>

			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-white/10">
				<h2 class="text-xl font-semibold text-white">Suggest an idea</h2>
				<button
					on:click={closeModal}
					class="p-2 hover:bg-white/10 rounded-lg transition-colors"
					disabled={isSubmitting}
					aria-label="Close"
				>
					<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6">
				{#if submitSuccess}
					<!-- Success message на месте формы -->
					<div class="text-center py-12">
						<div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
							<svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 class="text-2xl font-semibold text-white mb-3">Thanks for feedback!</h3>
						<p class="text-gray-400">Thank you for your suggestion</p>
					</div>
				{:else}
					<!-- Form -->
					<form on:submit|preventDefault={submitIdea} class="space-y-4">
						<!-- Textarea -->
						<div class="space-y-2">
							<textarea
								bind:value={ideaText}
								placeholder="Describe your idea..."
								maxlength={MAX_CHARACTERS}
								rows="6"
								disabled={isSubmitting}
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
									   text-white placeholder-gray-400 resize-none focus:outline-none
									   focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
									   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							></textarea>

							<!-- Character counter -->
							<div class="flex justify-between items-center text-sm">
								<div class="text-gray-400">
									{#if remainingCharacters < 50}
										<span class="text-yellow-400">
											Characters remaining: {remainingCharacters}
										</span>
									{:else}
										Characters remaining: {remainingCharacters}
									{/if}
								</div>
								{#if remainingCharacters < 0}
									<span class="text-red-400 text-xs">
										Character limit exceeded
									</span>
								{/if}
							</div>
						</div>

						{#if submitError}
							<div class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
								{submitError}
							</div>
						{/if}

						<!-- Turnstile Captcha -->
						<div class="flex justify-center">
							<Turnstile
								siteKey={env.PUBLIC_TURNSTILE_SITE_KEY}
								theme="dark"
								on:callback={handleTurnstileCallback}
								on:error={handleTurnstileError}
								bind:reset={turnstileReset}
							/>
						</div>

						<!-- Submit button -->
						<button
							type="submit"
							disabled={!canSubmit}
							class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600
								   hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600
								   text-white font-medium rounded-lg transition-all duration-200
								   disabled:cursor-not-allowed disabled:opacity-50
								   focus:outline-none focus:ring-2 focus:ring-blue-500/50"
						>
							{#if isSubmitting}
								<div class="flex items-center justify-center gap-2">
									<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Submitting...
								</div>
							{:else}
								Submit anonymously
							{/if}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
    /* Custom scrollbar for textarea */
    textarea::-webkit-scrollbar {
        width: 6px;
    }

    textarea::-webkit-scrollbar-track {
        background: rgba(75, 85, 99, 0.3);
        border-radius: 3px;
    }

    textarea::-webkit-scrollbar-thumb {
        background: rgba(107, 114, 128, 0.6);
        border-radius: 3px;
    }

    textarea::-webkit-scrollbar-thumb:hover {
        background: rgba(107, 114, 128, 0.8);
    }
</style>