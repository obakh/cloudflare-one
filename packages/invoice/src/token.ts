/**
 * Invoice Token Utilities
 *
 * Generate and verify secure tokens for invoice access links.
 * Uses @repo/security for JWT operations.
 */

import { createJWT, verifyJWT } from "@repo/security/encryption";

// ============================================================================
// Types
// ============================================================================

export interface InvoiceTokenPayload {
	/** Invoice ID */
	id: string;
	/** Optional: Team/organization ID */
	teamId?: string;
	/** Optional: Customer ID */
	customerId?: string;
	/** Index signature for JWT compatibility */
	[key: string]: unknown;
}

// ============================================================================
// Token Operations
// ============================================================================

/**
 * Generate a secure token for invoice access
 *
 * @example
 * ```ts
 * const token = await generateInvoiceToken(
 *   { id: "inv_123", teamId: "team_456" },
 *   env.INVOICE_JWT_SECRET
 * );
 * // Use in URL: /invoice/${token}
 * ```
 */
export async function generateInvoiceToken(
	payload: InvoiceTokenPayload,
	secretHex: string,
	options: { expiresIn?: number } = {},
): Promise<string> {
	// Default: 1 year expiry for invoice links
	const { expiresIn = 365 * 24 * 60 * 60 } = options;

	return createJWT(payload, secretHex, { expiresIn });
}

/**
 * Verify and decode an invoice token
 *
 * @example
 * ```ts
 * const payload = await verifyInvoiceToken(token, env.INVOICE_JWT_SECRET);
 * if (!payload) {
 *   return new Response("Invalid or expired link", { status: 401 });
 * }
 * // payload.id contains the invoice ID
 * ```
 */
export async function verifyInvoiceToken(
	token: string,
	secretHex: string,
): Promise<InvoiceTokenPayload | null> {
	return verifyJWT<InvoiceTokenPayload>(token, secretHex);
}

/**
 * Generate a short-lived token for invoice actions (e.g., payment confirmation)
 *
 * @example
 * ```ts
 * const actionToken = await generateInvoiceActionToken(
 *   { id: "inv_123", action: "mark_paid" },
 *   env.INVOICE_JWT_SECRET
 * );
 * ```
 */
export async function generateInvoiceActionToken(
	payload: InvoiceTokenPayload & { action: string },
	secretHex: string,
): Promise<string> {
	// Short expiry for action tokens (1 hour)
	return createJWT(payload, secretHex, { expiresIn: 60 * 60 });
}

/**
 * Verify an invoice action token
 */
export async function verifyInvoiceActionToken(
	token: string,
	secretHex: string,
): Promise<(InvoiceTokenPayload & { action: string }) | null> {
	return verifyJWT<InvoiceTokenPayload & { action: string }>(token, secretHex);
}
