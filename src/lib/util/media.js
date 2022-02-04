export const ratios = {
	narrow: "7:10",
	portrait: "7:9",
	landscape: "5:4",
	wide: "3:2"
}

export const ratioQuery = (ratio, w) => {
	const params = new URLSearchParams();
	params.set('w', w);
	params.set('auto', 'format,compress');
	if (ratio.match(/^\d+:\d+/)) {
		params.set('fit', 'crop');
		params.set('ar', ratio);
		params.set('crop', 'entropy');
	} else {
		params.set('fit', 'clip');
	}
	return params;
}

export const ratioImage = (url, ratio, w) => {
	const params = ratioQuery(ratio, w);
	return `${url.split('?')[0]}?${params.toString()}`;
}

export const buildSourceSet = ({
	url,
	ratio,
	min = 400,
	max = 2000,
	step = 200
}) => {
	return Array.from(new Array(Math.floor((max - min) / step) + 1)).map((v,i) => {
		const w = Math.min(max, min + step * i)
		return `${ratioImage(url, ratio, w)} ${w}w`;
	})
}


export const arToNumeric = ar => {
	const matches = ar.match(/^(\d+):(\d+)$/);
	return matches ? matches[1] / matches[2] : NaN;
}
