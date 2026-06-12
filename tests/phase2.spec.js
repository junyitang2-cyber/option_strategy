const { test, expect } = require("@playwright/test");
const path = require("path");

test("phase 2 learning path and per-leg decomposition work", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`file://${path.resolve(__dirname, "../index.html")}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('.primary-nav-item[data-dest="lab"]').click();

  await expect(page.locator("#strategyTitle")).toHaveText("Long Call");
  await expect(page.locator("#learningPathBar")).toContainText("Long Call");

  await page.locator('.primary-nav-item[data-dest="library"]').click();
  await page.locator('#strategyList [data-strategy="box-spread"]').click();
  await expect(page.locator("body")).toHaveAttribute("data-dest", "lab");
  await expect(page.locator("#diffWarnModal")).toBeVisible();
  await expect(page.locator("#diffWarnContent")).toContainText("难度跃升提示");
  await expect(page.locator("#strategyTitle")).toHaveText("Long Call");

  await page.locator("#skipDiffWarn").click();
  await expect(page.locator("#diffWarnModal")).toBeHidden();
  await expect(page.locator("#strategyTitle")).toHaveText("Box Spread");

  await page.locator("#viewPerLeg").click();
  await expect(page.locator("#viewPerLeg")).toHaveClass(/active/);
  await expect(page.locator(".payoff-leg-combined")).toBeAttached();
  await expect(page.locator(".payoff-leg-0")).toBeAttached();
  await expect(page.locator(".payoff-leg-1")).toBeAttached();
  await expect(page.locator(".leg-color-bar")).toHaveCount(4);

  await page.locator("#markCompletedBtn").click();
  await expect(page.locator("#markCompletedBtn")).toContainText("✓ 已理解");
  await expect(page.locator("#learningPathBar")).toContainText("已学");
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("os_learning")));
  expect(progress.visited).toContain("box-spread");
  expect(progress.completed).toContain("box-spread");

  expect(errors).toEqual([]);
});
