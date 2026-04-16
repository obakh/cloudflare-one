/**
 * Image Generation with Workers AI
 *
 * Generate images using Stable Diffusion and other models.
 *
 * @see https://developers.cloudflare.com/workers-ai/models/#text-to-image
 */

import type { AiBinding, ImageGenerationOptions, ImageModel } from "../types.js";

export { IMAGE_MODELS } from "../types.js";
export type { ImageGenerationOptions, ImageModel };

/**
 * Image generation response
 */
export interface ImageResponse {
	/** Raw image data as Uint8Array */
	data: Uint8Array;
	/** Content type (image/png) */
	contentType: string;
}

/**
 * Generate an image from a text prompt
 *
 * @example
 * ```ts
 * import { generateImage, IMAGE_MODELS } from "@repo/ai/image";
 *
 * const image = await generateImage(env.AI, {
 *   model: IMAGE_MODELS.STABLE_DIFFUSION_XL,
 *   prompt: "A futuristic city at sunset, cyberpunk style",
 *   negativePrompt: "blurry, low quality",
 *   width: 1024,
 *   height: 1024,
 * });
 *
 * // Return as response
 * return new Response(image.data, {
 *   headers: { "Content-Type": image.contentType },
 * });
 * ```
 */
export async function generateImage(
	ai: AiBinding,
	options: {
		model?: ImageModel;
		prompt: string;
	} & ImageGenerationOptions,
): Promise<ImageResponse> {
	const {
		model = "@cf/stabilityai/stable-diffusion-xl-base-1.0",
		prompt,
		negativePrompt,
		width,
		height,
		steps,
		guidance,
		seed,
	} = options;

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		prompt,
		negative_prompt: negativePrompt,
		width,
		height,
		num_steps: steps,
		guidance,
		seed,
	});

	// Response is a ReadableStream of image data
	const data = new Uint8Array(await new Response(response as ReadableStream).arrayBuffer());

	return {
		data,
		contentType: "image/png",
	};
}

/**
 * Generate image and return as base64 data URL
 *
 * @example
 * ```ts
 * import { generateImageBase64 } from "@repo/ai/image";
 *
 * const dataUrl = await generateImageBase64(env.AI, {
 *   prompt: "A cute robot",
 * });
 *
 * // Use in HTML: <img src={dataUrl} />
 * return Response.json({ image: dataUrl });
 * ```
 */
export async function generateImageBase64(
	ai: AiBinding,
	options: {
		model?: ImageModel;
		prompt: string;
	} & ImageGenerationOptions,
): Promise<string> {
	const image = await generateImage(ai, options);
	const base64 = btoa(String.fromCharCode(...image.data));
	return `data:${image.contentType};base64,${base64}`;
}

/**
 * Generate image with fast model (DreamShaper LCM)
 * Faster but lower quality than SDXL
 *
 * @example
 * ```ts
 * import { generateImageFast } from "@repo/ai/image";
 *
 * const image = await generateImageFast(env.AI, "A happy dog");
 * ```
 */
export async function generateImageFast(
	ai: AiBinding,
	prompt: string,
	options?: Omit<ImageGenerationOptions, "steps">,
): Promise<ImageResponse> {
	return generateImage(ai, {
		model: "@cf/lykon/dreamshaper-8-lcm",
		prompt,
		steps: 4, // LCM models work well with few steps
		...options,
	});
}

/**
 * Generate image with lightning-fast model (SDXL Lightning)
 * Very fast, good for real-time applications
 *
 * @example
 * ```ts
 * import { generateImageLightning } from "@repo/ai/image";
 *
 * const image = await generateImageLightning(env.AI, "Abstract art");
 * ```
 */
export async function generateImageLightning(
	ai: AiBinding,
	prompt: string,
	options?: Omit<ImageGenerationOptions, "steps">,
): Promise<ImageResponse> {
	return generateImage(ai, {
		model: "@cf/bytedance/stable-diffusion-xl-lightning",
		prompt,
		steps: 4,
		...options,
	});
}

/**
 * Generate multiple image variations
 *
 * @example
 * ```ts
 * import { generateVariations } from "@repo/ai/image";
 *
 * const images = await generateVariations(env.AI, {
 *   prompt: "A mountain landscape",
 *   count: 4,
 * });
 * ```
 */
export async function generateVariations(
	ai: AiBinding,
	options: {
		model?: ImageModel;
		prompt: string;
		count: number;
	} & ImageGenerationOptions,
): Promise<ImageResponse[]> {
	const { count, ...imageOptions } = options;

	// Generate with different seeds for variation
	const promises = Array.from({ length: count }, (_, i) =>
		generateImage(ai, {
			...imageOptions,
			seed: imageOptions.seed ? imageOptions.seed + i : Math.floor(Math.random() * 1000000) + i,
		}),
	);

	return Promise.all(promises);
}
