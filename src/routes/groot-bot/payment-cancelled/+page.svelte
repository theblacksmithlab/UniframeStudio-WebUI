<script lang="ts">
	function openBot() {
		window.open('https://t.me/good_groot_bot', '_blank');
	}
</script>

<svelte:head>
	<title>Оплата отменена - Groot Bot</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
		<!-- Warning Icon -->
		<div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
			<svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		</div>

		<h1 class="text-2xl font-bold text-gray-900 mb-4">
			❌ Оплата отменена
		</h1>

		<p class="text-gray-600 mb-4">
			Это может быть временная проблема платежной системы.
		</p>

		<p class="text-gray-600 mb-6">
			Если средства все же списались, вернитесь в бот и нажмите "🔄 Проверить оплату".
		</p>

		<button
			on:click={openBot}
			class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
		>
			Открыть бот
		</button>
	</div>
</div>
