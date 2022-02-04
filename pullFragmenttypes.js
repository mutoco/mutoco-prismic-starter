#!/usr/bin/env node

import dotenv from 'dotenv';
import {writeFileSync} from 'fs';
import https from 'https';

dotenv.config();

const repoId = process.env.VITE_PRISMIC_REPO;

const fetchJson = (url, opts = {}) => {
	return new Promise((resolve, reject) => {
		https.get(url, opts, (res) => {
			const {statusCode} = res;
			const contentType = res.headers['content-type'];
			let error;
			// Any 2xx status code signals a successful response but
			// here we're only checking for 200.
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' +
					`Status Code: ${statusCode}`);
			} else if (!/^application\/json/.test(contentType)) {
				error = new Error('Invalid content-type.\n' +
					`Expected application/json but received ${contentType}`);
			}
			if (error) {
				console.error(error.message);
				// Consume response data to free up memory
				res.resume();
				reject(error);
				return;
			}

			res.setEncoding("utf8");
			let rawData = "";
			res.on("data", (chunk) => {
				rawData += chunk;
			});
			res.on("close", () => {
				try {
					const parsedData = JSON.parse(rawData);
					resolve(parsedData);
				} catch (e) {
					reject(e);
				}
			});
		}).on("error", (e) => {
			reject(e);
		});
	});
}


fetchJson(`https://${repoId}.cdn.prismic.io/api/v2`).then((data) => {
	const ref = data.refs.find((r) => r.id === 'master');
	if (!ref) return;
	fetchJson(
		`https://${repoId}.cdn.prismic.io/graphql?query=%7B%20__schema%20%7B%20types%20%7B%20kind%20name%20possibleTypes%20%7B%20name%20%7D%20%7D%20%7D%20%7D`,
		{
			headers: {
				'prismic-ref': ref.ref,
			},
		},
	).then((result) => {
		const filteredResults = result;
		filteredResults.data.__schema.types = result.data.__schema.types.filter(
			(type) => type.possibleTypes !== null,
		);
		writeFileSync('./src/lib/graphql/fragmentTypes.json', JSON.stringify(filteredResults.data), (err) => {
			if (err) {
				console.error('Error writing fragmentTypes file', err);
			} else {
				console.log('Fragment types successfully extracted!');
			}
		});
	});
});

