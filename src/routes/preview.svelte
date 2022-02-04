<script>
	/**
	 * This route enables previews from the Prismic CMS
	 */

	import * as prismic from '@prismicio/client'
	import {onMount} from "svelte"
	import Cookies from "js-cookie"
	import {linkResolver, previewSessionCookie} from "$lib/util/prismic";
	import {env} from "$lib/util/env";

	const apiEndpoint = `https://${env.prismicRepo}.cdn.prismic.io/api/v2`;
	const client = prismic.createClient(apiEndpoint);

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

		// This generates the URL of the preview document
        const redirect = await client.resolvePreviewURL({
			linkResolver,
			defaultURL: "/"
		});
        Cookies.set(previewSessionCookie, token, { expires: 1 });
        location.href = redirect;
    })
</script>
