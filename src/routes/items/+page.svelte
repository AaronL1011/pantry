<script lang="ts">
	import type { PageData } from './$types';
	import type { ItemUpdate } from '../../types/db';
	import AddItemButton from '../../components/AddItemButton.svelte';
	import { orderBy, sortBy } from 'lodash-es';
	import { invalidateAll } from '$app/navigation';
	import CheckIcon from '../../components/icons/CheckIcon.svelte';
	import DeleteIcon from '../../components/icons/DeleteIcon.svelte';
	import { press, tap, type PressCustomEvent } from 'svelte-gestures';
	import { usePantryList, type PantryItem } from '$lib/store';
	import Pill from '../../components/Pill.svelte';
	import SearchFilter from '../../components/SearchFilter.svelte';
	import { itemTypePillColor } from '../../components/utils';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { persisted } from 'svelte-persisted-store';

	const { data } = $props<{ data: PageData }>();
	let deleteCandidate = $state<PantryItem | null>(null);
	let searchValue = $state<string>('');
	let filter = persisted('itemFilter', 'alpha');

	$effect(() => {
		usePantryList.update(() => sortBy(data.items, 'name'));
	});

	const stockFilter = (item: PantryItem) => {
		if ($filter === 'in_stock') {
			return !!item.stocked;
		} else if ($filter === 'out_of_stock') {
			return !item.stocked;
		}

		return true;
	};

	const searchFilter = (item: PantryItem) => {
		if (searchValue === '') return true;

		return item.name.toLowerCase().includes(searchValue.toLowerCase());
	};

	const pantryList = $derived.by(() => {
		if ($filter === 'alpha') {
			return sortBy($usePantryList.filter(stockFilter).filter(searchFilter), 'name');
		} else if ($filter === 'date_created') {
			return orderBy(
				$usePantryList.filter(stockFilter).filter(searchFilter),
				'date_created',
				'desc'
			);
		} else if ($filter === 'item_type') {
			return sortBy($usePantryList.filter(stockFilter).filter(searchFilter), 'type');
		} else {
			return $usePantryList.filter(stockFilter).filter(searchFilter);
		}
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
	<div class="flex justify-between gap-2">
		<h1 class="text-2xl font-semibold p-0 backdrop-blur-[1px] w-fit rounded">Pantry</h1>
		<SearchFilter
			bind:searchValue
			bind:filter={$filter}
			filterOptions={[
				{ title: 'Alphabetical', description: 'Order by item name', value: 'alpha' },
				{ title: 'Date Created', description: 'Order by newest first', value: 'date_created' },
				{
					title: 'In Stock',
					description: 'View items in the pantry',
					value: 'in_stock'
				},
				{ title: 'Out of Stock', description: 'View items needed to buy', value: 'out_of_stock' },
				{ title: 'Item Type', description: 'Order by item type', value: 'item_type' }
			]}
		/>
	</div>
	<ul class="w-full gap-2 flex flex-col mb-28">
		{#each pantryList as item (item.id)}
			<li
				use:press={{ timeframe: 300, triggerBeforeFinished: true }}
				onpress={pressHandler(item)}
				use:tap={{ timeframe: 300 }}
				ontap={tapHandler}
				class="bg-stone-800 p-4 w-full flex justify-between gap-4 border-stone-700 border rounded-xl transition active:scale-[0.98]"
				animate:flip={{ delay: 250, duration: 250, easing: quintOut }}
			>
				<section class="flex flex-col gap-2">
					<p class="font-medium text-sm capitalize select-none">{item.name}</p>
					<Pill color={itemTypePillColor[item.type]}>{item.type}</Pill>
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
