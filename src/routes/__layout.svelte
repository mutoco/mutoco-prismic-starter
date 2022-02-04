<script>
	import "../scss/global.scss";
	import {fade} from "svelte/transition";
	import {navigating} from "$app/stores";
	import PreviewTag from "$lib/components/partials/PreviewTag/PreviewTag.svelte";

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
	{#if $navigating}
		<!-- A loader with a slight delay, so that it only shows when loading takes more than X milliseconds -->
		<div style="position: absolute; top: 20px; left: 20px;" in:fade={{ delay: 300, duration: 500 }}>
			<!-- TODO: Replace with fancy loading component -->
			Loading…
		</div>
	{:else}
		<slot/>
		<PreviewTag/>
	{/if}
</main>

<script context="module">
	import {env} from "$lib/util/env.js";

	// This loads the current prismic ref and exposes it via the `stuff` prop for all routes.
	// See the docs for an explanation of `stuff`: https://kit.svelte.dev/docs#loading-input-stuff
	export async function load({ fetch, session }) {
		let ref;
		if (session && session.token) {
			ref = session.token;
		} else {
			const response = await fetch(`https://${env.prismicRepo}.cdn.prismic.io/api/v2`);
			const json = await response.json();

			ref = json.refs.find(ref => ref.isMasterRef)?.ref;
		}

		return {
			stuff: {
				prismicRef: ref
			}
		}
	}
</script>

