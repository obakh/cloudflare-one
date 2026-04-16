/**
 * Notion OAuth 2.0 for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createNotionOAuth } from "@repo/integrations/notion/oauth";
 *
 * const notion = createNotionOAuth({
 *   clientId: env.NOTION_CLIENT_ID,
 *   clientSecret: env.NOTION_CLIENT_SECRET,
 *   redirectUri: "https://example.com/auth/notion/callback",
 * });
 *
 * // Start OAuth flow
 * app.get("/auth/notion", (c) => {
 *   const { url, state } = notion.getAuthorizationUrl();
 *   return c.redirect(url);
 * });
 *
 * // Handle callback
 * app.get("/auth/notion/callback", async (c) => {
 *   const code = c.req.query("code");
 *   const tokens = await notion.exchangeCode(code);
 *   // tokens.workspaceId, tokens.workspaceName, tokens.botId
 * });
 * ```
 */

import { generateRandomHex } from "@repo/security/crypto";
import type { OAuthConfig } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface NotionOAuthConfig extends OAuthConfig {}

export interface NotionAuthorizationOptions {
	/** Custom state */
	state?: string;
	/** Owner type: "user" or "workspace" */
	ownerType?: "user" | "workspace";
}

export interface NotionTokens {
	accessToken: string;
	tokenType: string;
	botId: string;
	workspaceId: string;
	workspaceName?: string;
	workspaceIcon?: string;
	owner: NotionOwner;
	duplicatedTemplateId?: string;
}

export interface NotionOwner {
	type: "user" | "workspace";
	user?: {
		id: string;
		name?: string;
		avatarUrl?: string;
		type: "person" | "bot";
		person?: { email: string };
	};
	workspace?: boolean;
}

export interface NotionUser {
	id: string;
	type: "person" | "bot";
	name?: string;
	avatarUrl?: string;
	person?: {
		email: string;
	};
	bot?: {
		owner: NotionOwner;
		workspaceName?: string;
	};
}

// ============================================================================
// Notion OAuth Client
// ============================================================================

export interface NotionOAuth {
	getAuthorizationUrl(options?: NotionAuthorizationOptions): {
		url: string;
		state: string;
	};
	exchangeCode(code: string): Promise<NotionTokens>;
	getUser(accessToken: string): Promise<NotionUser>;
}

export function createNotionOAuth(config: NotionOAuthConfig): NotionOAuth {
	return {
		getAuthorizationUrl(options = {}) {
			const state = options.state || generateRandomHex(32);
			const params = new URLSearchParams({
				client_id: config.clientId,
				redirect_uri: config.redirectUri,
				response_type: "code",
				state,
			});

			if (options.ownerType) {
				params.set("owner", options.ownerType);
			}

			return {
				url: `https://api.notion.com/v1/oauth/authorize?${params}`,
				state,
			};
		},

		async exchangeCode(code: string): Promise<NotionTokens> {
			const credentials = btoa(`${config.clientId}:${config.clientSecret}`);

			const response = await fetch("https://api.notion.com/v1/oauth/token", {
				method: "POST",
				headers: {
					Authorization: `Basic ${credentials}`,
					"Content-Type": "application/json",
					"Notion-Version": "2022-06-28",
				},
				body: JSON.stringify({
					grant_type: "authorization_code",
					code,
					redirect_uri: config.redirectUri,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Notion OAuth error: ${error}`);
			}

			const data = (await response.json()) as {
				access_token: string;
				token_type: string;
				bot_id: string;
				workspace_id: string;
				workspace_name?: string;
				workspace_icon?: string;
				owner: {
					type: "user" | "workspace";
					user?: {
						id: string;
						name?: string;
						avatar_url?: string;
						type: "person" | "bot";
						person?: { email: string };
					};
					workspace?: boolean;
				};
				duplicated_template_id?: string;
			};

			return {
				accessToken: data.access_token,
				tokenType: data.token_type,
				botId: data.bot_id,
				workspaceId: data.workspace_id,
				workspaceName: data.workspace_name,
				workspaceIcon: data.workspace_icon,
				owner: {
					type: data.owner.type,
					user: data.owner.user
						? {
								id: data.owner.user.id,
								name: data.owner.user.name,
								avatarUrl: data.owner.user.avatar_url,
								type: data.owner.user.type,
								person: data.owner.user.person,
							}
						: undefined,
					workspace: data.owner.workspace,
				},
				duplicatedTemplateId: data.duplicated_template_id,
			};
		},

		async getUser(accessToken: string): Promise<NotionUser> {
			const response = await fetch("https://api.notion.com/v1/users/me", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Notion-Version": "2022-06-28",
				},
			});

			if (!response.ok) {
				throw new Error(`Notion API error: ${response.status}`);
			}

			const data = (await response.json()) as {
				id: string;
				type: "person" | "bot";
				name?: string;
				avatar_url?: string;
				person?: { email: string };
				bot?: {
					owner: {
						type: "user" | "workspace";
						user?: { id: string };
						workspace?: boolean;
					};
					workspace_name?: string;
				};
			};

			return {
				id: data.id,
				type: data.type,
				name: data.name,
				avatarUrl: data.avatar_url,
				person: data.person,
				bot: data.bot
					? {
							owner: {
								type: data.bot.owner.type,
								user: data.bot.owner.user
									? { id: data.bot.owner.user.id, type: "person" as const }
									: undefined,
								workspace: data.bot.owner.workspace,
							},
							workspaceName: data.bot.workspace_name,
						}
					: undefined,
			};
		},
	};
}
