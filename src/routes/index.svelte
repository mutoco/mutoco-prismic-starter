<script>
	export let home;
</script>


<h1>{home.title}</h1>
<div class="richtext">
	{@html home.lead}
</div>

<script context="module">
	export async function load({stuff}) {
		return {
			props: {
				home: stuff.home
			}
		}
	}
</script>

