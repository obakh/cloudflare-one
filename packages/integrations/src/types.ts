/**
 * Shared types for integrations
 *
 * Crypto utilities are imported from @repo/security/crypto
 */

// Re-export crypto utilities from @repo/security
export {
	base64UrlDecode,
	base64UrlEncode,
	bytesToHex,
	computeHmacSha1,
	computeHmacSha256,
	generatePKCE,
	generateRandomBase64Url,
	generateRandomHex,
	hexToBytes,
	sha256,
	sha256Base64Url,
	timingSafeEqual,
	verifyEd25519,
} from "@repo/security/crypto";

// ============================================================================
// OAuth Types
// ============================================================================

export interface OAuthConfig {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}

export interface OAuthTokens {
	accessToken: string;
	refreshToken?: string;
	expiresIn?: number;
	expiresAt?: number;
	tokenType: string;
	scope?: string;
}

export interface OAuthState {
	state: string;
	codeVerifier?: string; // For PKCE
	redirectUri: string;
	createdAt: number;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface WebhookResult {
	success: boolean;
	eventId?: string;
	eventType?: string;
	error?: string;
}

export interface WebhookVerificationResult {
	valid: boolean;
	timestamp?: number;
	error?: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface OAuthUser {
	id: string;
	email?: string;
	name?: string;
	avatar?: string;
	username?: string;
	raw: Record<string, unknown>;
}

// ============================================================================
// Convenience Aliases
// ============================================================================

/**
 * Generate a random state string for OAuth
 * Alias for generateRandomHex(32)
 */
/**
 * Generate PKCE code verifier
 * Alias for generateRandomBase64Url(64)
 */
/**
 * Generate PKCE code challenge from verifier
 * Alias for sha256Base64Url
 */
export {
	generateRandomBase64Url as generateCodeVerifier,
	generateRandomHex as generateState,
	sha256Base64Url as generateCodeChallenge,
} from "@repo/security/crypto";
