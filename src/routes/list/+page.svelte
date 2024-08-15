<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { swipe, type SwipeCustomEvent } from 'svelte-gestures';
	import type { PageData } from './$types';
	import type { Item, ItemUpdate } from '../../types/db';
	import { invalidateAll } from '$app/navigation';

	interface ListItem extends Item {
		qty: number;
		unit: string;
	}

	const { data } = $props<{ data: PageData }>();

	let list: ListItem[] = $state(data.items);

	const itemsByIsle = $derived.by(() => {
		return list
			.filter((i) => !i.stocked)
			.reduce<{ [key: string]: ListItem[] }>((acc, curr) => {
				if (acc[curr.isle]?.length > 0) {
					acc[curr.isle].push(curr);
				} else {
					acc[curr.isle] = [curr];
				}
				return acc;
			}, {});
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
			}

            await fetch('/api/item', { method: 'PUT', body: JSON.stringify(updatedItem)});
            invalidateAll();
        } catch (error) {
            console.log(error)
        }
	};
</script>

<section class="h-full overflow-auto relative">
	<h1 class="text-2xl font-semibold p-4 backdrop-blur-md">Shopping List</h1>
	{#if list.length === 0}
		<section class="flex flex-col justify-center h-3/4">
			<p class="p-4 text-center text-slate-400">
				All stocked up! What's cookin', good lookin'?
			</p>
		</section>
	{/if}
	<ul class="w-full p-4 flex flex-col gap-4">
		{#each Object.keys(itemsByIsle).sort((a, b) => (a > b ? 1 : -1)) as isle (isle)}
			<h2 class="capitalize">{isle}</h2>
			{#each itemsByIsle[isle]! as item (item.id)}
				<li
					use:swipe={{ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' }}
					onswipe={handler(item.id)}
					class="bg-white p-4 w-full flex justify-between gap-4 border-slate-200 border-2 rounded-2xl"
					animate:flip={{ delay: 250, duration: 250, easing: quintOut }}
					out:fly={{ x: 100 }}
				>
					<section class="flex flex-col gap-2">
						<p class="font-medium capitalize">{item.name}</p>
						<!-- <div class="flex gap-2 w-72 overflow-auto">
						{#each item.recipes as recipe}
							<span
								class="text-xs font-medium text-slate-500 rounded text-nowrap py-1 px-2 bg-slate-200"
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
			{/each}
		{/each}
	</ul>
</section>
