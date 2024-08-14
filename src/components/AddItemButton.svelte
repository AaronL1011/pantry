<script lang="ts">
	import CatIcon from './icons/CatIcon.svelte';
	import { enhance } from '$app/forms';
	import CloseIcon from './icons/CloseIcon.svelte';

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

	function handleClose() {
		isOpen = false;
	}
</script>

<button
	class="h-16 w-16 fixed bottom-32 right-4 rounded-full border-4 border-orange-500 bg-orange-400 text-white flex justify-center items-center shadow-xl active:scale-90 active:bg-orange-500 transition"
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
			class="relative bg-white rounded-lg shadow-md w-full max-w-96 p-8 flex flex-col gap-4"
			use:enhance={({ submitter, cancel, formData }) => {
				if (submitter?.id === 'cancel') {
					isOpen = false;
				}

				const name = formData.get('name');
				const isle = formData.get('isle');

				cancel();
			}}
		>
			<label for="name" class="flex flex-col gap-2">
				Name
				<input type="text" name="name" class="border-2 border-slate-200 rounded-md p-2" />
			</label>

			<label for="isle" class="flex flex-col gap-2">
				Isle
				<select name="isle" class="border-2 border-slate-200 rounded-md p-2 bg-white">
					<option value="asian">Asian</option>
					<option value="canned goods">Canned Goods</option>
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
			<button id="cancel" class="absolute top-2 right-2 p-4">
				<CloseIcon />
			</button>
			<button
				class="bg-orange-300 border-2 border-orange-400 py-4 px-8 text-white font-semibold rounded-md"
			>
				Add item
			</button>
		</form>
	</section>
{/if}
