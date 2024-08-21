<script>
	import '../app.css';
	import Navigation from '../components/Navigation.svelte';
	import { connection } from '$lib/clients';
	import { onDestroy } from 'svelte';
	import { registerEventStateHandlers } from '$lib/eventHandler';

	registerEventStateHandlers();

	onDestroy(() => {
		connection.close();
	});
</script>

<div class="flex flex-col h-screen bg-stone-900 text-stone-50 bg-image">
	<main class="flex flex-col flex-1 overflow-auto mb-24">
		<slot />
	</main>
	<Navigation />
</div>

<style>
	.bg-image {
		background-image: url('/doodle-bg.jpg');
		background-repeat: repeat;
		background-size: 170%;
		background-position: center;
	}
</style>
