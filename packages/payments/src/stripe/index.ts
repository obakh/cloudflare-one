/**
 * Stripe payment integration for Cloudflare Workers
 *
 * @example Basic usage
 * ```ts
 * import { createStripe } from "@repo/payments/stripe";
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     const stripe = createStripe(env.STRIPE_SECRET_KEY);
 *
 *     // Create a checkout session
 *     const session = await stripe.checkout.sessions.create({
 *       mode: "subscription",
 *       line_items: [{ price: "price_xxx", quantity: 1 }],
 *       success_url: "https://example.com/success",
 *       cancel_url: "https://example.com/cancel",
 *     });
 *
 *     return Response.redirect(session.url!);
 *   }
 * };
 * ```
 */

import Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export interface StripeConfig {
	/** Stripe API version (optional, uses latest by default) */
	apiVersion?: Stripe.LatestApiVersion;
	/** Custom fetch implementation (optional) */
	httpClient?: Stripe.HttpClient;
}

export interface CreateCheckoutOptions {
	/** Price ID or array of line items */
	priceId?: string;
	lineItems?: Stripe.Checkout.SessionCreateParams.LineItem[];
	/** Checkout mode */
	mode: "payment" | "subscription" | "setup";
	/** Success redirect URL */
	successUrl: string;
	/** Cancel redirect URL */
	cancelUrl: string;
	/** Customer ID (optional) */
	customerId?: string;
	/** Customer email (optional, for new customers) */
	customerEmail?: string;
	/** Allow promotion codes */
	allowPromotionCodes?: boolean;
	/** Metadata */
	metadata?: Record<string, string>;
	/** Trial period days (for subscriptions) */
	trialPeriodDays?: number;
	/** Subscription data */
	subscriptionData?: Stripe.Checkout.SessionCreateParams.SubscriptionData;
}

export interface CreatePortalOptions {
	/** Customer ID */
	customerId: string;
	/** Return URL after portal session */
	returnUrl: string;
}

// ============================================================================
// Core
// ============================================================================

/**
 * Create a Stripe client for Cloudflare Workers
 *
 * @example
 * ```ts
 * const stripe = createStripe(env.STRIPE_SECRET_KEY);
 * ```
 */
export function createStripe(secretKey: string, config: StripeConfig = {}): Stripe {
	return new Stripe(secretKey, {
		apiVersion: config.apiVersion,
		httpClient: config.httpClient ?? Stripe.createFetchHttpClient(),
	});
}

/**
 * Create a Stripe client with environment bindings
 *
 * @example
 * ```ts
 * const stripe = createStripeFromEnv(env);
 * ```
 */
export function createStripeFromEnv(env: { STRIPE_SECRET_KEY: string }): Stripe {
	return createStripe(env.STRIPE_SECRET_KEY);
}

// ============================================================================
// Quick Helpers
// ============================================================================

/**
 * Create a checkout session quickly
 *
 * @example
 * ```ts
 * const session = await createCheckoutSession(stripe, {
 *   priceId: "price_xxx",
 *   mode: "subscription",
 *   successUrl: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
 *   cancelUrl: "https://example.com/cancel",
 * });
 * ```
 */
export async function createCheckoutSession(
	stripe: Stripe,
	options: CreateCheckoutOptions,
): Promise<Stripe.Checkout.Session> {
	const {
		priceId,
		lineItems,
		mode,
		successUrl,
		cancelUrl,
		customerId,
		customerEmail,
		allowPromotionCodes = false,
		metadata,
		trialPeriodDays,
		subscriptionData,
	} = options;

	const params: Stripe.Checkout.SessionCreateParams = {
		mode,
		success_url: successUrl,
		cancel_url: cancelUrl,
		allow_promotion_codes: allowPromotionCodes,
	};

	// Line items
	if (lineItems) {
		params.line_items = lineItems;
	} else if (priceId) {
		params.line_items = [{ price: priceId, quantity: 1 }];
	}

	// Customer
	if (customerId) {
		params.customer = customerId;
	} else if (customerEmail) {
		params.customer_email = customerEmail;
	}

	// Metadata
	if (metadata) {
		params.metadata = metadata;
	}

	// Subscription-specific
	if (mode === "subscription") {
		if (trialPeriodDays || subscriptionData) {
			params.subscription_data = {
				...subscriptionData,
				trial_period_days: trialPeriodDays ?? subscriptionData?.trial_period_days,
			};
		}
	}

	return stripe.checkout.sessions.create(params);
}

/**
 * Create a customer portal session
 *
 * @example
 * ```ts
 * const portal = await createPortalSession(stripe, {
 *   customerId: "cus_xxx",
 *   returnUrl: "https://example.com/account",
 * });
 * ```
 */
export async function createPortalSession(
	stripe: Stripe,
	options: CreatePortalOptions,
): Promise<Stripe.BillingPortal.Session> {
	return stripe.billingPortal.sessions.create({
		customer: options.customerId,
		return_url: options.returnUrl,
	});
}

// ============================================================================
// Re-exports
// ============================================================================

export { Stripe };
export type { Stripe as StripeType } from "stripe";
