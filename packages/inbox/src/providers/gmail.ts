/**
 * Gmail Provider
 *
 * OAuth and attachment fetching for Gmail using Google APIs
 *
 * @example
 * ```ts
 * import { GmailProvider } from "@repo/inbox/gmail";
 *
 * const gmail = new GmailProvider({
 *   clientId: env.GMAIL_CLIENT_ID,
 *   clientSecret: env.GMAIL_CLIENT_SECRET,
 *   redirectUri: env.GMAIL_REDIRECT_URI,
 * });
 *
 * // Get OAuth URL
 * const authUrl = await gmail.getAuthUrl("state-token");
 *
 * // Exchange code for tokens
 * const tokens = await gmail.exchangeCode(code);
 *
 * // Fetch attachments
 * gmail.setTokens(tokens);
 * const attachments = await gmail.getAttachments({ maxResults: 50 });
 * ```
 */

import type { Auth, gmail_v1 } from "googleapis";
import { google } from "googleapis";
import type {
	EmailAttachment,
	InboxConnectorInterface,
	InboxProviderConfig,
	InboxTokens,
	InboxUserInfo,
	RawAttachment,
	SyncOptions,
} from "../types.js";
import { InboxError } from "../types.js";
import {
	decodeBase64Url,
	ensureFileExtension,
	extractDomain,
	extractEmail,
	generateDeterministicId,
	isAuthenticationError,
	isSupportedMimeType,
} from "../utils.js";

const DEFAULT_SCOPES = [
	"https://www.googleapis.com/auth/gmail.readonly",
	"https://www.googleapis.com/auth/userinfo.email",
];

const MAX_ATTACHMENTS_PER_MESSAGE = 5;
const MAX_PAGES = 3;
const DEFAULT_MAX_RESULTS = 50;
const DEFAULT_SYNC_DAYS = 30;

export interface GmailProviderOptions extends InboxProviderConfig {
	scopes?: string[];
}

export class GmailProvider implements InboxConnectorInterface {
	#oauth2Client: Auth.OAuth2Client;
	#gmail: gmail_v1.Gmail | null = null;
	#scopes: string[];

	/** Callback for token refresh events */
	onTokenRefresh?: (tokens: InboxTokens) => Promise<void>;

	constructor(options: GmailProviderOptions) {
		this.#scopes = options.scopes ?? DEFAULT_SCOPES;

		this.#oauth2Client = new google.auth.OAuth2(
			options.clientId,
			options.clientSecret,
			options.redirectUri,
		);

		// Listen for token refresh events
		this.#oauth2Client.on("tokens", async (tokens) => {
			if (this.onTokenRefresh && tokens.access_token) {
				await this.onTokenRefresh({
					accessToken: tokens.access_token,
					refreshToken: tokens.refresh_token ?? undefined,
					expiresAt: tokens.expiry_date ?? undefined,
					scope: tokens.scope ?? undefined,
					tokenType: tokens.token_type ?? undefined,
				});
			}
		});
	}

	async getAuthUrl(state?: string): Promise<string> {
		return this.#oauth2Client.generateAuthUrl({
			access_type: "offline",
			prompt: "consent",
			scope: this.#scopes,
			state: state ?? "gmail",
		});
	}

	async exchangeCode(code: string): Promise<InboxTokens> {
		try {
			const { tokens } = await this.#oauth2Client.getToken(code);

			if (!tokens.access_token) {
				throw new InboxError("Failed to obtain access token", "INVALID_CREDENTIALS", "gmail");
			}

			const result: InboxTokens = {
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token ?? undefined,
				expiresAt: tokens.expiry_date ?? undefined,
				scope: tokens.scope ?? undefined,
				tokenType: tokens.token_type ?? undefined,
			};

			this.setTokens(result);
			return result;
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new InboxError(`Failed to exchange code: ${message}`, "INVALID_CREDENTIALS", "gmail");
		}
	}

	setTokens(tokens: InboxTokens): void {
		if (!tokens.accessToken) {
			throw new InboxError("Access token is required", "INVALID_CREDENTIALS", "gmail");
		}

		this.#oauth2Client.setCredentials({
			access_token: tokens.accessToken,
			refresh_token: tokens.refreshToken,
			expiry_date: tokens.expiresAt,
			scope: tokens.scope,
			token_type: tokens.tokenType,
		});

		this.#gmail = google.gmail({ version: "v1", auth: this.#oauth2Client });
	}

	async refreshTokens(): Promise<InboxTokens> {
		try {
			const { credentials } = await this.#oauth2Client.refreshAccessToken();

			if (!credentials.access_token) {
				throw new InboxError("Failed to refresh token", "TOKEN_REFRESH_FAILED", "gmail");
			}

			return {
				accessToken: credentials.access_token,
				refreshToken: credentials.refresh_token ?? undefined,
				expiresAt: credentials.expiry_date ?? undefined,
				scope: credentials.scope ?? undefined,
				tokenType: credentials.token_type ?? undefined,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";

			if (message.includes("invalid_grant")) {
				throw new InboxError(
					"Refresh token expired. Re-authentication required.",
					"TOKEN_EXPIRED",
					"gmail",
				);
			}

			throw new InboxError(`Token refresh failed: ${message}`, "TOKEN_REFRESH_FAILED", "gmail");
		}
	}

	async getUserInfo(): Promise<InboxUserInfo> {
		const oauth2 = google.oauth2({ auth: this.#oauth2Client, version: "v2" });
		const { data } = await oauth2.userinfo.get();

		if (!data.id || !data.email) {
			throw new InboxError("Failed to get user info", "PROVIDER_ERROR", "gmail");
		}

		return {
			id: data.id,
			email: data.email,
			name: data.name ?? undefined,
		};
	}

	async getAttachments(options: SyncOptions = {}): Promise<EmailAttachment[]> {
		if (!this.#gmail) {
			throw new InboxError(
				"Gmail client not initialized. Call setTokens first.",
				"UNAUTHORIZED",
				"gmail",
			);
		}

		const { maxResults = DEFAULT_MAX_RESULTS, after, mimeTypes } = options;

		// Build date filter
		let dateFilter: string;
		if (after) {
			const formatted = after.toISOString().split("T")[0];
			dateFilter = `after:${formatted}`;
		} else {
			const syncDate = new Date();
			syncDate.setDate(syncDate.getDate() - DEFAULT_SYNC_DAYS);
			dateFilter = `after:${syncDate.toISOString().split("T")[0]}`;
		}

		// Build query - default to PDFs
		const mimeFilter = mimeTypes?.length
			? mimeTypes.map((t) => `filename:${t.split("/")[1]}`).join(" OR ")
			: "filename:pdf";

		const query = `-from:me has:attachment ${mimeFilter} ${dateFilter}`;

		try {
			// Fetch messages with pagination
			const allMessages: gmail_v1.Schema$Message[] = [];
			let nextPageToken: string | undefined;
			let pagesFetched = 0;

			do {
				const response = await this.#gmail.users.messages.list({
					userId: "me",
					maxResults: Math.min(maxResults, 50),
					q: query,
					pageToken: nextPageToken,
				});

				if (response.data.messages) {
					allMessages.push(...response.data.messages);
				}

				nextPageToken = response.data.nextPageToken ?? undefined;
				pagesFetched++;
			} while (nextPageToken && allMessages.length < maxResults && pagesFetched < MAX_PAGES);

			const messages = allMessages.slice(0, maxResults);

			if (messages.length === 0) {
				return [];
			}

			// Fetch message details in parallel
			const messageDetails = await Promise.all(
				messages
					.filter((m): m is gmail_v1.Schema$Message & { id: string } => !!m.id)
					.map((m) =>
						this.#gmail!.users.messages.get({ userId: "me", id: m.id, format: "full" })
							.then((res) => res.data)
							.catch(() => null),
					),
			);

			// Process attachments
			const attachmentPromises = messageDetails
				.filter((m): m is gmail_v1.Schema$Message => m !== null)
				.map((message) => this.#processMessage(message, mimeTypes));

			const attachmentArrays = await Promise.all(attachmentPromises);
			return attachmentArrays.flat();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";

			if (isAuthenticationError(message)) {
				throw new InboxError(message, "UNAUTHORIZED", "gmail");
			}

			throw new InboxError(`Failed to fetch attachments: ${message}`, "PROVIDER_ERROR", "gmail");
		}
	}

	async #processMessage(
		message: gmail_v1.Schema$Message,
		mimeTypes?: string[],
	): Promise<EmailAttachment[]> {
		if (!message.id || !message.payload?.parts) {
			return [];
		}

		// Extract sender info
		const fromHeader = message.payload.headers?.find((h) => h.name === "From")?.value;
		const subjectHeader = message.payload.headers?.find((h) => h.name === "Subject")?.value;
		const dateHeader = message.payload.headers?.find((h) => h.name === "Date")?.value;

		const senderEmail = fromHeader ? extractEmail(fromHeader) : undefined;
		const senderDomain = senderEmail ? extractDomain(senderEmail) : undefined;

		// Fetch attachments
		const rawAttachments = await this.#fetchAttachments(
			message.id,
			message.payload.parts,
			mimeTypes,
		);

		// Convert to EmailAttachment
		const attachments: EmailAttachment[] = await Promise.all(
			rawAttachments.map(async (att) => {
				const filename = ensureFileExtension(att.filename, att.mimeType);
				const id = await generateDeterministicId(`${message.id}_${filename}`);

				return {
					id,
					filename,
					mimeType: att.mimeType,
					size: att.size,
					data: decodeBase64Url(att.data),
					messageId: message.id!,
					senderEmail,
					senderDomain,
					subject: subjectHeader ?? undefined,
					receivedAt: dateHeader ? new Date(dateHeader).toISOString() : undefined,
				};
			}),
		);

		return attachments;
	}

	async #fetchAttachments(
		messageId: string,
		parts: gmail_v1.Schema$MessagePart[],
		mimeTypes?: string[],
	): Promise<RawAttachment[]> {
		const attachments: RawAttachment[] = [];

		for (const part of parts) {
			if (attachments.length >= MAX_ATTACHMENTS_PER_MESSAGE) break;

			const mimeType = part.mimeType ?? "application/octet-stream";

			if (part.filename && part.body?.attachmentId && isSupportedMimeType(mimeType, mimeTypes)) {
				try {
					const response = await this.#gmail!.users.messages.attachments.get({
						userId: "me",
						messageId,
						id: part.body.attachmentId,
					});

					if (response.data.data) {
						attachments.push({
							filename: part.filename,
							mimeType,
							size: response.data.size ?? 0,
							data: response.data.data,
						});
					}
				} catch (error) {
					console.error(`Failed to fetch attachment ${part.filename}:`, error);
				}
			}

			// Process nested parts
			if (part.parts) {
				const nested = await this.#fetchAttachments(messageId, part.parts, mimeTypes);
				attachments.push(...nested);
			}
		}

		return attachments.slice(0, MAX_ATTACHMENTS_PER_MESSAGE);
	}
}

/**
 * Create Gmail provider instance
 */
export function createGmailProvider(options: GmailProviderOptions): GmailProvider {
	return new GmailProvider(options);
}
