/**
 * PostgreSQL client helpers for Cloudflare Hyperdrive
 *
 * Provides both Pool (for connection reuse) and Client (for single queries)
 */
import pg from "pg";

/**
 * Create a connection pool using Hyperdrive
 * Best for multiple queries or ORM usage (Drizzle)
 */
export function createPool(hyperdrive: Hyperdrive) {
	return new pg.Pool({
		connectionString: hyperdrive.connectionString,
	});
}

/**
 * Create a single client using Hyperdrive
 * Best for one-off queries
 */
export function createClient(hyperdrive: Hyperdrive) {
	return new pg.Client({
		connectionString: hyperdrive.connectionString,
	});
}

/**
 * Run a query and return results
 *
 * @example
 * ```ts
 * const users = await query<User>(env.DB, "SELECT * FROM users WHERE active = $1", [true]);
 * ```
 */
export async function query<T = any>(
	hyperdrive: Hyperdrive,
	sql: string,
	params: any[] = [],
): Promise<T[]> {
	const client = createClient(hyperdrive);
	try {
		await client.connect();
		const result = await client.query(sql, params);
		return result.rows as T[];
	} finally {
		await client.end();
	}
}

/**
 * Run a query and return single result
 *
 * @example
 * ```ts
 * const user = await queryOne<User>(env.DB, "SELECT * FROM users WHERE id = $1", [userId]);
 * ```
 */
export async function queryOne<T = any>(
	hyperdrive: Hyperdrive,
	sql: string,
	params: any[] = [],
): Promise<T | null> {
	const rows = await query<T>(hyperdrive, sql, params);
	return rows[0] || null;
}

/**
 * Run insert/update/delete and return affected count
 *
 * @example
 * ```ts
 * const { rowCount, lastId } = await execute(env.DB, "INSERT INTO users (name) VALUES ($1)", ["John"]);
 * ```
 */
export async function execute(
	hyperdrive: Hyperdrive,
	sql: string,
	params: any[] = [],
): Promise<{ rowCount: number; lastId?: number }> {
	const client = createClient(hyperdrive);
	try {
		await client.connect();
		const result = await client.query(`${sql} RETURNING id`, params);
		return {
			rowCount: result.rowCount || 0,
			lastId: result.rows[0]?.id,
		};
	} finally {
		await client.end();
	}
}
