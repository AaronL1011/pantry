<script>
	import '../app.css';
	import Navigation from '../components/Navigation.svelte';
</script>

<div class="flex flex-col h-screen bg-slate-100">
	<main class="flex flex-col flex-1 overflow-auto mb-24">
		<slot />
	</main>
	<Navigation />
</div>
