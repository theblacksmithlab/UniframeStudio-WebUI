<script lang="ts">
	function openBot() {
		window.open('https://t.me/good_groot_bot', '_blank');
	}
</script>

<svelte:head>
	<title>Оплата успешна - Groot Bot</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
		<!-- Success Icon -->
		<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
			<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		</div>

		<h1 class="text-2xl font-bold text-gray-900 mb-4">
			✅ Оплата прошла успешно!
		</h1>

		<p class="text-gray-600 mb-6">
			Вернитесь в Telegram бот и нажмите кнопку "🔄 Проверить оплату" для активации подписки.
		</p>

		<button
			on:click={openBot}
			class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
		>
			Открыть бот
		</button>
	</div>
</div>
