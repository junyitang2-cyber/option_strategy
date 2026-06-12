# P3b — Sector Spine + Module Stream Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (For this project, execution is handed to Codex; steps are written to be followed verbatim with no extra context.)

**Goal:** Replace the 12-tab Learning Hub inside the 转型计划 destination with a **sector spine** (总览 · A · B · C · D · E · 🏁冲刺). Selecting a sector shows that sector's modules (the module stream) **plus** its deep content (vol/dealer/exotics/research/bridge/construction/client-drills) stacked together — no sub-tabs. The 12-tab bar is retired.

**Architecture:** The 12 learning panels already exist as `.learning-panel[data-learning-panel="…"]` with `.learning-panel { display:none }` / `.learning-panel.active { display:block }`. CSS already supports **multiple** `.active` panels showing at once. So instead of one active tab → one active panel, a selected sector marks **all of its panels** `.active`. A new `#sectorSpine` (rendered by JS) replaces the `.learning-tabs` bar; `state.learning.activeSector` drives it; `renderLearningModules` filters to the active sector. The practice destination (P2) reuses the same panel mechanism to show only the scenarios panel. Existing renderers are reused unchanged; only visibility orchestration changes.

**Tech Stack:** Vanilla JS (ES5-style globals), Playwright e2e. No build step. Spec: `docs/superpowers/specs/2026-06-12-unified-plan-library-lab-ia-design.md`. Builds on P1 (`96dba9b`), P2 (`0fc22f7`), P3a (`3b2b4e1`).

---

## Sector → panels mapping (the single source of truth for this phase)

```
overview : ["roadmap"]
A        : ["modules", "bridge"]
B        : ["modules", "construction", "client-drills"]
C        : ["modules", "vol-framework", "dealer-desk"]
D        : ["research-bridge"]
E        : ["modules", "exotics-bridge", "exotics-risk"]
sprint   : ["professional-sprint"]
```

- The `modules` panel is shared by A/B/C/E and is **filtered** to the active sector (so sector C shows C's 11 modules, etc.). Sector D has no modules (research only); `overview` and `sprint` show no modules.
- The `scenarios` panel is **not** in any sector — it belongs to the 练习场 destination (P2). Spine selections never show it; the practice destination shows only it.

---

## Context the implementer needs

- The tab bar is `<div class="learning-tabs" role="tablist">` in `index.html` (~lines 70–95) containing 12 `<button class="learning-tab" data-learning-tab="…" id="learning-…-tab">`. The 12 panels follow in `<div class="learning-content">` (~lines 97–148), each `<div class="learning-panel" data-learning-panel="…" id="learning-…-panel">` wrapping an inner `#learning…` div the renderers fill.
- `renderLearningTabs()` (app.js ~2672) currently reads `state.learning.activeLearningTab` (default `"roadmap"`, app.js ~249) and toggles `.active` on `.learning-tab` buttons and `.learning-panel` panels. **This function is replaced by `renderSectorSpine()` + `updateLearningPanels()` in this phase.**
- `renderLearningHub()` (app.js ~3821) calls `renderLearningTabs()` then all the `renderLearningX()` renderers (which fill the inner divs). The renderers stay; only the tab call is swapped.
- `renderLearningModules()` (app.js ~2720) renders `learningContent().modules` (all 25) into `#learningModules`. It must be filtered to `state.learning.activeSector`.
- The tab click handler is in `handleClick` (app.js ~4138): `state.learning.activeLearningTab = event.target.dataset.learningTab; …`. It is replaced by a `[data-sector-spine]` handler.
- `applyDestination()` (app.js, added P2 ~3889) currently does, for practice: `state.learning.activeLearningTab = "scenarios"; renderLearningTabs();`. This is changed to use `updateLearningPanels()`.
- The Pro skin adds F-key prefixes via `body.skin-pro .learning-tab::before { counter-increment … }` (styles.css ~2284). With the tab bar removed/hidden this is inert, but to be clean we hide `.learning-tabs`.
- `tests/learning-hub.spec.js` has 26 references to `#learning-…-tab` (clicks and assertions). They are migrated to the sector spine / practice destination in Task 6.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Replace the `.learning-tabs` bar with `<div class="sector-spine" id="sectorSpine">`; (panels unchanged) |
| `app.js` | Add `state.learning.activeSector`, `SECTOR_PANELS`, `renderSectorSpine()`, `updateLearningPanels()`, `applySector()`; filter `renderLearningModules`; swap `renderLearningHub` + `applyDestination` to the new mechanism; add `[data-sector-spine]` click handler; remove the `[data-learning-tab]` handler |
| `styles.css` | `.sector-spine` styling (mirror the old tab bar); ensure removed tab CSS doesn't error |
| `tests/destination-nav.spec.js` | Add sector-spine tests |
| `tests/learning-hub.spec.js` | Migrate the 26 `#learning-…-tab` references to the spine / practice destination |

---

## Task 1: Write failing tests for the sector spine

**Files:**
- Modify: `tests/destination-nav.spec.js`

- [ ] **Step 1: Append these tests**

```javascript
test("plan shows a sector spine and defaults to the overview (roadmap)", async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator("#sectorSpine [data-sector-spine]")).toHaveCount(7); // overview,A,B,C,D,E,sprint
  await expect(page.locator('[data-sector-spine="overview"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="roadmap"]')).toHaveClass(/active/);
  // the old tab bar is gone
  await expect(page.locator(".learning-tabs")).toHaveCount(0);
});

test("selecting sector C shows C modules plus vol-framework and dealer-desk panels", async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-sector-spine="C"]').click();
  await expect(page.locator('.learning-panel[data-learning-panel="modules"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="vol-framework"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="dealer-desk"]')).toHaveClass(/active/);
  // module cards are filtered to sector C
  const sectors = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#learningModules .module-card")).map((c) => c.dataset.sector)
  );
  expect(sectors.length).toBeGreaterThan(0);
  expect(sectors.every((s) => s === "C")).toBe(true);
  // a panel from another sector is not shown
  await expect(page.locator('.learning-panel[data-learning-panel="exotics-bridge"]')).not.toHaveClass(/active/);
});

test("sector selection persists across reload", async ({ page }) => {
  await page.goto(URL);
  await page.locator('[data-sector-spine="E"]').click();
  await page.reload();
  await expect(page.locator('[data-sector-spine="E"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="exotics-bridge"]')).toHaveClass(/active/);
});

test("practice destination shows only the scenarios panel", async ({ page }) => {
  await page.goto(URL);
  await page.locator('.primary-nav-item[data-dest="practice"]').click();
  await expect(page.locator('.learning-panel[data-learning-panel="scenarios"]')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="modules"]')).not.toHaveClass(/active/);
});
```

- [ ] **Step 2: Run and verify all 4 fail**

```bash
npx playwright test tests/destination-nav.spec.js --grep "sector|practice destination shows only" --reporter=line
```

Expected: failures (`#sectorSpine`, `data-sector-spine`, `module-card[data-sector]` do not exist; `.learning-tabs` still present).

---

## Task 2: index.html — replace the tab bar with the sector spine container

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the entire `.learning-tabs` block**

Find the whole tab bar (the `<div class="learning-tabs" …>` … `</div>` containing the 12 `<button class="learning-tab" …>`), starting at:

```html
          <div class="learning-tabs" role="tablist" aria-label="D1 Learning Hub">
```

and ending at its matching `</div>` (just before `<div class="learning-content">`). Replace the ENTIRE block with:

```html
          <div class="sector-spine" id="sectorSpine" role="tablist" aria-label="转型计划 Sectors"></div>
```

(The 12 `<div class="learning-panel" …>` panels that follow are unchanged.)

- [ ] **Step 2: Verify**

```bash
node -e "const h=require('fs').readFileSync('index.html','utf8');console.log('spine:',h.includes('id=\"sectorSpine\"'),'old tabs gone:',!h.includes('class=\"learning-tabs\"'),'panels:',(h.match(/class=\"learning-panel\"/g)||[]).length);"
```

Expected: `spine: true old tabs gone: true panels: 12`.

---

## Task 3: app.js — sector state, spine render, panel orchestration

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `activeSector` to the learning-progress defaults**

Find (app.js ~249):

```js
    activeLearningTab: "roadmap",
```

Add immediately after it:

```js
    activeSector: "overview",
```

(Keep `activeLearningTab` for backward-compatible saved state; it is no longer read for visibility.)

- [ ] **Step 2: Add the sector mapping + spine/orchestration functions**

Add this block immediately above `function renderLearningHub()` (app.js ~3821):

```js
var SECTOR_PANELS = {
  overview: ["roadmap"],
  A: ["modules", "bridge"],
  B: ["modules", "construction", "client-drills"],
  C: ["modules", "vol-framework", "dealer-desk"],
  D: ["research-bridge"],
  E: ["modules", "exotics-bridge", "exotics-risk"],
  sprint: ["professional-sprint"],
};
var SECTOR_SPINE_ORDER = ["overview", "A", "B", "C", "D", "E", "sprint"];

function sectorSpineLabel(key) {
  if (key === "overview") return learningLanguage() === "cn" ? "总览" : "Overview";
  if (key === "sprint") return learningLanguage() === "cn" ? "🏁 冲刺" : "🏁 Sprint";
  return "Sector " + key;
}

function renderSectorSpine() {
  var el = document.getElementById("sectorSpine");
  if (!el) return;
  var active = state.learning.activeSector;
  if (SECTOR_SPINE_ORDER.indexOf(active) === -1) active = "overview";
  state.learning.activeSector = active;
  el.innerHTML = SECTOR_SPINE_ORDER.map(function (key) {
    var isActive = key === active;
    return '<button class="sector-spine-item ' + (isActive ? "active" : "") + '" type="button" role="tab" aria-selected="' + isActive + '" data-sector-spine="' + key + '">' + escapeHtml(sectorSpineLabel(key)) + "</button>";
  }).join("");
}

// Decide which learning panels are visible. In the practice destination only the
// scenarios panel shows; otherwise (plan) the active sector's panels show.
function updateLearningPanels() {
  var visible;
  if (state.destination === "practice") {
    visible = ["scenarios"];
  } else {
    visible = SECTOR_PANELS[state.learning.activeSector] || SECTOR_PANELS.overview;
  }
  var set = {};
  for (var i = 0; i < visible.length; i++) set[visible[i]] = true;
  var panels = document.querySelectorAll(".learning-panel");
  for (var j = 0; j < panels.length; j++) {
    panels[j].classList.toggle("active", !!set[panels[j].dataset.learningPanel]);
  }
}

function applySector(sector) {
  if (SECTOR_SPINE_ORDER.indexOf(sector) === -1) sector = "overview";
  state.learning.activeSector = sector;
  saveD1LearningProgress();
  renderLearningModules();   // re-filter modules to the new sector
  renderSectorSpine();
  updateLearningPanels();
}
```

- [ ] **Step 3: Filter `renderLearningModules` to the active sector**

Find (app.js ~2723):

```js
  const cards = learningContent().modules.map((module) => {
```

Replace with:

```js
  const activeSector = state.learning.activeSector;
  const cards = learningContent().modules.filter((module) => (module.sector || "A") === activeSector).map((module) => {
```

Then find, in the same function, the opening `<article class="module-card">`:

```js
      <article class="module-card">
```

Replace with (add the `data-sector` attribute the tests read):

```js
      <article class="module-card" data-sector="${escapeHtml(module.sector || "A")}">
```

- [ ] **Step 4: Swap `renderLearningHub` to the new mechanism**

Find (app.js ~3821):

```js
function renderLearningHub() {
  renderLanguageToggle();
  renderLearningProgressSummary();
  renderLearningTabs();
  renderLearningRoadmap();
```

Replace the `renderLearningTabs();` line with `renderSectorSpine();`, and add `updateLearningPanels();` as the LAST call inside `renderLearningHub()` (after `renderLearningScenarios();`). The function head becomes:

```js
function renderLearningHub() {
  renderLanguageToggle();
  renderLearningProgressSummary();
  renderSectorSpine();
  renderLearningRoadmap();
```

and the end of the function:

```js
  renderScenarioFilters();
  renderLearningScenarios();
  updateLearningPanels();
}
```

- [ ] **Step 5: Update `applyDestination` practice handling**

Find (app.js ~3889, inside `applyDestination`):

```js
  if (dest === "practice") {
    state.learning.activeLearningTab = "scenarios";
    renderLearningTabs();
  }
```

Replace with:

```js
  if (dest === "practice") {
    updateLearningPanels();
  }
  if (dest === "plan") {
    updateLearningPanels();
  }
```

- [ ] **Step 6: Replace the tab click handler with the spine handler**

Find (app.js ~4138):

```js
  if (event.target.matches("[data-learning-tab]")) {
    state.learning.activeLearningTab = event.target.dataset.learningTab;
```

Replace the whole `if` block (through its closing `}`) — it currently sets `activeLearningTab`, saves, and re-renders — with:

```js
  if (event.target.matches("[data-sector-spine]")) {
    applySector(event.target.dataset.sectorSpine);
    return;
  }
```

(If the original block had more lines like `saveD1LearningProgress(); renderLearningHub();`, they are replaced entirely by the `applySector` call, which already saves and re-renders the relevant pieces.)

- [ ] **Step 7: Syntax check + run the sector tests**

```bash
node --check app.js
npx playwright test tests/destination-nav.spec.js --grep "sector|practice destination shows only" --reporter=line
```

Expected: `node --check` clean; the 4 new sector tests PASS.

---

## Task 4: styles.css — sector spine styling, hide leftover tab CSS

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append the sector-spine styles at the end of styles.css**

```css
/* ============================================================================
   P3b — Sector spine (replaces the 12-tab Learning Hub bar)
   ============================================================================ */
.sector-spine {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 16px;
  padding-bottom: 10px;
}
.sector-spine-item {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--panel-2);
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.sector-spine-item:hover { color: var(--text); }
.sector-spine-item.active {
  color: var(--cyan);
  border-color: var(--cyan);
  background: rgba(57, 199, 229, 0.12);
}
```

- [ ] **Step 2: Confirm nothing references `.learning-tabs` in a way that breaks**

`.learning-tab`/`.learning-tabs` CSS rules become dead (the markup is gone) but are harmless. Leave them; do not spend effort removing. Verify the build is fine:

```bash
node --check app.js
```

Expected: no output.

---

## Task 5: Migrate the learning-hub tests to the sector spine

**Files:**
- Modify: `tests/learning-hub.spec.js`

The 12-tab bar is gone, so every `#learning-…-tab` reference must be migrated. Use this exact mapping (each deep-content tab belongs to exactly one sector; `modules` uses the sector whose content the test asserts):

| Old reference | New navigation |
|---|---|
| `#learning-modules-tab` (click) | `[data-sector-spine="A"]` (these tests assert sector-A modules; if a test asserts a different sector's module, use that sector) |
| `#learning-bridge-tab` | `[data-sector-spine="A"]` |
| `#learning-construction-tab` | `[data-sector-spine="B"]` |
| `#learning-client-drills-tab` | `[data-sector-spine="B"]` |
| `#learning-vol-framework-tab` | `[data-sector-spine="C"]` |
| `#learning-dealer-desk-tab` | `[data-sector-spine="C"]` |
| `#learning-exotics-bridge-tab` | `[data-sector-spine="E"]` |
| `#learning-exotics-risk-tab` | `[data-sector-spine="E"]` |
| `#learning-research-bridge-tab` | `[data-sector-spine="D"]` |
| `#learning-professional-sprint-tab` | `[data-sector-spine="sprint"]` |
| `#learning-scenarios-tab` (click) | `.primary-nav-item[data-dest="practice"]` |
| `#learning-roadmap-tab` (click) | `[data-sector-spine="overview"]` |

For **assertions** about a tab being active/having text:
- `await expect(page.locator("#learning-X-tab")).toHaveClass(/active/)` → assert the owning **panel** is visible instead: `await expect(page.locator('.learning-panel[data-learning-panel="X"]')).toHaveClass(/active/)`.
- `await expect(page.locator("#learning-roadmap-tab")).toContainText("路线图")` / `"Roadmap"` → assert the spine overview item instead: `await expect(page.locator('[data-sector-spine="overview"]')).toContainText("总览")` (CN) or `"Overview"` (EN). Keep the language-toggle context the test already set up.

- [ ] **Step 1: Worked example A — a deep-content tab click**

Find (line ~137, vol framework test):

```js
  await page.locator("#learning-vol-framework-tab").click();
```

Replace with:

```js
  await page.locator('[data-sector-spine="C"]').click();
```

The following assertions in that test (e.g. `#volSurfaceChart svg` visible, then `#learning-scenarios-tab` click) keep working once their own references are migrated by this same mapping.

- [ ] **Step 2: Worked example B — a tab-active assertion**

Find (line ~59):

```js
  await expect(page.locator("#learning-scenarios-tab")).toHaveClass(/active/);
```

Replace with:

```js
  await expect(page.locator('.learning-panel[data-learning-panel="scenarios"]')).toHaveClass(/active/);
```

- [ ] **Step 3: Apply the mapping to every remaining `#learning-…-tab` reference**

Migrate all remaining occurrences in `tests/learning-hub.spec.js` using the mapping table above. Do not remove or weaken any other assertion in those tests (scenario counts, card text, filters, reveal behavior all stay). Where a test previously clicked `#learning-scenarios-tab` to reach the scenario bank, it now clicks `.primary-nav-item[data-dest="practice"]` first; where it clicked a deep-content tab, it clicks that sector's spine item.

- [ ] **Step 4: Verify no tab references remain**

```bash
grep -c "learning-[a-z-]*-tab" tests/learning-hub.spec.js
```

Expected: `0`.

- [ ] **Step 5: Run the learning-hub suite**

```bash
npx playwright test tests/learning-hub.spec.js --reporter=line
```

Expected: all tests PASS.

---

## Task 6: Full regression + commit

- [ ] **Step 1: Full acceptance**

```bash
node --check app.js
npm test
git diff --check
```

Expected: `node --check` clean; **all** tests pass (the 4 new sector tests bring the total to 52); `git diff --check` clean.

- [ ] **Step 2: Browser smoke check**

Open `index.html` (default 转型计划). Verify:
- A sector spine (总览 · Sector A · B · C · D · E · 🏁 冲刺) replaces the old 12-tab bar; opens on 总览 showing the roadmap.
- Click Sector C → the module stream shows only C's modules, followed by the Vol-framework and Dealer-desk content stacked below (no sub-tabs).
- Click a strategy chip on a module → the lab overlay opens over the plan (P3a), close returns to the plan on the same sector.
- Sector D shows the Research Bridge; Sector E shows exotics; 🏁 冲刺 shows the sprint.
- 练习场 (primary nav) shows only the scenario bank; 策略库 and 实验室 unchanged.
- Reload keeps the selected sector; CN/EN re-labels the spine.

- [ ] **Step 3: Commit**

```bash
git add index.html app.js styles.css tests/destination-nav.spec.js tests/learning-hub.spec.js
git commit -m "feat(P3b): replace learning tabs with sector spine + module stream"
```

---

## Notes for P4 (do not implement here)

- P4 moves the global controls (CN/EN, 初级/进阶/专业) out of the workspace topbar (hidden in the `library` destination) into the persistent primary nav / header, finalizes the 练习场 + 🏁 Sprint capstone placement, and removes the now-dead `.learning-tab(s)` CSS and the unused `activeLearningTab` state field.
- Module-level content folding (deep content inside individual module cards rather than stacked sector panels) is an optional future refinement; this phase folds at sector granularity.
