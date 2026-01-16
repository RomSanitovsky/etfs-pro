import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the ETFs Pro Tracker header", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ETFs Pro Tracker/);

    const header = page.getByRole("heading", { name: /ETFs Pro Tracker/i });
    await expect(header).toBeVisible();
  });

  test("should display the subtitle", async ({ page }) => {
    await page.goto("/");

    const subtitle = page.getByText(/Track your investments against all-time highs/i);
    await expect(subtitle).toBeVisible();
  });

  test("should display the watchlist table", async ({ page }) => {
    await page.goto("/");

    // Check for table headers
    await expect(page.getByText("Symbol")).toBeVisible();
    await expect(page.getByText("Price")).toBeVisible();
    await expect(page.getByText("All-Time High")).toBeVisible();
    await expect(page.getByText("% Down")).toBeVisible();
    await expect(page.getByText("% to ATH")).toBeVisible();
  });

  test("should display search input", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder(/Search symbols/i);
    await expect(searchInput).toBeVisible();
  });

  test("should display add symbol form", async ({ page }) => {
    await page.goto("/");

    const addInput = page.getByPlaceholder(/Add symbol/i);
    await expect(addInput).toBeVisible();

    const addButton = page.getByRole("button", { name: /Add/i });
    await expect(addButton).toBeVisible();
  });
});
