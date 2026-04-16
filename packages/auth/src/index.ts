import { createDrizzle } from "@repo/db/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { authOptions } from "./options";

export * from "./db/schema";
// Re-export for convenience
export { authOptions } from "./options";

/**
 * Environment bindings for Cloudflare Workers
 */
export interface AuthEnv {
	DB: Hyperdrive;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL?: string;
}

/**
 * Create a Better Auth instance for Cloudflare Workers
 * Uses Hyperdrive for PostgreSQL connection pooling
 *
 * @example
 * ```ts
 * import { createAuth } from "@repo/auth";
 *
 * app.on(["GET", "POST"], "/api/auth/*", (c) => {
 *   const auth = createAuth(c.env);
 *   return auth.handler(c.req.raw);
 * });
 * ```
 */
export function createAuth(env: AuthEnv): ReturnType<typeof betterAuth> {
	const db = createDrizzle(env.DB);

	return betterAuth({
		...authOptions,
		database: drizzleAdapter(db, { provider: "pg" }),
		baseURL: env.BETTER_AUTH_URL || "http://localhost:5173",
		secret: env.BETTER_AUTH_SECRET,
	});
}

/**
 * Type for the auth instance
 */
export type Auth = ReturnType<typeof createAuth>;
