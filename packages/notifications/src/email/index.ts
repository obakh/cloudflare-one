/**
 * Email Notifications
 *
 * Provider-agnostic email sending with React Email template support.
 *
 * @example Using Resend
 * ```ts
 * import { createEmailClient } from "@repo/notifications/email";
 * import { createResendProvider } from "@repo/notifications/email/providers/resend";
 * import { WelcomeEmail } from "@repo/notifications/email/templates";
 *
 * const email = createEmailClient(createResendProvider({ apiKey: env.RESEND_API_KEY }));
 *
 * await email.send({
 *   from: "Acme <hello@acme.com>",
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   react: <WelcomeEmail name="John" appName="Acme" />,
 * });
 * ```
 *
 * @example Using SendGrid
 * ```ts
 * import { createEmailClient } from "@repo/notifications/email";
 * import { createSendGridProvider } from "@repo/notifications/email/providers/sendgrid";
 *
 * const email = createEmailClient(createSendGridProvider({ apiKey: env.SENDGRID_API_KEY }));
 * ```
 */

import { render } from "@react-email/render";
import type { EmailOptions, EmailProvider, EmailResult } from "./types";

// Re-export types
export type { EmailOptions, EmailProvider, EmailResult, ProviderConfig } from "./types";

/**
 * Email client wrapper
 */
export interface EmailClient {
	/** Provider name */
	provider: string;
	/** Send an email */
	send(options: EmailOptions): Promise<EmailResult>;
	/** Send batch of emails */
	sendBatch(options: EmailOptions[]): Promise<EmailResult[]>;
	/** Render React Email to HTML */
	renderToHtml(component: React.ReactElement): Promise<string>;
	/** Render React Email to plain text */
	renderToText(component: React.ReactElement): Promise<string>;
}

/**
 * Create an email client with a provider
 *
 * @example
 * ```ts
 * import { createEmailClient } from "@repo/notifications/email";
 * import { createResendProvider } from "@repo/notifications/email/providers/resend";
 *
 * const email = createEmailClient(createResendProvider({ apiKey: env.RESEND_API_KEY }));
 *
 * await email.send({
 *   from: "hello@example.com",
 *   to: "user@example.com",
 *   subject: "Hello",
 *   html: "<h1>Hello World</h1>",
 * });
 * ```
 */
export function createEmailClient(provider: EmailProvider): EmailClient {
	return {
		provider: provider.name,

		async send(options: EmailOptions): Promise<EmailResult> {
			return provider.send(options);
		},

		async sendBatch(options: EmailOptions[]): Promise<EmailResult[]> {
			if (provider.sendBatch) {
				return provider.sendBatch(options);
			}
			return Promise.all(options.map((opt) => provider.send(opt)));
		},

		async renderToHtml(component: React.ReactElement): Promise<string> {
			return render(component);
		},

		async renderToText(component: React.ReactElement): Promise<string> {
			return render(component, { plainText: true });
		},
	};
}

/**
 * Render a React Email component to HTML
 *
 * @example
 * ```ts
 * import { renderEmail } from "@repo/notifications/email";
 * import { WelcomeEmail } from "@repo/notifications/email/templates";
 *
 * const html = await renderEmail(<WelcomeEmail name="John" appName="Acme" />);
 * ```
 */
export async function renderEmail(component: React.ReactElement): Promise<string> {
	return render(component);
}

/**
 * Render a React Email component to plain text
 */
export async function renderEmailText(component: React.ReactElement): Promise<string> {
	return render(component, { plainText: true });
}
