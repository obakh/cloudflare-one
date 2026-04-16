/**
 * Encryption Utilities for Cloudflare Workers
 *
 * AES-256-GCM encryption, JWT tokens, and OAuth state encryption.
 * Uses Web Crypto API for Cloudflare Workers compatibility.
 *
 * @example Basic encryption
 * ```ts
 * import { encrypt, decrypt } from "@repo/security/encryption";
 *
 * const encrypted = await encrypt("sensitive data", encryptionKey);
 * const decrypted = await decrypt(encrypted, encryptionKey);
 * ```
 *
 * @example OAuth state
 * ```ts
 * import { encryptOAuthState, decryptOAuthState } from "@repo/security/encryption";
 *
 * const state = await encryptOAuthState({ userId: "123", returnTo: "/dashboard" }, key);
 * const parsed = await decryptOAuthState(state, key);
 * ```
 */

import {
	base64UrlDecode,
	base64UrlEncode,
	bytesToHex,
	generateRandomBytes,
	hexToBytes,
} from "../crypto/index.js";

// ============================================================================
// Types
// ============================================================================

export interface EncryptionOptions {
	/** Additional authenticated data (AAD) */
	aad?: string;
}

export interface JWTPayload {
	[key: string]: unknown;
	/** Issued at (Unix timestamp) */
	iat?: number;
	/** Expiration (Unix timestamp) */
	exp?: number;
	/** Subject */
	sub?: string;
}

// ============================================================================
// AES-256-GCM Encryption
// ============================================================================

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for GCM
const TAG_LENGTH = 128; // bits

/**
 * Import encryption key from hex string
 */
async function importKey(keyHex: string): Promise<CryptoKey> {
	if (keyHex.length !== 64) {
		throw new Error("Encryption key must be 64 hex characters (32 bytes)");
	}
	const keyBytes = hexToBytes(keyHex);
	return crypto.subtle.importKey(
		"raw",
		keyBytes.buffer as ArrayBuffer,
		{ name: ALGORITHM, length: KEY_LENGTH },
		false,
		["encrypt", "decrypt"],
	);
}

/**
 * Generate a new encryption key
 *
 * @returns 64-character hex string (32 bytes)
 *
 * @example
 * ```ts
 * const key = generateEncryptionKey();
 * // Store in environment variable: ENCRYPTION_KEY=<key>
 * ```
 */
export function generateEncryptionKey(): string {
	return bytesToHex(generateRandomBytes(32));
}

/**
 * Encrypt plaintext using AES-256-GCM
 *
 * @param plaintext - Data to encrypt
 * @param keyHex - 64-character hex encryption key
 * @param options - Encryption options
 * @returns Base64url-encoded encrypted payload (IV + ciphertext + tag)
 *
 * @example
 * ```ts
 * const encrypted = await encrypt("secret data", env.ENCRYPTION_KEY);
 * ```
 */
export async function encrypt(
	plaintext: string,
	keyHex: string,
	options: EncryptionOptions = {},
): Promise<string> {
	const key = await importKey(keyHex);
	const iv = generateRandomBytes(IV_LENGTH);
	const encoder = new TextEncoder();

	const encryptParams: AesGcmParams = {
		name: ALGORITHM,
		iv: iv.buffer as ArrayBuffer,
		tagLength: TAG_LENGTH,
	};

	if (options.aad) {
		encryptParams.additionalData = encoder.encode(options.aad);
	}

	const ciphertext = await crypto.subtle.encrypt(encryptParams, key, encoder.encode(plaintext));

	// Combine IV + ciphertext (tag is appended by WebCrypto)
	const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(ciphertext), IV_LENGTH);

	return base64UrlEncode(combined);
}

/**
 * Decrypt AES-256-GCM encrypted data
 *
 * @param encrypted - Base64url-encoded encrypted payload
 * @param keyHex - 64-character hex encryption key
 * @param options - Decryption options (must match encryption options)
 * @returns Decrypted plaintext
 *
 * @example
 * ```ts
 * const decrypted = await decrypt(encrypted, env.ENCRYPTION_KEY);
 * ```
 */
export async function decrypt(
	encrypted: string,
	keyHex: string,
	options: EncryptionOptions = {},
): Promise<string> {
	const key = await importKey(keyHex);
	const combined = base64UrlDecode(encrypted);

	if (combined.length < IV_LENGTH + 16) {
		// Minimum: IV + 16-byte tag
		throw new Error("Invalid encrypted payload: too short");
	}

	const iv = combined.slice(0, IV_LENGTH);
	const ciphertext = combined.slice(IV_LENGTH);
	const encoder = new TextEncoder();

	const decryptParams: AesGcmParams = {
		name: ALGORITHM,
		iv,
		tagLength: TAG_LENGTH,
	};

	if (options.aad) {
		decryptParams.additionalData = encoder.encode(options.aad);
	}

	const plaintext = await crypto.subtle.decrypt(decryptParams, key, ciphertext);

	return new TextDecoder().decode(plaintext);
}

// ============================================================================
// OAuth State Encryption
// ============================================================================

/**
 * Encrypt OAuth state for URL parameter
 *
 * @param payload - State object to encrypt
 * @param keyHex - Encryption key
 * @returns URL-safe encrypted string
 *
 * @example
 * ```ts
 * const state = await encryptOAuthState({
 *   userId: "123",
 *   returnTo: "/dashboard",
 *   provider: "github"
 * }, env.ENCRYPTION_KEY);
 *
 * // Use in OAuth URL: ?state=${state}
 * ```
 */
export async function encryptOAuthState<T extends object>(
	payload: T,
	keyHex: string,
): Promise<string> {
	const withTimestamp = {
		...payload,
		_ts: Date.now(),
	};
	return encrypt(JSON.stringify(withTimestamp), keyHex);
}

/**
 * Decrypt and validate OAuth state from callback
 *
 * @param encrypted - Encrypted state from URL
 * @param keyHex - Encryption key
 * @param options - Validation options
 * @returns Decrypted payload or null if invalid
 *
 * @example
 * ```ts
 * const state = await decryptOAuthState<{ userId: string; returnTo: string }>(
 *   params.state,
 *   env.ENCRYPTION_KEY,
 *   { maxAge: 600 } // 10 minutes
 * );
 *
 * if (!state) {
 *   return new Response("Invalid state", { status: 400 });
 * }
 * ```
 */
export async function decryptOAuthState<T extends object>(
	encrypted: string,
	keyHex: string,
	options: {
		/** Maximum age in seconds (default: 600 = 10 minutes) */
		maxAge?: number;
		/** Custom validation function */
		validate?: (payload: unknown) => payload is T;
	} = {},
): Promise<T | null> {
	const { maxAge = 600, validate } = options;

	try {
		const decrypted = await decrypt(encrypted, keyHex);
		const parsed = JSON.parse(decrypted);

		// Check timestamp
		if (parsed._ts) {
			const age = (Date.now() - parsed._ts) / 1000;
			if (age > maxAge) {
				return null;
			}
		}

		// Remove internal timestamp
		const { _ts, ...payload } = parsed;

		// Custom validation
		if (validate && !validate(payload)) {
			return null;
		}

		return payload as T;
	} catch {
		return null;
	}
}

// ============================================================================
// Simple JWT (HS256)
// ============================================================================

/**
 * Create a simple JWT token (HS256)
 *
 * @param payload - Token payload
 * @param secretHex - 64-character hex secret
 * @param options - Token options
 * @returns JWT token string
 *
 * @example
 * ```ts
 * const token = await createJWT(
 *   { userId: "123", role: "admin" },
 *   env.JWT_SECRET,
 *   { expiresIn: 3600 } // 1 hour
 * );
 * ```
 */
export async function createJWT(
	payload: JWTPayload,
	secretHex: string,
	options: {
		/** Expiration time in seconds from now */
		expiresIn?: number;
		/** Subject claim */
		subject?: string;
	} = {},
): Promise<string> {
	const { expiresIn, subject } = options;
	const now = Math.floor(Date.now() / 1000);

	const claims: JWTPayload = {
		...payload,
		iat: now,
	};

	if (expiresIn) {
		claims.exp = now + expiresIn;
	}

	if (subject) {
		claims.sub = subject;
	}

	// Header
	const header = { alg: "HS256", typ: "JWT" };
	const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));

	// Payload
	const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(claims)));

	// Signature
	const signatureInput = `${headerB64}.${payloadB64}`;
	const key = await crypto.subtle.importKey(
		"raw",
		hexToBytes(secretHex).buffer as ArrayBuffer,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signatureInput));
	const signatureB64 = base64UrlEncode(new Uint8Array(signature));

	return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Verify and decode a JWT token
 *
 * @param token - JWT token string
 * @param secretHex - 64-character hex secret
 * @returns Decoded payload or null if invalid
 *
 * @example
 * ```ts
 * const payload = await verifyJWT<{ userId: string }>(token, env.JWT_SECRET);
 * if (!payload) {
 *   return new Response("Unauthorized", { status: 401 });
 * }
 * ```
 */
export async function verifyJWT<T extends JWTPayload>(
	token: string,
	secretHex: string,
): Promise<T | null> {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;

		const [headerB64, payloadB64, signatureB64] = parts;

		// Verify signature
		const signatureInput = `${headerB64}.${payloadB64}`;
		const key = await crypto.subtle.importKey(
			"raw",
			hexToBytes(secretHex).buffer as ArrayBuffer,
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["verify"],
		);

		const signature = base64UrlDecode(signatureB64);
		const valid = await crypto.subtle.verify(
			"HMAC",
			key,
			signature.buffer as ArrayBuffer,
			new TextEncoder().encode(signatureInput),
		);

		if (!valid) return null;

		// Decode payload
		const payloadBytes = base64UrlDecode(payloadB64);
		const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as T;

		// Check expiration
		if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
			return null;
		}

		return payload;
	} catch {
		return null;
	}
}

// ============================================================================
// File/Resource Key Generation
// ============================================================================

/**
 * Generate a signed URL token for file access
 *
 * @param resourceId - Resource identifier
 * @param secretHex - Signing secret
 * @param options - Token options
 * @returns Signed token
 *
 * @example
 * ```ts
 * const token = await generateResourceToken(
 *   `team:${teamId}/file:${fileId}`,
 *   env.FILE_KEY_SECRET,
 *   { expiresIn: 3600 }
 * );
 *
 * // Use in URL: /files/${fileId}?token=${token}
 * ```
 */
export async function generateResourceToken(
	resourceId: string,
	secretHex: string,
	options: { expiresIn?: number } = {},
): Promise<string> {
	return createJWT({ rid: resourceId }, secretHex, options);
}

/**
 * Verify a resource token
 *
 * @param token - Token to verify
 * @param secretHex - Signing secret
 * @returns Resource ID or null if invalid
 */
export async function verifyResourceToken(
	token: string,
	secretHex: string,
): Promise<string | null> {
	const payload = await verifyJWT<{ rid: string }>(token, secretHex);
	return payload?.rid ?? null;
}
