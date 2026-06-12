const { test, expect } = require("@playwright/test");
const path = require("path");

const URL = `file://${path.resolve(__dirname, "../index.html")}`;

test("lab renders into #labRoot by default and overlay is dormant", async ({ page }) => {
  await page.goto(URL);
  // labRoot exists and holds the chart
  await expect(page.locator("#labRoot #mainChart svg")).toHaveCount(1);
  // labRoot sits in its home slot (a child of the workspace, after #labHome)
  const homeHasRoot = await page.evaluate(() => {
    const home = document.getElementById("labHome");
    return home && home.nextElementSibling && home.nextElementSibling.id === "labRoot";
  });
  expect(homeHasRoot).toBe(true);
  // overlay present but hidden
  await expect(page.locator("#labOverlay")).toBeHidden();
});

test("openLabOverlay moves #labRoot into the overlay and shows it", async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => window.openLabOverlay("long-call"));
  await expect(page.locator("#labOverlay")).toBeVisible();
  // labRoot now lives inside the overlay slot
  const inOverlay = await page.evaluate(() => {
    const slot = document.getElementById("labOverlaySlot");
    return !!slot && !!slot.querySelector("#labRoot");
  });
  expect(inOverlay).toBe(true);
  // the chart still renders inside the relocated subtree
  await expect(page.locator("#labOverlay #labRoot #mainChart svg")).toHaveCount(1);
});

test("closeLabOverlay restores #labRoot to its home slot and hides overlay", async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => window.openLabOverlay("long-call"));
  await page.evaluate(() => window.closeLabOverlay());
  await expect(page.locator("#labOverlay")).toBeHidden();
  const homeHasRoot = await page.evaluate(() => {
    const home = document.getElementById("labHome");
    return home && home.nextElementSibling && home.nextElementSibling.id === "labRoot";
  });
  expect(homeHasRoot).toBe(true);
  await expect(page.locator("#labRoot #mainChart svg")).toHaveCount(1);
});

test("close button and Escape close the overlay", async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => window.openLabOverlay("long-call"));
  await page.locator("#labOverlayClose").click();
  await expect(page.locator("#labOverlay")).toBeHidden();
  // reopen, then Escape
  await page.evaluate(() => window.openLabOverlay("long-call"));
  await page.keyboard.press("Escape");
  await expect(page.locator("#labOverlay")).toBeHidden();
});
