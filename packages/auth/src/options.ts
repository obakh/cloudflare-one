import type { BetterAuthOptions } from "better-auth";

/**
 * Shared Better Auth options
 * These are the base options used across all auth instances
 *
 * Docs: https://www.better-auth.com/docs/reference/options
 */
export const authOptions: BetterAuthOptions = {
	/**
	 * The name of your application
	 */
	appName: "Monorepo App",

	/**
	 * Base path for auth endpoints
	 * All auth routes will be under /api/auth/*
	 */
	basePath: "/api/auth",

	/**
	 * Email and password authentication
	 */
	emailAndPassword: {
		enabled: true,
	},

	/**
	 * Session configuration
	 */
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},

	// Add more options as needed:
	// - socialProviders (Google, GitHub, etc.)
	// - emailVerification
	// - twoFactor
	// - rateLimit
};
