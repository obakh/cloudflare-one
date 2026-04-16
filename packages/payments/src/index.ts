/**
 * @repo/payments - Payment processing utilities
 *
 * Modular payment integrations for Cloudflare Workers.
 *
 * @example Stripe
 * ```ts
 * import { createStripe } from "@repo/payments/stripe";
 *
 * const stripe = createStripe(env.STRIPE_SECRET_KEY);
 * ```
 */

// Re-export all payment providers
export * from "./stripe/index.js";
