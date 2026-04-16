/**
 * GitHub OAuth 2.0 for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createGitHubOAuth } from "@repo/integrations/github/oauth";
 *
 * const github = createGitHubOAuth({
 *   clientId: env.GITHUB_CLIENT_ID,
 *   clientSecret: env.GITHUB_CLIENT_SECRET,
 *   redirectUri: "https://example.com/auth/github/callback",
 * });
 *
 * // Start OAuth flow
 * app.get("/auth/github", (c) => {
 *   const { url, state } = github.getAuthorizationUrl({
 *     scopes: ["user:email", "read:org"],
 *   });
 *   // Store state in session/cookie
 *   return c.redirect(url);
 * });
 *
 * // Handle callback
 * app.get("/auth/github/callback", async (c) => {
 *   const code = c.req.query("code");
 *   const tokens = await github.exchangeCode(code);
 *   const user = await github.getUser(tokens.accessToken);
 *   // Create session, store tokens, etc.
 * });
 * ```
 */

import { generateRandomHex } from "@repo/security/crypto";
import type { OAuthConfig, OAuthTokens, OAuthUser } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface GitHubOAuthConfig extends OAuthConfig {
	/** Enterprise GitHub URL (optional) */
	baseUrl?: string;
}

export interface GitHubAuthorizationOptions {
	/** OAuth scopes to request */
	scopes?: GitHubScope[];
	/** Custom state (auto-generated if not provided) */
	state?: string;
	/** Allow signup during OAuth */
	allowSignup?: boolean;
	/** Suggest a specific account to authorize */
	login?: string;
}

export type GitHubScope =
	| "user"
	| "user:email"
	| "user:follow"
	| "public_repo"
	| "repo"
	| "repo_deployment"
	| "repo:status"
	| "delete_repo"
	| "notifications"
	| "gist"
	| "read:repo_hook"
	| "write:repo_hook"
	| "admin:repo_hook"
	| "admin:org_hook"
	| "read:org"
	| "write:org"
	| "admin:org"
	| "read:public_key"
	| "write:public_key"
	| "admin:public_key"
	| "read:gpg_key"
	| "write:gpg_key"
	| "admin:gpg_key"
	| "workflow"
	| "write:packages"
	| "read:packages"
	| "delete:packages"
	| "admin:enterprise"
	| "manage_runners:enterprise"
	| "manage_billing:enterprise"
	| "read:enterprise"
	| "codespace"
	| "copilot"
	| "project"
	| "read:project";

export interface GitHubUser extends OAuthUser {
	login: string;
	nodeId: string;
	type: "User" | "Organization";
	company?: string;
	blog?: string;
	location?: string;
	bio?: string;
	twitterUsername?: string;
	publicRepos: number;
	followers: number;
	following: number;
	createdAt: string;
}

export interface GitHubEmail {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: "public" | "private" | null;
}

// ============================================================================
// GitHub OAuth Client
// ============================================================================

export interface GitHubOAuth {
	getAuthorizationUrl(options?: GitHubAuthorizationOptions): {
		url: string;
		state: string;
	};
	exchangeCode(code: string): Promise<OAuthTokens>;
	refreshToken(refreshToken: string): Promise<OAuthTokens>;
	getUser(accessToken: string): Promise<GitHubUser>;
	getUserEmails(accessToken: string): Promise<GitHubEmail[]>;
	revokeToken(accessToken: string): Promise<void>;
}

export function createGitHubOAuth(config: GitHubOAuthConfig): GitHubOAuth {
	const baseUrl = config.baseUrl || "https://github.com";
	const apiUrl = config.baseUrl ? `${config.baseUrl}/api/v3` : "https://api.github.com";

	return {
		getAuthorizationUrl(options = {}) {
			const state = options.state || generateRandomHex(32);
			const params = new URLSearchParams({
				client_id: config.clientId,
				redirect_uri: config.redirectUri,
				state,
			});

			if (options.scopes?.length) {
				params.set("scope", options.scopes.join(" "));
			}
			if (options.allowSignup === false) {
				params.set("allow_signup", "false");
			}
			if (options.login) {
				params.set("login", options.login);
			}

			return {
				url: `${baseUrl}/login/oauth/authorize?${params}`,
				state,
			};
		},

		async exchangeCode(code: string): Promise<OAuthTokens> {
			const response = await fetch(`${baseUrl}/login/oauth/access_token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					code,
					redirect_uri: config.redirectUri,
				}),
			});

			if (!response.ok) {
				throw new Error(`GitHub OAuth error: ${response.status}`);
			}

			const data = (await response.json()) as {
				access_token: string;
				refresh_token?: string;
				expires_in?: number;
				refresh_token_expires_in?: number;
				token_type: string;
				scope: string;
				error?: string;
				error_description?: string;
			};

			if (data.error) {
				throw new Error(data.error_description || data.error);
			}

			return {
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
				expiresIn: data.expires_in,
				tokenType: data.token_type,
				scope: data.scope,
			};
		},

		async refreshToken(refreshToken: string): Promise<OAuthTokens> {
			const response = await fetch(`${baseUrl}/login/oauth/access_token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					grant_type: "refresh_token",
					refresh_token: refreshToken,
				}),
			});

			if (!response.ok) {
				throw new Error(`GitHub refresh error: ${response.status}`);
			}

			const data = (await response.json()) as {
				access_token: string;
				refresh_token?: string;
				expires_in?: number;
				token_type: string;
				scope: string;
				error?: string;
				error_description?: string;
			};

			if (data.error) {
				throw new Error(data.error_description || data.error);
			}

			return {
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
				expiresIn: data.expires_in,
				tokenType: data.token_type,
				scope: data.scope,
			};
		},

		async getUser(accessToken: string): Promise<GitHubUser> {
			const response = await fetch(`${apiUrl}/user`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			});

			if (!response.ok) {
				throw new Error(`GitHub API error: ${response.status}`);
			}

			const data = (await response.json()) as Record<string, unknown>;

			return {
				id: String(data.id),
				email: data.email as string | undefined,
				name: data.name as string | undefined,
				avatar: data.avatar_url as string | undefined,
				username: data.login as string,
				login: data.login as string,
				nodeId: data.node_id as string,
				type: data.type as "User" | "Organization",
				company: data.company as string | undefined,
				blog: data.blog as string | undefined,
				location: data.location as string | undefined,
				bio: data.bio as string | undefined,
				twitterUsername: data.twitter_username as string | undefined,
				publicRepos: data.public_repos as number,
				followers: data.followers as number,
				following: data.following as number,
				createdAt: data.created_at as string,
				raw: data,
			};
		},

		async getUserEmails(accessToken: string): Promise<GitHubEmail[]> {
			const response = await fetch(`${apiUrl}/user/emails`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			});

			if (!response.ok) {
				throw new Error(`GitHub API error: ${response.status}`);
			}

			return response.json() as Promise<GitHubEmail[]>;
		},

		async revokeToken(accessToken: string): Promise<void> {
			const response = await fetch(`${apiUrl}/applications/${config.clientId}/token`, {
				method: "DELETE",
				headers: {
					Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
				body: JSON.stringify({ access_token: accessToken }),
			});

			if (!response.ok && response.status !== 404) {
				throw new Error(`GitHub revoke error: ${response.status}`);
			}
		},
	};
}

// ============================================================================
// Convenience Exports
// ============================================================================

export const GITHUB_SCOPES = {
	/** Read user profile */
	USER: "user" as GitHubScope,
	/** Read user email */
	USER_EMAIL: "user:email" as GitHubScope,
	/** Read public repos */
	PUBLIC_REPO: "public_repo" as GitHubScope,
	/** Full repo access */
	REPO: "repo" as GitHubScope,
	/** Read org membership */
	READ_ORG: "read:org" as GitHubScope,
	/** Workflow access */
	WORKFLOW: "workflow" as GitHubScope,
} as const;
