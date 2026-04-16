# KV Storage (@repo/storage/kv)

Type-safe utilities for [Cloudflare Workers KV](https://developers.cloudflare.com/kv/).

## Setup

### 1. Add KV Binding to wrangler.toml

```toml
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
```

### 2. TypeScript Types

```ts
export interface Env {
  KV: KVNamespace;
}
```

## Basic Operations

### Get/Put JSON

```ts
import { getJson, putJson } from "@repo/storage/kv";

interface User {
  id: string;
  name: string;
  email: string;
}

// Get
const user = await getJson<User>(env.KV, "user:123");

// Put with TTL
await putJson(env.KV, "user:123", {
  id: "123",
  name: "John",
  email: "john@example.com",
}, { expirationTtl: 3600 }); // 1 hour
```

### Get with Metadata

```ts
import { getJsonWithMetadata } from "@repo/storage/kv";

interface User { name: string }
interface Meta { createdAt: number; version: number }

const { value, metadata } = await getJsonWithMetadata<User, Meta>(env.KV, "user:123");
```

## Caching Patterns

### Get or Set (Cache-aside)

```ts
import { getOrSet } from "@repo/storage/kv";

const user = await getOrSet(env.KV, "user:123", async () => {
  // Only called if not in cache
  return await db.query.users.findFirst({ where: eq(users.id, "123") });
}, { expirationTtl: 3600 });
```

### Stale-While-Revalidate

```ts
import { getOrSetSWR } from "@repo/storage/kv";

const data = await getOrSetSWR(env.KV, "api:data", async () => {
  return await fetchFromAPI();
}, {
  ttl: 60,        // Fresh for 60 seconds
  staleTtl: 3600, // Serve stale for up to 1 hour while revalidating
}, ctx); // Pass ExecutionContext for background refresh
```

## Batch Operations

```ts
import { getMany, putMany, deleteMany } from "@repo/storage/kv";

// Get multiple
const users = await getMany<User>(env.KV, ["user:1", "user:2", "user:3"]);
// { "user:1": { name: "John" }, "user:2": null, "user:3": { name: "Jane" } }

// Put multiple
await putMany(env.KV, {
  "user:1": { name: "John" },
  "user:2": { name: "Jane" },
}, { expirationTtl: 3600 });

// Delete multiple
await deleteMany(env.KV, ["user:1", "user:2", "user:3"]);
```

## Listing Keys

```ts
import { listAll, listAllWithMetadata, countKeys } from "@repo/storage/kv";

// List all keys with prefix (handles pagination)
const userKeys = await listAll(env.KV, { prefix: "user:" });
// ["user:1", "user:2", "user:3", ...]

// List with metadata
const users = await listAllWithMetadata<{ role: string }>(env.KV, { prefix: "user:" });
// [{ name: "user:1", metadata: { role: "admin" } }, ...]

// Count keys
const count = await countKeys(env.KV, "user:");
```

## Namespaced KV

Create a wrapper with automatic key prefixing:

```ts
import { createNamespacedKV } from "@repo/storage/kv";

const userKV = createNamespacedKV(env.KV, "user:");

// All operations automatically prefix keys
await userKV.put("123", { name: "John" });  // Stores "user:123"
const user = await userKV.get("123");       // Gets "user:123"
await userKV.delete("123");                 // Deletes "user:123"

// List returns unprefixed keys
const keys = await userKV.list();           // ["123", "456", ...]

// Check existence
const exists = await userKV.has("123");

// Get or set
const data = await userKV.getOrSet("123", async () => {
  return await fetchUser("123");
}, { expirationTtl: 3600 });
```

## Counters

```ts
import { increment, decrement } from "@repo/storage/kv";

// Increment (creates if doesn't exist)
const views = await increment(env.KV, "page:views:home");

// Increment by amount
const score = await increment(env.KV, "user:123:score", 10);

// Decrement
const remaining = await decrement(env.KV, "quota:user:123");
```

Note: Not truly atomic due to KV's eventual consistency, but works for most use cases.

## Session Storage

```ts
import { createSessionStorage } from "@repo/storage/kv";

interface SessionData {
  userId: string;
  role: string;
  permissions: string[];
}

const sessions = createSessionStorage<SessionData>(env.KV, {
  prefix: "session:",
  ttl: 86400, // 24 hours
});

// Create session
const sessionId = await sessions.create({
  userId: "123",
  role: "admin",
  permissions: ["read", "write"],
});

// Get session
const session = await sessions.get(sessionId);

// Update session
await sessions.update(sessionId, { role: "superadmin" });

// Refresh TTL (extend session)
await sessions.refresh(sessionId);

// Check if exists
const exists = await sessions.exists(sessionId);

// Destroy session
await sessions.destroy(sessionId);
```

## API Reference

### Basic Operations

| Function | Description |
|----------|-------------|
| `getJson<T>(kv, key, options?)` | Get JSON value |
| `putJson<T>(kv, key, value, options?)` | Put JSON value |
| `getJsonWithMetadata<T, M>(kv, key, options?)` | Get value with metadata |

### Caching

| Function | Description |
|----------|-------------|
| `getOrSet<T>(kv, key, compute, options?)` | Get or compute and cache |
| `getOrSetSWR<T>(kv, key, compute, options, ctx?)` | Stale-while-revalidate |

### Batch

| Function | Description |
|----------|-------------|
| `getMany<T>(kv, keys)` | Get multiple values |
| `putMany<T>(kv, entries, options?)` | Put multiple values |
| `deleteMany(kv, keys)` | Delete multiple keys |

### Listing

| Function | Description |
|----------|-------------|
| `listAll(kv, options?)` | List all keys (paginated) |
| `listAllWithMetadata<M>(kv, options?)` | List keys with metadata |
| `countKeys(kv, prefix?)` | Count keys |

### Utilities

| Function | Description |
|----------|-------------|
| `createNamespacedKV(kv, prefix)` | Create prefixed wrapper |
| `increment(kv, key, amount?, options?)` | Increment counter |
| `decrement(kv, key, amount?, options?)` | Decrement counter |
| `createSessionStorage<T>(kv, options?)` | Create session helper |

### Options

```ts
// Put options
interface KVPutOptions {
  expiration?: number;    // Absolute (seconds since epoch)
  expirationTtl?: number; // Relative (seconds from now)
  metadata?: Record<string, unknown>;
}

// Get options
interface KVGetOptions {
  type?: "text" | "json" | "arrayBuffer" | "stream";
  cacheTtl?: number; // Min 60 seconds
}

// List options
interface KVListOptions {
  prefix?: string;
  limit?: number;  // Default 1000
  cursor?: string;
}
```

## Resources

- [KV Documentation](https://developers.cloudflare.com/kv/)
- [KV API Reference](https://developers.cloudflare.com/kv/api/)
- [KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
