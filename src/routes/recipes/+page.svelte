<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { PageData } from './$types';
	import type { Recipe, RecipeUpdate } from '../../types/db';
	import { sortBy } from 'lodash-es';
	import CookingIcon from '../../components/icons/CookingIcon.svelte';
	import { invalidateAll } from '$app/navigation';
	import CaretLeft from '../../components/icons/CaretLeft.svelte';
	import CaretRight from '../../components/icons/CaretRight.svelte';
	import PortionCount from '../../components/icons/PortionCount.svelte';
	import AddRecipeButton from '../../components/AddRecipeButton.svelte';

	const { data } = $props<{ data: PageData }>();
	// TODO: store server state in a writable store and apply atomic updates from events.
	// and invalidate some requests when the state updates are too hectic
	type RecipeListItem = Recipe & { ingredients: string[] };
	let list: RecipeListItem[] = $derived(sortBy(data.recipes, 'name'));

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
</script>

<section class="h-full overflow-auto p-4 flex flex-col gap-4">
	<div class="flex justify-between">
		<h1 class="text-2xl font-semibold p-0 backdrop-blur-[1px] w-fit rounded">Recipes</h1>
		<AddRecipeButton options={data.items} />
	</div>
	<ul class="w-full gap-2 flex flex-col">
		{#each list as item (item.id)}
			<li
				class="bg-stone-800 w-full flex justify-between gap-4 border-stone-700 border-2 rounded-xl overflow-hidden"
				animate:flip={{ delay: 250, duration: 250, easing: quintOut }}
				out:fly={{ x: 100 }}
			>
				<article class="flex flex-col w-full">
					{#if item.img_mime_type}
						<img
							src={`/api/recipe/img?id=${item.id}`}
							alt="a succulent meal"
							class="aspect-[4/3] object-cover object-center"
						/>
					{/if}
					<section class="p-4 flex flex-col gap-2">
						<div class="flex justify-between w-full">
							<p class="font-medium capitalize max-w-40">{item.name}</p>
							<div class="flex gap-2">
								{#if !!item.isCooking}
									<div class="flex gap-1 items-center">
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
									class="bg-stone-800 rounded-lg p-2 active:scale-90 active:bg-stone-700 transition"
									onclick={() => setCooking(item)}
								>
									<CookingIcon active={!!item.isCooking} />
								</button>
							</div>
						</div>
						<div class="flex gap-1 flex-wrap">
							{#each item.ingredients as ingredients}
								<span
									class="bg-stone-700 text-stone-200 p-2 text-xs font-semibold rounded capitalize"
									>{ingredients}</span
								>
							{/each}
						</div>
					</section>
				</article>
			</li>
		{/each}
	</ul>
</section>
