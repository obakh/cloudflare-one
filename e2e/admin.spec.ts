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

		// Hover over sidebar to expand it
		await page.locator("aside").hover();

		// Wait for expansion animation
		await page.waitForTimeout(300);

		// Check navigation links are present (they're in the nav element)
		const nav = page.locator("nav");
		await expect(nav.locator('a[href="/admin"]')).toBeVisible();
		await expect(nav.locator('a[href="/admin/settings"]')).toBeVisible();
	});

	test("navigates to settings page", async ({ page }) => {
		await page.goto("http://localhost:4322/admin");

		// Hover to expand sidebar
		await page.locator("aside").hover();
		await page.waitForTimeout(300);

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
