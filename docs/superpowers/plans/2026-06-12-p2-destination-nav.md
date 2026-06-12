# P2 — Destination Nav + Library + Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (For this project execution is handed to Codex; the steps are written to be followed verbatim with no extra context.)

**Goal:** Introduce the four-destination primary nav (转型计划 / 策略库 / 实验室 / 练习场) and make the app show one destination at a time, reusing existing renderers. Plan + Practice temporarily host the existing Learning Hub; Library shows the existing strategy list as a grid; Lab shows the P1 `#labRoot` analysis.

**Architecture:** Add a slim left nav as the first child of `.app-shell` and switch its grid to `88px + 1fr`. Because exactly one of `.strategy-rail` (library) / `.workspace` (everything else) is ever shown, `display:none` removes the hidden one from the grid flow — no extra wrapper needed. A new `#labStage` wraps the non-hub workspace content (the P1 lab + professional panels + coverage/disclaimer). Destination is a CSS concern: `applyDestination()` sets `document.body.dataset.dest`, and `body[data-dest=…]` rules show/hide regions. Persisted in its own localStorage key `os_d1_dest` (read by the existing inline pre-paint script to avoid a flash), defaulting to `plan`.

**Tech Stack:** Vanilla JS (ES5-style globals on `window`), hand-rolled SVG, Playwright e2e. No build step. Spec: `docs/superpowers/specs/2026-06-12-unified-plan-library-lab-ia-design.md`. Builds on P1 (`docs/superpowers/plans/2026-06-12-p1-lab-componentization.md`, committed `96dba9b`).

---

## Context the implementer needs

- `index.html` layout: `<main class="app-shell">` contains `<aside class="strategy-rail">` (search + `#filterRow` + stat list + `#strategyList`) then `<section class="workspace">`. The workspace contains, in order: `.topbar` (controls + strategy title), `#learningPathBar`, `#learningHubPanel` (the 12-tab Learning Hub, ends ~line 150), then the P1 `#labHome` + `#labRoot` (lab body), then professional/interview/tools/concepts panels, `.coverage-panel`, `.disclaimer-panel`. The workspace `</section>` is at ~line 460, `</main>` at ~461.
- `.app-shell` CSS (styles.css ~34): `display:grid; grid-template-columns: 340px minmax(780px,1fr); min-height:100vh;`. `.strategy-rail` is `position:sticky; height:100vh; width:340px (from grid)`. There is a mobile media query (~line 306) `.app-shell { grid-template-columns: 1fr }`.
- `renderStrategyList()` (app.js ~1132) fills `#strategyList` with `.strategy-item` buttons (each `data-strategy=…`) and wires hover previews. `renderLearningHub()` (app.js ~3821) renders all 12 learning panels; `renderLearningTabs()` (app.js ~2672) toggles `.active` on `.learning-tab` buttons and `.learning-panel` panels based on `state.learning.activeLearningTab` (default `"roadmap"`, app.js ~249). The scenarios panel is `.learning-panel[data-learning-panel="scenarios"]`.
- `renderLab()` (added in P1, app.js ~3845) renders the lab into `#labRoot` wherever it lives.
- `state` object literal is at app.js line 10. `boot()` (app.js ~4400) ends with `applySkin(uiSkin())` at ~4442. `handleClick(event)` (app.js ~4084) is the delegated click handler; its first checks already include `labOverlayClose` and `[data-skin]`.
- The inline pre-paint script is in `index.html` right after `<body>` (~line 13): `document.body.className += (localStorage.getItem("os_d1_skin") === "easy" ? " skin-easy" : " skin-pro");`.
- Tests run against `file://…/index.html`; globals are reachable via `page.evaluate`. CSS `display:none` makes Playwright `toBeHidden()` pass and `toBeVisible()` fail.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Add `<nav class="primary-nav">` (4 destination buttons) as first child of `.app-shell`; wrap non-hub workspace content in `<div id="labStage">`; extend the inline pre-paint script to set `data-dest` |
| `app.js` | Add `state.destination`, `uiDestination()`, `applyDestination()`, `renderPrimaryNav()`; add `[data-dest]` check in `handleClick`; call from `boot()` |
| `styles.css` | `.primary-nav` styling; `.app-shell` columns → `88px minmax(0,1fr)`; `body[data-dest=…]` show/hide rules; library grid |
| `tests/destination-nav.spec.js` | **Create** — nav render, default, switching, persistence, region visibility |

---

## Task 1: Write failing tests for the destination nav

**Files:**
- Create: `tests/destination-nav.spec.js`

- [ ] **Step 1: Create the test file**

```javascript
const { test, expect } = require("@playwright/test");
const path = require("path");

const URL = `file://${path.resolve(__dirname, "../index.html")}`;

test("primary nav renders 4 destinations and defaults to plan", async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator(".primary-nav .primary-nav-item")).toHaveCount(4);
  await expect(page.locator('.primary-nav-item[data-dest="plan"]')).toHaveClass(/active/);
  const dest = await page.evaluate(() => document.body.dataset.dest);
  expect(dest).toBe("plan");
  // plan shows the learning hub, hides rail and lab stage
  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator(".strategy-rail")).toBeHidden();
  await expect(page.locator("#labStage")).toBeHidden();
});

test("library destination shows the strategy list, hides the workspace", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="library"]').click();
  await expect(page.locator(".strategy-rail")).toBeVisible();
  await expect(page.locator(".workspace")).toBeHidden();
  await expect(page.locator("#strategyList .strategy-item").first()).toBeVisible();
});

test("lab destination shows the lab analysis, hides the learning hub", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="lab"]').click();
  await expect(page.locator("#labStage")).toBeVisible();
  await expect(page.locator("#labStage #labRoot #mainChart svg")).toHaveCount(1);
  await expect(page.locator("#learningHubPanel")).toBeHidden();
});

test("practice destination shows the learning hub on the scenarios tab", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator('.learning-panel[data-learning-panel="scenarios"]')).toHaveClass(/active/);
});

test("destination persists across reload", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="library"]').click();
  await page.reload();
  const dest = await page.evaluate(() => document.body.dataset.dest);
  expect(dest).toBe("library");
  await expect(page.locator(".strategy-rail")).toBeVisible();
});
```

- [ ] **Step 2: Run and verify all 5 fail**

```bash
npx playwright test tests/destination-nav.spec.js --reporter=line
```

Expected: failures (`.primary-nav`, `#labStage`, `data-dest` do not exist yet).

---

## Task 2: index.html — primary nav, `#labStage`, pre-paint default

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the primary nav as the first child of `.app-shell`**

Find:

```html
    <main class="app-shell">
      <aside class="strategy-rail" aria-label="策略库">
```

Replace with:

```html
    <main class="app-shell">
      <nav class="primary-nav" aria-label="主导航">
        <button class="primary-nav-item active" type="button" data-dest="plan"><span class="primary-nav-label">转型<br>计划</span></button>
        <button class="primary-nav-item" type="button" data-dest="library"><span class="primary-nav-label">策略库</span></button>
        <button class="primary-nav-item" type="button" data-dest="lab"><span class="primary-nav-label">实验室</span></button>
        <button class="primary-nav-item" type="button" data-dest="practice"><span class="primary-nav-label">练习场</span></button>
      </nav>
      <aside class="strategy-rail" aria-label="策略库">
```

- [ ] **Step 2: Open the `#labStage` wrapper before `#labHome`**

Find (the P1 anchors):

```html
        <div id="labHome"></div>
        <div id="labRoot">
```

Replace with:

```html
        <div id="labStage">
        <div id="labHome"></div>
        <div id="labRoot">
```

- [ ] **Step 3: Close `#labStage` before the workspace `</section>`**

Find the end of the workspace — the disclaimer panel followed by the workspace close:

```html
        <section class="panel disclaimer-panel" aria-label="交易免责声明">
          <p>本工具仅用于期权策略学习、网页复刻和情景模拟，不构成证券、期权、税务、法律或投资建议。所有图表均为简化模型，真实交易会受报价、流动性、滑点、手续费、保证金、提前行权和税务影响。</p>
        </section>
      </section>
    </main>
```

Replace with:

```html
        <section class="panel disclaimer-panel" aria-label="交易免责声明">
          <p>本工具仅用于期权策略学习、网页复刻和情景模拟，不构成证券、期权、税务、法律或投资建议。所有图表均为简化模型，真实交易会受报价、流动性、滑点、手续费、保证金、提前行权和税务影响。</p>
        </section>
        </div><!-- /#labStage -->
      </section>
    </main>
```

- [ ] **Step 4: Extend the inline pre-paint script to set `data-dest`**

Find:

```html
    <script>document.body.className += (localStorage.getItem("os_d1_skin") === "easy" ? " skin-easy" : " skin-pro");</script>
```

Replace with:

```html
    <script>document.body.className += (localStorage.getItem("os_d1_skin") === "easy" ? " skin-easy" : " skin-pro"); document.body.dataset.dest = localStorage.getItem("os_d1_dest") || "plan";</script>
```

- [ ] **Step 5: Verify structure**

```bash
node -e "const h=require('fs').readFileSync('index.html','utf8');console.log('nav:',h.includes('class=\"primary-nav\"'),'items:',(h.match(/data-dest=/g)||[]).length,'labStage:',(h.match(/id=\"labStage\"/g)||[]).length,'predest:',h.includes('dataset.dest'));"
```

Expected: `nav: true items: 4 labStage: 1 predest: true` (4 `data-dest` buttons, one `#labStage`, pre-paint script sets `dataset.dest`).

---

## Task 3: app.js — destination state, apply, nav render, wiring

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `destination` to the `state` object literal**

Find (app.js ~line 15, inside `const state = {`):

```js
  mode: "basic", // "basic" | "professional" | "interview"
  labOverlayOpen: false,
```

Replace with:

```js
  mode: "basic", // "basic" | "professional" | "interview"
  labOverlayOpen: false,
  destination: localStorage.getItem("os_d1_dest") || "plan",
```

- [ ] **Step 2: Add the destination functions**

Add these immediately after `closeLabOverlay()` (added in P1, app.js ~3895):

```js
function uiDestination() {
  return localStorage.getItem("os_d1_dest") || "plan";
}

function renderPrimaryNav() {
  var items = document.querySelectorAll(".primary-nav-item");
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle("active", items[i].dataset.dest === state.destination);
  }
}

function applyDestination(dest) {
  var valid = ["plan", "library", "lab", "practice"];
  if (valid.indexOf(dest) === -1) dest = "plan";
  state.destination = dest;
  document.body.dataset.dest = dest;
  localStorage.setItem("os_d1_dest", dest);
  if (dest === "practice") {
    state.learning.activeLearningTab = "scenarios";
    renderLearningTabs();
  }
  if (dest === "lab") {
    renderLab(); // re-measure chart at the lab-stage width
  }
  renderPrimaryNav();
}
```

- [ ] **Step 3: Add the `[data-dest]` click handler**

Find `function handleClick(event) {` (app.js ~4084) and the existing first checks:

```js
function handleClick(event) {
  if (event.target.id === "labOverlayClose" || event.target.matches("[data-lab-overlay-dismiss]")) {
    closeLabOverlay();
    return;
  }
```

Insert this check immediately after that block (before the `[data-skin]` check):

```js
  var navItem = event.target.closest("[data-dest]");
  if (navItem) {
    applyDestination(navItem.dataset.dest);
    return;
  }
```

- [ ] **Step 4: Initialize destination at the end of `boot()`**

Find the end of `boot()` — the Escape listener added in P1, right after `applySkin(uiSkin())`:

```js
  applySkin(uiSkin());
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.labOverlayOpen) closeLabOverlay();
  });
}
```

Replace with:

```js
  applySkin(uiSkin());
  applyDestination(uiDestination());
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.labOverlayOpen) closeLabOverlay();
  });
}
```

- [ ] **Step 5: Syntax check**

```bash
node --check app.js
```

Expected: no output.

---

## Task 4: styles.css — nav, columns, destination toggles, library grid

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Change the app-shell grid to make room for the nav**

Find (styles.css ~34):

```css
.app-shell {
  display: grid;
  grid-template-columns: 340px minmax(780px, 1fr);
  min-height: 100vh;
}
```

Replace with:

```css
.app-shell {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  min-height: 100vh;
}
```

- [ ] **Step 2: Append the nav + destination rules at the end of styles.css**

```css
/* ============================================================================
   P2 — Primary destination nav + destination switching
   Exactly one of .strategy-rail (library) / .workspace (everything else) shows,
   so display:none keeps the grid at two effective columns.
   ============================================================================ */
.primary-nav {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 8px;
  border-right: 1px solid var(--line);
  background: var(--rail);
}
.primary-nav-item {
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  padding: 10px 4px;
  cursor: pointer;
  text-align: center;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.primary-nav-item:hover { color: var(--text); background: var(--panel-2); }
.primary-nav-item.active {
  color: var(--cyan);
  border-color: var(--line);
  background: var(--panel-2);
}

/* Library destination: show the rail (as a grid), hide the workspace */
body:not([data-dest="library"]) .strategy-rail { display: none; }
body[data-dest="library"] .workspace { display: none; }
body[data-dest="library"] .strategy-rail {
  position: static;
  height: auto;
  overflow: visible;
}
body[data-dest="library"] .strategy-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

/* Within the workspace: learning hub (plan/practice) vs lab stage (lab) */
body[data-dest="lab"] #learningHubPanel { display: none; }
body[data-dest="plan"] #labStage,
body[data-dest="practice"] #labStage { display: none; }
```

- [ ] **Step 3: Run the destination-nav suite**

```bash
npx playwright test tests/destination-nav.spec.js --reporter=line
```

Expected: all 5 tests PASS.

---

## Task 5: Regression + commit

- [ ] **Step 1: Full acceptance**

```bash
node --check app.js
npm test
git diff --check
```

Expected: `node --check` clean; **all** existing tests still pass plus the 5 new ones; `git diff --check` clean.

- [ ] **Step 2: Browser smoke check**

Open `index.html`. Verify:
- Slim left nav with 转型计划 / 策略库 / 实验室 / 练习场; opens on 转型计划 showing the Learning Hub (no strategy rail, no chart panels below).
- 策略库 → the strategy list appears as a multi-column grid; clicking an item still selects it (state updates; visible again when you return to 实验室).
- 实验室 → the payoff chart + Greeks + metrics + legs (the P1 lab) shown; learning hub hidden.
- 练习场 → Learning Hub on the 场景题库 tab.
- Reload on any destination returns to it (no flash of the wrong destination, thanks to the pre-paint script).
- Toggle Easy/Pro and 初级/进阶/专业 — both still work in every destination.

- [ ] **Step 3: Commit**

```bash
git add index.html app.js styles.css tests/destination-nav.spec.js
git commit -m "feat(P2): add four-destination primary nav with library and lab destinations"
```

---

## Notes for P3 (do not implement here)

- P3 rebuilds 转型计划 into the sector spine + module stream with embedded strategy chips that call `openLabOverlay(id)` (from P1), and folds the per-sector deep content (vol/dealer/exotics/research) into module cards — dissolving the 12-tab hub. Until then, `plan` and `practice` both render `#learningHubPanel`.
- `applyDestination` already re-renders the lab on entering `lab` and switches to the scenarios tab on entering `practice`; P3/P4 will replace those transitional behaviors.
- `os_d1_dest` is intentionally a separate key from `os_d1_learning` so the pre-paint script can read it cheaply; keep it separate.
