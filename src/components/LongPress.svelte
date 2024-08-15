<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	const {
		callback,
		duration = 500,
		children
	} = $props<{ callback: () => void; duration?: number; children: Snippet }>();
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let node: HTMLElement;

	const handleClick = (event: MouseEvent) => {
      if (!node.contains(event.target as Node)) {
        callback();
      }
    };

	const handlePressStart = () => {
		timeout = setTimeout(() => {
			callback();
		}, duration);
	};

	const handlePressEnd = () => {
		if (timeout) clearTimeout(timeout);
	};

	onMount(() => {
		node.addEventListener('mousedown', handlePressStart);
		node.addEventListener('touchstart', handlePressStart);
		node.addEventListener('mouseup', handlePressEnd);
		node.addEventListener('mouseleave', handlePressEnd);
		node.addEventListener('touchend', handlePressEnd);
		node.addEventListener('touchcancel', handlePressEnd);
		document.addEventListener('click', handleClick)

		return () => {
			node.removeEventListener('mousedown', handlePressStart);
			node.removeEventListener('touchstart', handlePressStart);
			node.removeEventListener('mouseup', handlePressEnd);
			node.removeEventListener('mouseleave', handlePressEnd);
			node.removeEventListener('touchend', handlePressEnd);
			node.removeEventListener('touchcancel', handlePressEnd);
			document.removeEventListener('click', handleClick)

		};
	});
</script>

<div bind:this={node} class="flex active:scale-95 transition">
	{@render children()}
</div>
