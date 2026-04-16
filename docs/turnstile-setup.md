# Cloudflare Turnstile

CAPTCHA alternative for protecting forms from bots.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com)
- Turnstile site key and secret key from dashboard

## Setup

### 1. Get Turnstile Keys

1. Go to [Cloudflare Dashboard > Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click "Add site"
3. Configure your domain
4. Copy the Site Key and Secret Key

### 2. Add Secret to Environment

```bash
# apps/web/.dev.vars
TURNSTILE_SECRET_KEY="your-secret-key"
```

For production:
```bash
wrangler secret put TURNSTILE_SECRET_KEY
```

### 3. Add Widget to Frontend

```html
<!-- Add script to your page -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></script>

<!-- Add widget to your form -->
<form method="POST" action="/api/contact">
  <input type="text" name="email" />
  <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
  <button type="submit">Submit</button>
</form>
```

### 4. Verify Token Server-Side

```ts
import { verifyTurnstile } from "@repo/security/turnstile";

app.post("/api/contact", async (c) => {
  const body = await c.req.formData();
  const token = body.get("cf-turnstile-response");

  const result = await verifyTurnstile({
    secretKey: c.env.TURNSTILE_SECRET_KEY,
    token: token as string,
    remoteIp: c.req.header("CF-Connecting-IP"),
  });

  if (!result.success) {
    return c.json({ error: "Verification failed" }, 400);
  }

  // Process form...
});
```

## Testing

Use test keys for development:

```ts
import { TEST_KEYS } from "@repo/security/turnstile";

// Site key (frontend)
const siteKey = TEST_KEYS.siteKey.visible; // Always shows widget

// Secret key (backend)
const secretKey = TEST_KEYS.secretKey.alwaysPass; // Always validates
```

## React Integration

For React apps, use the `@marsidev/react-turnstile` package:

```bash
pnpm add @marsidev/react-turnstile
```

```tsx
import { Turnstile } from "@marsidev/react-turnstile";

function ContactForm() {
  const [token, setToken] = useState("");

  return (
    <form>
      <Turnstile
        siteKey="YOUR_SITE_KEY"
        onSuccess={setToken}
      />
      <input type="hidden" name="cf-turnstile-response" value={token} />
    </form>
  );
}
```

## Resources

- [Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Test Keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
