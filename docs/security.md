# Security

Security utilities for Cloudflare Workers: headers, rate limiting, Turnstile, and cryptographic primitives.

## Installation

```bash
pnpm add @repo/security
```

## Crypto Utilities

Secure cryptographic primitives for signatures, hashing, and verification.

```ts
import {
  // Random generation
  generateRandomHex,
  generateRandomBase64Url,
  generateRandomBytes,
  
  // Encoding
  base64UrlEncode,
  base64UrlDecode,
  hexToBytes,
  bytesToHex,
  
  // HMAC
  computeHmacSha256,
  computeHmacSha1,
  computeHmacSha512,
  
  // Hashing
  sha256,
  sha256Base64Url,
  sha512,
  
  // Comparison
  timingSafeEqual,
  timingSafeEqualBytes,
  
  // Ed25519
  verifyEd25519,
  
  // PKCE
  generatePKCE,
  
  // Webhook verification
  verifyWebhookSignature,
} from "@repo/security/crypto";
```

### Random Generation

```ts
// Generate OAuth state (64 char hex string)
const state = generateRandomHex(32);

// Generate PKCE code verifier
const codeVerifier = generateRandomBase64Url(64);

// Generate raw bytes
const bytes = generateRandomBytes(16);
```

### HMAC Signatures

```ts
// GitHub webhook verification
const signature = await computeHmacSha256(webhookSecret, body);
const expected = header.replace("sha256=", "");
const isValid = timingSafeEqual(signature, expected);

// Slack request verification
const baseString = `v0:${timestamp}:${body}`;
const signature = await computeHmacSha256(signingSecret, baseString);
```

### Hashing

```ts
// SHA-256 hash (hex)
const hash = await sha256(data);

// SHA-256 hash (base64url) - for PKCE
const codeChallenge = await sha256Base64Url(codeVerifier);
```

### PKCE (OAuth)

```ts
// Generate PKCE pair
const { codeVerifier, codeChallenge, codeChallengeMethod } = await generatePKCE();

// Store codeVerifier in session
// Send codeChallenge in authorization request
const authUrl = `https://auth.example.com/authorize?` +
  `code_challenge=${codeChallenge}&` +
  `code_challenge_method=${codeChallengeMethod}`;
```

### Ed25519 Verification (Discord)

```ts
const isValid = await verifyEd25519(
  env.DISCORD_PUBLIC_KEY,
  request.headers.get("x-signature-ed25519")!,
  timestamp + body
);
```

### Generic Webhook Verification

```ts
// Stripe-style verification (timestamp + signature in header)
const isValid = await verifyWebhookSignature({
  payload: body,
  signature: header, // "t=123,v1=abc..."
  secret: webhookSecret,
  signaturePrefix: "v1=",
  timestampPrefix: "t=",
  tolerance: 300, // 5 minutes
});

// GitHub-style verification
const isValid = await verifyWebhookSignature({
  payload: body,
  signature: header, // "sha256=abc..."
  secret: webhookSecret,
  signaturePrefix: "sha256=",
});
```

## Security Headers

Apply security headers to responses.

```ts
import { applySecurityHeaders, securityMiddleware } from "@repo/security/headers";

// Basic usage
const secureResponse = applySecurityHeaders(response);

// With options
const secureResponse = applySecurityHeaders(response, {
  contentSecurityPolicy: "default-src 'self'",
  strictTransportSecurity: "max-age=63072000; includeSubDomains",
  permissionsPolicy: "interest-cohort=()",
});

// As middleware
export default {
  async fetch(request, env) {
    const response = await handleRequest(request, env);
    return securityMiddleware(request, response, {
      enforceTLS: true,
    });
  }
};
```

## Rate Limiting

Rate limiting using Cloudflare's Rate Limiting API.

```ts
import { rateLimitMiddleware, RateLimitKeys } from "@repo/security/rate-limit";

// Rate limit by IP
app.use("/*", rateLimitMiddleware({
  rateLimiter: (c) => c.env.RATE_LIMITER,
  keyFunc: RateLimitKeys.byIP,
}));

// Rate limit by API key
app.use("/api/*", rateLimitMiddleware({
  rateLimiter: (c) => c.env.API_RATE_LIMITER,
  keyFunc: RateLimitKeys.byApiKey("X-API-Key"),
}));

// Custom key with custom response
app.use("/auth/*", rateLimitMiddleware({
  rateLimiter: (c) => c.env.AUTH_RATE_LIMITER,
  keyFunc: (c) => `auth:${RateLimitKeys.byIP(c)}`,
  onRateLimited: (c) => c.json({ error: "Too many login attempts" }, 429),
}));
```

### Tiered Rate Limiting

```ts
import { createTieredRateLimiter } from "@repo/security/rate-limit";

const tieredLimiter = createTieredRateLimiter({
  getTier: (c) => c.get("userTier") || "free",
  limiters: {
    free: (c) => c.env.FREE_RATE_LIMITER,
    pro: (c) => c.env.PRO_RATE_LIMITER,
    enterprise: (c) => c.env.ENTERPRISE_RATE_LIMITER,
  },
});

app.use("/api/*", tieredLimiter.middleware(RateLimitKeys.byUserId()));
```

## Turnstile (CAPTCHA)

Cloudflare Turnstile verification.

```ts
import { verifyTurnstile } from "@repo/security/turnstile";

app.post("/submit", async (c) => {
  const token = c.req.header("cf-turnstile-response");
  
  const result = await verifyTurnstile({
    token,
    secretKey: c.env.TURNSTILE_SECRET_KEY,
    remoteip: c.req.header("cf-connecting-ip"),
  });
  
  if (!result.success) {
    return c.json({ error: "CAPTCHA verification failed" }, 400);
  }
  
  // Process form...
});
```

## Environment Variables

```env
# Rate Limiting (configured in wrangler.toml)
# [[rate_limits]]
# binding = "RATE_LIMITER"

# Turnstile
TURNSTILE_SECRET_KEY=
TURNSTILE_SITE_KEY=

# Encryption
ENCRYPTION_KEY=  # 64-char hex (32 bytes) - generate with generateEncryptionKey()
JWT_SECRET=      # 64-char hex (32 bytes)
FILE_KEY_SECRET= # 64-char hex (32 bytes)
```

## Encryption

AES-256-GCM encryption, JWT tokens, and OAuth state encryption.

```ts
import {
  // Key generation
  generateEncryptionKey,
  
  // AES-256-GCM
  encrypt,
  decrypt,
  
  // OAuth state
  encryptOAuthState,
  decryptOAuthState,
  
  // JWT
  createJWT,
  verifyJWT,
  
  // Resource tokens
  generateResourceToken,
  verifyResourceToken,
} from "@repo/security/encryption";
```

### Basic Encryption

```ts
// Generate a key (do this once, store in env)
const key = generateEncryptionKey();
// => "a1b2c3d4..." (64 hex chars)

// Encrypt
const encrypted = await encrypt("sensitive data", env.ENCRYPTION_KEY);

// Decrypt
const decrypted = await decrypt(encrypted, env.ENCRYPTION_KEY);
```

### OAuth State Encryption

```ts
// Encrypt state for OAuth redirect
const state = await encryptOAuthState({
  userId: "123",
  returnTo: "/dashboard",
  provider: "github",
}, env.ENCRYPTION_KEY);

// Use in OAuth URL
const authUrl = `https://github.com/login/oauth/authorize?state=${state}`;

// Decrypt in callback
const parsed = await decryptOAuthState<{
  userId: string;
  returnTo: string;
  provider: string;
}>(params.state, env.ENCRYPTION_KEY, {
  maxAge: 600, // 10 minutes
});

if (!parsed) {
  return new Response("Invalid state", { status: 400 });
}
```

### JWT Tokens

```ts
// Create token
const token = await createJWT(
  { userId: "123", role: "admin" },
  env.JWT_SECRET,
  { expiresIn: 3600 } // 1 hour
);

// Verify token
const payload = await verifyJWT<{ userId: string; role: string }>(
  token,
  env.JWT_SECRET
);

if (!payload) {
  return new Response("Unauthorized", { status: 401 });
}
```

### Resource Tokens (Signed URLs)

```ts
// Generate token for file access
const token = await generateResourceToken(
  `team:${teamId}/file:${fileId}`,
  env.FILE_KEY_SECRET,
  { expiresIn: 3600 }
);

// Use in URL
const downloadUrl = `/files/${fileId}?token=${token}`;

// Verify in handler
const resourceId = await verifyResourceToken(token, env.FILE_KEY_SECRET);
if (!resourceId) {
  return new Response("Invalid token", { status: 403 });
}
```
