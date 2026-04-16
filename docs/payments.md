# Payments Package

Stripe payment integration for Cloudflare Workers.

## Setup

### 1. Install and Configure

Add your Stripe secret key to `wrangler.toml`:

```toml
[vars]
# Use wrangler secret for production
# STRIPE_SECRET_KEY = "sk_test_xxx"
# STRIPE_WEBHOOK_SECRET = "whsec_xxx"
```

Set secrets:

```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

### 2. Create Stripe Client

```ts
import { createStripe } from "@repo/payments/stripe";

export default {
  async fetch(request: Request, env: Env) {
    const stripe = createStripe(env.STRIPE_SECRET_KEY);
    // Use stripe client...
  }
};
```

## Checkout Sessions

### Subscription Checkout

```ts
import { createStripe } from "@repo/payments/stripe";
import { createSubscriptionCheckout } from "@repo/payments/stripe/checkout";

const stripe = createStripe(env.STRIPE_SECRET_KEY);

const session = await createSubscriptionCheckout(stripe, {
  priceId: "price_xxx",
  successUrl: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
  cancelUrl: "https://example.com/pricing",
  customerEmail: "user@example.com",
  trialDays: 14,
  allowPromotionCodes: true,
  metadata: { userId: "123" },
});

return Response.redirect(session.url!);
```

### One-Time Payment

```ts
import { createOneTimeCheckout } from "@repo/payments/stripe/checkout";

// Using a price ID
const session = await createOneTimeCheckout(stripe, {
  priceId: "price_xxx",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});

// Using custom amount
const session = await createOneTimeCheckout(stripe, {
  amount: 2999, // $29.99 in cents
  currency: "usd",
  productName: "Premium Feature",
  productDescription: "One-time access to premium features",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});
```

### Multi-Item Checkout

```ts
import { createMultiItemCheckout } from "@repo/payments/stripe/checkout";

const session = await createMultiItemCheckout(stripe, {
  lineItems: [
    { priceId: "price_base", quantity: 1 },
    { priceId: "price_addon", quantity: 2 },
  ],
  mode: "subscription",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});
```

## Customer Portal

```ts
import { createPortalSession } from "@repo/payments/stripe";

const portal = await createPortalSession(stripe, {
  customerId: "cus_xxx",
  returnUrl: "https://example.com/account",
});

return Response.redirect(portal.url);
```

## Webhooks

### Basic Handler

```ts
import { createWebhookHandler } from "@repo/payments/stripe/webhooks";

const handler = createWebhookHandler(env.STRIPE_WEBHOOK_SECRET, {
  "checkout.session.completed": async (event) => {
    const session = event.data.object;
    console.log("Checkout completed:", session.id);
    
    // Provision access, send email, etc.
    await provisionAccess(session.customer, session.subscription);
  },
  
  "customer.subscription.updated": async (event) => {
    const subscription = event.data.object;
    console.log("Subscription updated:", subscription.status);
    
    // Update user's subscription status
    await updateUserSubscription(subscription);
  },
  
  "customer.subscription.deleted": async (event) => {
    const subscription = event.data.object;
    
    // Revoke access
    await revokeAccess(subscription.customer);
  },
  
  "invoice.payment_failed": async (event) => {
    const invoice = event.data.object;
    
    // Notify user of failed payment
    await notifyPaymentFailed(invoice.customer_email);
  },
});

// In your worker
app.post("/webhooks/stripe", (c) => handler(c.req.raw));
```

### With Hono

```ts
import { Hono } from "hono";
import { stripeWebhook } from "@repo/payments/stripe/webhooks";

const app = new Hono<{ Bindings: Env }>();

app.post("/webhooks/stripe", stripeWebhook({
  secret: (c) => c.env.STRIPE_WEBHOOK_SECRET,
  handlers: {
    "checkout.session.completed": async (event) => {
      // Handle checkout
    },
  },
}));
```

## Subscriptions

### Get Subscription

```ts
import {
  getSubscription,
  parseSubscription,
  isSubscriptionActive,
} from "@repo/payments/stripe/subscriptions";

const subscription = await getSubscription(stripe, "sub_xxx");
const info = parseSubscription(subscription);

console.log(info.status);           // "active"
console.log(info.currentPeriodEnd); // Date
console.log(info.cancelAtPeriodEnd); // false

if (isSubscriptionActive(subscription)) {
  // Grant access
}
```

### Update Subscription

```ts
import { updateSubscription } from "@repo/payments/stripe/subscriptions";

// Upgrade/downgrade plan
await updateSubscription(stripe, "sub_xxx", {
  priceId: "price_new",
  prorationBehavior: "create_prorations",
});

// Update quantity
await updateSubscription(stripe, "sub_xxx", {
  quantity: 5,
});
```

### Cancel Subscription

```ts
import { cancelSubscription, resumeSubscription } from "@repo/payments/stripe/subscriptions";

// Cancel at period end (recommended)
await cancelSubscription(stripe, "sub_xxx", {
  atPeriodEnd: true,
});

// Cancel immediately
await cancelSubscription(stripe, "sub_xxx", {
  atPeriodEnd: false,
  cancellationReason: "User requested",
  feedback: "too_expensive",
});

// Resume if canceled at period end
await resumeSubscription(stripe, "sub_xxx");
```

### Pause/Unpause

```ts
import { pauseSubscription, unpauseSubscription } from "@repo/payments/stripe/subscriptions";

// Pause for 30 days
await pauseSubscription(stripe, "sub_xxx", {
  behavior: "mark_uncollectible",
  resumesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});

// Unpause
await unpauseSubscription(stripe, "sub_xxx");
```

## Customers

### Create Customer

```ts
import { createCustomer, getOrCreateCustomer } from "@repo/payments/stripe/customers";

// Create new customer
const customer = await createCustomer(stripe, {
  email: "user@example.com",
  name: "John Doe",
  metadata: { userId: "123" },
});

// Get existing or create new
const customer = await getOrCreateCustomer(stripe, "user@example.com", {
  name: "John Doe",
  metadata: { userId: "123" },
});
```

### Find Customer

```ts
import { findCustomerByEmail, findCustomerByMetadata } from "@repo/payments/stripe/customers";

// By email
const customer = await findCustomerByEmail(stripe, "user@example.com");

// By metadata
const customer = await findCustomerByMetadata(stripe, "userId", "123");
```

### Payment Methods

```ts
import {
  listPaymentMethods,
  attachPaymentMethod,
  setDefaultPaymentMethod,
} from "@repo/payments/stripe/customers";

// List cards
const cards = await listPaymentMethods(stripe, "cus_xxx", "card");

// Attach new payment method
await attachPaymentMethod(stripe, "pm_xxx", "cus_xxx");

// Set as default
await setDefaultPaymentMethod(stripe, "cus_xxx", "pm_xxx");
```

### Invoices

```ts
import { listCustomerInvoices, getUpcomingInvoice } from "@repo/payments/stripe/customers";

// List past invoices
const invoices = await listCustomerInvoices(stripe, "cus_xxx", {
  limit: 10,
  status: "paid",
});

// Get upcoming invoice
const upcoming = await getUpcomingInvoice(stripe, "cus_xxx");
if (upcoming) {
  console.log("Next charge:", upcoming.amount_due / 100);
}
```

## Common Patterns

### Check User Subscription Status

```ts
import { getActiveSubscription, isSubscriptionActive } from "@repo/payments/stripe/subscriptions";
import { findCustomerByMetadata } from "@repo/payments/stripe/customers";

async function hasActiveSubscription(userId: string): Promise<boolean> {
  const customer = await findCustomerByMetadata(stripe, "userId", userId);
  if (!customer) return false;
  
  const subscription = await getActiveSubscription(stripe, customer.id);
  return subscription !== null && isSubscriptionActive(subscription);
}
```

### Middleware for Paid Features

```ts
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/premium/*", async (c, next) => {
  const userId = c.get("userId");
  
  if (!await hasActiveSubscription(userId)) {
    return c.json({ error: "Subscription required" }, 403);
  }
  
  await next();
});
```

## Webhook Events Reference

### Checkout Events
- `checkout.session.completed` - Checkout successful
- `checkout.session.expired` - Checkout expired

### Subscription Events
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `customer.subscription.trial_will_end` - Trial ending soon

### Invoice Events
- `invoice.paid` - Invoice paid successfully
- `invoice.payment_failed` - Payment failed
- `invoice.upcoming` - Invoice coming soon

### Payment Events
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed

## Testing

Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:8787/webhooks/stripe
```

Test cards:
- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3D Secure: `4000002500003155`
