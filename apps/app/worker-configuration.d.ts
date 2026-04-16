interface Env {
	ASSETS: Fetcher;
	DB?: D1Database;
	KV?: KVNamespace;
	STORAGE?: R2Bucket;
	APP_ENV: string;
	// Auth
	AUTH_SECRET?: string;
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GITHUB_CLIENT_ID?: string;
	GITHUB_CLIENT_SECRET?: string;
	// Payments
	STRIPE_SECRET_KEY?: string;
	STRIPE_WEBHOOK_SECRET?: string;
	// Analytics
	POSTHOG_API_KEY?: string;
	// Observability
	SENTRY_DSN?: string;
}
