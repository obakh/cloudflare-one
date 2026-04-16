/**
 * @repo/db - Shared database utilities for Cloudflare
 *
 * Supports both PostgreSQL (via Hyperdrive) and D1 (SQLite).
 *
 * @example PostgreSQL with Hyperdrive
 * ```ts
 * import { query, queryOne } from "@repo/db/client";
 * import { createDrizzle } from "@repo/db/drizzle";
 *
 * const users = await query(env.HYPERDRIVE, "SELECT * FROM users");
 * const db = createDrizzle(env.HYPERDRIVE, { schema });
 * ```
 *
 * @example D1 SQLite
 * ```ts
 * import { query, queryOne, batch } from "@repo/db/d1";
 * import { createDrizzleD1 } from "@repo/db/d1";
 *
 * const users = await query(env.DB, "SELECT * FROM users");
 * const db = createDrizzleD1(env.DB, { schema });
 * ```
 */

// Re-export PostgreSQL/Hyperdrive utilities
export * from "./client";
export * from "./drizzle";

// Note: D1 utilities available via "@repo/db/d1"
