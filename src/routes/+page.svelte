<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

    onMount(() => {
        goto('/list')
    })
</script>