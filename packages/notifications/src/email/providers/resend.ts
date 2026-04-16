/**
 * Resend Email Provider
 *
 * @see https://resend.com/docs
 */

import { Resend } from "resend";
import type { EmailOptions, EmailProvider, EmailResult, ProviderConfig } from "../types";

/**
 * Create a Resend email provider
 *
 * @example
 * ```ts
 * import { createResendProvider } from "@repo/notifications/email/providers/resend";
 *
 * const provider = createResendProvider({ apiKey: env.RESEND_API_KEY });
 * ```
 */
export function createResendProvider(config: ProviderConfig): EmailProvider {
	const client = new Resend(config.apiKey);

	return {
		name: "resend",

		async send(options: EmailOptions): Promise<EmailResult> {
			try {
				const to = Array.isArray(options.to) ? options.to : [options.to];
				const cc = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
				const bcc = options.bcc
					? Array.isArray(options.bcc)
						? options.bcc
						: [options.bcc]
					: undefined;

				// Resend supports React Email natively
				const { data, error } = options.react
					? await client.emails.send({
							from: options.from,
							to,
							subject: options.subject,
							react: options.react,
							text: options.text,
							replyTo: options.replyTo,
							cc,
							bcc,
							headers: options.headers,
							tags: options.tags,
						})
					: options.html
						? await client.emails.send({
								from: options.from,
								to,
								subject: options.subject,
								html: options.html,
								text: options.text,
								replyTo: options.replyTo,
								cc,
								bcc,
								headers: options.headers,
								tags: options.tags,
							})
						: await client.emails.send({
								from: options.from,
								to,
								subject: options.subject,
								text: options.text || "",
								replyTo: options.replyTo,
								cc,
								bcc,
								headers: options.headers,
								tags: options.tags,
							});

				if (error) {
					return { success: false, error: error.message };
				}

				return { success: true, id: data?.id };
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
