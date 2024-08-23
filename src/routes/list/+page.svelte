<script lang="ts">
	import { swipe, type SwipeCustomEvent } from 'svelte-gestures';
	import type { ItemUpdate, MeasurementUnit } from '../../types/db';
	import { invalidateAll } from '$app/navigation';
	import { useShoppingList, type ListItem } from '$lib/store';
	import { onMount } from 'svelte';
	import { groupBy } from 'lodash-es';
	const { data } = $props<{
		data: {
			items: {
				[key: string]: {
					id: number;
					name: string;
					isle: string;
					unit: MeasurementUnit;
					qty: unknown;
				}[];
			};
		};
	}>();

	const shoppingList = useShoppingList;

	$effect(() => {
		shoppingList.update(() => data.items);
	});

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

	const formattedShoppingList = $derived(
		groupBy(
			$shoppingList.filter((item) => !item.stocked),
			'isle'
		)
	);
	const isles = $derived(Object.keys(formattedShoppingList).sort((a, b) => (a > b ? 1 : -1)));
</script>

{#snippet unitQtyLabel(qty: ListItem['qty'])}
	<section class="flex flex-col justify-center w-fit">
		{#if qty.whole}
			{qty.whole}
		{/if}
		{#if qty.whole && qty.commonUnit}
			and
		{/if}
		{#if qty.commonUnit}
			{qty.commonUnit}
			{qty.unitType}
		{/if}
	</section>
{/snippet}

<section class="h-full overflow-auto relative p-4">
	<h1 class="text-2xl font-semibold p-0 backdrop-blur-[1px] w-fit rounded">Shopping List</h1>
	{#if isles.length === 0}
		<section class="flex flex-col justify-center items-center h-3/4">
			<p class="text-center text-stone-400 p-0 backdrop-blur-[1px] w-fit rounded">
				All stocked up! What's cookin', good lookin'?
			</p>
		</section>
	{/if}
	<ul class="w-full flex flex-col gap-2 mt-4">
		{#each isles as isle (isle)}
			<h2 class="capitalize">{isle}</h2>
			{#each formattedShoppingList[isle] as item (item.id)}
				<li
					use:swipe={{ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' }}
					onswipe={handler(item.id)}
					class="bg-stone-800 p-4 w-full flex justify-between gap-4 border-stone-700 border-2 rounded-2xl"
				>
					<section class="flex flex-col gap-2">
						<p class="font-medium capitalize">{item.name}</p>
					</section>
					{@render unitQtyLabel(item.qty)}
				</li>
			{/each}
		{/each}
	</ul>
</section>
