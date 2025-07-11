<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { PageData } from './$types';
	import type { Recipe, RecipeItem, RecipeListItem, RecipeUpdate } from '../../types/db';
	import { orderBy } from 'lodash-es';
	import CookingIcon from '../../components/icons/CookingIcon.svelte';
	import { invalidateAll } from '$app/navigation';
	import CaretLeft from '../../components/icons/CaretLeft.svelte';
	import CaretRight from '../../components/icons/CaretRight.svelte';
	import PortionCount from '../../components/icons/PortionCount.svelte';
	import AddRecipeButton from '../../components/UpsertRecipe.svelte';
	import SearchFilter from '../../components/SearchFilter.svelte';
	import Pill from '../../components/Pill.svelte';
	import { press, tap } from 'svelte-gestures';
	import DeleteIcon from '../../components/icons/DeleteIcon.svelte';
	import EditIcon from '../../components/icons/EditIcon.svelte';
	import { persisted } from 'svelte-persisted-store';
	import CloseIcon from '../../components/icons/CloseIcon.svelte';
	import CheckIcon from '../../components/icons/CheckIcon.svelte';
	import UpsertRecipe from '../../components/UpsertRecipe.svelte';
	import ChefIcon from '../../components/icons/ChefIcon.svelte';

	const { data } = $props<{ data: PageData }>();
	let searchValue = $state<string>('');
	const filter = persisted('recipeFilter', 'alpha');

	let isCreatingRecipe = $state<boolean>(false);
	let selectedRecipe = $state<RecipeListItem | null>(null);
	let editTarget = $state<RecipeListItem | null>(null);

	$effect(() => {
		if (isCreatingRecipe) {
			document
				.getElementById('create-recipe-item')
				?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		}
	});

	const recipeFilter = (item: RecipeListItem) => {
		if ($filter === 'is_cooking') {
			return !!item.isCooking;
		} else if ($filter === 'simple') {
			return item.ingredients.length < 6;
		}

		return true;
	};

	const searchFilter = (item: RecipeListItem) => {
		if (searchValue === '') return true;

		return item.name.toLowerCase().includes(searchValue.toLowerCase());
	};

	let list: RecipeListItem[] = $derived.by(() => {
		if ($filter === 'alpha') {
			return data.recipes.filter(recipeFilter).filter(searchFilter); // alpha is default from API
		} else if ($filter === 'date_created') {
			return orderBy(
				data.recipes.filter(recipeFilter).filter(searchFilter),
				'date_created',
				'desc'
			);
		} else if ($filter === 'simple') {
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
		if (!window.confirm('Are you sure you want to delete this recipe?')) return;
		try {
			await fetch('/api/recipe', { method: 'DELETE', body: JSON.stringify({ recipeId: item.id }) });
		} catch (e) {
			console.log(e);
		}
	}

	async function editRecipe(item: RecipeListItem) {
		try {
			await fetch('/api/recipe', { method: 'PUT', body: JSON.stringify({ recipeId: item.id }) });
			console.log(item);
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
		return () => {
			selectRecipe(item);
		};
	}

	function tapHandler(item: RecipeListItem) {
		return () => {
			if (item.id === selectedRecipe?.id) return;

			if (selectedRecipe) {
				selectedRecipe = null;
			}
		};
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
			onclick={() => {
				editTarget = item;
			}}
		>
			<EditIcon />
		</button>
		<button
			class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-stone-700 transition h-fit text-red-400"
			onclick={() => deleteRecipe(item)}
		>
			<DeleteIcon />
		</button>
	</div>
{/snippet}

<section class="h-full overflow-auto p-4 flex flex-col gap-4">
	<div class="flex justify-between">
		<h1 class="text-2xl font-semibold p-0 backdrop-blur-[1px] w-fit rounded">Recipes</h1>
		<SearchFilter
			bind:filter={$filter}
			bind:searchValue
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
		<!-- <AddRecipeButton options={data.items} /> -->
		<button
			class="h-16 w-16 fixed bottom-32 right-4 rounded-full border-4 border-orange-600 bg-orange-500 text-white flex justify-center items-center shadow-xl active:scale-90 active:bg-orange-500 transition"
			onclick={() => {
				isCreatingRecipe = !isCreatingRecipe;
			}}
		>
			<ChefIcon active={isCreatingRecipe} />
		</button>
	</div>
	<ul id="recipe-list" class="w-full gap-2 flex flex-col mb-28">
		{#if isCreatingRecipe}
			<li
				id="create-recipe-item"
				class="bg-stone-800 w-full flex justify-between gap-4 border-stone-700 border rounded-xl overflow-hidden"
				out:fly={{ x: 100 }}
			>
				<UpsertRecipe
					options={data.items}
					onClose={() => {
						isCreatingRecipe = false;
					}}
				/>
			</li>
		{/if}
		{#each list as item (item.id)}
			<li
				class="bg-stone-800 w-full flex justify-between gap-4 border-stone-700 border rounded-xl overflow-hidden"
				animate:flip={{ delay: 250, duration: 250, easing: quintOut }}
				out:fly={{ x: 100 }}
				use:press={{ timeframe: 500, triggerBeforeFinished: true }}
				onpress={pressHandler(item)}
				use:tap={{ timeframe: 300 }}
				ontap={tapHandler(item)}
			>
				{#if editTarget && editTarget.id === item.id}
					<UpsertRecipe
						options={data.items}
						recipe={item}
						onClose={() => {
							editTarget = null;
						}}
					/>
				{:else}
					<article class="flex flex-col w-full">
						{#if item.img_mime_type}
							<img
								src={`/api/recipe/img?id=${item.id}`}
								alt="a succulent meal"
								class="aspect-[4/3] object-cover object-center select-none"
							/>
						{/if}
						<section class="p-4 flex flex-col gap-2">
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
									<Pill color="bg-stone-600">{ingredient.name}</Pill>
								{/each}
							</div>
						</section>
					</article>
				{/if}
			</li>
		{/each}
	</ul>
</section>
