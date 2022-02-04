import {SitemapStream, streamToPromise} from 'sitemap';
import {Readable} from 'stream';
import query from "$lib/graphql/query/sitemap.graphql";
import {getRef, linkResolver, prismicQuery} from "$lib/util/prismic.js";
import {env} from "$lib/util/env.js";

// Add static routes here
const staticPages = [
	{ url: '/',  changefreq: 'weekly', priority: 1 }
];

function getFrequency(timestamp) {
	const d = new Date(timestamp);
	const now = new Date();

	const days = (now - d) / (24 * 60 * 60 * 1000);

	if (days > 180) {
		return "yearly";
	} else if (days > 20) {
		return "monthly";
	} else if (days > 4) {
		return "weekly"
	}

	return "daily";
}


async function loadPages(ref) {
	let pages = [];
	let after = null;

	for(let i = 0; i < 100; i++) {
		const data = await prismicQuery({
			query,
			fetch,
			ref,
			variables: {
				after,
				types: ["page"] // The page types to load
			}
		});

		data._allDocuments.pages.forEach(p => {
			pages.push({
				url: linkResolver(p._meta),
				changefreq: getFrequency(p._meta.lastPublicationDate),
				priority: 0.6
			})
		})

		if (!data?._allDocuments?.pageInfo?.hasNextPage) {
			break;
		} else {
			after = data._allDocuments.pageInfo.endCursor
		}
	}

	return pages;
}

export async function get({locals}) {
	const ref = await getRef({session: locals, fetch});
	const pages = await loadPages(ref);

	const smStream = new SitemapStream({ hostname: env.basePath });
	const sitemap = await streamToPromise(Readable.from(staticPages.concat(pages)).pipe(smStream));
	return {
		headers: {
			'Content-Type': 'application/xml'
		},
		body: sitemap.toString()
	}
}
