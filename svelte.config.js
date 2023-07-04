import {resolve} from 'path';
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		scss: {
			includePaths: ['src/scss', resolve('./node_modules')]
		},
		postcss: true
	}),
	kit: {
		adapter: adapter(),
	}
};

export default config;
