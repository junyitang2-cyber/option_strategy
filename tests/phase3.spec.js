const { test, expect } = require("@playwright/test");
const path = require("path");

test("phase 3 probability view and richer notes work", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`file://${path.resolve(__dirname, "../index.html")}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.locator("#viewProbability").click();
  await expect(page.locator("#viewProbability")).toHaveClass(/active/);
  await expect(page.locator(".payoff-probability")).toBeAttached();
  await expect(page.locator(".payoff-expiry")).toBeAttached();
  await expect(page.locator(".payoff-current")).toBeAttached();
  await expect(page.locator(".sigma-band")).toHaveCount(4);
  await expect(page.locator(".sigma-label")).toHaveText(["−2σ", "−1σ", "+1σ", "+2σ"]);
  await expect(page.locator("#chartLegend")).toContainText("盈利概率约 34%");

  await page.locator("#searchInput").fill("Straddle");
  await page.locator('#strategyList [data-strategy="straddle"]').click();
  await expect(page.locator("#strategyTitle")).toHaveText("Straddle");
  await expect(page.locator("#chartLegend")).toContainText("盈利概率约 42%");

  await page.locator("#searchInput").fill("Long Synthetic Future");
  await page.locator('#strategyList [data-strategy="long-synthetic-future"]').click();
  if (await page.locator("#diffWarnModal").isVisible()) {
    await page.locator("#skipDiffWarn").click();
  }
  await expect(page.locator("#strategyTitle")).toHaveText("Long Synthetic Future");
  await expect(page.locator("#educationGrid")).toContainText("Put-Call Parity");
  await expect(page.locator("#educationGrid")).toContainText("C − P");
  await expect(page.locator('[data-leg="0"][data-key="strike"]')).toHaveAttribute("title", /ITM=实值/);

  await page.locator("#searchInput").fill("Iron Condor");
  await page.locator('#strategyList [data-strategy="iron-condor"]').click();
  await expect(page.locator("#strategyTitle")).toHaveText("Iron Condor");
  await expect(page.locator("#educationGrid")).toContainText("利润平台");
  await expect(page.locator("#educationGrid")).toContainText("腿间距太窄");

  expect(errors).toEqual([]);
});
