/**
 * Notion Integration
 *
 * OAuth and API client for Notion.
 * Note: Notion doesn't have webhooks, use polling or their "changes" endpoint.
 */

export {
	blocks,
	type CreatePageInput,
	// Client
	createNotionClient,
	type NotionBlock,
	// Types
	type NotionClient,
	type NotionDatabase,
	type NotionFile,
	type NotionIcon,
	type NotionPage,
	type NotionParent,
	type NotionProperty,
	type NotionPropertySchema,
	type NotionRichText,
	type NotionUser,
	properties,
	type QueryDatabaseOptions,
	type SearchOptions,
	type UpdatePageInput,
} from "./api";
export * from "./oauth";
