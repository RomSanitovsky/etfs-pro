import { test, expect } from "@playwright/test";

test.describe("Watchlist Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test("should filter stocks when searching", async ({ page }) => {
    await page.goto("/");

    // Wait for table to load
    await page.waitForSelector("table tbody tr");

    const searchInput = page.getByPlaceholder(/Search symbols/i);
    await searchInput.fill("VOO");

    // Should show only VOO
    const rows = page.locator("table tbody tr");
    const visibleRows = await rows.filter({ hasText: "VOO" }).count();
    expect(visibleRows).toBeGreaterThanOrEqual(1);
  });

  test("should sort by column when clicking header", async ({ page }) => {
    await page.goto("/");

    // Wait for table to load
    await page.waitForSelector("table tbody tr");

    // Click on Symbol header to sort
    const symbolHeader = page.getByText("Symbol").first();
    await symbolHeader.click();

    // Should show sort indicator
    await expect(page.locator("th").filter({ hasText: /Symbol.*▲|Symbol.*▼/ })).toBeVisible();
  });

  test("should toggle sort direction on repeated clicks", async ({ page }) => {
    await page.goto("/");

    // Wait for table to load
    await page.waitForSelector("table tbody tr");

    const priceHeader = page.getByText("Price").first();

    // First click - ascending
    await priceHeader.click();
    await expect(page.locator("th").filter({ hasText: /Price.*▲/ })).toBeVisible();

    // Second click - descending
    await priceHeader.click();
    await expect(page.locator("th").filter({ hasText: /Price.*▼/ })).toBeVisible();
  });

  test("should show error for duplicate symbol", async ({ page }) => {
    await page.goto("/");

    const addInput = page.getByPlaceholder(/Add symbol/i);
    const addButton = page.getByRole("button", { name: /Add/i });

    // Try to add a symbol that should already exist (VOO is in defaults)
    await addInput.fill("VOO");
    await addButton.click();

    // Should show error message
    await expect(page.getByText(/already in watchlist/i)).toBeVisible();
  });

  test("should validate empty symbol input", async ({ page }) => {
    await page.goto("/");

    const addButton = page.getByRole("button", { name: /Add/i });

    // Try to add empty symbol
    await addButton.click();

    // Should show error message
    await expect(page.getByText(/Please enter a symbol/i)).toBeVisible();
  });

  test("should convert symbol to uppercase", async ({ page }) => {
    await page.goto("/");

    const addInput = page.getByPlaceholder(/Add symbol/i);

    // Type lowercase
    await addInput.fill("googl");

    // Should be converted to uppercase
    await expect(addInput).toHaveValue("GOOGL");
  });

  test("should display settings panel when clicking settings button", async ({ page }) => {
    await page.goto("/");

    // Click settings button
    const settingsButton = page.getByTitle("Settings");
    await settingsButton.click();

    // Should show settings panel
    await expect(page.getByText(/ATH Badge Threshold/i)).toBeVisible();
  });

  test("should clear search when input is cleared", async ({ page }) => {
    await page.goto("/");

    // Wait for table to load
    await page.waitForSelector("table tbody tr");

    const searchInput = page.getByPlaceholder(/Search symbols/i);

    // Search for something
    await searchInput.fill("VOO");

    // Clear search
    await searchInput.fill("");

    // Should show all stocks again (footer should show correct count)
    await expect(page.getByText(/stocks$/)).toBeVisible();
  });
});
