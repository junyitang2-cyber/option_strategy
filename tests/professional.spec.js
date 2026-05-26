const { test, expect } = require("@playwright/test");
const path = require("path");

test("professional and interview mode panels stay interactive", async ({ page }) => {
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

  await page.locator("#modePro").click();
  await expect(page.locator("#modePro")).toHaveClass(/active/);
  await expect(page.locator("#professionalPanel")).toBeVisible();
  await expect(page.locator("#stressTestPanel")).toBeVisible();
  await expect(page.locator("#portfolioPanel")).toBeVisible();
  await expect(page.locator("#gammaPnlPanel")).toBeVisible();
  await expect(page.locator("#proConceptsPanel")).toBeVisible();
  await expect(page.locator("#proConceptsContent .concept-block")).toHaveCount(4);
  await expect(page.locator("#exposureBreakdown")).toContainText("+Delta");
  await expect(page.locator("#greeksDecayChart svg")).toBeVisible();
  await expect(page.locator(".decay-gamma")).toBeAttached();
  await expect(page.locator(".decay-theta")).toBeAttached();
  await expect(page.locator(".decay-vega")).toBeAttached();
  await expect(page.locator("#greeksDecayInfo")).toContainText("组合级");
  await expect(page.locator("#greeksDecayInfo")).toContainText("1 条期权腿");

  await page.locator("#greeksDecayDte").fill("90");
  await page.locator("#greeksDecayDte").dispatchEvent("input");
  await expect(page.locator("#greeksDecayDteOutput")).toHaveText("90");

  await page.locator("#searchInput").fill("Iron Condor");
  await page.locator('#strategyList [data-strategy="iron-condor"]').click();
  await expect(page.locator("#strategyTitle")).toHaveText("Iron Condor");
  await expect(page.locator("#greeksDecayInfo")).toContainText("4 条期权腿");
  await expect(page.locator("#greeksDecayInfo")).toContainText("MIXED");
  await expect(page.locator("#greeksDecayChart .decay-legend")).toContainText("Theta");
  await page.locator('.decay-preset-btn[data-decay-moneyness="itm"]').click();
  await expect(page.locator("#greeksDecayInfo")).toContainText("(ITM)");
  await page.locator("#greeksDecayStrike").fill("110");
  await page.locator("#greeksDecayStrike").dispatchEvent("input");
  await expect(page.locator("#greeksDecayInfo")).toContainText("Center=$110 (Custom)");
  await expect(page.locator(".decay-gamma")).toBeAttached();

  await page.locator("#runStressTest").click();
  await expect(page.locator("#stressTestResults td")).toHaveCount(20);
  await expect(page.locator("#greekShockEstimate")).toContainText("Greek Shock");

  await page.locator("#checkParity").click();
  await expect(page.locator("#parityResults")).toContainText("Put-Call Parity 检查结果");

  await page.locator("#addToPortfolioBtn").click();
  await expect(page.locator(".portfolio-position")).toHaveCount(1);
  await expect(page.locator("#portfolioContent")).toContainText("P&L: $0.00");

  await page.locator('[data-scenario="spot"]').fill("120");
  await page.locator('[data-scenario="spot"]').dispatchEvent("input");
  await expect(page.locator("#portfolioContent")).not.toContainText("P&L: $0.00");

  await page.locator("#runGammaPnl").click();
  await expect(page.locator("#gammaPnlChart svg")).toBeVisible();
  await expect(page.locator("#gammaPnlResults")).toContainText("Realized Vol");

  await page.locator("#searchInput").fill("Poor Man");
  await page.locator('#strategyList [data-strategy="poor-man-s-covered-call"]').click();
  if (await page.locator("#diffWarnModal").isVisible()) {
    await page.locator("#skipDiffWarn").click();
  }
  await expect(page.locator("#strategyTitle")).toHaveText("Poor Man's Covered Call");
  await expect(page.locator("#exposureBreakdown")).toContainText("远月ITM call");

  await page.locator("#modeInterview").click();
  await expect(page.locator("#interviewPanel")).toBeVisible();
  await expect(page.locator(".interview-qa")).not.toHaveCount(0);

  await page.locator("#modeBasic").click();
  await expect(page.locator("#professionalPanel")).toBeHidden();
  await expect(page.locator("#interviewPanel")).toBeHidden();

  expect(errors).toEqual([]);
});
