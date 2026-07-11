import { expect, test } from "@playwright/test";

test("signed-out visitor is redirected from the Order Queue to staff login", async ({
  page,
}) => {
  await page.goto("/console/orders");
  await expect(page).toHaveURL(/\/console\/login\?next=%2Fconsole%2Forders/);
});

test("staff login page renders the email/password form", async ({ page }) => {
  await page.goto("/console/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("console manifest link is present and separate from the customer one", async ({
  page,
}) => {
  await page.goto("/console/login");
  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute("href", "/console-manifest");
});

test("submitting invalid staff credentials shows an inline error, not a crash", async ({
  page,
}) => {
  await page.goto("/console/login");
  await page.getByLabel("Email").fill("nobody@nightcravings.test");
  await page.getByLabel("Password").fill("wrongpassword123");
  await page.getByRole("button", { name: "Sign in" }).click();
  // Either a real "incorrect email or password" from Supabase Auth, or —
  // if Supabase itself is unreachable — the generic fallback message from
  // runAuthAction's catch block. Never a blank page or an unhandled error.
  await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
});
