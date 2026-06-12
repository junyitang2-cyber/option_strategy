# P3a — In-Plan Lab Overlay (strategy chips open the overlay) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (For this project, execution is handed to Codex; steps are written to be followed verbatim with no extra context.)

**Goal:** Make a strategy chip inside the 转型计划 (Learning Hub) open the lab as a **fullscreen overlay** (the user stays in the plan), instead of navigating away to the lab destination. This delivers the "embedded learning" feel: click a strategy taught by a module → the lab pops up over the plan.

**Architecture:** P1 already built `openLabOverlay(id)` (relocates `#labRoot` into a fixed overlay and re-renders) and `closeLabOverlay()`. P2 temporarily wired the in-plan chips (`[data-select-strategy]`) to `selectStrategy(...) + applyDestination("lab")`. This phase swaps that one handler to call `openLabOverlay(id)` and updates the two tests that asserted the transitional `data-dest="lab"` behavior. The library/rail strategy clicks (`[data-strategy]`) keep navigating to the lab destination — unchanged.

**Tech Stack:** Vanilla JS (ES5-style globals), Playwright e2e. No build step. Spec: `docs/superpowers/specs/2026-06-12-unified-plan-library-lab-ia-design.md`. Builds on P1 (`96dba9b`) and P2 (`0fc22f7`).

---

## Context the implementer needs

- The `[data-select-strategy]` chips (`.strategy-link-chip`) are rendered by six Learning-Hub renderers (modules, bridge, comparisons, vol-playbook, dealer, exotics) — all of which live inside the 转型计划 destination. So changing this one delegated handler affects only in-plan chips. The library/rail uses a different attribute, `[data-strategy]` (handled separately, keeps its P2 behavior of switching to the lab destination).
- The delegated click handler `handleClick(event)` (app.js ~4084) currently contains (app.js ~4345):
  ```js
  if (event.target.matches("[data-select-strategy]")) {
    selectStrategy(event.target.dataset.selectStrategy);
    applyDestination("lab");
    return;
  }
  ```
- `openLabOverlay(id)` (added in P1, app.js ~3858): finds the strategy by id, calls `doSelectStrategy(strategy)` if it differs from the current one (this bypasses the difficulty-warning modal, which is intended for curated teaching chips), relocates `#labRoot` into `#labOverlaySlot`, sets `state.labOverlayOpen = true`, shows `#labOverlay`, and re-renders the lab.
- Because the plan destination hides `#labStage` (where `#labRoot` normally lives) via `body[data-dest="plan"] #labStage { display:none }`, moving `#labRoot` into the always-visible `#labOverlay` is exactly what makes the lab appear; closing returns it to the hidden stage. `#strategyTitle` lives in the workspace topbar (visible in the plan), so it updates in place behind the overlay.
- Tests in `tests/learning-hub.spec.js` currently assert the P2 transitional behavior:
  - line ~347: after clicking the `collar` chip in a client drill → `await expect(page.locator("body")).toHaveAttribute("data-dest", "lab");`
  - line ~358: after clicking the `long-call` module chip → `await expect(page.locator("body")).toHaveAttribute("data-dest", "lab");`

---

## File Map

| File | Change |
|---|---|
| `tests/learning-hub.spec.js` | Update the two chip tests to assert the overlay opens and the user stays in the plan |
| `app.js` | Swap the `[data-select-strategy]` handler from `selectStrategy + applyDestination("lab")` to `openLabOverlay(id)` |

---

## Task 1: Update the two chip tests to expect the overlay (TDD — make them fail first)

**Files:**
- Modify: `tests/learning-hub.spec.js`

- [ ] **Step 1: Update the client-drill collar chip assertion**

Find (around line 346-349):

```js
  await page.locator('[data-client-drill-card="protect-concentrated-stock"] [data-select-strategy="collar"]').click();
  await expect(page.locator("body")).toHaveAttribute("data-dest", "lab");
  await expect(page.locator("#strategyTitle")).toContainText("Collar");
  await expect(page.locator("#mainChart svg")).toBeVisible();
```

Replace with:

```js
  await page.locator('[data-client-drill-card="protect-concentrated-stock"] [data-select-strategy="collar"]').click();
  // chip opens the lab as an overlay; the user stays in the plan
  await expect(page.locator("#labOverlay")).toBeVisible();
  await expect(page.locator("#labOverlay #labRoot #mainChart svg")).toHaveCount(1);
  await expect(page.locator("#strategyTitle")).toContainText("Collar");
  await expect(page.locator("body")).toHaveAttribute("data-dest", "plan");
```

- [ ] **Step 2: Update the module long-call chip assertion**

Find (around line 356-359):

```js
  await page.locator('[data-select-strategy="long-call"]').first().click();

  await expect(page.locator("body")).toHaveAttribute("data-dest", "lab");
  await expect(page.locator("#strategyTitle")).toContainText("Long Call");
  await expect(page.locator("#mainChart svg")).toBeVisible();
```

Replace with:

```js
  await page.locator('[data-select-strategy="long-call"]').first().click();

  // chip opens the lab as an overlay; the user stays in the plan
  await expect(page.locator("#labOverlay")).toBeVisible();
  await expect(page.locator("#labOverlay #labRoot #mainChart svg")).toHaveCount(1);
  await expect(page.locator("#strategyTitle")).toContainText("Long Call");
  await expect(page.locator("body")).toHaveAttribute("data-dest", "plan");
```

(If the exact surrounding lines differ slightly, keep the existing `.click()` line and the `#strategyTitle` assertion; only replace the `data-dest="lab"` assertion with the four overlay/plan assertions shown.)

- [ ] **Step 3: Run the two tests — verify they now FAIL against the current handler**

```bash
npx playwright test tests/learning-hub.spec.js --grep "client recommendation drills" --reporter=line
npx playwright test tests/learning-hub.spec.js --grep "strategy chips in learning modules" --reporter=line
```

Expected: both FAIL — the current handler navigates to `data-dest="lab"` and does not open `#labOverlay`, so `expect(#labOverlay).toBeVisible()` fails.

---

## Task 2: Swap the chip handler to open the overlay

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace the `[data-select-strategy]` handler**

Find (app.js ~4345):

```js
  if (event.target.matches("[data-select-strategy]")) {
    selectStrategy(event.target.dataset.selectStrategy);
    applyDestination("lab");
    return;
  }
```

Replace with:

```js
  if (event.target.matches("[data-select-strategy]")) {
    openLabOverlay(event.target.dataset.selectStrategy);
    return;
  }
```

- [ ] **Step 2: Syntax check**

```bash
node --check app.js
```

Expected: no output.

- [ ] **Step 3: Run the two tests — verify they now PASS**

```bash
npx playwright test tests/learning-hub.spec.js --grep "client recommendation drills" --reporter=line
npx playwright test tests/learning-hub.spec.js --grep "strategy chips in learning modules" --reporter=line
```

Expected: both PASS — clicking a chip opens `#labOverlay` with the strategy's chart, `#strategyTitle` updates, and `body` stays `data-dest="plan"`.

---

## Task 3: Regression + commit

- [ ] **Step 1: Full acceptance**

```bash
node --check app.js
npm test
git diff --check
```

Expected: `node --check` clean; **all** tests pass (the suite count is unchanged from P2 — 48 — since this phase modifies behavior, not test count); `git diff --check` clean.

- [ ] **Step 2: Browser smoke check**

Open `index.html` (default 转型计划). Go to the 模块 tab, click a strategy chip on a module card → the lab opens as a fullscreen overlay showing that strategy's payoff/Greeks; the plan is still behind it; click × (or press Esc, or click the backdrop) → the overlay closes and you are still in 转型计划 (not the lab destination). Confirm the library still behaves differently: 策略库 → click a strategy → switches to the 实验室 destination (unchanged from P2).

- [ ] **Step 3: Commit**

```bash
git add app.js tests/learning-hub.spec.js
git commit -m "feat(P3a): in-plan strategy chips open the lab overlay instead of navigating"
```

---

## Notes for P3b (do not implement here)

- P3b is the larger restructure: replace the 12-tab Learning Hub with a **sector spine** (A/B/C/D/E + 🏁 Sprint) driving a **module stream**, regrouping the sector-specific deep content (vol/dealer → C, exotics → E, research → D, bridge/construction/client-drills → A/B) under their sectors and dissolving the tab bar. The in-plan overlay (this phase) is the interaction those module chips will use.
- P4 then moves the global controls (CN/EN, 初级/进阶/专业) out of the workspace topbar so they are reachable in the `library` destination, finalizes the 练习场 + Sprint capstone, and removes any now-dead tab code.
