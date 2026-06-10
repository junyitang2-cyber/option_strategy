# Easy / Pro Dual-Skin System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating Easy/Pro visual skin toggle that switches the entire UI between a light-mode SaaS skin (Easy) and the existing dark terminal skin (Pro), persisted in localStorage.

**Architecture:** CSS-only skin switch: override all CSS custom properties at `body.skin-easy` scope; add a fixed floating pill toggle rendered by `renderSkinToggle()` and wired into the existing `handleClick` delegated handler; no changes to data files or content logic.

**Tech Stack:** Vanilla JS (ES5-style globals), hand-written CSS, Playwright e2e tests. No build step — changes are live on file save.

---

## File Map

| File | Change |
|---|---|
| `tests/skin.spec.js` | **Create** — Playwright tests for skin toggle |
| `app.js` | **Modify** — add `uiSkin()`, `applySkin()`, `renderSkinToggle()`; wire into `boot()` and `handleClick()` |
| `index.html` | **Modify** — add `<div id="skinToggle">` fixed container before `</body>` |
| `styles.css` | **Modify** — add `body.skin-easy` CSS override block at end of file |

---

## Task 1: Write Failing Tests

**Files:**
- Create: `tests/skin.spec.js`

- [ ] **Step 1: Create the test file**

```javascript
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
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
npx playwright test tests/skin.spec.js --reporter=line
```

Expected: 5 failures (elements don't exist yet).

---

## Task 2: Skin Helpers in app.js

**Files:**
- Modify: `app.js` — add helpers after line 4239 (just before `function boot()`)

- [ ] **Step 1: Add `uiSkin()` and `applySkin()` functions**

Find `function boot()` (around line 4241) and insert the following block immediately above it:

```javascript
// ============================================================================
// Skin System
// ============================================================================
function uiSkin() {
  return localStorage.getItem('os_d1_skin') || 'pro';
}

function applySkin(skin) {
  var isPro = skin !== 'easy';
  document.body.classList.toggle('skin-easy', !isPro);
  document.body.classList.toggle('skin-pro', isPro);
  localStorage.setItem('os_d1_skin', isPro ? 'pro' : 'easy');
  renderSkinToggle();
}
```

- [ ] **Step 2: Call `applySkin` in `boot()`**

Find the `boot()` function. At the end of `boot()`, after `renderAll()` and `handleModeToggle(state.mode)`, add:

```javascript
  applySkin(uiSkin());
```

The end of `boot()` should look like:

```javascript
  renderAll();

  // Initialize mode after rendering
  handleModeToggle(state.mode);

  // Initialize tool tabs for professional/interview modes
  if (state.mode === "professional" || state.mode === "interview") {
    switchTool(state.activeTool);
  }

  applySkin(uiSkin());
}
```

- [ ] **Step 3: Verify syntax**

```bash
node --check app.js
```

Expected: no output (clean).

---

## Task 3: Skin Toggle UI

**Files:**
- Modify: `index.html` — add fixed container
- Modify: `app.js` — add `renderSkinToggle()` and click handler

- [ ] **Step 1: Add fixed container to index.html**

Find `  </body>` (last line before `</html>`, around line 455) and insert before it:

```html
  <div id="skinToggle" style="position:fixed;bottom:20px;right:20px;z-index:50;"></div>
```

- [ ] **Step 2: Add `renderSkinToggle()` to app.js**

Add this function immediately after the `applySkin()` function you added in Task 2:

```javascript
function renderSkinToggle() {
  var el = document.getElementById('skinToggle');
  if (!el) return;
  var skin = uiSkin();
  el.innerHTML =
    '<div style="background:#1c202b;border:1px solid #303646;border-radius:999px;padding:4px 5px;display:flex;gap:3px;box-shadow:0 4px 20px rgba(0,0,0,0.45);">' +
      '<button data-skin="easy" type="button" style="border:0;cursor:pointer;font-size:11px;font-weight:700;padding:5px 14px;border-radius:999px;transition:all 0.15s;background:' + (skin === 'easy' ? '#2563EB' : 'transparent') + ';color:' + (skin === 'easy' ? '#fff' : '#778195') + ';">Easy</button>' +
      '<button data-skin="pro" type="button" style="border:0;cursor:pointer;font-size:11px;font-weight:700;padding:5px 14px;border-radius:999px;transition:all 0.15s;background:' + (skin !== 'easy' ? '#39c7e5' : 'transparent') + ';color:' + (skin !== 'easy' ? '#000' : '#778195') + ';">Pro</button>' +
    '</div>';
}
```

- [ ] **Step 3: Wire click handler in `handleClick()`**

Find `function handleClick(event)` (around line 3970). Add this block as the **first** `if` check inside the function, before any existing checks:

```javascript
  if (event.target.matches("[data-skin]")) {
    applySkin(event.target.dataset.skin);
    return;
  }
```

- [ ] **Step 4: Verify syntax**

```bash
node --check app.js
```

Expected: no output.

- [ ] **Step 5: Run skin toggle tests — should now pass tests 1 and 2**

```bash
npx playwright test tests/skin.spec.js --reporter=line
```

Expected: tests 1–2 pass, tests 3–5 may still fail (CSS not applied yet).

---

## Task 4: Easy Skin — CSS Variable Overrides

**Files:**
- Modify: `styles.css` — append Easy skin block

- [ ] **Step 1: Append the following block to the very end of `styles.css`**

```css
/* ============================================================================
   Easy Skin — light mode overrides
   All rules scoped to body.skin-easy.
   Pro skin = existing CSS, zero changes needed.
   ============================================================================ */

body.skin-easy {
  color-scheme: light;
  background: #F8FAFC;
  color: #0F172A;

  /* Override all CSS custom properties so var(--*) usages update automatically */
  --bg:      #F8FAFC;
  --rail:    #F1F5F9;
  --panel:   #FFFFFF;
  --panel-2: #F8FAFC;
  --panel-3: #FAFBFE;
  --line:    #E2E8F0;

  --text:    #0F172A;
  --muted:   #64748B;
  --subtle:  #94A3B8;

  --cyan:    #2563EB;
  --green:   #16A34A;
  --red:     #DC2626;
  --amber:   #D97706;
  --violet:  #7C3AED;
  --blue:    #6366F1;

  --shadow:  0 1px 4px rgba(0, 0, 0, 0.06);
}
```

- [ ] **Step 2: Verify syntax (CSS has no check, confirm no JS errors)**

```bash
node --check app.js && echo "OK"
```

- [ ] **Step 3: Run full skin tests**

```bash
npx playwright test tests/skin.spec.js --reporter=line
```

Expected: test 4 ("sets light background color") should now pass. All 5 tests should pass.

---

## Task 5: Easy Skin — Component-Specific Overrides

These cover values hardcoded in CSS that the variable override in Task 4 cannot reach.

**Files:**
- Modify: `styles.css` — append to the Easy skin block

- [ ] **Step 1: Append component overrides immediately after the `body.skin-easy {}` block from Task 4**

```css
/* Panels and cards */
body.skin-easy .panel         { border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
body.skin-easy .metric        { border-radius: 16px; background: #FFFFFF; border-color: #E2E8F0; }
body.skin-easy .metric.positive { background: #F0FDF4; border-color: #BBF7D0; }
body.skin-easy .metric.negative { background: #FFF1F2; border-color: #FECACA; }
body.skin-easy .metric strong { color: #0F172A; font-family: inherit; }
body.skin-easy .metric span   { color: #64748B; }

/* Chart containers — hardcoded backgrounds */
body.skin-easy .main-chart    { background: #FAFBFE; border-color: #E2E8F0; }
body.skin-easy .mini-svg      { background: #FAFBFE; border-color: #E2E8F0; }

/* SVG fill areas — hardcoded rgba values */
body.skin-easy .profit-area   { fill: rgba(22, 163, 74, 0.22); }
body.skin-easy .loss-area     { fill: rgba(220, 38, 38, 0.18); }

/* SVG grid and zero lines — hardcoded rgba values */
body.skin-easy .grid-line     { stroke: #E2E8F0; }
body.skin-easy .zero-line     { stroke: rgba(15, 23, 42, 0.35); }

/* Strategy hover preview */
body.skin-easy .strategy-preview-tip { background: #FFFFFF; border-color: #BFDBFE; color: #0F172A; }
body.skin-easy .strategy-preview-tip span:first-child { color: #2563EB; }

/* Inputs and selects */
body.skin-easy .search-box input,
body.skin-easy .control-field input,
body.skin-easy .leg-field input,
body.skin-easy .leg-field select,
body.skin-easy .parity-inputs input,
body.skin-easy .sprint-controls select,
body.skin-easy .vol-calc-controls input { background: #FFFFFF; color: #0F172A; border-color: #E2E8F0; }

body.skin-easy .search-box input:focus,
body.skin-easy .control-field input:focus,
body.skin-easy .leg-field input:focus,
body.skin-easy .leg-field select:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }

/* Range slider */
body.skin-easy input[type="range"] { accent-color: #2563EB; }

/* Tabs */
body.skin-easy .learning-tabs,
body.skin-easy .tools-tabs       { border-bottom-color: #E2E8F0; }
body.skin-easy .learning-tab,
body.skin-easy .tool-tab         { color: #64748B; }
body.skin-easy .learning-tab.active,
body.skin-easy .tool-tab.active  { color: #2563EB; border-bottom-color: #2563EB; }

/* Filter pills */
body.skin-easy .filter-pill      { background: #FFFFFF; border-color: #E2E8F0; color: #64748B; }
body.skin-easy .filter-pill.is-active { background: #DBEAFE; border-color: #93C5FD; color: #1D4ED8; }
body.skin-easy .vol-playbook-filter,
body.skin-easy .exotics-filter,
body.skin-easy .exotics-risk-filter,
body.skin-easy .sprint-topic-filter { background: #F1F5F9; border-color: #E2E8F0; color: #64748B; }
body.skin-easy .vol-playbook-filter.active,
body.skin-easy .exotics-filter.active,
body.skin-easy .exotics-risk-filter.active,
body.skin-easy .sprint-topic-filter.active { border-color: #2563EB; color: #2563EB; }

/* Learning Hub cards */
body.skin-easy .roadmap-card,
body.skin-easy .module-card,
body.skin-easy .bridge-card,
body.skin-easy .comparison-card,
body.skin-easy .client-drill-card,
body.skin-easy .vol-playbook-card,
body.skin-easy .vol-framework-card,
body.skin-easy .dealer-workflow-card,
body.skin-easy .dealer-attribution-card,
body.skin-easy .exotics-bridge-card,
body.skin-easy .structuring-case-card,
body.skin-easy .exotics-risk-drill-card,
body.skin-easy .model-limit-card,
body.skin-easy .sprint-question-card,
body.skin-easy .dashboard-card,
body.skin-easy .scenario-card      { background: #FFFFFF; border-color: #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

body.skin-easy .client-drill-step  { background: #F8FAFC; border-color: #E2E8F0; }
body.skin-easy .vol-framework-calculator { background: #FFFFFF; border-color: #E2E8F0; }
body.skin-easy .vol-calc-result    { background: #F8FAFC; border-color: #E2E8F0; }
body.skin-easy .sprint-score-row   { background: #F8FAFC; border-color: #E2E8F0; }
body.skin-easy .notebook-item      { background: #F8FAFC; }

/* Sector color stripes for Learning Hub module cards (Easy skin only) */
body.skin-easy .roadmap-card[data-sector="A"] { border-left: 4px solid #2563EB; }
body.skin-easy .roadmap-card[data-sector="B"] { border-left: 4px solid #6366F1; }
body.skin-easy .roadmap-card[data-sector="C"] { border-left: 4px solid #7C3AED; }
body.skin-easy .roadmap-card[data-sector="D"] { border-left: 4px solid #D97706; }
body.skin-easy .roadmap-card[data-sector="E"] { border-left: 4px solid #059669; }

/* Mode toggle and language toggle */
body.skin-easy .mode-toggle,
body.skin-easy .language-toggle  { background: #F1F5F9; }
body.skin-easy .mode-btn          { color: #64748B; }
body.skin-easy .mode-btn:hover    { background: #E2E8F0; color: #0F172A; }
body.skin-easy .mode-btn.active   { background: #2563EB; color: #FFFFFF; }

/* Stress table */
body.skin-easy .stress-table th   { background: #F1F5F9; color: #2563EB; }
body.skin-easy .stress-table td   { background: #FFFFFF; }
body.skin-easy .stress-table th,
body.skin-easy .stress-table td   { border-color: #E2E8F0; }

/* Chart tooltip */
body.skin-easy .chart-tooltip      { background: rgba(255,255,255,0.96); border-color: #BFDBFE; color: #64748B; }
body.skin-easy .chart-tooltip strong { color: #0F172A; }

/* Diff badges — keep same colors (semantic, not skin-dependent) */

/* Disclaimer panel */
body.skin-easy .disclaimer-panel   { background: #FFFBEB; border-color: rgba(217,119,6,0.35); }
```

- [ ] **Step 2: Run full test suite to check for regressions**

```bash
npm test
```

Expected: all existing tests pass (Pro skin behavior is unchanged). Skin tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/skin.spec.js app.js index.html styles.css
git commit -m "feat: add Easy/Pro visual skin toggle with light-mode Easy skin"
```

---

## Task 6: Smoke Check and Acceptance

- [ ] **Step 1: Run syntax and full test suite**

```bash
node --check app.js && npm test
```

Expected: all tests pass.

- [ ] **Step 2: Manual browser check — Pro skin (regression)**

Open `index.html` in browser. Verify:
- Page looks identical to before (dark terminal style)
- Easy/Pro pill visible in bottom-right corner
- Pro button is highlighted (cyan fill)
- Switching strategies, using sliders, opening Learning Hub all work

- [ ] **Step 3: Manual browser check — Easy skin**

Click "Easy" button. Verify:
- Page background switches to light (#F8FAFC)
- Metric cards show tinted backgrounds (green for profit, red for loss)
- Charts have lighter background and blue curve
- Learning Hub cards are white with light borders
- Mode toggle (初级/进阶/专业) shows blue active state
- Reload page — Easy skin persists

- [ ] **Step 4: Verify `git diff --check`**

```bash
git diff --check
```

Expected: no output.
