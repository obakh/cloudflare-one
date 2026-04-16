/**
 * Cloudflare Turnstile - CAPTCHA alternative
 *
 * Server-side validation for Turnstile tokens.
 *
 * @see https://developers.cloudflare.com/turnstile/
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Turnstile verification result
 */
export interface TurnstileResult {
	success: boolean;
	"error-codes"?: string[];
	challenge_ts?: string;
	hostname?: string;
	action?: string;
	cdata?: string;
}

/**
 * Options for Turnstile verification
 */
export interface TurnstileOptions {
	/** Your Turnstile secret key */
	secretKey: string;
	/** The token from cf-turnstile-response */
	token: string;
	/** Optional: visitor's IP address */
	remoteIp?: string;
	/** Optional: idempotency key for retries */
	idempotencyKey?: string;
}

/**
 * Verify a Turnstile token server-side
 *
 * @example
 * ```ts
 * import { verifyTurnstile } from "@repo/security/turnstile";
 *
 * app.post("/api/contact", async (c) => {
 *   const body = await c.req.formData();
 *   const token = body.get("cf-turnstile-response");
 *
 *   const result = await verifyTurnstile({
 *     secretKey: c.env.TURNSTILE_SECRET_KEY,
 *     token: token as string,
 *     remoteIp: c.req.header("CF-Connecting-IP"),
 *   });
 *
 *   if (!result.success) {
 *     return c.json({ error: "Verification failed" }, 400);
 *   }
 *
 *   // Process form...
 * });
 * ```
 */
export async function verifyTurnstile(options: TurnstileOptions): Promise<TurnstileResult> {
	const { secretKey, token, remoteIp, idempotencyKey } = options;

	if (!token) {
		return {
			success: false,
			"error-codes": ["missing-input-response"],
		};
	}

	const formData = new FormData();
	formData.append("secret", secretKey);
	formData.append("response", token);

	if (remoteIp) {
		formData.append("remoteip", remoteIp);
	}

	if (idempotencyKey) {
		formData.append("idempotency_key", idempotencyKey);
	}

	try {
		const response = await fetch(SITEVERIFY_URL, {
			method: "POST",
			body: formData,
		});

		return (await response.json()) as TurnstileResult;
	} catch (error) {
		console.error("Turnstile verification error:", error);
		return {
			success: false,
			"error-codes": ["internal-error"],
		};
	}
}

/**
 * Middleware helper to verify Turnstile token from request
 *
 * @example
 * ```ts
 * import { getTurnstileToken } from "@repo/security/turnstile";
 *
 * const token = await getTurnstileToken(request);
 * ```
 */
export async function getTurnstileToken(request: Request): Promise<string | null> {
	const contentType = request.headers.get("content-type") || "";

	if (contentType.includes("application/json")) {
		const body = (await request.clone().json()) as Record<string, unknown>;
		return (body["cf-turnstile-response"] as string) || (body.turnstileToken as string) || null;
	}

	if (contentType.includes("form")) {
		const formData = await request.clone().formData();
		return formData.get("cf-turnstile-response") as string | null;
	}

	return null;
}

/**
 * Test keys for development (always pass/fail)
 * @see https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
export const TEST_KEYS = {
	/** Always passes */
	siteKey: {
		visible: "1x00000000000000000000AA",
		invisible: "1x00000000000000000000BB",
		forceChallenge: "2x00000000000000000000AB",
		forceBlock: "2x00000000000000000000BB",
	},
	/** Always passes */
	secretKey: {
		alwaysPass: "1x0000000000000000000000000000000AA",
		alwaysFail: "2x0000000000000000000000000000000AA",
		tokenAlreadySpent: "3x0000000000000000000000000000000AA",
	},
} as const;
