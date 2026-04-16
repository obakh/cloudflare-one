# Feature Flags (@repo/feature-flags)

Simple, type-safe feature flags for Cloudflare Workers with percentage rollouts and user targeting.

## Setup

```bash
pnpm add @repo/feature-flags
```

## Basic Usage

```ts
import { createFeatureFlags } from "@repo/feature-flags";

const flags = createFeatureFlags(env.KV, {
  // Simple boolean
  "new-checkout": true,
  
  // Percentage rollout (50% of users)
  "dark-mode": { enabled: true, rollout: 50 },
  
  // User targeting
  "beta-features": {
    enabled: true,
    rollout: 10,
    allowlist: ["user:123", "user:456"],
    blocklist: ["user:789"],
  },
});

// Check flag
if (await flags.isEnabled("new-checkout")) {
  // Feature is enabled
}

// Check with user context (for rollouts)
if (await flags.isEnabled("dark-mode", { userId: "user:123" })) {
  // User is in the 50% rollout
}
```

## Flag Types

### Simple Boolean

```ts
{
  "feature-name": true  // or false
}
```

### Percentage Rollout

```ts
{
  "feature-name": {
    enabled: true,
    rollout: 25,  // 25% of users
  }
}
```

Rollouts use consistent hashing - the same user always gets the same result.

### User Targeting

```ts
{
  "feature-name": {
    enabled: true,
    rollout: 10,
    allowlist: ["user:vip1", "user:vip2"],  // Always enabled
    blocklist: ["user:blocked"],             // Always disabled
  }
}
```

## KV Overrides

Flags can be overridden at runtime via KV:

```ts
// Override a flag
await flags.setOverride("dark-mode", { enabled: true, rollout: 100 });

// Remove override (revert to default config)
await flags.removeOverride("dark-mode");
```

## Get All Flags

Useful for client-side hydration:

```ts
const allFlags = await flags.getAllFlags({ userId: "user:123" });
// { "new-checkout": true, "dark-mode": false, "beta-features": true }
```

## Hono Middleware

```ts
import { Hono } from "hono";
import { createFlagsMiddleware } from "@repo/feature-flags";

const app = new Hono<{ Variables: { flags: Record<string, boolean> } }>();

app.use("*", createFlagsMiddleware({
  kv: (env) => env.KV,
  config: {
    "new-checkout": true,
    "dark-mode": { enabled: true, rollout: 50 },
  },
  getUserId: (c) => c.get("userId"),
}));

app.get("/", (c) => {
  const flags = c.get("flags");
  return c.json({ darkMode: flags["dark-mode"] });
});
```

## React Integration

### Provider

```tsx
import { FeatureFlagsProvider } from "@repo/feature-flags";

// Server: evaluate flags
const flags = await featureFlags.getAllFlags({ userId });

// Client
function App() {
  return (
    <FeatureFlagsProvider flags={serverFlags}>
      <MyApp />
    </FeatureFlagsProvider>
  );
}
```

### Hooks

```tsx
import { useFeatureFlag, useFeatureFlags } from "@repo/feature-flags";

function MyComponent() {
  // Single flag
  const isDarkMode = useFeatureFlag("dark-mode");
  
  // All flags
  const flags = useFeatureFlags();
  
  return isDarkMode ? <DarkTheme /> : <LightTheme />;
}
```

### Feature Component

```tsx
import { Feature } from "@repo/feature-flags";

// Simple
<Feature flag="new-checkout">
  <NewCheckoutFlow />
</Feature>

// With fallback
<Feature flag="beta-features" fallback={<ComingSoon />}>
  <BetaFeature />
</Feature>
```

## API Reference

### `createFeatureFlags(kv, config)`

| Method | Description |
|--------|-------------|
| `isEnabled(key, context?)` | Check if flag is enabled |
| `evaluate(key, context?)` | Get full evaluation result |
| `getAllFlags(context?)` | Get all flags as boolean map |
| `setOverride(key, definition)` | Override flag in KV |
| `removeOverride(key)` | Remove KV override |

### React

| Export | Description |
|--------|-------------|
| `FeatureFlagsProvider` | Context provider |
| `useFeatureFlag(key)` | Check single flag |
| `useFeatureFlags()` | Get all flags |
| `Feature` | Conditional render component |
