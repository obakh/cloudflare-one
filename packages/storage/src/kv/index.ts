/**
 * Cloudflare Workers KV Utilities
 *
 * Type-safe helpers for working with KV namespaces.
 *
 * @see https://developers.cloudflare.com/kv/
 */

/**
 * KV value types
 */
export type KVValueType = "text" | "json" | "arrayBuffer" | "stream";

/**
 * KV get options
 */
export interface KVGetOptions {
	/** Return type */
	type?: KVValueType;
	/** Cache TTL in seconds (min 60) */
	cacheTtl?: number;
}

/**
 * KV put options
 */
export interface KVPutOptions {
	/** Absolute expiration time (seconds since epoch) */
	expiration?: number;
	/** Relative expiration time (seconds from now) */
	expirationTtl?: number;
	/** Metadata to store with the value (must be JSON serializable) */
	metadata?: Record<string, unknown>;
}

/**
 * KV list options
 */
export interface KVListOptions {
	/** Filter keys by prefix */
	prefix?: string;
	/** Maximum keys to return (default 1000) */
	limit?: number;
	/** Pagination cursor */
	cursor?: string;
}

/**
 * KV list result
 */
export interface KVListResult<M = unknown> {
	keys: Array<{
		name: string;
		expiration?: number;
		metadata?: M;
	}>;
	list_complete: boolean;
	cursor?: string;
}

/**
 * Value with metadata result
 */
export interface KVValueWithMetadata<T, M = unknown> {
	value: T | null;
	metadata: M | null;
}

// ============================================================================
// Type-safe JSON helpers
// ============================================================================

/**
 * Get a JSON value from KV with type safety
 *
 * @example
 * ```ts
 * import { getJson } from "@repo/storage/kv";
 *
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * const user = await getJson<User>(env.KV, "user:123");
 * if (user) {
 *   console.log(user.name);
 * }
 * ```
 */
export async function getJson<T>(
	kv: KVNamespace,
	key: string,
	options?: Omit<KVGetOptions, "type">,
): Promise<T | null> {
	return kv.get<T>(key, { ...options, type: "json" });
}

/**
 * Put a JSON value to KV
 *
 * @example
 * ```ts
 * import { putJson } from "@repo/storage/kv";
 *
 * await putJson(env.KV, "user:123", {
 *   id: "123",
 *   name: "John",
 *   email: "john@example.com",
 * }, { expirationTtl: 3600 });
 * ```
 */
export async function putJson<T>(
	kv: KVNamespace,
	key: string,
	value: T,
	options?: KVPutOptions,
): Promise<void> {
	await kv.put(key, JSON.stringify(value), options);
}

/**
 * Get JSON value with metadata
 *
 * @example
 * ```ts
 * import { getJsonWithMetadata } from "@repo/storage/kv";
 *
 * interface User { name: string }
 * interface Meta { createdAt: number }
 *
 * const { value, metadata } = await getJsonWithMetadata<User, Meta>(env.KV, "user:123");
 * ```
 */
export async function getJsonWithMetadata<T, M = unknown>(
	kv: KVNamespace,
	key: string,
	options?: Omit<KVGetOptions, "type">,
): Promise<KVValueWithMetadata<T, M>> {
	return kv.getWithMetadata<T, M>(key, { ...options, type: "json" });
}

// ============================================================================
// Caching helpers
// ============================================================================

/**
 * Get value from KV or compute and store it if not found
 *
 * @example
 * ```ts
 * import { getOrSet } from "@repo/storage/kv";
 *
 * const user = await getOrSet(env.KV, "user:123", async () => {
 *   // Fetch from database if not in cache
 *   return await db.query.users.findFirst({ where: eq(users.id, "123") });
 * }, { expirationTtl: 3600 });
 * ```
 */
export async function getOrSet<T>(
	kv: KVNamespace,
	key: string,
	compute: () => Promise<T>,
	options?: KVPutOptions,
): Promise<T> {
	const cached = await getJson<T>(kv, key);
	if (cached !== null) {
		return cached;
	}

	const value = await compute();
	await putJson(kv, key, value, options);
	return value;
}

/**
 * Get value from KV or compute with stale-while-revalidate pattern
 * Returns cached value immediately and refreshes in background if stale
 *
 * @example
 * ```ts
 * import { getOrSetSWR } from "@repo/storage/kv";
 *
 * const user = await getOrSetSWR(env.KV, "user:123", async () => {
 *   return await fetchUserFromAPI("123");
 * }, {
 *   ttl: 60,        // Fresh for 60 seconds
 *   staleTtl: 3600, // Serve stale for up to 1 hour while revalidating
 * }, ctx);
 * ```
 */
export async function getOrSetSWR<T>(
	kv: KVNamespace,
	key: string,
	compute: () => Promise<T>,
	options: {
		/** Time in seconds the value is considered fresh */
		ttl: number;
		/** Time in seconds to serve stale value while revalidating */
		staleTtl: number;
	},
	ctx?: ExecutionContext,
): Promise<T> {
	interface CacheEntry<T> {
		value: T;
		cachedAt: number;
	}

	const { ttl, staleTtl } = options;
	const now = Date.now();

	const cached = await getJson<CacheEntry<T>>(kv, key);

	if (cached !== null) {
		const age = (now - cached.cachedAt) / 1000;

		if (age < ttl) {
			// Fresh - return immediately
			return cached.value;
		}

		if (age < staleTtl) {
			// Stale but within staleTtl - return stale and revalidate in background
			const revalidate = async () => {
				const fresh = await compute();
				await putJson<CacheEntry<T>>(
					kv,
					key,
					{ value: fresh, cachedAt: Date.now() },
					{
						expirationTtl: staleTtl,
					},
				);
			};

			if (ctx) {
				ctx.waitUntil(revalidate());
			} else {
				// No context, revalidate synchronously (not ideal but works)
				revalidate().catch(console.error);
			}

			return cached.value;
		}
	}

	// No cache or expired - compute fresh value
	const value = await compute();
	await putJson<CacheEntry<T>>(
		kv,
		key,
		{ value, cachedAt: now },
		{
			expirationTtl: staleTtl,
		},
	);
	return value;
}

// ============================================================================
// Batch operations
// ============================================================================

/**
 * Get multiple JSON values from KV
 *
 * @example
 * ```ts
 * import { getMany } from "@repo/storage/kv";
 *
 * const users = await getMany<User>(env.KV, ["user:1", "user:2", "user:3"]);
 * // { "user:1": { name: "John" }, "user:2": null, "user:3": { name: "Jane" } }
 * ```
 */
export async function getMany<T>(
	kv: KVNamespace,
	keys: string[],
): Promise<Record<string, T | null>> {
	const results = await Promise.all(
		keys.map(async (key) => ({
			key,
			value: await getJson<T>(kv, key),
		})),
	);

	return Object.fromEntries(results.map(({ key, value }) => [key, value]));
}

/**
 * Put multiple JSON values to KV
 *
 * @example
 * ```ts
 * import { putMany } from "@repo/storage/kv";
 *
 * await putMany(env.KV, {
 *   "user:1": { name: "John" },
 *   "user:2": { name: "Jane" },
 * }, { expirationTtl: 3600 });
 * ```
 */
export async function putMany<T>(
	kv: KVNamespace,
	entries: Record<string, T>,
	options?: KVPutOptions,
): Promise<void> {
	await Promise.all(
		Object.entries(entries).map(([key, value]) => putJson(kv, key, value, options)),
	);
}

/**
 * Delete multiple keys from KV
 *
 * @example
 * ```ts
 * import { deleteMany } from "@repo/storage/kv";
 *
 * await deleteMany(env.KV, ["user:1", "user:2", "user:3"]);
 * ```
 */
export async function deleteMany(kv: KVNamespace, keys: string[]): Promise<void> {
	await Promise.all(keys.map((key) => kv.delete(key)));
}

// ============================================================================
// List helpers
// ============================================================================

/**
 * List all keys with a prefix (handles pagination automatically)
 *
 * @example
 * ```ts
 * import { listAll } from "@repo/storage/kv";
 *
 * const userKeys = await listAll(env.KV, { prefix: "user:" });
 * // ["user:1", "user:2", "user:3", ...]
 * ```
 */
export async function listAll(
	kv: KVNamespace,
	options?: Omit<KVListOptions, "cursor">,
): Promise<string[]> {
	const keys: string[] = [];
	let cursor: string | undefined;

	do {
		const result = await kv.list({ ...options, cursor });
		keys.push(...result.keys.map((k) => k.name));
		cursor = result.list_complete ? undefined : result.cursor;
	} while (cursor);

	return keys;
}

/**
 * List all keys with metadata (handles pagination automatically)
 *
 * @example
 * ```ts
 * import { listAllWithMetadata } from "@repo/storage/kv";
 *
 * interface UserMeta { role: string }
 * const users = await listAllWithMetadata<UserMeta>(env.KV, { prefix: "user:" });
 * // [{ name: "user:1", metadata: { role: "admin" } }, ...]
 * ```
 */
export async function listAllWithMetadata<M = unknown>(
	kv: KVNamespace,
	options?: Omit<KVListOptions, "cursor">,
): Promise<Array<{ name: string; expiration?: number; metadata?: M }>> {
	const keys: Array<{ name: string; expiration?: number; metadata?: M }> = [];
	let cursor: string | undefined;

	do {
		const result: KVListResult<M> = await kv.list({ ...options, cursor });
		keys.push(...result.keys);
		cursor = result.list_complete ? undefined : result.cursor;
	} while (cursor);

	return keys;
}

/**
 * Count keys with a prefix
 *
 * @example
 * ```ts
 * import { countKeys } from "@repo/storage/kv";
 *
 * const userCount = await countKeys(env.KV, "user:");
 * console.log(`Total users: ${userCount}`);
 * ```
 */
export async function countKeys(kv: KVNamespace, prefix?: string): Promise<number> {
	const keys = await listAll(kv, { prefix });
	return keys.length;
}

// ============================================================================
// Namespacing / Key prefixing
// ============================================================================

/**
 * Create a namespaced KV wrapper with automatic key prefixing
 *
 * @example
 * ```ts
 * import { createNamespacedKV } from "@repo/storage/kv";
 *
 * const userKV = createNamespacedKV(env.KV, "user:");
 *
 * await userKV.put("123", { name: "John" }); // Actually stores "user:123"
 * const user = await userKV.get("123");      // Actually gets "user:123"
 * ```
 */
export function createNamespacedKV(kv: KVNamespace, prefix: string) {
	const prefixKey = (key: string) => `${prefix}${key}`;

	return {
		/** Get JSON value */
		async get<T>(key: string, options?: Omit<KVGetOptions, "type">): Promise<T | null> {
			return getJson<T>(kv, prefixKey(key), options);
		},

		/** Put JSON value */
		async put<T>(key: string, value: T, options?: KVPutOptions): Promise<void> {
			return putJson(kv, prefixKey(key), value, options);
		},

		/** Delete key */
		async delete(key: string): Promise<void> {
			return kv.delete(prefixKey(key));
		},

		/** Get with metadata */
		async getWithMetadata<T, M = unknown>(
			key: string,
			options?: Omit<KVGetOptions, "type">,
		): Promise<KVValueWithMetadata<T, M>> {
			return getJsonWithMetadata<T, M>(kv, prefixKey(key), options);
		},

		/** List all keys (returns unprefixed keys) */
		async list(options?: Omit<KVListOptions, "prefix">): Promise<string[]> {
			const keys = await listAll(kv, { ...options, prefix });
			return keys.map((k) => k.slice(prefix.length));
		},

		/** Get or set with compute function */
		async getOrSet<T>(key: string, compute: () => Promise<T>, options?: KVPutOptions): Promise<T> {
			return getOrSet(kv, prefixKey(key), compute, options);
		},

		/** Check if key exists */
		async has(key: string): Promise<boolean> {
			const value = await kv.get(prefixKey(key));
			return value !== null;
		},

		/** Get the underlying KV namespace */
		get namespace(): KVNamespace {
			return kv;
		},

		/** Get the prefix */
		get prefix(): string {
			return prefix;
		},
	};
}

// ============================================================================
// Atomic counters
// ============================================================================

/**
 * Increment a counter in KV
 * Note: Not truly atomic due to KV's eventual consistency, but works for most use cases
 *
 * @example
 * ```ts
 * import { increment } from "@repo/storage/kv";
 *
 * const newCount = await increment(env.KV, "page:views:home");
 * console.log(`Page views: ${newCount}`);
 * ```
 */
export async function increment(
	kv: KVNamespace,
	key: string,
	amount = 1,
	options?: KVPutOptions,
): Promise<number> {
	const current = (await getJson<number>(kv, key)) ?? 0;
	const newValue = current + amount;
	await putJson(kv, key, newValue, options);
	return newValue;
}

/**
 * Decrement a counter in KV
 *
 * @example
 * ```ts
 * import { decrement } from "@repo/storage/kv";
 *
 * const remaining = await decrement(env.KV, "quota:user:123");
 * ```
 */
export async function decrement(
	kv: KVNamespace,
	key: string,
	amount = 1,
	options?: KVPutOptions,
): Promise<number> {
	return increment(kv, key, -amount, options);
}

// ============================================================================
// Session storage
// ============================================================================

/**
 * Create a session storage helper
 *
 * @example
 * ```ts
 * import { createSessionStorage } from "@repo/storage/kv";
 *
 * const sessions = createSessionStorage(env.KV, {
 *   prefix: "session:",
 *   ttl: 86400, // 24 hours
 * });
 *
 * // Create session
 * const sessionId = await sessions.create({ userId: "123", role: "admin" });
 *
 * // Get session
 * const session = await sessions.get(sessionId);
 *
 * // Refresh session TTL
 * await sessions.refresh(sessionId);
 *
 * // Destroy session
 * await sessions.destroy(sessionId);
 * ```
 */
export function createSessionStorage<T extends Record<string, unknown>>(
	kv: KVNamespace,
	options: {
		prefix?: string;
		ttl?: number;
	} = {},
) {
	const { prefix = "session:", ttl = 86400 } = options;
	const prefixKey = (id: string) => `${prefix}${id}`;

	return {
		/** Create a new session */
		async create(data: T): Promise<string> {
			const id = crypto.randomUUID();
			await putJson(kv, prefixKey(id), data, { expirationTtl: ttl });
			return id;
		},

		/** Get session data */
		async get(id: string): Promise<T | null> {
			return getJson<T>(kv, prefixKey(id));
		},

		/** Update session data */
		async update(id: string, data: Partial<T>): Promise<boolean> {
			const existing = await getJson<T>(kv, prefixKey(id));
			if (!existing) return false;

			await putJson(kv, prefixKey(id), { ...existing, ...data }, { expirationTtl: ttl });
			return true;
		},

		/** Refresh session TTL */
		async refresh(id: string): Promise<boolean> {
			const existing = await getJson<T>(kv, prefixKey(id));
			if (!existing) return false;

			await putJson(kv, prefixKey(id), existing, { expirationTtl: ttl });
			return true;
		},

		/** Destroy session */
		async destroy(id: string): Promise<void> {
			await kv.delete(prefixKey(id));
		},

		/** Check if session exists */
		async exists(id: string): Promise<boolean> {
			const value = await kv.get(prefixKey(id));
			return value !== null;
		},
	};
}
