/**
 * Client-side analytics utilities
 * Uses @repo/analytics for Cloudflare Zaraz integration
 */
import { type EventProperties, ecommerce, set, track } from "@repo/analytics";

export { ecommerce, set, track };

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
	track("page_view", { path, title });
}

/**
 * Track user action
 */
export function trackAction(action: string, properties?: EventProperties) {
	track(action, properties);
}

/**
 * Set user properties for analytics
 */
export function identifyUser(userId: string, properties?: Record<string, string>) {
	set("user_id", userId);
	if (properties) {
		for (const [key, value] of Object.entries(properties)) {
			set(key, value);
		}
	}
}

/**
 * Track subscription event
 */
export function trackSubscription(
	event: "subscription_started" | "subscription_upgraded" | "subscription_cancelled",
	plan: string,
	amount?: number,
) {
	track(event, { plan, amount });
}
