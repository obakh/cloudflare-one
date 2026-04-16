/**
 * @repo/analytics - Cloudflare Zaraz Analytics
 *
 * Type-safe wrapper around Cloudflare Zaraz for analytics tracking.
 * All third-party tools (GA4, Facebook Pixel, etc.) are configured in the
 * Cloudflare dashboard - this package provides the client-side API.
 *
 * @see https://developers.cloudflare.com/zaraz/
 *
 * @example
 * ```ts
 * // Client-side tracking
 * import { track, set, ecommerce } from "@repo/analytics/client";
 *
 * // Set persistent variables
 * set("user_type", "premium");
 *
 * // Track events
 * track("button_click", { button_id: "cta" });
 *
 * // E-commerce
 * ecommerce("Order Completed", {
 *   order_id: "ORD-123",
 *   total: 99.99,
 *   products: [{ product_id: "SKU1", name: "T-Shirt", price: 29.99 }],
 * });
 *
 * // Server-side (Cloudflare Workers)
 * import { createServerAnalytics, extractClientInfo } from "@repo/analytics/server";
 *
 * const analytics = createServerAnalytics({ domain: "example.com" });
 * ctx.waitUntil(analytics.track("page_view", {}, extractClientInfo(request)));
 * ```
 */

// Client-side Zaraz Web API
export {
	type EcommerceData,
	type EcommerceEventName,
	type EcommerceItem,
	type EventProperties,
	ecommerce,
	set,
	setDebug,
	track,
	trackAddToCart,
	trackCheckoutStarted,
	trackProductView,
	trackPurchase,
	trackRemoveFromCart,
} from "./client/index.js";
// Consent management
export {
	CONSENT_PURPOSES,
	ConsentProvider,
	type ConsentProviderProps,
	type ConsentPurpose,
	getAllConsent,
	getConsent,
	hasConsentDecision,
	setAllConsent,
	setConsent,
	useConsent,
	useConsentPurpose,
} from "./consent/index.js";
// Server-side Zaraz HTTP Events API
export {
	type ClientInfo,
	createAnalyticsMiddleware,
	createServerAnalytics,
	extractClientInfo,
	type ServerAnalyticsConfig,
	type ServerEventProperties,
} from "./server/index.js";
