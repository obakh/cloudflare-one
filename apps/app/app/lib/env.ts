/**
 * Environment bindings for Cloudflare Workers
 * Combines all package environment requirements
 */
import type { AuthEnv } from "@repo/auth";

/**
 * Complete app environment bindings
 */
export interface AppEnv extends AuthEnv {
	// Database
	DB: Hyperdrive;

	// Auth
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL?: string;

	// Storage
	VAULT_BUCKET: R2Bucket;
	KV: KVNamespace;
	CF_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;

	// Payments
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET: string;
	STRIPE_PUBLISHABLE_KEY: string;

	// Analytics
	// Zaraz is configured in Cloudflare dashboard, no env vars needed

	// Observability
	SENTRY_DSN?: string;

	// Feature Flags (optional KV override)
	FLAGS_KV?: KVNamespace;
}

/**
 * Get typed environment from context
 */
export function getEnv(context: { cloudflare?: { env: AppEnv } }): AppEnv {
	if (!context.cloudflare?.env) {
		throw new Error("Cloudflare environment not available");
	}
	return context.cloudflare.env;
}
