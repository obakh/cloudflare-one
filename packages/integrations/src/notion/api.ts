/**
 * Notion API Client for Cloudflare Workers
 *
 * @example
 * ```ts
 * import { createNotionClient } from "@repo/integrations/notion/api";
 *
 * const notion = createNotionClient(accessToken);
 *
 * // Search
 * const results = await notion.search({ query: "Meeting notes" });
 *
 * // Get database
 * const db = await notion.databases.get(databaseId);
 *
 * // Query database
 * const pages = await notion.databases.query(databaseId, {
 *   filter: { property: "Status", select: { equals: "Done" } },
 * });
 *
 * // Create page
 * const page = await notion.pages.create({
 *   parent: { database_id: databaseId },
 *   properties: { Name: { title: [{ text: { content: "New page" } }] } },
 * });
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface NotionPage {
	id: string;
	object: "page";
	created_time: string;
	last_edited_time: string;
	created_by: { id: string };
	last_edited_by: { id: string };
	parent: NotionParent;
	archived: boolean;
	properties: Record<string, NotionProperty>;
	url: string;
	icon?: NotionIcon;
	cover?: NotionFile;
}

export interface NotionDatabase {
	id: string;
	object: "database";
	created_time: string;
	last_edited_time: string;
	title: NotionRichText[];
	description: NotionRichText[];
	icon?: NotionIcon;
	cover?: NotionFile;
	properties: Record<string, NotionPropertySchema>;
	parent: NotionParent;
	url: string;
	archived: boolean;
	is_inline: boolean;
}

export interface NotionBlock {
	id: string;
	object: "block";
	type: string;
	created_time: string;
	last_edited_time: string;
	has_children: boolean;
	archived: boolean;
	[key: string]: unknown;
}

export type NotionParent =
	| { type: "database_id"; database_id: string }
	| { type: "page_id"; page_id: string }
	| { type: "workspace"; workspace: true }
	| { type: "block_id"; block_id: string };

export type NotionIcon =
	| { type: "emoji"; emoji: string }
	| { type: "external"; external: { url: string } }
	| { type: "file"; file: { url: string; expiry_time: string } };

export type NotionFile =
	| { type: "external"; external: { url: string } }
	| { type: "file"; file: { url: string; expiry_time: string } };

export interface NotionRichText {
	type: "text" | "mention" | "equation";
	text?: { content: string; link?: { url: string } | null };
	mention?: { type: string; [key: string]: unknown };
	equation?: { expression: string };
	annotations: {
		bold: boolean;
		italic: boolean;
		strikethrough: boolean;
		underline: boolean;
		code: boolean;
		color: string;
	};
	plain_text: string;
	href?: string | null;
}

export type NotionProperty =
	| { type: "title"; title: NotionRichText[]; id: string }
	| { type: "rich_text"; rich_text: NotionRichText[]; id: string }
	| { type: "number"; number: number | null; id: string }
	| { type: "select"; select: { id: string; name: string; color: string } | null; id: string }
	| {
			type: "multi_select";
			multi_select: Array<{ id: string; name: string; color: string }>;
			id: string;
	  }
	| { type: "date"; date: { start: string; end?: string; time_zone?: string } | null; id: string }
	| { type: "checkbox"; checkbox: boolean; id: string }
	| { type: "url"; url: string | null; id: string }
	| { type: "email"; email: string | null; id: string }
	| { type: "phone_number"; phone_number: string | null; id: string }
	| { type: "status"; status: { id: string; name: string; color: string } | null; id: string }
	| { type: "people"; people: Array<{ id: string }>; id: string }
	| { type: "files"; files: NotionFile[]; id: string }
	| { type: "relation"; relation: Array<{ id: string }>; id: string }
	| { type: "formula"; formula: { type: string; [key: string]: unknown }; id: string }
	| { type: "rollup"; rollup: { type: string; [key: string]: unknown }; id: string }
	| { type: "created_time"; created_time: string; id: string }
	| { type: "last_edited_time"; last_edited_time: string; id: string }
	| { type: "created_by"; created_by: { id: string }; id: string }
	| { type: "last_edited_by"; last_edited_by: { id: string }; id: string };

export interface NotionPropertySchema {
	id: string;
	name: string;
	type: string;
	[key: string]: unknown;
}

export interface NotionUser {
	id: string;
	object: "user";
	type: "person" | "bot";
	name?: string;
	avatar_url?: string;
}

export interface SearchOptions {
	query?: string;
	filter?: { property: "object"; value: "page" | "database" };
	sort?: { direction: "ascending" | "descending"; timestamp: "last_edited_time" };
	start_cursor?: string;
	page_size?: number;
}

export interface QueryDatabaseOptions {
	filter?: Record<string, unknown>;
	sorts?: Array<
		| { property: string; direction: "ascending" | "descending" }
		| { timestamp: "created_time" | "last_edited_time"; direction: "ascending" | "descending" }
	>;
	start_cursor?: string;
	page_size?: number;
}

export interface CreatePageInput {
	parent: { database_id: string } | { page_id: string };
	properties: Record<string, unknown>;
	children?: unknown[];
	icon?: NotionIcon;
	cover?: { type: "external"; external: { url: string } };
}

export interface UpdatePageInput {
	properties?: Record<string, unknown>;
	archived?: boolean;
	icon?: NotionIcon | null;
	cover?: { type: "external"; external: { url: string } } | null;
}

// ============================================================================
// API Client
// ============================================================================

export interface NotionClient {
	request<T>(method: string, path: string, body?: unknown): Promise<T>;
	search(options?: SearchOptions): Promise<{
		results: Array<NotionPage | NotionDatabase>;
		next_cursor?: string;
		has_more: boolean;
	}>;
	users: {
		list(options?: {
			start_cursor?: string;
			page_size?: number;
		}): Promise<{ results: NotionUser[]; next_cursor?: string; has_more: boolean }>;
		get(userId: string): Promise<NotionUser>;
		me(): Promise<NotionUser>;
	};
	databases: {
		get(databaseId: string): Promise<NotionDatabase>;
		query(
			databaseId: string,
			options?: QueryDatabaseOptions,
		): Promise<{ results: NotionPage[]; next_cursor?: string; has_more: boolean }>;
		create(options: {
			parent: { page_id: string };
			title: NotionRichText[];
			properties: Record<string, NotionPropertySchema>;
		}): Promise<NotionDatabase>;
		update(
			databaseId: string,
			options: {
				title?: NotionRichText[];
				description?: NotionRichText[];
				properties?: Record<string, NotionPropertySchema | null>;
			},
		): Promise<NotionDatabase>;
	};
	pages: {
		get(pageId: string): Promise<NotionPage>;
		create(options: CreatePageInput): Promise<NotionPage>;
		update(pageId: string, options: UpdatePageInput): Promise<NotionPage>;
		getProperty(pageId: string, propertyId: string): Promise<NotionProperty>;
	};
	blocks: {
		get(blockId: string): Promise<NotionBlock>;
		getChildren(
			blockId: string,
			options?: { start_cursor?: string; page_size?: number },
		): Promise<{ results: NotionBlock[]; next_cursor?: string; has_more: boolean }>;
		append(blockId: string, children: unknown[]): Promise<{ results: NotionBlock[] }>;
		update(blockId: string, block: Record<string, unknown>): Promise<NotionBlock>;
		delete(blockId: string): Promise<NotionBlock>;
	};
	comments: {
		list(options: { block_id: string; start_cursor?: string; page_size?: number }): Promise<{
			results: Array<{ id: string; rich_text: NotionRichText[] }>;
			next_cursor?: string;
			has_more: boolean;
		}>;
		create(
			options:
				| { parent: { page_id: string }; rich_text: NotionRichText[] }
				| { discussion_id: string; rich_text: NotionRichText[] },
		): Promise<{ id: string; rich_text: NotionRichText[] }>;
	};
}

export function createNotionClient(accessToken: string): NotionClient {
	const NOTION_VERSION = "2022-06-28";

	async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await fetch(`https://api.notion.com/v1${path}`, {
			method,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Notion-Version": NOTION_VERSION,
				...(body ? { "Content-Type": "application/json" } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Notion API error ${response.status}: ${error}`);
		}

		return response.json() as Promise<T>;
	}

	return {
		request,

		async search(options = {}) {
			return request("POST", "/search", options);
		},

		users: {
			async list(options = {}) {
				const params = new URLSearchParams();
				if (options.start_cursor) params.set("start_cursor", options.start_cursor);
				if (options.page_size) params.set("page_size", String(options.page_size));
				const query = params.toString();
				return request("GET", `/users${query ? `?${query}` : ""}`);
			},

			async get(userId) {
				return request("GET", `/users/${userId}`);
			},

			async me() {
				return request("GET", "/users/me");
			},
		},

		databases: {
			async get(databaseId) {
				return request("GET", `/databases/${databaseId}`);
			},

			async query(databaseId, options = {}) {
				return request("POST", `/databases/${databaseId}/query`, options);
			},

			async create(options) {
				return request("POST", "/databases", options);
			},

			async update(databaseId, options) {
				return request("PATCH", `/databases/${databaseId}`, options);
			},
		},

		pages: {
			async get(pageId) {
				return request("GET", `/pages/${pageId}`);
			},

			async create(options) {
				return request("POST", "/pages", options);
			},

			async update(pageId, options) {
				return request("PATCH", `/pages/${pageId}`, options);
			},

			async getProperty(pageId, propertyId) {
				return request("GET", `/pages/${pageId}/properties/${propertyId}`);
			},
		},

		blocks: {
			async get(blockId) {
				return request("GET", `/blocks/${blockId}`);
			},

			async getChildren(blockId, options = {}) {
				const params = new URLSearchParams();
				if (options.start_cursor) params.set("start_cursor", options.start_cursor);
				if (options.page_size) params.set("page_size", String(options.page_size));
				const query = params.toString();
				return request("GET", `/blocks/${blockId}/children${query ? `?${query}` : ""}`);
			},

			async append(blockId, children) {
				return request("PATCH", `/blocks/${blockId}/children`, { children });
			},

			async update(blockId, block) {
				return request("PATCH", `/blocks/${blockId}`, block);
			},

			async delete(blockId) {
				return request("DELETE", `/blocks/${blockId}`);
			},
		},

		comments: {
			async list(options) {
				const params = new URLSearchParams({ block_id: options.block_id });
				if (options.start_cursor) params.set("start_cursor", options.start_cursor);
				if (options.page_size) params.set("page_size", String(options.page_size));
				return request("GET", `/comments?${params}`);
			},

			async create(options) {
				return request("POST", "/comments", options);
			},
		},
	};
}

// ============================================================================
// Block Helpers
// ============================================================================

export const blocks = {
	paragraph(text: string): Record<string, unknown> {
		return {
			object: "block",
			type: "paragraph",
			paragraph: {
				rich_text: [{ type: "text", text: { content: text } }],
			},
		};
	},

	heading1(text: string): Record<string, unknown> {
		return {
			object: "block",
			type: "heading_1",
			heading_1: {
				rich_text: [{ type: "text", text: { content: text } }],
			},
		};
	},

	heading2(text: string): Record<string, unknown> {
		return {
			object: "block",
			type: "heading_2",
			heading_2: {
				rich_text: [{ type: "text", text: { content: text } }],
			},
		};
	},

	heading3(text: string): Record<string, unknown> {
		return {
			object: "block",
			type: "heading_3",
			heading_3: {
				rich_text: [{ type: "text", text: { content: text } }],
			},
		};
	},

	bulletedListItem(text: string): Record<string, unknown> {
		return {
			object: "block",
			type: "bulleted_list_item",
			bulleted_list_item: {
				rich_text: [{ type: "text", text: { content: text } }],
			},
		};
	},

	numberedListItem(text: string): Record<string, unknown> {
		return {
			object: "block",
			type: "numbered_list_item",
			numbered_list_item: {
				rich_text: [{ type: "text", text: { content: text } }],
			},
		};
	},

	toDo(text: string, checked = false): Record<string, unknown> {
		return {
			object: "block",
			type: "to_do",
			to_do: {
				rich_text: [{ type: "text", text: { content: text } }],
				checked,
			},
		};
	},

	toggle(text: string, children?: unknown[]): Record<string, unknown> {
		return {
			object: "block",
			type: "toggle",
			toggle: {
				rich_text: [{ type: "text", text: { content: text } }],
				children,
			},
		};
	},

	code(code: string, language = "plain text"): Record<string, unknown> {
		return {
			object: "block",
			type: "code",
			code: {
				rich_text: [{ type: "text", text: { content: code } }],
				language,
			},
		};
	},

	quote(text: string): Record<string, unknown> {
		return {
			object: "block",
			type: "quote",
			quote: {
				rich_text: [{ type: "text", text: { content: text } }],
			},
		};
	},

	callout(text: string, emoji = "💡"): Record<string, unknown> {
		return {
			object: "block",
			type: "callout",
			callout: {
				rich_text: [{ type: "text", text: { content: text } }],
				icon: { type: "emoji", emoji },
			},
		};
	},

	divider(): Record<string, unknown> {
		return {
			object: "block",
			type: "divider",
			divider: {},
		};
	},

	image(url: string, caption?: string): Record<string, unknown> {
		return {
			object: "block",
			type: "image",
			image: {
				type: "external",
				external: { url },
				caption: caption ? [{ type: "text", text: { content: caption } }] : [],
			},
		};
	},

	bookmark(url: string, caption?: string): Record<string, unknown> {
		return {
			object: "block",
			type: "bookmark",
			bookmark: {
				url,
				caption: caption ? [{ type: "text", text: { content: caption } }] : [],
			},
		};
	},
};

// ============================================================================
// Property Helpers
// ============================================================================

export const properties = {
	title(content: string): Record<string, unknown> {
		return {
			title: [{ type: "text", text: { content } }],
		};
	},

	richText(content: string): Record<string, unknown> {
		return {
			rich_text: [{ type: "text", text: { content } }],
		};
	},

	number(value: number): Record<string, unknown> {
		return { number: value };
	},

	select(name: string): Record<string, unknown> {
		return { select: { name } };
	},

	multiSelect(names: string[]): Record<string, unknown> {
		return { multi_select: names.map((name) => ({ name })) };
	},

	date(start: string, end?: string): Record<string, unknown> {
		return { date: { start, end } };
	},

	checkbox(checked: boolean): Record<string, unknown> {
		return { checkbox: checked };
	},

	url(url: string): Record<string, unknown> {
		return { url };
	},

	email(email: string): Record<string, unknown> {
		return { email };
	},

	phone(phone: string): Record<string, unknown> {
		return { phone_number: phone };
	},

	status(name: string): Record<string, unknown> {
		return { status: { name } };
	},

	people(userIds: string[]): Record<string, unknown> {
		return { people: userIds.map((id) => ({ id })) };
	},

	relation(pageIds: string[]): Record<string, unknown> {
		return { relation: pageIds.map((id) => ({ id })) };
	},
};
