/**
 * Drizzle ORM helpers for Cloudflare Hyperdrive
 */
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { createPool } from "../client";

export type { NodePgDatabase } from "drizzle-orm/node-postgres";
// Re-export drizzle-orm for convenience
export { drizzle } from "drizzle-orm/node-postgres";

/**
 * Create a Drizzle instance using Hyperdrive
 *
 * @example
 * ```ts
 * import { createDrizzle } from "@repo/db/drizzle";
 * import * as schema from "./schema";
 *
 * const db = createDrizzle(env.DB, { schema });
 * const users = await db.select().from(schema.users);
 * ```
 */
export function createDrizzle<TSchema extends Record<string, unknown> = Record<string, never>>(
	hyperdrive: Hyperdrive,
	config?: { schema: TSchema },
): NodePgDatabase<TSchema> {
	const pool = createPool(hyperdrive);
	if (config) {
		return drizzle(pool, config) as NodePgDatabase<TSchema>;
	}
	return drizzle(pool) as NodePgDatabase<TSchema>;
}
