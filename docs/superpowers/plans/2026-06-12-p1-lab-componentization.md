# P1 — Lab Componentization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the strategy-detail "lab" (payoff chart + Greeks + scenario controls + metrics + legs + notes) into a single relocatable DOM subtree with a reusable overlay host, with zero visible change to the app.

**Architecture:** The lab body is already one contiguous block in `index.html` (`.layout-grid` + `.education-panel`). Wrap it in `#labRoot`. Add `renderLab()` (the existing 8 lab render calls, grouped) and a dormant fullscreen overlay host. `openLabOverlay(id)` **moves** `#labRoot` into the overlay and re-renders; `closeLabOverlay()` moves it back. Because the lab is a single relocated subtree, **none of the existing render functions change** — they keep finding their elements by id wherever `#labRoot` currently lives. This is the foundation P2–P4 build on.

**Tech Stack:** Vanilla JS (ES5-style globals on `window`), hand-rolled SVG, Playwright e2e. No build step. Spec: `docs/superpowers/specs/2026-06-12-unified-plan-library-lab-ia-design.md`.

---

## Context the implementer needs

- `app.js` is ~5000 lines of ES5-style globals (no import/export, no modules). Functions are global; tests reach them via `page.evaluate(() => window.fnName(...))`.
- The lab is rendered by 8 functions called inside `renderAll()` (app.js ~3846): `renderTopbar`, `renderScenarioControls`, `renderSliders`, `renderMainChart`, `renderGreeks`, `renderMetrics`, `renderLegsEditor`, `renderEducation`. They read global `state` (`state.legs`, `state.scenario`, `state.selectedId`) and write into fixed element ids (`#mainChart`, `#greekGrid`, `#metricsGrid`, `#legsEditor`, `#scenarioControls`, sliders, `#strategyTitle`, `#educationGrid`).
- `renderAll()` body (app.js 3846–3857):
  ```js
  function renderAll() {
    renderStaticShell();
    renderStrategyList();
    renderTopbar();
    renderScenarioControls();
    renderSliders();
    renderMainChart();
    renderGreeks();
    renderMetrics();
    renderLegsEditor();
    renderEducation();
  }
  ```
- `doSelectStrategy(strategy)` (app.js ~3966) loads a strategy into state (`state.selectedId`, `state.legs`, resets scenario). `STRATEGIES` is the global array of 71 strategies (each has `.id`). `selectStrategy(id)` wraps it with a difficulty warning; the overlay must bypass the warning, so it uses `doSelectStrategy` directly.
- `state` is the global app state object; it is persisted via `saveD1LearningProgress()` into localStorage `os_d1_learning`. Lab/scenario state is separately reflected to the URL via `saveStateToURL()`.
- The lab body in `index.html` is `.layout-grid` (currently lines ~152–244) immediately followed by `.education-panel` (~246–254), both direct children of `<section class="workspace">`. After `.education-panel` comes `.professional-panel` and the rest. These two blocks are the lab.
- The Easy/Pro skin system scopes overrides under `body.skin-easy` / `body.skin-pro`. Any new visible CSS must work in both — but the overlay in P1 is only exercised by tests, so neutral dark-friendly styling that both skins inherit is acceptable; do not hardcode skin-specific colors beyond a backdrop.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Wrap `.layout-grid` + `.education-panel` in `<div id="labRoot">`; add `<div id="labHome">` anchor before it; add dormant `#labOverlay` host before `</body>` |
| `app.js` | Add `renderLab()`, `openLabOverlay(id)`, `closeLabOverlay()`; call `renderLab()` from `renderAll()`; add `state.labOverlayOpen`; wire `#labOverlayClose` + Esc |
| `styles.css` | Add `.lab-overlay` fullscreen/backdrop styles |
| `tests/lab-component.spec.js` | **Create** — relocation + render + restore + regression tests |

---

## Task 1: Write failing tests for the lab component

**Files:**
- Create: `tests/lab-component.spec.js`

- [ ] **Step 1: Create the test file**

```javascript
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
```

- [ ] **Step 2: Run and verify all 4 fail**

```bash
npx playwright test tests/lab-component.spec.js --reporter=line
```

Expected: failures (`#labRoot`, `#labHome`, `#labOverlay`, `window.openLabOverlay` do not exist yet).

---

## Task 2: Wrap the lab body in `#labRoot` with a home anchor

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the home anchor + opening wrapper before `.layout-grid`**

Find this line (start of the lab body, ~line 152):

```html
        <section class="layout-grid">
```

Replace it with:

```html
        <div id="labHome"></div>
        <div id="labRoot">
        <section class="layout-grid">
```

- [ ] **Step 2: Close the `#labRoot` wrapper after `.education-panel`**

Find the end of the education panel (~line 254):

```html
        <section class="panel education-panel">
          <div class="panel-heading compact">
            <div>
              <p class="eyebrow">Notes</p>
              <h3>策略说明与管理口径</h3>
            </div>
          </div>
          <div id="educationGrid" class="education-grid"></div>
        </section>
```

Immediately AFTER that closing `</section>`, add the `#labRoot` closing `</div>`:

```html
        </section>
        </div><!-- /#labRoot -->
```

(Only one `</section>` is the education panel's close; add the `</div>` right after it, before the `.professional-panel` section.)

- [ ] **Step 3: Verify structure is well-formed**

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const o=(h.match(/<div id=\"labRoot\">/g)||[]).length;const c=h.includes('/* /#labRoot */')||h.includes('/#labRoot');console.log('labRoot open tags:',o,'home anchor:',h.includes('id=\"labHome\"'));"
```

Expected: `labRoot open tags: 1 home anchor: true`.

---

## Task 3: Add the dormant overlay host

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the overlay host immediately before `</body>`**

Find `  </body>` (near the end, before `</html>`) and insert before it:

```html
    <div id="labOverlay" class="lab-overlay" hidden>
      <div class="lab-overlay-backdrop" data-lab-overlay-dismiss></div>
      <div class="lab-overlay-shell">
        <header class="lab-overlay-header">
          <span class="lab-overlay-title">实验室</span>
          <button id="labOverlayClose" class="lab-overlay-close" type="button" aria-label="关闭">&times;</button>
        </header>
        <div id="labOverlaySlot" class="lab-overlay-slot"></div>
      </div>
    </div>
```

- [ ] **Step 2: Verify**

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');console.log('overlay:',h.includes('id=\"labOverlay\"'),'slot:',h.includes('id=\"labOverlaySlot\"'),'close:',h.includes('id=\"labOverlayClose\"'));"
```

Expected: `overlay: true slot: true close: true`.

---

## Task 4: Add `renderLab()` and route `renderAll()` through it

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace the body of `renderAll()`**

Find (app.js ~3846):

```js
function renderAll() {
  renderStaticShell();
  renderStrategyList();
  renderTopbar();
  renderScenarioControls();
  renderSliders();
  renderMainChart();
  renderGreeks();
  renderMetrics();
  renderLegsEditor();
  renderEducation();
}
```

Replace with:

```js
function renderLab() {
  renderTopbar();
  renderScenarioControls();
  renderSliders();
  renderMainChart();
  renderGreeks();
  renderMetrics();
  renderLegsEditor();
  renderEducation();
}

function renderAll() {
  renderStaticShell();
  renderStrategyList();
  renderLab();
}
```

- [ ] **Step 2: Syntax check**

```bash
node --check app.js
```

Expected: no output.

- [ ] **Step 3: Run tests — the default-render test should now pass**

```bash
npx playwright test tests/lab-component.spec.js --grep "by default" --reporter=line
```

Expected: "lab renders into #labRoot by default and overlay is dormant" PASSES (overlay still hidden, labRoot in home). The overlay tests still fail (functions not added yet).

---

## Task 5: Add `openLabOverlay` / `closeLabOverlay` + state + wiring

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add the overlay functions**

Add these functions immediately after `renderLab()` (from Task 4):

```js
function labRootEl() { return document.getElementById("labRoot"); }

function openLabOverlay(id) {
  var overlay = document.getElementById("labOverlay");
  var slot = document.getElementById("labOverlaySlot");
  var root = labRootEl();
  if (!overlay || !slot || !root) return;

  if (id) {
    var strategy = STRATEGIES.find(function (s) { return s.id === id; });
    if (strategy && strategy.id !== state.selectedId) {
      doSelectStrategy(strategy);
    }
  }

  slot.appendChild(root);          // relocate the single lab subtree into the overlay
  overlay.hidden = false;
  state.labOverlayOpen = true;
  renderLab();                     // re-render so the chart sizes to the overlay width
}

function closeLabOverlay() {
  var overlay = document.getElementById("labOverlay");
  var home = document.getElementById("labHome");
  var root = labRootEl();
  if (!overlay || !home || !root) return;

  home.parentNode.insertBefore(root, home.nextSibling);  // restore to home slot
  overlay.hidden = true;
  state.labOverlayOpen = false;
  renderLab();                     // re-render at home width
}
```

- [ ] **Step 2: Expose the functions on `window` for delegated handlers and tests**

These are already global function declarations (ES5 style), so they are on `window` automatically. No export needed. Confirm there is no conflicting local-scope wrapper by checking:

```bash
node -e "const s=require('fs').readFileSync('app.js','utf8');console.log('openLabOverlay defs:',(s.match(/function openLabOverlay/g)||[]).length,'closeLabOverlay defs:',(s.match(/function closeLabOverlay/g)||[]).length);"
```

Expected: `openLabOverlay defs: 1 closeLabOverlay defs: 1`.

- [ ] **Step 3: Initialize `state.labOverlayOpen`**

Find the `state` object literal initialization in app.js (search for `const state = {` or `var state = {`). Add the field `labOverlayOpen: false,` among the other top-level state fields.

```bash
grep -n "labOverlayOpen" app.js
```

Expected: at least 1 hit in the state initializer plus the assignments in the functions above.

- [ ] **Step 4: Wire the close button, backdrop, and Escape key**

Find `function handleClick(event)` (the delegated click handler, ~app.js 4060-4090 region). Add, as the FIRST checks inside it:

```js
  if (event.target.id === "labOverlayClose" || event.target.matches("[data-lab-overlay-dismiss]")) {
    closeLabOverlay();
    return;
  }
```

Then find `boot()` (app.js ~4400+). At the end of `boot()`, after `applySkin(uiSkin())`, add an Escape-key listener:

```js
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.labOverlayOpen) closeLabOverlay();
  });
```

- [ ] **Step 5: Syntax check**

```bash
node --check app.js
```

Expected: no output.

---

## Task 6: Overlay CSS

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append the overlay styles at the end of `styles.css`**

```css
/* ============================================================================
   Lab overlay host (P1 foundation; exercised by tests, wired to chips in P3)
   ============================================================================ */
.lab-overlay[hidden] { display: none; }
.lab-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
}
.lab-overlay-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}
.lab-overlay-shell {
  position: relative;
  margin: 24px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 4px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.lab-overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.lab-overlay-title {
  color: var(--cyan);
  font-weight: 700;
  font-size: 13px;
}
.lab-overlay-close {
  background: transparent;
  border: 0;
  color: var(--muted);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  padding: 0 6px;
}
.lab-overlay-close:hover { color: var(--text); }
.lab-overlay-slot {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}
```

- [ ] **Step 2: Verify the full lab-component suite passes**

```bash
npx playwright test tests/lab-component.spec.js --reporter=line
```

Expected: all 4 tests PASS.

---

## Task 7: Full regression + commit

- [ ] **Step 1: Full acceptance**

```bash
node --check app.js
npm test
git diff --check
```

Expected: `node --check` clean; **all** existing tests still pass plus the 4 new ones; `git diff --check` clean. The app must look identical on load (lab in home slot, overlay dormant).

- [ ] **Step 2: Browser smoke check**

Open `index.html`. Verify the page looks exactly as before (chart, greeks, metrics, legs, notes all present in their usual positions). In the devtools console run `openLabOverlay('iron-condor')` → the lab appears in a fullscreen overlay with the Iron Condor chart; click × → it returns to its home slot unchanged. Toggle Easy/Pro skin with the overlay open — backdrop and shell remain legible in both.

- [ ] **Step 3: Commit**

```bash
git add index.html app.js styles.css tests/lab-component.spec.js
git commit -m "feat(P1): extract relocatable lab subtree with reusable overlay host"
```

---

## Notes for P2 (do not implement here)

- P2 introduces `state.destination` + the four-destination left nav and reuses `renderLab()` for the fullscreen 实验室 destination and the existing strategy list for 策略库. `openLabOverlay`/`closeLabOverlay` already exist for P3's in-plan chip flow.
- If `renderMainChart` is found to cache width across renders (chart not resizing after the move), P2/P3 should pass a fresh-measure flag; P1 relies on `renderLab()` re-measuring on each call, which the smoke check in Task 7 confirms.
