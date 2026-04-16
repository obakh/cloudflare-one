/**
 * Email Workers - Process Incoming Emails
 *
 * Handle incoming emails at the edge with Cloudflare Email Workers.
 * Parse, forward, reply, or reject emails programmatically.
 *
 * @see https://developers.cloudflare.com/email-routing/email-workers/
 *
 * @example
 * ```ts
 * // wrangler.toml
 * // [[email]]
 * // name = "EMAIL"
 *
 * import { createEmailHandler, parseEmail } from "@repo/notifications/email-workers";
 *
 * export default {
 *   async email(message, env, ctx) {
 *     const email = await parseEmail(message);
 *
 *     // Process based on recipient
 *     if (email.to.includes("support@")) {
 *       await createSupportTicket(env.DB, email);
 *       await message.forward("team@company.com");
 *     }
 *   },
 * };
 * ```
 */

// Note: These types match Cloudflare's Email Workers runtime API
// @see https://developers.cloudflare.com/email-routing/email-workers/runtime-api/

/**
 * Incoming email message from Email Workers
 */
export interface IncomingEmail {
	/** Sender email address */
	readonly from: string;
	/** Recipient email address */
	readonly to: string;
	/** Email headers */
	readonly headers: Headers;
	/** Raw email content as ReadableStream */
	readonly raw: ReadableStream;
	/** Size of raw email in bytes */
	readonly rawSize: number;
	/** Reject the email with a reason */
	setReject(reason: string): void;
	/** Forward email to another address */
	forward(rcptTo: string, headers?: Headers): Promise<void>;
	/** Reply to the sender */
	reply(message: EmailMessage): Promise<void>;
}

/**
 * Email message for sending replies
 */
export interface EmailMessage {
	readonly from: string;
	readonly to: string;
	readonly raw: ReadableStream | string;
}

/**
 * Parsed email content
 */
export interface ParsedEmail {
	/** Sender email address */
	from: string;
	/** Recipient email address */
	to: string;
	/** Email subject */
	subject: string | null;
	/** Message ID header */
	messageId: string | null;
	/** Plain text body */
	text: string | null;
	/** HTML body */
	html: string | null;
	/** Email headers as object */
	headers: Record<string, string>;
	/** Attachments */
	attachments: ParsedAttachment[];
	/** Original raw email */
	raw: ArrayBuffer;
}

/**
 * Parsed email attachment
 */
export interface ParsedAttachment {
	/** Filename */
	filename: string | null;
	/** MIME type */
	mimeType: string;
	/** Content as ArrayBuffer */
	content: ArrayBuffer;
	/** Content ID (for inline attachments) */
	contentId?: string;
	/** Size in bytes */
	size: number;
}

/**
 * Parse an incoming email message
 *
 * Uses postal-mime for parsing. Install it: `pnpm add postal-mime`
 *
 * @example
 * ```ts
 * import { parseEmail } from "@repo/notifications/email-workers";
 *
 * export default {
 *   async email(message, env, ctx) {
 *     const email = await parseEmail(message);
 *
 *     console.log("From:", email.from);
 *     console.log("Subject:", email.subject);
 *     console.log("Body:", email.text);
 *     console.log("Attachments:", email.attachments.length);
 *   },
 * };
 * ```
 */
export async function parseEmail(message: IncomingEmail): Promise<ParsedEmail> {
	// Dynamic import to avoid bundling postal-mime if not used
	const PostalMime = await import("postal-mime");
	const parser = new PostalMime.default();

	// Read raw email
	const rawResponse = new Response(message.raw);
	const rawBuffer = await rawResponse.arrayBuffer();

	// Parse email
	const parsed = await parser.parse(rawBuffer);

	// Convert headers to object
	const headers: Record<string, string> = {};
	message.headers.forEach((value, key) => {
		headers[key.toLowerCase()] = value;
	});

	return {
		from: message.from,
		to: message.to,
		subject: parsed.subject ?? null,
		messageId: headers["message-id"] ?? null,
		text: parsed.text ?? null,
		html: parsed.html ?? null,
		headers,
		attachments: (parsed.attachments ?? []).map((att) => ({
			filename: att.filename ?? null,
			mimeType: att.mimeType,
			content: (typeof att.content === "string"
				? new TextEncoder().encode(att.content).buffer
				: att.content) as ArrayBuffer,
			contentId: att.contentId,
			size: typeof att.content === "string" ? att.content.length : att.content.byteLength,
		})),
		raw: rawBuffer,
	};
}

/**
 * Get raw email as text
 */
export async function getRawEmailText(message: IncomingEmail): Promise<string> {
	const response = new Response(message.raw);
	return response.text();
}

/**
 * Get raw email as ArrayBuffer
 */
export async function getRawEmailBuffer(message: IncomingEmail): Promise<ArrayBuffer> {
	const response = new Response(message.raw);
	return response.arrayBuffer();
}

/**
 * Create a reply message
 *
 * Uses mimetext for creating MIME messages. Install it: `pnpm add mimetext`
 *
 * @example
 * ```ts
 * import { parseEmail, createReply } from "@repo/notifications/email-workers";
 *
 * export default {
 *   async email(message, env, ctx) {
 *     const email = await parseEmail(message);
 *
 *     const reply = await createReply({
 *       from: { name: "Support", address: "support@example.com" },
 *       to: email.from,
 *       subject: `Re: ${email.subject}`,
 *       text: "Thanks for your email! We'll get back to you soon.",
 *       inReplyTo: email.messageId,
 *     });
 *
 *     await message.reply(reply);
 *   },
 * };
 * ```
 */
export async function createReply(options: {
	from: string | { name: string; address: string };
	to: string;
	subject: string;
	text?: string;
	html?: string;
	inReplyTo?: string | null;
}): Promise<EmailMessage> {
	const { createMimeMessage } = await import("mimetext");

	const msg = createMimeMessage();

	// Set sender
	if (typeof options.from === "string") {
		msg.setSender(options.from);
	} else {
		msg.setSender({ name: options.from.name, addr: options.from.address });
	}

	// Set recipient
	msg.setRecipient(options.to);

	// Set subject
	msg.setSubject(options.subject);

	// Set In-Reply-To header for threading
	if (options.inReplyTo) {
		msg.setHeader("In-Reply-To", options.inReplyTo);
	}

	// Add content
	if (options.html) {
		msg.addMessage({
			contentType: "text/html",
			data: options.html,
		});
	}
	if (options.text) {
		msg.addMessage({
			contentType: "text/plain",
			data: options.text,
		});
	}

	const fromAddress = typeof options.from === "string" ? options.from : options.from.address;

	return {
		from: fromAddress,
		to: options.to,
		raw: msg.asRaw(),
	} as EmailMessage;
}

/**
 * Create an email handler with common patterns
 *
 * @example
 * ```ts
 * import { createEmailHandler } from "@repo/notifications/email-workers";
 *
 * const handler = createEmailHandler({
 *   // Route by recipient address
 *   routes: {
 *     "support@": async (email, message, env) => {
 *       await createTicket(env.DB, email);
 *       await message.forward("team@company.com");
 *     },
 *     "unsubscribe@": async (email, message, env) => {
 *       await processUnsubscribe(env.DB, email.from);
 *       // Don't forward, just process
 *     },
 *   },
 *   // Default handler for unmatched emails
 *   default: async (email, message) => {
 *     await message.forward("catchall@company.com");
 *   },
 *   // Optional: reject emails from certain senders
 *   blocklist: ["spam@", "blocked.com"],
 * });
 *
 * export default { email: handler };
 * ```
 */
export function createEmailHandler<Env = unknown>(options: {
	routes?: Record<string, (email: ParsedEmail, message: IncomingEmail, env: Env) => Promise<void>>;
	default?: (email: ParsedEmail, message: IncomingEmail, env: Env) => Promise<void>;
	blocklist?: string[];
	onError?: (error: Error, message: IncomingEmail, env: Env) => Promise<void>;
}) {
	const { routes = {}, default: defaultHandler, blocklist = [], onError } = options;

	return async (message: IncomingEmail, env: Env, _ctx: ExecutionContext) => {
		try {
			// Check blocklist
			for (const blocked of blocklist) {
				if (message.from.includes(blocked)) {
					message.setReject(`Sender blocked: ${blocked}`);
					return;
				}
			}

			// Parse email
			const email = await parseEmail(message);

			// Find matching route
			for (const [pattern, handler] of Object.entries(routes)) {
				if (message.to.includes(pattern)) {
					await handler(email, message, env);
					return;
				}
			}

			// Use default handler
			if (defaultHandler) {
				await defaultHandler(email, message, env);
			}
		} catch (error) {
			if (onError) {
				await onError(error as Error, message, env);
			} else {
				console.error("Email handler error:", error);
				throw error;
			}
		}
	};
}

/**
 * Forward email with additional headers
 *
 * @example
 * ```ts
 * import { forwardWithHeaders } from "@repo/notifications/email-workers";
 *
 * await forwardWithHeaders(message, "team@company.com", {
 *   "X-Original-To": message.to,
 *   "X-Forwarded-For": message.from,
 * });
 * ```
 */
export async function forwardWithHeaders(
	message: IncomingEmail,
	to: string,
	additionalHeaders: Record<string, string>,
): Promise<void> {
	const headers = new Headers();
	for (const [key, value] of Object.entries(additionalHeaders)) {
		headers.set(key, value);
	}
	await message.forward(to, headers);
}

/**
 * Check if email has attachments
 */
export function hasAttachments(email: ParsedEmail): boolean {
	return email.attachments.length > 0;
}

/**
 * Get attachment by filename
 */
export function getAttachment(email: ParsedEmail, filename: string): ParsedAttachment | undefined {
	return email.attachments.find((att) => att.filename?.toLowerCase() === filename.toLowerCase());
}

/**
 * Get attachments by MIME type
 */
export function getAttachmentsByType(email: ParsedEmail, mimeType: string): ParsedAttachment[] {
	return email.attachments.filter((att) =>
		att.mimeType.toLowerCase().startsWith(mimeType.toLowerCase()),
	);
}

/**
 * Extract email address from "Name <email@example.com>" format
 */
export function extractEmailAddress(input: string): string {
	const match = input.match(/<([^>]+)>/);
	return match ? match[1] : input.trim();
}

/**
 * Extract name from "Name <email@example.com>" format
 */
export function extractName(input: string): string | null {
	const match = input.match(/^([^<]+)</);
	return match ? match[1].trim() : null;
}
