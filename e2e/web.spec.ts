import { expect, test } from "@playwright/test";

const WEB_URL = "http://localhost:5173";

test.describe("Web App (@repo/web)", () => {
	test("should render the home page", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check that the page loads
		await expect(page.locator("main")).toBeVisible();

		// Check header is present
		await expect(page.locator("header")).toBeVisible();
	});

	test("should have navigation links in header", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check that header has navigation
		const header = page.locator("header");
		await expect(header).toBeVisible();

		// Check for Apps dropdown or navigation links
		const navElements = header.locator("nav, button, a");
		const count = await navElements.count();
		expect(count).toBeGreaterThan(0);
	});

	test("should have footer", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check footer is present
		await expect(page.locator("footer")).toBeVisible();
	});

	test("should have GitHub link", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check for GitHub link
		const githubLink = page.getByRole("link", { name: /github/i });
		await expect(githubLink.first()).toBeVisible();
	});
});
