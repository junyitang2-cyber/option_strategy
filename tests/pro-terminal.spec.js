const { test, expect } = require("@playwright/test");
const path = require("path");

const URL = `file://${path.resolve(__dirname, "../index.html")}`;

test("pro skin has OLED near-black background", async ({ page }) => {
  await page.goto(URL);
  const bg = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  expect(bg).toBe("rgb(5, 5, 5)"); // #050505
});

test("pro skin active elements are amber", async ({ page }) => {
  await page.goto(URL);
  const cyanToken = await page.evaluate(() =>
    window.getComputedStyle(document.body).getPropertyValue("--cyan").trim()
  );
  expect(cyanToken.toLowerCase()).toBe("#ffb000");
});

test("pro skin panels are flat with 2px radius", async ({ page }) => {
  await page.goto(URL);
  const style = await page.evaluate(() => {
    var el = document.querySelector(".panel");
    var cs = window.getComputedStyle(el);
    return { radius: cs.borderRadius, shadow: cs.boxShadow };
  });
  expect(style.radius).toBe("2px");
  expect(style.shadow).toBe("none");
});

test("easy skin is unaffected by pro terminal layer", async ({ page }) => {
  await page.goto(URL);
  await page.locator("#skinToggle [data-skin='easy']").click();
  const probe = await page.evaluate(() => {
    var cs = window.getComputedStyle(document.body);
    return { bg: cs.backgroundColor, cyan: cs.getPropertyValue("--cyan").trim() };
  });
  expect(probe.bg).toBe("rgb(248, 250, 252)");
  expect(probe.cyan).toBe("#2563EB");
});

test("skin toggle pro button is amber when pro active", async ({ page }) => {
  await page.goto(URL);
  const bg = await page.evaluate(() =>
    window.getComputedStyle(document.querySelector("#skinToggle [data-skin='pro']")).backgroundColor
  );
  expect(bg).toBe("rgb(255, 176, 0)");
});
