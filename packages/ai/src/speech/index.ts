/**
 * Speech Recognition with Workers AI
 *
 * Transcribe audio using Whisper models.
 *
 * @see https://developers.cloudflare.com/workers-ai/models/#automatic-speech-recognition
 */

import type { AiBinding, SpeechModel, TranscriptionResponse } from "../types.js";

export { SPEECH_MODELS } from "../types.js";
export type { SpeechModel, TranscriptionResponse };

/**
 * Transcribe audio to text
 *
 * @example
 * ```ts
 * import { transcribe, SPEECH_MODELS } from "@repo/ai/speech";
 *
 * // From request body
 * const audioData = await request.arrayBuffer();
 * const result = await transcribe(env.AI, {
 *   audio: audioData,
 * });
 *
 * console.log(result.text);
 * console.log(result.vtt); // WebVTT subtitles
 * ```
 */
export async function transcribe(
	ai: AiBinding,
	options: {
		model?: SpeechModel;
		audio: ArrayBuffer | Uint8Array;
	},
): Promise<TranscriptionResponse> {
	const { model = "@cf/openai/whisper", audio } = options;

	const audioArray = audio instanceof ArrayBuffer ? [...new Uint8Array(audio)] : [...audio];

	const response = await ai.run(model as Parameters<typeof ai.run>[0], {
		audio: audioArray,
	});

	return response as TranscriptionResponse;
}

/**
 * Transcribe audio from URL
 *
 * @example
 * ```ts
 * import { transcribeFromUrl } from "@repo/ai/speech";
 *
 * const result = await transcribeFromUrl(env.AI, {
 *   url: "https://example.com/audio.mp3",
 * });
 *
 * console.log(result.text);
 * ```
 */
export async function transcribeFromUrl(
	ai: AiBinding,
	options: {
		model?: SpeechModel;
		url: string;
	},
): Promise<TranscriptionResponse> {
	const { url, model } = options;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch audio: ${response.status}`);
	}

	const audio = await response.arrayBuffer();
	return transcribe(ai, { model, audio });
}

/**
 * Transcribe audio with timestamps
 * Returns word-level timing information
 *
 * @example
 * ```ts
 * import { transcribeWithTimestamps } from "@repo/ai/speech";
 *
 * const result = await transcribeWithTimestamps(env.AI, audioData);
 *
 * for (const word of result.words) {
 *   console.log(`${word.word}: ${word.start}s - ${word.end}s`);
 * }
 * ```
 */
export async function transcribeWithTimestamps(
	ai: AiBinding,
	audio: ArrayBuffer | Uint8Array,
	model?: SpeechModel,
): Promise<TranscriptionResponse> {
	// Whisper returns timestamps by default
	return transcribe(ai, { model, audio });
}

/**
 * Generate WebVTT subtitles from audio
 *
 * @example
 * ```ts
 * import { generateSubtitles } from "@repo/ai/speech";
 *
 * const vtt = await generateSubtitles(env.AI, audioData);
 *
 * return new Response(vtt, {
 *   headers: { "Content-Type": "text/vtt" },
 * });
 * ```
 */
export async function generateSubtitles(
	ai: AiBinding,
	audio: ArrayBuffer | Uint8Array,
	model?: SpeechModel,
): Promise<string> {
	const result = await transcribe(ai, { model, audio });
	return result.vtt || generateVTT(result);
}

/**
 * Generate VTT from transcription response
 */
function generateVTT(result: TranscriptionResponse): string {
	if (!result.words || result.words.length === 0) {
		return `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n${result.text}`;
	}

	let vtt = "WEBVTT\n\n";
	const words = result.words;

	// Group words into segments (roughly 5-7 words each)
	const segmentSize = 6;
	for (let i = 0; i < words.length; i += segmentSize) {
		const segment = words.slice(i, i + segmentSize);
		const start = formatTime(segment[0].start);
		const end = formatTime(segment[segment.length - 1].end);
		const text = segment.map((w) => w.word).join(" ");

		vtt += `${start} --> ${end}\n${text}\n\n`;
	}

	return vtt;
}

function formatTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	const ms = Math.floor((seconds % 1) * 1000);

	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}
