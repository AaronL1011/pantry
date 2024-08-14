<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { PageData } from './$types';
	import type { Item } from '../../types/db';
	import AddItemButton from '../../components/AddItemButton.svelte';
	import { sortBy } from "lodash-es";

	const { data } = $props<{ data: PageData }>();

	let list: Item[] = $derived(sortBy(data.items, "name"));
</script>

<AddItemButton />
<section class="h-full overflow-auto p-4 flex flex-col gap-4">
	<h1 class="text-2xl font-semibold backdrop-blur-md">Pantry</h1>
	<ul class="w-full gap-2 flex flex-col">
		{#each list as item (item.id)}
			<li
				class="bg-white p-4 w-full flex justify-between gap-4 border-slate-200 border-2 rounded-xl"
				animate:flip={{ delay: 250, duration: 250, easing: quintOut }}
				out:fly={{ x: 100 }}
			>
				<section class="flex flex-col gap-2">
					<p class="font-medium capitalize">{item.name}</p>
				</section>
			</li>
		{/each}
	</ul>
</section>
