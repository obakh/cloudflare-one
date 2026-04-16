import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [reactRouter()],
	server: {
		port: 5174,
	},
	ssr: {
		resolve: {
			conditions: ["workerd", "worker", "browser"],
		},
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./app"),
		},
		mainFields: ["browser", "module", "main"],
	},
	build: {
		minify: true,
	},
});
