const { test, expect } = require("@playwright/test");
const path = require("path");

const URL = `file://${path.resolve(__dirname, "../index.html")}`;

test("skin toggle renders and defaults to pro skin", async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator("#skinToggle")).toBeVisible();
  const bodyClass = await page.evaluate(() => document.body.className);
  expect(bodyClass).toMatch(/skin-pro/);
  expect(bodyClass).not.toMatch(/skin-easy/);
});

test("clicking Easy applies skin-easy class to body", async ({ page }) => {
  await page.goto(URL);
  await page.locator("#skinToggle [data-skin='easy']").click();
  await expect(page.locator("body")).toHaveClass(/skin-easy/);
});

test("skin-easy persists across page reload via localStorage", async ({ page }) => {
  await page.goto(URL);
  await page.locator("#skinToggle [data-skin='easy']").click();
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/skin-easy/);
});

test("skin-easy sets light background color on body", async ({ page }) => {
  await page.goto(URL);
  await page.locator("#skinToggle [data-skin='easy']").click();
  const bg = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  // #F8FAFC = rgb(248, 250, 252)
  expect(bg).toBe("rgb(248, 250, 252)");
});

test("clicking Pro restores dark skin and persists", async ({ page }) => {
  await page.goto(URL);
  // set easy first
  await page.locator("#skinToggle [data-skin='easy']").click();
  await expect(page.locator("body")).toHaveClass(/skin-easy/);
  // switch back to pro
  await page.locator("#skinToggle [data-skin='pro']").click();
  await expect(page.locator("body")).toHaveClass(/skin-pro/);
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/skin-pro/);
});

test("returning user with learning data but no skin key defaults to pro", async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("os_d1_learning", JSON.stringify({ completedModules: ["m1"] }));
  });
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/skin-pro/);
  const hasEasy = await page.evaluate(() => document.body.classList.contains("skin-easy"));
  expect(hasEasy).toBe(false);
});
