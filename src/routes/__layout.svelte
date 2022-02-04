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
