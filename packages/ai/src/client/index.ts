/**
 * @repo/ai/client - Client-side AI hooks for React
 *
 * Re-exports from Vercel AI SDK and Cloudflare Agents SDK for use in React components.
 * This provides a unified import path for AI functionality in the browser.
 *
 * @example Using completion hook
 * ```tsx
 * import { useCompletion } from "@repo/ai/client";
 *
 * function Editor() {
 *   const { completion, complete, isLoading } = useCompletion({
 *     api: "/api/ai/complete",
 *   });
 *
 *   return <div>{completion}</div>;
 * }
 * ```
 *
 * @example Using chat hook
 * ```tsx
 * import { useChat } from "@repo/ai/client";
 *
 * function Chat() {
 *   const { messages, input, handleInputChange, handleSubmit } = useChat({
 *     api: "/api/ai/chat",
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input value={input} onChange={handleInputChange} />
 *     </form>
 *   );
 * }
 * ```
 *
 * @example Using Cloudflare Agents
 * ```tsx
 * import { useAgent, useAgentChat } from "@repo/ai/client";
 *
 * function AgentChat() {
 *   const agent = useAgent({
 *     agent: "ChatAgent",
 *     name: "session-123",
 *   });
 *
 *   const { messages, handleSubmit } = useAgentChat({ agent });
 *
 *   return <div>...</div>;
 * }
 * ```
 */

// ============================================================================
// Vercel AI SDK - React Hooks
// ============================================================================

// Types
export type {
	CreateUIMessage,
	UIMessage,
	UseChatOptions,
	UseCompletionOptions,
} from "@ai-sdk/react";
// Core hooks for AI interactions
export {
	useChat,
	useCompletion,
} from "@ai-sdk/react";

// ============================================================================
// Cloudflare Agents SDK - React Hooks
// ============================================================================

export { useAgentChat } from "agents/ai-react";
// Types from agents
export type { UseAgentOptions } from "agents/react";
// Agent connection and chat hooks
export { useAgent } from "agents/react";

// ============================================================================
// Shared Types
// ============================================================================

/**
 * AI Provider configuration
 */
export type AIProvider = "vercel" | "cloudflare-agents";

/**
 * Common message format (compatible with both SDKs)
 */
export interface AIMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	createdAt?: Date;
}

/**
 * Completion options that work with both providers
 */
export interface CompletionOptions {
	/** API endpoint for completions */
	api?: string;
	/** Initial prompt */
	initialInput?: string;
	/** Callback when completion finishes */
	onFinish?: (completion: string) => void;
	/** Callback on error */
	onError?: (error: Error) => void;
}

/**
 * Chat options that work with both providers
 */
export interface ChatOptions {
	/** API endpoint for chat */
	api?: string;
	/** Initial messages */
	initialMessages?: AIMessage[];
	/** Callback when response finishes */
	onFinish?: (message: AIMessage) => void;
	/** Callback on error */
	onError?: (error: Error) => void;
}
