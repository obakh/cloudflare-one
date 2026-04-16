/**
 * Linear OAuth 2.0 for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createLinearOAuth } from "@repo/integrations/linear/oauth";
 *
 * const linear = createLinearOAuth({
 *   clientId: env.LINEAR_CLIENT_ID,
 *   clientSecret: env.LINEAR_CLIENT_SECRET,
 *   redirectUri: "https://example.com/auth/linear/callback",
 * });
 *
 * // Start OAuth flow
 * app.get("/auth/linear", (c) => {
 *   const { url, state } = linear.getAuthorizationUrl({
 *     scopes: ["read", "write", "issues:create"],
 *   });
 *   return c.redirect(url);
 * });
 *
 * // Handle callback
 * app.get("/auth/linear/callback", async (c) => {
 *   const code = c.req.query("code");
 *   const tokens = await linear.exchangeCode(code);
 *   const user = await linear.getUser(tokens.accessToken);
 * });
 * ```
 */

import { generateRandomHex } from "@repo/security/crypto";
import type { OAuthConfig, OAuthTokens, OAuthUser } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface LinearOAuthConfig extends OAuthConfig {
	/** Actor type: "user" or "application" */
	actor?: "user" | "application";
}

export interface LinearAuthorizationOptions {
	/** OAuth scopes */
	scopes?: LinearScope[];
	/** Custom state */
	state?: string;
	/** Prompt for consent */
	prompt?: "consent";
}

export type LinearScope = "read" | "write" | "issues:create" | "comments:create" | "admin";

export interface LinearUser extends OAuthUser {
	displayName: string;
	email: string;
	admin: boolean;
	active: boolean;
	createdAt: string;
	organization: {
		id: string;
		name: string;
		urlKey: string;
	};
}

export interface LinearOrganization {
	id: string;
	name: string;
	urlKey: string;
	logoUrl?: string;
	createdAt: string;
}

// ============================================================================
// Linear OAuth Client
// ============================================================================

export interface LinearOAuth {
	getAuthorizationUrl(options?: LinearAuthorizationOptions): {
		url: string;
		state: string;
	};
	exchangeCode(code: string): Promise<OAuthTokens>;
	refreshToken(refreshToken: string): Promise<OAuthTokens>;
	getUser(accessToken: string): Promise<LinearUser>;
	revokeToken(accessToken: string): Promise<void>;
}

export function createLinearOAuth(config: LinearOAuthConfig): LinearOAuth {
	const actor = config.actor || "user";

	return {
		getAuthorizationUrl(options = {}) {
			const state = options.state || generateRandomHex(32);
			const params = new URLSearchParams({
				client_id: config.clientId,
				redirect_uri: config.redirectUri,
				response_type: "code",
				state,
				actor,
			});

			if (options.scopes?.length) {
				params.set("scope", options.scopes.join(","));
			}
			if (options.prompt) {
				params.set("prompt", options.prompt);
			}

			return {
				url: `https://linear.app/oauth/authorize?${params}`,
				state,
			};
		},

		async exchangeCode(code: string): Promise<OAuthTokens> {
			const response = await fetch("https://api.linear.app/oauth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					code,
					redirect_uri: config.redirectUri,
					grant_type: "authorization_code",
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Linear OAuth error: ${error}`);
			}

			const data = (await response.json()) as {
				access_token: string;
				token_type: string;
				expires_in: number;
				scope: string;
			};

			return {
				accessToken: data.access_token,
				tokenType: data.token_type,
				expiresIn: data.expires_in,
				scope: data.scope,
			};
		},

		async refreshToken(refreshToken: string): Promise<OAuthTokens> {
			const response = await fetch("https://api.linear.app/oauth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					refresh_token: refreshToken,
					grant_type: "refresh_token",
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Linear refresh error: ${error}`);
			}

			const data = (await response.json()) as {
				access_token: string;
				token_type: string;
				expires_in: number;
				scope: string;
			};

			return {
				accessToken: data.access_token,
				tokenType: data.token_type,
				expiresIn: data.expires_in,
				scope: data.scope,
			};
		},

		async getUser(accessToken: string): Promise<LinearUser> {
			const response = await fetch("https://api.linear.app/graphql", {
				method: "POST",
				headers: {
					Authorization: accessToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: `
						query {
							viewer {
								id
								name
								displayName
								email
								admin
								active
								createdAt
								avatarUrl
								organization {
									id
									name
									urlKey
								}
							}
						}
					`,
				}),
			});

			if (!response.ok) {
				throw new Error(`Linear API error: ${response.status}`);
			}

			const result = (await response.json()) as {
				data: {
					viewer: {
						id: string;
						name: string;
						displayName: string;
						email: string;
						admin: boolean;
						active: boolean;
						createdAt: string;
						avatarUrl?: string;
						organization: {
							id: string;
							name: string;
							urlKey: string;
						};
					};
				};
			};

			const viewer = result.data.viewer;

			return {
				id: viewer.id,
				name: viewer.name,
				displayName: viewer.displayName,
				email: viewer.email,
				avatar: viewer.avatarUrl,
				username: viewer.displayName,
				admin: viewer.admin,
				active: viewer.active,
				createdAt: viewer.createdAt,
				organization: viewer.organization,
				raw: viewer as unknown as Record<string, unknown>,
			};
		},

		async revokeToken(accessToken: string): Promise<void> {
			const response = await fetch("https://api.linear.app/oauth/revoke", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					token: accessToken,
				}),
			});

			if (!response.ok) {
				throw new Error(`Linear revoke error: ${response.status}`);
			}
		},
	};
}

// ============================================================================
// Convenience Exports
// ============================================================================

export const LINEAR_SCOPES = {
	/** Read access to all resources */
	READ: "read" as LinearScope,
	/** Write access to all resources */
	WRITE: "write" as LinearScope,
	/** Create issues */
	ISSUES_CREATE: "issues:create" as LinearScope,
	/** Create comments */
	COMMENTS_CREATE: "comments:create" as LinearScope,
	/** Admin access */
	ADMIN: "admin" as LinearScope,
} as const;
