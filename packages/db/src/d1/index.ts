/**
 * D1 SQLite database helpers
 *
 * Type-safe wrappers around Cloudflare D1 with batch operations,
 * transaction support, and Drizzle ORM integration.
 */

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Execute a query and return all results
 *
 * @example
 * ```ts
 * const users = await query<User>(env.DB, "SELECT * FROM users WHERE active = ?", [1]);
 * ```
 */
export async function query<T = Record<string, unknown>>(
	db: D1Database,
	sql: string,
	params: unknown[] = [],
): Promise<T[]> {
	const stmt = db.prepare(sql).bind(...params);
	const result = await stmt.all<T>();
	return result.results;
}

/**
 * Execute a query and return first result
 *
 * @example
 * ```ts
 * const user = await queryOne<User>(env.DB, "SELECT * FROM users WHERE id = ?", [userId]);
 * ```
 */
export async function queryOne<T = Record<string, unknown>>(
	db: D1Database,
	sql: string,
	params: unknown[] = [],
): Promise<T | null> {
	const stmt = db.prepare(sql).bind(...params);
	return stmt.first<T>();
}

/**
 * Execute INSERT/UPDATE/DELETE and return metadata
 *
 * @example
 * ```ts
 * const { changes, lastRowId } = await execute(env.DB, "INSERT INTO users (name) VALUES (?)", ["John"]);
 * ```
 */
export async function execute(
	db: D1Database,
	sql: string,
	params: unknown[] = [],
): Promise<{ changes: number; lastRowId: number; duration: number }> {
	const stmt = db.prepare(sql).bind(...params);
	const result = await stmt.run();
	return {
		changes: result.meta.changes,
		lastRowId: result.meta.last_row_id,
		duration: result.meta.duration,
	};
}

/**
 * Execute raw SQL (useful for DDL statements)
 *
 * @example
 * ```ts
 * await raw(env.DB, "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)");
 * ```
 */
export async function raw(
	db: D1Database,
	sql: string,
): Promise<{ count: number; duration: number }> {
	const result = await db.exec(sql);
	return { count: result.count ?? 0, duration: result.duration ?? 0 };
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Execute multiple statements in a single round-trip
 * All statements run in an implicit transaction
 *
 * @example
 * ```ts
 * const [users, posts] = await batch(env.DB, [
 *   { sql: "SELECT * FROM users", params: [] },
 *   { sql: "SELECT * FROM posts WHERE user_id = ?", params: [1] },
 * ]);
 * ```
 */
export async function batch<T extends unknown[] = unknown[]>(
	db: D1Database,
	statements: Array<{ sql: string; params?: unknown[] }>,
): Promise<D1Result<T[number]>[]> {
	const prepared = statements.map(({ sql, params = [] }) => db.prepare(sql).bind(...params));
	return db.batch(prepared);
}

/**
 * Insert multiple rows efficiently
 *
 * @example
 * ```ts
 * await batchInsert(env.DB, "users", [
 *   { name: "Alice", email: "alice@example.com" },
 *   { name: "Bob", email: "bob@example.com" },
 * ]);
 * ```
 */
export async function batchInsert<T extends Record<string, unknown>>(
	db: D1Database,
	table: string,
	rows: T[],
): Promise<{ changes: number }> {
	if (rows.length === 0) return { changes: 0 };

	const columns = Object.keys(rows[0]);
	const placeholders = columns.map(() => "?").join(", ");
	const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;

	const statements = rows.map((row) => ({
		sql,
		params: columns.map((col) => row[col]),
	}));

	const results = await batch(db, statements);
	const changes = results.reduce((sum, r) => sum + (r.meta?.changes || 0), 0);
	return { changes };
}

// ============================================================================
// Transaction Helper
// ============================================================================

/**
 * Execute statements in an explicit transaction
 * Automatically rolls back on error
 *
 * @example
 * ```ts
 * await transaction(env.DB, async (tx) => {
 *   await tx.execute("INSERT INTO users (name) VALUES (?)", ["John"]);
 *   await tx.execute("INSERT INTO profiles (user_id) VALUES (last_insert_rowid())");
 * });
 * ```
 */
export async function transaction<T>(
	db: D1Database,
	fn: (tx: TransactionContext) => Promise<T>,
): Promise<T> {
	const statements: Array<{ sql: string; params: unknown[] }> = [];

	const tx: TransactionContext = {
		execute(sql: string, params: unknown[] = []) {
			statements.push({ sql, params });
		},
	};

	// Collect all statements
	const result = await fn(tx);

	// Execute as batch (implicit transaction)
	if (statements.length > 0) {
		await batch(db, statements);
	}

	return result;
}

export interface TransactionContext {
	execute(sql: string, params?: unknown[]): void;
}

// ============================================================================
// Drizzle Integration
// ============================================================================

/**
 * Create a Drizzle instance for D1
 *
 * @example
 * ```ts
 * import { createDrizzleD1 } from "@repo/db/d1";
 * import * as schema from "./schema";
 *
 * const db = createDrizzleD1(env.DB, { schema });
 * const users = await db.select().from(schema.users);
 * ```
 */
export async function createDrizzleD1<
	TSchema extends Record<string, unknown> = Record<string, never>,
>(d1: D1Database, config?: { schema: TSchema }) {
	const { drizzle } = await import("drizzle-orm/d1");
	return config ? drizzle(d1, config) : drizzle(d1);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a table exists
 */
export async function tableExists(db: D1Database, tableName: string): Promise<boolean> {
	const result = await queryOne<{ name: string }>(
		db,
		"SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
		[tableName],
	);
	return result !== null;
}

/**
 * Get table schema info
 */
export async function getTableInfo(
	db: D1Database,
	tableName: string,
): Promise<
	Array<{
		cid: number;
		name: string;
		type: string;
		notnull: number;
		dflt_value: unknown;
		pk: number;
	}>
> {
	return query(db, `PRAGMA table_info(${tableName})`);
}

/**
 * Count rows in a table
 */
export async function count(
	db: D1Database,
	table: string,
	where?: string,
	params: unknown[] = [],
): Promise<number> {
	const sql = where
		? `SELECT COUNT(*) as count FROM ${table} WHERE ${where}`
		: `SELECT COUNT(*) as count FROM ${table}`;
	const result = await queryOne<{ count: number }>(db, sql, params);
	return result?.count ?? 0;
}

/**
 * Simple pagination helper
 */
export async function paginate<T = Record<string, unknown>>(
	db: D1Database,
	sql: string,
	params: unknown[] = [],
	options: { page: number; perPage: number } = { page: 1, perPage: 20 },
): Promise<{ data: T[]; page: number; perPage: number; hasMore: boolean }> {
	const { page, perPage } = options;
	const offset = (page - 1) * perPage;

	// Fetch one extra to check if there are more
	const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
	const results = await query<T>(db, paginatedSql, [...params, perPage + 1, offset]);

	const hasMore = results.length > perPage;
	const data = hasMore ? results.slice(0, perPage) : results;

	return { data, page, perPage, hasMore };
}
