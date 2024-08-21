<script lang="ts">
	import { swipe, type SwipeCustomEvent } from 'svelte-gestures';
	import type { PageData } from './$types';
	import type { Item, ItemUpdate } from '../../types/db';
	import { invalidateAll } from '$app/navigation';
	import { groupBy } from 'lodash-es';

	interface ListItem extends Item {
		qty: number;
		unit: string;
	}

	const { data } = $props<{ data: PageData }>();

	let list: ListItem[] = $state(data.items);

	const itemsByIsle = $derived(groupBy(list, 'isle'));

	const handler = (value: number) => (event: SwipeCustomEvent) => {
		switch (event.detail.direction) {
			case 'right':
				stockItem(value);
				break;
			default:
				return;
		}
	};

	const stockItem = async (id: number) => {
		try {
			const updatedItem: ItemUpdate = {
				id,
				stocked: 1
			};

			await fetch('/api/item', { method: 'PUT', body: JSON.stringify(updatedItem) });
			invalidateAll();
		} catch (error) {
			console.log(error);
		}
	};
</script>

<section class="h-full overflow-auto relative p-4">
	<h1 class="text-2xl font-semibold p-0 backdrop-blur-[1px] w-fit rounded">Shopping List</h1>
	{#if list.length === 0}
		<section class="flex flex-col justify-center items-center h-3/4">
			<p class="text-center text-stone-400 p-0 backdrop-blur-[1px] w-fit rounded">
				All stocked up! What's cookin', good lookin'?
			</p>
		</section>
	{/if}
	<ul class="w-full flex flex-col gap-2 mt-4">
		{#each Object.keys(itemsByIsle).sort((a, b) => (a > b ? 1 : -1)) as isle (isle)}
			<h2 class="capitalize">{isle}</h2>
			{#each itemsByIsle[isle]! as item (item.id)}
				{#if !item.stocked}
					<li
						use:swipe={{ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' }}
						onswipe={handler(item.id)}
						class="bg-stone-800 p-4 w-full flex justify-between gap-4 border-stone-700 border-2 rounded-2xl"
					>
						<section class="flex flex-col gap-2">
							<p class="font-medium capitalize">{item.name}</p>
							<!-- <div class="flex gap-2 w-72 overflow-auto">
						{#each item.recipes as recipe}
							<span
								class="text-xs font-medium text-stone-500 rounded text-nowrap py-1 px-2 bg-stone-200"
								>{recipe}</span
							>
						{/each}
					</div> -->
						</section>
						<section class="flex flex-col justify-center w-fit">
							{item.qty}
							{item.unit}
						</section>
					</li>
				{/if}
			{/each}
		{/each}
	</ul>
</section>
