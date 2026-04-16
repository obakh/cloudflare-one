import { index, layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	// Public routes
	route("sign-in", "routes/auth/sign-in.tsx"),
	route("sign-up", "routes/auth/sign-up.tsx"),
	route("forgot-password", "routes/auth/forgot-password.tsx"),
	route("reset-password", "routes/auth/reset-password.tsx"),
	route("verify", "routes/auth/verify.tsx"),

	// Auth callbacks
	...prefix("auth", [route("callback", "routes/auth/callback.tsx")]),

	// Onboarding
	route("setup", "routes/onboarding/setup.tsx"),
	route("welcome", "routes/onboarding/welcome.tsx"),
	route("create-team", "routes/onboarding/create-team.tsx"),

	// App routes (authenticated)
	layout("routes/_app/layout.tsx", [
		// Dashboard
		index("routes/_app/dashboard/index.tsx"),

		// Activity
		route("activity", "routes/_app/activity/index.tsx"),

		// Insights
		route("insights", "routes/_app/insights/index.tsx"),

		// Vault
		route("vault", "routes/_app/vault/index.tsx"),

		// Support
		route("support", "routes/_app/support/index.tsx"),

		// Settings
		...prefix("settings", [
			layout("routes/_app/settings/layout.tsx", [
				index("routes/_app/settings/general.tsx"),
				route("profile", "routes/_app/settings/profile.tsx"),
				route("team", "routes/_app/settings/team.tsx"),
				route("members", "routes/_app/settings/members.tsx"),
				route("billing", "routes/_app/settings/billing.tsx"),
				route("notifications", "routes/_app/settings/notifications.tsx"),
				route("integrations", "routes/_app/settings/integrations.tsx"),
				route("api", "routes/_app/settings/api.tsx"),
				route("security", "routes/_app/settings/security.tsx"),
				route("import", "routes/_app/settings/import.tsx"),
			]),
		]),

		// Account
		route("account", "routes/_app/account/index.tsx"),
	]),

	// API routes
	...prefix("api", [
		route("health", "routes/api/health.tsx"),
		route("webhook/stripe", "routes/api/webhook.stripe.tsx"),
		route("chat", "routes/api/chat.tsx"),
	]),
] satisfies RouteConfig;
