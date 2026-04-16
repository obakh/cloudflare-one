/**
 * Chat Rate Limiter
 *
 * Re-exports the Durable Object rate limiter from @repo/security
 * with chat-specific defaults and aliases.
 */

// Re-export everything from security package
export {
	createRateLimiterClient,
	createRateLimiterClientFromId,
	getIPFromRequest,
	getRateLimiterId,
	RateLimiterClient,
	type RateLimiterClientOptions,
	RateLimiterDO as ChatRateLimiter,
	type RateLimiterDOOptions,
} from "@repo/security/rate-limit/durable-object";

/**
 * Default chat rate limiter options
 * - 5 second cooldown per message
 * - 20 second grace period for bursts
 */
export const CHAT_RATE_LIMIT_DEFAULTS = {
	cooldownSeconds: 5,
	gracePeriodSeconds: 20,
} as const;
