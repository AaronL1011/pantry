<script lang="ts">
	import { enhance } from '$app/forms';
	import CloseIcon from './icons/CloseIcon.svelte';
	import {
		type Item,
		type MeasurementUnit,
		type RecipeListItem,
		type RecipeListItemIngredient
	} from '../types/db';
	import { invalidateAll } from '$app/navigation';
	import CaretLeft from './icons/CaretLeft.svelte';
	import PortionCount from './icons/PortionCount.svelte';
	import CaretRight from './icons/CaretRight.svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import CheckIcon from './icons/CheckIcon.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { NewRecipeRequest } from '../routes/api/recipe/+server';
	import { onMount } from 'svelte';
	import PortionController from './PortionController.svelte';

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

	let {
		recipe,
		onClose = () => {},
		options = []
	} = $props<{
		recipe?: RecipeListItem;
		onClose?: () => void;
		options: Item[];
	}>();
	let name = $state<string>(recipe?.name ?? '');
	let link = $state<string>(recipe?.link ?? '');
	let portions = $state<number>(recipe?.portions ?? 4);
	let img = $state<Uint8Array | null>(recipe?.img ?? undefined);
	let img_type = $state<string | undefined>(recipe?.img_mime_type ?? undefined);
	let file = $state<File | null>(null);
	let addingingredients = $state(false);
	let selectedItems = $state<
		SvelteMap<number, { name: string; qty: number; unit: MeasurementUnit }>
	>(new SvelteMap());
	let searchValue = $state<string>('');

	onMount(() => {
		if (recipe) {
			recipe.ingredients.forEach((ingredient: RecipeListItemIngredient) => {
				selectedItems.set(ingredient.id, {
					name: ingredient.name,
					qty: ingredient.qty,
					unit: ingredient.unit
				});
			});
		}
	});

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

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			file = input.files[0];
		}
	}

	async function onUpsert() {
		console.log('bing');
		try {
			const formData = new FormData();

			if (file) formData.append('image', file);
			if (recipe?.id) formData.append('id', recipe.id.toString());
			formData.append('name', name);
			formData.append('portions', portions.toString());
			formData.append('link', link);

			const ingredients: NewRecipeRequest['ingredients'] = [];
			selectedItems.forEach((val, key) => {
				ingredients.push({ item_id: key, qty: val.qty, unit: val.unit });
			});

			formData.append('ingredients', JSON.stringify(ingredients));

			await fetch('/api/recipe', { method: 'POST', body: formData });
			invalidateAll();
			onClose();
		} catch (error) {}
	}
</script>

<article class="flex flex-col w-full">
	{#if recipe?.img_mime_type}
		<img
			src={`/api/recipe/img?id=${recipe.id}`}
			alt="a succulent meal"
			class="aspect-[4/3] object-cover object-center select-none"
		/>
	{/if}
	<section class="p-4 flex flex-col gap-2 items-start">
		<div class="flex justify-between w-full gap-2">
			<input
				bind:value={name}
				class="border border-stone-700 rounded-md p-2 bg-stone-800 w-full text-sm"
				placeholder="Name"
			/>
			<div class="flex gap-2">
				<button
					class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-stone-700 transition h-fit"
					onclick={onUpsert}
				>
					<CheckIcon active={false} />
				</button>
				<button
					class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-stone-700 transition h-fit"
					onclick={onClose}
				>
					<CloseIcon />
				</button>
			</div>
		</div>
		<div class="flex w-full gap-4">
			<input
				bind:value={link}
				class="border border-stone-700 rounded-md p-2 bg-stone-800 w-full text-xs"
				placeholder="Link"
			/>
			<button class="p-2 bg-stone-600 rounded active:bg-stone-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					fill="currentColor"
					viewBox="0 0 256 256"
					><path
						d="M168,136a8,8,0,0,1-8,8H136v24a8,8,0,0,1-16,0V144H96a8,8,0,0,1,0-16h24V104a8,8,0,0,1,16,0v24h24A8,8,0,0,1,168,136Zm64-56V192a24,24,0,0,1-24,24H48a24,24,0,0,1-24-24V80A24,24,0,0,1,48,56H75.72L87,39.12A16,16,0,0,1,100.28,32h55.44A16,16,0,0,1,169,39.12L180.28,56H208A24,24,0,0,1,232,80Zm-16,0a8,8,0,0,0-8-8H176a8,8,0,0,1-6.66-3.56L155.72,48H100.28L86.66,68.44A8,8,0,0,1,80,72H48a8,8,0,0,0-8,8V192a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8Z"
					></path></svg
				>
			</button>
		</div>
		<div class="flex gap-2 items-center">
			<button
				class="bg-stone-700 rounded-lg p-2 active:scale-90 active:bg-stone-600 transition text-xs font-semibold text-stone-200"
				onclick={toggleAddingredients}
			>
				{selectedItems.size > 0 ? 'Change ingredients' : 'Add ingredients'}
			</button>
			{#if selectedItems.size > 0}
				<p class="text-sm text-gray-400">{selectedItems.size} ingredients</p>
			{/if}
			<PortionController
				portion={portions}
				onChange={(val) => {
					portions = val;
				}}
			/>
		</div>
	</section>
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
							class="bg-stone-800 p-2 w-full flex justify-between items-center gap-4 border-stone-700 border rounded-md capitalize whitespace-nowrap text-stone-200 min-h-12"
							onclick={addingredient(option)}
						>
							{option.name}
							{#if selectedItems.has(option.id)}
								<span class="flex gap-1">
									<input
										type="number"
										name="qty"
										id="qty"
										class="w-12 border border-stone-700 py-1 px-2 text-sm rounded bg-stone-800"
										placeholder="Qty"
										onclick={(e) => e.stopPropagation()}
										onchange={(e) => {
											const item = selectedItems.get(option.id);
											if (item) {
												// @ts-ignore
												item.qty = e.target.value;
											}
										}}
										value={selectedItems.get(option.id)?.qty}
									/>
									<select
										name="unit"
										id="unit"
										class="w-20 border border-stone-700 p-1 text-sm rounded bg-stone-800"
										onclick={(e) => e.stopPropagation()}
										onchange={(e) => {
											const item = selectedItems.get(option.id);
											if (item) {
												// @ts-ignore
												item.unit = e.target.value;
											}
										}}
										value={selectedItems.get(option.id)?.unit}
									>
										{#each Object.keys(units) as unit}
											<option value={unit}>{units[unit as MeasurementUnit]}</option>
										{/each}
									</select>
								</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</article>
