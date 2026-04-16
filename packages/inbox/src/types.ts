/**
 * Inbox Types
 *
 * Types for email inbox connectors (Gmail, Outlook)
 */

// ============================================================================
// Provider Types
// ============================================================================

export type InboxProvider = "gmail" | "outlook";

export interface InboxProviderConfig {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}

// ============================================================================
// Token Types
// ============================================================================

export interface InboxTokens {
	accessToken: string;
	refreshToken?: string;
	expiresAt?: number;
	scope?: string;
	tokenType?: string;
}

export interface StoredTokens {
	accessToken: string; // Encrypted
	refreshToken: string; // Encrypted
	expiresAt: string; // ISO date
}

// ============================================================================
// Account Types
// ============================================================================

export interface InboxAccount {
	id: string;
	provider: InboxProvider;
	externalId: string;
	email: string;
	name?: string;
	tokens: StoredTokens;
	lastSyncedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface InboxUserInfo {
	id: string;
	email: string;
	name?: string;
}

// ============================================================================
// Attachment Types
// ============================================================================

export interface EmailAttachment {
	/** Unique ID for this attachment */
	id: string;
	/** Original filename */
	filename: string;
	/** MIME type */
	mimeType: string;
	/** Size in bytes */
	size: number;
	/** Raw attachment data */
	data: Uint8Array;
	/** Message ID this attachment came from */
	messageId: string;
	/** Sender email address */
	senderEmail?: string;
	/** Sender domain (e.g., "example.com") */
	senderDomain?: string;
	/** Email subject */
	subject?: string;
	/** When the email was received */
	receivedAt?: string;
}

export interface RawAttachment {
	filename: string;
	mimeType: string;
	size: number;
	data: string; // Base64 encoded
}

// ============================================================================
// Sync Options
// ============================================================================

export interface SyncOptions {
	/** Maximum number of messages to fetch */
	maxResults?: number;
	/** Only fetch messages after this date */
	after?: Date;
	/** Only fetch messages with these MIME types */
	mimeTypes?: string[];
	/** Full sync (ignore lastSyncedAt) */
	fullSync?: boolean;
}

export interface SyncResult {
	attachments: EmailAttachment[];
	syncedAt: string;
	messagesProcessed: number;
	hasMore: boolean;
}

// ============================================================================
// Connector Interface
// ============================================================================

export interface InboxConnectorInterface {
	/** Get OAuth authorization URL */
	getAuthUrl(state?: string): Promise<string>;

	/** Exchange authorization code for tokens */
	exchangeCode(code: string): Promise<InboxTokens>;

	/** Set tokens for API calls */
	setTokens(tokens: InboxTokens): void;

	/** Refresh access token */
	refreshTokens(): Promise<InboxTokens>;

	/** Get user info */
	getUserInfo(): Promise<InboxUserInfo>;

	/** Fetch attachments from inbox */
	getAttachments(options?: SyncOptions): Promise<EmailAttachment[]>;
}

// ============================================================================
// Storage Interface (for token persistence)
// ============================================================================

export interface InboxStorage {
	/** Get account by ID */
	getAccount(id: string): Promise<InboxAccount | null>;

	/** Get account by external ID and provider */
	getAccountByExternalId(externalId: string, provider: InboxProvider): Promise<InboxAccount | null>;

	/** Save or update account */
	saveAccount(account: Omit<InboxAccount, "createdAt" | "updatedAt">): Promise<InboxAccount>;

	/** Update account tokens */
	updateTokens(id: string, tokens: StoredTokens): Promise<void>;

	/** Update last synced timestamp */
	updateLastSynced(id: string, syncedAt: string): Promise<void>;

	/** Delete account */
	deleteAccount(id: string): Promise<void>;
}

// ============================================================================
// OAuth State
// ============================================================================

export interface InboxOAuthState {
	provider: InboxProvider;
	returnTo?: string;
	[key: string]: unknown;
}

// ============================================================================
// Error Types
// ============================================================================

export class InboxError extends Error {
	constructor(
		message: string,
		public code: InboxErrorCode,
		public provider?: InboxProvider,
	) {
		super(message);
		this.name = "InboxError";
	}
}

export type InboxErrorCode =
	| "INVALID_CREDENTIALS"
	| "TOKEN_EXPIRED"
	| "TOKEN_REFRESH_FAILED"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "RATE_LIMITED"
	| "PROVIDER_ERROR"
	| "INVALID_STATE"
	| "ACCOUNT_NOT_FOUND";
