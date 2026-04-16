import { expect, test } from "@playwright/test";

const BLOG_URL = "http://localhost:4321";

test.describe("Blog App (@repo/blog)", () => {
	test("should render the home page", async ({ page }) => {
		await page.goto(BLOG_URL);

		// Check site title in header
		await expect(page.getByRole("link", { name: "My Blog" })).toBeVisible();

		// Check navigation links
		await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Blog", exact: true })).toBeVisible();
		await expect(page.getByRole("link", { name: "About" })).toBeVisible();

		// Check welcome heading
		await expect(page.getByRole("heading", { name: "Welcome to My Blog" })).toBeVisible();
	});

	test("should navigate to blog listing", async ({ page }) => {
		await page.goto(BLOG_URL);

		// Click on Blog link
		await page.getByRole("link", { name: "Blog", exact: true }).click();

		// Should show blog posts
		await expect(page.getByRole("link", { name: /Markdown Style Guide/ })).toBeVisible();
	});

	test("should navigate to about page", async ({ page }) => {
		await page.goto(BLOG_URL);

		// Click on About link
		await page.getByRole("link", { name: "About" }).click();

		// Should show about page content
		await expect(page.getByRole("heading", { name: "About Me" })).toBeVisible();
	});

	test("should display blog posts on blog page", async ({ page }) => {
		await page.goto(`${BLOG_URL}/blog`);

		// Check that blog posts are visible
		await expect(page.getByRole("link", { name: /First post/ })).toBeVisible();
		await expect(page.getByRole("link", { name: /Second post/ })).toBeVisible();
		await expect(page.getByRole("link", { name: /Third post/ })).toBeVisible();
	});

	test("should open a blog post", async ({ page }) => {
		await page.goto(`${BLOG_URL}/blog`);

		// Click on a blog post
		await page.getByRole("link", { name: /Markdown Style Guide/ }).click();

		// Should show the blog post content
		await expect(page.getByRole("heading", { name: "Markdown Style Guide" })).toBeVisible();

		// Should have navigation back
		await expect(page.getByRole("link", { name: "My Blog" })).toBeVisible();
	});

	test("should have RSS feed available", async ({ page }) => {
		const response = await page.goto(`${BLOG_URL}/rss.xml`);

		// RSS feed should return successfully
		expect(response?.status()).toBe(200);

		// Should be XML content
		const contentType = response?.headers()["content-type"];
		expect(contentType).toContain("xml");
	});
});
