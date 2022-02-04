import query from "$lib/graphql/query/getPage.graphql";
import {prismicQuery} from "$lib/util/prismic.js";

export async function get({params, locals}) {
	try {
		const ref = locals.prismicRef;

		const data = await prismicQuery({
			query,
			fetch,
			ref,
			variables: { uid: params.slug }
		});

		return {
			body: {
				page: data.page,
			}
		}
	} catch (error) {
		console.warn(error);

		return {
			status: 500,
			error
		}
	}
}
