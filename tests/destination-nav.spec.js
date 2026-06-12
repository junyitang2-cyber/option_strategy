const { test, expect } = require("@playwright/test");
const path = require("path");

const URL = `file://${path.resolve(__dirname, "../index.html")}`;

test("primary nav renders 4 destinations and defaults to plan", async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator(".primary-nav .primary-nav-item")).toHaveCount(4);
  await expect(page.locator('.primary-nav-item[data-dest="plan"]')).toHaveClass(/active/);
  const dest = await page.evaluate(() => document.body.dataset.dest);
  expect(dest).toBe("plan");
  // plan shows the learning hub, hides rail and lab stage
  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator(".strategy-rail")).toBeHidden();
  await expect(page.locator("#labStage")).toBeHidden();
});

test("library destination shows the strategy list, hides the workspace", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="library"]').click();
  await expect(page.locator(".strategy-rail")).toBeVisible();
  await expect(page.locator(".workspace")).toBeHidden();
  await expect(page.locator("#strategyList .strategy-item").first()).toBeVisible();
});

test("lab destination shows the lab analysis, hides the learning hub", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="lab"]').click();
  await expect(page.locator("#labStage")).toBeVisible();
  await expect(page.locator("#labStage #labRoot #mainChart svg")).toHaveCount(1);
  await expect(page.locator("#learningHubPanel")).toBeHidden();
});

test("practice destination shows the learning hub on the scenarios tab", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator('.learning-panel[data-learning-panel="scenarios"]')).toHaveClass(/active/);
});

test("destination persists across reload", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="library"]').click();
  await page.reload();
  const dest = await page.evaluate(() => document.body.dataset.dest);
  expect(dest).toBe("library");
  await expect(page.locator(".strategy-rail")).toBeVisible();
});
