/**
 * Text Generation with Workers AI
 *
 * Generate text using LLMs like Llama, Mistral, Gemma, etc.
 *
 * @see https://developers.cloudflare.com/workers-ai/models/#text-generation
 */

import type {
	AiBinding,
	ChatMessage,
	TextGenerationOptions,
	TextGenerationResponse,
	TextModel,
} from "../types.js";

export { TEXT_MODELS } from "../types.js";
export type { ChatMessage, TextGenerationOptions, TextGenerationResponse, TextModel };

/**
 * Generate text from a prompt
 *
 * @example
 * ```ts
 * import { generateText, TEXT_MODELS } from "@repo/ai/text";
 *
 * const response = await generateText(env.AI, {
 *   model: TEXT_MODELS.LLAMA_3_1_8B,
 *   prompt: "Explain quantum computing in simple terms",
 * });
 *
 * console.log(response.response);
 * ```
 */
export async function generateText(
	ai: AiBinding,
	options: {
		model: TextModel;
		prompt: string;
	} & TextGenerationOptions,
): Promise<TextGenerationResponse> {
	const { model, prompt, maxTokens, temperature, topP, topK, repetitionPenalty, stop } = options;

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		prompt,
		max_tokens: maxTokens,
		temperature,
		top_p: topP,
		top_k: topK,
		repetition_penalty: repetitionPenalty,
		stop,
	});

	// Handle both response formats
	if (typeof response === "string") {
		return { response };
	}
	return response as TextGenerationResponse;
}

/**
 * Chat with an LLM using message history
 *
 * @example
 * ```ts
 * import { chat, TEXT_MODELS } from "@repo/ai/text";
 *
 * const response = await chat(env.AI, {
 *   model: TEXT_MODELS.LLAMA_3_1_8B,
 *   messages: [
 *     { role: "system", content: "You are a helpful coding assistant." },
 *     { role: "user", content: "How do I reverse a string in JavaScript?" },
 *   ],
 * });
 *
 * console.log(response.response);
 * ```
 */
export async function chat(
	ai: AiBinding,
	options: {
		model: TextModel;
		messages: ChatMessage[];
	} & TextGenerationOptions,
): Promise<TextGenerationResponse> {
	const { model, messages, maxTokens, temperature, topP, topK, repetitionPenalty, stop } = options;

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		messages,
		max_tokens: maxTokens,
		temperature,
		top_p: topP,
		top_k: topK,
		repetition_penalty: repetitionPenalty,
		stop,
	});

	if (typeof response === "string") {
		return { response };
	}
	return response as TextGenerationResponse;
}

/**
 * Stream text generation for real-time responses
 *
 * @example
 * ```ts
 * import { streamText, TEXT_MODELS } from "@repo/ai/text";
 *
 * const stream = await streamText(env.AI, {
 *   model: TEXT_MODELS.LLAMA_3_1_8B,
 *   messages: [
 *     { role: "user", content: "Write a short story about a robot." },
 *   ],
 * });
 *
 * // Return as SSE stream
 * return new Response(stream, {
 *   headers: { "Content-Type": "text/event-stream" },
 * });
 * ```
 */
export async function streamText(
	ai: AiBinding,
	options: {
		model: TextModel;
		messages: ChatMessage[];
	} & Omit<TextGenerationOptions, "stream">,
): Promise<ReadableStream> {
	const { model, messages, maxTokens, temperature, topP, topK, repetitionPenalty, stop } = options;

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		messages,
		max_tokens: maxTokens,
		temperature,
		top_p: topP,
		top_k: topK,
		repetition_penalty: repetitionPenalty,
		stop,
		stream: true,
	});

	return response as ReadableStream;
}

/**
 * Chat with vision model (image + text)
 *
 * @example
 * ```ts
 * import { chatWithVision, TEXT_MODELS } from "@repo/ai/text";
 *
 * const response = await chatWithVision(env.AI, {
 *   model: TEXT_MODELS.LLAMA_3_2_11B_VISION,
 *   messages: [
 *     { role: "user", content: "What's in this image?" },
 *   ],
 *   image: "data:image/png;base64,..." // or URL
 * });
 * ```
 */
export async function chatWithVision(
	ai: AiBinding,
	options: {
		model: TextModel;
		messages: ChatMessage[];
		image: string; // base64 data URL or URL
	} & TextGenerationOptions,
): Promise<TextGenerationResponse> {
	const { model, messages, image, maxTokens, temperature } = options;

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		messages,
		image,
		max_tokens: maxTokens,
		temperature,
	});

	if (typeof response === "string") {
		return { response };
	}
	return response as TextGenerationResponse;
}

/**
 * Generate SQL from natural language
 *
 * @example
 * ```ts
 * import { generateSQL } from "@repo/ai/text";
 *
 * const response = await generateSQL(env.AI, {
 *   question: "Show me all users who signed up last month",
 *   schema: `
 *     CREATE TABLE users (
 *       id INTEGER PRIMARY KEY,
 *       email TEXT,
 *       created_at TIMESTAMP
 *     );
 *   `,
 * });
 *
 * console.log(response.response); // SELECT * FROM users WHERE ...
 * ```
 */
export async function generateSQL(
	ai: AiBinding,
	options: {
		question: string;
		schema: string;
		model?: TextModel;
	},
): Promise<TextGenerationResponse> {
	const { question, schema, model = "@cf/defog/sqlcoder-7b-2" } = options;

	const prompt = `### Task
Generate a SQL query to answer the following question:
\`${question}\`

### Database Schema
${schema}

### SQL
`;

	return generateText(ai, { model, prompt });
}

/**
 * Generate code from natural language
 *
 * @example
 * ```ts
 * import { generateCode } from "@repo/ai/text";
 *
 * const response = await generateCode(env.AI, {
 *   instruction: "Write a function to validate email addresses",
 *   language: "typescript",
 * });
 * ```
 */
export async function generateCode(
	ai: AiBinding,
	options: {
		instruction: string;
		language?: string;
		model?: TextModel;
	},
): Promise<TextGenerationResponse> {
	const {
		instruction,
		language = "typescript",
		model = "@hf/thebloke/codellama-7b-instruct-awq",
	} = options;

	return chat(ai, {
		model,
		messages: [
			{
				role: "system",
				content: `You are an expert ${language} programmer. Write clean, well-documented code. Only output the code, no explanations.`,
			},
			{
				role: "user",
				content: instruction,
			},
		],
	});
}
