<script>
	import MetaTags from "$lib/components/partials/MetaTags/MetaTags.svelte";

	export let home;
</script>

{#if home}
	<MetaTags
		title={home.title}
		description={home.description}
		imageUrl={home?.image?.url}
	/>

	<h1>{home.title}</h1>
	<div class="richtext">
		{@html home.lead}
	</div>
{/if}

<script context="module">
	export async function load({stuff}) {
		return {
			props: {
				home: stuff.home
			}
		}
	}
</script>

