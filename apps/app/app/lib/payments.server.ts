/**
 * Server-side payments utilities
 * Uses @repo/payments for Stripe integration
 */
import { createStripe } from "@repo/payments/stripe";

export { createStripe };

/**
 * Payments environment bindings
 */
export interface PaymentsEnv {
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET: string;
}

/**
 * Subscription plans
 */
export const PLANS = {
	free: {
		id: "free",
		name: "Free",
		price: 0,
		priceId: null,
		features: ["Up to 3 team members", "Basic analytics", "Community support"],
		limits: {
			members: 3,
			storage: 1, // GB
			apiCalls: 1000,
		},
	},
	pro: {
		id: "pro",
		name: "Pro",
		price: 29,
		priceId: "price_pro_monthly", // Replace with actual Stripe price ID
		features: [
			"Unlimited team members",
			"Advanced analytics",
			"Priority support",
			"Custom integrations",
		],
		limits: {
			members: -1, // unlimited
			storage: 100, // GB
			apiCalls: 100000,
		},
	},
	enterprise: {
		id: "enterprise",
		name: "Enterprise",
		price: 99,
		priceId: "price_enterprise_monthly", // Replace with actual Stripe price ID
		features: ["Everything in Pro", "SSO/SAML", "Dedicated support", "Custom contracts", "SLA"],
		limits: {
			members: -1,
			storage: -1, // unlimited
			apiCalls: -1,
		},
	},
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];

/**
 * Create payments client
 */
export function createPayments(env: PaymentsEnv) {
	const stripe = createStripe(env.STRIPE_SECRET_KEY);

	return {
		stripe,

		/**
		 * Create checkout session for subscription
		 */
		async createCheckoutSession(options: {
			customerId?: string;
			customerEmail?: string;
			priceId: string;
			successUrl: string;
			cancelUrl: string;
			metadata?: Record<string, string>;
		}) {
			return stripe.checkout.sessions.create({
				mode: "subscription",
				customer: options.customerId,
				customer_email: options.customerId ? undefined : options.customerEmail,
				line_items: [{ price: options.priceId, quantity: 1 }],
				success_url: options.successUrl,
				cancel_url: options.cancelUrl,
				metadata: options.metadata,
			});
		},

		/**
		 * Create customer portal session
		 */
		async createPortalSession(customerId: string, returnUrl: string) {
			return stripe.billingPortal.sessions.create({
				customer: customerId,
				return_url: returnUrl,
			});
		},

		/**
		 * Get subscription details
		 */
		async getSubscription(subscriptionId: string) {
			return stripe.subscriptions.retrieve(subscriptionId);
		},

		/**
		 * Cancel subscription
		 */
		async cancelSubscription(subscriptionId: string, immediately = false) {
			if (immediately) {
				return stripe.subscriptions.cancel(subscriptionId);
			}
			return stripe.subscriptions.update(subscriptionId, {
				cancel_at_period_end: true,
			});
		},

		/**
		 * Verify webhook signature
		 */
		async verifyWebhook(body: string, signature: string) {
			return stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
		},
	};
}
