<script>
	import {breakpoints} from "$lib/util/breakpoints";
	import {buildSourceSet, ratioImage, arToNumeric} from "$lib/util/media";

	/**
	 * Image url
	 * @type string
	 */
	export let url;

	/**
	 * Original image width
	 * @type {number}
	 */
	export let width = 0;

	/**
	 * Original image height
	 * @type {number}
	 */
	export let height = 0;

	/**
	 * Image vw settings
	 * @type {number|{}}
	 */
	export let vw = 33;

	/**
	 * Image alt tag
	 * @type {null|string}
	 */
	export let alt = null;

	/**
	 * The image ratio as a string (X:Y)
	 * @type {string}
	 */
	export let ratio = '3:2';

	/**
	 * The blurred image
	 * @type {null|string}
	 */
	export let blurred = null;

	// TODO: Be slightly more intelligent about max width?
	let srcset = buildSourceSet({url, ratio, max: Math.min(2000, Math.max(400, width))}).join(", ");
	let src = ratioImage(url, ratio, 600);
	let numericRatio = arToNumeric(ratio);

	let blurredStyle, img, sizes;
	let isLoaded = false;

	const buildVw = cfg =>
		Object.keys(breakpoints).reduce((arr, device) => {
			if (device in cfg) {
				arr.push(`${breakpoints[device]} ${cfg[device]}vw`);
			}
			return arr;
		}, cfg.default ? [`${cfg.default}vw`] : []).reverse().join(", ");

	if (blurred) {
		blurredStyle = `background-image: url(${blurred});`;
	}

	$: if(img) {
		isLoaded = !!(img.complete && img.naturalWidth);
		if (!isLoaded) {
			img.onload = () => {
				if (img && img.complete) {
					isLoaded = true;
					img.onload = null;
				}
			};
		}
	}

	$: if (vw) {
		sizes = typeof vw === 'number' ? `${vw}vw` : buildVw(vw);
	}
</script>
<style lang="scss" src="./Image.scss"></style>

<figure class="Image" class:Image--loaded={isLoaded} style="--aspect-ratio:{numericRatio}; {blurredStyle}">
	<img class="Image__img" bind:this={img} {sizes} {src} {srcset} {alt} loading="lazy"/>
</figure>
