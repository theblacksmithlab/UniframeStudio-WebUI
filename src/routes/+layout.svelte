<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		auth.init();
	});
</script>

{@render children()}