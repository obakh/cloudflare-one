import { Hono } from "hono";
import { createRequestHandler } from "react-router";

interface Env {
	ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

// Ignore IDE websocket requests (Kiro notifications)
app.all("/api/notifications/*", (c) => c.text("", 200));

// ============================================
// Auth routes (Better Auth)
// ============================================
// Uncomment after configuring Hyperdrive in wrangler.jsonc:
//
// import { createAuth } from "@repo/auth";
//
// app.on(["GET", "POST"], "/api/auth/*", async (c) => {
//   const auth = createAuth(c.env);
//   return auth.handler(c.req.raw);
// });

// ============================================
// Add your API routes here
// ============================================
// Example:
// app.get("/api/hello", (c) => {
//   return c.json({ message: "Hello from the API!" });
// });

// ============================================
// React Router SSR handler (keep this at the end)
// ============================================
const requestHandler = createRequestHandler(
	async () => (await import("virtual:react-router/server-build")).default,
	import.meta.env.MODE,
);

app.get("*", async (c) => {
	return requestHandler(c.req.raw, {
		cloudflare: { env: c.env, ctx: c.executionCtx },
	});
});

// Static assets fallback
app.all("*", async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default {
	fetch: app.fetch,
};
