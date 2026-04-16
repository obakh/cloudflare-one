/**
 * Re-export database utilities from @repo/db
 *
 * This file exists for backwards compatibility.
 * You can also import directly from "@repo/db/client"
 */
export { createClient, createPool, execute, query, queryOne } from "@repo/db/client";
export { createDrizzle } from "@repo/db/drizzle";
