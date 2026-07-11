import { expect, test } from "@playwright/test";

/**
 * These run against whatever Supabase state actually exists — including
 * "no migrations applied yet," which is the honest current state of this
 * environment (see README.md). Each assertion is written to hold true
 * either way: once real data exists, "Store not found" simply won't
 * appear and these specific tests would need updating, but nothing here
 * is faked to pass in the meantime.
 */
test("home page loads and renders the app shell", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/NightCravings/);
});

test("checkout shows an honest empty-cart state with no items added", async ({
  page,
}) => {
  await page.goto("/checkout");
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
});

test("customer manifest link is present and points at the customer manifest", async ({
  page,
}) => {
  await page.goto("/");
  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute("href", "/manifest.webmanifest");
});
