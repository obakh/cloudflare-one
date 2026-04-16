/**
 * Chat package types
 */

// ============================================================================
// Message Types
// ============================================================================

export interface ChatMessage {
	/** Message type */
	type: "message";
	/** Sender name */
	name: string;
	/** Message content */
	message: string;
	/** Timestamp (ms since epoch) */
	timestamp: number;
}

export interface JoinMessage {
	type: "join";
	name: string;
}

export interface LeaveMessage {
	type: "leave";
	name: string;
}

export interface ErrorMessage {
	type: "error";
	error: string;
}

export interface ReadyMessage {
	type: "ready";
}

export interface RosterMessage {
	type: "roster";
	users: string[];
}

export type ServerMessage =
	| ChatMessage
	| JoinMessage
	| LeaveMessage
	| ErrorMessage
	| ReadyMessage
	| RosterMessage;

// ============================================================================
// Client Message Types
// ============================================================================

export interface ClientJoinMessage {
	type: "join";
	name: string;
}

export interface ClientChatMessage {
	type: "message";
	message: string;
}

export type ClientMessage = ClientJoinMessage | ClientChatMessage;

// ============================================================================
// Session Types
// ============================================================================

export interface ChatSession {
	/** User's display name (set after join) */
	name?: string;
	/** Rate limiter ID (hex string for hibernation) */
	limiterId?: string;
	/** Messages queued before user joined */
	blockedMessages: string[];
	/** Whether session has quit */
	quit?: boolean;
}

export interface SessionAttachment {
	name?: string;
	limiterId?: string;
}

// ============================================================================
// Room Options
// ============================================================================

export interface ChatRoomOptions {
	/** Maximum message length (default: 256) */
	maxMessageLength?: number;
	/** Maximum username length (default: 32) */
	maxNameLength?: number;
	/** Number of messages to load from history (default: 100) */
	historyLimit?: number;
	/** Custom message validator */
	validateMessage?: (message: string, session: ChatSession) => boolean | string;
	/** Custom name validator */
	validateName?: (name: string) => boolean | string;
	/** Called when a message is sent */
	onMessage?: (message: ChatMessage) => void | Promise<void>;
	/** Called when a user joins */
	onJoin?: (name: string) => void | Promise<void>;
	/** Called when a user leaves */
	onLeave?: (name: string) => void | Promise<void>;
}

// ============================================================================
// Rate Limiter Types
// ============================================================================

export interface RateLimiterOptions {
	/** Cooldown per action in seconds (default: 5) */
	cooldownSeconds?: number;
	/** Grace period in seconds (default: 20) */
	gracePeriodSeconds?: number;
}

// ============================================================================
// Environment Bindings
// ============================================================================

export interface ChatEnv {
	/** Chat rooms Durable Object namespace */
	rooms: DurableObjectNamespace;
	/** Rate limiters Durable Object namespace */
	limiters: DurableObjectNamespace;
}
