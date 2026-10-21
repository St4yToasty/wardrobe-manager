// Photo handling in the browser: shrink to a stored original + a square-ish thumbnail,
// and read the dominant colour from the middle of the picture.

export type PreparedPhoto = {
	original: Blob;
	thumb: Blob;
	ext: string; // file extension matching the blobs' type
	contentType: string;
};

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
	if (typeof createImageBitmap === 'function') {
		try {
			return await createImageBitmap(file, { imageOrientation: 'from-image' });
		} catch {
			// fall through to <img>, which also covers formats only the browser's <img> can read
		}
	}
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		img.decoding = 'async';
		img.src = url;
		await img.decode();
		return img;
	} finally {
		URL.revokeObjectURL(url);
	}
}

function size(img: ImageBitmap | HTMLImageElement) {
	return 'naturalWidth' in img
		? { w: img.naturalWidth, h: img.naturalHeight }
		: { w: img.width, h: img.height };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
	return new Promise((res) => canvas.toBlob(res, type, quality));
}

async function render(
	img: ImageBitmap | HTMLImageElement,
	maxSide: number
): Promise<{ blob: Blob; type: string }> {
	const { w, h } = size(img);
	const scale = Math.min(1, maxSide / Math.max(w, h));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(w * scale);
	canvas.height = Math.round(h * scale);
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	// Some browsers silently ignore WebP and hand back PNG; fall back to JPEG then.
	const webp = await toBlob(canvas, 'image/webp', 0.85);
	if (webp && webp.type === 'image/webp') return { blob: webp, type: 'image/webp' };
	const jpeg = await toBlob(canvas, 'image/jpeg', 0.86);
	if (!jpeg) throw new Error('Could not encode the photo');
	return { blob: jpeg, type: 'image/jpeg' };
}

/** A 1600px original and a 480px thumbnail, both re-encoded (strips EXIF, fixes rotation). */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
	const img = await decode(file);
	const original = await render(img, 1600);
	const thumb = await render(img, 480);
	if ('close' in img) img.close();
	return {
		original: original.blob,
		thumb: thumb.blob,
		contentType: original.type,
		ext: original.type === 'image/webp' ? 'webp' : 'jpg'
	};
}

/** Average colour of the centre 40% of the photo, as [r, g, b]. */
export async function dominantRgb(file: Blob): Promise<[number, number, number] | null> {
	try {
		const img = await decode(file);
		const { w, h } = size(img);
		const canvas = document.createElement('canvas');
		canvas.width = 24;
		canvas.height = 24;
		const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
		ctx.drawImage(img, w * 0.3, h * 0.3, w * 0.4, h * 0.4, 0, 0, 24, 24);
		if ('close' in img) img.close();
		const d = ctx.getImageData(0, 0, 24, 24).data;
		let r = 0,
			g = 0,
			b = 0;
		const n = d.length / 4;
		for (let i = 0; i < d.length; i += 4) {
			r += d[i];
			g += d[i + 1];
			b += d[i + 2];
		}
		return [r / n, g / n, b / n];
	} catch {
		return null;
	}
}

function hexToRgb(h: string): [number, number, number] {
	const n = parseInt(h.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Closest palette colour, weighted by how the eye sees brightness. */
export function nearestColour<T extends { name: string; hex: string }>(
	rgb: [number, number, number],
	palette: T[]
): T | null {
	let best: T | null = null;
	let bd = Infinity;
	for (const c of palette) {
		const x = hexToRgb(c.hex);
		const d =
			(x[0] - rgb[0]) ** 2 * 0.3 + (x[1] - rgb[1]) ** 2 * 0.59 + (x[2] - rgb[2]) ** 2 * 0.11;
		if (d < bd) {
			bd = d;
			best = c;
		}
	}
	return best;
}
