<script lang="ts">
	import type { PageData } from './$types';
	import type { ItemUpdate } from '../../types/db';
	import AddItemButton from '../../components/AddItemButton.svelte';
	import { sortBy } from 'lodash-es';
	import { invalidateAll } from '$app/navigation';
	import CheckIcon from '../../components/icons/CheckIcon.svelte';
	import DeleteIcon from '../../components/icons/DeleteIcon.svelte';
	import { press, tap, type PressCustomEvent } from 'svelte-gestures';
	import { usePantryList, type PantryItem } from '$lib/store';
	import Pill from '../../components/Pill.svelte';

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

	function pressHandler(item: PantryItem) {
		return (event: PressCustomEvent) => {
			event.preventDefault();
			stageDelete(item);
		};
	}

	function tapHandler() {
		if (deleteCandidate) {
			deleteCandidate = null;
		}
	}
</script>

<AddItemButton />
<section class="h-full overflow-auto p-4 flex flex-col gap-4">
	<h1 class="text-2xl font-semibold p-0 backdrop-blur-[1px] w-fit rounded">Pantry</h1>
	<ul class="w-full gap-2 flex flex-col mb-28">
		{#each $pantryList as item (item.id)}
			<li
				use:press={{ timeframe: 300, triggerBeforeFinished: true }}
				onpress={pressHandler(item)}
				use:tap={{ timeframe: 300 }}
				ontap={tapHandler}
				class="bg-stone-800 p-4 w-full flex justify-between gap-4 border-stone-700 border-2 rounded-xl transition active:scale-[0.98]"
			>
				<section class="flex flex-col gap-2">
					<p class="font-medium text-sm capitalize select-none">{item.name}</p>
					<Pill>{item.type}</Pill>
				</section>
				<section class="flex items-center">
					{#if deleteCandidate && deleteCandidate.id === item.id}
						<button
							class="bg-stone-800 rounded-lg p-2 active:scale-90 active:bg-zinc-50 transition text-red-400 h-fit"
							onclick={(e) => deleteItem(e)}
						>
							<DeleteIcon />
						</button>
					{:else}
						<button
							class="bg-stone-800 rounded-lg p-2 active:scale-90 active:bg-stone-700 transition text-stone-200 flex h-fit"
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
