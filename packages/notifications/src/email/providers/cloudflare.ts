/**
 * Cloudflare Email Sending Provider
 *
 * Supports both REST API and Workers binding for Cloudflare Email Service.
 *
 * @see https://developers.cloudflare.com/email-service/
 *
 * @example Using REST API
 * ```ts
 * import { createCloudflareProvider } from "@repo/notifications/email/providers/cloudflare";
 *
 * const provider = createCloudflareProvider({
 *   accountId: env.CLOUDFLARE_ACCOUNT_ID,
 *   apiToken: env.CLOUDFLARE_API_TOKEN,
 * });
 * ```
 *
 * @example Using Workers binding
 * ```ts
 * import { createCloudflareProvider } from "@repo/notifications/email/providers/cloudflare";
 *
 * const provider = createCloudflareProvider({
 *   binding: env.EMAIL,
 * });
 * ```
 */

import { render } from "@react-email/render";
import type { EmailOptions, EmailProvider, EmailResult } from "../types";

/**
 * Email attachment
 */
export interface EmailAttachment {
	/** Base64 string or binary content */
	content: string | ArrayBuffer;
	/** Filename */
	filename: string;
	/** MIME type */
	type: string;
	/** Disposition type */
	disposition: "attachment" | "inline";
	/** Content ID for inline attachments */
	contentId?: string;
}

/**
 * Cloudflare Email Service binding interface
 */
export interface CloudflareEmailBinding {
	send(message: {
		to: string | string[];
		from: string | { email: string; name: string };
		subject: string;
		html?: string;
		text?: string;
		cc?: string | string[];
		bcc?: string | string[];
		replyTo?: string | { email: string; name: string };
		attachments?: EmailAttachment[];
		headers?: Record<string, string>;
	}): Promise<{ messageId: string }>;
}

/**
 * Cloudflare provider configuration
 */
export interface CloudflareProviderConfig {
	/** Cloudflare account ID (required for REST API) */
	accountId?: string;
	/** Cloudflare API token (required for REST API) */
	apiToken?: string;
	/** Workers email binding (alternative to REST API) */
	binding?: CloudflareEmailBinding;
	/** Allowed sender addresses (optional restriction) */
	allowedSenderAddresses?: string[];
	/** Base URL override (for testing) */
	baseUrl?: string;
}

/**
 * Cloudflare REST API response
 */
interface CloudflareApiResponse {
	success: boolean;
	errors: Array<{ code: number; message: string }>;
	messages: string[];
	result?: {
		delivered: string[];
		permanent_bounces: string[];
		queued: string[];
	};
}

/**
 * Cloudflare error codes
 */
export enum CloudflareErrorCode {
	VALIDATION_ERROR = "E_VALIDATION_ERROR",
	FIELD_MISSING = "E_FIELD_MISSING",
	TOO_MANY_RECIPIENTS = "E_TOO_MANY_RECIPIENTS",
	SENDER_NOT_VERIFIED = "E_SENDER_NOT_VERIFIED",
	RECIPIENT_NOT_ALLOWED = "E_RECIPIENT_NOT_ALLOWED",
	RECIPIENT_SUPPRESSED = "E_RECIPIENT_SUPPRESSED",
	SENDER_DOMAIN_NOT_AVAILABLE = "E_SENDER_DOMAIN_NOT_AVAILABLE",
	CONTENT_TOO_LARGE = "E_CONTENT_TOO_LARGE",
	DELIVERY_FAILED = "E_DELIVERY_FAILED",
	RATE_LIMIT_EXCEEDED = "E_RATE_LIMIT_EXCEEDED",
	DAILY_LIMIT_EXCEEDED = "E_DAILY_LIMIT_EXCEEDED",
	INTERNAL_SERVER_ERROR = "E_INTERNAL_SERVER_ERROR",
	HEADER_NOT_ALLOWED = "E_HEADER_NOT_ALLOWED",
	HEADER_USE_API_FIELD = "E_HEADER_USE_API_FIELD",
	HEADER_VALUE_INVALID = "E_HEADER_VALUE_INVALID",
	HEADER_VALUE_TOO_LONG = "E_HEADER_VALUE_TOO_LONG",
	HEADER_NAME_INVALID = "E_HEADER_NAME_INVALID",
	HEADERS_TOO_LARGE = "E_HEADERS_TOO_LARGE",
	HEADERS_TOO_MANY = "E_HEADERS_TOO_MANY",
}

/**
 * Create a Cloudflare Email Sending provider
 *
 * @example Using REST API
 * ```ts
 * const provider = createCloudflareProvider({
 *   accountId: "your-account-id",
 *   apiToken: "your-api-token",
 * });
 * ```
 *
 * @example Using Workers binding
 * ```ts
 * const provider = createCloudflareProvider({
 *   binding: env.EMAIL,
 * });
 * ```
 *
 * @example With sender restrictions
 * ```ts
 * const provider = createCloudflareProvider({
 *   binding: env.EMAIL,
 *   allowedSenderAddresses: ["noreply@yourdomain.com", "support@yourdomain.com"],
 * });
 * ```
 */
export function createCloudflareProvider(config: CloudflareProviderConfig): EmailProvider {
	// Validate configuration
	if (!config.binding && (!config.accountId || !config.apiToken)) {
		throw new Error(
			"Cloudflare provider requires either 'binding' or both 'accountId' and 'apiToken'",
		);
	}

	const baseUrl = config.baseUrl || "https://api.cloudflare.com/client/v4";
	const useBinding = !!config.binding;

	return {
		name: "cloudflare",

		async send(options: EmailOptions): Promise<EmailResult> {
			try {
				// Validate sender if restrictions are configured
				if (config.allowedSenderAddresses) {
					const fromEmail = extractEmail(options.from);
					if (!config.allowedSenderAddresses.includes(fromEmail)) {
						return {
							success: false,
							error: `Sender ${fromEmail} is not in allowed sender addresses`,
						};
					}
				}

				// Render React component if provided
				let html = options.html;
				let text = options.text;

				if (options.react) {
					html = await render(options.react);
					if (!text) {
						text = await render(options.react, { plainText: true });
					}
				}

				// Prepare email payload
				const to = Array.isArray(options.to) ? options.to : [options.to];
				const cc = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
				const bcc = options.bcc
					? Array.isArray(options.bcc)
						? options.bcc
						: [options.bcc]
					: undefined;

				// Validate recipient count (max 50)
				const totalRecipients = to.length + (cc?.length || 0) + (bcc?.length || 0);
				if (totalRecipients > 50) {
					return {
						success: false,
						error: `Too many recipients (${totalRecipients}). Maximum is 50.`,
					};
				}

				// Use Workers binding if available
				if (useBinding && config.binding) {
					const response = await config.binding.send({
						to,
						from: options.from,
						subject: options.subject,
						html,
						text,
						cc,
						bcc,
						replyTo: options.replyTo,
						headers: options.headers,
					});

					return {
						success: true,
						id: response.messageId,
					};
				}

				// Use REST API
				const payload: Record<string, unknown> = {
					to,
					from: options.from,
					subject: options.subject,
				};

				if (html) payload.html = html;
				if (text) payload.text = text;
				if (options.replyTo) payload.reply_to = options.replyTo;
				if (cc) payload.cc = cc;
				if (bcc) payload.bcc = bcc;
				if (options.headers) payload.headers = options.headers;

				const response = await fetch(`${baseUrl}/accounts/${config.accountId}/email/sending/send`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${config.apiToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				const data = (await response.json()) as CloudflareApiResponse;

				if (!data.success) {
					const errorMessage = data.errors.length > 0 ? data.errors[0].message : "Unknown error";
					return {
						success: false,
						error: errorMessage,
					};
				}

				// Extract message ID from delivered recipients
				const messageId =
					(data.result?.delivered.length ?? 0) > 0 ? data.result?.delivered[0] : undefined;

				return {
					success: true,
					id: messageId,
				};
			} catch (err) {
				// Handle Cloudflare-specific errors
				if (err && typeof err === "object" && "code" in err && "message" in err) {
					const errorCode = (err as { code: string }).code;
					const errorMessage = (err as { message: string }).message;

					return {
						success: false,
						error: `${errorCode}: ${errorMessage}`,
					};
				}

				return {
					success: false,
					error: err instanceof Error ? err.message : "Unknown error",
				};
			}
		},

		async sendBatch(emails: EmailOptions[]): Promise<EmailResult[]> {
			// Cloudflare doesn't have a native batch API, so send sequentially
			return Promise.all(emails.map((email) => this.send(email)));
		},
	};
}

/**
 * Extract email address from "Name <email@example.com>" format
 */
function extractEmail(from: string): string {
	const match = from.match(/<(.+)>/);
	return match ? match[1] : from;
}
