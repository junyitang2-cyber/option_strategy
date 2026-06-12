const { test, expect } = require("@playwright/test");

test("D1 learning hub renders and supports progress", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 0/30");
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 0/211");
  await expect(page.locator("#learningProgressSummary")).toContainText("专业冲刺 0/60");
  await expect(page.locator('.sector-spine-item[data-sector-spine="overview"]')).toContainText("总览");

  await expect(page.locator("#learningRoadmap .roadmap-card")).toHaveCount(6);
  await expect(page.locator("#learningRoadmap")).toContainText("Risk Mechanics：Greeks 直觉");
  await expect(page.locator("#learningRoadmap")).toContainText("Trade Construction：策略构建");
  await expect(page.locator("#learningRoadmap")).toContainText("Market Dynamics：Vol 框架与 Dealer Desk");
  await expect(page.locator("#learningRoadmap")).toContainText("Research Bridge：研究驱动的期权决策");
  await expect(page.locator("#learningRoadmap")).toContainText("Complex Products：Exotics 与结构化产品");
  await expect(page.locator("#learningRoadmap .roadmap-card").nth(4)).toContainText("Exotics Bridge 面板");
  await expect(page.locator("#learningRoadmap .roadmap-card").nth(5)).toContainText("60 个专业冲刺题");

  await page.locator('.sector-spine-item[data-sector-spine="A"]').click();
  await expect(page.locator("#learningModules .module-card")).toHaveCount(9);
  await expect(page.locator("#learningModules")).toContainText("Delta：D1 方向敞口变成动态敞口");
  await expect(page.locator("#learningModules")).toContainText("高频技术问题冲刺");

  await page.locator('.sector-spine-item[data-sector-spine="B"]').click();
  await expect(page.locator("#learningModules .module-card")).toHaveCount(4);
  await expect(page.locator("#learningModules")).toContainText("Vertical spreads：有定义风险的方向表达");

  await page.locator('.sector-spine-item[data-sector-spine="C"]').click();
  await expect(page.locator("#learningModules .module-card")).toHaveCount(11);
  await expect(page.locator("#learningModules")).toContainText("RV vs IV：把波动率当成可交易风险因子");
  await expect(page.locator("#learningModules")).toContainText("Client flow 与 dealer inventory");

  await page.locator('.sector-spine-item[data-sector-spine="E"]').click();
  await expect(page.locator("#learningModules .module-card")).toHaveCount(6);
  await expect(page.locator("#learningModules")).toContainText("Asian options：averaging 把 timing risk 变成 path risk");
  await expect(page.locator("#learningModules")).toContainText("Dealer 视角");

  await expect(page.locator("#learningModules")).toContainText("核心表达");
  await expect(page.locator("#learningModules")).not.toContainText(/面试|Interview/i);

  await page.locator('.sector-spine-item[data-sector-spine="A"]').click();
  await page.locator('[data-complete-module="delta-d1"]').first().click();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 1/30");

  await page.locator('.sector-spine-item[data-sector-spine="A"]').click();
  await expect(page.locator("#learningBridge .bridge-card")).toHaveCount(6);
  await expect(page.locator("#learningBridge")).toContainText("不要把一种 skew 方向套到所有市场");

  await expect(page.locator("#learningBridge")).toContainText("专业表述");
  await expect(page.locator("#learningBridge")).not.toContainText(/面试|Interview/i);

  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(211);
  await page.locator('[data-scenario-filter="client"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(43);

  await page.locator('[data-reveal-scenario="client-collar-downside"]').click();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toBeVisible();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toContainText("protective put 或 collar");

  await page.locator('[data-complete-scenario="client-collar-downside"]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 1/211");

  await page.reload();
  await expect(page.locator("#learningProgressSummary")).toContainText("模块 1/30");
  await expect(page.locator("#learningProgressSummary")).toContainText("场景 1/211");
  await expect(page.locator('.learning-panel[data-learning-panel="scenarios"]')).toHaveClass(/active/);
  await expect(page.locator("#learningScenarios")).not.toContainText(/面试|Interview|interview-traps/i);
});

test("Learning Hub language toggle switches CN and EN", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#langCn")).toHaveClass(/active/);
  await expect(page.locator('.sector-spine-item[data-sector-spine="overview"]')).toContainText("总览");
  await expect(page.locator("#learningRoadmap")).toContainText("每日节奏");
  await expect(page.locator("#learningRoadmap")).not.toContainText("Daily rhythm");

  await page.locator("#langEn").click();
  await expect(page.locator("#langEn")).toHaveClass(/active/);
  await expect(page.locator('.sector-spine-item[data-sector-spine="overview"]')).toContainText("Overview");
  await expect(page.locator("#learningRoadmap")).toContainText("Daily rhythm");

  await page.reload();
  await expect(page.locator("#langEn")).toHaveClass(/active/);
  await expect(page.locator('.sector-spine-item[data-sector-spine="overview"]')).toContainText("Overview");

  await page.locator("#langCn").click();
  await expect(page.locator("#langCn")).toHaveClass(/active/);
  await expect(page.locator('.sector-spine-item[data-sector-spine="overview"]')).toContainText("总览");
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

  expect(localization.scenarioCount).toBe(211);
  expect(localization.missingScenarioIds).toEqual([]);
  expect(localization.missingPlaybookIds).toEqual([]);
  expect(localization.missingExoticsIds).toEqual([]);
  expect(localization.missingStructuringIds).toEqual([]);
});

test("D1 phase 2A strategy construction content renders and filters", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.sector-spine-item[data-sector-spine="B"]').click();
  await expect(page.locator("#learningComparisons .comparison-card")).toHaveCount(5);
  await expect(page.locator("#learningComparisons")).toContainText("Iron Condor vs Short Strangle");
  await expect(page.locator("#learningComparisons")).toContainText("客户问题");
  await expect(page.locator("#learningComparisons")).not.toContainText(/面试|Interview/i);

  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(211);

  await page.locator('[data-scenario-sector-filter="B"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);
  await expect(page.locator("#learningScenarios")).toContainText("Bull call spread 替代 long call");

  await page.locator('[data-scenario-topic-filter="spreads"]').click();
  await expect(page.locator("#learningScenarios .scenario-card").first()).toBeVisible();
  await expect(page.locator("#learningScenarios")).toContainText("有定义风险");
});

test("D1 phase 3 volatility framework renders calculator, playbook, and filters", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.sector-spine-item[data-sector-spine="C"]').click();
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

  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await page.locator('[data-scenario-sector-filter="C"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(85);
  await page.locator('[data-scenario-topic-filter="vol"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(27);
  await expect(page.locator("#learningScenarios")).toContainText("高 IV 但有真实 catalyst");
  await expect(page.locator("#learningScenarios")).toContainText("Hedge frequency 改变 long-gamma P&L");
});

test("D1 phase 4 dealer desk renders workflow, attribution, and gamma controls", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.sector-spine-item[data-sector-spine="C"]').click();
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

  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await page.locator('[data-scenario-sector-filter="C"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(85);
  await page.locator('[data-scenario-topic-filter="dealer"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);
  await expect(page.locator("#learningScenarios")).toContainText("客户买 calls 时 dealer 的 exposure");
});

test("D1 phase 5 exotics bridge renders payoff sketches, structuring cases, and filters", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.sector-spine-item[data-sector-spine="E"]').click();
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

  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await page.locator('[data-scenario-sector-filter="E"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(36);
  await page.locator('[data-scenario-topic-filter="exotics"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(36);
  await expect(page.locator("#learningScenarios")).toContainText("客户需要 average-price hedge");
  await page.locator('[data-scenario-topic-filter="barrier"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(6);
  await expect(page.locator("#learningScenarios")).toContainText("Barrier feature 让 protection 更便宜");
});

test("D1 phase 5B exotics risk lab renders decomposition drills and model-limit cards", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.sector-spine-item[data-sector-spine="E"]').click();
  await expect(page.locator("#learningExoticsRisk .exotics-risk-drill-card")).toHaveCount(6);
  await expect(page.locator("#learningExoticsRisk .model-limit-card")).toHaveCount(6);
  await expect(page.locator("#learningExoticsRisk")).toContainText("Exotics risk decomposition");
  await expect(page.locator("#learningExoticsRisk")).toContainText("Issuer / dealer risk");
  await expect(page.locator("#learningExoticsRisk")).toContainText("错误表达");
  await expect(page.locator("#learningExoticsRisk")).not.toContainText(/面试|Interview/i);

  await page.locator('[data-exotics-risk-filter="autocallable"]').click();
  await expect(page.locator("#learningExoticsRisk .exotics-risk-drill-card")).toHaveCount(1);
  await expect(page.locator("#learningExoticsRisk .model-limit-card")).toHaveCount(1);
  await expect(page.locator("#learningExoticsRisk")).toContainText("Autocallable");
});

test("D1 phase 6 professional sprint creates sessions, reveals rubrics, and updates dashboard", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.sector-spine-item[data-sector-spine="sprint"]').click();
  await expect(page.locator("#learningProfessionalSprint")).toContainText("Professional Sprint");
  await expect(page.locator("#sprintQuestionBankSummary")).toContainText("60");
  await expect(page.locator("#skillDashboard")).toContainText("本地能力分");

  await page.locator('[data-sprint-topic-filter="exotics"]').click();
  await page.locator("#sprintSessionSize").selectOption("5");
  await page.locator("[data-start-sprint-session]").click();
  await expect(page.locator("#learningProfessionalSprint .sprint-question-card")).toHaveCount(5);
  await expect(page.locator("#learningProfessionalSprint .sprint-question-card").first()).toContainText("Exotics");

  const firstCard = page.locator("#learningProfessionalSprint .sprint-question-card").first();
  await firstCard.locator("[data-reveal-sprint-rubric]").click();
  await expect(firstCard).toContainText("必须覆盖");
  await expect(firstCard).toContainText("红旗回答");

  await firstCard.locator("[data-mark-weak-sprint]").click();
  await firstCard.locator("[data-complete-sprint-question]").click();
  await expect(page.locator("#learningProgressSummary")).toContainText("专业冲刺 1/60");
  await expect(page.locator("#skillDashboard")).toContainText("弱项");
  await expect(page.locator("#wrongAnswerNotebook")).not.toContainText("暂无弱项");

  await page.reload();
  await expect(page.locator('.learning-panel[data-learning-panel="professional-sprint"]')).toHaveClass(/active/);
  await expect(page.locator("#learningProfessionalSprint .sprint-question-card")).toHaveCount(5);
  await expect(page.locator("#learningProgressSummary")).toContainText("专业冲刺 1/60");
});

test("D1 phase 6B scores sprint answers, recommends weak-topic practice, and exports progress", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.sector-spine-item[data-sector-spine="sprint"]').click();
  await page.locator('[data-sprint-topic-filter="exotics"]').click();
  await page.locator("#sprintSessionSize").selectOption("5");
  await page.locator("[data-start-sprint-session]").click();

  const firstCard = page.locator("#learningProfessionalSprint .sprint-question-card").first();
  await firstCard.locator("[data-reveal-sprint-rubric]").click();
  await firstCard.locator('[data-score-sprint-question][data-score-value="1"]').click();
  await firstCard.locator("[data-mark-weak-sprint]").click();
  await firstCard.locator("[data-complete-sprint-question]").click();

  await expect(firstCard.locator(".sprint-score-row")).toContainText("自评分");
  await expect(page.locator("#weakTopicRecommendations")).toContainText("Exotics");
  await expect(page.locator("#weakTopicRecommendations")).toContainText("建议下一组");

  await page.locator("[data-start-recommended-sprint]").click();
  await expect(page.locator("#learningProfessionalSprint .sprint-question-card")).toHaveCount(5);
  await expect(page.locator("#learningProfessionalSprint .sprint-question-card").first()).toContainText("Exotics");

  await page.locator("[data-generate-progress-report]").click();
  await expect(page.locator("#progressReportExport")).toBeVisible();
  await expect(page.locator("#progressReportExport")).toContainText("Phase 6B Progress Report");
  await expect(page.locator("#progressReportExport")).toContainText("professionalSprint");
  await expect(page.locator("#progressReportExport")).toContainText("weakTopicRecommendations");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("os_d1_learning")));
  expect(Object.keys(saved.sprintQuestionScores || {})).toHaveLength(1);
  expect(saved.generatedProgressReport).toContain("Phase 6B Progress Report");

  await page.reload();
  await expect(page.locator('.learning-panel[data-learning-panel="professional-sprint"]')).toHaveClass(/active/);
  await expect(page.locator("#progressReportExport")).toContainText("Phase 6B Progress Report");
});

test("D1 phase 2B client recommendation drills reveal steps and persist", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#learningProgressSummary")).toContainText("演练 0/20");

  await page.locator('.sector-spine-item[data-sector-spine="B"]').click();
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
  await expect(page.locator('.learning-panel[data-learning-panel="client-drills"]')).toHaveClass(/active/);
  await expect(page.locator("#learningProgressSummary")).toContainText("演练 1/20");
  await expect(page.locator('[data-client-drill-card="protect-concentrated-stock"]')).toContainText("推荐结构");

  await page.locator('[data-client-drill-card="protect-concentrated-stock"] [data-select-strategy="collar"]').click();
  // chip opens the lab as an overlay; the user stays in the plan
  await expect(page.locator("#labOverlay")).toBeVisible();
  await expect(page.locator("#labOverlay #labRoot #mainChart svg")).toHaveCount(1);
  await expect(page.locator("#strategyTitle")).toContainText("Collar");
  await expect(page.locator("body")).toHaveAttribute("data-dest", "plan");
});

test("strategy chips in learning modules select existing strategies", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.sector-spine-item[data-sector-spine="A"]').click();
  await page.locator('[data-select-strategy="long-call"]').first().click();

  // chip opens the lab as an overlay; the user stays in the plan
  await expect(page.locator("#labOverlay")).toBeVisible();
  await expect(page.locator("#labOverlay #labRoot #mainChart svg")).toHaveCount(1);
  await expect(page.locator("#strategyTitle")).toContainText("Long Call");
  await expect(page.locator("body")).toHaveAttribute("data-dest", "plan");
});

test("D1 learning hub recovers from invalid saved scenario filter", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.evaluate(() => {
    localStorage.setItem("os_d1_learning", JSON.stringify({
      completedModules: [],
      completedScenarios: [],
      reviewLaterScenarios: [],
      scenarioFilter: "bad-filter",
    }));
    localStorage.setItem("os_d1_dest", "practice");
  });

  await page.reload();

  await expect(page.locator('.learning-panel[data-learning-panel="scenarios"]')).toHaveClass(/active/);
  await expect(page.locator('[data-scenario-filter="all"]')).toHaveClass(/active/);
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(211);
});

test("scenario bank uses sector filters A B C E not month numbers", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.primary-nav-item[data-dest="practice"]').click();

  // Sector filter buttons must exist
  await expect(page.locator('[data-scenario-sector-filter="A"]')).toBeVisible();
  await expect(page.locator('[data-scenario-sector-filter="B"]')).toBeVisible();
  await expect(page.locator('[data-scenario-sector-filter="C"]')).toBeVisible();
  await expect(page.locator('[data-scenario-sector-filter="D"]')).toBeVisible();
  await expect(page.locator('[data-scenario-sector-filter="E"]')).toBeVisible();

  // Sector C combines old Month 3 (45) + Month 4 (40) = 85 scenarios
  await page.locator('[data-scenario-sector-filter="C"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(85);

  // Sector B = old Month 2 = 40 scenarios
  await page.locator('[data-scenario-sector-filter="B"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);

  // Sector D = Research Bridge = 20 scenarios
  await page.locator('[data-scenario-sector-filter="D"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(20);

  // No old month-number filter buttons
  await expect(page.locator('[data-scenario-month-filter="3"]')).toHaveCount(0);
});

test("Research Bridge tab renders cases, filters, and VTT drills", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  // Switch to EN so English strings are predictable for assertions
  await page.locator("#langEn").click();

  await page.locator('.sector-spine-item[data-sector-spine="D"]').click();
  await expect(page.locator("#learningResearchBridge")).toBeVisible();

  await expect(page.locator("#learningResearchBridge .research-case-card")).toHaveCount(16);

  await page.locator('[data-research-filter="earnings"]').click();
  await expect(page.locator("#learningResearchBridge .research-case-card")).toHaveCount(4);

  await page.locator('[data-research-filter="sector-analysis"]').click();
  await expect(page.locator("#learningResearchBridge .research-case-card")).toHaveCount(3);

  await page.locator('[data-research-filter="all"]').click();
  await expect(page.locator("#learningResearchBridge .research-case-card")).toHaveCount(16);

  await expect(page.locator("#learningResearchBridge .vtt-drill-card")).toHaveCount(15);

  const firstDrill = page.locator("#learningResearchBridge .vtt-drill-card").first();
  await firstDrill.locator('[data-reveal-vtt-step="view"]').click();
  await expect(firstDrill.locator('[data-vtt-step="view"]')).toBeVisible();

  // Mark complete (re-render will reset step visibility — do not assert step after this)
  await firstDrill.locator('[data-complete-vtt]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("Research Drills 1/15");
});

test("Sector D scenarios appear in scenario bank sector filter with NVDA content", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await page.locator('[data-scenario-sector-filter="D"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(20);
  await expect(page.locator("#learningScenarios")).toContainText("NVDA");
});

test("roadmap shows Sector A-E cards with correct names", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  // Switch to EN so English sector labels are visible
  await page.locator("#langEn").click();

  await expect(page.locator("#learningRoadmap .roadmap-card")).toHaveCount(6);
  await expect(page.locator("#learningRoadmap")).toContainText("Sector A");
  await expect(page.locator("#learningRoadmap")).toContainText("Risk Mechanics");
  await expect(page.locator("#learningRoadmap")).toContainText("Sector C");
  await expect(page.locator("#learningRoadmap")).toContainText("Market Dynamics");
  await expect(page.locator("#learningRoadmap")).toContainText("Combines Vol Framework");
  await expect(page.locator("#learningRoadmap")).toContainText("Sector D");
  await expect(page.locator("#learningRoadmap")).toContainText("Research Bridge");
  // no Month labels
  await expect(page.locator("#learningRoadmap")).not.toContainText("Month 1");
  await expect(page.locator("#learningRoadmap")).not.toContainText("Month 3");
});

test("plan overview is a progress dashboard with clickable sector cards and no lock labels", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  // default destination is plan, default sector is overview
  await expect(page.locator('[data-sector-spine="overview"].sector-spine-item')).toHaveClass(/active/);

  // the vestigial gating labels are gone
  await expect(page.locator("#learningRoadmap")).not.toContainText("未开放");

  // per-sector progress is shown on the cards (fresh state = 0 done)
  await expect(page.locator('#learningRoadmap .roadmap-card[data-sector-spine="A"]')).toContainText("0/9");
  await expect(page.locator('#learningRoadmap .roadmap-card[data-sector-spine="sprint"]')).toContainText("0/60");
  await expect(page.locator('#learningRoadmap .roadmap-card[data-sector-spine="D"]')).toContainText("0/15");

  // clicking a sector card jumps to that sector (handler reads the card's data-sector-spine)
  await page.locator('#learningRoadmap .roadmap-card[data-sector-spine="C"]').click();
  await expect(page.locator('[data-sector-spine="C"].sector-spine-item')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="vol-framework"]')).toHaveClass(/active/);
});

test("plan overview continue CTA jumps to the first incomplete sector", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // fresh progress -> first incomplete sector is A
  await expect(page.locator("#learningRoadmap .overview-cta")).toBeVisible();
  await page.locator("#learningRoadmap .overview-cta").click();
  await expect(page.locator('[data-sector-spine="A"].sector-spine-item')).toHaveClass(/active/);
});
