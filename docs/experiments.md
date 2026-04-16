# Experiments (@repo/experiments)

A/B testing and experimentation for Cloudflare Workers with consistent user bucketing.

## Setup

```bash
pnpm add @repo/experiments
```

## Basic Usage

```ts
import { createExperiments } from "@repo/experiments";

const experiments = createExperiments({
  "checkout-flow": {
    variants: [
      { id: "control", weight: 50 },
      { id: "new-checkout", weight: 50 },
    ],
  },
  "pricing-page": {
    variants: [
      { id: "control", weight: 34 },
      { id: "variant-a", weight: 33 },
      { id: "variant-b", weight: 33 },
    ],
  },
});

// Get variant (consistent for same user)
const variant = experiments.getVariant("checkout-flow", { userId: "user:123" });
// "control" or "new-checkout"

// Check specific variant
if (experiments.isVariant("checkout-flow", "new-checkout", { userId })) {
  // Show new checkout
}
```

## Experiment Configuration

### Simple A/B Test

```ts
{
  "experiment-name": {
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 },
    ],
  }
}
```

### Multivariate Test

```ts
{
  "experiment-name": {
    variants: [
      { id: "control", weight: 25 },
      { id: "variant-a", weight: 25 },
      { id: "variant-b", weight: 25 },
      { id: "variant-c", weight: 25 },
    ],
  }
}
```

### With Targeting

```ts
{
  "experiment-name": {
    active: true,  // Set to false to disable
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 },
    ],
    allowlist: ["user:beta1"],  // Always gets treatment
    blocklist: ["user:vip"],    // Always gets control
  }
}
```

## Cookie-Based A/B Testing (Edge)

For edge-side routing without user IDs:

```ts
import { getOrAssignVariant } from "@repo/experiments";

export default {
  async fetch(request) {
    const { variant, cookie, isNew } = getOrAssignVariant(request, {
      experimentId: "checkout-flow",
      variants: ["control", "new-checkout"],
      weights: [50, 50],  // Optional, defaults to equal
      cookieName: "exp_checkout",  // Optional
      cookieMaxAge: 30 * 24 * 60 * 60,  // 30 days
    });
    
    // Route based on variant
    const url = new URL(request.url);
    if (variant === "new-checkout") {
      url.pathname = "/new" + url.pathname;
    }
    
    const response = await fetch(url);
    
    // Set cookie for new assignments
    if (cookie) {
      const res = new Response(response.body, response);
      res.headers.append("Set-Cookie", cookie);
      return res;
    }
    
    return response;
  },
};
```

## Get All Assignments

```ts
const assignments = experiments.getAllAssignments({ userId: "user:123" });
// { "checkout-flow": "new-checkout", "pricing-page": "variant-a" }
```

## Hono Middleware

```ts
import { Hono } from "hono";
import { createExperimentsMiddleware } from "@repo/experiments";

const app = new Hono();

app.use("*", createExperimentsMiddleware({
  config: {
    "checkout-flow": {
      variants: [
        { id: "control", weight: 50 },
        { id: "new-checkout", weight: 50 },
      ],
    },
  },
  getUserId: (c) => c.get("userId") ?? c.req.header("x-user-id"),
}));

app.get("/checkout", (c) => {
  const experiments = c.get("experiments");
  
  if (experiments["checkout-flow"] === "new-checkout") {
    return c.json({ checkout: "new" });
  }
  return c.json({ checkout: "old" });
});
```

## React Integration

### Provider

```tsx
import { ExperimentsProvider } from "@repo/experiments";

// Server: compute assignments
const assignments = experiments.getAllAssignments({ userId });

// Client
function App() {
  return (
    <ExperimentsProvider assignments={serverAssignments}>
      <MyApp />
    </ExperimentsProvider>
  );
}
```

### Hooks

```tsx
import { useExperiment, useVariant, useExperiments } from "@repo/experiments";

function CheckoutPage() {
  // Get variant
  const variant = useExperiment("checkout-flow");
  
  // Check specific variant
  const isNewCheckout = useVariant("checkout-flow", "new-checkout");
  
  // All assignments
  const experiments = useExperiments();
  
  if (isNewCheckout) {
    return <NewCheckout />;
  }
  return <OldCheckout />;
}
```

### Experiment Component

```tsx
import { Experiment } from "@repo/experiments";

<Experiment
  id="checkout-flow"
  variants={{
    control: <OldCheckout />,
    "new-checkout": <NewCheckout />,
  }}
/>

// With fallback
<Experiment
  id="pricing-page"
  variants={{
    control: <PricingControl />,
    "variant-a": <PricingA />,
    "variant-b": <PricingB />,
  }}
  fallback={<PricingControl />}
/>
```

## Tracking Experiment Exposure

Integrate with analytics to track which users saw which variants:

```ts
import { track } from "@repo/analytics/client";

// After getting variant
const variant = experiments.getVariant("checkout-flow", { userId });

// Track exposure
track("experiment_exposure", {
  experiment_id: "checkout-flow",
  variant_id: variant,
  user_id: userId,
});
```

## API Reference

### `createExperiments(config)`

| Method | Description |
|--------|-------------|
| `getVariant(id, context)` | Get variant ID for user |
| `isVariant(id, variantId, context)` | Check if user is in variant |
| `assign(id, context)` | Get full assignment with reason |
| `getAllAssignments(context)` | Get all experiment assignments |

### `getOrAssignVariant(request, options)`

Cookie-based assignment for edge routing.

| Option | Description |
|--------|-------------|
| `experimentId` | Experiment identifier |
| `variants` | Array of variant IDs |
| `weights` | Optional weights (defaults to equal) |
| `cookieName` | Cookie name (default: `exp_{id}`) |
| `cookieMaxAge` | Cookie max age in seconds |

### React

| Export | Description |
|--------|-------------|
| `ExperimentsProvider` | Context provider |
| `useExperiment(id)` | Get variant for experiment |
| `useVariant(id, variantId)` | Check if in specific variant |
| `useExperiments()` | Get all assignments |
| `Experiment` | Render based on variant |
