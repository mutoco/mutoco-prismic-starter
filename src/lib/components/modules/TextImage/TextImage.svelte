<script>
	export let title;
	export let content;
	export let image;
</script>

<section>
	<h2>{title}</h2>
	<div class="richtext">
		{@html content}
	</div>
</section>
