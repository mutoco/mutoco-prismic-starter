import {SitemapStream, streamToPromise} from 'sitemap';
import {Readable} from 'stream';
import query from "$lib/graphql/query/sitemap.graphql";
import {variables} from "$lib/util/variables.js";
import {linkResolver, prismicQuery} from "$lib/util/prismic.js";

const staticPages = [
	{ url: '/',  changefreq: 'weekly', priority: 1 },
	{ url: '/work',  changefreq: 'weekly', priority: 0.9  },
	{ url: '/agency',  changefreq: 'monthly', priority: 0.9  },
	{ url: '/magazine',  changefreq: 'weekly', priority: 0.9  }
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

async function getRef(session) {
	let ref;
	if (session && session.previewToken) {
		ref = {
			ref: session.previewToken
		}
	} else {
		const response = await fetch(`https://${variables.prismicRepo}.cdn.prismic.io/api/v2`);
		const json = await response.json();

		ref = json.refs.find(ref => ref.isMasterRef);
	}

	return ref?.ref;
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
				types: ["meta_page", "project", "magazine_post", "magazine_category"]
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
	const ref = await getRef(locals);
	const pages = await loadPages(ref);

	const smStream = new SitemapStream({ hostname: variables.basePath });
	const sitemap = await streamToPromise(Readable.from(staticPages.concat(pages)).pipe(smStream));
	return {
		headers: {
			'Content-Type': 'application/xml'
		},
		body: sitemap.toString()
	}
}
