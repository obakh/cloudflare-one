/**
 * Cloudflare Images transformation utilities
 *
 * Transform images on-the-fly using Cloudflare's Image Resizing.
 *
 * @example Basic usage
 * ```ts
 * import { transformImage, createImageTransformer } from "@repo/media/images";
 *
 * // One-off transformation
 * const response = await transformImage(imageUrl, {
 *   width: 800,
 *   height: 600,
 *   fit: "cover",
 *   quality: 85,
 * });
 *
 * // Reusable transformer
 * const thumbnail = createImageTransformer({ width: 150, height: 150, fit: "cover" });
 * const response = await thumbnail.transform(imageUrl);
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type ImageFit = "scale-down" | "contain" | "cover" | "crop" | "pad";

export type ImageFormat = "avif" | "webp" | "json" | "jpeg" | "png";

export type ImageGravity =
	| "auto"
	| "left"
	| "right"
	| "top"
	| "bottom"
	| "center"
	| { x: number; y: number };

export interface ImageTransformOptions {
	/** Maximum width in pixels */
	width?: number | "auto";
	/** Maximum height in pixels */
	height?: number | "auto";
	/** Resizing mode */
	fit?: ImageFit;
	/** Output format */
	format?: ImageFormat | "auto";
	/** Quality 1-100 (default: 85) */
	quality?: number;
	/** Focus point for cropping */
	gravity?: ImageGravity;
	/** Device pixel ratio (1-3) */
	dpr?: number;
	/** Blur radius (1-250) */
	blur?: number;
	/** Brightness adjustment (-1 to 1) */
	brightness?: number;
	/** Contrast adjustment (-1 to 1) */
	contrast?: number;
	/** Rotation degrees (0, 90, 180, 270) */
	rotate?: 0 | 90 | 180 | 270;
	/** Sharpen amount (0-10) */
	sharpen?: number;
	/** Trim whitespace */
	trim?: { top?: number; right?: number; bottom?: number; left?: number };
	/** Background color for padding (hex) */
	background?: string;
	/** Strip metadata */
	metadata?: "keep" | "copyright" | "none";
	/** Animation handling */
	anim?: boolean;
}

export interface TransformResult {
	response: Response;
	contentType: string;
	width?: number;
	height?: number;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Transform an image using Cloudflare Image Resizing
 *
 * @example
 * ```ts
 * const response = await transformImage("https://example.com/image.jpg", {
 *   width: 800,
 *   fit: "scale-down",
 *   format: "auto",
 *   quality: 85,
 * });
 * ```
 */
export async function transformImage(
	imageUrl: string,
	options: ImageTransformOptions = {},
	requestInit?: RequestInit,
): Promise<Response> {
	const cfOptions = buildCfOptions(options);

	const request = new Request(imageUrl, {
		...requestInit,
		cf: { image: cfOptions },
	} as RequestInit);

	return fetch(request);
}

/**
 * Transform an image with automatic format negotiation
 *
 * @example
 * ```ts
 * export default {
 *   async fetch(request: Request) {
 *     const imageUrl = new URL(request.url).searchParams.get("url");
 *     return transformImageWithAccept(imageUrl, request, { width: 800 });
 *   }
 * };
 * ```
 */
export async function transformImageWithAccept(
	imageUrl: string,
	request: Request,
	options: Omit<ImageTransformOptions, "format"> = {},
): Promise<Response> {
	const accept = request.headers.get("Accept") || "";
	let format: ImageFormat | undefined;

	if (/image\/avif/.test(accept)) {
		format = "avif";
	} else if (/image\/webp/.test(accept)) {
		format = "webp";
	}

	return transformImage(imageUrl, { ...options, format });
}

/**
 * Build Cloudflare image options from our options
 */
function buildCfOptions(options: ImageTransformOptions): Record<string, unknown> {
	const cf: Record<string, unknown> = {};

	if (options.width !== undefined) cf.width = options.width;
	if (options.height !== undefined) cf.height = options.height;
	if (options.fit) cf.fit = options.fit;
	if (options.format) cf.format = options.format;
	if (options.quality !== undefined) cf.quality = options.quality;
	if (options.dpr !== undefined) cf.dpr = options.dpr;
	if (options.blur !== undefined) cf.blur = options.blur;
	if (options.brightness !== undefined) cf.brightness = options.brightness;
	if (options.contrast !== undefined) cf.contrast = options.contrast;
	if (options.rotate !== undefined) cf.rotate = options.rotate;
	if (options.sharpen !== undefined) cf.sharpen = options.sharpen;
	if (options.background) cf.background = options.background;
	if (options.metadata) cf.metadata = options.metadata;
	if (options.anim !== undefined) cf.anim = options.anim;

	if (options.gravity) {
		cf.gravity = typeof options.gravity === "object" ? options.gravity : options.gravity;
	}

	if (options.trim) {
		cf.trim = options.trim;
	}

	return cf;
}

// ============================================================================
// Image Transformer Factory
// ============================================================================

/**
 * Create a reusable image transformer with preset options
 *
 * @example
 * ```ts
 * const thumbnail = createImageTransformer({
 *   width: 150,
 *   height: 150,
 *   fit: "cover",
 *   quality: 80,
 * });
 *
 * const response = await thumbnail.transform("https://example.com/image.jpg");
 * ```
 */
export function createImageTransformer(defaultOptions: ImageTransformOptions) {
	return {
		/**
		 * Transform an image with the preset options
		 */
		async transform(
			imageUrl: string,
			overrides?: Partial<ImageTransformOptions>,
		): Promise<Response> {
			return transformImage(imageUrl, { ...defaultOptions, ...overrides });
		},

		/**
		 * Transform with Accept header negotiation
		 */
		async transformWithAccept(
			imageUrl: string,
			request: Request,
			overrides?: Partial<Omit<ImageTransformOptions, "format">>,
		): Promise<Response> {
			const options = { ...defaultOptions, ...overrides };
			delete (options as Record<string, unknown>).format;
			return transformImageWithAccept(imageUrl, request, options);
		},

		/**
		 * Get the preset options
		 */
		getOptions(): ImageTransformOptions {
			return { ...defaultOptions };
		},
	};
}

// ============================================================================
// Preset Transformers
// ============================================================================

/**
 * Common image transformation presets
 */
export const ImagePresets = {
	/** Small thumbnail (150x150) */
	thumbnail: createImageTransformer({
		width: 150,
		height: 150,
		fit: "cover",
		quality: 80,
	}),

	/** Avatar image (64x64) */
	avatar: createImageTransformer({
		width: 64,
		height: 64,
		fit: "cover",
		quality: 85,
	}),

	/** Card preview (400x300) */
	card: createImageTransformer({
		width: 400,
		height: 300,
		fit: "cover",
		quality: 85,
	}),

	/** Hero image (1200px wide) */
	hero: createImageTransformer({
		width: 1200,
		fit: "scale-down",
		quality: 85,
	}),

	/** Open Graph image (1200x630) */
	og: createImageTransformer({
		width: 1200,
		height: 630,
		fit: "cover",
		quality: 85,
	}),

	/** Mobile optimized (max 800px) */
	mobile: createImageTransformer({
		width: 800,
		fit: "scale-down",
		quality: 80,
		format: "auto",
	}),

	/** Retina display (2x DPR) */
	retina: createImageTransformer({
		dpr: 2,
		fit: "scale-down",
		quality: 85,
	}),
} as const;

// ============================================================================
// URL Builder
// ============================================================================

/**
 * Build a Cloudflare Images URL with transformations
 *
 * @example
 * ```ts
 * const url = buildImageUrl("https://example.com/image.jpg", {
 *   width: 800,
 *   format: "webp",
 * });
 * // Returns: /cdn-cgi/image/width=800,format=webp/https://example.com/image.jpg
 * ```
 */
export function buildImageUrl(imageUrl: string, options: ImageTransformOptions): string {
	const params: string[] = [];

	if (options.width !== undefined) params.push(`width=${options.width}`);
	if (options.height !== undefined) params.push(`height=${options.height}`);
	if (options.fit) params.push(`fit=${options.fit}`);
	if (options.format) params.push(`format=${options.format}`);
	if (options.quality !== undefined) params.push(`quality=${options.quality}`);
	if (options.dpr !== undefined) params.push(`dpr=${options.dpr}`);
	if (options.blur !== undefined) params.push(`blur=${options.blur}`);
	if (options.brightness !== undefined) params.push(`brightness=${options.brightness}`);
	if (options.contrast !== undefined) params.push(`contrast=${options.contrast}`);
	if (options.rotate !== undefined) params.push(`rotate=${options.rotate}`);
	if (options.sharpen !== undefined) params.push(`sharpen=${options.sharpen}`);
	if (options.background) params.push(`background=${options.background}`);
	if (options.metadata) params.push(`metadata=${options.metadata}`);

	if (options.gravity) {
		if (typeof options.gravity === "object") {
			params.push(`gravity=${options.gravity.x}x${options.gravity.y}`);
		} else {
			params.push(`gravity=${options.gravity}`);
		}
	}

	return `/cdn-cgi/image/${params.join(",")}/${imageUrl}`;
}

// ============================================================================
// Validation
// ============================================================================

const ALLOWED_EXTENSIONS = /\.(jpe?g|png|gif|webp|avif|svg)$/i;

/**
 * Validate an image URL
 */
export function isValidImageUrl(url: string): boolean {
	try {
		const { pathname } = new URL(url);
		return ALLOWED_EXTENSIONS.test(pathname);
	} catch {
		return false;
	}
}

/**
 * Validate image URL and throw if invalid
 */
export function validateImageUrl(url: string): void {
	if (!isValidImageUrl(url)) {
		throw new Error(`Invalid image URL: ${url}`);
	}
}
