<script>
	import ElementSwitch from "$lib/components/modules/ElementSwitch/ElementSwitch.svelte";
	import MetaTags from "$lib/components/partials/MetaTags/MetaTags.svelte";

	export let page;
</script>

{#key page}
	{#if page}
		<MetaTags
			title={page.title}
			description={page.description}
			imageUrl={page?.image?.url}
		/>
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

<script context="module">
	import {prismicQuery} from "$lib/util/prismic.js";
	import query from "$lib/graphql/query/getPage.graphql";

	export async function load({params, stuff, fetch}) {
		try {
			const ref = stuff.prismicRef;

			const data = await prismicQuery({
				query,
				fetch,
				ref,
				variables: { uid: params.slug }
			});

			return {
				props: {
					page: data.page,
				}
			}
		} catch (error) {
			console.warn(error);

			return {
				status: 500,
				error
			}
		}
	}

</script>
