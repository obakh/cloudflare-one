/**
 * Slack OAuth 2.0 for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createSlackOAuth } from "@repo/integrations/slack/oauth";
 *
 * const slack = createSlackOAuth({
 *   clientId: env.SLACK_CLIENT_ID,
 *   clientSecret: env.SLACK_CLIENT_SECRET,
 *   redirectUri: "https://example.com/auth/slack/callback",
 * });
 *
 * // Start OAuth flow
 * app.get("/auth/slack", (c) => {
 *   const { url, state } = slack.getAuthorizationUrl({
 *     scopes: ["channels:read", "chat:write"],
 *     userScopes: ["identity.basic"],
 *   });
 *   return c.redirect(url);
 * });
 *
 * // Handle callback
 * app.get("/auth/slack/callback", async (c) => {
 *   const code = c.req.query("code");
 *   const tokens = await slack.exchangeCode(code);
 *   // Store tokens, create session, etc.
 * });
 * ```
 */

import { generateRandomHex } from "@repo/security/crypto";
import type { OAuthConfig } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface SlackOAuthConfig extends OAuthConfig {}

export interface SlackAuthorizationOptions {
	/** Bot scopes */
	scopes?: SlackBotScope[];
	/** User scopes */
	userScopes?: SlackUserScope[];
	/** Custom state */
	state?: string;
	/** Pre-select a team */
	team?: string;
}

export type SlackBotScope =
	| "app_mentions:read"
	| "bookmarks:read"
	| "bookmarks:write"
	| "calls:read"
	| "calls:write"
	| "channels:history"
	| "channels:join"
	| "channels:manage"
	| "channels:read"
	| "channels:write"
	| "chat:write"
	| "chat:write.customize"
	| "chat:write.public"
	| "commands"
	| "conversations.connect:manage"
	| "conversations.connect:read"
	| "conversations.connect:write"
	| "dnd:read"
	| "emoji:read"
	| "files:read"
	| "files:write"
	| "groups:history"
	| "groups:read"
	| "groups:write"
	| "im:history"
	| "im:read"
	| "im:write"
	| "incoming-webhook"
	| "links:read"
	| "links:write"
	| "metadata.message:read"
	| "mpim:history"
	| "mpim:read"
	| "mpim:write"
	| "pins:read"
	| "pins:write"
	| "reactions:read"
	| "reactions:write"
	| "reminders:read"
	| "reminders:write"
	| "remote_files:read"
	| "remote_files:share"
	| "remote_files:write"
	| "team:read"
	| "usergroups:read"
	| "usergroups:write"
	| "users.profile:read"
	| "users:read"
	| "users:read.email"
	| "users:write"
	| "workflow.steps:execute";

export type SlackUserScope =
	| "identity.avatar"
	| "identity.basic"
	| "identity.email"
	| "identity.team"
	| "openid"
	| "profile"
	| "email";

export interface SlackTokens {
	accessToken: string;
	tokenType: string;
	scope: string;
	botUserId?: string;
	appId: string;
	team: {
		id: string;
		name: string;
	};
	enterprise?: {
		id: string;
		name: string;
	};
	authedUser?: {
		id: string;
		scope?: string;
		accessToken?: string;
		tokenType?: string;
	};
	incomingWebhook?: {
		channel: string;
		channelId: string;
		configurationUrl: string;
		url: string;
	};
}

export interface SlackUser {
	id: string;
	name: string;
	email?: string;
	image24?: string;
	image32?: string;
	image48?: string;
	image72?: string;
	image192?: string;
	image512?: string;
	team?: {
		id: string;
		name: string;
		domain: string;
		image34?: string;
		image44?: string;
		image68?: string;
		image88?: string;
		image102?: string;
		image132?: string;
		image230?: string;
	};
}

// ============================================================================
// Slack OAuth Client
// ============================================================================

export interface SlackOAuth {
	getAuthorizationUrl(options?: SlackAuthorizationOptions): {
		url: string;
		state: string;
	};
	exchangeCode(code: string): Promise<SlackTokens>;
	getUser(accessToken: string): Promise<SlackUser>;
	revokeToken(accessToken: string): Promise<void>;
}

export function createSlackOAuth(config: SlackOAuthConfig): SlackOAuth {
	return {
		getAuthorizationUrl(options = {}) {
			const state = options.state || generateRandomHex(32);
			const params = new URLSearchParams({
				client_id: config.clientId,
				redirect_uri: config.redirectUri,
				state,
			});

			if (options.scopes?.length) {
				params.set("scope", options.scopes.join(","));
			}
			if (options.userScopes?.length) {
				params.set("user_scope", options.userScopes.join(","));
			}
			if (options.team) {
				params.set("team", options.team);
			}

			return {
				url: `https://slack.com/oauth/v2/authorize?${params}`,
				state,
			};
		},

		async exchangeCode(code: string): Promise<SlackTokens> {
			const response = await fetch("https://slack.com/api/oauth.v2.access", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					code,
					redirect_uri: config.redirectUri,
				}),
			});

			const data = (await response.json()) as {
				ok: boolean;
				error?: string;
				access_token: string;
				token_type: string;
				scope: string;
				bot_user_id?: string;
				app_id: string;
				team: { id: string; name: string };
				enterprise?: { id: string; name: string };
				authed_user?: {
					id: string;
					scope?: string;
					access_token?: string;
					token_type?: string;
				};
				incoming_webhook?: {
					channel: string;
					channel_id: string;
					configuration_url: string;
					url: string;
				};
			};

			if (!data.ok) {
				throw new Error(`Slack OAuth error: ${data.error}`);
			}

			return {
				accessToken: data.access_token,
				tokenType: data.token_type,
				scope: data.scope,
				botUserId: data.bot_user_id,
				appId: data.app_id,
				team: data.team,
				enterprise: data.enterprise,
				authedUser: data.authed_user
					? {
							id: data.authed_user.id,
							scope: data.authed_user.scope,
							accessToken: data.authed_user.access_token,
							tokenType: data.authed_user.token_type,
						}
					: undefined,
				incomingWebhook: data.incoming_webhook
					? {
							channel: data.incoming_webhook.channel,
							channelId: data.incoming_webhook.channel_id,
							configurationUrl: data.incoming_webhook.configuration_url,
							url: data.incoming_webhook.url,
						}
					: undefined,
			};
		},

		async getUser(accessToken: string): Promise<SlackUser> {
			const response = await fetch("https://slack.com/api/users.identity", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const data = (await response.json()) as {
				ok: boolean;
				error?: string;
				user: {
					id: string;
					name: string;
					email?: string;
					image_24?: string;
					image_32?: string;
					image_48?: string;
					image_72?: string;
					image_192?: string;
					image_512?: string;
				};
				team?: {
					id: string;
					name: string;
					domain: string;
					image_34?: string;
					image_44?: string;
					image_68?: string;
					image_88?: string;
					image_102?: string;
					image_132?: string;
					image_230?: string;
				};
			};

			if (!data.ok) {
				throw new Error(`Slack API error: ${data.error}`);
			}

			return {
				id: data.user.id,
				name: data.user.name,
				email: data.user.email,
				image24: data.user.image_24,
				image32: data.user.image_32,
				image48: data.user.image_48,
				image72: data.user.image_72,
				image192: data.user.image_192,
				image512: data.user.image_512,
				team: data.team
					? {
							id: data.team.id,
							name: data.team.name,
							domain: data.team.domain,
							image34: data.team.image_34,
							image44: data.team.image_44,
							image68: data.team.image_68,
							image88: data.team.image_88,
							image102: data.team.image_102,
							image132: data.team.image_132,
							image230: data.team.image_230,
						}
					: undefined,
			};
		},

		async revokeToken(accessToken: string): Promise<void> {
			const response = await fetch("https://slack.com/api/auth.revoke", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});

			const data = (await response.json()) as { ok: boolean; error?: string };

			if (!data.ok) {
				throw new Error(`Slack revoke error: ${data.error}`);
			}
		},
	};
}

// ============================================================================
// Convenience Exports
// ============================================================================

export const SLACK_BOT_SCOPES = {
	/** Read messages in channels */
	CHANNELS_HISTORY: "channels:history" as SlackBotScope,
	/** Read channel info */
	CHANNELS_READ: "channels:read" as SlackBotScope,
	/** Send messages */
	CHAT_WRITE: "chat:write" as SlackBotScope,
	/** Send messages to any channel */
	CHAT_WRITE_PUBLIC: "chat:write.public" as SlackBotScope,
	/** Slash commands */
	COMMANDS: "commands" as SlackBotScope,
	/** Read files */
	FILES_READ: "files:read" as SlackBotScope,
	/** Read reactions */
	REACTIONS_READ: "reactions:read" as SlackBotScope,
	/** Read users */
	USERS_READ: "users:read" as SlackBotScope,
	/** Read user emails */
	USERS_READ_EMAIL: "users:read.email" as SlackBotScope,
} as const;

export const SLACK_USER_SCOPES = {
	/** Basic identity */
	IDENTITY_BASIC: "identity.basic" as SlackUserScope,
	/** Email */
	IDENTITY_EMAIL: "identity.email" as SlackUserScope,
	/** Avatar */
	IDENTITY_AVATAR: "identity.avatar" as SlackUserScope,
	/** Team info */
	IDENTITY_TEAM: "identity.team" as SlackUserScope,
} as const;
