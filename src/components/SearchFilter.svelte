<script lang="ts">
	import { fade } from 'svelte/transition';
	import FilterIcon from './icons/FilterIcon.svelte';

	type FilterOption = {
		title: string;
		description: string;
		value: string;
	};

	let {
		searchValue = $bindable<string>(''),
		filter = $bindable<string>(''),
		filterOptions
	} = $props<{ searchValue: string; filter: string; filterOptions: FilterOption[] }>();

	let isOpen = $state<boolean>(false);

	function toggleFiltersOpen() {
		isOpen = !isOpen;
	}

	function handleFilterChange(value: string) {
		filter = value;
		setTimeout(() => {
			isOpen = false;
		}, 150);
	}
</script>

<div class="flex gap-2 border border-stone-600 backdrop-blur-sm rounded-md py-1 px-2">
	<input
		type="text"
		placeholder="Search"
		class="bg-transparent outline-none max-w-44"
		bind:value={searchValue}
	/>
	<button
		class="bg-none rounded-lg p-1 active:scale-90 active:bg-stone-700 transition text-stone-200 flex h-fit"
		onclick={toggleFiltersOpen}><FilterIcon width={28} height={28} /></button
	>
</div>

{#snippet filterButton(active: boolean, filterOption: FilterOption)}
	<button
		class="w-full bg-stone-800 p-6 border rounded-2xl bg-opacity-85 flex flex-col gap-1 items-center transition active:scale-95"
		class:border-orange-400={active}
		class:border-stone-500={!active}
		onclick={() => handleFilterChange(filterOption.value)}
	>
		<h2 class="text-lg" class:text-orange-400={active} class:text-stone-300={!active}>
			{filterOption.title}
		</h2>
		<p class="text-xs" class:text-orange-200={active} class:text-stone-400={!active}>
			{filterOption.description}
		</p>
	</button>
{/snippet}

{#if isOpen}
	<section
		transition:fade={{ duration: 150 }}
		class="fixed top-0 bottom-24 right-0 left-0 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-8"
	>
		{#each filterOptions as filterOption}
			{@render filterButton(filter === filterOption.value, filterOption)}
		{/each}
	</section>
{/if}
