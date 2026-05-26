const { test, expect } = require("@playwright/test");
const path = require("path");

test("interactive lab renders and core teaching controls work", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`file://${path.resolve(__dirname, "../index.html")}`);

  await expect(page.locator("#strategyTitle")).toHaveText("Long Call");
  await expect(page.locator("#visibleCount")).toHaveText("71");
  await expect(page.locator("#mainChart svg")).toBeVisible();
  await expect(page.locator("#greekGrid svg").first()).toBeVisible();
  await expect(page.locator(".profit-area").first()).toBeAttached();
  await expect(page.locator(".loss-area").first()).toBeAttached();
  await expect(page.locator(".break-label").first()).toBeAttached();

  await page.locator("#strategyList .strategy-item").first().hover();
  await expect(page.locator("#strategyPreviewTip")).toBeVisible();
  await expect(page.locator("#strategyPreviewTip")).toContainText("买入看涨期权");
  await page.locator("#strategyList .strategy-item").first().dispatchEvent("mouseleave");
  await expect(page.locator("#strategyPreviewTip")).toHaveCount(0);

  let resetDialogType = "";
  let resetDialogMessage = "";
  page.once("dialog", async (dialog) => {
    resetDialogType = dialog.type();
    resetDialogMessage = dialog.message();
    await dialog.dismiss();
  });
  await page.locator("#resetStrategy").click();
  expect(resetDialogType).toBe("confirm");
  expect(resetDialogMessage).toContain("确定要重置");

  await page.locator('[data-concept="delta"]').click();
  await expect(page.locator("#conceptCard")).toBeVisible();
  await expect(page.locator("#conceptContent")).toContainText("当前策略解读");
  await page.locator("#closeConceptCard").click();

  await page.locator('[data-filter="新手"]').click();
  await expect(page.locator("#visibleCount")).toHaveText("5");
  await page.locator('[data-filter="中级"]').click();
  await expect(page.locator("#visibleCount")).toHaveText("21");

  await page.locator('[data-filter="全部"]').click();
  await page.locator("#searchInput").fill("Iron Condor");
  await expect(page.locator("#visibleCount")).toHaveText("4");
  await page.locator('[data-strategy="iron-condor"]').click();
  await expect(page.locator("#strategyTitle")).toHaveText("Iron Condor");

  expect(errors).toEqual([]);
});
