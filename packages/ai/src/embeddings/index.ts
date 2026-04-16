/**
 * Text Embeddings with Workers AI
 *
 * Generate vector embeddings for semantic search, RAG, etc.
 *
 * @see https://developers.cloudflare.com/workers-ai/models/#text-embeddings
 */

import type { AiBinding, EmbeddingModel, EmbeddingResponse } from "../types.js";

export { EMBEDDING_MODELS } from "../types.js";
export type { EmbeddingModel, EmbeddingResponse };

/**
 * Generate embeddings for text
 *
 * @example
 * ```ts
 * import { generateEmbeddings, EMBEDDING_MODELS } from "@repo/ai/embeddings";
 *
 * // Single text
 * const embedding = await generateEmbeddings(env.AI, {
 *   model: EMBEDDING_MODELS.BGE_BASE_EN,
 *   text: "Hello world",
 * });
 *
 * console.log(embedding.data[0]); // [0.123, -0.456, ...]
 *
 * // Multiple texts (batch)
 * const embeddings = await generateEmbeddings(env.AI, {
 *   model: EMBEDDING_MODELS.BGE_BASE_EN,
 *   text: ["Hello", "World", "Foo"],
 * });
 *
 * console.log(embeddings.data.length); // 3
 * ```
 */
export async function generateEmbeddings(
	ai: AiBinding,
	options: {
		model?: EmbeddingModel;
		text: string | string[];
	},
): Promise<EmbeddingResponse> {
	const { model = "@cf/baai/bge-base-en-v1.5", text } = options;

	const input = Array.isArray(text) ? text : [text];

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		text: input,
	});

	return response as EmbeddingResponse;
}

/**
 * Generate a single embedding vector
 *
 * @example
 * ```ts
 * import { embed } from "@repo/ai/embeddings";
 *
 * const vector = await embed(env.AI, "Hello world");
 * // Use with Vectorize
 * await env.VECTORIZE.insert([{ id: "1", values: vector }]);
 * ```
 */
export async function embed(
	ai: AiBinding,
	text: string,
	model?: EmbeddingModel,
): Promise<number[]> {
	const response = await generateEmbeddings(ai, { model, text });
	return response.data[0];
}

/**
 * Generate embeddings for multiple texts (batch)
 *
 * @example
 * ```ts
 * import { embedBatch } from "@repo/ai/embeddings";
 *
 * const texts = ["Document 1", "Document 2", "Document 3"];
 * const vectors = await embedBatch(env.AI, texts);
 *
 * // Use with Vectorize
 * const records = texts.map((_, i) => ({
 *   id: `doc-${i}`,
 *   values: vectors[i],
 * }));
 * await env.VECTORIZE.insert(records);
 * ```
 */
export async function embedBatch(
	ai: AiBinding,
	texts: string[],
	model?: EmbeddingModel,
): Promise<number[][]> {
	const response = await generateEmbeddings(ai, { model, text: texts });
	return response.data;
}

/**
 * Calculate cosine similarity between two vectors
 *
 * @example
 * ```ts
 * import { embed, cosineSimilarity } from "@repo/ai/embeddings";
 *
 * const vec1 = await embed(env.AI, "Hello world");
 * const vec2 = await embed(env.AI, "Hi there");
 *
 * const similarity = cosineSimilarity(vec1, vec2);
 * console.log(similarity); // 0.85 (high similarity)
 * ```
 */
export function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length !== b.length) {
		throw new Error("Vectors must have the same length");
	}

	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i++) {
		dotProduct += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}

	return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most similar texts using embeddings
 *
 * @example
 * ```ts
 * import { findSimilar } from "@repo/ai/embeddings";
 *
 * const documents = [
 *   "The quick brown fox",
 *   "A lazy dog sleeps",
 *   "JavaScript is awesome",
 *   "TypeScript adds types",
 * ];
 *
 * const results = await findSimilar(env.AI, {
 *   query: "programming languages",
 *   documents,
 *   topK: 2,
 * });
 *
 * // Returns: [
 * //   { index: 2, text: "JavaScript is awesome", score: 0.82 },
 * //   { index: 3, text: "TypeScript adds types", score: 0.79 },
 * // ]
 * ```
 */
export async function findSimilar(
	ai: AiBinding,
	options: {
		query: string;
		documents: string[];
		topK?: number;
		model?: EmbeddingModel;
	},
): Promise<Array<{ index: number; text: string; score: number }>> {
	const { query, documents, topK = 5, model } = options;

	// Generate embeddings for query and all documents
	const [queryEmbedding, docEmbeddings] = await Promise.all([
		embed(ai, query, model),
		embedBatch(ai, documents, model),
	]);

	// Calculate similarities
	const similarities = docEmbeddings.map((docVec, index) => ({
		index,
		text: documents[index],
		score: cosineSimilarity(queryEmbedding, docVec),
	}));

	// Sort by similarity and return top K
	return similarities.sort((a, b) => b.score - a.score).slice(0, topK);
}
