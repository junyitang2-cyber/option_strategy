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

test("plan shows a sector spine and defaults to the overview (roadmap)", async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator("#sectorSpine [data-sector-spine]")).toHaveCount(7); // overview,A,B,C,D,E,sprint
  await expect(page.locator('.sector-spine-item[data-sector-spine="overview"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="roadmap"]')).toHaveClass(/active/);
  // the old tab bar is gone
  await expect(page.locator(".learning-tabs")).toHaveCount(0);
});

test("selecting sector C shows C modules plus vol-framework and dealer-desk panels", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.sector-spine-item[data-sector-spine="C"]').click();
  await expect(page.locator('.learning-panel[data-learning-panel="modules"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="vol-framework"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="dealer-desk"]')).toHaveClass(/active/);
  // module cards are filtered to sector C
  const sectors = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#learningModules .module-card")).map((c) => c.dataset.sector)
  );
  expect(sectors.length).toBeGreaterThan(0);
  expect(sectors.every((s) => s === "C")).toBe(true);
  // a panel from another sector is not shown
  await expect(page.locator('.learning-panel[data-learning-panel="exotics-bridge"]')).not.toHaveClass(/active/);
});

test("sector selection persists across reload", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.sector-spine-item[data-sector-spine="E"]').click();
  await page.reload();
  await expect(page.locator('.sector-spine-item[data-sector-spine="E"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="exotics-bridge"]')).toHaveClass(/active/);
});

test("practice destination shows only the scenarios panel", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await expect(page.locator('.learning-panel[data-learning-panel="scenarios"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="modules"]')).not.toHaveClass(/active/);
});

test("global language and mode controls live in the nav and work in every destination", async ({ page }) => {
  await page.goto(URL);
  // the controls are inside the always-visible primary nav, not the workspace topbar
  await expect(page.locator(".primary-nav #langEn")).toHaveCount(1);
  await expect(page.locator(".primary-nav #modePro")).toHaveCount(1);

  // switch to the library destination (workspace hidden) and confirm the controls still work
  await page.locator('.primary-nav-item[data-dest="library"]').click();
  await expect(page.locator("#langEn")).toBeVisible();
  await expect(page.locator("#modePro")).toBeVisible();
  await page.locator("#langEn").click();
  await expect(page.locator("#langEn")).toHaveClass(/active/);
  await page.locator("#modePro").click();
  await expect(page.locator("#modePro")).toHaveClass(/active/);
});
