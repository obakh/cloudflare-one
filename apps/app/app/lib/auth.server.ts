/**
 * Server-side auth utilities
 * Uses @repo/auth for Better Auth integration
 */
import { type AuthEnv, createAuth } from "@repo/auth";

export type { AuthEnv };

/**
 * Get auth instance from environment
 */
export function getAuth(env: AuthEnv) {
	return createAuth(env);
}

/**
 * Get current user from request
 * Returns null if not authenticated
 */
export async function getUser(request: Request, env: AuthEnv) {
	const auth = getAuth(env);
	const session = await auth.api.getSession({ headers: request.headers });
	return session?.user ?? null;
}

/**
 * Require authentication - throws redirect if not authenticated
 */
export async function requireAuth(request: Request, env: AuthEnv) {
	const user = await getUser(request, env);
	if (!user) {
		throw new Response(null, {
			status: 302,
			headers: { Location: "/sign-in" },
		});
	}
	return user;
}
