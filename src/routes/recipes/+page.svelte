<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { PageData } from './$types';
	import type { Recipe, RecipeUpdate } from '../../types/db';
	import { orderBy } from 'lodash-es';
	import CookingIcon from '../../components/icons/CookingIcon.svelte';
	import { invalidateAll } from '$app/navigation';
	import CaretLeft from '../../components/icons/CaretLeft.svelte';
	import CaretRight from '../../components/icons/CaretRight.svelte';
	import PortionCount from '../../components/icons/PortionCount.svelte';
	import AddRecipeButton from '../../components/AddRecipeButton.svelte';
	import SearchFilter from '../../components/SearchFilter.svelte';
	import Pill from '../../components/Pill.svelte';
	import { press, tap, type PressCustomEvent } from 'svelte-gestures';
	import DeleteIcon from '../../components/icons/DeleteIcon.svelte';
	import EditIcon from '../../components/icons/EditIcon.svelte';

	const { data } = $props<{ data: PageData }>();
	let searchValue = $state<string>('');
	let filter = $state<string>('alpha');
	type RecipeListItem = Recipe & { ingredients: string[] };

	let selectedRecipe = $state<RecipeListItem | null>(null);

	const recipeFilter = (item: RecipeListItem) => {
		if (filter === 'is_cooking') {
			return !!item.isCooking;
		} else if (filter === 'simple') {
			return item.ingredients.length < 6;
		}

		return true;
	};

	const searchFilter = (item: RecipeListItem) => {
		if (searchValue === '') return true;

		return item.name.toLowerCase().includes(searchValue.toLowerCase());
	};

	let list: RecipeListItem[] = $derived.by(() => {
		if (filter === 'alpha') {
			return data.recipes.filter(recipeFilter).filter(searchFilter); // alpha is default from API
		} else if (filter === 'date_created') {
			return orderBy(
				data.recipes.filter(recipeFilter).filter(searchFilter),
				'date_created',
				'desc'
			);
		} else if (filter === 'simple') {
			return data.recipes.filter(recipeFilter).filter(searchFilter);
		} else {
			return data.recipes.filter(recipeFilter).filter(searchFilter);
		}
	});

	async function setCooking(recipe: Recipe) {
		try {
			const updatedRecipe: RecipeUpdate = {
				id: recipe.id,
				isCooking: recipe.isCooking ? 0 : 1
			};

			await fetch('/api/recipe', { method: 'PUT', body: JSON.stringify(updatedRecipe) });
			invalidateAll();
		} catch (error) {
			console.log(error);
		}
	}

	async function updatePortions(id: number, portions: number) {
		if (portions === 0) return;
		try {
			const updatedRecipe: RecipeUpdate = {
				id,
				portions
			};

			await fetch('/api/recipe', { method: 'PUT', body: JSON.stringify(updatedRecipe) });
			invalidateAll();
		} catch (error) {
			console.log(error);
		}
	}

	async function deleteRecipe(item: RecipeListItem) {
		try {
			await fetch('/api/recipe', { method: 'DELETE', body: JSON.stringify({ recipeId: item.id }) });
		} catch (e) {
			console.log(e);
		}
	}

	async function editRecipe(item: RecipeListItem) {
		try {
			// await fetch('/api/recipe', { method: 'DELETE', body: JSON.stringify({ recipeId: item.id }) });
		} catch (e) {
			console.log(e);
		}
	}

	function selectRecipe(item: RecipeListItem) {
		if (selectedRecipe?.id === item.id) {
			selectedRecipe = null;
			return;
		}

		selectedRecipe = item;
	}

	function pressHandler(item: RecipeListItem) {
		return (event: PressCustomEvent) => {
			event.preventDefault();
			selectRecipe(item);
		};
	}

	function tapHandler() {
		if (selectedRecipe) {
			selectedRecipe = null;
		}
	}
</script>

{#snippet recipeTitle(recipe: RecipeListItem)}
	{#if !recipe.link}
		<p class="font-medium text-sm capitalize select-none">{recipe.name}</p>
	{:else}
		<div class="flex flex-col gap-0.5 select-none">
			<p class="font-medium text-sm capitalize">{recipe.name}</p>
			<a class="text-xs text-orange-300 w-fit" href={recipe.link} target="_blank">View recipe</a>
		</div>
	{/if}
{/snippet}

{#snippet cookingControls(item: RecipeListItem)}
	<div class="flex gap-2">
		{#if !!item.isCooking}
			<div class="flex gap-1 items-center h-fit">
				<button
					class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-zinc-50 transition text-gray-400 active:text-gray-600"
					onclick={() => updatePortions(item.id, item.portions - 1)}
				>
					<CaretLeft />
				</button>
				<PortionCount count={item.portions} />
				<button
					class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-zinc-50 transition text-gray-400 active:text-gray-600"
					onclick={() => updatePortions(item.id, item.portions + 1)}
				>
					<CaretRight />
				</button>
			</div>
		{/if}
		<button
			class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-stone-700 transition h-fit"
			onclick={() => setCooking(item)}
		>
			<CookingIcon active={!!item.isCooking} />
		</button>
	</div>
{/snippet}

{#snippet editRecipeControls(item: RecipeListItem)}
	<div class="flex gap-2">
		<button
			class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-stone-700 transition h-fit"
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				editRecipe(item);
			}}
		>
			<EditIcon />
		</button>
		<button
			class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-stone-700 transition h-fit text-red-500"
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				deleteRecipe(item);
			}}
		>
			<DeleteIcon />
		</button>
	</div>
{/snippet}

<section class="h-full overflow-auto p-4 flex flex-col gap-4">
	<div class="flex justify-between">
		<h1 class="text-2xl font-semibold p-0 backdrop-blur-[1px] w-fit rounded">Recipes</h1>
		<SearchFilter
			bind:searchValue
			bind:filter
			filterOptions={[
				{ title: 'Alphabetical', description: 'Order by recipe name', value: 'alpha' },
				{
					title: 'Date Created',
					description: 'Order by newest recipes first',
					value: 'date_created'
				},
				{
					title: 'Cooking',
					description: 'View recipes lined up to cook',
					value: 'is_cooking'
				},
				{ title: 'Simple', description: 'View recipes with 5 or less ingredients', value: 'simple' }
			]}
		/>
		<AddRecipeButton options={data.items} />
	</div>
	<ul class="w-full gap-2 flex flex-col">
		{#each list as item (item.id)}
			<li
				class="bg-stone-800 w-full flex justify-between gap-4 border-stone-700 border rounded-xl overflow-hidden transition active:scale-95"
				animate:flip={{ delay: 250, duration: 250, easing: quintOut }}
				out:fly={{ x: 100 }}
				use:press={{ timeframe: 500, triggerBeforeFinished: true }}
				onpress={pressHandler(item)}
				use:tap={{ timeframe: 300 }}
				ontap={tapHandler}
			>
				<article class="flex flex-col w-full select-none">
					{#if item.img_mime_type}
						<img
							src={`/api/recipe/img?id=${item.id}`}
							alt="a succulent meal"
							class="aspect-[4/3] object-cover object-center select-none"
						/>
					{/if}
					<section class="p-4 flex flex-col gap-2 select-none">
						<div class="flex justify-between w-full gap-2">
							{@render recipeTitle(item)}
							{#if selectedRecipe && selectedRecipe.id === item.id}
								{@render editRecipeControls(item)}
							{:else}
								{@render cookingControls(item)}
							{/if}
						</div>
						<div class="flex gap-1 flex-wrap">
							{#each item.ingredients as ingredient}
								<Pill color="bg-stone-600">{ingredient}</Pill>
							{/each}
						</div>
					</section>
				</article>
			</li>
		{/each}
	</ul>
</section>
