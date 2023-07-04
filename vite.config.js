import { sveltekit } from "@sveltejs/kit/vite";

import svg from "@poppanator/sveltekit-svg";
import svgoConfig from "./svgo.config.js";
import graphql from "@rollup/plugin-graphql";
import strip from "@rollup/plugin-strip";

const IS_DEV = process.env.NODE_ENV !== "production";

/** @type {import('vite').UserConfig} */
export default function ({ mode }) {
	return {
		optimizeDeps: {
			include: ["lodash.get", "lodash.isequal", "lodash.clonedeep"],
		},
		plugins: [
			sveltekit(),
			graphql(),
			svg({
				includePaths: ["src/lib/assets/svg/"],
				svgoOptions: svgoConfig,
			}),
			// Strip console.log and assert statements from production builds
			...(mode !== "development"
				? [
						strip({
							functions: ["console.log", "assert.*"],
							include: ["**/*.js", "**/*.svelte"],
						}),
				  ]
				: []),
		],
	};
}
