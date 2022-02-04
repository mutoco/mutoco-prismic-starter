import {parse, serialize} from 'cookie';
import {previewSessionCookie, refSessionCookie} from "$lib/util/prismic.js";
import {env} from "$lib/util/env.js";

export async function getSession({ locals }) {
	return {
		token: locals.previewToken,
		prismicRef: locals.previewToken || locals.prismicRef
	};
}

export async function handle({ event, resolve }) {
	const {request} = event;
	const cookies = parse(request.headers.get("cookie") || "");

	event.locals.previewToken = previewSessionCookie in cookies ? cookies[previewSessionCookie] : null;

	let ref = refSessionCookie in cookies ? cookies[refSessionCookie] : null;
	let mustSetRef = false;

	if (!ref) {
		// Loading the prismic ref from the API and set it as cookie
		const res = await fetch(`https://${env.prismicRepo}.cdn.prismic.io/api/v2`);
		const json = await res.json();
		ref = json.refs.find(ref => ref.isMasterRef)?.ref;
		mustSetRef = true;
	}

	event.locals.prismicRef = ref;
	const response = await resolve(event);

	if (mustSetRef) {
		response.headers.set('Set-Cookie', serialize(refSessionCookie, ref));
	}

	return response;
}
