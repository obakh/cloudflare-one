# Analytics Package (@repo/analytics)

Type-safe wrapper around [Cloudflare Zaraz](https://developers.cloudflare.com/zaraz/) for analytics tracking.

## Overview

Zaraz runs third-party tools (Google Analytics, Facebook Pixel, etc.) server-side on Cloudflare's edge, eliminating client-side script bloat. This package provides:

- **Client API** - `zaraz.track()`, `zaraz.set()`, `zaraz.ecommerce()` wrappers
- **Server API** - HTTP Events API for server-side tracking
- **Consent** - React hooks for Zaraz consent management

## Setup

### 1. Enable Zaraz in Cloudflare Dashboard

1. Go to your zone in Cloudflare Dashboard
2. Navigate to **Zaraz** > **Tools**
3. Add your analytics tools (GA4, Facebook Pixel, etc.)
4. Configure triggers and actions

### 2. Install Package

```bash
pnpm add @repo/analytics
```

## Client-Side Usage

### Track Events

```ts
import { track, set } from "@repo/analytics/client";

// Set persistent variables (sent with every track call)
set("user_type", "premium");
set("experiment_variant", "A");

// Track custom events
track("button_click", { button_id: "cta" });
track("form_submit", { form_name: "contact" });

// Events are async - await if needed
await track("signup_complete", { method: "email" });
```

### E-commerce Tracking

```ts
import { ecommerce, trackProductView, trackAddToCart, trackPurchase } from "@repo/analytics/client";

// Product viewed
await trackProductView({
  product_id: "SKU123",
  name: "T-Shirt",
  price: 29.99,
  category: "Apparel",
});

// Add to cart
await trackAddToCart({
  product_id: "SKU123",
  name: "T-Shirt",
  price: 29.99,
}, 2); // quantity

// Purchase complete
await trackPurchase({
  order_id: "ORD-12345",
  total: 64.97,
  revenue: 59.98,
  shipping: 4.99,
  currency: "USD",
  products: [
    { product_id: "SKU123", name: "T-Shirt", price: 29.99, quantity: 2 },
  ],
});

// Or use the generic ecommerce function
await ecommerce("Product List Viewed", {
  list_id: "homepage_featured",
  products: [
    { product_id: "SKU1", name: "Item 1", price: 19.99 },
    { product_id: "SKU2", name: "Item 2", price: 29.99 },
  ],
});
```

### Supported E-commerce Events

- `Product List Viewed`
- `Products Searched`
- `Product Clicked`
- `Product Added`
- `Product Added to Wishlist`
- `Product Removed`
- `Product Viewed`
- `Cart Viewed`
- `Checkout Started`
- `Checkout Step Viewed`
- `Checkout Step Completed`
- `Payment Info Entered`
- `Order Completed`
- `Order Updated`
- `Order Refunded`
- `Order Cancelled`

### Debug Mode

```ts
import { setDebug } from "@repo/analytics/client";

// Enable in development
setDebug(import.meta.env.DEV);
```

## Server-Side Usage (Cloudflare Workers)

Use the HTTP Events API to track events from the server without client-side JavaScript.

```ts
import { createServerAnalytics, extractClientInfo } from "@repo/analytics/server";

const analytics = createServerAnalytics({
  domain: "example.com",
  debug: true,
});

export default {
  async fetch(request, env, ctx) {
    const clientInfo = extractClientInfo(request);
    
    // Track in background (non-blocking)
    ctx.waitUntil(
      analytics.track("page_view", { page_path: "/home" }, clientInfo)
    );
    
    return new Response("OK");
  },
};
```

### Hono Middleware

```ts
import { Hono } from "hono";
import { createAnalyticsMiddleware } from "@repo/analytics/server";

const app = new Hono();

// Auto-track page views
app.use("*", createAnalyticsMiddleware({
  domain: "example.com",
  excludePaths: ["/api/", "/health", "/_"],
  getOnly: true, // Only track GET requests
}));
```

## Consent Management

Zaraz has built-in consent management. This package provides React hooks to work with it.

### Setup Provider

```tsx
import { ConsentProvider } from "@repo/analytics/consent";

function App() {
  return (
    <ConsentProvider onConsentChange={(c) => console.log("Consent:", c)}>
      <MyApp />
    </ConsentProvider>
  );
}
```

### Consent Banner

```tsx
import { useConsent, CONSENT_PURPOSES } from "@repo/analytics/consent";

function ConsentBanner() {
  const { hasDecided, acceptAll, rejectAll, setConsent } = useConsent();
  
  if (hasDecided) return null;
  
  return (
    <div className="consent-banner">
      <p>We use cookies to improve your experience.</p>
      <div>
        <button onClick={acceptAll}>Accept All</button>
        <button onClick={rejectAll}>Reject All</button>
        <button onClick={() => {
          setConsent(CONSENT_PURPOSES.ANALYTICS, true);
          setConsent(CONSENT_PURPOSES.MARKETING, false);
        }}>
          Customize
        </button>
      </div>
    </div>
  );
}
```

### Check Consent

```tsx
import { useConsentPurpose, CONSENT_PURPOSES } from "@repo/analytics/consent";

function MarketingFeature() {
  const hasMarketing = useConsentPurpose(CONSENT_PURPOSES.MARKETING);
  
  if (!hasMarketing) {
    return <p>Enable marketing cookies to see personalized content.</p>;
  }
  
  return <PersonalizedContent />;
}
```

### Consent Purposes

| Purpose | Description |
|---------|-------------|
| `necessary` | Essential functionality (always enabled) |
| `analytics` | Analytics and performance tracking |
| `marketing` | Marketing and advertising |
| `personalization` | Personalization and preferences |

## Zaraz Dashboard Configuration

### Adding Google Analytics 4

1. Go to **Zaraz** > **Tools** > **Add Tool**
2. Select **Google Analytics 4**
3. Enter your Measurement ID (G-XXXXXXXX)
4. Configure triggers (e.g., "Pageview" on all pages)

### Adding Facebook Pixel

1. Go to **Zaraz** > **Tools** > **Add Tool**
2. Select **Facebook Pixel**
3. Enter your Pixel ID
4. Map events (e.g., `purchase` → `Purchase`)

### Custom Actions

Create custom actions to respond to `track()` calls:

1. Go to **Zaraz** > **Tools** > Select tool
2. Click **Add Action**
3. Set trigger to "Match rule" with `{{ client.__zarazTrack }}` equals your event name
4. Configure the action (e.g., send event to GA4)

## API Reference

### Client

| Function | Description |
|----------|-------------|
| `track(event, props?)` | Track custom event |
| `set(key, value)` | Set persistent variable |
| `ecommerce(event, data?)` | Track e-commerce event |
| `setDebug(enabled)` | Enable/disable debug logging |
| `trackProductView(product)` | Track product view |
| `trackAddToCart(product, qty?)` | Track add to cart |
| `trackRemoveFromCart(product, qty?)` | Track remove from cart |
| `trackCheckoutStarted(data)` | Track checkout start |
| `trackPurchase(data)` | Track purchase |

### Server

| Function | Description |
|----------|-------------|
| `createServerAnalytics(config)` | Create server analytics client |
| `extractClientInfo(request)` | Extract client info from request |
| `createAnalyticsMiddleware(config)` | Hono middleware for auto-tracking |

### Consent

| Function | Description |
|----------|-------------|
| `getConsent(purpose)` | Check consent for purpose |
| `setConsent(purpose, granted)` | Set consent for purpose |
| `getAllConsent()` | Get all consent statuses |
| `setAllConsent(consents)` | Set multiple consents |
| `useConsent()` | React hook for consent state |
| `useConsentPurpose(purpose)` | React hook for specific purpose |

## Resources

- [Zaraz Documentation](https://developers.cloudflare.com/zaraz/)
- [Zaraz Web API](https://developers.cloudflare.com/zaraz/web-api/)
- [Zaraz HTTP Events API](https://developers.cloudflare.com/zaraz/http-events-api/)
- [Zaraz Consent Management](https://developers.cloudflare.com/zaraz/consent-management/)
