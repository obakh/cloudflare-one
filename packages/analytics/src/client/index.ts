/**
 * Cloudflare Zaraz Web API Client
 *
 * Thin wrapper around Zaraz's Web API for type-safe analytics tracking.
 * All third-party tools (GA4, Facebook Pixel, etc.) are configured in the
 * Cloudflare dashboard - this just calls zaraz.track(), zaraz.set(), etc.
 *
 * @see https://developers.cloudflare.com/zaraz/web-api/
 */

/**
 * Event properties type
 */
export type EventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * E-commerce item (follows Zaraz e-commerce spec)
 * @see https://developers.cloudflare.com/zaraz/web-api/ecommerce/
 */
export interface EcommerceItem {
	product_id: string;
	sku?: string;
	name: string;
	price?: number;
	quantity?: number;
	category?: string;
	brand?: string;
	variant?: string;
	position?: number;
	coupon?: string;
}

/**
 * E-commerce event data
 */
export interface EcommerceData {
	/** Order/cart ID */
	order_id?: string;
	/** Checkout ID */
	checkout_id?: string;
	/** Total value */
	total?: number;
	/** Revenue (excluding tax/shipping) */
	revenue?: number;
	/** Shipping cost */
	shipping?: number;
	/** Tax amount */
	tax?: number;
	/** Discount amount */
	discount?: number;
	/** Coupon code */
	coupon?: string;
	/** Currency code (USD, EUR, etc.) */
	currency?: string;
	/** Products */
	products?: EcommerceItem[];
	/** Search query (for Products Searched event) */
	query?: string;
	/** List ID (for Product List Viewed) */
	list_id?: string;
	/** Category (for Product List Viewed) */
	category?: string;
	/** Checkout step number */
	step?: number;
	/** Payment method */
	payment_method?: string;
	/** Shipping method */
	shipping_method?: string;
}

/**
 * Zaraz e-commerce event names
 * @see https://developers.cloudflare.com/zaraz/web-api/ecommerce/
 */
export type EcommerceEventName =
	| "Product List Viewed"
	| "Products Searched"
	| "Product Clicked"
	| "Product Added"
	| "Product Added to Wishlist"
	| "Product Removed"
	| "Product Viewed"
	| "Cart Viewed"
	| "Checkout Started"
	| "Checkout Step Viewed"
	| "Checkout Step Completed"
	| "Payment Info Entered"
	| "Order Completed"
	| "Order Updated"
	| "Order Refunded"
	| "Order Cancelled";

/**
 * Debug mode configuration
 */
interface DebugConfig {
	enabled: boolean;
}

const debugConfig: DebugConfig = { enabled: false };

/**
 * Enable/disable debug mode
 * When enabled, logs all Zaraz calls to console
 *
 * @example
 * ```ts
 * import { setDebug } from "@repo/analytics/client";
 *
 * // Enable in development
 * setDebug(import.meta.env.DEV);
 * ```
 */
export function setDebug(enabled: boolean): void {
	debugConfig.enabled = enabled;
}

/**
 * Check if Zaraz is available
 */
function isZarazAvailable(): boolean {
	return typeof window !== "undefined" && typeof window.zaraz !== "undefined";
}

/**
 * Track a custom event
 *
 * Sends event to all tools configured in Zaraz dashboard that listen for this event.
 *
 * @see https://developers.cloudflare.com/zaraz/web-api/track/
 *
 * @example
 * ```ts
 * import { track } from "@repo/analytics/client";
 *
 * // Simple event
 * track("button_click");
 *
 * // Event with properties
 * track("form_submit", {
 *   form_id: "contact",
 *   form_name: "Contact Form",
 * });
 *
 * // Await completion
 * await track("purchase_complete", { value: 99.99 });
 * ```
 */
export async function track(eventName: string, properties?: EventProperties): Promise<void> {
	if (debugConfig.enabled) {
		console.log("[Zaraz] track:", eventName, properties);
	}

	if (!isZarazAvailable()) {
		if (debugConfig.enabled) {
			console.warn("[Zaraz] Not available - event not sent:", eventName);
		}
		return;
	}

	try {
		await window.zaraz.track(eventName, properties);
	} catch (error) {
		console.error("[Zaraz] track error:", error);
	}
}

/**
 * Set a variable that will be sent with every future track call
 *
 * Use this to set persistent context like user type, experiment variant, etc.
 *
 * @see https://developers.cloudflare.com/zaraz/web-api/set/
 *
 * @example
 * ```ts
 * import { set } from "@repo/analytics/client";
 *
 * // Set user context
 * set("user_type", "premium");
 * set("user_id", "usr_123");
 *
 * // Set experiment variant
 * set("experiment_variant", "A");
 *
 * // All future track() calls will include these variables
 * track("page_view"); // includes user_type, user_id, experiment_variant
 * ```
 */
export function set(key: string, value: string | number | boolean | null): void {
	if (debugConfig.enabled) {
		console.log("[Zaraz] set:", key, "=", value);
	}

	if (!isZarazAvailable()) {
		if (debugConfig.enabled) {
			console.warn("[Zaraz] Not available - variable not set:", key);
		}
		return;
	}

	try {
		window.zaraz.set(key, value);
	} catch (error) {
		console.error("[Zaraz] set error:", error);
	}
}

/**
 * Track e-commerce events
 *
 * Unified method for sending e-commerce data to multiple tools (GA4, Facebook Pixel, etc.)
 *
 * @see https://developers.cloudflare.com/zaraz/web-api/ecommerce/
 *
 * @example
 * ```ts
 * import { ecommerce } from "@repo/analytics/client";
 *
 * // Product viewed
 * await ecommerce("Product Viewed", {
 *   products: [{
 *     product_id: "SKU123",
 *     name: "T-Shirt",
 *     price: 29.99,
 *     category: "Apparel",
 *   }],
 * });
 *
 * // Add to cart
 * await ecommerce("Product Added", {
 *   products: [{
 *     product_id: "SKU123",
 *     name: "T-Shirt",
 *     price: 29.99,
 *     quantity: 1,
 *   }],
 * });
 *
 * // Purchase complete
 * await ecommerce("Order Completed", {
 *   order_id: "ORD-12345",
 *   total: 64.97,
 *   revenue: 59.98,
 *   shipping: 4.99,
 *   tax: 5.00,
 *   currency: "USD",
 *   products: [
 *     { product_id: "SKU123", name: "T-Shirt", price: 29.99, quantity: 2 },
 *   ],
 * });
 * ```
 */
export async function ecommerce(
	eventName: EcommerceEventName,
	data?: EcommerceData,
): Promise<void> {
	if (debugConfig.enabled) {
		console.log("[Zaraz] ecommerce:", eventName, data);
	}

	if (!isZarazAvailable()) {
		if (debugConfig.enabled) {
			console.warn("[Zaraz] Not available - ecommerce event not sent:", eventName);
		}
		return;
	}

	try {
		await window.zaraz.ecommerce(eventName, data);
	} catch (error) {
		console.error("[Zaraz] ecommerce error:", error);
	}
}

// Convenience methods for common e-commerce events

/**
 * Track product view
 */
export async function trackProductView(product: EcommerceItem): Promise<void> {
	await ecommerce("Product Viewed", { products: [product] });
}

/**
 * Track add to cart
 */
export async function trackAddToCart(product: EcommerceItem, quantity = 1): Promise<void> {
	await ecommerce("Product Added", {
		products: [{ ...product, quantity }],
	});
}

/**
 * Track remove from cart
 */
export async function trackRemoveFromCart(product: EcommerceItem, quantity = 1): Promise<void> {
	await ecommerce("Product Removed", {
		products: [{ ...product, quantity }],
	});
}

/**
 * Track checkout started
 */
export async function trackCheckoutStarted(data: EcommerceData): Promise<void> {
	await ecommerce("Checkout Started", data);
}

/**
 * Track purchase/order completed
 */
export async function trackPurchase(data: EcommerceData): Promise<void> {
	await ecommerce("Order Completed", data);
}

// Type declarations for Zaraz global
declare global {
	interface Window {
		zaraz: {
			track: (eventName: string, properties?: EventProperties) => Promise<void>;
			set: (key: string, value: string | number | boolean | null) => void;
			ecommerce: (eventName: string, data?: EcommerceData) => Promise<void>;
			consent?: {
				get: (purpose: string) => boolean;
				set: (purpose: string, granted: boolean) => void;
				getAll: () => Record<string, boolean>;
				setAll: (consents: Record<string, boolean>) => void;
				hasDecision?: () => boolean;
			};
		};
	}
}
