/**
 * Cloudflare Zaraz HTTP Events API
 *
 * Server-side analytics for Cloudflare Workers.
 * Send events from the edge without client-side JavaScript.
 *
 * @see https://developers.cloudflare.com/zaraz/http-events-api/
 */

/**
 * Event properties
 */
export type ServerEventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Client information for server-side events
 */
export interface ClientInfo {
	/** Client IP address */
	ip?: string;
	/** User agent string */
	userAgent?: string;
	/** Page URL */
	pageUrl?: string;
	/** Page referrer */
	referrer?: string;
	/** Accept-Language header */
	language?: string;
	/** Screen resolution (e.g., "1920x1080") */
	resolution?: string;
	/** Viewport size (e.g., "1200x800") */
	viewport?: string;
	/** Document encoding */
	encoding?: string;
	/** Document title */
	title?: string;
}

/**
 * Zaraz HTTP event payload
 */
interface ZarazHttpEvent {
	client: {
		__zarazTrack?: string;
		[key: string]: string | number | boolean | null | undefined;
	};
	system: {
		page: {
			url: string;
			title?: string;
			referrer?: string;
			encoding?: string;
		};
		device: {
			ip?: string;
			userAgent?: string;
			language?: string;
			resolution?: string;
			viewport?: string;
		};
	};
}

/**
 * Server analytics configuration
 */
export interface ServerAnalyticsConfig {
	/** Your Cloudflare zone domain (e.g., "example.com") */
	domain: string;
	/** Enable debug logging */
	debug?: boolean;
}

/**
 * Create server-side Zaraz analytics client
 *
 * @see https://developers.cloudflare.com/zaraz/http-events-api/
 *
 * @example
 * ```ts
 * import { createServerAnalytics } from "@repo/analytics/server";
 *
 * const analytics = createServerAnalytics({
 *   domain: "example.com",
 * });
 *
 * // In your Worker
 * export default {
 *   async fetch(request, env, ctx) {
 *     // Track event without blocking response
 *     ctx.waitUntil(
 *       analytics.track("page_view", {}, extractClientInfo(request))
 *     );
 *
 *     return new Response("OK");
 *   },
 * };
 * ```
 */
export function createServerAnalytics(config: ServerAnalyticsConfig) {
	const { domain, debug = false } = config;
	const endpoint = `https://${domain}/cdn-cgi/zaraz/t`;

	/**
	 * Track an event server-side via Zaraz HTTP Events API
	 */
	async function track(
		eventName: string,
		properties?: ServerEventProperties,
		clientInfo?: ClientInfo,
	): Promise<void> {
		if (debug) {
			console.log("[Zaraz Server] track:", eventName, properties);
		}

		const payload: ZarazHttpEvent = {
			client: {
				__zarazTrack: eventName,
				...properties,
			},
			system: {
				page: {
					url: clientInfo?.pageUrl || `https://${domain}/`,
					title: clientInfo?.title,
					referrer: clientInfo?.referrer,
					encoding: clientInfo?.encoding || "UTF-8",
				},
				device: {
					ip: clientInfo?.ip,
					userAgent: clientInfo?.userAgent,
					language: clientInfo?.language,
					resolution: clientInfo?.resolution,
					viewport: clientInfo?.viewport,
				},
			},
		};

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok && debug) {
				console.error("[Zaraz Server] HTTP error:", response.status);
			}
		} catch (error) {
			if (debug) {
				console.error("[Zaraz Server] Error:", error);
			}
		}
	}

	/**
	 * Track multiple events in batch
	 */
	async function trackBatch(
		events: Array<{
			name: string;
			properties?: ServerEventProperties;
			clientInfo?: ClientInfo;
		}>,
	): Promise<void> {
		await Promise.allSettled(
			events.map((event) => track(event.name, event.properties, event.clientInfo)),
		);
	}

	return {
		track,
		trackBatch,
	};
}

/**
 * Extract client information from a Cloudflare Workers request
 *
 * @example
 * ```ts
 * import { extractClientInfo } from "@repo/analytics/server";
 *
 * export default {
 *   async fetch(request, env, ctx) {
 *     const clientInfo = extractClientInfo(request);
 *     ctx.waitUntil(analytics.track("page_view", {}, clientInfo));
 *     return new Response("OK");
 *   },
 * };
 * ```
 */
export function extractClientInfo(request: Request): ClientInfo {
	return {
		ip:
			request.headers.get("cf-connecting-ip") ||
			request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			undefined,
		userAgent: request.headers.get("user-agent") || undefined,
		pageUrl: request.url,
		referrer: request.headers.get("referer") || undefined,
		language: request.headers.get("accept-language")?.split(",")[0] || undefined,
	};
}

/**
 * Hono middleware for automatic page view tracking
 *
 * @example
 * ```ts
 * import { Hono } from "hono";
 * import { createAnalyticsMiddleware } from "@repo/analytics/server";
 *
 * const app = new Hono();
 *
 * app.use("*", createAnalyticsMiddleware({
 *   domain: "example.com",
 *   excludePaths: ["/api/", "/health", "/_"],
 * }));
 * ```
 */
export function createAnalyticsMiddleware(
	config: ServerAnalyticsConfig & {
		/** Paths to exclude from tracking */
		excludePaths?: string[];
		/** Only track GET requests */
		getOnly?: boolean;
	},
) {
	const { excludePaths = [], getOnly = true, ...analyticsConfig } = config;
	const analytics = createServerAnalytics(analyticsConfig);

	return async (
		request: Request,
		_env: unknown,
		ctx: ExecutionContext,
	): Promise<Response | undefined> => {
		const url = new URL(request.url);

		// Check if should track
		const shouldExclude = excludePaths.some((path) => url.pathname.startsWith(path));

		if (shouldExclude) {
			return;
		}

		if (getOnly && request.method !== "GET") {
			return;
		}

		// Track page view in background
		const clientInfo = extractClientInfo(request);
		ctx.waitUntil(analytics.track("Pageview", { page_path: url.pathname }, clientInfo));

		// Continue to next handler
		return;
	};
}
