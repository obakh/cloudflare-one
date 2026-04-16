/**
 * Security Headers Middleware
 *
 * Applies security headers to responses to protect against common attacks.
 *
 * @see https://developers.cloudflare.com/workers/examples/security-headers/
 */

/**
 * Default security headers
 */
export const DEFAULT_SECURITY_HEADERS: Record<string, string> = {
	// Prevents XSS attacks - set to 0 as modern browsers have built-in protection
	"X-XSS-Protection": "0",
	// Prevents clickjacking attacks
	"X-Frame-Options": "DENY",
	// Prevents MIME-sniffing
	"X-Content-Type-Options": "nosniff",
	// Controls referrer information
	"Referrer-Policy": "strict-origin-when-cross-origin",
	// Cross-origin isolation policies
	"Cross-Origin-Embedder-Policy": "require-corp",
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Resource-Policy": "same-site",
};

/**
 * Headers that should be removed for security
 */
export const BLOCKED_HEADERS = ["Public-Key-Pins", "X-Powered-By", "X-AspNet-Version"];

/**
 * Options for security headers
 */
export interface SecurityHeadersOptions {
	/** Content Security Policy directive */
	contentSecurityPolicy?: string;
	/** Enable HSTS (careful: can get added to browser preload lists) */
	strictTransportSecurity?: string;
	/** Permissions Policy (e.g., disable FLoC) */
	permissionsPolicy?: string;
	/** Additional custom headers */
	customHeaders?: Record<string, string>;
	/** Headers to remove (in addition to defaults) */
	removeHeaders?: string[];
	/** Only apply to HTML responses (default: true) */
	htmlOnly?: boolean;
}

/**
 * Apply security headers to a response
 *
 * @example
 * ```ts
 * import { applySecurityHeaders } from "@repo/security/headers";
 *
 * // Basic usage
 * const secureResponse = applySecurityHeaders(response);
 *
 * // With options
 * const secureResponse = applySecurityHeaders(response, {
 *   contentSecurityPolicy: "default-src 'self'",
 *   strictTransportSecurity: "max-age=63072000; includeSubDomains",
 * });
 * ```
 */
export function applySecurityHeaders(
	response: Response,
	options: SecurityHeadersOptions = {},
): Response {
	const {
		contentSecurityPolicy,
		strictTransportSecurity,
		permissionsPolicy,
		customHeaders = {},
		removeHeaders = [],
		htmlOnly = true,
	} = options;

	const newHeaders = new Headers(response.headers);
	const contentType = newHeaders.get("Content-Type") || "";

	// Skip non-HTML responses if htmlOnly is true
	if (htmlOnly && !contentType.includes("text/html")) {
		return response;
	}

	// Apply default security headers
	for (const [name, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
		newHeaders.set(name, value);
	}

	// Apply optional headers
	if (contentSecurityPolicy) {
		newHeaders.set("Content-Security-Policy", contentSecurityPolicy);
	}
	if (strictTransportSecurity) {
		newHeaders.set("Strict-Transport-Security", strictTransportSecurity);
	}
	if (permissionsPolicy) {
		newHeaders.set("Permissions-Policy", permissionsPolicy);
	}

	// Apply custom headers
	for (const [name, value] of Object.entries(customHeaders)) {
		newHeaders.set(name, value);
	}

	// Remove blocked headers
	for (const name of [...BLOCKED_HEADERS, ...removeHeaders]) {
		newHeaders.delete(name);
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	});
}

/**
 * Check if TLS version is secure (1.2 or higher)
 *
 * @example
 * ```ts
 * import { isSecureTLS } from "@repo/security/headers";
 *
 * if (!isSecureTLS(request)) {
 *   return new Response("TLS 1.2+ required", { status: 400 });
 * }
 * ```
 */
export function isSecureTLS(request: Request): boolean {
	const cf = (request as any).cf;
	if (!cf?.tlsVersion) return true; // Allow if no TLS info (local dev)
	return cf.tlsVersion === "TLSv1.2" || cf.tlsVersion === "TLSv1.3";
}

/**
 * Middleware that applies security headers and checks TLS
 *
 * @example
 * ```ts
 * import { securityMiddleware } from "@repo/security/headers";
 *
 * export default {
 *   async fetch(request, env) {
 *     const response = await handleRequest(request, env);
 *     return securityMiddleware(request, response);
 *   }
 * };
 * ```
 */
export function securityMiddleware(
	request: Request,
	response: Response,
	options: SecurityHeadersOptions & { enforceTLS?: boolean } = {},
): Response {
	const { enforceTLS = false, ...headerOptions } = options;

	// Check TLS version if enforced
	if (enforceTLS && !isSecureTLS(request)) {
		return new Response("TLS version 1.2 or higher required.", { status: 400 });
	}

	return applySecurityHeaders(response, headerOptions);
}
