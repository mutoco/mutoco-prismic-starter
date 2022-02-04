<script>
	import "../scss/global.scss";
	import {fade} from "svelte/transition";
	import {navigating} from "$app/stores";
	import PreviewTag from "$lib/components/partials/PreviewTag/PreviewTag.svelte";

	export let nav;

	/* Uncomment this for Matomo tracking */
	/*
	$: if (browser && $page.url.href && typeof window._paq !== "undefined") {
		_paq.push(['setCustomUrl', $page.url.href]);
		_paq.push(['setDocumentTitle', document.title]);
		_paq.push(['trackPageView']);
	}
	// */
</script>

<main>
	<header>
		<nav>
			<ul>
				{#each nav as link}
					<li>
						<a href={link.href} target={link.target}>{link.title}</a>
					</li>
				{/each}
			</ul>
		</nav>
	</header>
	{#if $navigating}
		<!-- A loader with a slight delay, so that it only shows when loading takes more than X milliseconds -->
		<div in:fade={{ delay: 300, duration: 500 }}>
			<!-- TODO: Replace with fancy loading component -->
			Loading…
		</div>
	{:else}
		<slot/>
		<PreviewTag/>
	{/if}
</main>

<script context="module">
	import query from "$lib/graphql/query/getHome.graphql";
	import {getRef, prismicQuery, expandLinkParams} from "$lib/util/prismic.js";

	// This loads the current prismic ref and exposes it via the `stuff` prop for all routes.
	// See the docs for an explanation of `stuff`: https://kit.svelte.dev/docs#loading-input-stuff
	export async function load({ fetch, session }) {
		const ref = await getRef({fetch, session});

		const data = await prismicQuery({query, fetch, ref});
		const home = data?.allHomes?.pages[0];
		const nav = home.main_menu.map(link => ({
			...expandLinkParams(link.link),
			title: link.link.title
		}));

		return {
			props: {
				nav
			},
			stuff: {
				prismicRef: ref,
				home
			}
		}
	}
</script>

