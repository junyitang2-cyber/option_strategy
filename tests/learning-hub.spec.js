const { test, expect } = require("@playwright/test");

test("D1 learning hub renders and supports progress", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 0/8");
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 0/70");
  await expect(page.locator("#learning-roadmap-tab")).toContainText("路线图");

  await expect(page.locator("#learningRoadmap .roadmap-card")).toHaveCount(6);
  await expect(page.locator("#learningRoadmap")).toContainText("Greeks 直觉：从 D1 exposure 出发");
  await expect(page.locator("#learningRoadmap")).toContainText("策略构建");

  await page.locator("#learning-modules-tab").click();
  await expect(page.locator("#learningModules .module-card")).toHaveCount(8);
  await expect(page.locator("#learningModules")).toContainText("Delta：D1 方向敞口变成动态敞口");
  await expect(page.locator("#learningModules")).toContainText("Vertical spreads：有定义风险的方向表达");
  await expect(page.locator("#learningModules")).toContainText("Dealer 视角");

  await page.locator('[data-complete-module="delta-d1"]').first().click();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 1/8");

  await page.locator("#learning-bridge-tab").click();
  await expect(page.locator("#learningBridge .bridge-card")).toHaveCount(6);
  await expect(page.locator("#learningBridge")).toContainText("不要把一种 skew 方向套到所有市场");

  await page.locator("#learning-scenarios-tab").click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(70);
  await page.locator('[data-scenario-filter="client"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(23);

  await page.locator('[data-reveal-scenario="client-collar-downside"]').click();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toBeVisible();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toContainText("protective put 或 collar");

  await page.locator('[data-complete-scenario="client-collar-downside"]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 1/70");

  await page.reload();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 1/8");
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 1/70");
  await expect(page.locator("#learning-scenarios-tab")).toHaveClass(/active/);
});

test("Learning Hub language toggle switches CN and EN", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#langCn")).toHaveClass(/active/);
  await expect(page.locator("#learning-roadmap-tab")).toContainText("路线图");
  await expect(page.locator("#learningRoadmap")).toContainText("每日节奏");
  await expect(page.locator("#learningRoadmap")).not.toContainText("Daily rhythm");

  await page.locator("#langEn").click();
  await expect(page.locator("#langEn")).toHaveClass(/active/);
  await expect(page.locator("#learning-roadmap-tab")).toContainText("Roadmap");
  await expect(page.locator("#learningRoadmap")).toContainText("Daily rhythm");

  await page.reload();
  await expect(page.locator("#langEn")).toHaveClass(/active/);
  await expect(page.locator("#learning-roadmap-tab")).toContainText("Roadmap");

  await page.locator("#langCn").click();
  await expect(page.locator("#langCn")).toHaveClass(/active/);
  await expect(page.locator("#learning-roadmap-tab")).toContainText("路线图");
});

test("D1 phase 2A strategy construction content renders and filters", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-construction-tab").click();
  await expect(page.locator("#learningComparisons .comparison-card")).toHaveCount(5);
  await expect(page.locator("#learningComparisons")).toContainText("Iron Condor vs Short Strangle");
  await expect(page.locator("#learningComparisons")).toContainText("客户问题");

  await page.locator("#learning-scenarios-tab").click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(70);

  await page.locator('[data-scenario-month-filter="2"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);
  await expect(page.locator("#learningScenarios")).toContainText("Bull call spread 替代 long call");

  await page.locator('[data-scenario-topic-filter="spreads"]').click();
  await expect(page.locator("#learningScenarios .scenario-card").first()).toBeVisible();
  await expect(page.locator("#learningScenarios")).toContainText("有定义风险");
});

test("strategy chips in learning modules select existing strategies", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-modules-tab").click();
  await page.locator('[data-select-strategy="long-call"]').first().click();

  await expect(page.locator("#strategyTitle")).toContainText("Long Call");
  await expect(page.locator("#mainChart svg")).toBeVisible();
});

test("D1 learning hub recovers from invalid saved scenario filter", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.evaluate(() => {
    localStorage.setItem("os_d1_learning", JSON.stringify({
      completedModules: [],
      completedScenarios: [],
      reviewLaterScenarios: [],
      activeLearningTab: "scenarios",
      scenarioFilter: "bad-filter",
    }));
  });

  await page.reload();

  await expect(page.locator("#learning-scenarios-tab")).toHaveClass(/active/);
  await expect(page.locator('[data-scenario-filter="all"]')).toHaveClass(/active/);
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(70);
});
