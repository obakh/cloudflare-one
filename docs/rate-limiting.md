# Rate Limiting

Protect your APIs from abuse using Cloudflare's Rate Limiting API.

## Quick Setup

### 1. Configure wrangler.jsonc

```jsonc
{
  "name": "my-worker",
  "rate_limits": [
    {
      "binding": "RATE_LIMITER",
      "namespace_id": "1001",
      "limit": 100,
      "period": 60
    },
    {
      "binding": "AUTH_RATE_LIMITER",
      "namespace_id": "1002",
      "limit": 10,
      "period": 60
    }
  ]
}
```

### 2. Add middleware

```ts
import { Hono } from "hono";
import { rateLimitMiddleware, RateLimitKeys } from "@repo/security/rate-limit";

interface Env {
  RATE_LIMITER: RateLimitBinding;
  AUTH_RATE_LIMITER: RateLimitBinding;
}

const app = new Hono<{ Bindings: Env }>();

// Rate limit all routes by IP
app.use("/*", rateLimitMiddleware({
  rateLimiter: (c) => c.env.RATE_LIMITER,
  keyFunc: RateLimitKeys.byIP,
}));

// Stricter limit for auth routes
app.use("/auth/*", rateLimitMiddleware({
  rateLimiter: (c) => c.env.AUTH_RATE_LIMITER,
  keyFunc: (c) => `auth:${RateLimitKeys.byIP(c)}`,
}));

export default app;
```

## Configuration

Rate limit bindings have three settings:

| Setting | Description |
|---------|-------------|
| `namespace_id` | Unique positive integer for this rate limit config |
| `limit` | Number of requests allowed per period |
| `period` | Time window in seconds (must be `10` or `60`) |

### Common Configurations

```jsonc
{
  "rate_limits": [
    // General API: 100 requests/minute
    {
      "binding": "API_LIMITER",
      "namespace_id": "1001",
      "limit": 100,
      "period": 60
    },
    // Auth endpoints: 10 requests/minute
    {
      "binding": "AUTH_LIMITER",
      "namespace_id": "1002",
      "limit": 10,
      "period": 60
    },
    // Expensive operations: 5 requests/10 seconds
    {
      "binding": "HEAVY_LIMITER",
      "namespace_id": "1003",
      "limit": 5,
      "period": 10
    }
  ]
}
```

## Key Functions

### Built-in Key Extractors

```ts
import { RateLimitKeys } from "@repo/security/rate-limit";

// By IP address (cf-connecting-ip header)
RateLimitKeys.byIP

// By Authorization header
RateLimitKeys.byAuthHeader

// By custom API key header
RateLimitKeys.byApiKey("X-API-Key")

// By IP + path combination
RateLimitKeys.byIPAndPath

// By user ID from context
RateLimitKeys.byUserId("userId")

// Combine multiple keys
RateLimitKeys.combine(
  RateLimitKeys.byIP,
  (c) => c.req.header("X-API-Key") || ""
)
```

### Custom Key Functions

```ts
// Rate limit by user email
app.use("/api/*", rateLimitMiddleware({
  rateLimiter: (c) => c.env.RATE_LIMITER,
  keyFunc: (c) => {
    const user = c.get("user");
    return user?.email || RateLimitKeys.byIP(c);
  },
}));

// Rate limit by endpoint + method
app.use("/api/*", rateLimitMiddleware({
  rateLimiter: (c) => c.env.RATE_LIMITER,
  keyFunc: (c) => {
    const ip = RateLimitKeys.byIP(c);
    const method = c.req.method;
    const path = new URL(c.req.url).pathname;
    return `${ip}:${method}:${path}`;
  },
}));
```

## Middleware Options

```ts
rateLimitMiddleware({
  // Required: Get rate limiter from env
  rateLimiter: (c) => c.env.RATE_LIMITER,
  
  // Required: Key function
  keyFunc: RateLimitKeys.byIP,
  
  // Optional: Custom response when rate limited
  onRateLimited: (c) => {
    return c.json({
      error: "Too many requests",
      retryAfter: 60,
    }, 429);
  },
  
  // Optional: Skip rate limiting for certain requests
  skip: (c) => {
    // Skip for internal requests
    return c.req.header("X-Internal-Request") === "true";
  },
  
  // Optional: What to do when key is empty
  // "skip" (default) - bypass rate limiting
  // "error" - return 400 error
  onEmptyKey: "skip",
});
```

## Direct Rate Limit Check

For more control, use `checkRateLimit` directly:

```ts
import { checkRateLimit } from "@repo/security/rate-limit";

app.post("/login", async (c) => {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const email = (await c.req.json()).email;
  
  // Check rate limit for this IP + email combination
  const { success } = await checkRateLimit(
    c.env.AUTH_LIMITER,
    `login:${ip}:${email}`
  );
  
  if (!success) {
    return c.json({ error: "Too many login attempts" }, 429);
  }
  
  // Process login...
});
```

## Tiered Rate Limiting

Different limits for different user tiers:

```ts
import { createTieredRateLimiter, RateLimitKeys } from "@repo/security/rate-limit";

// Configure in wrangler.jsonc:
// FREE_LIMITER: 100/min
// PRO_LIMITER: 1000/min
// ENTERPRISE_LIMITER: 10000/min

const tieredLimiter = createTieredRateLimiter({
  getTier: (c) => {
    const user = c.get("user");
    return user?.tier || "free";
  },
  limiters: {
    free: (c) => c.env.FREE_LIMITER,
    pro: (c) => c.env.PRO_LIMITER,
    enterprise: (c) => c.env.ENTERPRISE_LIMITER,
  },
  defaultTier: "free",
});

// Apply after auth middleware
app.use("/api/*", authMiddleware);
app.use("/api/*", tieredLimiter.middleware(RateLimitKeys.byUserId()));
```

## Checking Rate Limit Status

```ts
import { getRateLimitResult, isRateLimitOk } from "@repo/security/rate-limit";

app.get("/status", (c) => {
  const result = getRateLimitResult(c);
  
  return c.json({
    rateLimited: !result?.success,
    key: result?.key,
  });
});

// Or simply check if passed
app.get("/data", (c) => {
  if (!isRateLimitOk(c)) {
    // This shouldn't happen if middleware is applied
    return c.json({ error: "Rate limited" }, 429);
  }
  
  return c.json({ data: "..." });
});
```

## Use Cases

### API Rate Limiting

```ts
// 100 requests per minute per API key
app.use("/api/*", rateLimitMiddleware({
  rateLimiter: (c) => c.env.API_LIMITER,
  keyFunc: RateLimitKeys.byApiKey("X-API-Key"),
  onRateLimited: (c) => c.json({
    error: {
      code: "rate_limit_exceeded",
      message: "API rate limit exceeded",
      retryAfter: 60,
    }
  }, 429),
}));
```

### Login Protection

```ts
// 5 login attempts per minute per IP
app.use("/auth/login", rateLimitMiddleware({
  rateLimiter: (c) => c.env.LOGIN_LIMITER,
  keyFunc: RateLimitKeys.byIP,
  onRateLimited: (c) => c.json({
    error: "Too many login attempts. Please try again later.",
  }, 429),
}));
```

### Form Submission

```ts
// 3 form submissions per minute per IP
app.use("/contact", rateLimitMiddleware({
  rateLimiter: (c) => c.env.FORM_LIMITER,
  keyFunc: RateLimitKeys.byIP,
}));
```

### Expensive Operations

```ts
// 5 exports per 10 seconds per user
app.use("/api/export", rateLimitMiddleware({
  rateLimiter: (c) => c.env.EXPORT_LIMITER,
  keyFunc: RateLimitKeys.byUserId(),
  skip: (c) => c.get("user")?.isAdmin, // Skip for admins
}));
```

## Important Notes

### Rate Limits are Per-Location

Rate limits are enforced per Cloudflare location (edge). A user hitting your API from Sydney will have a separate limit from the same user hitting from London.

### Eventually Consistent

The Rate Limiting API is designed for speed, not precision. It's permissive and eventually consistent. Don't use it for:
- Billing/accounting
- Strict quotas
- Financial transactions

### No Network Latency

Calling `limit()` doesn't make a network request - it checks a local cache. This means rate limiting adds negligible latency to your requests.

## References

- [Cloudflare Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Rate Limiting Rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)

---

## Durable Object Rate Limiting

For scenarios where the Rate Limiting API isn't suitable (WebSocket connections, custom cooldown logic, per-connection limits), use the Durable Object-based rate limiter.

### When to Use DO Rate Limiting

| Use Case | Rate Limiting API | Durable Object |
|----------|-------------------|----------------|
| HTTP API rate limiting | ✅ | ❌ |
| WebSocket message limiting | ❌ | ✅ |
| Custom cooldown logic | ❌ | ✅ |
| Per-connection state | ❌ | ✅ |
| Precise counting | ❌ | ✅ |

### Setup

```toml
# wrangler.toml
[durable_objects]
bindings = [
  { name = "RATE_LIMITERS", class_name = "RateLimiterDO" }
]

[[migrations]]
tag = "v1"
new_classes = ["RateLimiterDO"]
```

```ts
// worker.ts
import { RateLimiterDO } from "@repo/security/rate-limit/durable-object";

export { RateLimiterDO };
```

### Usage

```ts
import {
  createRateLimiterClient,
  getIPFromRequest,
} from "@repo/security/rate-limit/durable-object";

export default {
  async fetch(request: Request, env: Env) {
    const ip = getIPFromRequest(request);
    const limiter = createRateLimiterClient(env.RATE_LIMITERS, ip, {
      cooldownSeconds: 5,
      gracePeriodSeconds: 20,
    });

    // Non-blocking check (returns immediately)
    if (!limiter.checkLimit()) {
      return new Response("Rate limited", { status: 429 });
    }

    // Or blocking check with retry info
    const { allowed, retryAfter } = await limiter.checkLimitAsync();
    if (!allowed) {
      return new Response("Rate limited", {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      });
    }

    return new Response("OK");
  },
};
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `cooldownSeconds` | 5 | Seconds added per action |
| `gracePeriodSeconds` | 20 | Burst allowance before limiting |
| `onError` | console.error | Error callback |

### How It Works

1. Each key (IP, user, etc.) gets its own Durable Object
2. The DO tracks `nextAllowedTime` in memory
3. Each action adds `cooldownSeconds` to `nextAllowedTime`
4. Grace period allows burst of ~4 actions before limiting
5. No durable storage - resets on eviction (acceptable for rate limiting)
