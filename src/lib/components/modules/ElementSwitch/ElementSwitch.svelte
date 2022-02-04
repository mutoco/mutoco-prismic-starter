<script>
	export let elements = [];
</script>

{#key elements}
	{#each elements.filter(elem => !!elem?._module?.default) as elem}
		<svelte:component this={elem._module.default} {...elem.props}/>
	{/each}
{/key}
