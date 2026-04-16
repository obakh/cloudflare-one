/**
 * Inbox Connector
 *
 * Unified interface for email inbox providers with token management
 *
 * @example
 * ```ts
 * import { InboxConnector } from "@repo/inbox/connector";
 * import { encrypt, decrypt } from "@repo/security/encryption";
 *
 * const connector = new InboxConnector("gmail", {
 *   clientId: env.GMAIL_CLIENT_ID,
 *   clientSecret: env.GMAIL_CLIENT_SECRET,
 *   redirectUri: env.GMAIL_REDIRECT_URI,
 * });
 *
 * // Connect account
 * const authUrl = await connector.getAuthUrl(encryptedState);
 * // ... user authorizes ...
 * const account = await connector.connect(code, { teamId: "team-123" });
 *
 * // Sync attachments
 * const attachments = await connector.sync(accountId, {
 *   getTokens: async (id) => {
 *     const account = await db.getAccount(id);
 *     return {
 *       accessToken: await decrypt(account.accessToken, key),
 *       refreshToken: await decrypt(account.refreshToken, key),
 *       expiresAt: new Date(account.expiresAt).getTime(),
 *     };
 *   },
 *   saveTokens: async (id, tokens) => {
 *     await db.updateAccount(id, {
 *       accessToken: await encrypt(tokens.accessToken, key),
 *       refreshToken: await encrypt(tokens.refreshToken!, key),
 *       expiresAt: new Date(tokens.expiresAt!).toISOString(),
 *     });
 *   },
 * });
 * ```
 */

import { GmailProvider } from "./providers/gmail.js";
import { OutlookProvider } from "./providers/outlook.js";
import type {
	EmailAttachment,
	InboxConnectorInterface,
	InboxProvider,
	InboxProviderConfig,
	InboxTokens,
	InboxUserInfo,
	SyncOptions,
} from "./types.js";
import { InboxError } from "./types.js";
import { isAuthenticationError } from "./utils.js";

// ============================================================================
// Types
// ============================================================================

export interface ConnectOptions {
	/** Team/organization ID for multi-tenant apps */
	teamId?: string;
	/** User ID */
	userId?: string;
}

export interface ConnectResult {
	/** Account ID (external ID from provider) */
	externalId: string;
	/** User email */
	email: string;
	/** User name */
	name?: string;
	/** OAuth tokens */
	tokens: InboxTokens;
	/** Provider type */
	provider: InboxProvider;
}

export interface TokenManager {
	/** Get tokens for an account */
	getTokens: (accountId: string) => Promise<InboxTokens>;
	/** Save updated tokens */
	saveTokens: (accountId: string, tokens: InboxTokens) => Promise<void>;
	/** Get last sync timestamp */
	getLastSynced?: (accountId: string) => Promise<Date | undefined>;
	/** Update last sync timestamp */
	updateLastSynced?: (accountId: string, syncedAt: Date) => Promise<void>;
}

export interface SyncResult {
	attachments: EmailAttachment[];
	syncedAt: Date;
}

// ============================================================================
// Connector
// ============================================================================

export class InboxConnector {
	#provider: InboxConnectorInterface;
	#providerType: InboxProvider;

	constructor(provider: InboxProvider, config: InboxProviderConfig) {
		this.#providerType = provider;

		switch (provider) {
			case "gmail":
				this.#provider = new GmailProvider(config);
				break;
			case "outlook":
				this.#provider = new OutlookProvider(config);
				break;
			default:
				throw new InboxError(`Unsupported provider: ${provider}`, "PROVIDER_ERROR");
		}
	}

	/** Get provider type */
	get provider(): InboxProvider {
		return this.#providerType;
	}

	/**
	 * Get OAuth authorization URL
	 */
	async getAuthUrl(state?: string): Promise<string> {
		return this.#provider.getAuthUrl(state);
	}

	/**
	 * Connect an account by exchanging authorization code
	 */
	async connect(code: string, _options?: ConnectOptions): Promise<ConnectResult> {
		// Exchange code for tokens
		const tokens = await this.#provider.exchangeCode(code);

		// Get user info
		const userInfo = await this.#provider.getUserInfo();

		return {
			externalId: userInfo.id,
			email: userInfo.email,
			name: userInfo.name,
			tokens,
			provider: this.#providerType,
		};
	}

	/**
	 * Sync attachments from an account
	 */
	async sync(
		accountId: string,
		tokenManager: TokenManager,
		options: SyncOptions = {},
	): Promise<SyncResult> {
		// Get tokens
		const tokens = await tokenManager.getTokens(accountId);
		this.#provider.setTokens(tokens);

		// Set up token refresh callback
		if ("onTokenRefresh" in this.#provider) {
			(this.#provider as GmailProvider | OutlookProvider).onTokenRefresh = async (
				newTokens: InboxTokens,
			) => {
				await tokenManager.saveTokens(accountId, newTokens);
			};
		}

		// Get last synced date if not doing full sync
		if (!options.fullSync && !options.after && tokenManager.getLastSynced) {
			const lastSynced = await tokenManager.getLastSynced(accountId);
			if (lastSynced) {
				// Subtract 1 day to ensure we don't miss anything
				const syncFrom = new Date(lastSynced);
				syncFrom.setDate(syncFrom.getDate() - 1);
				options.after = syncFrom;
			}
		}

		try {
			const attachments = await this.#provider.getAttachments(options);
			const syncedAt = new Date();

			// Update last synced
			if (tokenManager.updateLastSynced) {
				await tokenManager.updateLastSynced(accountId, syncedAt);
			}

			return { attachments, syncedAt };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";

			// Try token refresh on auth errors
			if (isAuthenticationError(message)) {
				const newTokens = await this.#provider.refreshTokens();
				await tokenManager.saveTokens(accountId, newTokens);

				// Retry
				const attachments = await this.#provider.getAttachments(options);
				const syncedAt = new Date();

				if (tokenManager.updateLastSynced) {
					await tokenManager.updateLastSynced(accountId, syncedAt);
				}

				return { attachments, syncedAt };
			}

			throw error;
		}
	}

	/**
	 * Get user info for connected account
	 */
	async getUserInfo(tokens: InboxTokens): Promise<InboxUserInfo> {
		this.#provider.setTokens(tokens);
		return this.#provider.getUserInfo();
	}

	/**
	 * Refresh tokens
	 */
	async refreshTokens(tokens: InboxTokens): Promise<InboxTokens> {
		this.#provider.setTokens(tokens);
		return this.#provider.refreshTokens();
	}
}

/**
 * Create inbox connector for a provider
 */
export function createInboxConnector(
	provider: InboxProvider,
	config: InboxProviderConfig,
): InboxConnector {
	return new InboxConnector(provider, config);
}
