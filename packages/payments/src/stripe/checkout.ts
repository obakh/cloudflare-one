/**
 * Stripe Checkout utilities
 *
 * @example Create checkout session
 * ```ts
 * import { createStripe } from "@repo/payments/stripe";
 * import { createSubscriptionCheckout, createOneTimeCheckout } from "@repo/payments/stripe/checkout";
 *
 * const stripe = createStripe(env.STRIPE_SECRET_KEY);
 *
 * // Subscription checkout
 * const session = await createSubscriptionCheckout(stripe, {
 *   priceId: "price_xxx",
 *   successUrl: "https://example.com/success",
 *   cancelUrl: "https://example.com/cancel",
 *   customerId: "cus_xxx",
 * });
 *
 * // One-time payment
 * const payment = await createOneTimeCheckout(stripe, {
 *   priceId: "price_xxx",
 *   successUrl: "https://example.com/success",
 *   cancelUrl: "https://example.com/cancel",
 * });
 * ```
 */

import type Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export interface BaseCheckoutOptions {
	/** Success redirect URL (use {CHECKOUT_SESSION_ID} for session ID) */
	successUrl: string;
	/** Cancel redirect URL */
	cancelUrl: string;
	/** Existing customer ID */
	customerId?: string;
	/** Customer email (for new customers) */
	customerEmail?: string;
	/** Allow promotion codes */
	allowPromotionCodes?: boolean;
	/** Custom metadata */
	metadata?: Record<string, string>;
	/** Client reference ID */
	clientReferenceId?: string;
}

export interface SubscriptionCheckoutOptions extends BaseCheckoutOptions {
	/** Price ID for the subscription */
	priceId: string;
	/** Quantity (default: 1) */
	quantity?: number;
	/** Trial period in days */
	trialDays?: number;
	/** Subscription metadata */
	subscriptionMetadata?: Record<string, string>;
}

export interface OneTimeCheckoutOptions extends BaseCheckoutOptions {
	/** Price ID for one-time payment */
	priceId?: string;
	/** Or specify amount directly */
	amount?: number;
	/** Currency (required if using amount) */
	currency?: string;
	/** Product name (required if using amount) */
	productName?: string;
	/** Product description */
	productDescription?: string;
	/** Quantity (default: 1) */
	quantity?: number;
}

export interface MultiItemCheckoutOptions extends BaseCheckoutOptions {
	/** Line items */
	lineItems: Array<{
		priceId: string;
		quantity: number;
	}>;
	/** Checkout mode */
	mode: "payment" | "subscription";
}

// ============================================================================
// Checkout Session Creators
// ============================================================================

/**
 * Create a subscription checkout session
 */
export async function createSubscriptionCheckout(
	stripe: Stripe,
	options: SubscriptionCheckoutOptions,
): Promise<Stripe.Checkout.Session> {
	const {
		priceId,
		quantity = 1,
		successUrl,
		cancelUrl,
		customerId,
		customerEmail,
		allowPromotionCodes = true,
		metadata,
		clientReferenceId,
		trialDays,
		subscriptionMetadata,
	} = options;

	const params: Stripe.Checkout.SessionCreateParams = {
		mode: "subscription",
		line_items: [{ price: priceId, quantity }],
		success_url: successUrl,
		cancel_url: cancelUrl,
		allow_promotion_codes: allowPromotionCodes,
	};

	if (customerId) {
		params.customer = customerId;
	} else if (customerEmail) {
		params.customer_email = customerEmail;
	}

	if (metadata) {
		params.metadata = metadata;
	}

	if (clientReferenceId) {
		params.client_reference_id = clientReferenceId;
	}

	if (trialDays || subscriptionMetadata) {
		params.subscription_data = {};
		if (trialDays) {
			params.subscription_data.trial_period_days = trialDays;
		}
		if (subscriptionMetadata) {
			params.subscription_data.metadata = subscriptionMetadata;
		}
	}

	return stripe.checkout.sessions.create(params);
}

/**
 * Create a one-time payment checkout session
 */
export async function createOneTimeCheckout(
	stripe: Stripe,
	options: OneTimeCheckoutOptions,
): Promise<Stripe.Checkout.Session> {
	const {
		priceId,
		amount,
		currency = "usd",
		productName,
		productDescription,
		quantity = 1,
		successUrl,
		cancelUrl,
		customerId,
		customerEmail,
		allowPromotionCodes = false,
		metadata,
		clientReferenceId,
	} = options;

	const params: Stripe.Checkout.SessionCreateParams = {
		mode: "payment",
		success_url: successUrl,
		cancel_url: cancelUrl,
		allow_promotion_codes: allowPromotionCodes,
	};

	// Line items - either from price ID or custom amount
	if (priceId) {
		params.line_items = [{ price: priceId, quantity }];
	} else if (amount && productName) {
		params.line_items = [
			{
				price_data: {
					currency,
					unit_amount: amount,
					product_data: {
						name: productName,
						description: productDescription,
					},
				},
				quantity,
			},
		];
	} else {
		throw new Error("Either priceId or (amount + productName) is required");
	}

	if (customerId) {
		params.customer = customerId;
	} else if (customerEmail) {
		params.customer_email = customerEmail;
	}

	if (metadata) {
		params.metadata = metadata;
	}

	if (clientReferenceId) {
		params.client_reference_id = clientReferenceId;
	}

	return stripe.checkout.sessions.create(params);
}

/**
 * Create a multi-item checkout session
 */
export async function createMultiItemCheckout(
	stripe: Stripe,
	options: MultiItemCheckoutOptions,
): Promise<Stripe.Checkout.Session> {
	const {
		lineItems,
		mode,
		successUrl,
		cancelUrl,
		customerId,
		customerEmail,
		allowPromotionCodes = true,
		metadata,
		clientReferenceId,
	} = options;

	const params: Stripe.Checkout.SessionCreateParams = {
		mode,
		line_items: lineItems.map((item) => ({
			price: item.priceId,
			quantity: item.quantity,
		})),
		success_url: successUrl,
		cancel_url: cancelUrl,
		allow_promotion_codes: allowPromotionCodes,
	};

	if (customerId) {
		params.customer = customerId;
	} else if (customerEmail) {
		params.customer_email = customerEmail;
	}

	if (metadata) {
		params.metadata = metadata;
	}

	if (clientReferenceId) {
		params.client_reference_id = clientReferenceId;
	}

	return stripe.checkout.sessions.create(params);
}

// ============================================================================
// Session Retrieval
// ============================================================================

/**
 * Retrieve a checkout session with line items
 */
export async function getCheckoutSession(
	stripe: Stripe,
	sessionId: string,
	options: { expandLineItems?: boolean; expandCustomer?: boolean } = {},
): Promise<Stripe.Checkout.Session> {
	const expand: string[] = [];

	if (options.expandLineItems) {
		expand.push("line_items");
	}
	if (options.expandCustomer) {
		expand.push("customer");
	}

	return stripe.checkout.sessions.retrieve(sessionId, {
		expand: expand.length > 0 ? expand : undefined,
	});
}

/**
 * Get checkout session line items
 */
export async function getCheckoutLineItems(
	stripe: Stripe,
	sessionId: string,
): Promise<Stripe.LineItem[]> {
	const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
	return lineItems.data;
}

// ============================================================================
// URL Builders
// ============================================================================

/**
 * Build success URL with session ID placeholder
 */
export function buildSuccessUrl(baseUrl: string, path = "/checkout/success"): string {
	const url = new URL(path, baseUrl);
	url.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
	return url.toString();
}

/**
 * Build cancel URL
 */
export function buildCancelUrl(baseUrl: string, path = "/checkout/cancel"): string {
	return new URL(path, baseUrl).toString();
}
