import { expect, test } from "@playwright/test";

test("landing page renders with oracle price and connect CTA", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Stream payroll in")).toBeVisible();
  await expect(page.getByText("Connect Wallet").first()).toBeVisible();

  await page.waitForTimeout(4000);
  await expect(page.getByText(/BTC Oracle: \$[\d,]+/)).toBeVisible();
});

test("landing page features and how-it-works sections render", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(1000);

  await expect(page.getByText("MUSD Borrowing")).toBeVisible();
  await expect(page.getByText("Real-time Streams")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Auto-Rebalance" }),
  ).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 2400));
  await page.waitForTimeout(1000);

  await expect(page.getByRole("heading", { name: "Post BTC" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Borrow MUSD" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Stream Payroll", exact: true }),
  ).toBeVisible();
});

test("connect wallet opens the RainbowKit wallet modal", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2000);
  await page.locator(".hero-cta").click();
  await page.waitForTimeout(2000);

  await expect(page.getByText("Connect a Wallet")).toBeVisible();
  await expect(page.getByText("WalletConnect")).toBeVisible();
});

test("footer shows deployed contract links", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  await expect(page.getByText("SatSalaryTrove")).toBeVisible();
  await expect(page.getByText("SatSalaryVault")).toBeVisible();
  await expect(page.getByText("Mezo Testnet").first()).toBeVisible();
});
