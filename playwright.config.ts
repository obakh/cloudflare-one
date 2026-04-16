import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: [
		{
			command: "pnpm --filter @repo/web dev",
			url: "http://localhost:5173",
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
		},
		{
			command: "pnpm --filter @repo/blog dev",
			url: "http://localhost:4321",
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
		},
		{
			command: "pnpm --filter @repo/admin dev",
			url: "http://localhost:4322",
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
		},
	],
});
