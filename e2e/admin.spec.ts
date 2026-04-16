import { expect, test } from "@playwright/test";

test.describe("Admin App", () => {
	test("redirects to admin dashboard", async ({ page }) => {
		await page.goto("http://localhost:4322/");
		await expect(page).toHaveURL(/\/admin/);
	});

	test("shows dashboard with navigation", async ({ page }) => {
		await page.goto("http://localhost:4322/admin");

		// Check page title
		await expect(page.locator("h2")).toContainText("Dashboard");

		// Check navigation links
		await expect(page.locator("nav")).toContainText("Dashboard");
		await expect(page.locator("nav")).toContainText("Settings");
	});

	test("navigates to settings page", async ({ page }) => {
		await page.goto("http://localhost:4322/admin");

		await page.click('a[href="/admin/settings"]');

		await expect(page).toHaveURL(/\/admin\/settings/);
		await expect(page.locator("h2")).toContainText("Settings");
	});

	test("has theme toggle button", async ({ page }) => {
		await page.goto("http://localhost:4322/admin");

		const themeToggle = page.locator("#theme-toggle");
		await expect(themeToggle).toBeVisible();
	});

	test("theme toggle works", async ({ page }) => {
		await page.goto("http://localhost:4322/admin");

		// Click theme toggle
		await page.click("#theme-toggle");

		// Check if dark class is toggled on html element
		const html = page.locator("html");
		const hasDark = await html.evaluate((el) => el.classList.contains("dark"));

		// Toggle again
		await page.click("#theme-toggle");
		const hasDarkAfter = await html.evaluate((el) => el.classList.contains("dark"));

		// Should have toggled
		expect(hasDark).not.toBe(hasDarkAfter);
	});
});
