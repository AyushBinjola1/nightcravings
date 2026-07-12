import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
const log = (msg) => console.log(`[verify] ${msg}`);

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

await page
  .locator('button[aria-label^="Add "]')
  .first()
  .waitFor({ state: "visible", timeout: 15000 });
await page.locator('button[aria-label^="Add "]').first().click();
await page.waitForTimeout(300);

await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

await page.getByLabel("Name").fill("Verify User");
await page.locator('input[type="tel"]').fill("6577879001");
await page.getByText("Pickup", { exact: true }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: /continue to payment/i }).click();
await page.waitForTimeout(3000);

log(`URL after submit: ${page.url()}`);
const isOnPayment = page.url().includes("/payment/");
log(`Reached payment page: ${isOnPayment}`);
if (!isOnPayment) {
  await page.screenshot({ path: "/tmp/final-checkout-fail.png" });
  const errorText = await page.locator('[role="alert"]').allTextContents();
  log(`Error text: ${JSON.stringify(errorText)}`);
}

await browser.close();
log("DONE");
