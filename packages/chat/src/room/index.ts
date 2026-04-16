/**
 * Chat Room Durable Object
 *
 * Manages a single chat room with WebSocket connections, message broadcasting,
 * and persistent chat history using WebSocket Hibernation API.
 *
 * @example wrangler.toml
 * ```toml
 * [durable_objects]
 * bindings = [
 *   { name = "rooms", class_name = "ChatRoom" },
 *   { name = "limiters", class_name = "RateLimiterDO" }
 * ]
 *
 * [[migrations]]
 * tag = "v1"
 * new_sqlite_classes = ["ChatRoom", "RateLimiterDO"]
 * ```
 */

import {
	CHAT_RATE_LIMIT_DEFAULTS,
	createRateLimiterClientFromId,
	RateLimiterClient,
} from "../rate-limiter/index";
import type {
	ChatEnv,
	ChatMessage,
	ChatRoomOptions,
	ChatSession,
	SessionAttachment,
} from "../types";

/**
 * Chat Room Durable Object
 *
 * Uses WebSocket Hibernation API for efficient connection management.
 * Messages are stored in durable storage for history.
 */
export class ChatRoom implements DurableObject {
	private sessions = new Map<WebSocket, ChatSession>();
	private lastTimestamp = 0;
	private options: Required<ChatRoomOptions>;

	constructor(
		private state: DurableObjectState,
		private env: ChatEnv,
		options: ChatRoomOptions = {},
	) {
		this.options = {
			maxMessageLength: options.maxMessageLength ?? 256,
			maxNameLength: options.maxNameLength ?? 32,
			historyLimit: options.historyLimit ?? 100,
			validateMessage: options.validateMessage ?? (() => true),
			validateName: options.validateName ?? (() => true),
			onMessage: options.onMessage ?? (() => {}),
			onJoin: options.onJoin ?? (() => {}),
			onLeave: options.onLeave ?? (() => {}),
		};

		// Restore sessions from hibernation
		this.state.getWebSockets().forEach((webSocket) => {
			const meta = webSocket.deserializeAttachment() as SessionAttachment;
			if (!meta) return;

			let limiter: RateLimiterClient | undefined;
			if (meta.limiterId) {
				const limiterId = this.env.limiters.idFromString(meta.limiterId);
				limiter = createRateLimiterClientFromId(this.env.limiters, limiterId, {
					...CHAT_RATE_LIMIT_DEFAULTS,
					onError: (err) => webSocket.close(1011, err.message),
				});
			}

			this.sessions.set(webSocket, {
				name: meta.name,
				limiterId: meta.limiterId,
				blockedMessages: [],
				limiter,
			} as ChatSession & { limiter?: RateLimiterClient });
		});
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/websocket") {
			if (request.headers.get("Upgrade") !== "websocket") {
				return new Response("Expected WebSocket", { status: 400 });
			}

			const ip = request.headers.get("CF-Connecting-IP") || "unknown";
			const pair = new WebSocketPair();

			await this.handleSession(pair[1], ip);

			return new Response(null, { status: 101, webSocket: pair[0] });
		}

		return new Response("Not found", { status: 404 });
	}

	private async handleSession(webSocket: WebSocket, ip: string): Promise<void> {
		this.state.acceptWebSocket(webSocket);

		// Set up rate limiter using @repo/security
		const limiterId = this.env.limiters.idFromName(ip);
		const limiter = createRateLimiterClientFromId(this.env.limiters, limiterId, {
			...CHAT_RATE_LIMIT_DEFAULTS,
			onError: (err) => webSocket.close(1011, err.message),
		});

		const session: ChatSession & { limiter: RateLimiterClient } = {
			limiterId: limiterId.toString(),
			limiter,
			blockedMessages: [],
		};

		webSocket.serializeAttachment({
			limiterId: limiterId.toString(),
		} as SessionAttachment);

		this.sessions.set(webSocket, session);

		// Queue roster for new user
		for (const otherSession of this.sessions.values()) {
			if (otherSession.name) {
				session.blockedMessages.push(JSON.stringify({ type: "join", name: otherSession.name }));
			}
		}

		// Load chat history
		const storage = await this.state.storage.list<string>({
			reverse: true,
			limit: this.options.historyLimit,
		});
		const backlog = [...storage.values()].reverse();
		backlog.forEach((value) => {
			session.blockedMessages.push(value);
		});
	}

	async webSocketMessage(webSocket: WebSocket, msg: string): Promise<void> {
		try {
			const session = this.sessions.get(webSocket) as
				| (ChatSession & { limiter?: RateLimiterClient })
				| undefined;

			if (!session || session.quit) {
				webSocket.close(1011, "Session ended");
				return;
			}

			// Check rate limit
			if (session.limiter && !session.limiter.checkLimit()) {
				webSocket.send(
					JSON.stringify({
						type: "error",
						error: "Rate limited. Please slow down.",
					}),
				);
				return;
			}

			const data = JSON.parse(msg);

			// Handle join message (first message from client)
			if (!session.name) {
				const name = String(data.name || "anonymous").trim();

				// Validate name length
				if (name.length > this.options.maxNameLength) {
					webSocket.send(JSON.stringify({ type: "error", error: "Name too long" }));
					webSocket.close(1009, "Name too long");
					return;
				}

				// Custom validation
				const nameValid = this.options.validateName(name);
				if (nameValid !== true) {
					const error = typeof nameValid === "string" ? nameValid : "Invalid name";
					webSocket.send(JSON.stringify({ type: "error", error }));
					webSocket.close(1009, error);
					return;
				}

				session.name = name;
				webSocket.serializeAttachment({
					...webSocket.deserializeAttachment(),
					name: session.name,
				} as SessionAttachment);

				// Send queued messages
				session.blockedMessages.forEach((queued) => webSocket.send(queued));
				session.blockedMessages = [];

				// Broadcast join
				this.broadcast({ type: "join", name: session.name });
				webSocket.send(JSON.stringify({ type: "ready" }));

				await this.options.onJoin(session.name);
				return;
			}

			// Handle chat message
			const message = String(data.message || "").trim();

			if (!message) return;

			if (message.length > this.options.maxMessageLength) {
				webSocket.send(JSON.stringify({ type: "error", error: "Message too long" }));
				return;
			}

			// Custom validation
			const msgValid = this.options.validateMessage(message, session);
			if (msgValid !== true) {
				const error = typeof msgValid === "string" ? msgValid : "Invalid message";
				webSocket.send(JSON.stringify({ type: "error", error }));
				return;
			}

			// Create message with monotonic timestamp
			const timestamp = Math.max(Date.now(), this.lastTimestamp + 1);
			this.lastTimestamp = timestamp;

			const chatMessage: ChatMessage = {
				type: "message",
				name: session.name,
				message,
				timestamp,
			};

			// Broadcast and store
			this.broadcast(chatMessage);
			await this.state.storage.put(new Date(timestamp).toISOString(), JSON.stringify(chatMessage));

			await this.options.onMessage(chatMessage);
		} catch (err) {
			webSocket.send(
				JSON.stringify({
					type: "error",
					error: err instanceof Error ? err.message : "Unknown error",
				}),
			);
		}
	}

	async webSocketClose(webSocket: WebSocket): Promise<void> {
		this.handleDisconnect(webSocket);
	}

	async webSocketError(webSocket: WebSocket): Promise<void> {
		this.handleDisconnect(webSocket);
	}

	private handleDisconnect(webSocket: WebSocket): void {
		const session = this.sessions.get(webSocket);
		if (!session) return;

		session.quit = true;
		this.sessions.delete(webSocket);

		if (session.name) {
			this.broadcast({ type: "leave", name: session.name });
			this.options.onLeave(session.name);
		}
	}

	private broadcast(message: unknown): void {
		const data = typeof message === "string" ? message : JSON.stringify(message);

		const quitters: ChatSession[] = [];

		this.sessions.forEach((session, webSocket) => {
			if (session.name) {
				try {
					webSocket.send(data);
				} catch {
					session.quit = true;
					quitters.push(session);
					this.sessions.delete(webSocket);
				}
			} else {
				// Queue for users who haven't joined yet
				session.blockedMessages.push(data);
			}
		});

		// Notify about disconnected users
		quitters.forEach((quitter) => {
			if (quitter.name) {
				this.broadcast({ type: "leave", name: quitter.name });
			}
		});
	}

	/**
	 * Get current online users
	 */
	getOnlineUsers(): string[] {
		const users: string[] = [];
		this.sessions.forEach((session) => {
			if (session.name) users.push(session.name);
		});
		return users;
	}

	/**
	 * Get session count
	 */
	getSessionCount(): number {
		return this.sessions.size;
	}

	/**
	 * Broadcast a system message
	 */
	broadcastSystem(message: string): void {
		this.broadcast({
			type: "message",
			name: "System",
			message,
			timestamp: Date.now(),
		});
	}

	/**
	 * Kick a user by name
	 */
	kickUser(name: string, reason = "Kicked"): boolean {
		for (const [webSocket, session] of this.sessions) {
			if (session.name === name) {
				webSocket.send(JSON.stringify({ type: "error", error: reason }));
				webSocket.close(1000, reason);
				return true;
			}
		}
		return false;
	}
}

// ============================================================================
// Room Routing Helpers
// ============================================================================

/**
 * Get or create a room ID from a name
 */
export function getRoomId(rooms: DurableObjectNamespace, name: string): DurableObjectId {
	// If it looks like a hex ID, parse it directly
	if (/^[0-9a-f]{64}$/i.test(name)) {
		return rooms.idFromString(name);
	}
	// Otherwise derive from name
	return rooms.idFromName(name);
}

/**
 * Create a new private room with a unique ID
 */
export function createPrivateRoom(rooms: DurableObjectNamespace): DurableObjectId {
	return rooms.newUniqueId();
}

/**
 * Route a request to a chat room
 */
export async function routeToRoom(
	rooms: DurableObjectNamespace,
	roomName: string,
	request: Request,
): Promise<Response> {
	const id = getRoomId(rooms, roomName);
	const room = rooms.get(id);

	// Forward to room's /websocket endpoint
	const url = new URL(request.url);
	url.pathname = "/websocket";

	return room.fetch(new Request(url.toString(), request));
}
