/**
 * Invoice Utilities
 *
 * Helper functions for invoice processing
 */

import type { CustomerData, EditorDoc, EditorNode } from "./types.js";

// ============================================================================
// Content Validation
// ============================================================================

/**
 * Check if a string is valid JSON
 */
export function isValidJSON(str: string | null | undefined): boolean {
	if (!str) return false;
	try {
		JSON.parse(str);
		return true;
	} catch {
		return false;
	}
}

/**
 * Check if editor content is empty
 */
export function isEditorContentEmpty(content: EditorDoc | null | undefined): boolean {
	if (!content?.content) return true;
	return content.content.every((node) => {
		if (!node.content) return true;
		return node.content.every((inline) => !inline.text?.trim());
	});
}

// ============================================================================
// Customer Transform
// ============================================================================

/**
 * Transform customer data to editor content format
 */
export function transformCustomerToContent(customer?: CustomerData | null): EditorDoc | null {
	if (!customer) return null;

	const content: EditorNode[] = [];

	if (customer.name) {
		content.push({
			type: "paragraph",
			content: [{ type: "text", text: customer.name }],
		});
	}

	if (customer.addressLine1) {
		content.push({
			type: "paragraph",
			content: [{ type: "text", text: customer.addressLine1 }],
		});
	}

	if (customer.addressLine2) {
		content.push({
			type: "paragraph",
			content: [{ type: "text", text: customer.addressLine2 }],
		});
	}

	const cityLine = [customer.city, customer.state, customer.zip].filter(Boolean).join(", ");
	if (cityLine) {
		content.push({
			type: "paragraph",
			content: [{ type: "text", text: cityLine }],
		});
	}

	if (customer.country) {
		content.push({
			type: "paragraph",
			content: [{ type: "text", text: customer.country }],
		});
	}

	if (customer.email) {
		content.push({
			type: "paragraph",
			content: [{ type: "text", text: customer.email }],
		});
	}

	if (customer.phone) {
		content.push({
			type: "paragraph",
			content: [{ type: "text", text: customer.phone }],
		});
	}

	if (customer.taxId) {
		content.push({
			type: "paragraph",
			content: [{ type: "text", text: `Tax ID: ${customer.taxId}` }],
		});
	}

	if (content.length === 0) return null;

	return { type: "doc", content };
}

/**
 * Extract plain text from editor content
 */
export function extractTextFromContent(content: EditorDoc | null | undefined): string {
	if (!content?.content) return "";

	return content.content
		.map((node) => {
			if (!node.content) return "";
			return node.content.map((inline) => inline.text ?? "").join("");
		})
		.join("\n")
		.trim();
}

// ============================================================================
// Invoice Number
// ============================================================================

/**
 * Generate next invoice number
 *
 * @example
 * ```ts
 * generateInvoiceNumber("INV-", 42, 4) // "INV-0042"
 * generateInvoiceNumber("2024-", 1, 3) // "2024-001"
 * ```
 */
export function generateInvoiceNumber(prefix: string, sequence: number, padding = 4): string {
	return `${prefix}${String(sequence).padStart(padding, "0")}`;
}

/**
 * Parse invoice number to extract sequence
 */
export function parseInvoiceNumber(
	invoiceNumber: string,
	prefix: string,
): { prefix: string; sequence: number } | null {
	if (!invoiceNumber.startsWith(prefix)) return null;

	const sequenceStr = invoiceNumber.slice(prefix.length);
	const sequence = parseInt(sequenceStr, 10);

	if (Number.isNaN(sequence)) return null;

	return { prefix, sequence };
}

// ============================================================================
// Logo Validation
// ============================================================================

/**
 * Check if a logo URL is valid and accessible
 */
export async function isValidLogoUrl(url: string): Promise<boolean> {
	if (!url) return false;

	try {
		const response = await fetch(url, { method: "HEAD" });
		if (!response.ok) return false;

		const contentType = response.headers.get("content-type");
		return contentType?.startsWith("image/") ?? false;
	} catch {
		return false;
	}
}

/**
 * Validate logo URL format
 */
export function isValidLogoUrlFormat(url: string): boolean {
	if (!url) return false;

	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" || parsed.protocol === "http:";
	} catch {
		return false;
	}
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format date for invoice display
 */
export function formatInvoiceDate(
	date: string | Date | null,
	format: string = "MM/dd/yyyy",
	timezone: string = "UTC",
): string {
	if (!date) return "";

	const d = new Date(date);

	// Simple format replacement (for common patterns)
	const options: Intl.DateTimeFormatOptions = {
		timeZone: timezone,
	};

	if (format.includes("yyyy")) options.year = "numeric";
	if (format.includes("MM")) options.month = "2-digit";
	if (format.includes("MMM")) options.month = "short";
	if (format.includes("dd")) options.day = "2-digit";

	return new Intl.DateTimeFormat("en-US", options).format(d);
}

/**
 * Calculate due date from issue date
 */
export function calculateDueDate(issueDate: Date, paymentTermsDays: number): Date {
	const dueDate = new Date(issueDate);
	dueDate.setDate(dueDate.getDate() + paymentTermsDays);
	return dueDate;
}

// ============================================================================
// Status Helpers
// ============================================================================

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: string | Date | null, paidAt: string | null): boolean {
	if (paidAt) return false; // Already paid
	if (!dueDate) return false;

	const due = new Date(dueDate);
	const now = new Date();

	return due < now;
}

/**
 * Get days until due (negative if overdue)
 */
export function getDaysUntilDue(dueDate: string | Date | null): number | null {
	if (!dueDate) return null;

	const due = new Date(dueDate);
	const now = new Date();

	const diffTime = due.getTime() - now.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
