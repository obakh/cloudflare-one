/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface Env {
	DB: Hyperdrive;
	API_TOKEN: string;
}

declare namespace App {
	interface Locals extends Runtime {}
}
