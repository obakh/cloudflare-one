/**
 * SendGrid Email Provider
 *
 * Uses fetch API directly (no SDK needed for Workers)
 *
 * @see https://docs.sendgrid.com/api-reference/mail-send/mail-send
 */

import { render } from "@react-email/render";
import type { EmailOptions, EmailProvider, EmailResult, ProviderConfig } from "../types";

const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

/**
 * Create a SendGrid email provider
 *
 * @example
 * ```ts
 * import { createSendGridProvider } from "@repo/notifications/email/providers/sendgrid";
 *
 * const provider = createSendGridProvider({ apiKey: env.SENDGRID_API_KEY });
 * ```
 */
export function createSendGridProvider(config: ProviderConfig): EmailProvider {
	const apiUrl = config.baseUrl || SENDGRID_API_URL;

	return {
		name: "sendgrid",

		async send(options: EmailOptions): Promise<EmailResult> {
			try {
				const to = Array.isArray(options.to) ? options.to : [options.to];

				// Render React Email to HTML if provided
				let html = options.html;
				let text = options.text;

				if (options.react) {
					html = await render(options.react);
					if (!text) {
						text = await render(options.react, { plainText: true });
					}
				}

				// Build SendGrid payload
				const payload: Record<string, unknown> = {
					personalizations: [
						{
							to: to.map((email) => ({ email })),
							...(options.cc && {
								cc: (Array.isArray(options.cc) ? options.cc : [options.cc]).map((email) => ({
									email,
								})),
							}),
							...(options.bcc && {
								bcc: (Array.isArray(options.bcc) ? options.bcc : [options.bcc]).map((email) => ({
									email,
								})),
							}),
						},
					],
					from: parseEmailAddress(options.from),
					subject: options.subject,
					content: [],
				};

				// Add content
				const content: Array<{ type: string; value: string }> = [];
				if (text) {
					content.push({ type: "text/plain", value: text });
				}
				if (html) {
					content.push({ type: "text/html", value: html });
				}
				payload.content = content;

				// Add reply-to
				if (options.replyTo) {
					payload.reply_to = parseEmailAddress(options.replyTo);
				}

				// Add headers
				if (options.headers) {
					payload.headers = options.headers;
				}

				const response = await fetch(apiUrl, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${config.apiKey}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const errorBody = await response.text();
					return {
						success: false,
						error: `SendGrid error: ${response.status} - ${errorBody}`,
					};
				}

				// SendGrid returns message ID in header
				const messageId = response.headers.get("X-Message-Id");
				return { success: true, id: messageId || undefined };
			} catch (err) {
				return {
					success: false,
					error: err instanceof Error ? err.message : "Unknown error",
				};
			}
		},

		async sendBatch(emails: EmailOptions[]): Promise<EmailResult[]> {
			return Promise.all(emails.map((email) => this.send(email)));
		},
	};
}

/**
 * Parse email address string to SendGrid format
 * "Name <email@example.com>" -> { name: "Name", email: "email@example.com" }
 */
function parseEmailAddress(address: string): { email: string; name?: string } {
	const match = address.match(/^(.+?)\s*<(.+?)>$/);
	if (match) {
		return { name: match[1].trim(), email: match[2].trim() };
	}
	return { email: address };
}
