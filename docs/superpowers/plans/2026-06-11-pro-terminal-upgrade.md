# Pro Terminal Upgrade (Heritage Terminal) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Pro skin to an amber-on-black Bloomberg-heritage terminal look, fully scoped under `body.skin-pro`, with the Easy skin pixel-identical.

**Architecture:** One new CSS layer at the end of styles.css scoped `body.skin-pro` (token overrides + form/density + chart fixes + terminal chrome), one `<link>` font import in index.html, one color string change in `renderSkinToggle()`. Spec: `docs/superpowers/specs/2026-06-11-pro-terminal-upgrade-design.md` (authoritative for all values).

**Tech Stack:** Vanilla CSS/JS, Playwright. No build step.

---

## File Map

| File | Change |
|---|---|
| `tests/pro-terminal.spec.js` | **Create** — Playwright assertions on Pro/Easy computed styles |
| `index.html` | **Modify** — IBM Plex Mono `<link>` in head |
| `styles.css` | **Modify** — append `body.skin-pro` terminal section |
| `app.js` | **Modify** — `renderSkinToggle()` Pro-active color `#39c7e5` → `#ffb000` |

---

## Task 1: Failing tests

**Files:** Create `tests/pro-terminal.spec.js`

- [ ] **Step 1: Write the tests** (mirror tests/skin.spec.js URL convention):

```javascript
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
    const el = document.querySelector(".panel");
    const cs = window.getComputedStyle(el);
    return { radius: cs.borderRadius, shadow: cs.boxShadow };
  });
  expect(style.radius).toBe("2px");
  expect(style.shadow).toBe("none");
});

test("easy skin is unaffected by pro terminal layer", async ({ page }) => {
  await page.goto(URL);
  await page.locator("#skinToggle [data-skin='easy']").click();
  const probe = await page.evaluate(() => {
    const cs = window.getComputedStyle(document.body);
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
```

NOTE: the Easy `--cyan` assertion value must match the exact casing in styles.css (`#2563EB`) — getPropertyValue returns the authored string; adjust expectation to actual authored value if lowercase.

- [ ] **Step 2: Run and verify all 5 fail**

```bash
npx playwright test tests/pro-terminal.spec.js --reporter=line
```

---

## Task 2: Font link

**Files:** Modify `index.html` head

- [ ] **Step 1:** After the existing `<link rel="stylesheet" href="./styles.css" />` add:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

Offline behavior: link simply fails, fallback stack applies. No JS dependency.

---

## Task 3: Token + form layer in styles.css

**Files:** Modify `styles.css` — append at end

- [ ] **Step 1: Append the Pro terminal section header + token block** (all values from spec):

```css
/* ============================================================================
   Pro Skin — Heritage Terminal upgrade
   All rules scoped to body.skin-pro. Easy skin and base CSS untouched.
   ============================================================================ */

body.skin-pro {
  --bg:      #050505;
  --rail:    #070708;
  --panel:   #0c0d10;
  --panel-2: #12141a;
  --panel-3: #08090b;
  --line:    #23262f;

  --text:    #f2f0e9;
  --muted:   #a8a496;
  --subtle:  #6e6a5e;

  --cyan:    #ffb000;

  --shadow:  none;

  --mono: 'IBM Plex Mono', 'SF Mono', Monaco, Consolas, monospace;
  background: #050505;
}
```

Check how the base CSS consumes `--shadow` (grep `var(--shadow)`); if panels hardcode the shadow instead of using the token, override with `body.skin-pro .panel { box-shadow: none; }` etc.

- [ ] **Step 2: Append form/density overrides:**

```css
body.skin-pro .panel { border-radius: 2px; box-shadow: none; padding: 14px; }
body.skin-pro .metric,
body.skin-pro .stat { border-radius: 2px; padding: 8px 10px; }
body.skin-pro button,
body.skin-pro .filter-pill,
body.skin-pro input,
body.skin-pro select { border-radius: 2px; }
body.skin-pro .strategy-item { border-radius: 2px; padding: 7px 9px; }
```

VERIFY each selector against the real stylesheet (e.g., filter pills use border-radius 999px — decide: terminal pills become 2px rectangles per the flat language; keep 999px ONLY on the floating skin toggle which is inline-styled and unaffected). Sweep for other radius-8 components in frequent view (cards in learning hub, inputs, toggles) and flatten to 2px under the same scope. Do not touch `.skin-toggle`/`#skinToggle`.

- [ ] **Step 3:** `node --check app.js` (unchanged but cheap), run Task 1 tests — bg/token/panel tests should pass now.

---

## Task 4: Chart layer

**Files:** Modify `styles.css` — continue the Pro section

- [ ] **Step 1: Discover the real chart selectors:**

```bash
grep -n "spot\|payoff-current\|break-line\|main-chart\|mini-svg\|tick" styles.css | head -30
grep -n "var(--amber)" styles.css | head -20
grep -n "theta" styles.css app.js | grep -i "stroke\|class" | head -10
```

- [ ] **Step 2: Append chart overrides** (adapt selector names to what Step 1 found; intent is fixed by the spec):

```css
/* chart containers: flush, near-black */
body.skin-pro .main-chart { background: #050505; border-radius: 0; border-color: #1a1c22; }
body.skin-pro .mini-svg   { background: #050505; border-radius: 0; border-color: #1a1c22; }

/* spot/current-price line: amber → white dashed */
body.skin-pro .spot-line  { stroke: rgba(242, 240, 233, 0.55); }

/* theta curve: would inherit amber via --cyan → restore distinct blue */
body.skin-pro .greek-theta { stroke: var(--blue); }

/* tick/axis text: mono */
body.skin-pro .main-chart text,
body.skin-pro .mini-svg text { font-family: var(--mono); }
```

If the spot line or theta stroke is set inline from app.js rather than via CSS class, report it: the fix then needs `stroke` moved to a class or a `body.skin-pro` descendant selector with `!important` as last resort — prefer adding a class in the SVG-building JS (small, surgical) over `!important`. Breakeven lines stay amber — verify they don't pick up `--cyan`.

---

## Task 5: Terminal chrome

**Files:** Modify `styles.css` — continue the Pro section

- [ ] **Step 1: Mono numerals + tabular figures** (verify selectors exist; extend to other numeric displays found):

```css
body.skin-pro .metric strong,
body.skin-pro .stat strong,
body.skin-pro .stress-table td,
body.skin-pro .stress-table th,
body.skin-pro .legend,
body.skin-pro .strategy-item .meta { font-family: var(--mono); font-variant-numeric: tabular-nums; }
```

Chinese copy must NOT be switched to mono — only numeric/data containers.

- [ ] **Step 2: Zebra tables + amber header rule:**

```css
body.skin-pro .stress-table tbody tr:nth-child(odd) td { background: rgba(255, 176, 0, 0.03); }
body.skin-pro .stress-table th { border-bottom: 1px solid rgba(255, 176, 0, 0.45); }
```

(extend to other data tables found via `grep -n "table" styles.css`)

- [ ] **Step 3: F-key tab prefixes (pure CSS counters):**

```css
body.skin-pro .tools-tabs    { counter-reset: fkey; }
body.skin-pro .learning-tabs { counter-reset: fkey; }
body.skin-pro .tool-tab::before,
body.skin-pro .learning-tab::before {
  counter-increment: fkey;
  content: "F" counter(fkey) " ";
  font-family: var(--mono);
  font-size: 9px;
  opacity: 0.55;
}
```

Verify the tab container class names; run the learning-hub tests after — `toContainText` assertions tolerate prefixes, but `toHaveText`-style exact matches would not (grep the specs; if any exact-match breaks, scope prefixes accordingly).

- [ ] **Step 4: Topbar status style:**

```css
body.skin-pro .topbar h2 {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 15px;
}
body.skin-pro .topbar h2::before { content: "▮ "; color: var(--cyan); }
```

(verify the real topbar heading selector)

---

## Task 6: Toggle pill, acceptance, screenshots, commit

- [ ] **Step 1:** In `renderSkinToggle()` (app.js), change the Pro-active background string `'#39c7e5'` to `'#ffb000'`. `node --check app.js`.

- [ ] **Step 2: Full acceptance:**

```bash
node --check app.js
npx playwright test tests/pro-terminal.spec.js --reporter=line   # 5/5
npm test                                                          # 37/37 (32 + 5)
git diff --check
```

- [ ] **Step 3: Screenshot review (mandatory):** throwaway Playwright script → full-page Pro screenshots of: main workspace w/ chart, Learning Hub roadmap, a data table view, Professional tools; plus one Easy screenshot to confirm zero drift. READ the screenshots; fix contrast/overlap issues (esp. amber-on-amber, F-prefix crowding small tabs, mono overflow in narrow cells) before committing. Delete the script after.

- [ ] **Step 4: Commit:**

```bash
git add tests/pro-terminal.spec.js index.html styles.css app.js
git commit -m "feat: upgrade Pro skin to amber-on-black heritage terminal look"
```
