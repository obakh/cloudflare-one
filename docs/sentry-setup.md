# Sentry Integration

Monitor errors, logs, and performance in your Cloudflare Workers with Sentry.

## Prerequisites

- [Sentry account](https://sentry.io) (free tier available)
- Sentry project DSN

## Setup

### 1. Get Your Sentry DSN

1. Log in to [Sentry](https://sentry.io)
2. Go to **Settings > Projects > Your Project > Client Keys (DSN)**
3. Copy the DSN (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)

### 2. Configure Wrangler

Add the version metadata binding and DSN to your wrangler config:

```jsonc
// apps/web/wrangler.jsonc
{
  "version_metadata": { "binding": "CF_VERSION_METADATA" },
  "vars": {
    "SENTRY_DSN": "https://xxx@xxx.ingest.sentry.io/xxx"
  }
}
```

Or use secrets for production:
```bash
wrangler secret put SENTRY_DSN
```

### 3. Wrap Your Worker

For Hono apps (like `apps/web`), wrap the export:

```ts
// apps/web/api/index.js
import { Hono } from "hono";
import { withSentry } from "@sentry/cloudflare";
import { createSentryOptions } from "@repo/observability/sentry";

const app = new Hono();

// ... your routes ...

export default withSentry(
  (env) => createSentryOptions(env),
  {
    fetch: app.fetch,
  }
);
```

### 4. Capture Errors

```ts
import { captureException, captureMessage, setUser } from "@repo/observability/sentry";

// Capture an error
try {
  await riskyOperation();
} catch (error) {
  captureException(error, { userId: "123" });
}

// Capture a message
captureMessage("User signed up", "info");

// Set user context
setUser({ id: "123", email: "user@example.com" });
```

### 5. Upload Source Maps

Source maps are already enabled in wrangler configs (`upload_source_maps: true`).

Run the Sentry wizard to configure source map uploads:
```bash
npx @sentry/wizard@latest -i sourcemaps
```

## Testing

Add a test route to verify Sentry is working:

```ts
app.get("/debug-sentry", () => {
  throw new Error("Sentry test error");
});
```

Visit `/debug-sentry` and check your Sentry dashboard for the error.

## Resources

- [Sentry Cloudflare SDK Docs](https://docs.sentry.io/platforms/javascript/guides/cloudflare/)
- [@sentry/cloudflare on npm](https://www.npmjs.com/package/@sentry/cloudflare)

## Structured Logging

The observability package also includes a lightweight logger for Cloudflare Workers.

### Basic Usage

```ts
import { logger, createLogger } from "@repo/observability/logging";

// Default logger
logger.info("Server started", { port: 8080 });
logger.error("Request failed", { error: err.message });

// Logger with context
const log = createLogger("auth");
log.info("User signed in", { userId: "123" }); // [auth] User signed in
log.warn("Token expiring soon");
```

### Child Loggers

```ts
const apiLog = createLogger("api");
const authLog = apiLog.child("auth");
const dbLog = apiLog.child("db");

authLog.info("Token validated"); // [api:auth] Token validated
dbLog.info("Query executed");    // [api:db] Query executed
```

### Request Context

```ts
import { withRequestContext } from "@repo/observability/logging";

app.use("*", async (c, next) => {
  const log = withRequestContext(c.req.raw);
  c.set("log", log);
  await next();
});

app.get("/users", (c) => {
  const log = c.get("log");
  log.info("Fetching users"); // [req:abc123] Fetching users
});
```

### Timing

```ts
import { logTiming } from "@repo/observability/logging";

const users = await logTiming(logger, "fetch users", async () => {
  return await db.query("SELECT * FROM users");
});
// Logs: "fetch users completed" { durationMs: 45 }
```

### Output Format

- Development (`LOG_PRETTY=true`): Colored, human-readable output
- Production: Structured JSON for log aggregation

```bash
# Development
10:30:45 INFO  [auth] User signed in { userId: "123" }

# Production
{"level":"info","message":"User signed in","context":"auth","timestamp":"2025-01-13T10:30:45.000Z","data":{"userId":"123"}}
```

### Environment Variables

```env
LOG_LEVEL=debug    # debug, info, warn, error (default: info)
LOG_PRETTY=true    # Pretty output (default: false in production)
```
