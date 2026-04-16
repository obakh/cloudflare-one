/**
 * @repo/ai - Cloudflare Workers AI
 *
 * Run machine learning models on Cloudflare's global network.
 * Supports text generation, embeddings, image generation, speech recognition, and more.
 *
 * @see https://developers.cloudflare.com/workers-ai/
 *
 * @example Server-side text generation
 * ```ts
 * import { chat, TEXT_MODELS } from "@repo/ai/text";
 *
 * const response = await chat(env.AI, {
 *   model: TEXT_MODELS.LLAMA_3_1_8B,
 *   messages: [
 *     { role: "user", content: "Hello!" },
 *   ],
 * });
 * ```
 *
 * @example Client-side React hooks
 * ```tsx
 * import { useChat, useCompletion } from "@repo/ai/client";
 *
 * // Chat interface
 * const { messages, input, handleSubmit } = useChat({ api: "/api/chat" });
 *
 * // Text completion
 * const { completion, complete } = useCompletion({ api: "/api/complete" });
 * ```
 *
 * @example Cloudflare Agents
 * ```tsx
 * import { useAgent, useAgentChat } from "@repo/ai/client";
 *
 * const agent = useAgent({ agent: "ChatAgent", name: "session-123" });
 * const { messages, handleSubmit } = useAgentChat({ agent });
 * ```
 *
 * @example Embeddings
 * ```ts
 * import { embed } from "@repo/ai/embeddings";
 *
 * const vector = await embed(env.AI, "Hello world");
 * ```
 *
 * @example Image generation
 * ```ts
 * import { generateImage } from "@repo/ai/image";
 *
 * const image = await generateImage(env.AI, {
 *   prompt: "A sunset over mountains",
 * });
 * ```
 */

// Classification & other models
export {
	classifyImage,
	classifyImageFromUrl,
	detectObjects,
	getTopClass,
	summarize,
	translate,
} from "./classification/index.js";
// Embeddings
export {
	cosineSimilarity,
	embed,
	embedBatch,
	findSimilar,
	generateEmbeddings,
} from "./embeddings/index.js";
// Image generation
export {
	generateImage,
	generateImageBase64,
	generateImageFast,
	generateImageLightning,
	generateVariations,
	type ImageResponse,
} from "./image/index.js";
// Speech recognition
export {
	generateSubtitles,
	transcribe,
	transcribeFromUrl,
	transcribeWithTimestamps,
} from "./speech/index.js";
// Text generation
export {
	chat,
	chatWithVision,
	generateCode,
	generateSQL,
	generateText,
	streamText,
} from "./text/index.js";
// Types
export type {
	AiBinding,
	ChatMessage,
	ClassificationModel,
	ClassificationResult,
	EmbeddingModel,
	EmbeddingResponse,
	ImageGenerationOptions,
	ImageModel,
	ObjectDetectionResult,
	SpeechModel,
	SummarizationResponse,
	TextGenerationOptions,
	TextGenerationResponse,
	TextModel,
	TranscriptionResponse,
	TranslationResponse,
} from "./types.js";
// Model constants
export {
	CLASSIFICATION_MODELS,
	EMBEDDING_MODELS,
	IMAGE_MODELS,
	OBJECT_DETECTION_MODELS,
	SPEECH_MODELS,
	SUMMARIZATION_MODELS,
	TEXT_MODELS,
	TRANSLATION_MODELS,
} from "./types.js";
