import * as Sentry from "@sentry/cloudflare";

// Re-export everything from @sentry/cloudflare
export * from "@sentry/cloudflare";

/**
 * Sentry configuration options for Cloudflare Workers
 */
export interface SentryConfig {
	dsn: string;
	release?: string;
	environment?: string;
	tracesSampleRate?: number;
	sendDefaultPii?: boolean;
	enableLogs?: boolean;
}

/**
 * Environment bindings required for Sentry
 */
export interface SentryEnv {
	SENTRY_DSN: string;
	CF_VERSION_METADATA?: { id: string };
}

/**
 * Create Sentry options from environment
 *
 * @example
 * ```ts
 * import { withSentry } from "@sentry/cloudflare";
 * import { createSentryOptions } from "@repo/observability/sentry";
 *
 * export default withSentry(
 *   (env) => createSentryOptions(env),
 *   {
 *     async fetch(request, env, ctx) {
 *       return new Response("Hello!");
 *     },
 *   }
 * );
 * ```
 */
export function createSentryOptions(env: SentryEnv, overrides?: Partial<SentryConfig>) {
	return {
		dsn: env.SENTRY_DSN,
		release: env.CF_VERSION_METADATA?.id,
		sendDefaultPii: true,
		enableLogs: true,
		tracesSampleRate: 1.0,
		...overrides,
	};
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
	return Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message and send to Sentry
 */
export function captureMessage(message: string, level?: Sentry.SeverityLevel) {
	return Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 */
export function setUser(user: Sentry.User | null) {
	return Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
	return Sentry.addBreadcrumb(breadcrumb);
}
