/**
 * Drizzle Kit configuration
 *
 * Set DATABASE_URL in your environment before running migrations:
 * export DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
