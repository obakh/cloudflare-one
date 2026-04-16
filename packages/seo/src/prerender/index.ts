/**
 * Prerendering Helpers for Cloudflare Workers
 *
 * Utilities for serving prerendered HTML to bots while serving
 * the SPA to regular users.
 *
 * @see https://developers.cloudflare.com/workers/examples/
 */

import { detectBot, shouldPrerender as shouldPrerenderCheck } from "../bots/index.js";

/**
 * Prerender configuration
 */
export interface PrerenderConfig {
	/** Renderer service URL (e.g., Prerender.io, Rendertron) */
	rendererUrl?: string;
	/** Cache TTL in seconds (default: 600 = 10 minutes) */
	cacheTtl?: number;
	/** Stale-while-revalidate TTL in seconds (default: 86400 = 24 hours) */
	swr?: number;
	/** Routes to exclude from prerendering */
	excludeRoutes?: string[];
	/** Routes to include (if set, only these routes are prerendered) */
	includeRoutes?: string[];
	/** Custom bot detection function */
	shouldPrerender?: (request: Request) => boolean;
	/** Callback when prerender fails */
	onError?: (error: Error, request: Request) => void;
}

/**
 * Prerender result
 */
export interface PrerenderResult {
	/** The response to return */
	response: Response;
	/** Whether the response was prerendered */
	prerendered: boolean;
	/** Whether the response was from cache */
	cached: boolean;
	/** Bot detection result */
	bot?: ReturnType<typeof detectBot>;
}

/**
 * Check if a route should be prerendered
 */
function shouldPrerenderRoute(pathname: string, config: PrerenderConfig): boolean {
	const { excludeRoutes = [], includeRoutes } = config;

	// Check exclusions first
	for (const route of excludeRoutes) {
		if (pathname.startsWith(route) || pathname === route) {
			return false;
		}
	}

	// If includeRoutes is set, only prerender those routes
	if (includeRoutes && includeRoutes.length > 0) {
		return includeRoutes.some((route) => pathname.startsWith(route) || pathname === route);
	}

	return true;
}

/**
 * Create prerender middleware for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createPrerenderMiddleware } from "@repo/seo/prerender";
 *
 * const prerender = createPrerenderMiddleware({
 *   rendererUrl: "https://service.prerender.io",
 *   cacheTtl: 600,
 *   excludeRoutes: ["/api/", "/admin/", "/auth/"],
 * });
 *
 * export default {
 *   async fetch(request, env, ctx) {
 *     const result = await prerender(request, ctx);
 *     if (result.prerendered) {
 *       return result.response;
 *     }
 *     // Serve SPA for regular users
 *     return fetch(request);
 *   },
 * };
 * ```
 */
export function createPrerenderMiddleware(config: PrerenderConfig = {}) {
	const {
		rendererUrl,
		cacheTtl = 600,
		swr = 86400,
		shouldPrerender: customShouldPrerender,
		onError,
	} = config;

	return async (request: Request, ctx: ExecutionContext): Promise<PrerenderResult> => {
		const url = new URL(request.url);
		const bot = detectBot(request);

		// Check if we should prerender
		const shouldPrerender = customShouldPrerender
			? customShouldPrerender(request)
			: shouldPrerenderCheck(request);

		if (!shouldPrerender) {
			return {
				response: await fetch(request),
				prerendered: false,
				cached: false,
				bot,
			};
		}

		// Check route exclusions
		if (!shouldPrerenderRoute(url.pathname, config)) {
			return {
				response: await fetch(request),
				prerendered: false,
				cached: false,
				bot,
			};
		}

		// Check cache first
		const cache = (caches as any).default as Cache;
		const cacheKey = new Request(url.toString(), {
			method: "GET",
			headers: { Accept: "text/html" },
		});

		const cachedResponse = await cache.match(cacheKey);
		if (cachedResponse) {
			return {
				response: cachedResponse,
				prerendered: true,
				cached: true,
				bot,
			};
		}

		// Fetch prerendered content
		try {
			let prerenderResponse: Response;

			if (rendererUrl) {
				// Use external renderer service
				const renderUrl = `${rendererUrl}${encodeURIComponent(url.toString())}`;
				prerenderResponse = await fetch(renderUrl, {
					headers: {
						"User-Agent": request.headers.get("User-Agent") || "",
					},
				});
			} else {
				// Fallback to origin
				prerenderResponse = await fetch(request);
			}

			if (!prerenderResponse.ok) {
				// Fallback to origin on error
				return {
					response: await fetch(request),
					prerendered: false,
					cached: false,
					bot,
				};
			}

			// Create cacheable response
			const html = await prerenderResponse.text();
			const response = new Response(html, {
				status: 200,
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					"Cache-Control": `public, max-age=${cacheTtl}, s-maxage=${cacheTtl}, stale-while-revalidate=${swr}`,
					Vary: "Accept-Encoding, User-Agent",
					"X-Prerendered": "true",
					"X-Bot": bot.botName || "unknown",
				},
			});

			// Cache in background
			ctx.waitUntil(cache.put(cacheKey, response.clone()));

			return {
				response,
				prerendered: true,
				cached: false,
				bot,
			};
		} catch (error) {
			if (onError) {
				onError(error as Error, request);
			}
			console.error("[Prerender] Error:", error);

			// Fallback to origin
			return {
				response: await fetch(request),
				prerendered: false,
				cached: false,
				bot,
			};
		}
	};
}

/**
 * Simple prerender handler for basic use cases
 *
 * @example
 * ```ts
 * import { handlePrerender } from "@repo/seo/prerender";
 *
 * export default {
 *   async fetch(request, env, ctx) {
 *     return handlePrerender(request, ctx, {
 *       origin: "https://my-spa.example.com",
 *       excludeRoutes: ["/api/"],
 *     });
 *   },
 * };
 * ```
 */
export async function handlePrerender(
	request: Request,
	ctx: ExecutionContext,
	options: {
		origin?: string;
		excludeRoutes?: string[];
		cacheTtl?: number;
	} = {},
): Promise<Response> {
	const { origin, excludeRoutes = [], cacheTtl = 600 } = options;
	const url = new URL(request.url);

	// Check if bot
	if (!shouldPrerenderCheck(request)) {
		return origin
			? fetch(new Request(origin + url.pathname + url.search, request))
			: fetch(request);
	}

	// Check exclusions
	for (const route of excludeRoutes) {
		if (url.pathname.startsWith(route)) {
			return origin
				? fetch(new Request(origin + url.pathname + url.search, request))
				: fetch(request);
		}
	}

	// Check cache
	const cache = (caches as any).default as Cache;
	const cacheKey = new Request(url.toString(), {
		method: "GET",
		headers: { Accept: "text/html" },
	});

	const cached = await cache.match(cacheKey);
	if (cached) {
		return cached;
	}

	// Fetch from origin
	const originUrl = origin ? origin + url.pathname + url.search : request.url;
	const response = await fetch(originUrl);

	if (!response.ok) {
		return response;
	}

	// Cache the response
	const html = await response.text();
	const cachedResponse = new Response(html, {
		status: 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Cache-Control": `public, max-age=${cacheTtl}`,
			"X-Prerendered": "true",
		},
	});

	ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));

	return cachedResponse;
}

/**
 * Inject meta tags into HTML using HTMLRewriter
 *
 * @example
 * ```ts
 * import { injectMetaTags } from "@repo/seo/prerender";
 *
 * const response = await fetch(request);
 * return injectMetaTags(response, {
 *   title: "My Page",
 *   description: "Page description",
 *   "og:image": "https://example.com/og.jpg",
 * });
 * ```
 */
export function injectMetaTags(response: Response, meta: Record<string, string>): Response {
	let rewriter = new HTMLRewriter();

	// Update title
	if (meta.title) {
		rewriter = rewriter.on("title", {
			element(element) {
				element.setInnerContent(meta.title);
			},
		});
	}

	// Update/add meta tags
	const metaTagsToAdd: Array<{ name?: string; property?: string; content: string }> = [];

	for (const [key, value] of Object.entries(meta)) {
		if (key === "title") continue;

		if (key.startsWith("og:") || key.startsWith("article:") || key.startsWith("product:")) {
			metaTagsToAdd.push({ property: key, content: value });
		} else {
			metaTagsToAdd.push({ name: key, content: value });
		}
	}

	// Add meta tags to head
	if (metaTagsToAdd.length > 0) {
		rewriter = rewriter.on("head", {
			element(element) {
				for (const tag of metaTagsToAdd) {
					if (tag.property) {
						element.append(
							`<meta property="${tag.property}" content="${escapeHtml(tag.content)}">`,
							{ html: true },
						);
					} else if (tag.name) {
						element.append(`<meta name="${tag.name}" content="${escapeHtml(tag.content)}">`, {
							html: true,
						});
					}
				}
			},
		});
	}

	return rewriter.transform(response);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
