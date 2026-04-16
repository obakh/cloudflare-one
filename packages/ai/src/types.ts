/**
 * Shared types for Workers AI
 */

/**
 * Workers AI binding from environment
 */
export type AiBinding = Ai;

/**
 * Chat message format for text generation
 */
export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

/**
 * Text generation options
 */
export interface TextGenerationOptions {
	/** Maximum tokens to generate */
	maxTokens?: number;
	/** Temperature (0-2, lower = more deterministic) */
	temperature?: number;
	/** Top-p sampling */
	topP?: number;
	/** Top-k sampling */
	topK?: number;
	/** Repetition penalty */
	repetitionPenalty?: number;
	/** Stop sequences */
	stop?: string[];
	/** Enable streaming response */
	stream?: boolean;
}

/**
 * Text generation response
 */
export interface TextGenerationResponse {
	response: string;
}

/**
 * Streaming text generation response
 */
export interface StreamingTextResponse {
	response: string;
}

/**
 * Embedding response
 */
export interface EmbeddingResponse {
	shape: number[];
	data: number[][];
}

/**
 * Image generation options
 */
export interface ImageGenerationOptions {
	/** Negative prompt (what to avoid) */
	negativePrompt?: string;
	/** Image width */
	width?: number;
	/** Image height */
	height?: number;
	/** Number of inference steps */
	steps?: number;
	/** Guidance scale */
	guidance?: number;
	/** Random seed for reproducibility */
	seed?: number;
}

/**
 * Speech transcription response
 */
export interface TranscriptionResponse {
	text: string;
	word_count?: number;
	vtt?: string;
	words?: Array<{
		word: string;
		start: number;
		end: number;
	}>;
}

/**
 * Image classification result
 */
export interface ClassificationResult {
	label: string;
	score: number;
}

/**
 * Object detection result
 */
export interface ObjectDetectionResult {
	label: string;
	score: number;
	box: {
		xmin: number;
		ymin: number;
		xmax: number;
		ymax: number;
	};
}

/**
 * Translation response
 */
export interface TranslationResponse {
	translated_text: string;
}

/**
 * Summarization response
 */
export interface SummarizationResponse {
	summary: string;
}

// Popular model identifiers
export const TEXT_MODELS = {
	// Meta Llama
	LLAMA_3_1_8B: "@cf/meta/llama-3.1-8b-instruct",
	LLAMA_3_8B: "@cf/meta/llama-3-8b-instruct",
	LLAMA_3_2_3B: "@cf/meta/llama-3.2-3b-instruct",
	LLAMA_3_2_1B: "@cf/meta/llama-3.2-1b-instruct",
	// Vision
	LLAMA_3_2_11B_VISION: "@cf/meta/llama-3.2-11b-vision-instruct",
	// Mistral
	MISTRAL_7B: "@cf/mistral/mistral-7b-instruct-v0.1",
	// Google
	GEMMA_7B: "@hf/google/gemma-7b-it",
	// Qwen
	QWEN_1_5_7B: "@cf/qwen/qwen1.5-7b-chat-awq",
	QWEN_1_5_14B: "@cf/qwen/qwen1.5-14b-chat-awq",
	// DeepSeek
	DEEPSEEK_CODER_6_7B: "@hf/thebloke/deepseek-coder-6.7b-instruct-awq",
	// Code Llama
	CODE_LLAMA_7B: "@hf/thebloke/codellama-7b-instruct-awq",
	// SQL
	SQLCODER_7B: "@cf/defog/sqlcoder-7b-2",
} as const;

export const EMBEDDING_MODELS = {
	BGE_BASE_EN: "@cf/baai/bge-base-en-v1.5",
	BGE_LARGE_EN: "@cf/baai/bge-large-en-v1.5",
	BGE_SMALL_EN: "@cf/baai/bge-small-en-v1.5",
	BGE_M3: "@cf/baai/bge-m3",
} as const;

export const IMAGE_MODELS = {
	STABLE_DIFFUSION_XL: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
	DREAMSHAPER_8: "@cf/lykon/dreamshaper-8-lcm",
	STABLE_DIFFUSION_XL_LIGHTNING: "@cf/bytedance/stable-diffusion-xl-lightning",
} as const;

export const SPEECH_MODELS = {
	WHISPER: "@cf/openai/whisper",
	WHISPER_TINY: "@cf/openai/whisper-tiny-en",
} as const;

export const CLASSIFICATION_MODELS = {
	RESNET_50: "@cf/microsoft/resnet-50",
} as const;

export const OBJECT_DETECTION_MODELS = {
	DETR_RESNET_50: "@cf/facebook/detr-resnet-50",
} as const;

export const TRANSLATION_MODELS = {
	M2M100: "@cf/meta/m2m100-1.2b",
} as const;

export const SUMMARIZATION_MODELS = {
	BART_LARGE_CNN: "@cf/facebook/bart-large-cnn",
} as const;

export type TextModel = (typeof TEXT_MODELS)[keyof typeof TEXT_MODELS] | string;
export type EmbeddingModel = (typeof EMBEDDING_MODELS)[keyof typeof EMBEDDING_MODELS] | string;
export type ImageModel = (typeof IMAGE_MODELS)[keyof typeof IMAGE_MODELS] | string;
export type SpeechModel = (typeof SPEECH_MODELS)[keyof typeof SPEECH_MODELS] | string;
export type ClassificationModel =
	| (typeof CLASSIFICATION_MODELS)[keyof typeof CLASSIFICATION_MODELS]
	| string;
