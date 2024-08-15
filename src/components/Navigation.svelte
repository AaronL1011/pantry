<script lang="ts">
	import { goto } from '$app/navigation';
	import BowlIcon from './icons/BowlIcon.svelte';
	import CartIcon from './icons/CartIcon.svelte';
	import JarIcon from './icons/JarIcon.svelte';
	import { page } from '$app/stores';
</script>

<nav class="w-full bg-white fixed bottom-0 h-24 border-t-2 border-slate-200">
	<ul class="flex flex-row justify-center gap-8 p-4">
		<li>
			<button
				on:click={() => goto('/list')}
				class="bg-white rounded-lg py-3 px-5 active:scale-90 active:bg-zinc-50 transition"
			>
				<CartIcon active={$page.url.pathname === '/list'} />
			</button>
		</li>
		<li>
			<button
				on:click={() => goto('recipes')}
				class="bg-whites rounded-lg py-3 px-5 active:scale-90 active:bg-zinc-50 transition"
			>
				<BowlIcon active={$page.url.pathname === '/recipes'} />
			</button>
		</li>
		<li>
			<button
				on:click={() => goto('items')}
				class="bg-white rounded-lg py-3 px-5 active:scale-90 active:bg-zinc-50 transition"
			>
				<JarIcon active={$page.url.pathname === '/items'} />
			</button>
		</li>
	</ul>
</nav>
