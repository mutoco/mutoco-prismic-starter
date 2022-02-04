<script>
	export let elements = [];
</script>

{#key elements}
	{#each elements as elem}
		{#if elem._module?.default}
			<svelte:component this={elem._module.default} {...elem.props}/>
		{/if}
	{/each}
{/key}
