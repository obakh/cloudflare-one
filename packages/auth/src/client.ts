import { createAuthClient } from "better-auth/client";

/**
 * Auth client for use in frontend applications
 *
 * @example
 * ```tsx
 * import { authClient } from "@repo/auth/client";
 *
 * // Sign up
 * await authClient.signUp.email({
 *   email: "user@example.com",
 *   password: "password123",
 *   name: "John Doe",
 * });
 *
 * // Sign in
 * await authClient.signIn.email({
 *   email: "user@example.com",
 *   password: "password123",
 * });
 *
 * // Get session
 * const session = await authClient.getSession();
 *
 * // Sign out
 * await authClient.signOut();
 * ```
 */
export const authClient = createAuthClient({
	baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

// Re-export useful types
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
