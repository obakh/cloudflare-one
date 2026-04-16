/**
 * Image Classification & Object Detection with Workers AI
 *
 * Classify images and detect objects using vision models.
 *
 * @see https://developers.cloudflare.com/workers-ai/models/#image-classification
 */

import type {
	AiBinding,
	ClassificationModel,
	ClassificationResult,
	ObjectDetectionResult,
	SummarizationResponse,
	TranslationResponse,
} from "../types.js";

export {
	CLASSIFICATION_MODELS,
	OBJECT_DETECTION_MODELS,
	SUMMARIZATION_MODELS,
	TRANSLATION_MODELS,
} from "../types.js";

export type {
	ClassificationModel,
	ClassificationResult,
	ObjectDetectionResult,
	TranslationResponse,
	SummarizationResponse,
};

/**
 * Classify an image
 *
 * @example
 * ```ts
 * import { classifyImage, CLASSIFICATION_MODELS } from "@repo/ai/classification";
 *
 * const imageData = await request.arrayBuffer();
 * const results = await classifyImage(env.AI, {
 *   image: imageData,
 * });
 *
 * console.log(results[0].label); // "golden retriever"
 * console.log(results[0].score); // 0.95
 * ```
 */
export async function classifyImage(
	ai: AiBinding,
	options: {
		model?: ClassificationModel;
		image: ArrayBuffer | Uint8Array;
	},
): Promise<ClassificationResult[]> {
	const { model = "@cf/microsoft/resnet-50", image } = options;

	const imageArray = image instanceof ArrayBuffer ? [...new Uint8Array(image)] : [...image];

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		image: imageArray,
	});

	return response as ClassificationResult[];
}

/**
 * Classify image from URL
 *
 * @example
 * ```ts
 * import { classifyImageFromUrl } from "@repo/ai/classification";
 *
 * const results = await classifyImageFromUrl(env.AI, {
 *   url: "https://example.com/cat.jpg",
 * });
 * ```
 */
export async function classifyImageFromUrl(
	ai: AiBinding,
	options: {
		model?: ClassificationModel;
		url: string;
	},
): Promise<ClassificationResult[]> {
	const { url, model } = options;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.status}`);
	}

	const image = await response.arrayBuffer();
	return classifyImage(ai, { model, image });
}

/**
 * Detect objects in an image
 *
 * @example
 * ```ts
 * import { detectObjects, OBJECT_DETECTION_MODELS } from "@repo/ai/classification";
 *
 * const results = await detectObjects(env.AI, {
 *   image: imageData,
 * });
 *
 * for (const obj of results) {
 *   console.log(`${obj.label} at (${obj.box.xmin}, ${obj.box.ymin})`);
 * }
 * ```
 */
export async function detectObjects(
	ai: AiBinding,
	options: {
		model?: string;
		image: ArrayBuffer | Uint8Array;
	},
): Promise<ObjectDetectionResult[]> {
	const { model = "@cf/facebook/detr-resnet-50", image } = options;

	const imageArray = image instanceof ArrayBuffer ? [...new Uint8Array(image)] : [...image];

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		image: imageArray,
	});

	return response as ObjectDetectionResult[];
}

/**
 * Translate text between languages
 *
 * @example
 * ```ts
 * import { translate, TRANSLATION_MODELS } from "@repo/ai/classification";
 *
 * const result = await translate(env.AI, {
 *   text: "Hello, how are you?",
 *   sourceLang: "en",
 *   targetLang: "es",
 * });
 *
 * console.log(result.translated_text); // "Hola, ¿cómo estás?"
 * ```
 */
export async function translate(
	ai: AiBinding,
	options: {
		model?: string;
		text: string;
		sourceLang: string;
		targetLang: string;
	},
): Promise<TranslationResponse> {
	const { model = "@cf/meta/m2m100-1.2b", text, sourceLang, targetLang } = options;

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		text,
		source_lang: sourceLang,
		target_lang: targetLang,
	});

	return response as TranslationResponse;
}

/**
 * Summarize text
 *
 * @example
 * ```ts
 * import { summarize, SUMMARIZATION_MODELS } from "@repo/ai/classification";
 *
 * const result = await summarize(env.AI, {
 *   text: longArticle,
 *   maxLength: 150,
 * });
 *
 * console.log(result.summary);
 * ```
 */
export async function summarize(
	ai: AiBinding,
	options: {
		model?: string;
		text: string;
		maxLength?: number;
	},
): Promise<SummarizationResponse> {
	const { model = "@cf/facebook/bart-large-cnn", text, maxLength } = options;

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		input_text: text,
		max_length: maxLength,
	});

	return response as SummarizationResponse;
}

/**
 * Get top classification result
 *
 * @example
 * ```ts
 * import { getTopClass } from "@repo/ai/classification";
 *
 * const top = await getTopClass(env.AI, imageData);
 * console.log(`This is a ${top.label} (${(top.score * 100).toFixed(1)}% confident)`);
 * ```
 */
export async function getTopClass(
	ai: AiBinding,
	image: ArrayBuffer | Uint8Array,
	model?: ClassificationModel,
): Promise<ClassificationResult> {
	const results = await classifyImage(ai, { model, image });
	return results[0];
}
