/**
 * Better Auth CLI configuration
 * Used for generating schema: pnpm better-auth:generate
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { authOptions } from "./src/options";

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export const auth = betterAuth({
	...authOptions,
	database: drizzleAdapter(db, { provider: "pg" }),
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
	secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
});
