import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [react()],
	// Prevent vite from obscuring rust errors
	clearScreen: false,
	// Tauri expects a fixed port
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// Ignore src-tauri directory
			ignored: ["**/src-tauri/**"],
		},
	},
	// Environment variables
	envPrefix: ["VITE_", "TAURI_"],
});
