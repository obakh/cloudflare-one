/**
 * Discord Webhook/Interactions handling for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createDiscordInteractionHandler } from "@repo/integrations/discord/webhooks";
 *
 * const handler = createDiscordInteractionHandler(env.DISCORD_PUBLIC_KEY, {
 *   ping: () => ({ type: 1 }),
 *   applicationCommand: async (interaction) => {
 *     if (interaction.data.name === "hello") {
 *       return {
 *         type: 4,
 *         data: { content: "Hello!" },
 *       };
 *     }
 *   },
 *   messageComponent: async (interaction) => {
 *     // Handle button clicks, select menus
 *   },
 * });
 *
 * export default { fetch: handler };
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type DiscordInteractionType =
	| 1 // PING
	| 2 // APPLICATION_COMMAND
	| 3 // MESSAGE_COMPONENT
	| 4 // APPLICATION_COMMAND_AUTOCOMPLETE
	| 5; // MODAL_SUBMIT

export type DiscordInteractionResponseType =
	| 1 // PONG
	| 4 // CHANNEL_MESSAGE_WITH_SOURCE
	| 5 // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
	| 6 // DEFERRED_UPDATE_MESSAGE
	| 7 // UPDATE_MESSAGE
	| 8 // APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
	| 9; // MODAL

export interface DiscordInteraction {
	id: string;
	application_id: string;
	type: DiscordInteractionType;
	data?: DiscordInteractionData;
	guild_id?: string;
	channel_id?: string;
	member?: DiscordMember;
	user?: DiscordUser;
	token: string;
	version: number;
	message?: DiscordMessage;
	app_permissions?: string;
	locale?: string;
	guild_locale?: string;
}

export interface DiscordInteractionData {
	id?: string;
	name?: string;
	type?: number;
	resolved?: {
		users?: Record<string, DiscordUser>;
		members?: Record<string, Partial<DiscordMember>>;
		roles?: Record<string, DiscordRole>;
		channels?: Record<string, Partial<DiscordChannel>>;
		messages?: Record<string, DiscordMessage>;
	};
	options?: DiscordCommandOption[];
	guild_id?: string;
	target_id?: string;
	custom_id?: string;
	component_type?: number;
	values?: string[];
	components?: DiscordComponent[];
}

export interface DiscordCommandOption {
	name: string;
	type: number;
	value?: string | number | boolean;
	options?: DiscordCommandOption[];
	focused?: boolean;
}

export interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	global_name?: string;
	avatar?: string;
	bot?: boolean;
	system?: boolean;
	public_flags?: number;
}

export interface DiscordMember {
	user?: DiscordUser;
	nick?: string;
	avatar?: string;
	roles: string[];
	joined_at: string;
	premium_since?: string;
	deaf: boolean;
	mute: boolean;
	pending?: boolean;
	permissions?: string;
}

export interface DiscordRole {
	id: string;
	name: string;
	color: number;
	hoist: boolean;
	position: number;
	permissions: string;
	managed: boolean;
	mentionable: boolean;
}

export interface DiscordChannel {
	id: string;
	type: number;
	name?: string;
	permissions?: string;
}

export interface DiscordMessage {
	id: string;
	channel_id: string;
	author: DiscordUser;
	content: string;
	timestamp: string;
	edited_timestamp?: string;
	tts: boolean;
	mention_everyone: boolean;
	mentions: DiscordUser[];
	mention_roles: string[];
	attachments: unknown[];
	embeds: DiscordEmbed[];
	components?: DiscordComponent[];
}

export interface DiscordEmbed {
	title?: string;
	type?: string;
	description?: string;
	url?: string;
	timestamp?: string;
	color?: number;
	footer?: { text: string; icon_url?: string };
	image?: { url: string; height?: number; width?: number };
	thumbnail?: { url: string; height?: number; width?: number };
	author?: { name: string; url?: string; icon_url?: string };
	fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

export interface DiscordComponent {
	type: number;
	custom_id?: string;
	style?: number;
	label?: string;
	emoji?: { id?: string; name?: string; animated?: boolean };
	url?: string;
	disabled?: boolean;
	options?: Array<{
		label: string;
		value: string;
		description?: string;
		emoji?: { id?: string; name?: string };
		default?: boolean;
	}>;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	components?: DiscordComponent[];
	min_length?: number;
	max_length?: number;
	required?: boolean;
	value?: string;
}

export interface DiscordInteractionResponse {
	type: DiscordInteractionResponseType;
	data?: {
		tts?: boolean;
		content?: string;
		embeds?: DiscordEmbed[];
		allowed_mentions?: {
			parse?: ("roles" | "users" | "everyone")[];
			roles?: string[];
			users?: string[];
			replied_user?: boolean;
		};
		flags?: number;
		components?: DiscordComponent[];
		attachments?: unknown[];
		choices?: Array<{ name: string; value: string | number }>;
		custom_id?: string;
		title?: string;
	};
}

// Handler types
export type InteractionHandler = (
	interaction: DiscordInteraction,
) => Promise<DiscordInteractionResponse | undefined> | DiscordInteractionResponse | undefined;

export interface DiscordInteractionHandlers {
	ping?: () => DiscordInteractionResponse;
	applicationCommand?: InteractionHandler;
	messageComponent?: InteractionHandler;
	autocomplete?: InteractionHandler;
	modalSubmit?: InteractionHandler;
}

// ============================================================================
// Signature Verification
// ============================================================================

import { verifyEd25519 } from "@repo/security/crypto";

/**
 * Verify Discord interaction signature using Ed25519
 */
export async function verifyDiscordSignature(
	publicKey: string,
	signature: string,
	timestamp: string,
	body: string,
): Promise<boolean> {
	return verifyEd25519(publicKey, signature, timestamp + body);
}

// ============================================================================
// Interaction Handler
// ============================================================================

/**
 * Create a Discord interaction handler
 */
export function createDiscordInteractionHandler(
	publicKey: string,
	handlers: DiscordInteractionHandlers,
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const signature = request.headers.get("x-signature-ed25519");
		const timestamp = request.headers.get("x-signature-timestamp");

		if (!signature || !timestamp) {
			return new Response("Missing signature headers", { status: 401 });
		}

		const body = await request.text();

		// Verify signature
		const isValid = await verifyDiscordSignature(publicKey, signature, timestamp, body);
		if (!isValid) {
			return new Response("Invalid signature", { status: 401 });
		}

		try {
			const interaction = JSON.parse(body) as DiscordInteraction;
			let response: DiscordInteractionResponse | undefined;

			switch (interaction.type) {
				case 1: // PING
					response = handlers.ping?.() ?? { type: 1 };
					break;
				case 2: // APPLICATION_COMMAND
					response = await handlers.applicationCommand?.(interaction);
					break;
				case 3: // MESSAGE_COMPONENT
					response = await handlers.messageComponent?.(interaction);
					break;
				case 4: // AUTOCOMPLETE
					response = await handlers.autocomplete?.(interaction);
					break;
				case 5: // MODAL_SUBMIT
					response = await handlers.modalSubmit?.(interaction);
					break;
			}

			if (!response) {
				return new Response(JSON.stringify({ type: 1 }), {
					headers: { "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify(response), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Discord interaction error:", message);

			return new Response(JSON.stringify({ error: message }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	};
}

// ============================================================================
// Webhook Execution
// ============================================================================

export interface DiscordWebhookMessage {
	content?: string;
	username?: string;
	avatar_url?: string;
	tts?: boolean;
	embeds?: DiscordEmbed[];
	allowed_mentions?: {
		parse?: ("roles" | "users" | "everyone")[];
		roles?: string[];
		users?: string[];
	};
	components?: DiscordComponent[];
	files?: unknown[];
	flags?: number;
	thread_name?: string;
}

/**
 * Execute a Discord webhook
 */
export async function executeWebhook(
	webhookUrl: string,
	message: DiscordWebhookMessage,
	options?: { wait?: boolean; threadId?: string },
): Promise<DiscordMessage | undefined> {
	const url = new URL(webhookUrl);
	if (options?.wait) url.searchParams.set("wait", "true");
	if (options?.threadId) url.searchParams.set("thread_id", options.threadId);

	const response = await fetch(url.toString(), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(message),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Discord webhook error: ${error}`);
	}

	if (options?.wait) {
		return response.json() as Promise<DiscordMessage>;
	}
}

/**
 * Edit a webhook message
 */
export async function editWebhookMessage(
	webhookUrl: string,
	messageId: string,
	message: Partial<DiscordWebhookMessage>,
): Promise<DiscordMessage> {
	const response = await fetch(`${webhookUrl}/messages/${messageId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(message),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Discord webhook error: ${error}`);
	}

	return response.json() as Promise<DiscordMessage>;
}

/**
 * Delete a webhook message
 */
export async function deleteWebhookMessage(webhookUrl: string, messageId: string): Promise<void> {
	const response = await fetch(`${webhookUrl}/messages/${messageId}`, {
		method: "DELETE",
	});

	if (!response.ok && response.status !== 404) {
		const error = await response.text();
		throw new Error(`Discord webhook error: ${error}`);
	}
}

// ============================================================================
// Hono Middleware
// ============================================================================

export function discordInteractions<Env extends { DISCORD_PUBLIC_KEY?: string }>(options: {
	publicKey: string | ((c: { env: Env }) => string);
	handlers: DiscordInteractionHandlers;
}) {
	return async (c: { req: { raw: Request }; env: Env }) => {
		const publicKey =
			typeof options.publicKey === "function" ? options.publicKey(c) : options.publicKey;
		const handler = createDiscordInteractionHandler(publicKey, options.handlers);
		return handler(c.req.raw);
	};
}

// ============================================================================
// Response Helpers
// ============================================================================

export const responses = {
	/** Acknowledge ping */
	pong(): DiscordInteractionResponse {
		return { type: 1 };
	},

	/** Send a message */
	message(
		content: string,
		options?: { ephemeral?: boolean; embeds?: DiscordEmbed[]; components?: DiscordComponent[] },
	): DiscordInteractionResponse {
		return {
			type: 4,
			data: {
				content,
				embeds: options?.embeds,
				components: options?.components,
				flags: options?.ephemeral ? 64 : undefined,
			},
		};
	},

	/** Defer response (show "thinking...") */
	defer(ephemeral = false): DiscordInteractionResponse {
		return {
			type: 5,
			data: ephemeral ? { flags: 64 } : undefined,
		};
	},

	/** Defer component update */
	deferUpdate(): DiscordInteractionResponse {
		return { type: 6 };
	},

	/** Update the original message */
	update(
		content: string,
		options?: { embeds?: DiscordEmbed[]; components?: DiscordComponent[] },
	): DiscordInteractionResponse {
		return {
			type: 7,
			data: {
				content,
				embeds: options?.embeds,
				components: options?.components,
			},
		};
	},

	/** Autocomplete suggestions */
	autocomplete(
		choices: Array<{ name: string; value: string | number }>,
	): DiscordInteractionResponse {
		return {
			type: 8,
			data: { choices },
		};
	},

	/** Show a modal */
	modal(
		customId: string,
		title: string,
		components: DiscordComponent[],
	): DiscordInteractionResponse {
		return {
			type: 9,
			data: {
				custom_id: customId,
				title,
				components,
			},
		};
	},
};

// ============================================================================
// Component Helpers
// ============================================================================

export const components = {
	/** Action row container */
	actionRow(...children: DiscordComponent[]): DiscordComponent {
		return { type: 1, components: children };
	},

	/** Button */
	button(
		customId: string,
		label: string,
		options?: { style?: 1 | 2 | 3 | 4; emoji?: { name: string; id?: string }; disabled?: boolean },
	): DiscordComponent {
		return {
			type: 2,
			custom_id: customId,
			label,
			style: options?.style ?? 1,
			emoji: options?.emoji,
			disabled: options?.disabled,
		};
	},

	/** Link button */
	linkButton(
		url: string,
		label: string,
		options?: { emoji?: { name: string; id?: string }; disabled?: boolean },
	): DiscordComponent {
		return {
			type: 2,
			url,
			label,
			style: 5,
			emoji: options?.emoji,
			disabled: options?.disabled,
		};
	},

	/** String select menu */
	stringSelect(
		customId: string,
		options: Array<{ label: string; value: string; description?: string; default?: boolean }>,
		config?: { placeholder?: string; minValues?: number; maxValues?: number; disabled?: boolean },
	): DiscordComponent {
		return {
			type: 3,
			custom_id: customId,
			options,
			placeholder: config?.placeholder,
			min_values: config?.minValues,
			max_values: config?.maxValues,
			disabled: config?.disabled,
		};
	},

	/** User select menu */
	userSelect(
		customId: string,
		config?: { placeholder?: string; minValues?: number; maxValues?: number; disabled?: boolean },
	): DiscordComponent {
		return {
			type: 5,
			custom_id: customId,
			placeholder: config?.placeholder,
			min_values: config?.minValues,
			max_values: config?.maxValues,
			disabled: config?.disabled,
		};
	},

	/** Role select menu */
	roleSelect(
		customId: string,
		config?: { placeholder?: string; minValues?: number; maxValues?: number; disabled?: boolean },
	): DiscordComponent {
		return {
			type: 6,
			custom_id: customId,
			placeholder: config?.placeholder,
			min_values: config?.minValues,
			max_values: config?.maxValues,
			disabled: config?.disabled,
		};
	},

	/** Channel select menu */
	channelSelect(
		customId: string,
		config?: { placeholder?: string; minValues?: number; maxValues?: number; disabled?: boolean },
	): DiscordComponent {
		return {
			type: 8,
			custom_id: customId,
			placeholder: config?.placeholder,
			min_values: config?.minValues,
			max_values: config?.maxValues,
			disabled: config?.disabled,
		};
	},

	/** Text input (for modals) */
	textInput(
		customId: string,
		label: string,
		options?: {
			style?: 1 | 2;
			placeholder?: string;
			value?: string;
			minLength?: number;
			maxLength?: number;
			required?: boolean;
		},
	): DiscordComponent {
		return {
			type: 4,
			custom_id: customId,
			label,
			style: options?.style ?? 1,
			placeholder: options?.placeholder,
			value: options?.value,
			min_length: options?.minLength,
			max_length: options?.maxLength,
			required: options?.required ?? true,
		};
	},
};

// ============================================================================
// Embed Helper
// ============================================================================

export function embed(options: {
	title?: string;
	description?: string;
	url?: string;
	color?: number;
	timestamp?: string | Date;
	footer?: { text: string; iconUrl?: string };
	image?: string;
	thumbnail?: string;
	author?: { name: string; url?: string; iconUrl?: string };
	fields?: Array<{ name: string; value: string; inline?: boolean }>;
}): DiscordEmbed {
	return {
		title: options.title,
		description: options.description,
		url: options.url,
		color: options.color,
		timestamp:
			options.timestamp instanceof Date ? options.timestamp.toISOString() : options.timestamp,
		footer: options.footer
			? { text: options.footer.text, icon_url: options.footer.iconUrl }
			: undefined,
		image: options.image ? { url: options.image } : undefined,
		thumbnail: options.thumbnail ? { url: options.thumbnail } : undefined,
		author: options.author
			? { name: options.author.name, url: options.author.url, icon_url: options.author.iconUrl }
			: undefined,
		fields: options.fields,
	};
}
