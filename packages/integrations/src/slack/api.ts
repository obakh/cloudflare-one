/**
 * Slack API Client for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createSlackClient } from "@repo/integrations/slack/api";
 *
 * const slack = createSlackClient(accessToken);
 *
 * // Send a message
 * await slack.chat.postMessage({
 *   channel: "C1234567890",
 *   text: "Hello!",
 * });
 *
 * // Send with blocks
 * await slack.chat.postMessage({
 *   channel: "C1234567890",
 *   blocks: [
 *     { type: "section", text: { type: "mrkdwn", text: "*Hello!*" } },
 *   ],
 * });
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface SlackApiResponse<T = unknown> {
	ok: boolean;
	error?: string;
	warning?: string;
	response_metadata?: {
		next_cursor?: string;
		scopes?: string[];
		acceptedScopes?: string[];
	};
	data?: T;
}

export interface SlackChannel {
	id: string;
	name: string;
	is_channel: boolean;
	is_group: boolean;
	is_im: boolean;
	is_mpim: boolean;
	is_private: boolean;
	is_archived: boolean;
	is_member: boolean;
	num_members?: number;
	topic?: { value: string; creator: string; last_set: number };
	purpose?: { value: string; creator: string; last_set: number };
}

export interface SlackMessage {
	type: string;
	subtype?: string;
	ts: string;
	user?: string;
	bot_id?: string;
	text?: string;
	blocks?: unknown[];
	attachments?: unknown[];
	thread_ts?: string;
	reply_count?: number;
	reply_users_count?: number;
}

export interface SlackUserInfo {
	id: string;
	team_id: string;
	name: string;
	deleted: boolean;
	real_name?: string;
	tz?: string;
	tz_label?: string;
	tz_offset?: number;
	profile: {
		title?: string;
		phone?: string;
		skype?: string;
		real_name?: string;
		real_name_normalized?: string;
		display_name?: string;
		display_name_normalized?: string;
		status_text?: string;
		status_emoji?: string;
		email?: string;
		image_24?: string;
		image_32?: string;
		image_48?: string;
		image_72?: string;
		image_192?: string;
		image_512?: string;
	};
	is_admin?: boolean;
	is_owner?: boolean;
	is_bot?: boolean;
	is_app_user?: boolean;
}

export interface PostMessageOptions {
	channel: string;
	text?: string;
	blocks?: unknown[];
	attachments?: unknown[];
	thread_ts?: string;
	reply_broadcast?: boolean;
	unfurl_links?: boolean;
	unfurl_media?: boolean;
	mrkdwn?: boolean;
	metadata?: { event_type: string; event_payload: Record<string, unknown> };
}

export interface UpdateMessageOptions {
	channel: string;
	ts: string;
	text?: string;
	blocks?: unknown[];
	attachments?: unknown[];
}

export interface OpenViewOptions {
	trigger_id: string;
	view: SlackView;
}

export interface SlackView {
	type: "modal" | "home";
	callback_id?: string;
	title: { type: "plain_text"; text: string; emoji?: boolean };
	submit?: { type: "plain_text"; text: string; emoji?: boolean };
	close?: { type: "plain_text"; text: string; emoji?: boolean };
	blocks: unknown[];
	private_metadata?: string;
	clear_on_close?: boolean;
	notify_on_close?: boolean;
}

// ============================================================================
// API Client
// ============================================================================

export interface SlackClient {
	request<T>(method: string, body?: Record<string, unknown> | object): Promise<T>;
	chat: {
		postMessage(
			options: PostMessageOptions,
		): Promise<{ ts: string; channel: string; message: SlackMessage }>;
		update(options: UpdateMessageOptions): Promise<{ ts: string; channel: string }>;
		delete(channel: string, ts: string): Promise<{ ok: boolean }>;
		postEphemeral(options: PostMessageOptions & { user: string }): Promise<{ message_ts: string }>;
	};
	conversations: {
		list(options?: {
			types?: string;
			limit?: number;
			cursor?: string;
		}): Promise<{ channels: SlackChannel[]; response_metadata?: { next_cursor: string } }>;
		info(channel: string): Promise<{ channel: SlackChannel }>;
		members(
			channel: string,
			options?: { limit?: number; cursor?: string },
		): Promise<{ members: string[]; response_metadata?: { next_cursor: string } }>;
		history(
			channel: string,
			options?: { limit?: number; cursor?: string; oldest?: string; latest?: string },
		): Promise<{ messages: SlackMessage[]; response_metadata?: { next_cursor: string } }>;
		join(channel: string): Promise<{ channel: SlackChannel }>;
		open(options: { users?: string; channel?: string }): Promise<{ channel: { id: string } }>;
	};
	users: {
		info(user: string): Promise<{ user: SlackUserInfo }>;
		list(options?: {
			limit?: number;
			cursor?: string;
		}): Promise<{ members: SlackUserInfo[]; response_metadata?: { next_cursor: string } }>;
		lookupByEmail(email: string): Promise<{ user: SlackUserInfo }>;
	};
	views: {
		open(options: OpenViewOptions): Promise<{ view: { id: string } }>;
		update(options: {
			view_id: string;
			view: SlackView;
			hash?: string;
		}): Promise<{ view: { id: string } }>;
		push(options: OpenViewOptions): Promise<{ view: { id: string } }>;
		publish(options: {
			user_id: string;
			view: SlackView;
			hash?: string;
		}): Promise<{ view: { id: string } }>;
	};
	reactions: {
		add(channel: string, timestamp: string, name: string): Promise<{ ok: boolean }>;
		remove(channel: string, timestamp: string, name: string): Promise<{ ok: boolean }>;
	};
	files: {
		upload(options: {
			channels?: string;
			content?: string;
			file?: Blob;
			filename?: string;
			title?: string;
			initial_comment?: string;
		}): Promise<{ file: { id: string; url_private: string } }>;
	};
}

export function createSlackClient(accessToken: string): SlackClient {
	async function request<T>(method: string, body?: Record<string, unknown> | object): Promise<T> {
		const response = await fetch(`https://slack.com/api/${method}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json; charset=utf-8",
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		const data = (await response.json()) as SlackApiResponse<T> & T;

		if (!data.ok) {
			throw new Error(`Slack API error: ${data.error}`);
		}

		return data;
	}

	return {
		request,

		chat: {
			async postMessage(options) {
				return request("chat.postMessage", options);
			},

			async update(options) {
				return request("chat.update", options);
			},

			async delete(channel, ts) {
				return request("chat.delete", { channel, ts });
			},

			async postEphemeral(options) {
				return request("chat.postEphemeral", options);
			},
		},

		conversations: {
			async list(options = {}) {
				return request("conversations.list", options);
			},

			async info(channel) {
				return request("conversations.info", { channel });
			},

			async members(channel, options = {}) {
				return request("conversations.members", { channel, ...options });
			},

			async history(channel, options = {}) {
				return request("conversations.history", { channel, ...options });
			},

			async join(channel) {
				return request("conversations.join", { channel });
			},

			async open(options) {
				return request("conversations.open", options);
			},
		},

		users: {
			async info(user) {
				return request("users.info", { user });
			},

			async list(options = {}) {
				return request("users.list", options);
			},

			async lookupByEmail(email) {
				return request("users.lookupByEmail", { email });
			},
		},

		views: {
			async open(options) {
				return request("views.open", options);
			},

			async update(options) {
				return request("views.update", options);
			},

			async push(options) {
				return request("views.push", options);
			},

			async publish(options) {
				return request("views.publish", options);
			},
		},

		reactions: {
			async add(channel, timestamp, name) {
				return request("reactions.add", { channel, timestamp, name });
			},

			async remove(channel, timestamp, name) {
				return request("reactions.remove", { channel, timestamp, name });
			},
		},

		files: {
			async upload(options) {
				// For file uploads, we need multipart form data
				const formData = new FormData();
				if (options.channels) formData.append("channels", options.channels);
				if (options.content) formData.append("content", options.content);
				if (options.file) formData.append("file", options.file);
				if (options.filename) formData.append("filename", options.filename);
				if (options.title) formData.append("title", options.title);
				if (options.initial_comment) formData.append("initial_comment", options.initial_comment);

				const response = await fetch("https://slack.com/api/files.upload", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
					body: formData,
				});

				const data = (await response.json()) as SlackApiResponse & {
					file: { id: string; url_private: string };
				};

				if (!data.ok) {
					throw new Error(`Slack API error: ${data.error}`);
				}

				return { file: data.file };
			},
		},
	};
}

// ============================================================================
// Block Kit Helpers
// ============================================================================

export const blocks = {
	section(text: string, accessory?: unknown) {
		return {
			type: "section",
			text: { type: "mrkdwn", text },
			...(accessory ? { accessory } : {}),
		};
	},

	divider() {
		return { type: "divider" };
	},

	header(text: string) {
		return {
			type: "header",
			text: { type: "plain_text", text, emoji: true },
		};
	},

	context(elements: Array<{ type: "mrkdwn" | "plain_text"; text: string }>) {
		return { type: "context", elements };
	},

	actions(elements: unknown[], blockId?: string) {
		return {
			type: "actions",
			...(blockId ? { block_id: blockId } : {}),
			elements,
		};
	},

	input(label: string, element: unknown, blockId: string, optional = false) {
		return {
			type: "input",
			block_id: blockId,
			optional,
			label: { type: "plain_text", text: label },
			element,
		};
	},

	image(imageUrl: string, altText: string, title?: string) {
		return {
			type: "image",
			image_url: imageUrl,
			alt_text: altText,
			...(title ? { title: { type: "plain_text", text: title } } : {}),
		};
	},
};

export const elements = {
	button(
		text: string,
		actionId: string,
		options?: { value?: string; style?: "primary" | "danger"; url?: string },
	) {
		return {
			type: "button",
			text: { type: "plain_text", text, emoji: true },
			action_id: actionId,
			...(options?.value ? { value: options.value } : {}),
			...(options?.style ? { style: options.style } : {}),
			...(options?.url ? { url: options.url } : {}),
		};
	},

	staticSelect(
		actionId: string,
		options: Array<{ text: string; value: string }>,
		placeholder?: string,
	) {
		return {
			type: "static_select",
			action_id: actionId,
			...(placeholder ? { placeholder: { type: "plain_text", text: placeholder } } : {}),
			options: options.map((o) => ({
				text: { type: "plain_text", text: o.text },
				value: o.value,
			})),
		};
	},

	usersSelect(actionId: string, placeholder?: string) {
		return {
			type: "users_select",
			action_id: actionId,
			...(placeholder ? { placeholder: { type: "plain_text", text: placeholder } } : {}),
		};
	},

	channelsSelect(actionId: string, placeholder?: string) {
		return {
			type: "channels_select",
			action_id: actionId,
			...(placeholder ? { placeholder: { type: "plain_text", text: placeholder } } : {}),
		};
	},

	datePicker(actionId: string, placeholder?: string, initialDate?: string) {
		return {
			type: "datepicker",
			action_id: actionId,
			...(placeholder ? { placeholder: { type: "plain_text", text: placeholder } } : {}),
			...(initialDate ? { initial_date: initialDate } : {}),
		};
	},

	plainTextInput(
		actionId: string,
		options?: { placeholder?: string; multiline?: boolean; initialValue?: string },
	) {
		return {
			type: "plain_text_input",
			action_id: actionId,
			...(options?.placeholder
				? { placeholder: { type: "plain_text", text: options.placeholder } }
				: {}),
			...(options?.multiline ? { multiline: true } : {}),
			...(options?.initialValue ? { initial_value: options.initialValue } : {}),
		};
	},

	overflow(actionId: string, options: Array<{ text: string; value: string }>) {
		return {
			type: "overflow",
			action_id: actionId,
			options: options.map((o) => ({
				text: { type: "plain_text", text: o.text },
				value: o.value,
			})),
		};
	},
};
