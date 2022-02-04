<script>
	import ElementSwitch from "$lib/components/modules/ElementSwitch/ElementSwitch.svelte";

	export let page;
</script>

{#key page}
	{#if page}
		<article>
			<h1>{page.title}</h1>
			<div class="richtext">
				{@html page.lead}
			</div>

			{#if page._blocks}
				<ElementSwitch elements={page._blocks}/>
			{/if}
		</article>
	{/if}
{/key}
