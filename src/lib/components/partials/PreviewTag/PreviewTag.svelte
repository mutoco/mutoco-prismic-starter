<script>
	/**
	 * This component checks if there's a prismic preview-session active and shows
	 * an "Exit Preview" Button if that's the case.
	 *
	 * Helps the user exit the preview-mode
	 */

	import {session} from "$app/stores";
	import Cookies from "js-cookie";
	import {previewSessionCookie} from "$lib/util/prismic.js";

	const clearSession = () => {
		Cookies.remove(previewSessionCookie);
		location.reload();
	}
</script>

<style lang="scss" src="./PreviewTag.scss"/>

<aside class="PreviewTag">
	{#if $session.previewToken}
		<button class="PreviewTag__button" on:click={clearSession}>
			Exit preview
		</button>
	{/if}
</aside>
