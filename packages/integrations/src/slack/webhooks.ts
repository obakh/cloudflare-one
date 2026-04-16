/**
 * Slack Webhook/Events handling for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createSlackEventHandler } from "@repo/integrations/slack/webhooks";
 *
 * const handler = createSlackEventHandler(env.SLACK_SIGNING_SECRET, {
 *   url_verification: async (event) => {
 *     return { challenge: event.challenge };
 *   },
 *   message: async (event) => {
 *     console.log("Message:", event.text);
 *   },
 *   app_mention: async (event) => {
 *     console.log("Mentioned in:", event.channel);
 *   },
 * });
 *
 * export default { fetch: handler };
 * ```
 */

import { computeHmacSha256, timingSafeEqual } from "@repo/security/crypto";

// ============================================================================
// Types
// ============================================================================

export type SlackEventType =
	| "url_verification"
	| "event_callback"
	| "app_rate_limited"
	| "app_uninstalled"
	| "app_home_opened"
	| "app_mention"
	| "channel_archive"
	| "channel_created"
	| "channel_deleted"
	| "channel_history_changed"
	| "channel_left"
	| "channel_rename"
	| "channel_unarchive"
	| "dnd_updated"
	| "dnd_updated_user"
	| "emoji_changed"
	| "file_change"
	| "file_comment_added"
	| "file_comment_deleted"
	| "file_comment_edited"
	| "file_created"
	| "file_deleted"
	| "file_public"
	| "file_shared"
	| "file_unshared"
	| "grid_migration_finished"
	| "grid_migration_started"
	| "group_archive"
	| "group_close"
	| "group_deleted"
	| "group_history_changed"
	| "group_left"
	| "group_open"
	| "group_rename"
	| "group_unarchive"
	| "im_close"
	| "im_created"
	| "im_history_changed"
	| "im_open"
	| "link_shared"
	| "member_joined_channel"
	| "member_left_channel"
	| "message"
	| "message.channels"
	| "message.groups"
	| "message.im"
	| "message.mpim"
	| "pin_added"
	| "pin_removed"
	| "reaction_added"
	| "reaction_removed"
	| "star_added"
	| "star_removed"
	| "subteam_created"
	| "subteam_members_changed"
	| "subteam_self_added"
	| "subteam_self_removed"
	| "subteam_updated"
	| "team_domain_change"
	| "team_join"
	| "team_rename"
	| "tokens_revoked"
	| "user_change"
	| "user_profile_changed"
	| "workflow_step_execute";

export interface SlackEventBase {
	type: string;
	event_ts?: string;
}

export interface SlackUrlVerification {
	type: "url_verification";
	token: string;
	challenge: string;
}

export interface SlackEventCallback<T = SlackEventBase> {
	type: "event_callback";
	token: string;
	team_id: string;
	api_app_id: string;
	event: T;
	event_id: string;
	event_time: number;
	authorizations?: Array<{
		enterprise_id: string | null;
		team_id: string;
		user_id: string;
		is_bot: boolean;
		is_enterprise_install: boolean;
	}>;
}

export interface SlackMessageEvent extends SlackEventBase {
	type: "message";
	subtype?: string;
	channel: string;
	user?: string;
	text?: string;
	ts: string;
	thread_ts?: string;
	bot_id?: string;
	blocks?: unknown[];
	attachments?: unknown[];
	files?: unknown[];
}

export interface SlackAppMentionEvent extends SlackEventBase {
	type: "app_mention";
	channel: string;
	user: string;
	text: string;
	ts: string;
	thread_ts?: string;
	blocks?: unknown[];
}

export interface SlackReactionEvent extends SlackEventBase {
	type: "reaction_added" | "reaction_removed";
	user: string;
	reaction: string;
	item_user?: string;
	item: {
		type: "message" | "file" | "file_comment";
		channel?: string;
		ts?: string;
		file?: string;
		file_comment?: string;
	};
}

export interface SlackMemberJoinedEvent extends SlackEventBase {
	type: "member_joined_channel";
	user: string;
	channel: string;
	channel_type: string;
	team: string;
	inviter?: string;
}

export interface SlackAppHomeOpenedEvent extends SlackEventBase {
	type: "app_home_opened";
	user: string;
	channel: string;
	tab: "home" | "messages";
	view?: unknown;
}

// Handler types
type EventHandler<T extends SlackEventBase> = (event: T) => Promise<unknown> | unknown;

export type SlackEventHandlers = {
	url_verification?: EventHandler<SlackUrlVerification>;
	message?: EventHandler<SlackMessageEvent>;
	app_mention?: EventHandler<SlackAppMentionEvent>;
	reaction_added?: EventHandler<SlackReactionEvent>;
	reaction_removed?: EventHandler<SlackReactionEvent>;
	member_joined_channel?: EventHandler<SlackMemberJoinedEvent>;
	app_home_opened?: EventHandler<SlackAppHomeOpenedEvent>;
};

// ============================================================================
// Slash Command Types
// ============================================================================

export interface SlackSlashCommand {
	token: string;
	team_id: string;
	team_domain: string;
	enterprise_id?: string;
	enterprise_name?: string;
	channel_id: string;
	channel_name: string;
	user_id: string;
	user_name: string;
	command: string;
	text: string;
	api_app_id: string;
	is_enterprise_install: string;
	response_url: string;
	trigger_id: string;
}

export type SlashCommandHandler = (
	command: SlackSlashCommand,
) => Promise<SlackSlashCommandResponse | undefined> | SlackSlashCommandResponse | undefined;

export interface SlackSlashCommandResponse {
	response_type?: "in_channel" | "ephemeral";
	text?: string;
	blocks?: unknown[];
	attachments?: unknown[];
	replace_original?: boolean;
	delete_original?: boolean;
}

// ============================================================================
// Interactive Payload Types
// ============================================================================

export interface SlackInteractivePayload {
	type: "block_actions" | "view_submission" | "view_closed" | "shortcut" | "message_action";
	token: string;
	trigger_id: string;
	user: { id: string; username: string; name: string; team_id: string };
	team: { id: string; domain: string };
	channel?: { id: string; name: string };
	message?: { ts: string; text: string };
	response_url?: string;
	actions?: Array<{
		type: string;
		action_id: string;
		block_id: string;
		value?: string;
		selected_option?: { value: string };
		selected_user?: string;
		selected_channel?: string;
		selected_date?: string;
	}>;
	view?: {
		id: string;
		type: string;
		callback_id: string;
		state: {
			values: Record<
				string,
				Record<string, { value?: string; selected_option?: { value: string } }>
			>;
		};
		private_metadata?: string;
	};
}

export type InteractiveHandler = (payload: SlackInteractivePayload) => Promise<unknown> | unknown;

// ============================================================================
// Webhook Verification
// ============================================================================

/**
 * Verify Slack request signature
 */
export async function verifySlackRequest(
	body: string,
	timestamp: string,
	signature: string,
	signingSecret: string,
	tolerance = 300, // 5 minutes
): Promise<boolean> {
	// Check timestamp
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - Number.parseInt(timestamp, 10)) > tolerance) {
		return false;
	}

	// Compute signature
	const baseString = `v0:${timestamp}:${body}`;
	const expectedSignature = await computeHmacSha256(signingSecret, baseString);

	// Compare (signature format: v0=hash)
	const actualSignature = signature.startsWith("v0=") ? signature.slice(3) : signature;

	return timingSafeEqual(expectedSignature, actualSignature);
}

// ============================================================================
// Event Handler
// ============================================================================

/**
 * Create a Slack event handler
 */
export function createSlackEventHandler(
	signingSecret: string,
	handlers: SlackEventHandlers,
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const timestamp = request.headers.get("x-slack-request-timestamp");
		const signature = request.headers.get("x-slack-signature");

		if (!timestamp || !signature) {
			return new Response("Missing signature headers", { status: 400 });
		}

		const body = await request.text();

		// Verify signature
		const isValid = await verifySlackRequest(body, timestamp, signature, signingSecret);
		if (!isValid) {
			return new Response("Invalid signature", { status: 401 });
		}

		try {
			const payload = JSON.parse(body) as SlackUrlVerification | SlackEventCallback;

			// Handle URL verification challenge
			if (payload.type === "url_verification") {
				const handler = handlers.url_verification;
				if (handler) {
					const result = await handler(payload);
					if (result && typeof result === "object" && "challenge" in result) {
						return new Response(JSON.stringify(result), {
							headers: { "Content-Type": "application/json" },
						});
					}
				}
				return new Response(JSON.stringify({ challenge: payload.challenge }), {
					headers: { "Content-Type": "application/json" },
				});
			}

			// Handle event callback
			if (payload.type === "event_callback") {
				const eventType = payload.event.type as keyof SlackEventHandlers;
				const handler = handlers[eventType];

				if (handler) {
					await (handler as (event: SlackEventBase) => Promise<unknown>)(payload.event);
				}
			}

			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Slack event error:", message);

			return new Response(JSON.stringify({ error: message }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	};
}

/**
 * Create a Slack slash command handler
 */
export function createSlackSlashCommandHandler(
	signingSecret: string,
	handlers: Record<string, SlashCommandHandler>,
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const timestamp = request.headers.get("x-slack-request-timestamp");
		const signature = request.headers.get("x-slack-signature");

		if (!timestamp || !signature) {
			return new Response("Missing signature headers", { status: 400 });
		}

		const body = await request.text();

		// Verify signature
		const isValid = await verifySlackRequest(body, timestamp, signature, signingSecret);
		if (!isValid) {
			return new Response("Invalid signature", { status: 401 });
		}

		try {
			const params = new URLSearchParams(body);
			const command: SlackSlashCommand = {
				token: params.get("token") || "",
				team_id: params.get("team_id") || "",
				team_domain: params.get("team_domain") || "",
				enterprise_id: params.get("enterprise_id") || undefined,
				enterprise_name: params.get("enterprise_name") || undefined,
				channel_id: params.get("channel_id") || "",
				channel_name: params.get("channel_name") || "",
				user_id: params.get("user_id") || "",
				user_name: params.get("user_name") || "",
				command: params.get("command") || "",
				text: params.get("text") || "",
				api_app_id: params.get("api_app_id") || "",
				is_enterprise_install: params.get("is_enterprise_install") || "false",
				response_url: params.get("response_url") || "",
				trigger_id: params.get("trigger_id") || "",
			};

			const handler = handlers[command.command];
			if (handler) {
				const result = await handler(command);
				if (result) {
					return new Response(JSON.stringify(result), {
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			return new Response("", { status: 200 });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Slack command error:", message);

			return new Response(JSON.stringify({ text: "An error occurred" }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}
	};
}

/**
 * Create a Slack interactive handler
 */
export function createSlackInteractiveHandler(
	signingSecret: string,
	handlers: Record<string, InteractiveHandler>,
): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const timestamp = request.headers.get("x-slack-request-timestamp");
		const signature = request.headers.get("x-slack-signature");

		if (!timestamp || !signature) {
			return new Response("Missing signature headers", { status: 400 });
		}

		const body = await request.text();

		// Verify signature
		const isValid = await verifySlackRequest(body, timestamp, signature, signingSecret);
		if (!isValid) {
			return new Response("Invalid signature", { status: 401 });
		}

		try {
			const params = new URLSearchParams(body);
			const payloadStr = params.get("payload");
			if (!payloadStr) {
				return new Response("Missing payload", { status: 400 });
			}

			const payload = JSON.parse(payloadStr) as SlackInteractivePayload;
			const handler = handlers[payload.type];

			if (handler) {
				const result = await handler(payload);
				if (result) {
					return new Response(JSON.stringify(result), {
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			return new Response("", { status: 200 });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Slack interactive error:", message);

			return new Response("", { status: 200 });
		}
	};
}

// ============================================================================
// Hono Middleware
// ============================================================================

export function slackEvents<Env extends { SLACK_SIGNING_SECRET?: string }>(options: {
	secret: string | ((c: { env: Env }) => string);
	handlers: SlackEventHandlers;
}) {
	return async (c: { req: { raw: Request }; env: Env }) => {
		const secret = typeof options.secret === "function" ? options.secret(c) : options.secret;
		const handler = createSlackEventHandler(secret, options.handlers);
		return handler(c.req.raw);
	};
}

export function slackCommands<Env extends { SLACK_SIGNING_SECRET?: string }>(options: {
	secret: string | ((c: { env: Env }) => string);
	handlers: Record<string, SlashCommandHandler>;
}) {
	return async (c: { req: { raw: Request }; env: Env }) => {
		const secret = typeof options.secret === "function" ? options.secret(c) : options.secret;
		const handler = createSlackSlashCommandHandler(secret, options.handlers);
		return handler(c.req.raw);
	};
}
