/**
 * Inbox Utilities
 *
 * Helper functions for email inbox processing
 */

import { base64UrlDecode, generateRandomHex, sha256 } from "@repo/security/crypto";

// ============================================================================
// Base64 Utilities
// ============================================================================

/**
 * Decode base64url string to Uint8Array
 * Gmail uses URL-safe base64 encoding
 */
export function decodeBase64Url(base64Url: string): Uint8Array {
	return base64UrlDecode(base64Url);
}

/**
 * Decode standard base64 to Uint8Array
 * Outlook uses standard base64
 */
export function decodeBase64(base64: string): Uint8Array {
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a deterministic ID from input string
 * Useful for deduplicating attachments
 */
export async function generateDeterministicId(input: string): Promise<string> {
	const hash = await sha256(input);
	return hash.slice(0, 16);
}

/**
 * Generate a random attachment ID
 */
export function generateAttachmentId(): string {
	return generateRandomHex(16);
}

// ============================================================================
// Email Parsing
// ============================================================================

/**
 * Extract email address from "Name <email@example.com>" format
 */
export function extractEmail(from: string): string | undefined {
	const match = from.match(/<([^>]+)>/);
	const email = match ? match[1] : from;
	return email?.includes("@") ? email : undefined;
}

/**
 * Extract root domain from email address
 * e.g., "user@mail.example.com" -> "example.com"
 */
export function extractDomain(email: string): string | undefined {
	const domain = email.split("@")[1];
	if (!domain) return undefined;

	const parts = domain.split(".");
	if (parts.length >= 2) {
		return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
	}
	return domain;
}

/**
 * Get inbox ID from email address
 * e.g., "inbox-abc123@inbox.example.com" -> "inbox-abc123"
 */
export function getInboxIdFromEmail(email: string): string | undefined {
	return email.split("@")[0];
}

// ============================================================================
// File Utilities
// ============================================================================

/**
 * Ensure filename has correct extension based on MIME type
 */
export function ensureFileExtension(filename: string, mimeType: string): string {
	const mimeToExt: Record<string, string> = {
		"application/pdf": ".pdf",
		"image/jpeg": ".jpg",
		"image/png": ".png",
		"image/gif": ".gif",
		"image/webp": ".webp",
		"application/msword": ".doc",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
		"application/vnd.ms-excel": ".xls",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
		"text/plain": ".txt",
		"text/csv": ".csv",
	};

	const expectedExt = mimeToExt[mimeType];
	if (!expectedExt) return filename;

	const hasCorrectExt = filename.toLowerCase().endsWith(expectedExt);
	if (hasCorrectExt) return filename;

	// Check if it has any extension
	const lastDot = filename.lastIndexOf(".");
	if (lastDot === -1) {
		return filename + expectedExt;
	}

	return filename;
}

/**
 * Check if MIME type is a supported attachment type
 */
export function isSupportedMimeType(mimeType: string, allowedTypes?: string[]): boolean {
	const defaultTypes = [
		"application/pdf",
		"image/jpeg",
		"image/png",
		"image/gif",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	];

	const types = allowedTypes ?? defaultTypes;
	return types.includes(mimeType) || mimeType === "application/octet-stream";
}

// ============================================================================
// Error Detection
// ============================================================================

/**
 * Check if error message indicates an authentication issue
 */
export function isAuthenticationError(errorMessage: string): boolean {
	if (!errorMessage) return false;

	const message = errorMessage.toLowerCase();

	const authPatterns = [
		// OAuth errors
		"invalid_request",
		"invalid_client",
		"invalid_grant",
		"unauthorized_client",
		"invalid_token",
		"token_expired",
		// HTTP status
		"401",
		"403",
		"unauthorized",
		"forbidden",
		"unauthenticated",
		// Provider-specific
		"authentication required",
		"re-authentication required",
		"authentication failed",
		"refresh token is invalid",
		"access token is invalid",
		"credentials have been revoked",
		"token has been expired or revoked",
		"invalid credentials",
		"permission denied",
		"insufficient permissions",
		// Microsoft-specific
		"invalidauthenticationtoken",
		"aadsts700082",
		"aadsts50076",
	];

	return authPatterns.some((pattern) => message.includes(pattern));
}

/**
 * Check if error is rate limiting
 */
export function isRateLimitError(errorMessage: string): boolean {
	if (!errorMessage) return false;

	const message = errorMessage.toLowerCase();
	return (
		message.includes("429") ||
		message.includes("rate limit") ||
		message.includes("too many requests") ||
		message.includes("quota exceeded")
	);
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Get date N days ago in ISO format
 */
export function getDaysAgo(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date.toISOString();
}

/**
 * Format date for Gmail query (YYYY/MM/DD)
 */
export function formatGmailDate(date: Date): string {
	return date.toISOString().split("T")[0].replace(/-/g, "/");
}

/**
 * Format date for Outlook filter (ISO 8601)
 */
export function formatOutlookDate(date: Date): string {
	return date.toISOString();
}
