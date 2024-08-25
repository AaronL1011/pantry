<script lang="ts">
	import type { Snippet } from 'svelte';
	let { color, children } = $props<{ color: string; children: Snippet }>();
</script>

<span
	class={`${color} bg-opacity-50 text-stone-200 py-1 px-2 text-[10px] font-semibold rounded capitalize w-fit`}
>
	{@render children()}
</span>
