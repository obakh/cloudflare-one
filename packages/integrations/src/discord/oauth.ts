/**
 * Discord OAuth 2.0 for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createDiscordOAuth } from "@repo/integrations/discord/oauth";
 *
 * const discord = createDiscordOAuth({
 *   clientId: env.DISCORD_CLIENT_ID,
 *   clientSecret: env.DISCORD_CLIENT_SECRET,
 *   redirectUri: "https://example.com/auth/discord/callback",
 * });
 *
 * // Start OAuth flow
 * app.get("/auth/discord", (c) => {
 *   const { url, state } = discord.getAuthorizationUrl({
 *     scopes: ["identify", "email", "guilds"],
 *   });
 *   return c.redirect(url);
 * });
 *
 * // Handle callback
 * app.get("/auth/discord/callback", async (c) => {
 *   const code = c.req.query("code");
 *   const tokens = await discord.exchangeCode(code);
 *   const user = await discord.getUser(tokens.accessToken);
 * });
 * ```
 */

import { generateRandomHex } from "@repo/security/crypto";
import type { OAuthConfig, OAuthTokens, OAuthUser } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface DiscordOAuthConfig extends OAuthConfig {}

export interface DiscordAuthorizationOptions {
	/** OAuth scopes */
	scopes?: DiscordScope[];
	/** Custom state */
	state?: string;
	/** Prompt for consent */
	prompt?: "consent" | "none";
	/** Guild to add bot to (with bot scope) */
	guildId?: string;
	/** Disable guild select (with bot scope) */
	disableGuildSelect?: boolean;
	/** Bot permissions (with bot scope) */
	permissions?: string;
}

export type DiscordScope =
	| "activities.read"
	| "activities.write"
	| "applications.builds.read"
	| "applications.builds.upload"
	| "applications.commands"
	| "applications.commands.update"
	| "applications.commands.permissions.update"
	| "applications.entitlements"
	| "applications.store.update"
	| "bot"
	| "connections"
	| "dm_channels.read"
	| "email"
	| "gdm.join"
	| "guilds"
	| "guilds.join"
	| "guilds.members.read"
	| "identify"
	| "messages.read"
	| "relationships.read"
	| "role_connections.write"
	| "rpc"
	| "rpc.activities.write"
	| "rpc.notifications.read"
	| "rpc.voice.read"
	| "rpc.voice.write"
	| "voice"
	| "webhook.incoming";

export interface DiscordTokens extends OAuthTokens {
	guild?: {
		id: string;
		name: string;
	};
	webhook?: {
		id: string;
		token: string;
		url: string;
		channelId: string;
		guildId: string;
	};
}

export interface DiscordUser extends OAuthUser {
	discriminator: string;
	globalName?: string;
	banner?: string;
	bannerColor?: string;
	accentColor?: number;
	locale?: string;
	mfaEnabled?: boolean;
	premiumType?: number;
	publicFlags?: number;
	flags?: number;
	verified?: boolean;
}

export interface DiscordGuild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: string;
	features: string[];
}

export interface DiscordConnection {
	id: string;
	name: string;
	type: string;
	verified: boolean;
	friend_sync: boolean;
	show_activity: boolean;
	two_way_link: boolean;
	visibility: number;
}

// ============================================================================
// Discord OAuth Client
// ============================================================================

export interface DiscordOAuth {
	getAuthorizationUrl(options?: DiscordAuthorizationOptions): {
		url: string;
		state: string;
	};
	exchangeCode(code: string): Promise<DiscordTokens>;
	refreshToken(refreshToken: string): Promise<OAuthTokens>;
	getUser(accessToken: string): Promise<DiscordUser>;
	getUserGuilds(accessToken: string): Promise<DiscordGuild[]>;
	getUserConnections(accessToken: string): Promise<DiscordConnection[]>;
	revokeToken(accessToken: string): Promise<void>;
}

export function createDiscordOAuth(config: DiscordOAuthConfig): DiscordOAuth {
	const API_BASE = "https://discord.com/api/v10";

	return {
		getAuthorizationUrl(options = {}) {
			const state = options.state || generateRandomHex(32);
			const params = new URLSearchParams({
				client_id: config.clientId,
				redirect_uri: config.redirectUri,
				response_type: "code",
				state,
			});

			if (options.scopes?.length) {
				params.set("scope", options.scopes.join(" "));
			} else {
				params.set("scope", "identify");
			}

			if (options.prompt) {
				params.set("prompt", options.prompt);
			}
			if (options.guildId) {
				params.set("guild_id", options.guildId);
			}
			if (options.disableGuildSelect) {
				params.set("disable_guild_select", "true");
			}
			if (options.permissions) {
				params.set("permissions", options.permissions);
			}

			return {
				url: `https://discord.com/oauth2/authorize?${params}`,
				state,
			};
		},

		async exchangeCode(code: string): Promise<DiscordTokens> {
			const response = await fetch(`${API_BASE}/oauth2/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					grant_type: "authorization_code",
					code,
					redirect_uri: config.redirectUri,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Discord OAuth error: ${error}`);
			}

			const data = (await response.json()) as {
				access_token: string;
				refresh_token: string;
				expires_in: number;
				token_type: string;
				scope: string;
				guild?: { id: string; name: string };
				webhook?: {
					id: string;
					token: string;
					url: string;
					channel_id: string;
					guild_id: string;
				};
			};

			return {
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
				expiresIn: data.expires_in,
				tokenType: data.token_type,
				scope: data.scope,
				guild: data.guild,
				webhook: data.webhook
					? {
							id: data.webhook.id,
							token: data.webhook.token,
							url: data.webhook.url,
							channelId: data.webhook.channel_id,
							guildId: data.webhook.guild_id,
						}
					: undefined,
			};
		},

		async refreshToken(refreshToken: string): Promise<OAuthTokens> {
			const response = await fetch(`${API_BASE}/oauth2/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					grant_type: "refresh_token",
					refresh_token: refreshToken,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Discord refresh error: ${error}`);
			}

			const data = (await response.json()) as {
				access_token: string;
				refresh_token: string;
				expires_in: number;
				token_type: string;
				scope: string;
			};

			return {
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
				expiresIn: data.expires_in,
				tokenType: data.token_type,
				scope: data.scope,
			};
		},

		async getUser(accessToken: string): Promise<DiscordUser> {
			const response = await fetch(`${API_BASE}/users/@me`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Discord API error: ${response.status}`);
			}

			const data = (await response.json()) as Record<string, unknown>;

			return {
				id: data.id as string,
				email: data.email as string | undefined,
				name: (data.global_name || data.username) as string,
				avatar: data.avatar
					? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
					: undefined,
				username: data.username as string,
				discriminator: data.discriminator as string,
				globalName: data.global_name as string | undefined,
				banner: data.banner as string | undefined,
				bannerColor: data.banner_color as string | undefined,
				accentColor: data.accent_color as number | undefined,
				locale: data.locale as string | undefined,
				mfaEnabled: data.mfa_enabled as boolean | undefined,
				premiumType: data.premium_type as number | undefined,
				publicFlags: data.public_flags as number | undefined,
				flags: data.flags as number | undefined,
				verified: data.verified as boolean | undefined,
				raw: data,
			};
		},

		async getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
			const response = await fetch(`${API_BASE}/users/@me/guilds`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Discord API error: ${response.status}`);
			}

			return response.json() as Promise<DiscordGuild[]>;
		},

		async getUserConnections(accessToken: string): Promise<DiscordConnection[]> {
			const response = await fetch(`${API_BASE}/users/@me/connections`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Discord API error: ${response.status}`);
			}

			return response.json() as Promise<DiscordConnection[]>;
		},

		async revokeToken(accessToken: string): Promise<void> {
			const response = await fetch(`${API_BASE}/oauth2/token/revoke`, {
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
				throw new Error(`Discord revoke error: ${response.status}`);
			}
		},
	};
}

// ============================================================================
// Convenience Exports
// ============================================================================

export const DISCORD_SCOPES = {
	/** Read user info */
	IDENTIFY: "identify" as DiscordScope,
	/** Read user email */
	EMAIL: "email" as DiscordScope,
	/** Read user guilds */
	GUILDS: "guilds" as DiscordScope,
	/** Join guilds for user */
	GUILDS_JOIN: "guilds.join" as DiscordScope,
	/** Read guild members */
	GUILDS_MEMBERS_READ: "guilds.members.read" as DiscordScope,
	/** Add bot to guild */
	BOT: "bot" as DiscordScope,
	/** Create incoming webhook */
	WEBHOOK_INCOMING: "webhook.incoming" as DiscordScope,
	/** Read user connections */
	CONNECTIONS: "connections" as DiscordScope,
	/** Slash commands */
	APPLICATIONS_COMMANDS: "applications.commands" as DiscordScope,
} as const;

/**
 * Discord permission flags
 * @see https://discord.com/developers/docs/topics/permissions
 */
export const DISCORD_PERMISSIONS = {
	CREATE_INSTANT_INVITE: 1n << 0n,
	KICK_MEMBERS: 1n << 1n,
	BAN_MEMBERS: 1n << 2n,
	ADMINISTRATOR: 1n << 3n,
	MANAGE_CHANNELS: 1n << 4n,
	MANAGE_GUILD: 1n << 5n,
	ADD_REACTIONS: 1n << 6n,
	VIEW_AUDIT_LOG: 1n << 7n,
	PRIORITY_SPEAKER: 1n << 8n,
	STREAM: 1n << 9n,
	VIEW_CHANNEL: 1n << 10n,
	SEND_MESSAGES: 1n << 11n,
	SEND_TTS_MESSAGES: 1n << 12n,
	MANAGE_MESSAGES: 1n << 13n,
	EMBED_LINKS: 1n << 14n,
	ATTACH_FILES: 1n << 15n,
	READ_MESSAGE_HISTORY: 1n << 16n,
	MENTION_EVERYONE: 1n << 17n,
	USE_EXTERNAL_EMOJIS: 1n << 18n,
	VIEW_GUILD_INSIGHTS: 1n << 19n,
	CONNECT: 1n << 20n,
	SPEAK: 1n << 21n,
	MUTE_MEMBERS: 1n << 22n,
	DEAFEN_MEMBERS: 1n << 23n,
	MOVE_MEMBERS: 1n << 24n,
	USE_VAD: 1n << 25n,
	CHANGE_NICKNAME: 1n << 26n,
	MANAGE_NICKNAMES: 1n << 27n,
	MANAGE_ROLES: 1n << 28n,
	MANAGE_WEBHOOKS: 1n << 29n,
	MANAGE_GUILD_EXPRESSIONS: 1n << 30n,
	USE_APPLICATION_COMMANDS: 1n << 31n,
	REQUEST_TO_SPEAK: 1n << 32n,
	MANAGE_EVENTS: 1n << 33n,
	MANAGE_THREADS: 1n << 34n,
	CREATE_PUBLIC_THREADS: 1n << 35n,
	CREATE_PRIVATE_THREADS: 1n << 36n,
	USE_EXTERNAL_STICKERS: 1n << 37n,
	SEND_MESSAGES_IN_THREADS: 1n << 38n,
	USE_EMBEDDED_ACTIVITIES: 1n << 39n,
	MODERATE_MEMBERS: 1n << 40n,
	VIEW_CREATOR_MONETIZATION_ANALYTICS: 1n << 41n,
	USE_SOUNDBOARD: 1n << 42n,
	USE_EXTERNAL_SOUNDS: 1n << 45n,
	SEND_VOICE_MESSAGES: 1n << 46n,
} as const;

/**
 * Calculate permissions integer from flags
 */
export function calculatePermissions(...permissions: bigint[]): string {
	return permissions.reduce((acc, p) => acc | p, 0n).toString();
}
