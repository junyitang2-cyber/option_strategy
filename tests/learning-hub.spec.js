const { test, expect } = require("@playwright/test");

test("D1 learning hub renders and supports progress", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator("#learningProgressSummary")).toContainText("Modules 0/4");
  await expect(page.locator("#learningProgressSummary")).toContainText("Scenarios 0/30");

  await expect(page.locator("#learningRoadmap .roadmap-card")).toHaveCount(6);
  await expect(page.locator("#learningRoadmap")).toContainText("Greeks intuition from D1 exposure");

  await page.locator("#learning-modules-tab").click();
  await expect(page.locator("#learningModules .module-card")).toHaveCount(4);
  await expect(page.locator("#learningModules")).toContainText("Delta: D1 directional exposure becomes dynamic");
  await expect(page.locator("#learningModules")).toContainText("Dealer lens");

  await page.locator('[data-complete-module="delta-d1"]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("Modules 1/4");

  await page.locator("#learning-bridge-tab").click();
  await expect(page.locator("#learningBridge .bridge-card")).toHaveCount(6);
  await expect(page.locator("#learningBridge")).toContainText("regime-dependent");

  await page.locator("#learning-scenarios-tab").click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(30);
  await page.locator('[data-scenario-filter="client"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(8);

  await page.locator('[data-reveal-scenario="client-collar-downside"]').click();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toBeVisible();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toContainText("protective put or collar");

  await page.locator('[data-complete-scenario="client-collar-downside"]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("Scenarios 1/30");

  await page.reload();
  await expect(page.locator("#learningProgressSummary")).toContainText("Modules 1/4");
  await expect(page.locator("#learningProgressSummary")).toContainText("Scenarios 1/30");
  await expect(page.locator("#learning-scenarios-tab")).toHaveClass(/active/);
});

test("strategy chips in learning modules select existing strategies", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-modules-tab").click();
  await page.locator('[data-select-strategy="long-call"]').first().click();

  await expect(page.locator("#strategyTitle")).toContainText("Long Call");
  await expect(page.locator("#mainChart svg")).toBeVisible();
});
