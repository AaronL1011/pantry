<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { PageData } from './$types';
	import type { Item, ItemUpdate, NewItem } from '../../types/db';
	import AddItemButton from '../../components/AddItemButton.svelte';
	import { sortBy } from 'lodash-es';
	import { invalidateAll } from '$app/navigation';
	import CheckIcon from '../../components/icons/CheckIcon.svelte';
	import { longpress } from '../../components/actions';
	import CloseIcon from '../../components/icons/CloseIcon.svelte';
	import DeleteIcon from '../../components/icons/DeleteIcon.svelte';
	import LongPress from '../../components/LongPress.svelte';

	const { data } = $props<{ data: PageData }>();

	type ListItem = Item & { recipeCount: number };
	let list: ListItem[] = $derived(sortBy(data.items, 'name'));

	let deleteCandidate = $state<ListItem | null>(null);

	async function toggleStock(e: MouseEvent, item: ListItem) {
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

	function stageDelete(item: ListItem) {
		if (deleteCandidate?.id === item.id) {
			deleteCandidate = null;
			return;
		}

		deleteCandidate = item;
	}

	async function deleteItem(e: MouseEvent) {
		e.stopPropagation();
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
</script>

<AddItemButton />
<section class="h-full overflow-auto p-4 flex flex-col gap-4">
	<h1 class="text-2xl font-semibold backdrop-blur-md">Pantry</h1>
	<ul class="w-full gap-2 flex flex-col">
		{#each list as item (item.id)}
			<LongPress duration={750} callback={() => stageDelete(item)}>
				<li
					class="bg-white p-4 w-full flex justify-between gap-4 border-slate-200 border-2 rounded-xl"
					ondrag={() => stageDelete(item)}
				>
					<section class="flex flex-col gap-0">
						<p class="font-medium capitalize select-none">{item.name}</p>
						{#if item.recipeCount > 0}
							<p class="text-sm text-gray-500 select-none">{item.recipeCount} recipes</p>
						{/if}
					</section>
					<section class="flex">
						{#if item.id === deleteCandidate?.id}
							<button
								class="bg-white rounded-lg p-2 active:scale-90 active:bg-zinc-50 transition text-red-400"
								onclick={(e) => deleteItem(e)}
							>
								<DeleteIcon />
							</button>
						{:else}
							<button
								class="bg-white rounded-lg p-2 active:scale-90 active:bg-zinc-50 transition"
								onclick={(e) => toggleStock(e, item)}
							>
								<CheckIcon active={!!item.stocked} />
							</button>
						{/if}
					</section>
				</li>
			</LongPress>
		{/each}
	</ul>
</section>
