import { expect, test } from "@playwright/test";

test("primary payroll happy path works locally", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("start-streams").click();
  await expect(page.getByText("Started two MUSD payroll streams from the treasury.")).toBeVisible();

  await page.getByTestId("worker-rafael").getByRole("button", { name: "Pause stream" }).click();
  await expect(page.getByText("Paused rafael stream for operator review.")).toBeVisible();

  await page.getByTestId("worker-rafael").getByRole("button", { name: "Resume stream" }).click();
  await expect(page.getByText("Resumed rafael MUSD stream.")).toBeVisible();

  await page.getByTestId("repay-musd").click();
  await expect(page.getByText("Repaid 2,400 MUSD and improved risk.")).toBeVisible();
});

test("wallet auth exposes a real blocked state when no wallet is installed", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("wallet-auth-button").click();

  await expect(page.getByTestId("wallet-auth-status")).toContainText("no-wallet");
  await expect(page.getByTestId("wallet-auth-status")).toContainText("No EIP-1193 wallet was detected");
});

test("Mezo RPC proof uses the live testnet endpoint", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("rpc-check").click();

  await expect(page.getByText(/Live block [0-9]+/)).toBeVisible();
});
