/**
 * Stripe Subscription management utilities
 *
 * @example
 * ```ts
 * import { createStripe } from "@repo/payments/stripe";
 * import {
 *   getSubscription,
 *   cancelSubscription,
 *   updateSubscription,
 * } from "@repo/payments/stripe/subscriptions";
 *
 * const stripe = createStripe(env.STRIPE_SECRET_KEY);
 *
 * // Get subscription
 * const sub = await getSubscription(stripe, "sub_xxx");
 *
 * // Cancel at period end
 * await cancelSubscription(stripe, "sub_xxx", { atPeriodEnd: true });
 *
 * // Upgrade/downgrade
 * await updateSubscription(stripe, "sub_xxx", { priceId: "price_new" });
 * ```
 */

import type Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export type SubscriptionStatus = Stripe.Subscription["status"];

export interface SubscriptionInfo {
	id: string;
	status: SubscriptionStatus;
	customerId: string;
	priceId: string | null;
	productId: string | null;
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	cancelAtPeriodEnd: boolean;
	canceledAt: Date | null;
	trialStart: Date | null;
	trialEnd: Date | null;
	metadata: Record<string, string>;
}

export interface UpdateSubscriptionOptions {
	/** New price ID */
	priceId?: string;
	/** Quantity */
	quantity?: number;
	/** Proration behavior */
	prorationBehavior?: "create_prorations" | "none" | "always_invoice";
	/** Cancel at period end */
	cancelAtPeriodEnd?: boolean;
	/** Metadata */
	metadata?: Record<string, string>;
	/** Trial end (timestamp or "now") */
	trialEnd?: number | "now";
}

export interface CancelSubscriptionOptions {
	/** Cancel at end of billing period instead of immediately */
	atPeriodEnd?: boolean;
	/** Cancellation reason */
	cancellationReason?: string;
	/** Feedback */
	feedback?: Stripe.SubscriptionCancelParams.CancellationDetails.Feedback;
}

// ============================================================================
// Subscription Retrieval
// ============================================================================

/**
 * Get a subscription by ID
 */
export async function getSubscription(
	stripe: Stripe,
	subscriptionId: string,
	options: { expand?: string[] } = {},
): Promise<Stripe.Subscription> {
	return stripe.subscriptions.retrieve(subscriptionId, {
		expand: options.expand,
	});
}

/**
 * Get subscription with expanded data
 */
export async function getSubscriptionExpanded(
	stripe: Stripe,
	subscriptionId: string,
): Promise<Stripe.Subscription> {
	return stripe.subscriptions.retrieve(subscriptionId, {
		expand: ["default_payment_method", "latest_invoice", "customer"],
	});
}

/**
 * Parse subscription into a simpler format
 */
export function parseSubscription(subscription: Stripe.Subscription): SubscriptionInfo {
	const item = subscription.items.data[0];

	return {
		id: subscription.id,
		status: subscription.status,
		customerId:
			typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
		priceId: item?.price?.id ?? null,
		productId:
			typeof item?.price?.product === "string"
				? item.price.product
				: (item?.price?.product?.id ?? null),
		currentPeriodStart: new Date(subscription.current_period_start * 1000),
		currentPeriodEnd: new Date(subscription.current_period_end * 1000),
		cancelAtPeriodEnd: subscription.cancel_at_period_end,
		canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
		trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
		trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
		metadata: (subscription.metadata as Record<string, string>) ?? {},
	};
}

/**
 * List subscriptions for a customer
 */
export async function listCustomerSubscriptions(
	stripe: Stripe,
	customerId: string,
	options: {
		status?: SubscriptionStatus | "all";
		limit?: number;
	} = {},
): Promise<Stripe.Subscription[]> {
	const params: Stripe.SubscriptionListParams = {
		customer: customerId,
		limit: options.limit ?? 10,
	};

	if (options.status && options.status !== "all") {
		params.status = options.status;
	}

	const subscriptions = await stripe.subscriptions.list(params);
	return subscriptions.data;
}

/**
 * Get active subscription for a customer
 */
export async function getActiveSubscription(
	stripe: Stripe,
	customerId: string,
): Promise<Stripe.Subscription | null> {
	const subscriptions = await listCustomerSubscriptions(stripe, customerId, {
		status: "active",
		limit: 1,
	});
	return subscriptions[0] ?? null;
}

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Update a subscription
 */
export async function updateSubscription(
	stripe: Stripe,
	subscriptionId: string,
	options: UpdateSubscriptionOptions,
): Promise<Stripe.Subscription> {
	const params: Stripe.SubscriptionUpdateParams = {};

	if (options.priceId) {
		// Get current subscription to find the item ID
		const subscription = await stripe.subscriptions.retrieve(subscriptionId);
		const itemId = subscription.items.data[0]?.id;

		if (itemId) {
			params.items = [
				{
					id: itemId,
					price: options.priceId,
					quantity: options.quantity,
				},
			];
		}
	}

	if (options.prorationBehavior) {
		params.proration_behavior = options.prorationBehavior;
	}

	if (options.cancelAtPeriodEnd !== undefined) {
		params.cancel_at_period_end = options.cancelAtPeriodEnd;
	}

	if (options.metadata) {
		params.metadata = options.metadata;
	}

	if (options.trialEnd) {
		params.trial_end = options.trialEnd;
	}

	return stripe.subscriptions.update(subscriptionId, params);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
	stripe: Stripe,
	subscriptionId: string,
	options: CancelSubscriptionOptions = {},
): Promise<Stripe.Subscription> {
	if (options.atPeriodEnd) {
		return stripe.subscriptions.update(subscriptionId, {
			cancel_at_period_end: true,
		});
	}

	const params: Stripe.SubscriptionCancelParams = {};

	if (options.cancellationReason || options.feedback) {
		params.cancellation_details = {};
		if (options.cancellationReason) {
			params.cancellation_details.comment = options.cancellationReason;
		}
		if (options.feedback) {
			params.cancellation_details.feedback = options.feedback;
		}
	}

	return stripe.subscriptions.cancel(subscriptionId, params);
}

/**
 * Resume a canceled subscription (if canceled at period end)
 */
export async function resumeSubscription(
	stripe: Stripe,
	subscriptionId: string,
): Promise<Stripe.Subscription> {
	return stripe.subscriptions.update(subscriptionId, {
		cancel_at_period_end: false,
	});
}

/**
 * Pause a subscription (by setting pause_collection)
 */
export async function pauseSubscription(
	stripe: Stripe,
	subscriptionId: string,
	options: {
		behavior?: "keep_as_draft" | "mark_uncollectible" | "void";
		resumesAt?: Date;
	} = {},
): Promise<Stripe.Subscription> {
	return stripe.subscriptions.update(subscriptionId, {
		pause_collection: {
			behavior: options.behavior ?? "mark_uncollectible",
			resumes_at: options.resumesAt ? Math.floor(options.resumesAt.getTime() / 1000) : undefined,
		},
	});
}

/**
 * Unpause a subscription
 */
export async function unpauseSubscription(
	stripe: Stripe,
	subscriptionId: string,
): Promise<Stripe.Subscription> {
	return stripe.subscriptions.update(subscriptionId, {
		pause_collection: "",
	});
}

// ============================================================================
// Status Helpers
// ============================================================================

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription: Stripe.Subscription): boolean {
	return subscription.status === "active" || subscription.status === "trialing";
}

/**
 * Check if subscription is in trial
 */
export function isSubscriptionTrialing(subscription: Stripe.Subscription): boolean {
	return subscription.status === "trialing";
}

/**
 * Check if subscription will cancel at period end
 */
export function willCancelAtPeriodEnd(subscription: Stripe.Subscription): boolean {
	return subscription.cancel_at_period_end;
}

/**
 * Get days remaining in current period
 */
export function getDaysRemaining(subscription: Stripe.Subscription): number {
	const now = Date.now();
	const periodEnd = subscription.current_period_end * 1000;
	const diff = periodEnd - now;
	return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription: Stripe.Subscription): number | null {
	if (!subscription.trial_end) return null;
	const now = Date.now();
	const trialEnd = subscription.trial_end * 1000;
	const diff = trialEnd - now;
	return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
