<script lang="ts">
	import { enhance } from '$app/forms';
	import CloseIcon from './icons/CloseIcon.svelte';
	import { type Item, type MeasurementUnit } from '../types/db';
	import { invalidateAll } from '$app/navigation';
	import CaretLeft from './icons/CaretLeft.svelte';
	import PortionCount from './icons/PortionCount.svelte';
	import CaretRight from './icons/CaretRight.svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import CheckIcon from './icons/CheckIcon.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { NewRecipeRequest } from '../routes/api/recipe/+server';

	const units: { [key in MeasurementUnit]: string } = {
		'': 'Whole',
		g: 'g',
		kg: 'kg',
		ml: 'ml',
		l: 'liters',
		cup: 'cup',
		tsp: 'tsp',
		Tbs: 'Tbs',
		kl: 'kl',
		'fl-oz': 'fl-oz',
		pnt: 'pint',
		qt: 'quart',
		gal: 'gal',
		mcg: 'mcg',
		mg: 'mg',
		oz: 'oz',
		lb: 'lb'
	};

	let { options } = $props<{ options: Item[] }>();
	let isOpen = $state(false);
	let file = $state<File | null>(null);
	let addingingredients = $state(false);
	let portions = $state(4);
	let selectedItems = $state<
		SvelteMap<number, { name: string; qty: number; unit: MeasurementUnit }>
	>(new SvelteMap());
	let searchValue = $state<string>('');

	function maybeMeow() {
		const randomNumber = Math.floor(Math.random() * 10) + 1;

		if (randomNumber === 7) {
			const audio = new Audio('/meow.mp3');
			audio.play();
		}
	}

	function onClick() {
		maybeMeow();

		isOpen = !isOpen;
	}

	function handleClose(e?: Event) {
		e?.preventDefault();
		isOpen = false;
	}

	async function onAddItem(newRecipe: NewRecipeRequest) {
		try {
			const formData = new FormData();

			if (file) formData.append('image', file);
			formData.append('name', newRecipe.name);
			if (newRecipe.portions) formData.append('portions', newRecipe.portions.toString());
			if (newRecipe.link) formData.append('link', newRecipe.link);

			let i = 0;
			const ingredients: NewRecipeRequest['ingredients'] = [];
			selectedItems.forEach((val, key) => {
				ingredients.push({ item_id: key, qty: val.qty, unit: val.unit });
			});

			formData.append('ingredients', JSON.stringify(ingredients));

			await fetch('/api/recipe', { method: 'POST', body: formData });
			invalidateAll();
		} catch (error) {
			console.log(error);
		}
	}

	function updatePortions(newPortions: number) {
		portions = newPortions;
	}

	function toggleAddingredients(e: Event) {
		e.preventDefault();
		addingingredients = !addingingredients;
	}

	const listOptions = $derived(
		options.filter((option: Item) => {
			if (searchValue === '' || !searchValue) {
				return true;
			}

			return option.name.toLowerCase().includes(searchValue.toLocaleLowerCase());
		})
	);

	function addingredient(item: Item) {
		return (e: Event) => {
			e.preventDefault();
			if (selectedItems.has(item.id)) {
				selectedItems.delete(item.id);
			} else {
				selectedItems.set(item.id, { name: item.name, qty: 1, unit: '' });
			}
		};
	}

	function handleQtyUpdate(e: Event, itemId: number) {
		const updatedItem = selectedItems.get(itemId);
		if (!updatedItem) return;

		// @ts-ignore stfu typescript its a real value
		updatedItem.qty = e.target?.value!;
	}

	function handleUnitUpdate(e: Event, itemId: number) {
		const updatedItem = selectedItems.get(itemId);
		if (!updatedItem) return;

		// @ts-expect-error stfu typescript its a real value
		updatedItem.unit = e.target?.value;
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			file = input.files[0];
		}
	}
</script>

<button
	class="bg-stone-800 rounded-lg p-2 active:scale-90 active:bg-stone-900 transition text-sm font-semibold text-orange-500"
	onclick={onClick}
>
	New recipe
</button>

{#if isOpen}
	<section
		class="fixed backdrop-blur-sm top-0 bottom-0 right-0 left-0 flex items-start justify-center p-4"
	>
		<form
			method="POST"
			enctype="multipart/form-data"
			class="relative bg-stone-800 rounded-lg shadow-md w-full max-w-96 p-8 flex flex-col gap-4"
			use:enhance={async ({ submitter, cancel, formData }) => {
				if (submitter?.id === 'cancel') {
					isOpen = false;
					cancel();
				}

				const name = formData.get('name');
				const link = formData.get('link');

				if (!name || !portions || selectedItems.size === 0) {
					cancel();
					return;
				}

				const ingredients: NewRecipeRequest['ingredients'] = [];

				selectedItems.forEach((value, id) => {
					ingredients.push({
						item_id: id,
						qty: value.qty,
						unit: value.unit
					});
				});

				const newRecipe: NewRecipeRequest = {
					name: (name as string).toLowerCase(),
					link: (link as string) ?? undefined,
					portions,
					ingredients: ingredients
				};

				await onAddItem(newRecipe);

				cancel();
				handleClose();
			}}
		>
			<label class="block text-sm font-medium text-stone-900 dark:text-white" for="file_input"
				>Cover image</label
			>
			<input
				class="block w-full text-sm text-stone-900 border border-stone-300 rounded-md cursor-pointer bg-stone-50 dark:text-stone-400 focus:outline-none dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400"
				id="img"
				name="img"
				value="Select cover image"
				type="file"
				accept="image/*"
				onchange={handleFileChange}
			/>
			<label for="name" class="hidden"> Name </label>
			<input
				type="text"
				name="name"
				class="border border-stone-700 rounded-md p-2 bg-stone-800"
				placeholder="Name"
			/>

			<label for="link" class="hidden"> Link </label>
			<input
				placeholder="Recipe link"
				type="text"
				name="link"
				class="border border-stone-700 rounded-md p-2 bg-stone-800"
			/>

			<div class="flex gap-2 justify-between">
				<button
					class="bg-stone-800 rounded-lg p-2 active:scale-90 active:bg-stone-700 transition text-sm font-semibold text-stone-400"
					onclick={toggleAddingredients}
				>
					{selectedItems.size > 0 ? 'Change ingredients' : 'Add ingredients'}
				</button>
				<div class="flex gap-1 items-center text-stone-200">
					<button
						class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-stone-700 transition text-gray-400 active:text-gray-600"
						onclick={(e) => {
							e.preventDefault();
							updatePortions(portions - 1);
						}}
					>
						<CaretLeft />
					</button>
					<PortionCount count={portions} />
					<button
						class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-stone-700 transition text-gray-400 active:text-gray-600"
						onclick={(e) => {
							e.preventDefault();
							updatePortions(portions + 1);
						}}
					>
						<CaretRight />
					</button>
				</div>
			</div>
			<div class="flex gap-1 flex-col max-h-64 overflow-auto">
				{#each selectedItems as ingredient}
					<div
						class="bg-stone-800 text-stone-200 p-2 text-xs font-semibold rounded capitalize flex justify-between items-center gap-2"
					>
						{ingredient[1].name}
						<span class="flex gap-1">
							<input
								type="number"
								name="qty"
								id="qty"
								class="w-12 border border-stone-700 p-2 rounded bg-stone-800"
								placeholder="Qty"
								onchange={(e) => handleQtyUpdate(e, ingredient[0])}
							/>
							<select
								name="unit"
								id="unit"
								class="w-20 border border-stone-700 p-2 rounded bg-stone-800"
								onchange={(e) => handleUnitUpdate(e, ingredient[0])}
							>
								{#each Object.keys(units) as unit}
									<option value={unit}>{units[unit as MeasurementUnit]}</option>
								{/each}
							</select>
						</span>
					</div>
				{/each}
			</div>

			<button id="cancel" class="absolute top-2 right-2 p-4" onclick={handleClose}>
				<CloseIcon />
			</button>
			<button
				class="bg-orange-500 border border-orange-600 py-4 px-8 text-white font-semibold rounded-md active:scale-90 active:bg-orange-400 transition"
				type="submit"
			>
				Add Recipe
			</button>
			{#if addingingredients}
				<section
					class="fixed top-0 left-0 right-0 bottom-0 w-full h-full backdrop-blur-sm z-50 p-4 flex flex-col gap-2"
				>
					<button
						class="bg-stone-800/50 rounded-lg p-2 active:scale-90 active:bg-stone-600 transition text-sm font-semibold text-stone-200 self-end w-fit mb-2"
						onclick={toggleAddingredients}
					>
						Done
					</button>
					<input
						class="bg-stone-800 p-4 w-full flex justify-between gap-4 border-stone-700 border rounded-lg"
						placeholder="Search ingredients"
						bind:value={searchValue}
					/>
					<ul class="flex flex-col gap-2 p-2 pb-28 overflow-auto">
						{#each listOptions as option (option.id)}
							<li animate:flip={{ delay: 100, duration: 100, easing: quintOut }}>
								<button
									class="bg-stone-800 p-2 w-full flex justify-between gap-4 border-stone-700 border rounded-md capitalize whitespace-nowrap text-stone-200"
									onclick={addingredient(option)}
								>
									{option.name}
									{#if selectedItems.has(option.id)}
										<CheckIcon active />
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</form>
	</section>
{/if}
