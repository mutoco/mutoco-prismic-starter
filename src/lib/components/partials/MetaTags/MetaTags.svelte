<script>
	import {env} from "$lib/util/env";
	import {ratioImage} from "$lib/util/media";

	export let title;
	export let description;
	export let imageUrl = null;
	export let type = "website";

</script>

<svelte:head>
	{#if title === env.siteName}
		<title>{title}</title>
	{:else}
		<title>{title} - {env.siteName}</title>
	{/if}
	{#if description}
		<meta name="description" content={description}>
		<meta property="og:description" content={description}>
	{/if}
	<meta property="og:title" content={title}>
	<meta property="og:type" content={type} />
	{#if imageUrl}
		<meta property="og:image" content={ratioImage(imageUrl, "1200:630", 1200)}>
		<meta property="og:image:width" content="1200">
		<meta property="og:image:height" content="630">
		<meta name="twitter:card" content="summary_large_image"/>
	{:else}
		<meta name="twitter:card" content="summary"/>
	{/if}
</svelte:head>
