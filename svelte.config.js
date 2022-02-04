import {resolve} from 'path';
import preprocess from 'svelte-preprocess';

import svg from '@poppanator/sveltekit-svg';
import svgoConfig from './svgo.config.js';
import graphql from '@rollup/plugin-graphql';
import adapter from '@sveltejs/adapter-netlify';
import strip from "@rollup/plugin-strip";

const IS_DEV = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		scss: {
			includePaths: ['src/scss', resolve('./node_modules')]
		},
		postcss: true
	}),
	kit: {
		vite: {
			plugins: [
				graphql(),
				svg({
					svgoOptions: svgoConfig
				}),
				// Strip console.log and assert statements from production builds
				...(!IS_DEV ? [
					strip({
						functions: [ 'console.log', 'assert.*' ],
						include: ['**/*.js', '**/*.svelte']
					})
				] : [])
			],
		},
		adapter: adapter()
	}
};

export default config;
