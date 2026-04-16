/**
 * Stripe Webhook handling for Cloudflare Workers
 *
 * @example Basic webhook handler
 * ```ts
 * import { createWebhookHandler, type WebhookHandlers } from "@repo/payments/stripe/webhooks";
 *
 * const handlers: WebhookHandlers = {
 *   "checkout.session.completed": async (event) => {
 *     const session = event.data.object;
 *     console.log("Checkout completed:", session.id);
 *   },
 *   "customer.subscription.updated": async (event) => {
 *     const subscription = event.data.object;
 *     console.log("Subscription updated:", subscription.id);
 *   },
 * };
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     const handler = createWebhookHandler(env.STRIPE_WEBHOOK_SECRET, handlers);
 *     return handler(request);
 *   }
 * };
 * ```
 */

import Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export type WebhookEventType = Stripe.Event["type"];

export type WebhookHandler<T extends WebhookEventType = WebhookEventType> = (
	event: Stripe.Event & { type: T },
) => Promise<void> | void;

export type WebhookHandlers = {
	[K in WebhookEventType]?: WebhookHandler<K>;
};

export interface WebhookResult {
	success: boolean;
	eventId?: string;
	eventType?: string;
	error?: string;
}

// ============================================================================
// Webhook Verification
// ============================================================================

/**
 * Verify a Stripe webhook signature
 *
 * @example
 * ```ts
 * const event = await verifyWebhookSignature(
 *   await request.text(),
 *   request.headers.get("stripe-signature")!,
 *   env.STRIPE_WEBHOOK_SECRET
 * );
 * ```
 */
export async function verifyWebhookSignature(
	payload: string,
	signature: string,
	secret: string,
): Promise<Stripe.Event> {
	const stripe = new Stripe("", {
		httpClient: Stripe.createFetchHttpClient(),
	});

	return stripe.webhooks.constructEventAsync(payload, signature, secret);
}

/**
 * Verify webhook signature with timing-safe comparison
 * Use this for manual verification if needed
 */
export async function verifySignature(
	payload: string,
	header: string,
	secret: string,
	tolerance = 300, // 5 minutes
): Promise<{ timestamp: number; signatures: string[] }> {
	const parts = header.split(",");
	const timestamp = Number.parseInt(parts.find((p) => p.startsWith("t="))?.slice(2) ?? "0", 10);
	const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));

	if (!timestamp || signatures.length === 0) {
		throw new Error("Invalid webhook signature header");
	}

	// Check timestamp tolerance
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - timestamp) > tolerance) {
		throw new Error("Webhook timestamp outside tolerance");
	}

	// Compute expected signature
	const signedPayload = `${timestamp}.${payload}`;
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
	const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	// Timing-safe comparison
	const valid = signatures.some((sig) => {
		if (sig.length !== expectedSignature.length) return false;
		let result = 0;
		for (let i = 0; i < sig.length; i++) {
			result |= sig.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
		}
		return result === 0;
	});

	if (!valid) {
		throw new Error("Invalid webhook signature");
	}

	return { timestamp, signatures };
}

// ============================================================================
// Webhook Handler
// ============================================================================

/**
 * Create a webhook handler function
 *
 * @example
 * ```ts
 * const handler = createWebhookHandler(env.STRIPE_WEBHOOK_SECRET, {
 *   "checkout.session.completed": async (event) => {
 *     // Handle checkout completion
 *   },
 *   "invoice.paid": async (event) => {
 *     // Handle invoice payment
 *   },
 * });
 *
 * // In your worker
 * if (url.pathname === "/webhooks/stripe") {
 *   return handler(request);
 * }
 * ```
 */
export function createWebhookHandler(
	webhookSecret: string,
	handlers: WebhookHandlers,
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		// Verify method
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		// Get signature
		const signature = request.headers.get("stripe-signature");
		if (!signature) {
			return new Response("Missing signature", { status: 400 });
		}

		try {
			// Verify and parse event
			const payload = await request.text();
			const event = await verifyWebhookSignature(payload, signature, webhookSecret);

			// Find and execute handler
			const handler = handlers[event.type as keyof WebhookHandlers];
			if (handler) {
				await (handler as (event: Stripe.Event) => Promise<void>)(event);
			}

			return new Response(JSON.stringify({ received: true, type: event.type }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Webhook error:", message);

			return new Response(JSON.stringify({ error: message }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}
	};
}

/**
 * Create a Hono-compatible webhook middleware
 *
 * @example
 * ```ts
 * import { Hono } from "hono";
 * import { stripeWebhook } from "@repo/payments/stripe/webhooks";
 *
 * const app = new Hono();
 *
 * app.post("/webhooks/stripe", stripeWebhook({
 *   secret: (c) => c.env.STRIPE_WEBHOOK_SECRET,
 *   handlers: {
 *     "checkout.session.completed": async (event) => {
 *       // Handle event
 *     },
 *   },
 * }));
 * ```
 */
export function stripeWebhook<Env extends { STRIPE_WEBHOOK_SECRET?: string }>(options: {
	secret: string | ((c: { env: Env }) => string);
	handlers: WebhookHandlers;
	onError?: (error: Error, c: { env: Env }) => Response | Promise<Response>;
}) {
	return async (c: {
		req: { raw: Request };
		env: Env;
		json: (data: unknown, status?: number) => Response;
	}) => {
		const secret = typeof options.secret === "function" ? options.secret(c) : options.secret;
		const handler = createWebhookHandler(secret, options.handlers);

		try {
			return await handler(c.req.raw);
		} catch (error) {
			if (options.onError && error instanceof Error) {
				return options.onError(error, c);
			}
			throw error;
		}
	};
}

// ============================================================================
// Common Event Types (for convenience)
// ============================================================================

export const CHECKOUT_EVENTS = [
	"checkout.session.completed",
	"checkout.session.expired",
	"checkout.session.async_payment_succeeded",
	"checkout.session.async_payment_failed",
] as const;

export const SUBSCRIPTION_EVENTS = [
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
	"customer.subscription.paused",
	"customer.subscription.resumed",
	"customer.subscription.trial_will_end",
] as const;

export const INVOICE_EVENTS = [
	"invoice.created",
	"invoice.finalized",
	"invoice.paid",
	"invoice.payment_failed",
	"invoice.payment_succeeded",
	"invoice.upcoming",
] as const;

export const PAYMENT_EVENTS = [
	"payment_intent.succeeded",
	"payment_intent.payment_failed",
	"payment_intent.canceled",
	"payment_intent.processing",
] as const;

export const CUSTOMER_EVENTS = [
	"customer.created",
	"customer.updated",
	"customer.deleted",
] as const;
