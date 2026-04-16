/**
 * Discord API Client for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createDiscordClient } from "@repo/integrations/discord/api";
 *
 * // Bot client
 * const discord = createDiscordClient({ botToken: env.DISCORD_BOT_TOKEN });
 *
 * // Send a message
 * await discord.channels.createMessage("channel_id", {
 *   content: "Hello!",
 * });
 *
 * // Create a slash command
 * await discord.commands.createGlobal(env.DISCORD_APP_ID, {
 *   name: "hello",
 *   description: "Say hello",
 * });
 * ```
 */

import type {
	DiscordChannel,
	DiscordComponent,
	DiscordEmbed,
	DiscordMember,
	DiscordMessage,
	DiscordRole,
	DiscordUser,
} from "./webhooks";

// ============================================================================
// Types
// ============================================================================

export interface DiscordClientConfig {
	botToken?: string;
	accessToken?: string;
}

export interface DiscordGuild {
	id: string;
	name: string;
	icon: string | null;
	splash: string | null;
	discovery_splash: string | null;
	owner_id: string;
	region?: string;
	afk_channel_id: string | null;
	afk_timeout: number;
	verification_level: number;
	default_message_notifications: number;
	explicit_content_filter: number;
	roles: DiscordRole[];
	emojis: unknown[];
	features: string[];
	mfa_level: number;
	system_channel_id: string | null;
	system_channel_flags: number;
	rules_channel_id: string | null;
	member_count?: number;
	presence_count?: number;
	description: string | null;
	banner: string | null;
	premium_tier: number;
	premium_subscription_count?: number;
	preferred_locale: string;
	public_updates_channel_id: string | null;
	nsfw_level: number;
	premium_progress_bar_enabled: boolean;
}

export interface CreateMessageOptions {
	content?: string;
	tts?: boolean;
	embeds?: DiscordEmbed[];
	allowed_mentions?: {
		parse?: ("roles" | "users" | "everyone")[];
		roles?: string[];
		users?: string[];
		replied_user?: boolean;
	};
	message_reference?: {
		message_id: string;
		channel_id?: string;
		guild_id?: string;
		fail_if_not_exists?: boolean;
	};
	components?: DiscordComponent[];
	flags?: number;
}

export interface EditMessageOptions {
	content?: string;
	embeds?: DiscordEmbed[];
	allowed_mentions?: CreateMessageOptions["allowed_mentions"];
	components?: DiscordComponent[];
	flags?: number;
}

export interface ApplicationCommand {
	id?: string;
	type?: 1 | 2 | 3;
	application_id?: string;
	guild_id?: string;
	name: string;
	description: string;
	options?: ApplicationCommandOption[];
	default_member_permissions?: string;
	dm_permission?: boolean;
	nsfw?: boolean;
}

export interface ApplicationCommandOption {
	type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
	name: string;
	description: string;
	required?: boolean;
	choices?: Array<{ name: string; value: string | number }>;
	options?: ApplicationCommandOption[];
	channel_types?: number[];
	min_value?: number;
	max_value?: number;
	min_length?: number;
	max_length?: number;
	autocomplete?: boolean;
}

// ============================================================================
// API Client
// ============================================================================

export interface DiscordClient {
	request<T>(method: string, path: string, body?: unknown): Promise<T>;
	guilds: {
		get(guildId: string): Promise<DiscordGuild>;
		getChannels(guildId: string): Promise<DiscordChannel[]>;
		getMember(guildId: string, userId: string): Promise<DiscordMember>;
		listMembers(
			guildId: string,
			options?: { limit?: number; after?: string },
		): Promise<DiscordMember[]>;
		getRoles(guildId: string): Promise<DiscordRole[]>;
		addMemberRole(guildId: string, userId: string, roleId: string): Promise<void>;
		removeMemberRole(guildId: string, userId: string, roleId: string): Promise<void>;
		kickMember(guildId: string, userId: string, reason?: string): Promise<void>;
		banMember(
			guildId: string,
			userId: string,
			options?: { delete_message_seconds?: number; reason?: string },
		): Promise<void>;
	};
	channels: {
		get(channelId: string): Promise<DiscordChannel>;
		createMessage(channelId: string, options: CreateMessageOptions): Promise<DiscordMessage>;
		editMessage(
			channelId: string,
			messageId: string,
			options: EditMessageOptions,
		): Promise<DiscordMessage>;
		deleteMessage(channelId: string, messageId: string): Promise<void>;
		getMessage(channelId: string, messageId: string): Promise<DiscordMessage>;
		getMessages(
			channelId: string,
			options?: { limit?: number; before?: string; after?: string; around?: string },
		): Promise<DiscordMessage[]>;
		createReaction(channelId: string, messageId: string, emoji: string): Promise<void>;
		deleteReaction(
			channelId: string,
			messageId: string,
			emoji: string,
			userId?: string,
		): Promise<void>;
		triggerTyping(channelId: string): Promise<void>;
	};
	users: {
		get(userId: string): Promise<DiscordUser>;
		getCurrent(): Promise<DiscordUser>;
		createDM(userId: string): Promise<{ id: string }>;
	};
	commands: {
		listGlobal(applicationId: string): Promise<ApplicationCommand[]>;
		createGlobal(applicationId: string, command: ApplicationCommand): Promise<ApplicationCommand>;
		editGlobal(
			applicationId: string,
			commandId: string,
			command: Partial<ApplicationCommand>,
		): Promise<ApplicationCommand>;
		deleteGlobal(applicationId: string, commandId: string): Promise<void>;
		bulkOverwriteGlobal(
			applicationId: string,
			commands: ApplicationCommand[],
		): Promise<ApplicationCommand[]>;
		listGuild(applicationId: string, guildId: string): Promise<ApplicationCommand[]>;
		createGuild(
			applicationId: string,
			guildId: string,
			command: ApplicationCommand,
		): Promise<ApplicationCommand>;
		editGuild(
			applicationId: string,
			guildId: string,
			commandId: string,
			command: Partial<ApplicationCommand>,
		): Promise<ApplicationCommand>;
		deleteGuild(applicationId: string, guildId: string, commandId: string): Promise<void>;
		bulkOverwriteGuild(
			applicationId: string,
			guildId: string,
			commands: ApplicationCommand[],
		): Promise<ApplicationCommand[]>;
	};
	interactions: {
		reply(
			interactionId: string,
			interactionToken: string,
			options: CreateMessageOptions,
		): Promise<void>;
		editReply(
			applicationId: string,
			interactionToken: string,
			options: EditMessageOptions,
		): Promise<DiscordMessage>;
		deleteReply(applicationId: string, interactionToken: string): Promise<void>;
		followup(
			applicationId: string,
			interactionToken: string,
			options: CreateMessageOptions,
		): Promise<DiscordMessage>;
		editFollowup(
			applicationId: string,
			interactionToken: string,
			messageId: string,
			options: EditMessageOptions,
		): Promise<DiscordMessage>;
		deleteFollowup(
			applicationId: string,
			interactionToken: string,
			messageId: string,
		): Promise<void>;
	};
}

export function createDiscordClient(config: DiscordClientConfig): DiscordClient {
	const API_BASE = "https://discord.com/api/v10";
	const auth = config.botToken ? `Bot ${config.botToken}` : `Bearer ${config.accessToken}`;

	async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await fetch(`${API_BASE}${path}`, {
			method,
			headers: {
				Authorization: auth,
				...(body ? { "Content-Type": "application/json" } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Discord API error ${response.status}: ${error}`);
		}

		if (response.status === 204) {
			return {} as T;
		}

		return response.json() as Promise<T>;
	}

	return {
		request,

		guilds: {
			async get(guildId) {
				return request<DiscordGuild>("GET", `/guilds/${guildId}`);
			},

			async getChannels(guildId) {
				return request<DiscordChannel[]>("GET", `/guilds/${guildId}/channels`);
			},

			async getMember(guildId, userId) {
				return request<DiscordMember>("GET", `/guilds/${guildId}/members/${userId}`);
			},

			async listMembers(guildId, options = {}) {
				const params = new URLSearchParams();
				if (options.limit) params.set("limit", String(options.limit));
				if (options.after) params.set("after", options.after);
				const query = params.toString();
				return request<DiscordMember[]>(
					"GET",
					`/guilds/${guildId}/members${query ? `?${query}` : ""}`,
				);
			},

			async getRoles(guildId) {
				return request<DiscordRole[]>("GET", `/guilds/${guildId}/roles`);
			},

			async addMemberRole(guildId, userId, roleId) {
				return request<void>("PUT", `/guilds/${guildId}/members/${userId}/roles/${roleId}`);
			},

			async removeMemberRole(guildId, userId, roleId) {
				return request<void>("DELETE", `/guilds/${guildId}/members/${userId}/roles/${roleId}`);
			},

			async kickMember(guildId, userId, reason) {
				const headers: Record<string, string> = {};
				if (reason) headers["X-Audit-Log-Reason"] = reason;
				return request<void>("DELETE", `/guilds/${guildId}/members/${userId}`);
			},

			async banMember(guildId, userId, options = {}) {
				return request<void>("PUT", `/guilds/${guildId}/bans/${userId}`, options);
			},
		},

		channels: {
			async get(channelId) {
				return request<DiscordChannel>("GET", `/channels/${channelId}`);
			},

			async createMessage(channelId, options) {
				return request<DiscordMessage>("POST", `/channels/${channelId}/messages`, options);
			},

			async editMessage(channelId, messageId, options) {
				return request<DiscordMessage>(
					"PATCH",
					`/channels/${channelId}/messages/${messageId}`,
					options,
				);
			},

			async deleteMessage(channelId, messageId) {
				return request<void>("DELETE", `/channels/${channelId}/messages/${messageId}`);
			},

			async getMessage(channelId, messageId) {
				return request<DiscordMessage>("GET", `/channels/${channelId}/messages/${messageId}`);
			},

			async getMessages(channelId, options = {}) {
				const params = new URLSearchParams();
				if (options.limit) params.set("limit", String(options.limit));
				if (options.before) params.set("before", options.before);
				if (options.after) params.set("after", options.after);
				if (options.around) params.set("around", options.around);
				const query = params.toString();
				return request<DiscordMessage[]>(
					"GET",
					`/channels/${channelId}/messages${query ? `?${query}` : ""}`,
				);
			},

			async createReaction(channelId, messageId, emoji) {
				const encodedEmoji = encodeURIComponent(emoji);
				return request<void>(
					"PUT",
					`/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`,
				);
			},

			async deleteReaction(channelId, messageId, emoji, userId) {
				const encodedEmoji = encodeURIComponent(emoji);
				const target = userId || "@me";
				return request<void>(
					"DELETE",
					`/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/${target}`,
				);
			},

			async triggerTyping(channelId) {
				return request<void>("POST", `/channels/${channelId}/typing`);
			},
		},

		users: {
			async get(userId) {
				return request<DiscordUser>("GET", `/users/${userId}`);
			},

			async getCurrent() {
				return request<DiscordUser>("GET", "/users/@me");
			},

			async createDM(userId) {
				return request<{ id: string }>("POST", "/users/@me/channels", { recipient_id: userId });
			},
		},

		commands: {
			async listGlobal(applicationId) {
				return request<ApplicationCommand[]>("GET", `/applications/${applicationId}/commands`);
			},

			async createGlobal(applicationId, command) {
				return request<ApplicationCommand>(
					"POST",
					`/applications/${applicationId}/commands`,
					command,
				);
			},

			async editGlobal(applicationId, commandId, command) {
				return request<ApplicationCommand>(
					"PATCH",
					`/applications/${applicationId}/commands/${commandId}`,
					command,
				);
			},

			async deleteGlobal(applicationId, commandId) {
				return request<void>("DELETE", `/applications/${applicationId}/commands/${commandId}`);
			},

			async bulkOverwriteGlobal(applicationId, commands) {
				return request<ApplicationCommand[]>(
					"PUT",
					`/applications/${applicationId}/commands`,
					commands,
				);
			},

			async listGuild(applicationId, guildId) {
				return request<ApplicationCommand[]>(
					"GET",
					`/applications/${applicationId}/guilds/${guildId}/commands`,
				);
			},

			async createGuild(applicationId, guildId, command) {
				return request<ApplicationCommand>(
					"POST",
					`/applications/${applicationId}/guilds/${guildId}/commands`,
					command,
				);
			},

			async editGuild(applicationId, guildId, commandId, command) {
				return request<ApplicationCommand>(
					"PATCH",
					`/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`,
					command,
				);
			},

			async deleteGuild(applicationId, guildId, commandId) {
				return request<void>(
					"DELETE",
					`/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`,
				);
			},

			async bulkOverwriteGuild(applicationId, guildId, commands) {
				return request<ApplicationCommand[]>(
					"PUT",
					`/applications/${applicationId}/guilds/${guildId}/commands`,
					commands,
				);
			},
		},

		interactions: {
			async reply(interactionId, interactionToken, options) {
				return request<void>(
					"POST",
					`/interactions/${interactionId}/${interactionToken}/callback`,
					{
						type: 4,
						data: options,
					},
				);
			},

			async editReply(applicationId, interactionToken, options) {
				return request<DiscordMessage>(
					"PATCH",
					`/webhooks/${applicationId}/${interactionToken}/messages/@original`,
					options,
				);
			},

			async deleteReply(applicationId, interactionToken) {
				return request<void>(
					"DELETE",
					`/webhooks/${applicationId}/${interactionToken}/messages/@original`,
				);
			},

			async followup(applicationId, interactionToken, options) {
				return request<DiscordMessage>(
					"POST",
					`/webhooks/${applicationId}/${interactionToken}`,
					options,
				);
			},

			async editFollowup(applicationId, interactionToken, messageId, options) {
				return request<DiscordMessage>(
					"PATCH",
					`/webhooks/${applicationId}/${interactionToken}/messages/${messageId}`,
					options,
				);
			},

			async deleteFollowup(applicationId, interactionToken, messageId) {
				return request<void>(
					"DELETE",
					`/webhooks/${applicationId}/${interactionToken}/messages/${messageId}`,
				);
			},
		},
	};
}

// ============================================================================
// Command Option Types
// ============================================================================

export const COMMAND_OPTION_TYPES = {
	SUB_COMMAND: 1,
	SUB_COMMAND_GROUP: 2,
	STRING: 3,
	INTEGER: 4,
	BOOLEAN: 5,
	USER: 6,
	CHANNEL: 7,
	ROLE: 8,
	MENTIONABLE: 9,
	NUMBER: 10,
	ATTACHMENT: 11,
} as const;

// ============================================================================
// Command Builder Helper
// ============================================================================

export function command(name: string, description: string): ApplicationCommand {
	return { name, description };
}

export function option(
	type: ApplicationCommandOption["type"],
	name: string,
	description: string,
	config?: {
		required?: boolean;
		choices?: Array<{ name: string; value: string | number }>;
		options?: ApplicationCommandOption[];
		autocomplete?: boolean;
		minValue?: number;
		maxValue?: number;
		minLength?: number;
		maxLength?: number;
	},
): ApplicationCommandOption {
	return {
		type,
		name,
		description,
		required: config?.required,
		choices: config?.choices,
		options: config?.options,
		autocomplete: config?.autocomplete,
		min_value: config?.minValue,
		max_value: config?.maxValue,
		min_length: config?.minLength,
		max_length: config?.maxLength,
	};
}
