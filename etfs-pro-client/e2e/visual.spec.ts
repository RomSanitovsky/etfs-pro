import { test, expect } from "@playwright/test";

test.describe("Visual Theme", () => {
  test("should have dark background", async ({ page }) => {
    await page.goto("/");

    // Check body has dark background
    const body = page.locator("body");
    const backgroundColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should be dark (space-black: #0a0b0f)
    expect(backgroundColor).toMatch(/rgb\(10, 11, 15\)|rgba\(10, 11, 15/);
  });

  test("should display star field animation", async ({ page }) => {
    await page.goto("/");

    // Check for star elements
    const stars = page.locator(".star");
    const starCount = await stars.count();

    // Should have multiple stars (we generate 100)
    expect(starCount).toBeGreaterThan(0);
  });

  test("should have gradient header text", async ({ page }) => {
    await page.goto("/");

    const header = page.getByRole("heading", { name: /ETFs Pro Tracker/i });
    await expect(header).toBeVisible();

    // Check for gradient classes
    await expect(header).toHaveClass(/bg-gradient-to-r/);
    await expect(header).toHaveClass(/bg-clip-text/);
  });

  test("should display glass card effect", async ({ page }) => {
    await page.goto("/");

    const glassCard = page.locator(".glass-card").first();
    await expect(glassCard).toBeVisible();
  });

  test("should have styled input fields", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder(/Search symbols/i);
    await expect(searchInput).toHaveClass(/space-input/);
  });

  test("should have styled buttons", async ({ page }) => {
    await page.goto("/");

    const addButton = page.getByRole("button", { name: /Add/i });
    await expect(addButton).toHaveClass(/space-button/);
  });

  test("should display legend with colored indicators", async ({ page }) => {
    await page.goto("/");

    // Check for legend items
    await expect(page.getByText("Near ATH")).toBeVisible();
    await expect(page.getByText("% Down from ATH")).toBeVisible();
    await expect(page.getByText("% Needed to reach ATH")).toBeVisible();
  });

  test("should apply hover effects on table rows", async ({ page }) => {
    await page.goto("/");

    // Wait for table to load
    await page.waitForSelector("table tbody tr");

    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toHaveClass(/stock-row/);
  });

  test("should display colored percentage values", async ({ page }) => {
    await page.goto("/");

    // Wait for table to load
    await page.waitForSelector("table tbody tr");

    // Should have red or green colored percentage text
    const percentageCell = page.locator("table tbody tr td").filter({ hasText: /[+-]?\d+\.\d+%/ }).first();
    await expect(percentageCell).toBeVisible();
  });

  test("should show data source attribution", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/Data from Yahoo Finance/)).toBeVisible();
  });
});
