<script lang="ts">
	import CatIcon from './icons/CatIcon.svelte';
	import { enhance } from '$app/forms';
	import CloseIcon from './icons/CloseIcon.svelte';
	import type { Isle, ItemType, NewItem } from '../types/db';
	import { invalidateAll } from '$app/navigation';

	let isOpen = $state(false);

	function maybeMeow() {
		// Generate a random number between 1 and 10
		const randomNumber = Math.floor(Math.random() * 10) + 1;

		if (randomNumber === 7) {
			// Create a new Audio object with the path to the .mp3 file
			const audio = new Audio('/meow.mp3');

			// Play the audio
			audio.play();
		}
	}

	function onClick() {
		maybeMeow();

		isOpen = !isOpen;
	}

	function handleClose(e: Event) {
		e.preventDefault();
		isOpen = false;
	}

	async function onAddItem(newItem: NewItem) {
		try {
			await fetch('/api/item', { method: 'POST', body: JSON.stringify(newItem) });
			invalidateAll();
		} catch (error) {
			console.log(error);
		}
	}
</script>

<button
	class="h-16 w-16 fixed bottom-32 right-4 rounded-full border-4 border-orange-600 bg-orange-500 text-white flex justify-center items-center shadow-xl active:scale-90 active:bg-orange-500 transition"
	onclick={onClick}
>
	<CatIcon active={false} />
</button>

{#if isOpen}
	<section
		class="fixed backdrop-blur-sm top-0 bottom-0 right-0 left-0 flex items-center justify-center p-8"
	>
		<form
			method="POST"
			class="relative bg-stone-800 border border-stone-700 rounded-lg shadow-md w-full max-w-96 p-8 flex flex-col gap-4"
			use:enhance={async ({ submitter, cancel, formData }) => {
				if (submitter?.id === 'cancel') {
					isOpen = false;
					cancel();
				}
				const name = formData.get('name');
				const type = formData.get('type');
				const isle = formData.get('isle');
				const stocked = formData.get('stocked');

				if (!name || !isle || !type) {
					cancel();
					return;
				}

				const newItem: NewItem = {
					name: (name as string).toLowerCase(),
					type: type as ItemType,
					isle: isle as Isle,
					stocked: stocked ? 1 : 0,
					created_at: new Date().toISOString(),
					vegan: 0
				};

				await onAddItem(newItem);

				cancel();
				isOpen = false;
			}}
		>
			<label for="name" class="flex flex-col gap-2">
				Name
				<input
					type="text"
					name="name"
					class="border border-stone-700 rounded-md p-2 bg-stone-800"
				/>
			</label>

			<label for="type" class="flex flex-col gap-2">
				Type
				<select name="type" class="border border-stone-700 rounded-md p-2 bg-stone-800">
					<option value="ingredient">Ingredient</option>
					<option value="snack">Snack</option>
					<option value="non-perishable">Non-perishable</option>
					<option value="drink">Drink</option>
					<option value="other">Other</option>
				</select>
			</label>

			<label for="isle" class="flex flex-col gap-2">
				Isle
				<select name="isle" class="border border-stone-700 rounded-md p-2 bg-stone-800">
					<option value="asian">Asian</option>
					<option value="canned goods">Canned Goods</option>
					<option value="cleaning">Cleaning</option>
					<option value="cosmetics">Cosmetics</option>
					<option value="fridge">Fridge</option>
					<option value="frozen">Frozen</option>
					<option value="grains">Grains</option>
					<option value="health foods">Health Foods</option>
					<option value="herbs and spices">Herbs and Spices</option>
					<option value="meats">Meats</option>
					<option value="produce">Produce</option>
					<option value="plant based">Plant Based</option>
				</select>
			</label>

			<label for="stocked" class="flex flex-row gap-2">
				<input type="checkbox" name="stocked" />
				Stocked
			</label>
			<button id="cancel" class="absolute top-2 right-2 p-4" onclick={handleClose}>
				<CloseIcon />
			</button>
			<button
				class="bg-orange-500 border border-orange-600 py-4 px-8 text-white font-semibold rounded-md active:scale-90 active:bg-orange-400 transition"
			>
				Add item
			</button>
		</form>
	</section>
{/if}
