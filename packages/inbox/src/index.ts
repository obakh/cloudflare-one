/**
 * @repo/inbox
 *
 * Email inbox connectors for Gmail and Outlook.
 * Fetch attachments (receipts, invoices, documents) from user email accounts.
 *
 * @example Basic usage with connector
 * ```ts
 * import { createInboxConnector } from "@repo/inbox";
 * import { encrypt, decrypt } from "@repo/security/encryption";
 *
 * // Create connector
 * const inbox = createInboxConnector("gmail", {
 *   clientId: env.GMAIL_CLIENT_ID,
 *   clientSecret: env.GMAIL_CLIENT_SECRET,
 *   redirectUri: env.GMAIL_REDIRECT_URI,
 * });
 *
 * // Get OAuth URL
 * const authUrl = await inbox.getAuthUrl(state);
 *
 * // After user authorizes, connect account
 * const result = await inbox.connect(code);
 * // Save: result.externalId, result.email, encrypted tokens
 *
 * // Sync attachments
 * const { attachments } = await inbox.sync(accountId, {
 *   getTokens: async (id) => ({
 *     accessToken: await decrypt(account.accessToken, key),
 *     refreshToken: await decrypt(account.refreshToken, key),
 *   }),
 *   saveTokens: async (id, tokens) => {
 *     await db.update({ accessToken: await encrypt(tokens.accessToken, key) });
 *   },
 * });
 * ```
 *
 * @example Direct provider usage
 * ```ts
 * import { GmailProvider } from "@repo/inbox/gmail";
 *
 * const gmail = new GmailProvider({
 *   clientId: env.GMAIL_CLIENT_ID,
 *   clientSecret: env.GMAIL_CLIENT_SECRET,
 *   redirectUri: env.GMAIL_REDIRECT_URI,
 * });
 *
 * gmail.setTokens({ accessToken, refreshToken });
 * const attachments = await gmail.getAttachments({ maxResults: 50 });
 * ```
 */

export type { ConnectOptions, ConnectResult, SyncResult, TokenManager } from "./connector.js";
// Connector
export { createInboxConnector, InboxConnector } from "./connector.js";
export type { GmailProviderOptions } from "./providers/gmail.js";
// Providers
export { createGmailProvider, GmailProvider } from "./providers/gmail.js";
export type { OutlookProviderOptions } from "./providers/outlook.js";
export { createOutlookProvider, OutlookProvider } from "./providers/outlook.js";

// Types
export type {
	EmailAttachment,
	InboxAccount,
	InboxConnectorInterface,
	InboxErrorCode,
	InboxOAuthState,
	InboxProvider,
	InboxProviderConfig,
	InboxStorage,
	InboxTokens,
	InboxUserInfo,
	RawAttachment,
	StoredTokens,
	SyncOptions,
} from "./types.js";
export { InboxError } from "./types.js";

// Utilities
export {
	decodeBase64,
	decodeBase64Url,
	ensureFileExtension,
	extractDomain,
	extractEmail,
	formatGmailDate,
	formatOutlookDate,
	generateAttachmentId,
	generateDeterministicId,
	getDaysAgo,
	getInboxIdFromEmail,
	isAuthenticationError,
	isRateLimitError,
	isSupportedMimeType,
} from "./utils.js";
