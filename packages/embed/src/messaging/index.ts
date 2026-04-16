// ============================================================================
// PostMessage Communication Helpers
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export type MessageHandler = (data: unknown, event: MessageEvent) => void;

export interface PostMessageOptions {
	/** Target origin (default: "*") */
	targetOrigin?: string;
	/** Transferable objects */
	transfer?: Transferable[];
}

export interface MessageChannelConfig {
	/** Allowed origins (empty = allow all) */
	allowedOrigins?: string[];
	/** Message type prefix for filtering */
	typePrefix?: string;
	/** Debug mode */
	debug?: boolean;
}

export interface TypedMessage<T = unknown> {
	type: string;
	payload: T;
	timestamp: number;
	id: string;
}

export interface MessageChannel {
	/** Send message to target window */
	send: <T>(type: string, payload: T, options?: PostMessageOptions) => void;
	/** Subscribe to messages */
	subscribe: <T>(type: string, handler: (payload: T, event: MessageEvent) => void) => () => void;
	/** Subscribe to all messages */
	subscribeAll: (handler: MessageHandler) => () => void;
	/** Request/response pattern */
	request: <TReq, TRes>(type: string, payload: TReq, options?: RequestOptions) => Promise<TRes>;
	/** Handle requests */
	onRequest: <TReq, TRes>(
		type: string,
		handler: (payload: TReq) => TRes | Promise<TRes>,
	) => () => void;
	/** Destroy channel */
	destroy: () => void;
}

export interface RequestOptions extends PostMessageOptions {
	/** Timeout in ms (default: 5000) */
	timeout?: number;
}

// ============================================================================
// Message Channel Factory
// ============================================================================

export function createMessageChannel(
	target: Window | null,
	config: MessageChannelConfig = {},
): MessageChannel {
	const { allowedOrigins = [], typePrefix = "", debug = false } = config;

	const handlers = new Map<string, Set<(payload: unknown, event: MessageEvent) => void>>();
	const allHandlers = new Set<MessageHandler>();
	const requestHandlers = new Map<string, (payload: unknown) => unknown | Promise<unknown>>();
	const pendingRequests = new Map<
		string,
		{ resolve: (value: unknown) => void; reject: (error: Error) => void }
	>();

	// Generate unique ID
	const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

	// Build full type with prefix
	const buildType = (type: string) => (typePrefix ? `${typePrefix}:${type}` : type);

	// Parse type (remove prefix)
	const parseType = (fullType: string) => {
		if (typePrefix && fullType.startsWith(`${typePrefix}:`)) {
			return fullType.slice(typePrefix.length + 1);
		}
		return fullType;
	};

	// Validate origin
	const isValidOrigin = (origin: string) => {
		if (allowedOrigins.length === 0) return true;
		return allowedOrigins.includes(origin);
	};

	// Message listener
	const messageListener = async (event: MessageEvent) => {
		// Validate origin
		if (!isValidOrigin(event.origin)) {
			if (debug) console.warn(`[MessageChannel] Blocked message from origin: ${event.origin}`);
			return;
		}

		// Validate message structure
		const data = event.data as TypedMessage | undefined;
		if (!data || typeof data.type !== "string") return;

		// Check prefix
		if (typePrefix && !data.type.startsWith(`${typePrefix}:`)) return;

		const type = parseType(data.type);

		if (debug) console.log(`[MessageChannel] Received:`, { type, payload: data.payload });

		// Handle response messages
		if (type.endsWith(":response") || type.endsWith(":error")) {
			const requestId = data.id;
			const pending = pendingRequests.get(requestId);
			if (pending) {
				pendingRequests.delete(requestId);
				if (type.endsWith(":error")) {
					pending.reject(new Error(String(data.payload)));
				} else {
					pending.resolve(data.payload);
				}
			}
			return;
		}

		// Handle request messages
		if (type.endsWith(":request")) {
			const baseType = type.slice(0, -8); // Remove ":request"
			const handler = requestHandlers.get(baseType);
			if (handler) {
				try {
					const result = await handler(data.payload);
					sendMessage(
						event.source as Window,
						`${baseType}:response`,
						result,
						{
							targetOrigin: event.origin,
						},
						data.id,
					);
				} catch (err) {
					sendMessage(
						event.source as Window,
						`${baseType}:error`,
						String(err),
						{
							targetOrigin: event.origin,
						},
						data.id,
					);
				}
			}
			return;
		}

		// Notify type-specific handlers
		const typeHandlers = handlers.get(type);
		if (typeHandlers) {
			typeHandlers.forEach((handler) => handler(data.payload, event));
		}

		// Notify all handlers
		allHandlers.forEach((handler) => handler(data, event));
	};

	// Send message helper
	const sendMessage = (
		targetWindow: Window,
		type: string,
		payload: unknown,
		options: PostMessageOptions = {},
		id?: string,
	) => {
		const { targetOrigin = "*", transfer } = options;
		const message: TypedMessage = {
			type: buildType(type),
			payload,
			timestamp: Date.now(),
			id: id ?? generateId(),
		};

		if (debug) console.log(`[MessageChannel] Sending:`, { type, payload });

		targetWindow.postMessage(message, targetOrigin, transfer);
	};

	// Add listener
	if (typeof window !== "undefined") {
		window.addEventListener("message", messageListener);
	}

	return {
		send: (type, payload, options) => {
			if (!target) {
				if (debug) console.warn("[MessageChannel] No target window");
				return;
			}
			sendMessage(target, type, payload, options);
		},

		subscribe: (type, handler) => {
			if (!handlers.has(type)) {
				handlers.set(type, new Set());
			}
			handlers.get(type)!.add(handler as (payload: unknown, event: MessageEvent) => void);

			return () => {
				handlers.get(type)?.delete(handler as (payload: unknown, event: MessageEvent) => void);
			};
		},

		subscribeAll: (handler) => {
			allHandlers.add(handler);
			return () => allHandlers.delete(handler);
		},

		request: (type, payload, options = {}) => {
			return new Promise((resolve, reject) => {
				if (!target) {
					reject(new Error("No target window"));
					return;
				}

				const { timeout = 5000, ...sendOptions } = options;
				const id = generateId();

				// Set up timeout
				const timeoutId = setTimeout(() => {
					pendingRequests.delete(id);
					reject(new Error(`Request timeout: ${type}`));
				}, timeout);

				// Store pending request
				pendingRequests.set(id, {
					resolve: (value) => {
						clearTimeout(timeoutId);
						resolve(value as never);
					},
					reject: (error) => {
						clearTimeout(timeoutId);
						reject(error);
					},
				});

				// Send request
				sendMessage(target, `${type}:request`, payload, sendOptions, id);
			});
		},

		onRequest: (type, handler) => {
			requestHandlers.set(type, handler as (payload: unknown) => unknown | Promise<unknown>);
			return () => requestHandlers.delete(type);
		},

		destroy: () => {
			if (typeof window !== "undefined") {
				window.removeEventListener("message", messageListener);
			}
			handlers.clear();
			allHandlers.clear();
			requestHandlers.clear();
			pendingRequests.forEach(({ reject }) => reject(new Error("Channel destroyed")));
			pendingRequests.clear();
		},
	};
}

// ============================================================================
// Convenience: Parent/Child channel helpers
// ============================================================================

/** Create channel for communicating with parent window (from iframe) */
export function createParentChannel(config?: MessageChannelConfig): MessageChannel {
	const parent = typeof window !== "undefined" ? window.parent : null;
	return createMessageChannel(parent !== window ? parent : null, config);
}

/** Create channel for communicating with iframe */
export function createChildChannel(
	iframe: HTMLIFrameElement | null,
	config?: MessageChannelConfig,
): MessageChannel {
	return createMessageChannel(iframe?.contentWindow ?? null, config);
}

// ============================================================================
// Broadcast Channel (for same-origin tabs/windows)
// ============================================================================

export interface BroadcastChannelWrapper {
	/** Send message to all tabs */
	send: <T>(type: string, payload: T) => void;
	/** Subscribe to messages */
	subscribe: <T>(type: string, handler: (payload: T) => void) => () => void;
	/** Close channel */
	close: () => void;
}

export function createBroadcastChannel(name: string): BroadcastChannelWrapper {
	if (typeof BroadcastChannel === "undefined") {
		// Fallback for environments without BroadcastChannel
		return {
			send: () => {},
			subscribe: () => () => {},
			close: () => {},
		};
	}

	const channel = new BroadcastChannel(name);
	const handlers = new Map<string, Set<(payload: unknown) => void>>();

	channel.onmessage = (event) => {
		const { type, payload } = event.data as { type: string; payload: unknown };
		handlers.get(type)?.forEach((handler) => handler(payload));
	};

	return {
		send: (type, payload) => {
			channel.postMessage({ type, payload });
		},

		subscribe: (type, handler) => {
			if (!handlers.has(type)) {
				handlers.set(type, new Set());
			}
			handlers.get(type)!.add(handler as (payload: unknown) => void);

			return () => {
				handlers.get(type)?.delete(handler as (payload: unknown) => void);
			};
		},

		close: () => {
			channel.close();
			handlers.clear();
		},
	};
}

// ============================================================================
// Type-safe message builders
// ============================================================================

export function defineMessages<T extends Record<string, unknown>>() {
	return {
		/** Create a typed message sender */
		sender: <K extends keyof T>(channel: MessageChannel, type: K) => {
			return (payload: T[K], options?: PostMessageOptions) => {
				channel.send(type as string, payload, options);
			};
		},

		/** Create a typed message subscriber */
		subscriber: <K extends keyof T>(channel: MessageChannel, type: K) => {
			return (handler: (payload: T[K], event: MessageEvent) => void) => {
				return channel.subscribe(type as string, handler);
			};
		},
	};
}
