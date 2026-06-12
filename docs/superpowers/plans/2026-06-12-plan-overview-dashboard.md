# 转型计划 Overview Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (For this project, execution is handed to Codex; steps are written to be followed verbatim with no extra context.)

**Goal:** Turn the 转型计划 "总览" view from a static duplicate of the sector spine into a progress dashboard (clickable sector cards with per-sector progress + a "继续学习" CTA), and remove the vestigial 开放/未开放 gating that produced the contradictory "SPRINT · 未开放" label.

**Architecture:** Rewrite `renderLearningRoadmap()` (the overview panel renderer) to compute per-sector progress and render actionable cards; add two small helpers (`sectorProgress`, `nextIncompleteSector`). Cards and the CTA reuse the existing `data-sector-spine` action — so the delegated handler is widened from `matches` to `closest` (one change, serves spine + cards). Remove the now-dead `status` data: the four `roadmap[N].status = "active"` mutations and the six `status:` fields in the roadmap array (nothing reads them after this rewrite). Presentation + data cleanup only; no schema change.

**Tech Stack:** Vanilla JS (ES5-style globals), Playwright e2e. No build step. Spec: `docs/superpowers/specs/2026-06-12-plan-overview-dashboard-design.md`. Builds on the completed IA redesign (latest `6703ee9`).

---

## Context the implementer needs

- The 转型计划 destination shows a sector spine (`#sectorSpine`, items overview/A/B/C/D/E/sprint). Selecting **overview** marks the `roadmap` panel `.active`, whose inner `#learningRoadmap` div is filled by `renderLearningRoadmap()` (app.js ~2678-2702). `applySector(sector)` (app.js ~3845) switches sectors; it is triggered by the delegated handler `if (event.target.matches("[data-sector-spine]")) { applySector(event.target.dataset.sectorSpine); return; }` (app.js ~4213).
- The aggregate progress line (模块 X/30 · 场景 X/211 · 演练 X/20 · 专业冲刺 X/60 · 研究演练 X/15) is already rendered separately into `#learningProgressSummary` in the hub heading (index.html ~75) by `renderLearningProgressSummary()`. The dashboard does NOT duplicate it — it adds the CTA + reworked cards into `#learningRoadmap`.
- Per-sector module total must use the same default as the module stream: `(module.sector || "A")`. Live totals: A=9, B=4, C=11, E=6 (the 5 sector-less sprint modules default into A); D=0 modules; sprint=0 modules. So D's progress uses `viewToTradeDrills` (15) and sprint's uses `professionalSprintQuestions` (60).
- State available: `state.learning.completedModules` / `completedSprintQuestions` / `completedViewToTradeDrills` (arrays). `learningContent()` exposes `.modules`, `.roadmap`, `.viewToTradeDrills`, `.professionalSprintQuestions`. `formatSectorBadge(sector)` returns the localized "Sector X" / "Sprint" badge. `learningLanguage()` returns `"cn"`/`"en"`. `escapeHtml` exists.
- The roadmap data (`data/learning-content.js`): items at lines ~7-59 each have a `status:` field (line 7 `"active"`, lines 17/27/39/49/59 `"locked"`) and there are four mutations `window.D1_LEARNING_CONTENT.roadmap[1..4].status = "active";` (lines 536, 1982, 2569, 5542). `grep -n "status:" data/learning-content.js` returns exactly those 6 field lines and nothing else — they are only read by the current `renderLearningRoadmap` (lines 2691-2692), which this plan rewrites.
- The current `renderLearningRoadmap()` to be replaced (app.js 2678-2702):
  ```js
  function renderLearningRoadmap() {
    const target = document.getElementById("learningRoadmap");
    if (!target) return;
    target.innerHTML = `
      <p class="learning-copy">${escapeHtml(learningUiText("roadmapIntro"))}</p>
      <div class="roadmap-grid">
        ${learningContent().roadmap.map((item) => {
          const note = item.note || item.noteCn ? `<p class="learning-note">${escapeHtml(learningLanguage() === "cn" ? (item.noteCn || item.note || "") : (item.note || ""))}</p>` : "";
          const isCn = learningLanguage() === "cn";
          const title = isCn ? (item.titleCn || item.title) : item.title;
          const focus = isCn ? (item.focusCn || item.focus) : item.focus;
          const deliverables = isCn ? (item.deliverablesCn || item.deliverables || []) : (item.deliverables || []);
          return `
          <article class="roadmap-card ${item.status === "locked" ? "locked" : "active"}" data-sector="${escapeHtml(item.sector || "")}">
            <p class="learning-kicker">${escapeHtml(formatSectorBadge(item.sector))} · ${item.status === "active" ? learningUiText("active") : learningUiText("locked")}</p>
            <h4 class="learning-title">${escapeHtml(title)}</h4>
            <p class="learning-copy">${escapeHtml(focus)}</p>
            ${note}
            <span class="learning-label">${escapeHtml(learningUiText("deliverables"))}</span>
            <ul>${deliverables.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
          </article>
        `}).join("")}
      </div>
    `;
  }
  ```

---

## File Map

| File | Change |
|---|---|
| `tests/learning-hub.spec.js` | Add overview-dashboard tests (clickable cards, per-sector progress, no lock text, CTA) |
| `app.js` | Add `sectorProgress()` + `nextIncompleteSector()`; rewrite `renderLearningRoadmap()` as the dashboard; widen the spine click handler from `matches` to `closest` |
| `data/learning-content.js` | Remove the 4 `roadmap[N].status` mutations and the 6 roadmap `status:` fields |
| `styles.css` | Add `.overview-header` / `.overview-cta` / `.overview-progress` styles; make `.roadmap-card` look clickable |

---

## Task 1: Write failing tests for the dashboard

**Files:**
- Modify: `tests/learning-hub.spec.js`

- [ ] **Step 1: Append these tests** (the file's existing tests use `"file://" + process.cwd().replace(/\\/g, "/") + "/index.html"`; match that goto convention)

```javascript
test("plan overview is a progress dashboard with clickable sector cards and no lock labels", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  // default destination is plan, default sector is overview
  await expect(page.locator('[data-sector-spine="overview"].sector-spine-item')).toHaveClass(/active/);

  // the vestigial gating labels are gone
  await expect(page.locator("#learningRoadmap")).not.toContainText("未开放");

  // per-sector progress is shown on the cards (fresh state = 0 done)
  await expect(page.locator('#learningRoadmap .roadmap-card[data-sector-spine="A"]')).toContainText("0/9");
  await expect(page.locator('#learningRoadmap .roadmap-card[data-sector-spine="sprint"]')).toContainText("0/60");
  await expect(page.locator('#learningRoadmap .roadmap-card[data-sector-spine="D"]')).toContainText("0/15");

  // clicking a sector card jumps to that sector (handler reads the card's data-sector-spine)
  await page.locator('#learningRoadmap .roadmap-card[data-sector-spine="C"]').click();
  await expect(page.locator('[data-sector-spine="C"].sector-spine-item')).toHaveClass(/active/);
  await expect(page.locator('.learning-panel[data-learning-panel="vol-framework"]')).toHaveClass(/active/);
});

test("plan overview continue CTA jumps to the first incomplete sector", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // fresh progress → first incomplete sector is A
  await expect(page.locator("#learningRoadmap .overview-cta")).toBeVisible();
  await page.locator("#learningRoadmap .overview-cta").click();
  await expect(page.locator('[data-sector-spine="A"].sector-spine-item')).toHaveClass(/active/);
});
```

- [ ] **Step 2: Run and verify they fail**

```bash
npx playwright test tests/learning-hub.spec.js --grep "progress dashboard|continue CTA" --reporter=line
```

Expected: failures (cards have no `data-sector-spine`, no progress text, `.overview-cta` does not exist, and "未开放" is still rendered).

---

## Task 2: app.js — dashboard renderer + helpers + handler widening

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace `renderLearningRoadmap()` and add the two helpers**

Replace the entire current `renderLearningRoadmap()` function (app.js ~2678-2702, shown in full in the Context section) with:

```js
function sectorProgress(sector) {
  var content = learningContent();
  if (sector === "sprint") {
    return {
      done: state.learning.completedSprintQuestions.length,
      total: (content.professionalSprintQuestions || []).length,
      unit: learningLanguage() === "cn" ? "冲刺题" : "sprint Qs",
    };
  }
  if (sector === "D") {
    return {
      done: state.learning.completedViewToTradeDrills.length,
      total: (content.viewToTradeDrills || []).length,
      unit: learningLanguage() === "cn" ? "研究演练" : "drills",
    };
  }
  var inSector = (content.modules || []).filter(function (m) { return (m.sector || "A") === sector; });
  var done = inSector.filter(function (m) { return state.learning.completedModules.includes(m.id); }).length;
  return { done: done, total: inSector.length, unit: learningLanguage() === "cn" ? "模块" : "modules" };
}

function nextIncompleteSector() {
  var order = ["A", "B", "C", "D", "E", "sprint"];
  for (var i = 0; i < order.length; i++) {
    var p = sectorProgress(order[i]);
    if (p.total > 0 && p.done < p.total) return order[i];
  }
  return null;
}

function renderLearningRoadmap() {
  const target = document.getElementById("learningRoadmap");
  if (!target) return;
  const isCn = learningLanguage() === "cn";
  const next = nextIncompleteSector();
  const ctaLabel = next
    ? (isCn ? "继续学习 → " : "Continue → ") + formatSectorBadge(next)
    : (isCn ? "🎉 全部完成" : "🎉 All complete");
  const cta = next
    ? `<button class="overview-cta" type="button" data-sector-spine="${escapeHtml(next)}">${escapeHtml(ctaLabel)}</button>`
    : `<span class="overview-cta done">${escapeHtml(ctaLabel)}</span>`;

  const cards = learningContent().roadmap.map((item) => {
    const sector = item.sector || "A";
    const title = isCn ? (item.titleCn || item.title) : item.title;
    const focus = isCn ? (item.focusCn || item.focus) : item.focus;
    const deliverables = isCn ? (item.deliverablesCn || item.deliverables || []) : (item.deliverables || []);
    const note = (item.note || item.noteCn)
      ? `<p class="learning-note">${escapeHtml(isCn ? (item.noteCn || item.note || "") : (item.note || ""))}</p>`
      : "";
    const p = sectorProgress(sector);
    const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
    const progress = p.total
      ? `<div class="overview-progress"><span class="overview-progress-text">${p.done}/${p.total} ${escapeHtml(p.unit)}</span><span class="overview-progress-bar"><span style="width:${pct}%"></span></span></div>`
      : "";
    return `
      <article class="roadmap-card" role="button" tabindex="0" data-sector-spine="${escapeHtml(sector)}">
        <p class="learning-kicker">${escapeHtml(formatSectorBadge(sector))}</p>
        <h4 class="learning-title">${escapeHtml(title)}</h4>
        ${progress}
        <p class="learning-copy">${escapeHtml(focus)}</p>
        ${note}
        <span class="learning-label">${escapeHtml(learningUiText("deliverables"))}</span>
        <ul>${deliverables.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
      </article>
    `;
  }).join("");

  target.innerHTML = `
    <div class="overview-header">
      <p class="learning-copy">${escapeHtml(learningUiText("roadmapIntro"))}</p>
      ${cta}
    </div>
    <div class="roadmap-grid">${cards}</div>
  `;
}
```

- [ ] **Step 2: Widen the spine click handler to `closest` (so the whole card is clickable)**

Find (app.js ~4213):

```js
  if (event.target.matches("[data-sector-spine]")) {
    applySector(event.target.dataset.sectorSpine);
    return;
  }
```

Replace with:

```js
  var spineTarget = event.target.closest("[data-sector-spine]");
  if (spineTarget) {
    applySector(spineTarget.dataset.sectorSpine);
    return;
  }
```

- [ ] **Step 3: Syntax check + run the new tests**

```bash
node --check app.js
npx playwright test tests/learning-hub.spec.js --grep "progress dashboard|continue CTA" --reporter=line
```

Expected: `node --check` clean; both new tests PASS.

---

## Task 3: data/learning-content.js — remove the dead `status` gating

**Files:**
- Modify: `data/learning-content.js`

- [ ] **Step 1: Remove the four status mutations and the six roadmap `status:` fields**

```bash
sed -i '/window\.D1_LEARNING_CONTENT\.roadmap\[[0-9]\]\.status = "active";/d' data/learning-content.js
sed -i '/^      status: "\(locked\|active\)",$/d' data/learning-content.js
```

- [ ] **Step 2: Verify no `status` gating remains and the data still loads**

```bash
grep -cE '\.status = "|^      status:' data/learning-content.js
node --check data/learning-content.js
node -e "global.window={};require('./data/learning-content.js');console.log('roadmap items:', window.D1_LEARNING_CONTENT.roadmap.length, '| any status field:', window.D1_LEARNING_CONTENT.roadmap.some(r => 'status' in r));"
```

Expected: the `grep -cE` count → `0` (no roadmap `status:` fields and no `.status =` mutations remain); `node --check` clean; the node line prints `roadmap items: 6 | any status field: false`.

---

## Task 4: styles.css — dashboard styling

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append at the end of styles.css**

```css
/* ============================================================================
   转型计划 overview dashboard (progress cards + continue CTA)
   ============================================================================ */
.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.overview-cta {
  border: 1px solid var(--cyan);
  border-radius: 999px;
  background: rgba(57, 199, 229, 0.12);
  color: var(--cyan);
  font-size: 13px;
  font-weight: 700;
  padding: 8px 18px;
  cursor: pointer;
  white-space: nowrap;
}
.overview-cta:hover { background: rgba(57, 199, 229, 0.2); }
.overview-cta.done { cursor: default; border-color: var(--green); color: var(--green); background: rgba(72, 212, 122, 0.12); }

.roadmap-card[role="button"] { cursor: pointer; transition: border-color 0.15s, transform 0.05s; }
.roadmap-card[role="button"]:hover { border-color: var(--cyan); }
.roadmap-card[role="button"]:active { transform: translateY(1px); }

.overview-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0 10px;
}
.overview-progress-text { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.overview-progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--panel-3);
  overflow: hidden;
}
.overview-progress-bar > span {
  display: block;
  height: 100%;
  background: var(--cyan);
  border-radius: 999px;
}
```

- [ ] **Step 2: Syntax sanity**

```bash
node --check app.js
```

Expected: no output.

---

## Task 5: Full regression + commit

- [ ] **Step 1: Full acceptance**

```bash
node --check app.js
node --check data/learning-content.js
npm test
git diff --check
```

Expected: `node --check` clean on both; **all** tests pass (the 2 new tests bring the total to 55); `git diff --check` clean. Note: the existing test "roadmap shows Sector A-E cards with correct names" still passes because the dashboard keeps the six cards with their titles.

- [ ] **Step 2: Browser smoke check**

Open `index.html` (default 转型计划 → 总览). Verify:
- No "SPRINT · 未开放" / no 开放/未开放 labels anywhere.
- A "继续学习 → Sector A" button at the top (fresh state); clicking it jumps to Sector A.
- Each sector card shows per-sector progress (A: 0/9 模块, C: 0/11 模块, D: 0/15 研究演练, Sprint: 0/60 冲刺题) with a thin progress bar; clicking any card jumps to that sector.
- Mark a module complete in a sector, return to 总览 → that sector's bar/number updates; the CTA advances when a sector is fully done.
- Easy/Pro both render the cards/bar/CTA legibly.

- [ ] **Step 3: Commit**

```bash
git add app.js data/learning-content.js styles.css tests/learning-hub.spec.js
git commit -m "feat: turn 转型计划 overview into a progress dashboard, drop vestigial gating"
```
