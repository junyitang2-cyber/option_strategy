const { test, expect } = require("@playwright/test");

test("D1 learning hub renders and supports progress", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 0/25");
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 0/191");
  await expect(page.locator("#learning-roadmap-tab")).toContainText("路线图");

  await expect(page.locator("#learningRoadmap .roadmap-card")).toHaveCount(6);
  await expect(page.locator("#learningRoadmap")).toContainText("Greeks 直觉：从 D1 exposure 出发");
  await expect(page.locator("#learningRoadmap")).toContainText("策略构建");
  await expect(page.locator("#learningRoadmap")).toContainText("Volatility trading 框架");
  await expect(page.locator("#learningRoadmap")).toContainText("动态对冲与做市");
  await expect(page.locator("#learningRoadmap")).toContainText("Exotics 与 structuring");

  await page.locator("#learning-modules-tab").click();
  await expect(page.locator("#learningModules .module-card")).toHaveCount(25);
  await expect(page.locator("#learningModules")).toContainText("Delta：D1 方向敞口变成动态敞口");
  await expect(page.locator("#learningModules")).toContainText("Vertical spreads：有定义风险的方向表达");
  await expect(page.locator("#learningModules")).toContainText("RV vs IV：把波动率当成可交易风险因子");
  await expect(page.locator("#learningModules")).toContainText("Client flow 与 dealer inventory");
  await expect(page.locator("#learningModules")).toContainText("Asian options：averaging 把 timing risk 变成 path risk");
  await expect(page.locator("#learningModules")).toContainText("Dealer 视角");

  await expect(page.locator("#learningModules")).toContainText("核心表达");
  await expect(page.locator("#learningModules")).not.toContainText(/面试|Interview/i);

  await page.locator('[data-complete-module="delta-d1"]').first().click();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 1/25");

  await page.locator("#learning-bridge-tab").click();
  await expect(page.locator("#learningBridge .bridge-card")).toHaveCount(6);
  await expect(page.locator("#learningBridge")).toContainText("不要把一种 skew 方向套到所有市场");

  await expect(page.locator("#learningBridge")).toContainText("专业表述");
  await expect(page.locator("#learningBridge")).not.toContainText(/面试|Interview/i);

  await page.locator("#learning-scenarios-tab").click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(191);
  await page.locator('[data-scenario-filter="client"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(43);

  await page.locator('[data-reveal-scenario="client-collar-downside"]').click();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toBeVisible();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toContainText("protective put 或 collar");

  await page.locator('[data-complete-scenario="client-collar-downside"]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 1/191");

  await page.reload();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 1/25");
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 1/191");
  await expect(page.locator("#learning-scenarios-tab")).toHaveClass(/active/);
  await expect(page.locator("#learningScenarios")).not.toContainText(/面试|Interview|interview-traps/i);
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

test("D1 learning content has complete CN scenario localization", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  const localization = await page.evaluate(() => {
    const scenarios = window.D1_LEARNING_CONTENT.scenarios || [];
    const zhScenarios = window.D1_LEARNING_CONTENT_ZH.scenarios || {};
    const playbook = window.D1_LEARNING_CONTENT.volPlaybook || [];
    const zhPlaybook = window.D1_LEARNING_CONTENT_ZH.volPlaybook || {};
    const exoticsBridge = window.D1_LEARNING_CONTENT.exoticsBridge || [];
    const zhExoticsBridge = window.D1_LEARNING_CONTENT_ZH.exoticsBridge || {};
    const structuringCases = window.D1_LEARNING_CONTENT.structuringCases || [];
    const zhStructuringCases = window.D1_LEARNING_CONTENT_ZH.structuringCases || {};
    return {
      scenarioCount: scenarios.length,
      missingScenarioIds: scenarios.filter((scenario) => !zhScenarios[scenario.id]).map((scenario) => scenario.id),
      missingPlaybookIds: playbook.filter((item) => !zhPlaybook[item.id]).map((item) => item.id),
      missingExoticsIds: exoticsBridge.filter((item) => !zhExoticsBridge[item.id]).map((item) => item.id),
      missingStructuringIds: structuringCases.filter((item) => !zhStructuringCases[item.id]).map((item) => item.id),
    };
  });

  expect(localization.scenarioCount).toBe(191);
  expect(localization.missingScenarioIds).toEqual([]);
  expect(localization.missingPlaybookIds).toEqual([]);
  expect(localization.missingExoticsIds).toEqual([]);
  expect(localization.missingStructuringIds).toEqual([]);
});

test("D1 phase 2A strategy construction content renders and filters", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-construction-tab").click();
  await expect(page.locator("#learningComparisons .comparison-card")).toHaveCount(5);
  await expect(page.locator("#learningComparisons")).toContainText("Iron Condor vs Short Strangle");
  await expect(page.locator("#learningComparisons")).toContainText("客户问题");
  await expect(page.locator("#learningComparisons")).not.toContainText(/面试|Interview/i);

  await page.locator("#learning-scenarios-tab").click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(191);

  await page.locator('[data-scenario-month-filter="2"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);
  await expect(page.locator("#learningScenarios")).toContainText("Bull call spread 替代 long call");

  await page.locator('[data-scenario-topic-filter="spreads"]').click();
  await expect(page.locator("#learningScenarios .scenario-card").first()).toBeVisible();
  await expect(page.locator("#learningScenarios")).toContainText("有定义风险");
});

test("D1 phase 3 volatility framework renders calculator, playbook, and filters", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-vol-framework-tab").click();
  await expect(page.locator("#learningVolFramework .vol-framework-card")).toHaveCount(5);
  await expect(page.locator("#learningVolFramework .vol-playbook-card")).toHaveCount(9);
  await expect(page.locator("#learningVolFramework")).toContainText("RV / IV 是 distribution 问题");
  await expect(page.locator("#learningVolFramework")).toContainText("命名结构前，先命名 surface bucket");
  await expect(page.locator("#volCalcResult")).toContainText("样本 Realized Vol");
  await expect(page.locator("#volCalcResult")).toContainText("IV 隐含区间");

  await page.locator('[data-vol-playbook-filter="skew"]').click();
  await expect(page.locator("#learningVolFramework .vol-playbook-card")).toHaveCount(2);
  await expect(page.locator("#learningVolFramework")).toContainText("risk reversal");

  await page.locator("#volCalcIv").fill("30");
  await page.locator("#volCalcIv").dispatchEvent("input");
  await expect(page.locator("#volCalcResult")).toContainText("30.0% before costs");

  await page.locator('[data-open-tool="vol"]').click();
  await expect(page.locator("#modePro")).toHaveClass(/active/);
  await expect(page.locator("#vol-tab")).toHaveClass(/active/);
  await expect(page.locator("#volSurfaceChart svg")).toBeVisible();

  await page.locator("#learning-scenarios-tab").click();
  await page.locator('[data-scenario-month-filter="3"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(45);
  await page.locator('[data-scenario-topic-filter="vol"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(27);
  await expect(page.locator("#learningScenarios")).toContainText("高 IV 但有真实 catalyst");
  await expect(page.locator("#learningScenarios")).toContainText("Hedge frequency 改变 long-gamma P&L");
});

test("D1 phase 4 dealer desk renders workflow, attribution, and gamma controls", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-dealer-desk-tab").click();
  await expect(page.locator("#learningDealerDesk .dealer-workflow-card")).toHaveCount(6);
  await expect(page.locator("#learningDealerDesk .dealer-attribution-card")).toHaveCount(6);
  await expect(page.locator("#learningDealerDesk")).toContainText("客户买入 upside calls");
  await expect(page.locator("#learningDealerDesk")).toContainText("Delta P&L");
  await expect(page.locator("#learningDealerDesk")).toContainText("客户买的是 payoff，dealer 接到的是 Greeks");

  await page.locator('[data-open-tool="gamma"]').click();
  await expect(page.locator("#modePro")).toHaveClass(/active/);
  await expect(page.locator("#gamma-tab")).toHaveClass(/active/);
  await expect(page.locator("#gammaPnlThreshold")).toBeVisible();
  await expect(page.locator("#gammaPnlCost")).toBeVisible();
  await page.locator("#runGammaPnl").click();
  await expect(page.locator("#gammaPnlResults")).toContainText("Static P&L");
  await expect(page.locator("#gammaPnlResults")).toContainText("交易成本");
  await expect(page.locator("#gammaPnlResults")).toContainText("Rehedge rule");

  await page.locator("#learning-scenarios-tab").click();
  await page.locator('[data-scenario-month-filter="4"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);
  await page.locator('[data-scenario-topic-filter="dealer"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);
  await expect(page.locator("#learningScenarios")).toContainText("客户买 calls 时 dealer 的 exposure");
});

test("D1 phase 5 exotics bridge renders payoff sketches, structuring cases, and filters", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-exotics-bridge-tab").click();
  await expect(page.locator("#learningExoticsBridge .exotics-bridge-card")).toHaveCount(6);
  await expect(page.locator("#learningExoticsBridge .structuring-case-card")).toHaveCount(6);
  await expect(page.locator("#learningExoticsBridge .exotics-payoff-svg")).toHaveCount(6);
  await expect(page.locator("#learningExoticsBridge")).toContainText("Asian option");
  await expect(page.locator("#learningExoticsBridge")).toContainText("模型限制");
  await expect(page.locator("#learningExoticsBridge")).toContainText("客户目标");

  await page.locator('[data-exotics-filter="barrier"]').click();
  await expect(page.locator("#learningExoticsBridge .exotics-bridge-card")).toHaveCount(1);
  await expect(page.locator("#learningExoticsBridge .structuring-case-card")).toHaveCount(1);
  await expect(page.locator("#learningExoticsBridge")).toContainText("保护可能消失");

  await page.locator('[data-open-tool="parity"]').click();
  await expect(page.locator("#modePro")).toHaveClass(/active/);
  await expect(page.locator("#parity-tab")).toHaveClass(/active/);

  await page.locator("#learning-scenarios-tab").click();
  await page.locator('[data-scenario-month-filter="5"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(36);
  await page.locator('[data-scenario-topic-filter="exotics"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(36);
  await expect(page.locator("#learningScenarios")).toContainText("客户需要 average-price hedge");
  await page.locator('[data-scenario-topic-filter="barrier"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(6);
  await expect(page.locator("#learningScenarios")).toContainText("Barrier feature 让 protection 更便宜");
});

test("D1 phase 2B client recommendation drills reveal steps and persist", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#learningProgressSummary")).toContainText("演练 0/20");

  await page.locator("#learning-client-drills-tab").click();
  await expect(page.locator("#learningClientDrills .client-drill-card")).toHaveCount(20);

  const firstDrill = page.locator('[data-client-drill-card="protect-concentrated-stock"]');
  await expect(firstDrill).toContainText("集中持股客户需要下行保护");
  await expect(firstDrill).toContainText("客户目标");
  await expect(firstDrill).not.toContainText("推荐结构");
  await expect(firstDrill.locator("[data-select-strategy]")).toHaveCount(0);

  await firstDrill.locator('[data-reveal-client-drill="protect-concentrated-stock"]').click();
  await expect(firstDrill).toContainText("客户背景");
  await expect(firstDrill).not.toContainText("推荐结构");
  await expect(firstDrill.locator("[data-select-strategy]")).toHaveCount(0);

  await firstDrill.locator('[data-reveal-client-drill="protect-concentrated-stock"]').click();
  await firstDrill.locator('[data-reveal-client-drill="protect-concentrated-stock"]').click();
  await expect(firstDrill.locator("[data-select-strategy]")).toHaveCount(0);
  await firstDrill.locator('[data-reveal-client-drill="protect-concentrated-stock"]').click();
  await expect(firstDrill).toContainText("推荐结构");
  await expect(firstDrill).toContainText("Collar");
  await expect(firstDrill.locator("[data-select-strategy]")).toHaveCount(3);

  await firstDrill.locator('[data-complete-client-drill="protect-concentrated-stock"]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("演练 1/20");

  await page.reload();
  await expect(page.locator("#learning-client-drills-tab")).toHaveClass(/active/);
  await expect(page.locator("#learningProgressSummary")).toContainText("演练 1/20");
  await expect(page.locator('[data-client-drill-card="protect-concentrated-stock"]')).toContainText("推荐结构");

  await page.locator('[data-client-drill-card="protect-concentrated-stock"] [data-select-strategy="collar"]').click();
  await expect(page.locator("#strategyTitle")).toContainText("Collar");
  await expect(page.locator("#mainChart svg")).toBeVisible();
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
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(191);
});
