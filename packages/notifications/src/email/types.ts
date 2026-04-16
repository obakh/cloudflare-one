/**
 * Email Types - Provider-agnostic email interfaces
 */

import type { ReactElement } from "react";

/**
 * Email options (provider-agnostic)
 */
export interface EmailOptions {
	/** Sender email (e.g., "Acme <hello@acme.com>") */
	from: string;
	/** Recipient email(s) */
	to: string | string[];
	/** Email subject */
	subject: string;
	/** HTML content */
	html?: string;
	/** Plain text content */
	text?: string;
	/** React Email component */
	react?: ReactElement;
	/** Reply-to address */
	replyTo?: string;
	/** CC recipients */
	cc?: string | string[];
	/** BCC recipients */
	bcc?: string | string[];
	/** Custom headers */
	headers?: Record<string, string>;
	/** Tags for tracking */
	tags?: Array<{ name: string; value: string }>;
}

/**
 * Email send result
 */
export interface EmailResult {
	success: boolean;
	id?: string;
	error?: string;
}

/**
 * Email provider interface
 */
export interface EmailProvider {
	/** Provider name */
	name: string;
	/** Send an email */
	send(options: EmailOptions): Promise<EmailResult>;
	/** Send batch of emails */
	sendBatch?(options: EmailOptions[]): Promise<EmailResult[]>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
	apiKey: string;
	/** Base URL override (for testing) */
	baseUrl?: string;
}
