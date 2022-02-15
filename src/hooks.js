import {parse} from 'cookie';
import {previewSessionCookie} from "$lib/util/prismic.js";

export async function getSession({ locals }) {
	return {
		previewToken: locals.previewToken
	};
}

export async function handle({ event, resolve }) {
	const {request} = event;
	const cookies = parse(request.headers.get("cookie") || "");

	event.locals.previewToken = previewSessionCookie in cookies ? cookies[previewSessionCookie] : null;

	return await resolve(event);
}
