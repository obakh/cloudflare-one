import { createRequestHandler } from "react-router";
import type { AppLoadContext } from "react-router";

import * as build from "virtual:react-router/server-build";

interface Env {
	// Add your Cloudflare bindings here
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const loadContext: AppLoadContext = {
			cloudflare: { env, ctx },
		};
		const handler = createRequestHandler(build, "production");
		return handler(request, loadContext);
	},
};
