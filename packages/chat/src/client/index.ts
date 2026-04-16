/**
 * Chat Client Utilities
 *
 * Client-side helpers for connecting to chat rooms.
 * Works in browsers and can be adapted for React/Vue/etc.
 *
 * Note: This module is designed for browser usage, not Workers.
 * Import from "@repo/chat/client" in your frontend code.
 */

import type { ChatMessage, ClientMessage, ServerMessage } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface ChatClientOptions {
	/** WebSocket URL */
	url: string;
	/** User's display name */
	name: string;
	/** Reconnect on disconnect (default: true) */
	autoReconnect?: boolean;
	/** Reconnect delay in ms (default: 1000) */
	reconnectDelay?: number;
	/** Maximum reconnect delay in ms (default: 30000) */
	maxReconnectDelay?: number;
	/** Called when connected */
	onConnect?: () => void;
	/** Called when disconnected */
	onDisconnect?: (code: number, reason: string) => void;
	/** Called when a message is received */
	onMessage?: (message: ChatMessage) => void;
	/** Called when a user joins */
	onUserJoin?: (name: string) => void;
	/** Called when a user leaves */
	onUserLeave?: (name: string) => void;
	/** Called when ready (after receiving history) */
	onReady?: () => void;
	/** Called on error */
	onError?: (error: string) => void;
	/** Called when roster updates */
	onRosterUpdate?: (users: string[]) => void;
}

export interface ChatClient {
	/** Connect to the chat room */
	connect(): void;
	/** Disconnect from the chat room */
	disconnect(): void;
	/** Send a message */
	send(message: string): void;
	/** Check if connected */
	isConnected(): boolean;
	/** Get current roster */
	getRoster(): string[];
}

// ============================================================================
// Chat Client
// ============================================================================

/**
 * Create a chat client
 *
 * @example Browser usage
 * ```ts
 * import { createChatClient } from "@repo/chat/client";
 *
 * const client = createChatClient({
 *   url: "wss://example.com/api/room/general/websocket",
 *   name: "Alice",
 *   onMessage: (msg) => console.log(`${msg.name}: ${msg.message}`),
 *   onUserJoin: (name) => console.log(`${name} joined`),
 *   onUserLeave: (name) => console.log(`${name} left`),
 * });
 *
 * client.connect();
 * client.send("Hello everyone!");
 * ```
 */
export function createChatClient(options: ChatClientOptions): ChatClient {
	const {
		url,
		name,
		autoReconnect = true,
		reconnectDelay = 1000,
		maxReconnectDelay = 30000,
		onConnect,
		onDisconnect,
		onMessage,
		onUserJoin,
		onUserLeave,
		onReady,
		onError,
		onRosterUpdate,
	} = options;

	let ws: any = null;
	let roster: string[] = [];
	let currentDelay = reconnectDelay;
	let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	let intentionalClose = false;

	function connect(): void {
		if (ws?.readyState === 1) return; // WebSocket.OPEN = 1

		intentionalClose = false;
		ws = new (globalThis as any).WebSocket(url);

		ws.onopen = () => {
			currentDelay = reconnectDelay;
			// Send join message
			ws?.send(JSON.stringify({ type: "join", name } as ClientMessage));
			onConnect?.();
		};

		ws.onmessage = (event: any) => {
			try {
				const data = JSON.parse(event.data) as ServerMessage;
				handleMessage(data);
			} catch {
				// Ignore parse errors
			}
		};

		ws.onclose = (event: any) => {
			ws = null;
			roster = [];
			onRosterUpdate?.(roster);
			onDisconnect?.(event.code, event.reason);

			if (autoReconnect && !intentionalClose) {
				scheduleReconnect();
			}
		};

		ws.onerror = () => {
			onError?.("WebSocket error");
		};
	}

	function handleMessage(data: ServerMessage): void {
		switch (data.type) {
			case "message":
				onMessage?.(data);
				break;

			case "join":
				if (!roster.includes(data.name)) {
					roster.push(data.name);
					onRosterUpdate?.(roster);
				}
				onUserJoin?.(data.name);
				break;

			case "leave":
				roster = roster.filter((n) => n !== data.name);
				onRosterUpdate?.(roster);
				onUserLeave?.(data.name);
				break;

			case "ready":
				onReady?.();
				break;

			case "error":
				onError?.(data.error);
				break;

			case "roster":
				roster = data.users;
				onRosterUpdate?.(roster);
				break;
		}
	}

	function scheduleReconnect(): void {
		if (reconnectTimeout) return;

		reconnectTimeout = setTimeout(() => {
			reconnectTimeout = null;
			connect();
			// Exponential backoff
			currentDelay = Math.min(currentDelay * 2, maxReconnectDelay);
		}, currentDelay);
	}

	function disconnect(): void {
		intentionalClose = true;
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		ws?.close(1000, "User disconnected");
		ws = null;
	}

	function send(message: string): void {
		if (ws?.readyState !== WebSocket.OPEN) {
			onError?.("Not connected");
			return;
		}
		ws.send(JSON.stringify({ type: "message", message } as ClientMessage));
	}

	function isConnected(): boolean {
		return ws?.readyState === 1; // WebSocket.OPEN = 1
	}

	function getRoster(): string[] {
		return [...roster];
	}

	return {
		connect,
		disconnect,
		send,
		isConnected,
		getRoster,
	};
}

// ============================================================================
// URL Helpers
// ============================================================================

/**
 * Build a WebSocket URL for a chat room
 */
export function buildChatUrl(baseUrl: string, roomName: string): string {
	const url = new URL(baseUrl);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	url.pathname = `/api/room/${encodeURIComponent(roomName)}/websocket`;
	return url.toString();
}

/**
 * Build a WebSocket URL from current location (browser only)
 */
export function buildChatUrlFromLocation(roomName: string): string {
	const loc = globalThis as unknown as { location: { protocol: string; host: string } };
	const protocol = loc.location.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${loc.location.host}/api/room/${encodeURIComponent(roomName)}/websocket`;
}

// ============================================================================
// React Hook (if React is available)
// ============================================================================

/**
 * React hook for chat (requires React)
 *
 * @example
 * ```tsx
 * import { useChatRoom } from "@repo/chat/client";
 *
 * function ChatRoom({ roomName, userName }) {
 *   const { messages, roster, send, isConnected } = useChatRoom({
 *     url: buildChatUrlFromLocation(roomName),
 *     name: userName,
 *   });
 *
 *   return (
 *     <div>
 *       <div>{roster.join(", ")}</div>
 *       <div>
 *         {messages.map((m, i) => (
 *           <p key={i}><b>{m.name}:</b> {m.message}</p>
 *         ))}
 *       </div>
 *       <input onKeyDown={(e) => {
 *         if (e.key === "Enter") {
 *           send(e.currentTarget.value);
 *           e.currentTarget.value = "";
 *         }
 *       }} />
 *     </div>
 *   );
 * }
 * ```
 */
export interface UseChatRoomOptions {
	url: string;
	name: string;
	maxMessages?: number;
}

export interface UseChatRoomResult {
	messages: ChatMessage[];
	roster: string[];
	send: (message: string) => void;
	isConnected: boolean;
	error: string | null;
}

// Note: This is a type-only export for documentation
// Actual implementation requires React and should be in a separate file
export type UseChatRoom = (options: UseChatRoomOptions) => UseChatRoomResult;
