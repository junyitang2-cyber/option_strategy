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

test("pro skin has no cyan leg color on multi-leg strategy", async ({ page }) => {
  await page.goto(URL);
  // Select Iron Condor (4 legs) — data-strategy attribute derived from slugified name
  await page.locator("[data-strategy='iron-condor']").click();
  // Switch to per-leg view to render leg legend and color chips
  await page.locator("#viewPerLeg").click();
  // Check computed color of leg index 2 legend label (leg-check-label for leg index 2)
  const leg2Color = await page.evaluate(() => {
    // leg-check-label elements are in the chart legend in per-leg mode
    var labels = document.querySelectorAll(".leg-check-label");
    if (labels.length < 3) return "not-enough-legs";
    return window.getComputedStyle(labels[2]).color;
  });
  // Must NOT be the raw cyan rgb(57, 199, 229) — var(--leg-2) must resolve to blue in Pro
  expect(leg2Color).not.toBe("rgb(57, 199, 229)");
  expect(leg2Color).toBe("rgb(99, 155, 255)"); // #639bff
  // Also verify leg-color-bar background for leg 2 in the legs editor
  const leg2BarBg = await page.evaluate(() => {
    var bars = document.querySelectorAll(".leg-color-bar");
    if (bars.length < 3) return "not-enough-bars";
    return window.getComputedStyle(bars[2]).backgroundColor;
  });
  expect(leg2BarBg).not.toBe("rgb(57, 199, 229)");
  expect(leg2BarBg).toBe("rgb(99, 155, 255)");
});

test("pro skin primary button is flat amber", async ({ page }) => {
  await page.goto(URL);
  const cs = await page.evaluate(() => {
    var el = document.querySelector(".primary-button");
    var s = window.getComputedStyle(el);
    return { bg: s.backgroundImage + s.backgroundColor, color: s.color };
  });
  expect(cs.bg).toContain("rgb(255, 176, 0)");
  expect(cs.bg).not.toContain("gradient");
  expect(cs.color).toBe("rgb(0, 0, 0)");
});
