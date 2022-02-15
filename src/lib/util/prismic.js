import btoa from "btoa-lite";
import {GraphQLClient} from "graphql-request";
import {env} from "$lib/util/env.js";
import {asHTML, asText} from "@prismicio/helpers";
import {browser, dev} from "$app/env";

export const previewSessionCookie = "mutoco.prismic.preview";

/**
 * Resolve a doc to a link. Check doc.type and return the appropriate route
 * @param doc
 * @returns {string}
 */
export const linkResolver = doc => {
	switch (doc.type) {
		case 'home':
			return '/';
		case 'page':
			return `/${doc.uid}`;
	}

	return `/${doc.uid || ''}`;
};

/**
 * Get the module for the given prismic slice type
 * @param {string} type - the slice type coming from the prismic api
 * @returns {Promise<null|*>} a promise that resolves to a svelte-component or null
 */
const componentFromType = async type => {
	switch (type) {
		case "text_image":
			return await import("$lib/components/modules/TextImage/TextImage.svelte");
	}

	if (dev) {
		return await import("$lib/components/modules/Debug/Debug.svelte");
	}

	return null;
}

/**
 * Return cleaned props for each slice, mapping API props to internal props
 * @param props
 * @returns {object} props for the element
 */
const propsFromType = props => {
	switch (props.type) {
		case "text_image":
			return props.primary;
	}

	return {type: props.type || props.__typename};
}

/**
 * Transform incoming blocks to a data-structure that can be consumed by the "ElementSwitch"
 * @param blocks
 * @param fetch
 * @returns {Promise<{_module:Module, props:*}[]>}
 */
const transformBlocks = async (blocks, fetch) => {
	return Promise.all(blocks.map(async block => {
		const _module = await componentFromType(block.type);
		const transformed = await transformData(block, fetch);
		const props = propsFromType(transformed);
		return {_module, props};
	}))
}

/**
 * Perform a prismic query and transform the result-data
 * @param query - the graphql query
 * @param fetch - the current fetch instance
 * @param ref - the current prismic ref
 * @param variables - variables for the graphql query
 * @returns {Promise<unknown[]|{render}|*|{}>}
 */
export const prismicQuery = async ({query, fetch, ref, variables = {}}) => {
	const client = new GraphQLClient(env.graphQlApi, {
		fetch,
		method: "GET",
		headers: {
			"Prismic-ref": ref
		}
	});

	const data = await client.request(query, variables);
	return transformData(data, fetch);
}

/**
 * Get the current ref, either from session oder by fetching it from the API
 * @param session - session content
 * @param fetch – current fetch instance
 * @returns {Promise<string>}
 */
export const getRef = async ({session, fetch}) => {
	let ref;
	if (session && session.previewToken) {
		ref = session.previewToken;
	} else {
		const response = await fetch(`https://${env.prismicRepo}.cdn.prismic.io/api/v2`);
		const json = await response.json();

		ref = json.refs.find(ref => ref.isMasterRef)?.ref;
	}

	return ref;
}

const expandImageParams = img => (img ? {
	url: img.url,
	width: img?.width || img?.dimensions?.width,
	height: img?.height || img?.dimensions?.height,
	alt: img.alt,
	blurred: img.blurred || null
} : null)

export const expandLinkParams = link => ({
	href: link.url || linkResolver(link._meta),
	target: link.target || null
})

const addBlurredThumb = async (img, fetch) => {
	const url = img.url.split('?')[0];
	let blurred;

	try {
		if (browser && localStorage.getItem(url)) {
			blurred = localStorage.getItem(url);
		}
	} catch (e) {}

	if (!blurred) {
		const params = new URLSearchParams();
		params.set('w', 7);
		params.set('h', 7);
		params.set('fit', 'clip');
		params.set('fm', 'png8');

		const src = `${url}?${params.toString()}`;
		const res = await fetch(src);
		const bin = await res.arrayBuffer();
		blurred = btoa(String.fromCharCode.apply(null, new Uint8Array(bin)));

		if (browser) {
			try {
				localStorage.setItem(url, blurred);
			} catch (e) {}
		}
	}

	return expandImageParams({
		...img,
		blurred: `data:image/png;base64,${blurred}`
	})
}

export const defaultTransforms = [
	{
		check: (key, val) => key.endsWith('_txt') && Array.isArray(val),
		transformKey: key => key.slice(0, -4),
		transform: val => asText(val)
	},
	{
		check: (key, val) => key.endsWith('_html') && Array.isArray(val),
		transformKey: key => key.slice(0, -5),
		transform: val => asHTML(val, linkResolver)
	},
	{
		check: (key, val) => key.endsWith('_e') && (val.edges || Array.isArray(val)),
		transformKey: key => key.slice(0, -2),
		transform: val => Array.isArray(val) ? val.map(n => n.node) : val.edges.map(n => n.node)
	},
	{
		check: (key, val) => key === '_blocks' && Array.isArray(val),
		transformKey: key => key,
		transform: transformBlocks
	},
	{
		check: (key, val) => key.endsWith('_img') && val?.url,
		transformKey: key => key.slice(0, -4),
		transform: addBlurredThumb
	}
];

export const transformData = async (data, fetch, transforms = defaultTransforms) => {
	if (Array.isArray(data)) {
		return Promise.all(data.map(item => transformData(item, fetch, transforms)));
	}


	if (data instanceof Object) {
		// Do not recurse into modules
		if (data?.default?.render) {
			return data;
		}

		let target = {};
		for (let key of Object.keys(data)) {
			let tmp = data[key];
			let k = key;

			for (let transform of transforms) {
				if (transform.check(k, tmp)) {
					tmp = await transform.transform(tmp, fetch);
					k = transform.transformKey(key);
					break;
				}
			}

			target[k] = await transformData(tmp, fetch, transforms);
		}

		return target;
	}

	return data;
};
