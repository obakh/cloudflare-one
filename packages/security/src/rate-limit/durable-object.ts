/**
 * Durable Object-based Rate Limiting
 *
 * Provides rate limiting using Durable Objects for scenarios where
 * Cloudflare's Rate Limiting API isn't suitable (e.g., WebSocket connections,
 * custom cooldown logic, per-user limits without HTTP requests).
 *
 * @example wrangler.toml
 * ```toml
 * [durable_objects]
 * bindings = [
 *   { name = "RATE_LIMITERS", class_name = "RateLimiterDO" }
 * ]
 *
 * [[migrations]]
 * tag = "v1"
 * new_classes = ["RateLimiterDO"]
 * ```
 *
 * @example Usage
 * ```ts
 * import { RateLimiterDO, createRateLimiterClient } from "@repo/security/rate-limit";
 *
 * export { RateLimiterDO };
 *
 * // In your handler
 * const limiter = createRateLimiterClient(env.RATE_LIMITERS, ip);
 * if (!limiter.checkLimit()) {
 *   return new Response("Rate limited", { status: 429 });
 * }
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface RateLimiterDOOptions {
	/** Cooldown per action in seconds (default: 5) */
	cooldownSeconds?: number;
	/** Grace period allowing burst requests (default: 20) */
	gracePeriodSeconds?: number;
}

export interface RateLimiterClientOptions {
	/** Called when rate limiter errors */
	onError?: (err: Error) => void;
}

// ============================================================================
// Durable Object
// ============================================================================

/**
 * Rate Limiter Durable Object
 *
 * Tracks when a key (IP, user, etc.) can next perform an action.
 * Uses in-memory state only - no durable storage needed since
 * rate limits can safely reset on eviction.
 *
 * Protocol:
 * - GET: Check current cooldown without incrementing
 * - POST: Record an action and return cooldown
 *
 * Response: Number of seconds to wait (0 = allowed)
 */
export class RateLimiterDO implements DurableObject {
	private nextAllowedTime = 0;
	private cooldownSeconds: number;
	private gracePeriodSeconds: number;

	constructor(_state: DurableObjectState, _env: unknown) {
		// Default values - can be overridden via query params
		this.cooldownSeconds = 5;
		this.gracePeriodSeconds = 20;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Allow configuring via query params
		const cooldown = url.searchParams.get("cooldown");
		const grace = url.searchParams.get("grace");
		if (cooldown) this.cooldownSeconds = Number(cooldown);
		if (grace) this.gracePeriodSeconds = Number(grace);

		const now = Date.now() / 1000;
		this.nextAllowedTime = Math.max(now, this.nextAllowedTime);

		if (request.method === "POST") {
			// User performed an action - add cooldown
			this.nextAllowedTime += this.cooldownSeconds;
		}

		// Calculate remaining cooldown (with grace period)
		const remaining = Math.max(0, this.nextAllowedTime - now - this.gracePeriodSeconds);

		return new Response(String(remaining), {
			headers: {
				"X-RateLimit-Reset": String(Math.ceil(this.nextAllowedTime)),
				"X-RateLimit-Remaining": remaining > 0 ? "0" : "1",
			},
		});
	}
}

// ============================================================================
// Client
// ============================================================================

/**
 * Rate Limiter Client
 *
 * Client-side helper for interacting with RateLimiterDO.
 * Handles reconnection and async cooldown tracking.
 */
export class RateLimiterClient {
	private stub: DurableObjectStub;
	private inCooldown = false;
	private cooldownSeconds: number;
	private gracePeriodSeconds: number;
	private onError: (err: Error) => void;

	constructor(
		private getStub: () => DurableObjectStub,
		options: RateLimiterDOOptions & RateLimiterClientOptions = {},
	) {
		this.stub = getStub();
		this.cooldownSeconds = options.cooldownSeconds ?? 5;
		this.gracePeriodSeconds = options.gracePeriodSeconds ?? 20;
		this.onError = options.onError ?? ((err) => console.error("[RateLimiter]", err));
	}

	/**
	 * Check if action is allowed
	 * Returns true if allowed, false if rate limited
	 *
	 * This is non-blocking - it returns immediately and
	 * handles the cooldown asynchronously.
	 */
	checkLimit(): boolean {
		if (this.inCooldown) {
			return false;
		}
		this.inCooldown = true;
		this.recordAction();
		return true;
	}

	/**
	 * Check limit and wait for result (blocking)
	 * Use when you need to know the exact cooldown time
	 */
	async checkLimitAsync(): Promise<{ allowed: boolean; retryAfter: number }> {
		try {
			const response = await this.callDO("POST");
			const retryAfter = Number(await response.text());
			return {
				allowed: retryAfter === 0,
				retryAfter,
			};
		} catch (err) {
			this.onError(err as Error);
			return { allowed: true, retryAfter: 0 };
		}
	}

	/**
	 * Get current cooldown without recording an action
	 */
	async getCooldown(): Promise<number> {
		try {
			const response = await this.callDO("GET");
			return Number(await response.text());
		} catch (err) {
			this.onError(err as Error);
			return 0;
		}
	}

	/**
	 * Reset the rate limiter (for testing or admin use)
	 */
	reset(): void {
		this.inCooldown = false;
	}

	private async recordAction(): Promise<void> {
		try {
			const response = await this.callDO("POST");
			const cooldown = Number(await response.text());

			if (cooldown > 0) {
				await new Promise((resolve) => setTimeout(resolve, cooldown * 1000));
			}

			this.inCooldown = false;
		} catch (err) {
			this.onError(err as Error);
			this.inCooldown = false;
		}
	}

	private async callDO(method: "GET" | "POST"): Promise<Response> {
		const url = `https://rate-limiter/?cooldown=${this.cooldownSeconds}&grace=${this.gracePeriodSeconds}`;

		try {
			return await this.stub.fetch(url, { method });
		} catch {
			// Stub disconnected, get a new one and retry
			this.stub = this.getStub();
			return await this.stub.fetch(url, { method });
		}
	}
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a rate limiter client for a specific key (IP, user ID, etc.)
 *
 * @example
 * ```ts
 * import { createRateLimiterClient } from "@repo/security/rate-limit";
 *
 * // Rate limit by IP
 * const ip = request.headers.get("CF-Connecting-IP") || "unknown";
 * const limiter = createRateLimiterClient(env.RATE_LIMITERS, ip);
 *
 * if (!limiter.checkLimit()) {
 *   return new Response("Too many requests", { status: 429 });
 * }
 * ```
 */
export function createRateLimiterClient(
	namespace: DurableObjectNamespace,
	key: string,
	options?: RateLimiterDOOptions & RateLimiterClientOptions,
): RateLimiterClient {
	const id = namespace.idFromName(key);
	return new RateLimiterClient(() => namespace.get(id), options);
}

/**
 * Create a rate limiter client from an existing Durable Object ID
 *
 * @example
 * ```ts
 * // When you already have the ID (e.g., from serialized state)
 * const id = env.RATE_LIMITERS.idFromString(serializedId);
 * const limiter = createRateLimiterClientFromId(env.RATE_LIMITERS, id);
 * ```
 */
export function createRateLimiterClientFromId(
	namespace: DurableObjectNamespace,
	id: DurableObjectId,
	options?: RateLimiterDOOptions & RateLimiterClientOptions,
): RateLimiterClient {
	return new RateLimiterClient(() => namespace.get(id), options);
}

/**
 * Get the Durable Object ID for a rate limiter key
 */
export function getRateLimiterId(namespace: DurableObjectNamespace, key: string): DurableObjectId {
	return namespace.idFromName(key);
}

/**
 * Extract IP address from request headers
 */
export function getIPFromRequest(request: Request): string {
	return (
		request.headers.get("CF-Connecting-IP") ||
		request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
		"unknown"
	);
}
