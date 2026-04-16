/**
 * Cryptographic Utilities for Cloudflare Workers
 *
 * Secure crypto primitives for signatures, hashing, and verification.
 *
 * @example HMAC signature verification
 * ```ts
 * import { computeHmacSha256, timingSafeEqual } from "@repo/security/crypto";
 *
 * const signature = await computeHmacSha256(secret, payload);
 * const isValid = timingSafeEqual(signature, providedSignature);
 * ```
 *
 * @example Generate secure random values
 * ```ts
 * import { generateRandomHex, generateRandomBase64Url } from "@repo/security/crypto";
 *
 * const state = generateRandomHex(32); // OAuth state
 * const codeVerifier = generateRandomBase64Url(64); // PKCE
 * ```
 */

// ============================================================================
// Random Generation
// ============================================================================

/**
 * Generate a cryptographically secure random hex string
 *
 * @param length - Number of random bytes (output will be 2x this length)
 * @returns Hex-encoded random string
 *
 * @example
 * ```ts
 * const state = generateRandomHex(32); // 64 character hex string
 * const token = generateRandomHex(16); // 32 character hex string
 * ```
 */
export function generateRandomHex(length = 32): string {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a cryptographically secure random base64url string
 * Useful for PKCE code verifiers and similar tokens
 *
 * @param length - Number of random bytes
 * @returns Base64url-encoded random string (no padding)
 *
 * @example
 * ```ts
 * const codeVerifier = generateRandomBase64Url(64);
 * ```
 */
export function generateRandomBase64Url(length = 64): string {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return base64UrlEncode(array);
}

/**
 * Generate a random bytes array
 *
 * @param length - Number of random bytes
 * @returns Uint8Array of random bytes
 */
export function generateRandomBytes(length: number): Uint8Array {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return array;
}

// ============================================================================
// Encoding Utilities
// ============================================================================

/**
 * Encode bytes to base64url (URL-safe base64 without padding)
 *
 * @param buffer - Bytes to encode
 * @returns Base64url-encoded string
 */
export function base64UrlEncode(buffer: Uint8Array): string {
	const base64 = btoa(String.fromCharCode(...buffer));
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode base64url string to bytes
 *
 * @param str - Base64url-encoded string
 * @returns Decoded bytes
 */
export function base64UrlDecode(str: string): Uint8Array {
	// Add padding if needed
	const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
	const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

/**
 * Convert hex string to Uint8Array
 *
 * @param hex - Hex-encoded string
 * @returns Decoded bytes
 */
export function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
	}
	return bytes;
}

/**
 * Convert Uint8Array to hex string
 *
 * @param bytes - Bytes to encode
 * @returns Hex-encoded string
 */
export function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// HMAC Functions
// ============================================================================

/**
 * Compute HMAC-SHA256 signature
 *
 * @param secret - Secret key
 * @param payload - Data to sign
 * @returns Hex-encoded signature
 *
 * @example
 * ```ts
 * // GitHub webhook verification
 * const signature = await computeHmacSha256(webhookSecret, body);
 * const expected = header.replace("sha256=", "");
 * ```
 */
export async function computeHmacSha256(secret: string, payload: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
	return bytesToHex(new Uint8Array(signature));
}

/**
 * Compute HMAC-SHA1 signature
 * Note: SHA1 is considered weak, only use for legacy APIs (e.g., some Slack endpoints)
 *
 * @param secret - Secret key
 * @param payload - Data to sign
 * @returns Hex-encoded signature
 */
export async function computeHmacSha1(secret: string, payload: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-1" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
	return bytesToHex(new Uint8Array(signature));
}

/**
 * Compute HMAC-SHA512 signature
 *
 * @param secret - Secret key
 * @param payload - Data to sign
 * @returns Hex-encoded signature
 */
export async function computeHmacSha512(secret: string, payload: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-512" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
	return bytesToHex(new Uint8Array(signature));
}

// ============================================================================
// Hash Functions
// ============================================================================

/**
 * Compute SHA-256 hash
 *
 * @param data - Data to hash
 * @returns Hex-encoded hash
 *
 * @example
 * ```ts
 * // PKCE code challenge
 * const challenge = await sha256(codeVerifier);
 * ```
 */
export async function sha256(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data));
	return bytesToHex(new Uint8Array(hash));
}

/**
 * Compute SHA-256 hash and return as base64url
 * Useful for PKCE code challenges
 *
 * @param data - Data to hash
 * @returns Base64url-encoded hash
 *
 * @example
 * ```ts
 * const codeChallenge = await sha256Base64Url(codeVerifier);
 * ```
 */
export async function sha256Base64Url(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data));
	return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Compute SHA-512 hash
 *
 * @param data - Data to hash
 * @returns Hex-encoded hash
 */
export async function sha512(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const hash = await crypto.subtle.digest("SHA-512", encoder.encode(data));
	return bytesToHex(new Uint8Array(hash));
}

// ============================================================================
// Comparison Functions
// ============================================================================

/**
 * Timing-safe string comparison
 * Prevents timing attacks when comparing secrets/signatures
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 *
 * @example
 * ```ts
 * const isValid = timingSafeEqual(computedSignature, providedSignature);
 * ```
 */
export function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		// Still do comparison to maintain constant time
		// but we know result will be false
		b = a;
	}

	let result = a.length === b.length ? 0 : 1;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

/**
 * Timing-safe bytes comparison
 *
 * @param a - First byte array
 * @param b - Second byte array
 * @returns true if arrays are equal
 */
export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) {
		b = a;
	}

	let result = a.length === b.length ? 0 : 1;
	for (let i = 0; i < a.length; i++) {
		result |= a[i] ^ b[i];
	}
	return result === 0;
}

// ============================================================================
// Ed25519 (for Discord)
// ============================================================================

/**
 * Verify Ed25519 signature
 * Used by Discord for interaction verification
 *
 * @param publicKeyHex - Public key as hex string
 * @param signatureHex - Signature as hex string
 * @param message - Message that was signed
 * @returns true if signature is valid
 *
 * @example
 * ```ts
 * const isValid = await verifyEd25519(
 *   env.DISCORD_PUBLIC_KEY,
 *   request.headers.get("x-signature-ed25519"),
 *   timestamp + body
 * );
 * ```
 */
export async function verifyEd25519(
	publicKeyHex: string,
	signatureHex: string,
	message: string,
): Promise<boolean> {
	try {
		const publicKey = hexToBytes(publicKeyHex);
		const signature = hexToBytes(signatureHex);
		const messageBytes = new TextEncoder().encode(message);

		const key = await crypto.subtle.importKey(
			"raw",
			publicKey.buffer as ArrayBuffer,
			{ name: "Ed25519", namedCurve: "Ed25519" },
			false,
			["verify"],
		);

		return crypto.subtle.verify("Ed25519", key, signature.buffer as ArrayBuffer, messageBytes);
	} catch {
		return false;
	}
}

// ============================================================================
// PKCE Helpers
// ============================================================================

/**
 * Generate PKCE code verifier and challenge
 *
 * @param length - Length of code verifier in bytes (default: 64)
 * @returns Object with codeVerifier and codeChallenge
 *
 * @example
 * ```ts
 * const { codeVerifier, codeChallenge } = await generatePKCE();
 * // Store codeVerifier in session
 * // Send codeChallenge in authorization request
 * ```
 */
export async function generatePKCE(length = 64): Promise<{
	codeVerifier: string;
	codeChallenge: string;
	codeChallengeMethod: "S256";
}> {
	const codeVerifier = generateRandomBase64Url(length);
	const codeChallenge = await sha256Base64Url(codeVerifier);

	return {
		codeVerifier,
		codeChallenge,
		codeChallengeMethod: "S256",
	};
}

// ============================================================================
// Webhook Signature Verification Helpers
// ============================================================================

/**
 * Verify a webhook signature with timestamp tolerance
 * Common pattern for Stripe, GitHub, etc.
 *
 * @param options - Verification options
 * @returns true if signature is valid and within tolerance
 *
 * @example
 * ```ts
 * // Stripe-style verification
 * const isValid = await verifyWebhookSignature({
 *   payload: body,
 *   signature: header,
 *   secret: webhookSecret,
 *   signaturePrefix: "v1=",
 *   timestampPrefix: "t=",
 *   tolerance: 300,
 * });
 * ```
 */
export async function verifyWebhookSignature(options: {
	payload: string;
	signature: string;
	secret: string;
	/** Prefix before the signature (e.g., "sha256=", "v1=") */
	signaturePrefix?: string;
	/** If signature header contains timestamp (e.g., Stripe format) */
	timestampPrefix?: string;
	/** Tolerance in seconds (default: 300 = 5 minutes) */
	tolerance?: number;
	/** Hash algorithm (default: "sha256") */
	algorithm?: "sha256" | "sha1" | "sha512";
}): Promise<boolean> {
	const {
		payload,
		signature,
		secret,
		signaturePrefix = "",
		timestampPrefix,
		tolerance = 300,
		algorithm = "sha256",
	} = options;

	let actualSignature = signature;
	let timestamp: number | undefined;

	// Parse timestamp if present (Stripe-style: "t=123,v1=abc")
	if (timestampPrefix && signature.includes(",")) {
		const parts = signature.split(",");
		const tsPart = parts.find((p) => p.startsWith(timestampPrefix));
		const sigPart = parts.find((p) => p.startsWith(signaturePrefix));

		if (!tsPart || !sigPart) return false;

		timestamp = Number.parseInt(tsPart.slice(timestampPrefix.length), 10);
		actualSignature = sigPart;
	}

	// Check timestamp tolerance
	if (timestamp !== undefined) {
		const now = Math.floor(Date.now() / 1000);
		if (Math.abs(now - timestamp) > tolerance) {
			return false;
		}
	}

	// Remove signature prefix
	if (signaturePrefix && actualSignature.startsWith(signaturePrefix)) {
		actualSignature = actualSignature.slice(signaturePrefix.length);
	}

	// Compute expected signature
	const signedPayload = timestamp !== undefined ? `${timestamp}.${payload}` : payload;

	let expectedSignature: string;
	switch (algorithm) {
		case "sha1":
			expectedSignature = await computeHmacSha1(secret, signedPayload);
			break;
		case "sha512":
			expectedSignature = await computeHmacSha512(secret, signedPayload);
			break;
		default:
			expectedSignature = await computeHmacSha256(secret, signedPayload);
	}

	return timingSafeEqual(expectedSignature, actualSignature);
}
