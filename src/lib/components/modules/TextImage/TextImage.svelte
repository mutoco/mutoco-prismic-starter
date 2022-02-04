<script>
	import Image from "$lib/components/partials/Image/Image.svelte";

	export let title;
	export let content;
	export let image;
</script>

<section>
	<h2>{title}</h2>
	<div class="richtext">
		{@html content}
	</div>
	{#if image}
		<Image {...image} ratio={`${image.width}:${image.height}`}/>
	{/if}
</section>
