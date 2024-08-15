<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { PageData } from './$types';
	import type { Recipe, RecipeUpdate } from '../../types/db';
	import AddItemButton from '../../components/AddItemButton.svelte';
	import { sortBy, upperCase, upperFirst } from 'lodash-es';
	import CookingIcon from '../../components/icons/CookingIcon.svelte';
	import { invalidate, invalidateAll } from '$app/navigation';
	import CaretLeft from '../../components/icons/CaretLeft.svelte';
	import CaretRight from '../../components/icons/CaretRight.svelte';
	import PortionCount from '../../components/icons/PortionCount.svelte';

	const { data } = $props<{ data: PageData }>();

	let list: Recipe[] = $derived(sortBy(data.recipes, 'name'));

	async function setCooking(recipe: Recipe) {
        try {
            const updatedRecipe: RecipeUpdate = {
                id: recipe.id,
                isCooking: recipe.isCooking ? 0 : 1
            }

            await fetch('/api/recipe', { method: 'PUT', body: JSON.stringify(updatedRecipe)});
            invalidateAll();
        } catch (error) {
            console.log(error)
        }
	}

    async function updatePortions(id: number, portions: number) {
        try {
            const updatedRecipe: RecipeUpdate = {
                id,
                portions
            }

            await fetch('/api/recipe', { method: 'PUT', body: JSON.stringify(updatedRecipe)});
            invalidateAll();
        } catch (error) {
            console.log(error)
        }
	}
</script>

<section class="h-full overflow-auto p-4 flex flex-col gap-4">
    <div class="flex justify-between">
        <h1 class="text-2xl font-semibold backdrop-blur-md">Recipes</h1>
        <button
            class="bg-slate-100 rounded-lg p-2 active:scale-90 active:bg-slate-200 transition text-sm font-semibold text-slate-500"
            
        >
            Add a new recipe
        </button>
    </div>
	<ul class="w-full gap-2 flex flex-col">
		{#each list as item (item.id)}
			<li
				class="bg-white p-4 w-full flex justify-between gap-4 border-slate-200 border-2 rounded-xl"
				animate:flip={{ delay: 250, duration: 250, easing: quintOut }}
				out:fly={{ x: 100 }}
			>
				<section class="flex flex-col gap-2">
					<img src="https://placehold.co/1920x1080" alt="recipe" class="w-full aspect-video rounded" />
					<div class="flex justify-between">
						<p class="font-medium capitalize pt-2">{item.name}</p>
                        <div class="flex gap-2">
                            {#if !!item.isCooking}
                            <div class="flex gap-1 items-center">
                                <button
                                class="bg-white rounded-lg p-1 active:scale-90 active:bg-zinc-50 transition"
                                onclick={() => updatePortions(item.id, item.portions - 1)}
                            >
                                <CaretLeft />
                                </button>
                                <PortionCount count={item.portions} />
                                <button
                                class="bg-white rounded-lg p-1 active:scale-90 active:bg-zinc-50 transition"
                                onclick={() => updatePortions(item.id, item.portions + 1)}
                            >
                                <CaretRight />
                                </button>
                            </div>
                            {/if}
                            <button
                                class="bg-white rounded-lg p-2 active:scale-90 active:bg-zinc-50 transition"
                                onclick={() => setCooking(item)}
                            >
                                <CookingIcon active={!!item.isCooking} />
                            </button>
                        </div>
					</div>
				</section>
			</li>
		{/each}
	</ul>
</section>
