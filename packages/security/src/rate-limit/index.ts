/**
 * Rate Limiting Helpers for Cloudflare Workers
 *
 * Utilities for implementing rate limiting using Cloudflare's Rate Limiting API.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
 */

import type { Context, Env, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

/**
 * Rate limiting binding as defined by Cloudflare Workers
 */
export interface RateLimitBinding {
	limit(options: { key: string }): Promise<{ success: boolean }>;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
	/** Whether the request is allowed */
	success: boolean;
	/** The key that was rate limited */
	key: string;
}

/**
 * Function that returns the key to rate limit on
 */
export type RateLimitKeyFunc<E extends Env = Env> = (c: Context<E>) => string | Promise<string>;

/**
 * Rate limit middleware options
 */
export interface RateLimitOptions<E extends Env = Env> {
	/** Function to get the rate limiter binding from context */
	rateLimiter: (c: Context<E>) => RateLimitBinding;
	/** Function to get the rate limit key */
	keyFunc: RateLimitKeyFunc<E>;
	/** Custom response when rate limited (default: 429 with "Too many requests") */
	onRateLimited?: (c: Context<E>) => Response | Promise<Response>;
	/** Skip rate limiting for certain requests */
	skip?: (c: Context<E>) => boolean | Promise<boolean>;
	/** What to do when key is empty: "skip" | "error" (default: "skip") */
	onEmptyKey?: "skip" | "error";
}

const RATE_LIMIT_CONTEXT_KEY = "rate_limit_result";

/**
 * Common rate limit key extractors
 */
export const RateLimitKeys = {
	/**
	 * Rate limit by IP address
	 */
	byIP: (c: Context): string => {
		return (
			c.req.header("cf-connecting-ip") ||
			c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
			"unknown"
		);
	},

	/**
	 * Rate limit by Authorization header (API key, Bearer token)
	 */
	byAuthHeader: (c: Context): string => {
		return c.req.header("Authorization") || "";
	},

	/**
	 * Rate limit by API key header
	 */
	byApiKey: (headerName = "X-API-Key") => {
		return (c: Context): string => {
			return c.req.header(headerName) || "";
		};
	},

	/**
	 * Rate limit by IP + path combination
	 */
	byIPAndPath: (c: Context): string => {
		const ip = RateLimitKeys.byIP(c);
		const path = new URL(c.req.url).pathname;
		return `${ip}:${path}`;
	},

	/**
	 * Rate limit by user ID (from context)
	 */
	byUserId: (userIdKey = "userId") => {
		return (c: Context): string => {
			return (c.get(userIdKey) as string) || "";
		};
	},

	/**
	 * Combine multiple keys
	 */
	combine: (...keyFuncs: Array<(c: Context) => string | Promise<string>>) => {
		return async (c: Context): Promise<string> => {
			const keys = await Promise.all(keyFuncs.map((fn) => fn(c)));
			return keys.filter(Boolean).join(":");
		};
	},
};

/**
 * Create a rate limiting middleware for Hono
 *
 * @example
 * ```ts
 * import { rateLimitMiddleware, RateLimitKeys } from "@repo/security/rate-limit";
 *
 * // Basic usage - rate limit by IP
 * app.use("/*", rateLimitMiddleware({
 *   rateLimiter: (c) => c.env.RATE_LIMITER,
 *   keyFunc: RateLimitKeys.byIP,
 * }));
 *
 * // Rate limit by API key
 * app.use("/api/*", rateLimitMiddleware({
 *   rateLimiter: (c) => c.env.API_RATE_LIMITER,
 *   keyFunc: RateLimitKeys.byApiKey("X-API-Key"),
 * }));
 *
 * // Custom key function
 * app.use("/auth/*", rateLimitMiddleware({
 *   rateLimiter: (c) => c.env.AUTH_RATE_LIMITER,
 *   keyFunc: (c) => `auth:${RateLimitKeys.byIP(c)}`,
 *   onRateLimited: (c) => c.json({ error: "Too many login attempts" }, 429),
 * }));
 * ```
 */
export function rateLimitMiddleware<E extends Env = Env>(
	options: RateLimitOptions<E>,
): MiddlewareHandler<E> {
	const { rateLimiter, keyFunc, onRateLimited, skip, onEmptyKey = "skip" } = options;

	return createMiddleware<E>(async (c, next) => {
		// Check if we should skip rate limiting
		if (skip && (await skip(c))) {
			await next();
			return;
		}

		// Get the rate limit key
		const key = await keyFunc(c);

		// Handle empty key
		if (!key) {
			if (onEmptyKey === "error") {
				throw new HTTPException(400, {
					res: new Response(JSON.stringify({ error: "Missing rate limit key" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					}),
				});
			}
			// Skip rate limiting if key is empty
			console.warn("[RateLimit] Empty key, skipping rate limit");
			await next();
			return;
		}

		// Check rate limit
		const limiter = rateLimiter(c);
		const { success } = await limiter.limit({ key });

		// Store result in context
		(c as Context).set(RATE_LIMIT_CONTEXT_KEY, { success, key } as RateLimitResult);

		if (!success) {
			if (onRateLimited) {
				const response = await onRateLimited(c);
				throw new HTTPException(429, { res: response });
			}

			throw new HTTPException(429, {
				res: new Response(JSON.stringify({ error: "Too many requests" }), {
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": "60",
					},
				}),
			});
		}

		await next();
	});
}

/**
 * Check if the current request passed rate limiting
 *
 * @example
 * ```ts
 * app.get("/status", (c) => {
 *   const result = getRateLimitResult(c);
 *   return c.json({ rateLimited: !result?.success });
 * });
 * ```
 */
export function getRateLimitResult(c: Context): RateLimitResult | undefined {
	return c.get(RATE_LIMIT_CONTEXT_KEY) as RateLimitResult | undefined;
}

/**
 * Check if rate limit passed
 */
export function isRateLimitOk(c: Context): boolean {
	const result = getRateLimitResult(c);
	return result?.success ?? true;
}

/**
 * Simple rate limit check (without middleware)
 *
 * @example
 * ```ts
 * import { checkRateLimit } from "@repo/security/rate-limit";
 *
 * app.post("/login", async (c) => {
 *   const ip = c.req.header("cf-connecting-ip") || "unknown";
 *   const { success } = await checkRateLimit(c.env.LOGIN_LIMITER, `login:${ip}`);
 *
 *   if (!success) {
 *     return c.json({ error: "Too many login attempts" }, 429);
 *   }
 *
 *   // Process login...
 * });
 * ```
 */
export async function checkRateLimit(
	limiter: RateLimitBinding,
	key: string,
): Promise<{ success: boolean }> {
	if (!key) {
		console.warn("[RateLimit] Empty key provided");
		return { success: true };
	}
	return limiter.limit({ key });
}

/**
 * Create a rate limiter wrapper with preset configuration
 *
 * @example
 * ```ts
 * import { createRateLimiter } from "@repo/security/rate-limit";
 *
 * const apiLimiter = createRateLimiter({
 *   prefix: "api",
 *   onLimit: (key) => console.log(`Rate limited: ${key}`),
 * });
 *
 * // In handler
 * const { success } = await apiLimiter.check(c.env.RATE_LIMITER, userId);
 * ```
 */
export function createRateLimiter(options: { prefix?: string; onLimit?: (key: string) => void }) {
	const { prefix, onLimit } = options;

	return {
		async check(
			limiter: RateLimitBinding,
			key: string,
		): Promise<{ success: boolean; key: string }> {
			const fullKey = prefix ? `${prefix}:${key}` : key;
			const result = await limiter.limit({ key: fullKey });

			if (!result.success && onLimit) {
				onLimit(fullKey);
			}

			return { ...result, key: fullKey };
		},
	};
}

/**
 * Tiered rate limiting for different user types
 *
 * @example
 * ```ts
 * import { createTieredRateLimiter } from "@repo/security/rate-limit";
 *
 * const tieredLimiter = createTieredRateLimiter({
 *   getTier: (c) => c.get("userTier") || "free",
 *   limiters: {
 *     free: (c) => c.env.FREE_RATE_LIMITER,
 *     pro: (c) => c.env.PRO_RATE_LIMITER,
 *     enterprise: (c) => c.env.ENTERPRISE_RATE_LIMITER,
 *   },
 * });
 *
 * app.use("/api/*", tieredLimiter.middleware(RateLimitKeys.byUserId()));
 * ```
 */
export function createTieredRateLimiter<Tier extends string = string>(options: {
	getTier: (c: Context) => Tier | Promise<Tier>;
	limiters: Record<Tier, (c: Context) => RateLimitBinding>;
	defaultTier?: Tier;
}) {
	const { getTier, limiters, defaultTier } = options;

	return {
		middleware(keyFunc: (c: Context) => string | Promise<string>): MiddlewareHandler {
			return createMiddleware(async (c, next) => {
				const tier = await getTier(c);
				const limiterFn = limiters[tier] || (defaultTier ? limiters[defaultTier] : undefined);

				if (!limiterFn) {
					console.warn(`[RateLimit] No limiter for tier: ${tier}`);
					await next();
					return;
				}

				const key = await keyFunc(c);
				if (!key) {
					await next();
					return;
				}

				const limiter = limiterFn(c);
				const { success } = await limiter.limit({ key: `${tier}:${key}` });

				c.set(RATE_LIMIT_CONTEXT_KEY, { success, key: `${tier}:${key}` } as RateLimitResult);

				if (!success) {
					throw new HTTPException(429, {
						res: new Response(JSON.stringify({ error: "Too many requests" }), {
							status: 429,
							headers: { "Content-Type": "application/json" },
						}),
					});
				}

				await next();
			});
		},
	};
}
