/**
 * Outlook Provider
 *
 * OAuth and attachment fetching for Outlook using Microsoft Graph API
 *
 * @example
 * ```ts
 * import { OutlookProvider } from "@repo/inbox/outlook";
 *
 * const outlook = new OutlookProvider({
 *   clientId: env.OUTLOOK_CLIENT_ID,
 *   clientSecret: env.OUTLOOK_CLIENT_SECRET,
 *   redirectUri: env.OUTLOOK_REDIRECT_URI,
 * });
 *
 * // Get OAuth URL
 * const authUrl = await outlook.getAuthUrl("state-token");
 *
 * // Exchange code for tokens
 * const tokens = await outlook.exchangeCode(code);
 *
 * // Fetch attachments
 * outlook.setTokens(tokens);
 * const attachments = await outlook.getAttachments({ maxResults: 50 });
 * ```
 */

import type {
	EmailAttachment,
	InboxConnectorInterface,
	InboxProviderConfig,
	InboxTokens,
	InboxUserInfo,
	SyncOptions,
} from "../types.js";
import { InboxError } from "../types.js";
import {
	decodeBase64,
	ensureFileExtension,
	extractDomain,
	generateDeterministicId,
	isAuthenticationError,
} from "../utils.js";

const DEFAULT_SCOPES = [
	"https://graph.microsoft.com/Mail.Read",
	"https://graph.microsoft.com/User.Read",
	"offline_access",
];

const TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const AUTHORIZE_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const GRAPH_API = "https://graph.microsoft.com/v1.0";

const MAX_ATTACHMENTS_PER_MESSAGE = 5;
const MAX_PAGES = 3;
const DEFAULT_MAX_RESULTS = 50;
const DEFAULT_SYNC_DAYS = 30;

interface MicrosoftTokenResponse {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	scope?: string;
	token_type: string;
}

interface OutlookMessage {
	id: string;
	subject?: string;
	receivedDateTime?: string;
	from?: {
		emailAddress?: {
			address?: string;
			name?: string;
		};
	};
	hasAttachments?: boolean;
}

interface OutlookAttachment {
	id: string;
	name: string;
	contentType: string;
	size: number;
	contentBytes?: string;
	"@odata.type"?: string;
}

export interface OutlookProviderOptions extends InboxProviderConfig {
	scopes?: string[];
}

export class OutlookProvider implements InboxConnectorInterface {
	#config: InboxProviderConfig;
	#scopes: string[];
	#accessToken: string | null = null;
	#refreshToken: string | null = null;

	/** Callback for token refresh events */
	onTokenRefresh?: (tokens: InboxTokens) => Promise<void>;

	constructor(options: OutlookProviderOptions) {
		this.#config = options;
		this.#scopes = options.scopes ?? DEFAULT_SCOPES;
	}

	async getAuthUrl(state?: string): Promise<string> {
		const params = new URLSearchParams({
			client_id: this.#config.clientId,
			response_type: "code",
			redirect_uri: this.#config.redirectUri,
			scope: this.#scopes.join(" "),
			state: state ?? "outlook",
			prompt: "consent",
			response_mode: "query",
		});

		return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
	}

	async exchangeCode(code: string): Promise<InboxTokens> {
		const params = new URLSearchParams({
			client_id: this.#config.clientId,
			client_secret: this.#config.clientSecret,
			code,
			redirect_uri: this.#config.redirectUri,
			grant_type: "authorization_code",
			scope: this.#scopes.join(" "),
		});

		const response = await fetch(TOKEN_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params.toString(),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new InboxError(`Token exchange failed: ${error}`, "INVALID_CREDENTIALS", "outlook");
		}

		const data = (await response.json()) as MicrosoftTokenResponse;

		if (!data.access_token) {
			throw new InboxError("Failed to obtain access token", "INVALID_CREDENTIALS", "outlook");
		}

		const expiresAt = Date.now() + data.expires_in * 1000;

		const tokens: InboxTokens = {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expiresAt,
			scope: data.scope,
			tokenType: data.token_type,
		};

		this.setTokens(tokens);
		return tokens;
	}

	setTokens(tokens: InboxTokens): void {
		if (!tokens.accessToken) {
			throw new InboxError("Access token is required", "INVALID_CREDENTIALS", "outlook");
		}

		this.#accessToken = tokens.accessToken;
		this.#refreshToken = tokens.refreshToken ?? null;
	}

	async refreshTokens(): Promise<InboxTokens> {
		if (!this.#refreshToken) {
			throw new InboxError(
				"No refresh token available. Re-authentication required.",
				"TOKEN_EXPIRED",
				"outlook",
			);
		}

		const params = new URLSearchParams({
			client_id: this.#config.clientId,
			client_secret: this.#config.clientSecret,
			refresh_token: this.#refreshToken,
			grant_type: "refresh_token",
			scope: this.#scopes.join(" "),
		});

		const response = await fetch(TOKEN_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params.toString(),
		});

		if (!response.ok) {
			const error = await response.text();

			if (error.includes("invalid_grant") || error.includes("AADSTS700082")) {
				throw new InboxError(
					"Refresh token expired. Re-authentication required.",
					"TOKEN_EXPIRED",
					"outlook",
				);
			}

			throw new InboxError(`Token refresh failed: ${error}`, "TOKEN_REFRESH_FAILED", "outlook");
		}

		const data = (await response.json()) as MicrosoftTokenResponse;
		const expiresAt = Date.now() + data.expires_in * 1000;

		const tokens: InboxTokens = {
			accessToken: data.access_token,
			refreshToken: data.refresh_token ?? this.#refreshToken,
			expiresAt,
			scope: data.scope,
			tokenType: data.token_type,
		};

		this.setTokens(tokens);

		if (this.onTokenRefresh) {
			await this.onTokenRefresh(tokens);
		}

		return tokens;
	}

	async getUserInfo(): Promise<InboxUserInfo> {
		const response = await this.#graphRequest("/me");

		if (!response.id) {
			throw new InboxError("Failed to get user info", "PROVIDER_ERROR", "outlook");
		}

		return {
			id: response.id,
			email: response.mail ?? response.userPrincipalName,
			name: response.displayName,
		};
	}

	async getAttachments(options: SyncOptions = {}): Promise<EmailAttachment[]> {
		if (!this.#accessToken) {
			throw new InboxError(
				"Outlook client not initialized. Call setTokens first.",
				"UNAUTHORIZED",
				"outlook",
			);
		}

		const { maxResults = DEFAULT_MAX_RESULTS, after, mimeTypes } = options;

		// Get user email to filter out self-sent
		const userInfo = await this.getUserInfo();
		const userEmail = userInfo.email?.toLowerCase();

		// Build date filter
		let dateFilter: string;
		if (after) {
			dateFilter = `receivedDateTime ge ${after.toISOString()}`;
		} else {
			const syncDate = new Date();
			syncDate.setDate(syncDate.getDate() - DEFAULT_SYNC_DAYS);
			dateFilter = `receivedDateTime ge ${syncDate.toISOString()}`;
		}

		const filter = `${dateFilter} and hasAttachments eq true`;

		try {
			// Fetch messages with pagination
			const allMessages: OutlookMessage[] = [];
			let nextLink: string | undefined;
			let pagesFetched = 0;

			// Initial request
			let response = await this.#graphRequest(
				`/me/messages?$filter=${encodeURIComponent(filter)}&$select=id,subject,from,hasAttachments,receivedDateTime&$top=${Math.min(maxResults, 50)}&$orderby=receivedDateTime desc`,
			);

			if (response.value) {
				allMessages.push(...response.value);
			}
			nextLink = response["@odata.nextLink"];
			pagesFetched++;

			// Pagination
			while (nextLink && allMessages.length < maxResults && pagesFetched < MAX_PAGES) {
				response = await this.#graphRequestUrl(nextLink);
				if (response.value) {
					allMessages.push(...response.value);
				}
				nextLink = response["@odata.nextLink"];
				pagesFetched++;
			}

			// Filter out self-sent and limit
			const messages = allMessages
				.filter((msg) => {
					if (!userEmail) return true;
					const senderEmail = msg.from?.emailAddress?.address?.toLowerCase();
					return senderEmail !== userEmail;
				})
				.slice(0, maxResults);

			if (messages.length === 0) {
				return [];
			}

			// Process attachments
			const attachmentPromises = messages.map((msg) => this.#processMessage(msg, mimeTypes));
			const attachmentArrays = await Promise.all(attachmentPromises);
			return attachmentArrays.flat();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";

			if (isAuthenticationError(message)) {
				throw new InboxError(message, "UNAUTHORIZED", "outlook");
			}

			throw new InboxError(`Failed to fetch attachments: ${message}`, "PROVIDER_ERROR", "outlook");
		}
	}

	async #processMessage(message: OutlookMessage, mimeTypes?: string[]): Promise<EmailAttachment[]> {
		if (!message.id) return [];

		const senderEmail = message.from?.emailAddress?.address;
		const senderDomain = senderEmail ? extractDomain(senderEmail) : undefined;

		try {
			// List attachments
			const response = await this.#graphRequest(`/me/messages/${message.id}/attachments`);
			const rawAttachments: OutlookAttachment[] = response.value || [];

			const attachments: EmailAttachment[] = [];

			for (const att of rawAttachments) {
				if (attachments.length >= MAX_ATTACHMENTS_PER_MESSAGE) break;

				// Only process file attachments (not inline)
				if (att["@odata.type"] !== "#microsoft.graph.fileAttachment") continue;

				const mimeType = att.contentType ?? "application/octet-stream";

				// Check MIME type filter
				if (mimeTypes?.length && !mimeTypes.includes(mimeType)) {
					// Also check for PDF by extension if octet-stream
					if (mimeType === "application/octet-stream") {
						if (!att.name?.toLowerCase().endsWith(".pdf")) continue;
					} else {
						continue;
					}
				}

				// Fetch full attachment with content
				const fullAtt = await this.#graphRequest(
					`/me/messages/${message.id}/attachments/${att.id}`,
				);

				if (fullAtt.contentBytes) {
					const filename = ensureFileExtension(att.name, mimeType);
					const id = await generateDeterministicId(`${message.id}_${filename}`);

					attachments.push({
						id,
						filename,
						mimeType: mimeType === "application/octet-stream" ? "application/pdf" : mimeType,
						size: att.size,
						data: decodeBase64(fullAtt.contentBytes),
						messageId: message.id,
						senderEmail,
						senderDomain,
						subject: message.subject,
						receivedAt: message.receivedDateTime,
					});
				}
			}

			return attachments;
		} catch (error) {
			console.error(`Failed to process message ${message.id}:`, error);
			return [];
		}
	}

	async #graphRequest(path: string): Promise<any> {
		const url = path.startsWith("http") ? path : `${GRAPH_API}${path}`;
		return this.#graphRequestUrl(url);
	}

	async #graphRequestUrl(url: string): Promise<any> {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${this.#accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Graph API error: ${response.status} ${error}`);
		}

		return response.json();
	}
}

/**
 * Create Outlook provider instance
 */
export function createOutlookProvider(options: OutlookProviderOptions): OutlookProvider {
	return new OutlookProvider(options);
}
