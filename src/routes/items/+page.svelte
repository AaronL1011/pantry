<script lang="ts">
	import type { PageData } from './$types';
	import type { ItemUpdate } from '../../types/db';
	import AddItemButton from '../../components/AddItemButton.svelte';
	import { sortBy } from 'lodash-es';
	import { invalidateAll } from '$app/navigation';
	import CheckIcon from '../../components/icons/CheckIcon.svelte';
	import DeleteIcon from '../../components/icons/DeleteIcon.svelte';
	import { press, type PressCustomEvent } from 'svelte-gestures';
	import { usePantryList, type PantryItem } from '$lib/store';

	const { data } = $props<{ data: PageData }>();
	const pantryList = usePantryList;
	let deleteCandidate = $state<PantryItem | null>(null);

	$effect(() => {
		pantryList.update(() => sortBy(data.items, 'name'));
	});

	async function toggleStock(e: MouseEvent, item: PantryItem) {
		e.stopPropagation();
		try {
			const updatedItem: ItemUpdate = {
				id: item.id,
				stocked: item.stocked ? 0 : 1
			};

			await fetch('/api/item', { method: 'PUT', body: JSON.stringify(updatedItem) });
			invalidateAll();
		} catch (error) {
			console.log(error);
		}
	}

	function stageDelete(item: PantryItem) {
		if (deleteCandidate?.id === item.id) {
			deleteCandidate = null;
			return;
		}

		deleteCandidate = item;
	}

	async function deleteItem(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		if (!deleteCandidate) {
			return;
		}

		try {
			await fetch('/api/item', {
				method: 'DELETE',
				body: JSON.stringify({ id: deleteCandidate.id })
			});
			deleteCandidate = null;
			invalidateAll();
		} catch (error) {
			console.error(error);
		}
	}

	function handler(item: PantryItem) {
		return (event: PressCustomEvent) => {
			event.preventDefault();
			stageDelete(item);
		};
	}
</script>

<AddItemButton />
<section class="h-full overflow-auto p-4 flex flex-col gap-4">
	<h1 class="text-2xl font-semibold p-0 backdrop-blur-[1px] w-fit rounded">Pantry</h1>
	<ul class="w-full gap-2 flex flex-col mb-28">
		{#each $pantryList as item (item.id)}
			<li
				use:press={{ timeframe: 300, triggerBeforeFinished: true }}
				onpress={handler(item)}
				class="bg-stone-800 p-4 w-full flex justify-between gap-4 border-stone-700 border-2 rounded-xl"
			>
				<section class="flex flex-col gap-0">
					<p class="font-medium capitalize select-none">{item.name}</p>
					{#if item.recipeCount > 0}
						<p class="text-sm text-gray-500 select-none">{item.recipeCount} recipes</p>
					{/if}
				</section>
				<section class="flex">
					{#if deleteCandidate && deleteCandidate.id === item.id}
						<button
							class="bg-stone-800 rounded-lg p-2 active:scale-90 active:bg-zinc-50 transition text-red-400"
							onclick={(e) => deleteItem(e)}
						>
							<DeleteIcon />
						</button>
					{:else}
						<button
							class="bg-stone-800 rounded-lg p-2 active:scale-90 active:bg-stone-700 transition text-stone-200 flex"
							onclick={(e) => toggleStock(e, item)}
						>
							<CheckIcon active={!!item.stocked} />
						</button>
					{/if}
				</section>
			</li>
		{/each}
	</ul>
</section>
