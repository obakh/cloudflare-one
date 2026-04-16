import { expect, test } from "@playwright/test";

const WEB_URL = "http://localhost:5173";

test.describe("Web App (@repo/web)", () => {
	test("should render the home page", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check main heading
		await expect(page.getByRole("heading", { name: "Monorepo Template" })).toBeVisible();

		// Check description text
		await expect(page.getByText("A scalable monorepo with React Router 7")).toBeVisible();
	});

	test("should have working navigation links", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check Turborepo docs link
		const turboLink = page.getByRole("link", { name: "Turborepo Docs" });
		await expect(turboLink).toBeVisible();
		await expect(turboLink).toHaveAttribute("href", "https://turbo.build/repo/docs");

		// Check React Router docs link
		const reactRouterLink = page.getByRole("link", { name: "React Router Docs" });
		await expect(reactRouterLink).toBeVisible();
		await expect(reactRouterLink).toHaveAttribute("href", "https://reactrouter.com/");
	});

	test("should display project structure", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check project structure section
		await expect(page.getByRole("heading", { name: "Project Structure" })).toBeVisible();

		// Check that structure shows key directories
		await expect(page.getByText("apps/")).toBeVisible();
		await expect(page.getByText("packages/")).toBeVisible();
	});

	test("should display quick start section", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check quick start section
		await expect(page.getByRole("heading", { name: "Quick Start" })).toBeVisible();

		// Check some quick start items
		await expect(page.getByText("Add routes in")).toBeVisible();
		await expect(page.getByText("Add shared components in")).toBeVisible();
	});

	test("should show shared package usage note", async ({ page }) => {
		await page.goto(WEB_URL);

		// Check that it mentions using shared packages
		await expect(page.getByText("@repo/ui")).toBeVisible();
		await expect(page.getByText("@repo/utils")).toBeVisible();
	});
});
