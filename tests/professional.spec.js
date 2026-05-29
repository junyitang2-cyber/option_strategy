const { test, expect } = require("@playwright/test");
const path = require("path");

test("tiered learning modes and professional practice panels stay interactive", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("dialog", async (dialog) => {
    if (dialog.type() === "prompt") await dialog.accept("1");
    else await dialog.accept();
  });

  await page.goto(`file://${path.resolve(__dirname, "../index.html")}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.locator("#modeBasic")).toHaveText("初级");
  await expect(page.locator("#modePro")).toHaveText("进阶");
  await expect(page.locator("#modeInterview")).toHaveText("专业");
  await expect(page.locator("body")).not.toContainText(/面试|Interview|Q&A/i);

  // Test Intermediate Mode
  await page.locator("#modePro").click();
  await expect(page.locator("#modePro")).toHaveClass(/active/);
  await expect(page.locator("#professionalPanel")).toBeVisible();
  await expect(page.locator("#professionalToolsPanel")).toBeVisible();
  await expect(page.locator("#proConceptsPanel")).toBeVisible();
  await expect(page.locator("#proConceptsContent .concept-block")).toHaveCount(4);
  await expect(page.locator("#exposureBreakdown")).toContainText("+Delta");

  // Click on the decay tab to make the Greeks Decay chart visible
  await page.locator("#decay-tab").click();
  await expect(page.locator("#greeksDecayChart svg")).toBeVisible();
  await expect(page.locator(".decay-gamma")).toBeAttached();
  await expect(page.locator(".decay-theta")).toBeAttached();
  await expect(page.locator(".decay-vega")).toBeAttached();

  // Test DTE input
  await page.locator("#greeksDecayDte").evaluate(el => el.value = "45");
  await page.locator("#greeksDecayDte").dispatchEvent("input");
  await expect(page.locator("#greeksDecayDteOutput")).toHaveText("45");

  // Test moneyness buttons (ITM/OTM/Custom)
  await page.locator('[data-moneyness="itm"]').click();
  await expect(page.locator('[data-moneyness="itm"]')).toHaveClass(/active/);
  await expect(page.locator("#greeksDecayChart svg")).toBeVisible();

  await page.locator('[data-moneyness="otm"]').click();
  await expect(page.locator('[data-moneyness="otm"]')).toHaveClass(/active/);
  await expect(page.locator("#greeksDecayChart svg")).toBeVisible();

  // Test custom strike input
  await page.locator('[data-moneyness="custom"]').click();
  await expect(page.locator('[data-moneyness="custom"]')).toHaveClass(/active/);
  await expect(page.locator("#customStrikeControl")).toBeVisible();
  await page.locator("#customStrike").fill("110");
  await page.locator("#customStrike").dispatchEvent("input");
  await expect(page.locator("#greeksDecayChart svg")).toBeVisible();

  // Switch back to ATM
  await page.locator('[data-moneyness="atm"]').click();
  await expect(page.locator("#customStrikeControl")).toBeHidden();

  // Test strategy switching
  await page.locator("#searchInput").fill("Iron Condor");
  await page.locator('#strategyList [data-strategy="iron-condor"]').click();
  await expect(page.locator("#strategyTitle")).toHaveText("Iron Condor");

  // Test stress test tab
  await page.locator("#stress-tab").click();
  await page.locator("#runStressTest").click();
  await expect(page.locator("#stressTestResults td")).toHaveCount(20);
  await expect(page.locator("#greekShockEstimate")).toContainText("Greek Shock");

  // Test parity tab
  await page.locator("#parity-tab").click();
  await page.locator("#checkParity").click();
  await expect(page.locator("#parityResults")).toContainText("Put-Call Parity 检查结果");

  // Test portfolio tab
  await page.locator("#portfolio-tab").click();
  await page.locator("#addToPortfolioBtn").click();
  await expect(page.locator(".portfolio-position")).toHaveCount(1);
  await expect(page.locator("#portfolioContent")).toContainText("P&L: $0.00");

  // Test portfolio scenario
  await page.locator('[data-scenario="spot"]').fill("120");
  await page.locator('[data-scenario="spot"]').dispatchEvent("input");
  await expect(page.locator("#portfolioContent")).not.toContainText("P&L: $0.00");

  // Test gamma P&L tab
  await page.locator("#gamma-tab").click();
  await page.locator("#runGammaPnl").click();
  await expect(page.locator("#gammaPnlChart svg")).toBeVisible();
  await expect(page.locator("#gammaPnlResults")).toContainText("Realized Vol");
  await expect(page.locator("#gammaPnlResults")).toContainText("Static P&L");
  await expect(page.locator("#gammaPnlResults")).toContainText("Rehedge rule");

  // Test switching to Poor Man's Covered Call
  await page.locator("#searchInput").fill("Poor Man");
  await page.locator('#strategyList [data-strategy="poor-man-s-covered-call"]').click();
  if (await page.locator("#diffWarnModal").isVisible()) {
    await page.locator("#skipDiffWarn").click();
  }
  await expect(page.locator("#strategyTitle")).toHaveText("Poor Man's Covered Call");
  await expect(page.locator("#exposureBreakdown")).toContainText("远月ITM call");

  // Test Professional Mode
  await page.locator("#modeInterview").click();
  await expect(page.locator("#modeInterview")).toHaveClass(/active/);
  await expect(page.locator("#interviewPanel")).toBeVisible();
  await expect(page.locator("#interviewPanel")).toContainText("专业问答");
  await expect(page.locator("#interviewPanel")).toContainText("情景演练");
  await expect(page.locator("body")).not.toContainText(/面试|Interview|Q&A/i);
  await expect(page.locator(".interview-qa")).not.toHaveCount(0);

  // Test Beginner Mode
  await page.locator("#modeBasic").click();
  await expect(page.locator("#professionalPanel")).toBeHidden();
  await expect(page.locator("#interviewPanel")).toBeHidden();

  expect(errors).toEqual([]);
});

test("phase 7A professional content renders for new target strategies and keeps fallback", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`file://${path.resolve(__dirname, "../index.html")}`);
  await page.locator("#modeInterview").click();

  await page.locator("#searchInput").fill("Bull Put Spread");
  await page.locator('#strategyList [data-strategy="bull-put-spread"]').click();
  await expect(page.locator("#strategyTitle")).toHaveText("Bull Put Spread");
  await expect(page.locator("#professionalPanel")).toContainText("short put");
  await expect(page.locator("#commonMistakesContent")).toContainText("错误表达");
  await expect(page.locator(".interview-qa")).toHaveCount(3);
  await expect(page.locator("#interviewQuestions")).toContainText("Bull Put Spread");

  await page.locator("#searchInput").fill("Short Synthetic Future");
  await page.locator('#strategyList [data-strategy="short-synthetic-future"]').click();
  if (await page.locator("#diffWarnModal").isVisible()) {
    await page.locator("#skipDiffWarn").click();
  }
  await expect(page.locator("#strategyTitle")).toHaveText("Short Synthetic Future");
  await expect(page.locator("#commonMistakesSection")).toBeHidden();
  await expect(page.locator("#interviewQuestions")).toContainText("暂无专业问答内容");

  expect(errors).toEqual([]);
});
