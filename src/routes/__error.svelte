<script>
	import {dev} from "$app/env";

	export let status;
	export let error;

	const getTitle = code => {
		switch (code) {
			case 404:
				return 'Page Not Found';
		}

		return `Error ${code}`;
	}

	const getDescription = (code) => {
		switch (code) {
			case 404:
				return 'This page doesnʼt seem to exist.<br>Go visit our <a href="/">homepage</a> instead!';
		}

		return null;
	}
</script>

<svelte:head>
	<title>{getTitle(status)}</title>
</svelte:head>

<h1>An error occurred</h1>
<h2>{getTitle(status)}</h2>
<p>
	{getDescription(status)}
</p>

{#if dev}
	<pre>
		${error.message}
	</pre>
{/if}

<script context="module">
	export function load({ error, status }) {
		return {
			props: {
				status,
				error,
				title: `${status}: ${error.message}`
			}
		};
	}
</script>

