<script lang="ts">
	import CaretLeft from './icons/CaretLeft.svelte';
	import CaretRight from './icons/CaretRight.svelte';
	import PortionCount from './icons/PortionCount.svelte';

	const { portion, onChange } = $props<{
		portion: number;
		onChange: (val: number) => void;
	}>();
</script>

<div class="flex gap-1 items-center h-fit">
	<button
		class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-zinc-50 transition text-gray-400 active:text-gray-600"
		onclick={() => onChange(portion - 1)}
	>
		<CaretLeft />
	</button>
	<PortionCount count={portion} />
	<button
		class="bg-stone-800 rounded-lg p-1 active:scale-90 active:bg-zinc-50 transition text-gray-400 active:text-gray-600"
		onclick={() => onChange(portion + 1)}
	>
		<CaretRight />
	</button>
</div>
