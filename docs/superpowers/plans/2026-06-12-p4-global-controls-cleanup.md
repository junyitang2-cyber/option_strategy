# P4 — Global Controls in Nav + Dead-Code Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (For this project, execution is handed to Codex; steps are written to be followed verbatim with no extra context.)

**Goal:** Move the global content controls (CN/EN language + 初级/进阶/专业 mode) out of the workspace topbar into the persistent primary nav so they work in **every** destination (they were unreachable in 策略库, where the workspace is hidden). Then remove the dead tab code left over from P3b.

**Architecture:** All control clicks are handled by the **delegated** `handleClick` on `document` (mode buttons by `event.target.id`, language by `[data-learning-language]`), and `handleModeToggle`/`renderLanguageToggle` look elements up by id — so relocating the `.language-toggle` and `.mode-toggle` DOM nodes from the topbar into the primary nav changes nothing about behavior. The strategy-specific buttons (✓ 已理解, 重置模板) stay in the topbar. Cleanup removes the now-unused `renderLearningTabs()` function, the `activeLearningTab` default field, the dead `.learning-tab(s)` CSS, and the dangling `aria-labelledby="learning-…-tab"` references on the 12 panels (their tab buttons were deleted in P3b).

**Tech Stack:** Vanilla JS (ES5-style globals), Playwright e2e. No build step. Spec: `docs/superpowers/specs/2026-06-12-unified-plan-library-lab-ia-design.md`. Builds on P1–P3b (latest `831e943`).

---

## Context the implementer needs

- The primary nav is `<nav class="primary-nav" aria-label="主导航">` (index.html ~15) with four `<button class="primary-nav-item" data-dest="…">`. It is `position:sticky; height:100vh; display:flex; flex-direction:column` (styles.css `.primary-nav`), always visible (it is the first grid column; only `.strategy-rail`/`.workspace` swap).
- The topbar (index.html ~45) contains `<div class="top-actions">` with, in order: `<div class="language-toggle">` (`#langCn`, `#langEn`), `<div class="mode-toggle">` (`#modeBasic`, `#modePro`, `#modeInterview`), `<button id="markCompletedBtn">`, `<button id="resetStrategy">`. The toggles' buttons all use class `mode-btn`.
- Click wiring is fully delegated in `handleClick` (app.js): `if (event.target.id === "modeBasic") handleModeToggle("basic")` … (app.js ~4420-4429); `if (event.target.matches("[data-learning-language]")) …` (app.js ~4224). `handleModeToggle(mode)` (app.js ~2185) and `renderLanguageToggle()` (app.js ~2651) reference the buttons by id / `[data-learning-language]` — location-independent.
- Dead code from P3b: `renderLearningTabs()` (app.js ~2675) is defined but never called. `state.learning.activeLearningTab` is set at the default (app.js ~250) and inside `renderLearningTabs` (~2677-2678) only — nothing reads it for behavior anymore. The 12 `.learning-panel` divs (index.html ~79-129) still carry `role="tabpanel" aria-labelledby="learning-…-tab"` pointing at the deleted tab buttons. Dead CSS: `.learning-tabs` / `.learning-tab` rule blocks (styles.css ~1155-1210), `body.skin-easy .learning-tab*` (~1938-1942), and `body.skin-pro .learning-tabs`/`.learning-tab::before` F-key counter (~2282-2288).
- `os_d1_skin`/Easy-Pro is a separate floating pill (`#skinToggle`) — already global, do not touch.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Move `.language-toggle` + `.mode-toggle` from the topbar into a `.nav-controls` block in the primary nav; strip `role="tabpanel"` + `aria-labelledby="learning-…-tab"` from the 12 panels |
| `app.js` | Delete `renderLearningTabs()`; delete the `activeLearningTab` default field |
| `styles.css` | Add `.nav-controls` (compact vertical) layout; delete the dead `.learning-tab(s)` rule blocks |
| `tests/destination-nav.spec.js` | Add a test that the language + mode controls work in the `library` destination |

---

## Task 1: Write the failing test (controls reachable in library)

**Files:**
- Modify: `tests/destination-nav.spec.js`

- [ ] **Step 1: Append this test**

```javascript
test("global language and mode controls live in the nav and work in every destination", async ({ page }) => {
  await page.goto(URL);
  // the controls are inside the always-visible primary nav, not the workspace topbar
  await expect(page.locator(".primary-nav #langEn")).toHaveCount(1);
  await expect(page.locator(".primary-nav #modePro")).toHaveCount(1);

  // switch to the library destination (workspace hidden) and confirm the controls still work
  await page.locator('.primary-nav-item[data-dest="library"]').click();
  await expect(page.locator("#langEn")).toBeVisible();
  await expect(page.locator("#modePro")).toBeVisible();
  await page.locator("#langEn").click();
  await expect(page.locator("#langEn")).toHaveClass(/active/);
  await page.locator("#modePro").click();
  await expect(page.locator("#modePro")).toHaveClass(/active/);
});
```

- [ ] **Step 2: Run and verify it fails**

```bash
npx playwright test tests/destination-nav.spec.js --grep "global language and mode controls" --reporter=line
```

Expected: FAIL — the controls are still in the topbar (`.primary-nav #langEn` count is 0), and in the library destination the workspace (and thus the topbar controls) is hidden.

---

## Task 2: index.html — relocate controls + strip dangling aria

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove the two toggles from the topbar**

Find (index.html ~51-60):

```html
          <div class="top-actions">
            <div class="language-toggle" aria-label="页面语言">
              <button id="langCn" class="mode-btn active" type="button" data-learning-language="cn">CN</button>
              <button id="langEn" class="mode-btn" type="button" data-learning-language="en">EN</button>
            </div>
            <div class="mode-toggle">
              <button id="modeBasic" class="mode-btn active" type="button" title="初级学习模式">初级</button>
              <button id="modePro" class="mode-btn" type="button" title="进阶交易员视角">进阶</button>
              <button id="modeInterview" class="mode-btn" type="button" title="专业训练模式">专业</button>
            </div>
            <button id="markCompletedBtn" class="primary-button" type="button" style="margin-right:8px">✓ 已理解</button>
            <button id="resetStrategy" class="primary-button" type="button">重置模板</button>
          </div>
```

Replace with (only the two strategy-action buttons remain in the topbar):

```html
          <div class="top-actions">
            <button id="markCompletedBtn" class="primary-button" type="button" style="margin-right:8px">✓ 已理解</button>
            <button id="resetStrategy" class="primary-button" type="button">重置模板</button>
          </div>
```

- [ ] **Step 2: Add the controls into the primary nav**

Find the primary nav (index.html ~15-20):

```html
      <nav class="primary-nav" aria-label="主导航">
        <button class="primary-nav-item active" type="button" data-dest="plan"><span class="primary-nav-label">转型<br>计划</span></button>
        <button class="primary-nav-item" type="button" data-dest="library"><span class="primary-nav-label">策略库</span></button>
        <button class="primary-nav-item" type="button" data-dest="lab"><span class="primary-nav-label">实验室</span></button>
        <button class="primary-nav-item" type="button" data-dest="practice"><span class="primary-nav-label">练习场</span></button>
      </nav>
```

Replace with:

```html
      <nav class="primary-nav" aria-label="主导航">
        <button class="primary-nav-item active" type="button" data-dest="plan"><span class="primary-nav-label">转型<br>计划</span></button>
        <button class="primary-nav-item" type="button" data-dest="library"><span class="primary-nav-label">策略库</span></button>
        <button class="primary-nav-item" type="button" data-dest="lab"><span class="primary-nav-label">实验室</span></button>
        <button class="primary-nav-item" type="button" data-dest="practice"><span class="primary-nav-label">练习场</span></button>
        <div class="nav-controls">
          <div class="language-toggle" aria-label="页面语言">
            <button id="langCn" class="mode-btn active" type="button" data-learning-language="cn">CN</button>
            <button id="langEn" class="mode-btn" type="button" data-learning-language="en">EN</button>
          </div>
          <div class="mode-toggle">
            <button id="modeBasic" class="mode-btn active" type="button" title="初级学习模式">初级</button>
            <button id="modePro" class="mode-btn" type="button" title="进阶交易员视角">进阶</button>
            <button id="modeInterview" class="mode-btn" type="button" title="专业训练模式">专业</button>
          </div>
        </div>
      </nav>
```

- [ ] **Step 3: Strip the dangling tabpanel ARIA from the 12 panels**

In each of the 12 `<div class="learning-panel" …>` elements, remove the now-dangling `role="tabpanel"` and `aria-labelledby="learning-…-tab"` (the tab buttons they referenced were deleted in P3b). Keep `class="learning-panel"`, `data-learning-panel="…"`, and `id="learning-…-panel"`.

Apply with sed (removes both attributes wherever they appear on these panels):

```bash
sed -i -E 's/ role="tabpanel" aria-labelledby="learning-[a-z-]*-tab"//g' index.html
```

- [ ] **Step 4: Verify**

```bash
node -e "const h=require('fs').readFileSync('index.html','utf8');console.log('nav langEn:',/primary-nav[\s\S]*id=\"langEn\"[\s\S]*<\/nav>/.test(h),'topbar toggles gone:',!/top-actions[\s\S]*language-toggle/.test(h),'dangling aria:',(h.match(/aria-labelledby=\"learning-[a-z-]*-tab\"/g)||[]).length);"
```

Expected: `nav langEn: true topbar toggles gone: true dangling aria: 0`.

---

## Task 3: app.js — delete dead tab code

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Delete the `renderLearningTabs()` function**

Find the entire function (app.js ~2675) and delete it completely:

```js
function renderLearningTabs() {
  const validTabs = new Set(["roadmap", "modules", "bridge", "construction", "client-drills", "vol-framework", "dealer-desk", "exotics-bridge", "exotics-risk", "research-bridge", "professional-sprint", "scenarios"]);
  const active = validTabs.has(state.learning.activeLearningTab) ? state.learning.activeLearningTab : "roadmap";
  state.learning.activeLearningTab = active;
  const labels = LEARNING_UI_TEXT[learningLanguage()].tabs;
  document.querySelectorAll(".learning-tab").forEach((tab) => {
    const isActive = tab.dataset.learningTab === active;
    tab.textContent = labels[tab.dataset.learningTab] || tab.dataset.learningTab;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".learning-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.learningPanel === active);
  });
}
```

(If the exact body differs, delete the whole `function renderLearningTabs() { … }` block regardless.)

- [ ] **Step 2: Delete the `activeLearningTab` default field**

Find (app.js ~250):

```js
    activeLearningTab: "roadmap",
```

Delete that line.

- [ ] **Step 3: Confirm no references remain**

```bash
grep -c "renderLearningTabs\|activeLearningTab" app.js
```

Expected: `0`.

- [ ] **Step 4: Syntax check**

```bash
node --check app.js
```

Expected: no output.

---

## Task 4: styles.css — nav-controls layout + remove dead tab CSS

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append the `.nav-controls` layout at the end of styles.css**

```css
/* ============================================================================
   P4 — Global controls moved into the primary nav (compact, bottom of nav)
   ============================================================================ */
.nav-controls {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}
.nav-controls .language-toggle,
.nav-controls .mode-toggle {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: var(--panel-3);
  border-radius: 6px;
  padding: 3px;
}
.nav-controls .mode-btn {
  width: 100%;
  font-size: 11px;
  padding: 5px 4px;
  text-align: center;
}
```

(The existing `.mode-btn` base/active colors still apply; this only adjusts layout and sizing inside the narrow nav.)

- [ ] **Step 2: Remove the dead `.learning-tab(s)` CSS rule blocks**

Delete these now-dead rules (no `.learning-tab`/`.learning-tabs` elements exist anymore):
- The `.learning-tabs { … }` and `.learning-tab { … }` / `.learning-tab:hover` / `.learning-tab.active` / `.learning-tab:focus-visible` blocks (styles.css ~1155-1210). Do NOT remove `.learning-panel` or `.learning-content` rules — those are still used.
- The `body.skin-easy .learning-tab.active, body.skin-easy .learning-tab:hover { … }` block (~1938-1942).
- The `body.skin-pro .learning-tabs { counter-reset: fkey; }` and `body.skin-pro .learning-tab::before { … }` blocks (~2282-2288).

- [ ] **Step 3: Verify dead tab CSS is gone and nothing else broke**

```bash
grep -c "\.learning-tab[^-]" styles.css
node --check app.js
```

Expected: the grep count is `0` (no `.learning-tab` / `.learning-tabs` selectors remain; `.learning-panel`/`.learning-content` are unaffected because they do not match `\.learning-tab[^-]`); `node --check` clean.

---

## Task 5: Full regression + commit

- [ ] **Step 1: Full acceptance**

```bash
node --check app.js
npm test
git diff --check
```

Expected: `node --check` clean; **all** tests pass (the one new test brings the total to 53); `git diff --check` clean.

- [ ] **Step 2: Browser smoke check**

Open `index.html`. Verify:
- The primary nav shows the 4 destinations and, at the bottom, the CN/EN and 初级/进阶/专业 controls stacked compactly.
- Switch to 策略库 → CN/EN and 初级/进阶/专业 are still visible and clickable (they were unreachable before); switching language re-labels the app; switching to 进阶/专业 still reveals the professional panels when you go to 实验室.
- The topbar (visible in 转型计划/实验室/练习场) now shows only ✓ 已理解 and 重置模板.
- Easy/Pro floating pill unchanged; sector spine, overlay, all destinations behave as before.

- [ ] **Step 3: Commit**

```bash
git add index.html app.js styles.css tests/destination-nav.spec.js
git commit -m "feat(P4): move global controls into the nav and remove dead tab code"
```

---

## Notes (IA redesign complete after this phase)

- After P4, the full IA redesign (spec `2026-06-12-unified-plan-library-lab-ia-design.md`) is implemented: four destinations, sector-spine plan with embedded chips → overlay, standalone library/lab/practice, global controls available everywhere.
- Follow-up docs work (not code): update `docs/PROJECT_STATUS.md`, `USER_GUIDE.md`, `README.md`, and `.claude/commands/ui-design.md` to describe the new destination/sector IA. (Claude handles this after P4 is accepted.)
- Optional future refinement: fold each sector's deep content into individual module cards (currently folded at sector granularity).
