# Sector Restructure + Research Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure Learning Hub from Month 1-6 numbering to Sector A-E topology, merge Vol Framework and Dealer Desk into Sector C, and add a new Sector D (Research Bridge) tab powered by financial analysis skills.

**Architecture:** Three sequential phases — data migration (month→sector field rename + value remap), UI layer update (labels, filters, roadmap redesign), then new Sector D content and rendering. Each phase builds on the previous. Phase 1 tasks break existing tests first; Phase 2 restores them; Phase 3 adds new tests.

**Tech Stack:** Vanilla JS (ES5-style), Playwright for e2e tests, Node.js for syntax checks. No build step — changes take effect immediately on file save.

---

## File Map

| File | Change Type | Responsibility |
|---|---|---|
| `data/learning-content.js` | Modify | Rename `month` → `sector`, remap values, update roadmap array (merge Month 3+4, add Sector D, update titles) |
| `data/research-bridge-content.js` | **Create** | All Sector D content: `researchCases[]` and `viewToTradeDrills[]` |
| `app.js` | Modify | LEARNING_UI_TEXT keys, `formatLearningPeriod` callsites, scenario filter state + event handler, `renderLearningRoadmap`, `renderLearningTabs` validTabs, new `renderLearningResearchBridge`, `learningContent()` default, `defaultD1LearningProgress`, `renderLearningProgressSummary` |
| `index.html` | Modify | Add `research-bridge` tab button + panel div |
| `tests/learning-hub.spec.js` | Modify | Update `data-scenario-month-filter` selectors → `data-scenario-sector-filter`, update roadmap count/text assertions, add Research Bridge tests |

---

## Phase 1: Data Migration

### Task 1: Write failing tests for Sector rename

**Files:**
- Modify: `tests/learning-hub.spec.js`

- [ ] **Step 1: Add sector filter test block** at the end of `tests/learning-hub.spec.js`

```js
test("scenario bank uses sector filters A B C E not month numbers", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-scenarios-tab").click();

  // Sector filter buttons must exist
  await expect(page.locator('[data-scenario-sector-filter="A"]')).toBeVisible();
  await expect(page.locator('[data-scenario-sector-filter="B"]')).toBeVisible();
  await expect(page.locator('[data-scenario-sector-filter="C"]')).toBeVisible();
  await expect(page.locator('[data-scenario-sector-filter="E"]')).toBeVisible();

  // Sector C combines old Month 3 (45) + Month 4 (40) = 85 scenarios
  await page.locator('[data-scenario-sector-filter="C"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(85);

  // Sector B = old Month 2 = 40 scenarios
  await page.locator('[data-scenario-sector-filter="B"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);

  // No old month-number filter buttons
  await expect(page.locator('[data-scenario-month-filter="3"]')).toHaveCount(0);
});

test("roadmap shows Sector A-E cards with correct names", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#learningRoadmap .roadmap-card")).toHaveCount(6);
  await expect(page.locator("#learningRoadmap")).toContainText("Sector A");
  await expect(page.locator("#learningRoadmap")).toContainText("Risk Mechanics");
  await expect(page.locator("#learningRoadmap")).toContainText("Sector C");
  await expect(page.locator("#learningRoadmap")).toContainText("Market Dynamics");
  await expect(page.locator("#learningRoadmap")).toContainText("Combines Vol Framework");
  await expect(page.locator("#learningRoadmap")).toContainText("Sector D");
  await expect(page.locator("#learningRoadmap")).toContainText("Research Bridge");
  // no Month labels
  await expect(page.locator("#learningRoadmap")).not.toContainText("Month 1");
  await expect(page.locator("#learningRoadmap")).not.toContainText("Month 3");
});
```

- [ ] **Step 2: Run new tests to verify they fail**

```bash
npx playwright test tests/learning-hub.spec.js --grep "sector filters" --reporter=line
npx playwright test tests/learning-hub.spec.js --grep "roadmap shows Sector" --reporter=line
```

Expected: both FAIL (data-scenario-sector-filter selector not found, roadmap still shows Month labels).

---

### Task 2: Migrate learning-content.js — roadmap array

The roadmap array must go from 6 month-based items to 6 sector-based items: A, B, C (merged), D (new), E, sprint.

**Files:**
- Modify: `data/learning-content.js` lines 2–45

- [ ] **Step 1: Replace the entire `roadmap:` array** (lines 2-45 in `data/learning-content.js`)

```js
  roadmap: [
    {
      sector: "A",
      title: "Risk Mechanics",
      titleCn: "Risk Mechanics：Greeks 直觉",
      status: "active",
      focus: "Translate linear commodities exposure into delta, gamma, vega, theta, and carry intuition.",
      focusCn: "把线性 commodities 敞口转化为 delta、gamma、vega、theta 和 carry 直觉。",
      deliverables: ["4 Greeks modules", "Commodities bridge", "30 foundation scenarios"],
      deliverablesCn: ["4 个 Greeks 模块", "Commodities 桥接", "30 个基础场景"],
    },
    {
      sector: "B",
      title: "Trade Construction",
      titleCn: "Trade Construction：策略构建",
      status: "locked",
      focus: "Spreads, straddles, strangles, butterflies, condors, collars, and client suitability.",
      focusCn: "Spreads、straddles、strangles、butterflies、condors、collars 与客户适配。",
      deliverables: ["Strategy comparison matrix", "20 client structure recommendations"],
      deliverablesCn: ["策略对比矩阵", "20 个客户结构推荐演练"],
    },
    {
      sector: "C",
      title: "Market Dynamics",
      titleCn: "Market Dynamics：Vol 框架与 Dealer Desk",
      status: "locked",
      focus: "RV vs IV, skew, term structure, event vol, delta hedging, gamma scalping, inventory, and P&L attribution. Combines Vol Framework and Dealer/Market Making.",
      focusCn: "RV vs IV、skew、term structure、event vol、delta hedging、gamma scalping、inventory 与 P&L attribution。合并 Vol Framework 和 Dealer Desk。",
      deliverables: ["Vol trade checklist", "Dealer workflow drills", "85 vol + dealer scenarios"],
      deliverablesCn: ["Vol trade 检查清单", "Dealer workflow 演练", "85 个 vol + dealer 场景"],
      note: "Combines Vol Framework & Dealer/Market Making",
      noteCn: "合并 Vol Framework 与 Dealer/Market Making",
    },
    {
      sector: "D",
      title: "Research Bridge",
      titleCn: "Research Bridge：研究驱动的期权决策",
      status: "locked",
      focus: "Translate equity research outputs (earnings previews, sector analysis, comps, IC memos, investment theses) into options strategy decisions.",
      focusCn: "把股票研究产出（earnings preview、sector analysis、comps、IC memo、investment thesis）转化为期权策略决策。",
      deliverables: ["16 research case cards", "15 view-to-trade drills", "20+ research-driven scenarios"],
      deliverablesCn: ["16 张研究案例卡", "15 个 View-to-Trade 演练", "20+ 个研究驱动场景"],
    },
    {
      sector: "E",
      title: "Complex Products",
      titleCn: "Complex Products：Exotics 与结构化产品",
      status: "locked",
      focus: "Asian, barrier, quanto, digital, autocallable, and client-driven payoff design.",
      focusCn: "Asian、barrier、quanto、digital、autocallable 与客户驱动的收益结构设计。",
      deliverables: ["Exotics bridge", "36 exotics scenarios"],
      deliverablesCn: ["Exotics Bridge 面板", "36 个 exotics 场景"],
    },
    {
      sector: "sprint",
      title: "Professional Sprint",
      titleCn: "专业冲刺",
      status: "locked",
      focus: "Portfolio Greeks limits, stress testing, scenario drills, and trade idea articulation.",
      focusCn: "Portfolio Greeks limits、压力测试、场景演练和交易想法表达。",
      deliverables: ["60 sprint questions", "Skill checklist"],
      deliverablesCn: ["60 个专业冲刺题", "技能检查清单"],
    },
  ],
```

- [ ] **Step 2: Check syntax**

```bash
node --check data/learning-content.js
```

Expected: no output (no errors).

---

### Task 3: Migrate learning-content.js — all other month fields

All module, scenario, and client drill objects use `month: 1/2/3/4/5`. These need mechanical remapping. 245 occurrences — use find-and-replace in order (most specific first to avoid double-replacement).

**Files:**
- Modify: `data/learning-content.js`

- [ ] **Step 1: Run the migration** using your editor's Find & Replace with these exact substitutions, in this order:

| Find (exact) | Replace with |
|---|---|
| `month: 6,` | `sector: "sprint",` |
| `month: 5,` | `sector: "E",` |
| `month: 4,` | `sector: "C",` |
| `month: 3,` | `sector: "C",` |
| `month: 2,` | `sector: "B",` |
| `month: 1,` | `sector: "A",` |

Run replacements **only on `data/learning-content.js`**. The `.month` property accesses in `app.js` are handled separately in Task 5.

- [ ] **Step 2: Verify no `month:` field assignments remain** (content strings like "front-month" are OK)

```bash
node -e "const c = require('./data/learning-content.js'); const s = JSON.stringify(window.D1_LEARNING_CONTENT); const hits = (s.match(/\"month\":/g)||[]).length; console.log('month field occurrences:', hits);"
```

Because `learning-content.js` sets `window.D1_LEARNING_CONTENT`, run this differently:

```bash
node -e "
global.window = {};
require('./data/learning-content.js');
const data = window.D1_LEARNING_CONTENT;
const allObjects = [
  ...data.roadmap,
  ...data.modules,
  ...(data.scenarios||[]),
  ...(data.clientDrills||[]),
];
const withMonth = allObjects.filter(o => 'month' in o);
console.log('Objects still with month field:', withMonth.length);
"
```

Expected output: `Objects still with month field: 0`

- [ ] **Step 3: Check syntax**

```bash
node --check data/learning-content.js
```

Expected: no output.

---

## Phase 2: UI Layer Update

### Task 4: Update LEARNING_UI_TEXT in app.js

**Files:**
- Modify: `app.js` lines ~2275–2278 (CN block) and ~2391–2394 (EN block) and ~2358 (CN allMonths) and ~2474 (EN allMonths)

- [ ] **Step 1: Update CN text block** — in `app.js`, find and replace:

```js
// Find (CN block, around line 2275):
    month: "第",
    monthSuffix: "月",
```
Replace with:
```js
    sector: "第",
    sectorSuffix: "区",
```

- [ ] **Step 2: Update CN allMonths** — find and replace:

```js
// Find (around line 2358):
    allMonths: "全部月份",
```
Replace with:
```js
    allSectors: "全部区域",
```

- [ ] **Step 3: Update EN text block** — find and replace:

```js
// Find (EN block, around line 2391):
    month: "Month",
    monthSuffix: "",
```
Replace with:
```js
    sector: "Sector",
    sectorSuffix: "",
```

- [ ] **Step 4: Update EN allMonths** — find and replace:

```js
// Find (around line 2474):
    allMonths: "All Months",
```
Replace with:
```js
    allSectors: "All Sectors",
```

- [ ] **Step 5: Add `"research-bridge"` to both `tabs` objects** in `LEARNING_UI_TEXT`

In the CN `tabs` block (around line 2265), add after `scenarios: "场景题库",`:
```js
      "research-bridge": "研究桥接",
```

In the EN `tabs` block (around line 2381), add after `scenarios: "Scenario Bank",`:
```js
      "research-bridge": "Research Bridge",
```

- [ ] **Step 6: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 5: Update formatLearningPeriod callsites in app.js

All `formatLearningPeriod("month", ...)` calls need to change to `"sector"`. There are 5 callsites.

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace all formatLearningPeriod callsites** — find and replace all occurrences of `formatLearningPeriod("month",` with `formatLearningPeriod("sector",` in `app.js`

- [ ] **Step 2: Replace `.month` property accesses** in `app.js` — these are separate from the formatLearningPeriod type argument. Find and replace in `app.js` only:

| Find (exact, in app.js) | Replace with |
|---|---|
| `module.month \|\| 1` | `module.sector \|\| "A"` |
| `drill.month \|\| 2` | `drill.sector \|\| "B"` |
| `scenario.month \|\| 1` | `scenario.sector \|\| "A"` |
| `item.id \|\| item.month` | `item.id \|\| item.sector` |

The `item.id || item.month` pattern is in `localizedLearning()` (line ~2615) and is used to look up CN override content by key. Updating it to `item.sector` ensures the key works for objects without an `id`.

- [ ] **Step 3: Verify count** — confirm exactly 0 `formatLearningPeriod("month"` remain:

```bash
node -e "const fs=require('fs'); const src=fs.readFileSync('app.js','utf8'); const hits=(src.match(/formatLearningPeriod\(\"month\"/g)||[]).length; console.log('remaining callsites:', hits);"
```

Expected: `remaining callsites: 0`

- [ ] **Step 3: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 6: Update scenario filter state and event handler in app.js

**Files:**
- Modify: `app.js` lines ~241–265 (defaultD1LearningProgress), ~3600–3640 (renderScenarioFilters), ~3656–3690 (renderLearningScenarios), ~4066–4071 (event handler)

- [ ] **Step 1: Update `defaultD1LearningProgress`** — find and replace:

```js
// Find (line ~262):
    scenarioMonthFilter: "all",
```
Replace with:
```js
    scenarioSectorFilter: "all",
```

- [ ] **Step 2: Update `renderScenarioFilters`** — replace the month-filter block (lines ~3624–3638):

```js
// Find this block:
  const monthIds = new Set(["all", ...content.scenarios.map((scenario) => String(scenario.month || 1))]);
  if (!monthIds.has(state.learning.scenarioMonthFilter)) {
    state.learning.scenarioMonthFilter = "all";
  }
  if (monthTarget) {
    const monthFilters = ["all", ...[...monthIds].filter((id) => id !== "all").sort((a, b) => Number(a) - Number(b))];
    monthTarget.innerHTML = monthFilters.map((id) => {
      const label = id === "all" ? learningUiText("allMonths") : formatLearningPeriod("sector", id);
      return `
        <button class="scenario-month-filter ${state.learning.scenarioMonthFilter === id ? "active" : ""}" type="button" data-scenario-month-filter="${id}">
          ${label}
        </button>
      `;
    }).join("");
  }
```

Replace with:
```js
  const sectorOrder = ["A", "B", "C", "D", "E", "sprint"];
  const sectorIds = new Set(["all", ...content.scenarios.map((s) => s.sector || "A")]);
  if (!sectorIds.has(state.learning.scenarioSectorFilter)) {
    state.learning.scenarioSectorFilter = "all";
  }
  if (monthTarget) {
    const sectorFilters = ["all", ...sectorOrder.filter((id) => sectorIds.has(id))];
    monthTarget.innerHTML = sectorFilters.map((id) => {
      const label = id === "all" ? learningUiText("allSectors") : formatLearningPeriod("sector", id);
      return `
        <button class="scenario-sector-filter ${state.learning.scenarioSectorFilter === id ? "active" : ""}" type="button" data-scenario-sector-filter="${id}">
          ${label}
        </button>
      `;
    }).join("");
  }
```

- [ ] **Step 3: Update `renderLearningScenarios`** — replace the month-filter validation and filtering lines (~3663–3673):

```js
// Find:
  const validMonths = new Set(["all", ...content.scenarios.map((scenario) => String(scenario.month || 1))]);
  const monthFilter = validMonths.has(state.learning.scenarioMonthFilter) ? state.learning.scenarioMonthFilter : "all";
  state.learning.scenarioMonthFilter = monthFilter;
```

Replace with:
```js
  const validSectors = new Set(["all", ...content.scenarios.map((s) => s.sector || "A")]);
  const sectorFilter = validSectors.has(state.learning.scenarioSectorFilter) ? state.learning.scenarioSectorFilter : "all";
  state.learning.scenarioSectorFilter = sectorFilter;
```

Then find the filter predicate line:
```js
// Find:
      && (monthFilter === "all" || String(scenario.month || 1) === monthFilter)
```

Replace with:
```js
      && (sectorFilter === "all" || (scenario.sector || "A") === sectorFilter)
```

- [ ] **Step 4: Update the scenario card meta span** (~line 3682):

```js
// Find:
          <span>${escapeHtml(formatLearningPeriod("sector", scenario.month || 1))}</span>
```

Replace with:
```js
          <span>${escapeHtml(formatLearningPeriod("sector", scenario.sector || "A"))}</span>
```

- [ ] **Step 5: Update event handler** (~line 4066):

```js
// Find:
  if (event.target.matches(".scenario-month-filter")) {
    state.learning.scenarioMonthFilter = event.target.dataset.scenarioMonthFilter;
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }
```

Replace with:
```js
  if (event.target.matches(".scenario-sector-filter")) {
    state.learning.scenarioSectorFilter = event.target.dataset.scenarioSectorFilter;
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }
```

- [ ] **Step 6: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 7: Update renderLearningRoadmap in app.js

The roadmap renderer needs to show Sector letter badges and use the new `sector` field.

**Files:**
- Modify: `app.js` — `renderLearningRoadmap` function (~lines 2679–2696)

- [ ] **Step 1: Replace the function body**

```js
// Find the entire function:
function renderLearningRoadmap() {
  const target = document.getElementById("learningRoadmap");
  if (!target) return;
  target.innerHTML = `
    <p class="learning-copy">${escapeHtml(learningUiText("roadmapIntro"))}</p>
    <div class="roadmap-grid">
      ${learningContent().roadmap.map((item) => `
        <article class="roadmap-card ${item.status === "locked" ? "locked" : "active"}">
          <p class="learning-kicker">${formatLearningPeriod("sector", item.month)} · ${item.status === "active" ? learningUiText("active") : learningUiText("locked")}</p>
          <h4 class="learning-title">${escapeHtml(localizedLearning("roadmap", item, "title"))}</h4>
          <p class="learning-copy">${escapeHtml(localizedLearning("roadmap", item, "focus"))}</p>
          <span class="learning-label">${escapeHtml(learningUiText("deliverables"))}</span>
          <ul>${localizedLearningList("roadmap", item, "deliverables").map((deliverable) => `<li>${escapeHtml(deliverable)}</li>`).join("")}</ul>
        </article>
      `).join("")}
    </div>
  `;
}
```

Replace with:
```js
function formatSectorBadge(sector) {
  if (!sector || sector === "sprint") return "Sprint";
  return `Sector ${sector}`;
}

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
        <article class="roadmap-card ${item.status === "locked" ? "locked" : "active"}">
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

- [ ] **Step 2: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 8: Register research-bridge tab and update validTabs

**Files:**
- Modify: `app.js` line ~2664
- Modify: `index.html` lines ~66–137

- [ ] **Step 1: Add `"research-bridge"` to validTabs in `renderLearningTabs`**

```js
// Find:
  const validTabs = new Set(["roadmap", "modules", "bridge", "construction", "client-drills", "vol-framework", "dealer-desk", "exotics-bridge", "exotics-risk", "professional-sprint", "scenarios"]);
```

Replace with:
```js
  const validTabs = new Set(["roadmap", "modules", "bridge", "construction", "client-drills", "vol-framework", "dealer-desk", "exotics-bridge", "exotics-risk", "professional-sprint", "scenarios", "research-bridge"]);
```

- [ ] **Step 2: Add tab button to `index.html`** — after the `exotics-risk` tab button (around line 83):

```html
<!-- Find: -->
            <button class="learning-tab" data-learning-tab="exotics-risk" type="button"
```

Add AFTER the closing `></button>` of the `exotics-risk` button, BEFORE the `professional-sprint` button:
```html
            <button class="learning-tab" data-learning-tab="research-bridge" type="button"
              role="tab" aria-selected="false"></button>
```

- [ ] **Step 3: Add panel div to `index.html`** — inside the learning panels container, after the `learningExoticsRisk` div and before the `learningProfessionalSprint` section:

```html
<!-- Find this block and add the new panel before it: -->
              <div id="learningProfessionalSprint"></div>
```

Add before it:
```html
              <div class="learning-panel" data-learning-panel="research-bridge">
                <div id="learningResearchBridge"></div>
              </div>
```

- [ ] **Step 4: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 9: Fix existing tests broken by sector rename

**Files:**
- Modify: `tests/learning-hub.spec.js`

- [ ] **Step 1: Update old scenario-month-filter selectors** — 4 occurrences at lines ~125, ~159, ~188, ~216:

```js
// Replace ALL occurrences of:
  await page.locator('[data-scenario-month-filter="2"]').click();
// With:
  await page.locator('[data-scenario-sector-filter="B"]').click();

// Replace:
  await page.locator('[data-scenario-month-filter="3"]').click();
// With:
  await page.locator('[data-scenario-sector-filter="C"]').click();

// Replace:
  await page.locator('[data-scenario-month-filter="4"]').click();
// With:
  await page.locator('[data-scenario-sector-filter="C"]').click();

// Replace:
  await page.locator('[data-scenario-month-filter="5"]').click();
// With:
  await page.locator('[data-scenario-sector-filter="E"]').click();
```

- [ ] **Step 2: Update roadmap count assertion** — line ~12:

```js
// Find:
  await expect(page.locator("#learningRoadmap .roadmap-card")).toHaveCount(6);
```

Keep count at 6 (Sector A, B, C, D, E + Sprint = 6 cards). No change needed here.

- [ ] **Step 3: Update roadmap text assertions** — lines ~13–19:

```js
// Find the block:
  await expect(page.locator("#learningRoadmap")).toContainText("Greeks 直觉：从 D1 exposure 出发");
  await expect(page.locator("#learningRoadmap")).toContainText("策略构建");
  await expect(page.locator("#learningRoadmap")).toContainText("Volatility trading 框架");
  await expect(page.locator("#learningRoadmap")).toContainText("动态对冲与做市");
  await expect(page.locator("#learningRoadmap")).toContainText("Exotics 与 structuring");
  await expect(page.locator("#learningRoadmap .roadmap-card").nth(4)).toContainText("Exotics Bridge 面板");
  await expect(page.locator("#learningRoadmap .roadmap-card").nth(5)).toContainText("60 个专业冲刺题");
```

Replace with:
```js
  await expect(page.locator("#learningRoadmap")).toContainText("Risk Mechanics：Greeks 直觉");
  await expect(page.locator("#learningRoadmap")).toContainText("Trade Construction：策略构建");
  await expect(page.locator("#learningRoadmap")).toContainText("Market Dynamics：Vol 框架与 Dealer Desk");
  await expect(page.locator("#learningRoadmap")).toContainText("Research Bridge：研究驱动的期权决策");
  await expect(page.locator("#learningRoadmap")).toContainText("Complex Products：Exotics 与结构化产品");
  await expect(page.locator("#learningRoadmap .roadmap-card").nth(4)).toContainText("Exotics Bridge 面板");
  await expect(page.locator("#learningRoadmap .roadmap-card").nth(5)).toContainText("60 个专业冲刺题");
```

- [ ] **Step 4: Update Sector C scenario count** — the test at line ~160 clicked Month 3 and expected 45 scenarios. After merge, Sector C = 85. But the test is now using `sector-filter="C"` and can check any subset. Update the Phase 3 vol test:

```js
// Find (in "D1 phase 3 volatility framework" test):
  await page.locator('[data-scenario-sector-filter="C"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(45);
```

Replace with:
```js
  await page.locator('[data-scenario-sector-filter="C"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(85);
```

- [ ] **Step 5: Update Sector C scenario count in Phase 4 test** — line ~188–189:

```js
// Find (in "D1 phase 4 dealer desk" test):
  await page.locator('[data-scenario-sector-filter="C"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(40);
```

Replace with:
```js
  await page.locator('[data-scenario-sector-filter="C"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(85);
```

---

### Task 10: Run Phase 1+2 tests and commit

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all tests pass. If failures remain, check that every `data-scenario-month-filter` selector in the test file has been replaced and that `node --check` passes on both `app.js` and `data/learning-content.js`.

- [ ] **Step 2: Browser smoke check**

Open `index.html` in a browser. Verify:
- Roadmap shows "Sector A", "Sector B", "Sector C", "Sector D", "Research Bridge", "Sector E"
- Sector C card contains "Combines Vol Framework"
- Scenario Bank filter row shows "Sector A / B / C / D / E" buttons instead of "Month 1 / 2 / 3 / 4 / 5"
- No visible "Month" label anywhere in Learning Hub

- [ ] **Step 3: Commit**

```bash
git add data/learning-content.js app.js index.html tests/learning-hub.spec.js
git commit -m "feat: restructure learning hub from Month 1-5 to Sector A-E topology"
```

---

## Phase 3: Research Bridge — New Data File and Content

### Task 11: Create data/research-bridge-content.js skeleton

**Files:**
- Create: `data/research-bridge-content.js`

- [ ] **Step 1: Create the file with the schema and first entry per skill**

```js
window.D1_RESEARCH_BRIDGE_CONTENT = {
  researchCases: [
    // --- EARNINGS (4 cases) ---
    {
      id: "rc-earnings-001",
      skill: "earnings",
      sector: "D",
      ticker: "NVDA",
      title: "Earnings Preview: NVDA — Beat Likely, Guidance Drives Reaction",
      titleCn: "业绩前瞻：NVDA — 大概率 Beat，Guidance 决定反应",
      context: "NVDA reports in 3 days. Options market implies ±8.2% move. Street consensus expects $5.60 EPS vs $5.12 last quarter. Data center growth is the key driver; any guidance cut on margins will be punished.",
      contextCn: "NVDA 3 天后公布财报。期权市场隐含波动幅度 ±8.2%。Street 共识预期 EPS $5.60 vs 上季度 $5.12。数据中心增长是核心驱动；任何利润率 guidance 下调都会受到惩罚。",
      keyView: "Implied move likely overstated; stock rarely moves more than 7% on beats alone.",
      keyViewCn: "隐含波动幅度可能偏高；单靠 beat 通常不超过 7% 涨幅。",
      impliedMove: "±8.2%",
      suggestedStructures: ["short iron condor", "short strangle (if margin allows)"],
      rationale: "If you believe the implied move overstates actual realized move on a likely beat, selling the wings via an iron condor collects premium while capping loss at defined strikes.",
      rationaleCn: "如果你认为隐含波动幅度高估了 beat 情境下的实际波动，通过 iron condor 卖出翼端可以收取权利金，同时将亏损限定在已知行权价内。",
    },
    // Entries rc-earnings-002, rc-earnings-003, rc-earnings-004:
    // Run /earnings on 3 more tickers (e.g. MSFT, META, AMZN) and fill in using the same schema above.

    // --- SECTOR ANALYSIS (3 cases) ---
    {
      id: "rc-sector-001",
      skill: "sector-analysis",
      sector: "D",
      ticker: "XLF (Financials)",
      title: "Sector Analysis: US Financials — Rate Sensitivity and Vol Skew",
      titleCn: "行业分析：美国金融板块 — 利率敏感性与 Vol Skew",
      context: "US financials (XLF) trade at 11x forward PE, a discount to S&P 500. Net interest margin expansion has stalled with curve flattening. Put skew on XLF is elevated due to credit risk concerns.",
      contextCn: "美国金融板块（XLF）以 11x 远期 PE 交易，折价于 S&P 500。随着收益率曲线趋平，净息差扩张已停滞。受信用风险担忧影响，XLF 的 put skew 偏高。",
      keyView: "Put skew offers attractive carry for those who are fundamentally positive on financials and want to sell tail risk.",
      keyViewCn: "对基本面看多金融板块、愿意卖出尾部风险的投资者，高 put skew 提供了有吸引力的 carry 机会。",
      impliedMove: null,
      suggestedStructures: ["put spread sale", "risk reversal (sell put / buy call)"],
      rationale: "Elevated put skew on XLF means puts are expensive relative to calls. Selling a put spread or risk reversal captures this premium while expressing a fundamentally positive view.",
      rationaleCn: "XLF 上的高 put skew 意味着 put 相对于 call 偏贵。卖出 put spread 或 risk reversal 可以捕捉这个权利金，同时表达基本面看多观点。",
    },
    // Entries rc-sector-002, rc-sector-003:
    // Run /sector on 2 more sectors (e.g. XLK Tech, XLE Energy) and fill in using the schema above.

    // --- COMPS (3 cases) ---
    {
      id: "rc-comps-001",
      skill: "comps",
      sector: "D",
      ticker: "AMZN vs GOOGL",
      title: "Comps: AMZN vs GOOGL — Cloud Growth Discount",
      titleCn: "可比公司分析：AMZN vs GOOGL — 云业务增长折价",
      context: "AMZN trades at 35x EV/EBITDA; GOOGL at 22x. Both have comparable cloud growth rates (~25% YoY). AMZN's retail drag suppresses multiple relative to pure-play cloud comps.",
      contextCn: "AMZN 以 35x EV/EBITDA 交易，GOOGL 为 22x。两者云业务增长率相近（约 25% 同比）。AMZN 的零售拖累导致估值倍数相对于纯云业务可比公司偏低。",
      keyView: "If retail headwinds ease, AMZN multiple could re-rate toward GOOGL; relative value play favors long AMZN calls / short GOOGL calls.",
      keyViewCn: "如果零售端逆风缓解，AMZN 估值倍数可能向 GOOGL 靠拢；相对价值交易倾向于 long AMZN calls / short GOOGL calls。",
      impliedMove: null,
      suggestedStructures: ["long AMZN call spread", "pair trade: long AMZN call / short GOOGL call"],
      rationale: "Comps analysis suggests AMZN is cheap relative to GOOGL on cloud fundamentals. A call spread on AMZN captures upside from multiple re-rating while capping premium outlay.",
      rationaleCn: "可比分析显示 AMZN 相对于 GOOGL 在云业务基本面上偏便宜。AMZN call spread 捕捉估值倍数修复的上行空间，同时控制权利金支出。",
    },
    // Entries rc-comps-002, rc-comps-003:
    // Run /comps on 2 more pairs and fill in using the schema above.

    // --- IC MEMO (3 cases) ---
    {
      id: "rc-ic-memo-001",
      skill: "ic-memo",
      sector: "D",
      ticker: "TSLA",
      title: "Initiating Coverage: TSLA — Outperform, PT $280",
      titleCn: "首次覆盖报告：TSLA — 跑赢大盘，目标价 $280",
      context: "Initiating TSLA at Outperform with $280 PT. Energy storage and FSD monetisation are underappreciated in consensus. Key risk: margin pressure from EV price competition. 12-month horizon.",
      contextCn: "以跑赢大盘评级启动 TSLA，目标价 $280。储能和 FSD 货币化在市场共识中被低估。主要风险：EV 价格竞争带来的利润率压力。12 个月视野。",
      keyView: "Bullish 12-month thesis with identifiable catalysts (FSD v13, energy storage contract announcements). Risk is margin compression.",
      keyViewCn: "12 个月看多逻辑，有明确催化剂（FSD v13、储能合同公告）。风险是利润率收缩。",
      impliedMove: null,
      suggestedStructures: ["long call spread (3-6 month)", "bull risk reversal"],
      rationale: "A 12-month bullish IC memo with limited-premium budget maps to a long call spread: buy ATM call, sell OTM call to fund. Strikes chosen around PT ($280) and current price.",
      rationaleCn: "12 个月看多首次覆盖报告，权利金预算有限，对应 long call spread：买入 ATM call，卖出 OTM call 降低成本。行权价选在目标价（$280）和当前价附近。",
    },
    // Entries rc-ic-memo-002, rc-ic-memo-003:
    // Run /ic-memo on 2 more tickers and fill in using the schema above.

    // --- THESIS TRACKER (3 cases) ---
    {
      id: "rc-thesis-001",
      skill: "thesis",
      sector: "D",
      ticker: "GLD (Gold)",
      title: "Thesis: Long Gold — Real Rate Decline Catalyst",
      titleCn: "投资逻辑：看多黄金 — 实际利率下行催化剂",
      context: "Thesis: Fed pivots in H2; real rates fall 50–75bps. Gold has historically rallied 15–20% in similar environments. Conviction: high. Time horizon: 6 months.",
      contextCn: "逻辑：美联储在下半年转向；实际利率下降 50-75bps。黄金在类似环境中历史上上涨 15-20%。信心度：高。时间视野：6 个月。",
      keyView: "High conviction 6-month bullish thesis; limited downside if Fed stays on hold (gold still supported by central bank buying).",
      keyViewCn: "高信心度 6 个月看多逻辑；如果美联储维持现状，下行有限（黄金仍受央行购金支撑）。",
      impliedMove: null,
      suggestedStructures: ["long call (6-month)", "bull call spread", "risk reversal"],
      rationale: "High conviction + 6-month horizon + defined downside concern = long call spread on GLD. Buy 6-month ATM call, sell OTM call to reduce premium. Retain upside to a 15% move.",
      rationaleCn: "高信心度 + 6 个月视野 + 下行风险可控 = GLD long call spread。买入 6 个月 ATM call，卖出 OTM call 降低权利金。保留 15% 上涨空间。",
    },
    // Entries rc-thesis-002, rc-thesis-003:
    // Run /thesis-tracker on 2 more theses and fill in using the schema above.
  ],

  viewToTradeDrills: [
    // --- EARNINGS (4 drills) ---
    {
      id: "vtd-earnings-001",
      sector: "D",
      researchInput: "NVDA reports in 3 days. Implied move = ±8.2%. Consensus expects a beat on EPS. Guidance is the key risk. You have no strong directional view but believe the implied move is too large.",
      researchInputCn: "NVDA 3 天后公布财报。隐含波动幅度 = ±8.2%。共识预期 EPS beat。Guidance 是关键风险。你没有强烈的方向性观点，但认为隐含波动幅度偏高。",
      question: "No directional view, max risk = defined. Which structure captures the overpriced implied move?",
      questionCn: "无方向性观点，最大亏损 = 已定义。哪个结构可以捕捉被高估的隐含波动幅度？",
      steps: [
        { key: "view", label: "Market View", labelCn: "市场观点", content: "Neutral on direction; implied move (±8.2%) likely overstates the realized move on a beat.", contentCn: "方向中性；隐含波动幅度（±8.2%）可能高估了 beat 情境下的实际波动。" },
        { key: "constraints", label: "Constraints", labelCn: "约束条件", content: "Max risk must be defined — no naked short options. Must capture premium from IV without directional exposure.", contentCn: "最大亏损必须已定义 — 不做裸空期权。必须在没有方向性敞口的情况下捕捉 IV 权利金。" },
        { key: "candidates", label: "Candidates", labelCn: "候选结构", content: "1. Short straddle — premium but unlimited risk. 2. Short strangle — more room but still unlimited. 3. Short iron condor — defined risk, net credit.", contentCn: "1. Short straddle — 收取权利金但风险无限。2. Short strangle — 空间更大但风险仍无限。3. Short iron condor — 风险已定义，净收信。" },
        { key: "recommendation", label: "Recommendation", labelCn: "推荐结构", content: "Short iron condor: sell ATM ±5% strangle, buy ±10% wings to cap loss. Net credit = max P&L. Max loss = wing width minus credit.", contentCn: "Short iron condor：卖出 ATM ±5% strangle，买入 ±10% 翼端限制亏损。净收信 = 最大盈利。最大亏损 = 翼端宽度减去收入权利金。" },
        { key: "risks", label: "Key Risks", labelCn: "关键风险", content: "Catastrophic guidance miss could push stock beyond the wings (>10% move). Assignment risk if near expiry. Liquidity risk on wings.", contentCn: "灾难性 guidance 下调可能推动股价超出翼端（>10% 波动）。临近到期时有被指派风险。翼端流动性风险。" },
        { key: "expression", label: "Professional Expression", labelCn: "专业表达", content: "We're selling the earnings vol premium with a defined-risk structure. The iron condor gives us net credit if realized move stays inside the short strikes, and the long wings cap our loss if the print is catastrophic.", contentCn: "我们用一个已定义风险的结构来卖出 earnings vol 权利金。Iron condor 在实际波动幅度保持在空头行权价内时给我们净收信，多头翼端在财报极端情况下限制亏损。" },
      ],
    },
    // vtd-earnings-002, vtd-earnings-003, vtd-earnings-004:
    // Generate using /earnings on 3 more tickers. Vary view: one bullish-on-beat, one bearish guidance risk, one pure vol sale.

    // --- SECTOR ANALYSIS (3 drills) ---
    {
      id: "vtd-sector-001",
      sector: "D",
      researchInput: "Sector analysis of US Financials (XLF): put skew is elevated (3-month 25-delta put IV = 22%, call IV = 16%). You are fundamentally positive on financials but want to monetise the expensive put skew.",
      researchInputCn: "美国金融板块（XLF）行业分析：put skew 偏高（3 个月 25-delta put IV = 22%，call IV = 16%）。你基本面看多金融板块，但想变现高估的 put skew。",
      question: "Bullish view, want to sell expensive put skew. Max premium outlay = zero. Which structure?",
      questionCn: "看多观点，想卖出高估的 put skew。最大权利金支出 = 零。哪个结构？",
      steps: [
        { key: "view", label: "Market View", labelCn: "市场观点", content: "Fundamentally bullish XLF; put skew elevated because of credit tail risk fears. That tail risk is overpriced given current credit fundamentals.", contentCn: "基本面看多 XLF；put skew 偏高因为市场担忧信用尾部风险。根据当前信用基本面，这个尾部风险被高估了。" },
        { key: "constraints", label: "Constraints", labelCn: "约束条件", content: "Zero net premium outlay. Want to express bullish view while monetising expensive puts.", contentCn: "净权利金支出为零。想在变现高估 put 的同时表达看多观点。" },
        { key: "candidates", label: "Candidates", labelCn: "候选结构", content: "1. Risk reversal (sell OTM put / buy OTM call) — zero net premium, captures skew. 2. Long call spread — debit required. 3. Put spread sale — credit but no upside.", contentCn: "1. Risk reversal（卖出 OTM put / 买入 OTM call）— 零净权利金，捕捉 skew。2. Long call spread — 需要支付权利金。3. Put spread 卖出 — 收信但无上行空间。" },
        { key: "recommendation", label: "Recommendation", labelCn: "推荐结构", content: "Risk reversal: sell 25-delta put, buy 25-delta call, structure for zero cost. Long the upside, short the expensive downside vol.", contentCn: "Risk reversal：卖出 25-delta put，买入 25-delta call，构建零成本结构。多头上行空间，空头高估的下行 vol。" },
        { key: "risks", label: "Key Risks", labelCn: "关键风险", content: "Unlimited downside if credit event materialises — the very scenario the skew was pricing. Monitor credit spreads; have a stop-loss level.", contentCn: "如果信用事件发生，下行风险无限 — 正是 skew 所定价的情景。监控信用利差；设定止损水平。" },
        { key: "expression", label: "Professional Expression", labelCn: "专业表达", content: "We're using the elevated put skew to fund our bullish call. The risk reversal is zero-cost — we're selling the fear premium in puts and buying the upside we fundamentally believe in.", contentCn: "我们用偏高的 put skew 来为看多的 call 融资。Risk reversal 是零成本的 — 我们在卖出 put 中的恐慌权利金，同时买入我们基本面看好的上行空间。" },
      ],
    },
    // vtd-sector-002, vtd-sector-003: Generate using /sector on 2 more sectors.

    // --- COMPS (2 drills) ---
    {
      id: "vtd-comps-001",
      sector: "D",
      researchInput: "Comps analysis: AMZN trades at 35x EV/EBITDA vs GOOGL at 22x. Both have ~25% cloud growth. AMZN retail drag suppresses multiple. You believe AMZN re-rates if retail margins recover. 3-month horizon.",
      researchInputCn: "可比分析：AMZN 以 35x EV/EBITDA 交易，GOOGL 为 22x。两者云业务增长率约 25%。AMZN 零售拖累压低估值。你认为如果零售利润率恢复，AMZN 将重新定价。3 个月视野。",
      question: "Bullish AMZN relative to GOOGL, 3-month horizon, limited premium budget. Which structure?",
      questionCn: "相对于 GOOGL 看多 AMZN，3 个月视野，权利金预算有限。哪个结构？",
      steps: [
        { key: "view", label: "Market View", labelCn: "市场观点", content: "Long AMZN vs short GOOGL — relative value. AMZN cheap on cloud fundamentals; catalyst is retail margin recovery.", contentCn: "多 AMZN 空 GOOGL — 相对价值。AMZN 在云业务基本面上偏便宜；催化剂是零售利润率恢复。" },
        { key: "constraints", label: "Constraints", labelCn: "约束条件", content: "Limited budget. 3-month horizon. Prefer not to hold stock (capital-efficient via options).", contentCn: "预算有限。3 个月视野。倾向不持有股票（通过期权提高资本效率）。" },
        { key: "candidates", label: "Candidates", labelCn: "候选结构", content: "1. Long AMZN call / short GOOGL call — pair trade, offsetting premium. 2. Long AMZN call spread — capped upside, limited debit. 3. Long AMZN stock — uses more capital.", contentCn: "1. 多 AMZN call / 空 GOOGL call — 配对交易，权利金相互抵消。2. AMZN long call spread — 上行有上限，有限权利金。3. 多 AMZN 股票 — 占用更多资本。" },
        { key: "recommendation", label: "Recommendation", labelCn: "推荐结构", content: "Long AMZN 3-month ATM call, short GOOGL 3-month ATM call (same notional). Net premium near zero if IVs are similar. Pure relative value expression.", contentCn: "多 AMZN 3 个月 ATM call，空 GOOGL 3 个月 ATM call（相同名义金额）。如果 IV 相近，净权利金接近零。纯粹的相对价值表达。" },
        { key: "risks", label: "Key Risks", labelCn: "关键风险", content: "Sector sell-off drags both down — GOOGL short call profits but AMZN long call losses. Relative thesis needs to work within time horizon.", contentCn: "板块整体下跌可能拖累两者 — GOOGL 空头 call 盈利，但 AMZN 多头 call 亏损。相对价值逻辑需要在时间视野内实现。" },
        { key: "expression", label: "Professional Expression", labelCn: "专业表达", content: "This is a capital-efficient pair trade using options. We're not betting on market direction; we're expressing the view that AMZN's cloud multiple should converge to GOOGL's, with the call pair capturing that relative move.", contentCn: "这是一个用期权实现的高资本效率配对交易。我们不是在赌市场方向；我们在表达 AMZN 的云业务估值倍数应该向 GOOGL 靠拢的观点，call 配对结构捕捉这个相对波动。" },
      ],
    },
    // vtd-comps-002: Generate using /comps on another pair.

    // --- IC MEMO (3 drills) ---
    {
      id: "vtd-ic-001",
      sector: "D",
      researchInput: "IC memo on TSLA: Outperform, PT $280 (current $220). 12-month horizon. Catalysts: FSD v13 launch, energy storage contracts. Key risk: margin compression from EV price war. Budget: willing to pay up to 2% of notional in premium.",
      researchInputCn: "TSLA 首次覆盖报告：跑赢大盘，目标价 $280（当前 $220）。12 个月视野。催化剂：FSD v13 发布、储能合同。关键风险：EV 价格战导致利润率收缩。预算：愿意支付不超过名义金额 2% 的权利金。",
      question: "Bullish 12-month thesis, 2% premium budget, defined downside. Which structure maps to this IC memo?",
      questionCn: "12 个月看多逻辑，2% 权利金预算，已定义下行风险。哪个结构与这份首次覆盖报告对应？",
      steps: [
        { key: "view", label: "Market View", labelCn: "市场观点", content: "Bullish TSLA 12 months. PT = $280 (+27% upside). Catalysts are identifiable. Risk is known (margin compression).", contentCn: "12 个月看多 TSLA。目标价 = $280（+27% 上涨空间）。催化剂可识别。风险已知（利润率收缩）。" },
        { key: "constraints", label: "Constraints", labelCn: "约束条件", content: "Premium budget ≤ 2% of notional. Defined max loss (not short any options uncapped). 12-month horizon.", contentCn: "权利金预算 ≤ 名义金额的 2%。已定义最大亏损（不做无上限空头期权）。12 个月视野。" },
        { key: "candidates", label: "Candidates", labelCn: "候选结构", content: "1. Long 12-month ATM call — too expensive, >2% premium. 2. Long 12-month call spread ($220/$280) — debit within budget. 3. LEAPS call — similar to #1.", contentCn: "1. 多 12 个月 ATM call — 太贵，>2% 权利金。2. 多 12 个月 call spread（$220/$280）— 权利金在预算内。3. LEAPS call — 类似 #1。" },
        { key: "recommendation", label: "Recommendation", labelCn: "推荐结构", content: "Long 12-month call spread: buy $220 call, sell $280 call. Max gain = $60/share if stock reaches PT. Max loss = net premium. Aligned exactly with IC memo PT.", contentCn: "多 12 个月 call spread：买入 $220 call，卖出 $280 call。最大盈利 = 如果股价达到目标价，每股 $60。最大亏损 = 净权利金。与首次覆盖报告目标价完全对应。" },
        { key: "risks", label: "Key Risks", labelCn: "关键风险", content: "Margin compression could cap the stock below PT; call spread expires worthless. Time decay erodes value if catalyst timing slips past 12 months.", contentCn: "利润率收缩可能使股价低于目标价；call spread 到期无价值。如果催化剂时机超过 12 个月，时间价值损耗会侵蚀价值。" },
        { key: "expression", label: "Professional Expression", labelCn: "专业表达", content: "The call spread maps the IC memo thesis precisely: the long strike is the entry, the short strike is the PT, and the net premium is the cost of the view. We're capping our upside at exactly the analyst's target, which is the right trade-off given the budget.", contentCn: "Call spread 精确地体现了首次覆盖报告的逻辑：多头行权价是入场点，空头行权价是目标价，净权利金是这个观点的成本。我们将上行收益限制在分析师目标价，这是在预算约束下的正确权衡。" },
      ],
    },
    // vtd-ic-002, vtd-ic-003: Generate using /ic-memo on 2 more tickers.

    // --- THESIS TRACKER (3 drills) ---
    {
      id: "vtd-thesis-001",
      sector: "D",
      researchInput: "Investment thesis: Long Gold (GLD). Fed pivots H2, real rates fall 50-75bps. Historical precedent: gold +15-20% in similar environments. Conviction: high. Horizon: 6 months. Risk: Fed stays on hold.",
      researchInputCn: "投资逻辑：看多黄金（GLD）。美联储下半年转向，实际利率下降 50-75bps。历史先例：类似环境中黄金上涨 15-20%。信心度：高。视野：6 个月。风险：美联储维持现状。",
      question: "High conviction 6-month bullish thesis on GLD, want to maintain upside to +15% move. Limited downside concern. Which structure?",
      questionCn: "高信心度 6 个月看多 GLD，想保留 +15% 上涨的收益空间。下行担忧有限。哪个结构？",
      steps: [
        { key: "view", label: "Market View", labelCn: "市场观点", content: "High conviction bullish. +15-20% upside is the base case. Downside limited by central bank buying. 6-month horizon.", contentCn: "高信心度看多。+15-20% 上涨是基准情景。央行购金限制下行。6 个月视野。" },
        { key: "constraints", label: "Constraints", labelCn: "约束条件", content: "High conviction justifies some premium spend. Want to capture most of the +15% move. Don't want unlimited downside risk.", contentCn: "高信心度允许一定权利金支出。想捕捉 +15% 上涨的大部分空间。不想有无限下行风险。" },
        { key: "candidates", label: "Candidates", labelCn: "候选结构", content: "1. Long GLD stock — full upside but uses capital, no leverage. 2. Long 6-month ATM call — leverage but premium cost. 3. Long 6-month call spread (ATM / +15%) — cheaper, captures full thesis upside.", contentCn: "1. 多 GLD 股票 — 完整上行但占用资本，无杠杆。2. 多 6 个月 ATM call — 有杠杆但需权利金。3. 多 6 个月 call spread（ATM / +15%）— 更便宜，捕捉完整逻辑上行空间。" },
        { key: "recommendation", label: "Recommendation", labelCn: "推荐结构", content: "Long 6-month call spread: buy ATM call, sell call at +15% (PT level). Captures full upside of thesis. Premium is lower than naked call. Defined max loss.", contentCn: "多 6 个月 call spread：买入 ATM call，卖出 +15%（目标价水平）的 call。捕捉完整逻辑上行空间。权利金低于裸 call。已定义最大亏损。" },
        { key: "risks", label: "Key Risks", labelCn: "关键风险", content: "If gold rallies >15%, the short call caps profit — acceptable since thesis target is 15-20%. If Fed holds, downside limited to premium paid.", contentCn: "如果黄金上涨 >15%，空头 call 封顶盈利 — 可以接受，因为逻辑目标是 15-20%。如果美联储维持现状，下行损失仅限于支付的权利金。" },
        { key: "expression", label: "Professional Expression", labelCn: "专业表达", content: "The thesis has a clear price target — that maps directly to the short call strike. We buy the ATM call to gain leveraged exposure, sell the strike at our PT to reduce premium and express that we don't expect to be paid above our target.", contentCn: "这个逻辑有明确的目标价 — 直接对应空头行权价。我们买入 ATM call 获取杠杆敞口，卖出目标价处的行权价来降低权利金，同时表达我们不期望在目标价以上获得收益。" },
      ],
    },
    // vtd-thesis-002, vtd-thesis-003: Generate using /thesis-tracker on 2 more theses.
  ],
};
```

- [ ] **Step 2: Check syntax**

```bash
node --check data/research-bridge-content.js
```

Expected: no output.

---

### Task 12: Generate remaining content using financial skills

The skeleton above has 1 entry per skill type. Remaining 11 research cases and 11 View-to-Trade drills need to be generated.

**Files:**
- Modify: `data/research-bridge-content.js`

- [ ] **Step 1: Generate /earnings content**

Run the skill:
```
/earnings MSFT
/earnings META
/earnings AMZN
```

For each output, extract: implied move, key view, beat/miss probability framing, suggested structure rationale. Add as `rc-earnings-002`, `rc-earnings-003`, `rc-earnings-004` and corresponding `vtd-earnings-002`, `vtd-earnings-003`, `vtd-earnings-004`.

- [ ] **Step 2: Generate /sector content**

Run the skill:
```
/sector Technology (XLK)
/sector Energy (XLE)
```

Extract: sector IV vs HV spread, dominant skew direction, vol trade implication. Add as `rc-sector-002`, `rc-sector-003` and `vtd-sector-002`, `vtd-sector-003`.

- [ ] **Step 3: Generate /comps content**

Run the skill:
```
/comps META vs SNAP
```

Extract: relative valuation gap, mispricing hypothesis, options structure. Add as `rc-comps-002`, `rc-comps-003` and `vtd-comps-002`.

- [ ] **Step 4: Generate /ic-memo content**

Run the skill:
```
/ic-memo MSFT
/ic-memo GOOGL
```

Extract: rating, PT, time horizon, key catalysts, risks. Add as `rc-ic-memo-002`, `rc-ic-memo-003` and `vtd-ic-002`, `vtd-ic-003`.

- [ ] **Step 5: Generate /thesis-tracker content**

Run the skill with two themes, e.g.:
```
/thesis-tracker
```

Extract two active investment theses. Add as `rc-thesis-002`, `rc-thesis-003` and `vtd-thesis-002`, `vtd-thesis-003`.

- [ ] **Step 6: Verify content counts**

```bash
node -e "
global.window = {};
require('./data/research-bridge-content.js');
const d = window.D1_RESEARCH_BRIDGE_CONTENT;
console.log('researchCases:', d.researchCases.length, '(target: 16)');
console.log('viewToTradeDrills:', d.viewToTradeDrills.length, '(target: 15)');
"
```

Expected:
```
researchCases: 16 (target: 16)
viewToTradeDrills: 15 (target: 15)
```

- [ ] **Step 7: Check syntax**

```bash
node --check data/research-bridge-content.js
```

Expected: no output.

---

### Task 13: Add Sector D scenarios to learning-content.js

Add 20 new scenarios tagged `sector: "D"` to the `scenarios` array in `data/learning-content.js`. These are research-driven scenario bank entries generated from the same skill outputs.

**Files:**
- Modify: `data/learning-content.js` — append to the `scenarios` array

- [ ] **Step 1: Append 20 Sector D scenarios** at the end of the `scenarios` array, before the closing `]`:

Each scenario follows the existing schema. Sample for the first 5 — generate the remaining 15 from skill outputs:

```js
    {
      id: "sc-d-001",
      sector: "D",
      category: "strategy",
      level: "advanced",
      tags: ["earnings", "event-vol", "iron-condor"],
      title: "NVDA reports tomorrow: implied move ±8% but you're neutral on direction",
      titleCn: "NVDA 明天公布财报：隐含波动幅度 ±8%，但你方向中性",
      prompt: "You have no view on whether NVDA beats or misses, but you think the ±8% implied move is too large for what is likely a beat-driven reaction. Max risk must be defined. What structure do you use and why?",
      promptCn: "你对 NVDA beat 或 miss 没有观点，但你认为 ±8% 的隐含波动幅度对于可能的 beat 反应来说太大了。最大风险必须已定义。你使用什么结构，为什么？",
      answer: "Short iron condor: sell ATM ±5% strangle, buy ±10% wings. Net credit collected. Profits if realized move < implied move. Defined loss if move > wings. Aligned with view that IV overstates realized vol.",
      answerCn: "Short iron condor：卖出 ATM ±5% strangle，买入 ±10% 翼端。净收信。如果实际波动 < 隐含波动则盈利。如果波动 > 翼端则亏损已定义。与 IV 高估实际 vol 的判断一致。",
    },
    {
      id: "sc-d-002",
      sector: "D",
      category: "strategy",
      level: "advanced",
      tags: ["sector-analysis", "skew", "risk-reversal"],
      title: "XLF put skew elevated: you're bullish financials, want to sell the fear premium",
      titleCn: "XLF put skew 偏高：你看多金融板块，想卖出恐慌权利金",
      prompt: "XLF 25-delta put IV = 22%, call IV = 16%. You're fundamentally bullish on US financials. You want zero net premium outlay. Which structure captures the skew while expressing your view?",
      promptCn: "XLF 25-delta put IV = 22%，call IV = 16%。你基本面看多美国金融板块。你希望净权利金支出为零。哪个结构在表达你的观点的同时捕捉这个 skew？",
      answer: "Risk reversal: sell 25-delta put, buy 25-delta call, zero-cost structure. Short the expensive put vol, long the upside. Risk: if credit event materialises, unlimited downside on the short put.",
      answerCn: "Risk reversal：卖出 25-delta put，买入 25-delta call，零成本结构。空头高估的 put vol，多头上行空间。风险：如果信用事件发生，空头 put 有无限下行风险。",
    },
    {
      id: "sc-d-003",
      sector: "D",
      category: "strategy",
      level: "advanced",
      tags: ["ic-memo", "call-spread", "PT-alignment"],
      title: "IC memo says TSLA Outperform PT $280, current $220 — express with 2% premium budget",
      titleCn: "首次覆盖报告：TSLA 跑赢大盘，目标价 $280，当前 $220 — 用 2% 权利金预算表达",
      prompt: "You have a 12-month Outperform IC memo on TSLA with PT $280 (current $220). Premium budget = 2% of notional. Which structure captures the upside while staying within budget?",
      promptCn: "你有一份 TSLA 12 个月跑赢大盘的首次覆盖报告，目标价 $280（当前 $220）。权利金预算 = 名义金额的 2%。哪个结构能在预算内捕捉上行空间？",
      answer: "Long 12-month call spread: buy $220 call (ATM), sell $280 call (PT). Max gain = $60/share if thesis plays out. Premium < 2% of notional. Short call strike is exactly the analyst's PT.",
      answerCn: "多 12 个月 call spread：买入 $220 call（ATM），卖出 $280 call（目标价）。如果逻辑实现，最大盈利 = 每股 $60。权利金 < 名义金额的 2%。空头行权价正好是分析师的目标价。",
    },
    {
      id: "sc-d-004",
      sector: "D",
      category: "strategy",
      level: "advanced",
      tags: ["comps", "relative-value", "pair-trade"],
      title: "AMZN at 35x EV/EBITDA vs GOOGL at 22x — relative value options play",
      titleCn: "AMZN 35x EV/EBITDA vs GOOGL 22x — 相对价值期权交易",
      prompt: "Comps show AMZN cheap relative to GOOGL on cloud multiples. You're bullish AMZN relative to GOOGL over 3 months. Capital-efficient approach, near-zero premium. What do you do?",
      promptCn: "可比分析显示 AMZN 在云业务估值倍数上相对于 GOOGL 偏便宜。你在 3 个月内相对于 GOOGL 看多 AMZN。资本效率优先，接近零权利金。你怎么做？",
      answer: "Long AMZN 3-month ATM call / short GOOGL 3-month ATM call (same notional). Near-zero net premium if IVs are similar. Pure relative value: captures AMZN re-rating vs GOOGL without market directionality.",
      answerCn: "多 AMZN 3 个月 ATM call / 空 GOOGL 3 个月 ATM call（相同名义金额）。如果 IV 相近，净权利金接近零。纯相对价值：在不带市场方向性的情况下捕捉 AMZN 相对于 GOOGL 的重新定价。",
    },
    {
      id: "sc-d-005",
      sector: "D",
      category: "strategy",
      level: "advanced",
      tags: ["thesis", "gold", "call-spread"],
      title: "High conviction long gold thesis: Fed pivot expected, target +15%",
      titleCn: "高信心度看多黄金逻辑：预期美联储转向，目标 +15%",
      prompt: "Your investment thesis: Fed pivots H2, real rates fall, gold +15% in 6 months. Conviction is high. You want to capture the full +15% move without capping upside below it. Minimal premium. Which structure?",
      promptCn: "你的投资逻辑：美联储下半年转向，实际利率下降，黄金 6 个月内 +15%。信心度高。你想捕捉完整的 +15% 波动，不要在此之下封顶收益。最低权利金。哪个结构？",
      answer: "Long 6-month call spread on GLD: buy ATM call, sell call at +15% (thesis PT). Lower premium than naked call. Captures full upside of the thesis. If gold rallies more than 15%, you cap out — but that's above target.",
      answerCn: "GLD 多 6 个月 call spread：买入 ATM call，卖出 +15%（逻辑目标价）的 call。权利金低于裸 call。捕捉完整逻辑上行空间。如果黄金涨幅超过 15%，收益封顶 — 但那已经超过目标了。",
    },
    // sc-d-006 through sc-d-020: Generate 15 more using outputs from /earnings, /sector, /comps, /ic-memo, /thesis-tracker runs. Each scenario must include id, sector: "D", category, level, tags, title, titleCn, prompt, promptCn, answer, answerCn.
```

- [ ] **Step 2: Verify scenario count**

```bash
node -e "
global.window = {};
require('./data/learning-content.js');
const scenarios = window.D1_LEARNING_CONTENT.scenarios;
const sectorD = scenarios.filter(s => s.sector === 'D');
console.log('Total scenarios:', scenarios.length, '(was 191, now', scenarios.length, ')');
console.log('Sector D scenarios:', sectorD.length, '(target: 20)');
"
```

Expected:
```
Total scenarios: 211 (was 191, now 211)
Sector D scenarios: 20 (target: 20)
```

- [ ] **Step 3: Check syntax**

```bash
node --check data/learning-content.js
```

Expected: no output.

---

## Phase 4: Render Layer

### Task 14: Wire research-bridge-content.js into learningContent()

**Files:**
- Modify: `app.js` — `learningContent()` function (~line 2249)
- Modify: `index.html` — add script tag

- [ ] **Step 1: Add script tag to `index.html`** before the closing `</body>` tag, after the existing data script tags:

```html
<script src="data/research-bridge-content.js"></script>
```

- [ ] **Step 2: Update `learningContent()` in `app.js`** to merge in research bridge content:

```js
// Find:
function learningContent() {
  return window.D1_LEARNING_CONTENT || { roadmap: [], modules: [], bridgeComparisons: [], strategyComparisons: [], clientDrills: [], volFramework: [], volPlaybook: [], dealerWorkflow: [], dealerPnlAttribution: [], exoticsBridge: [], structuringCases: [], exoticsRiskDrills: [], exoticsModelLimitCards: [], professionalSprintQuestions: [], scenarios: [] };
}
```

Replace with:
```js
function learningContent() {
  const base = window.D1_LEARNING_CONTENT || { roadmap: [], modules: [], bridgeComparisons: [], strategyComparisons: [], clientDrills: [], volFramework: [], volPlaybook: [], dealerWorkflow: [], dealerPnlAttribution: [], exoticsBridge: [], structuringCases: [], exoticsRiskDrills: [], exoticsModelLimitCards: [], professionalSprintQuestions: [], scenarios: [] };
  const bridge = window.D1_RESEARCH_BRIDGE_CONTENT || { researchCases: [], viewToTradeDrills: [] };
  return { ...base, researchCases: bridge.researchCases, viewToTradeDrills: bridge.viewToTradeDrills };
}
```

- [ ] **Step 3: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 15: Add completedViewToTradeDrills to state

**Files:**
- Modify: `app.js` — `defaultD1LearningProgress` (~line 241), `loadD1LearningProgress` (~line 268)

- [ ] **Step 1: Add field to `defaultD1LearningProgress`**

```js
// Find:
    scenarioSectorFilter: "all",
    scenarioTopicFilter: "all",
```

Add before `scenarioSectorFilter`:
```js
    completedViewToTradeDrills: [],
    activeResearchFilter: "all",
```

- [ ] **Step 2: Add to the array-validation loop in `loadD1LearningProgress`**

```js
// Find:
    ["completedModules", "completedScenarios", "completedClientDrills", "reviewLaterScenarios", "completedSprintQuestions", "weakSprintQuestionIds", "revealedSprintRubrics", "currentSprintQuestionIds"].forEach((key) => {
```

Replace with:
```js
    ["completedModules", "completedScenarios", "completedClientDrills", "reviewLaterScenarios", "completedSprintQuestions", "weakSprintQuestionIds", "revealedSprintRubrics", "currentSprintQuestionIds", "completedViewToTradeDrills"].forEach((key) => {
```

- [ ] **Step 3: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 16: Implement renderLearningResearchBridge()

**Files:**
- Modify: `app.js` — add new function after `renderLearningExoticsRisk` (~line 3220)

- [ ] **Step 1: Add the render function**

```js
function renderLearningResearchBridge() {
  const target = document.getElementById("learningResearchBridge");
  if (!target) return;
  const content = learningContent();
  const cases = content.researchCases || [];
  const drills = content.viewToTradeDrills || [];
  const lang = learningLanguage();

  const filterOrder = ["all", "earnings", "sector-analysis", "comps", "ic-memo", "thesis"];
  const filterLabels = {
    cn: { all: "全部", earnings: "业绩前瞻", "sector-analysis": "行业分析", comps: "可比公司", "ic-memo": "首次覆盖", thesis: "投资逻辑" },
    en: { all: "All", earnings: "Earnings", "sector-analysis": "Sector Analysis", comps: "Comps", "ic-memo": "IC Memo", thesis: "Thesis" },
  };
  const labels = filterLabels[lang] || filterLabels.en;

  const validFilters = new Set(filterOrder);
  if (!validFilters.has(state.learning.activeResearchFilter)) {
    state.learning.activeResearchFilter = "all";
  }
  const activeFilter = state.learning.activeResearchFilter;

  const filteredCases = activeFilter === "all" ? cases : cases.filter((c) => c.skill === activeFilter);

  const filterButtons = filterOrder.filter((id) => id === "all" || cases.some((c) => c.skill === id)).map((id) => `
    <button class="research-filter ${activeFilter === id ? "active" : ""}" type="button" data-research-filter="${escapeHtml(id)}">
      ${escapeHtml(labels[id] || id)}
    </button>
  `).join("");

  const caseCards = filteredCases.map((rc) => {
    const title = lang === "cn" ? (rc.titleCn || rc.title) : rc.title;
    const context = lang === "cn" ? (rc.contextCn || rc.context) : rc.context;
    const keyView = lang === "cn" ? (rc.keyViewCn || rc.keyView) : rc.keyView;
    const rationale = lang === "cn" ? (rc.rationaleCn || rc.rationale) : rc.rationale;
    const structureList = (rc.suggestedStructures || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("");
    const moveBadge = rc.impliedMove ? `<span class="research-badge">${escapeHtml(rc.impliedMove)}</span>` : "";
    return `
      <article class="research-case-card">
        <div class="research-meta">
          <span class="research-skill-badge">${escapeHtml(rc.skill)}</span>
          <span class="research-ticker">${escapeHtml(rc.ticker || "")}</span>
          ${moveBadge}
        </div>
        <h4 class="learning-title">${escapeHtml(title)}</h4>
        <p class="learning-copy">${escapeHtml(context)}</p>
        <p class="learning-copy"><strong>View:</strong> ${escapeHtml(keyView)}</p>
        <ul class="research-structure-list">${structureList}</ul>
        <p class="learning-copy research-rationale">${escapeHtml(rationale)}</p>
      </article>
    `;
  }).join("");

  const drillCards = drills.map((drill) => {
    const completed = state.learning.completedViewToTradeDrills.includes(drill.id);
    const researchInput = lang === "cn" ? (drill.researchInputCn || drill.researchInput) : drill.researchInput;
    const question = lang === "cn" ? (drill.questionCn || drill.question) : drill.question;
    const stepHtml = (drill.steps || []).map((step) => {
      const stepLabel = lang === "cn" ? (step.labelCn || step.label) : step.label;
      const stepContent = lang === "cn" ? (step.contentCn || step.content) : step.content;
      return `
        <div class="vtt-step" data-vtt-step="${escapeHtml(step.key)}" data-vtt-drill="${escapeHtml(drill.id)}" hidden>
          <strong>${escapeHtml(stepLabel)}:</strong> ${escapeHtml(stepContent)}
        </div>
        <button class="learning-action vtt-reveal-step" type="button"
          data-reveal-vtt-step="${escapeHtml(step.key)}"
          data-vtt-drill="${escapeHtml(drill.id)}">
          ${escapeHtml(stepLabel)} ▶
        </button>
      `;
    }).join("");
    return `
      <article class="vtt-drill-card" data-vtt-drill-card="${escapeHtml(drill.id)}">
        <p class="learning-copy research-input">${escapeHtml(researchInput)}</p>
        <p class="learning-copy"><strong>${escapeHtml(question)}</strong></p>
        <div class="vtt-steps">${stepHtml}</div>
        <button class="learning-action ${completed ? "active" : ""}" type="button"
          data-complete-vtt="${escapeHtml(drill.id)}">
          ${completed ? (lang === "cn" ? "已完成" : "Completed") : (lang === "cn" ? "标记完成" : "Mark Complete")}
        </button>
      </article>
    `;
  }).join("");

  const desktitle = lang === "cn" ? "研究案例库" : "Research Desk";
  const drillstitle = lang === "cn" ? "View-to-Trade 演练" : "View-to-Trade Drills";

  target.innerHTML = `
    <section class="research-desk-section">
      <h3 class="learning-section-title">${escapeHtml(desktitle)}</h3>
      <div class="scenario-filter-row">${filterButtons}</div>
      <div class="research-case-grid">${caseCards || '<p class="learning-copy">No cases match filter.</p>'}</div>
    </section>
    <section class="vtt-drills-section">
      <h3 class="learning-section-title">${escapeHtml(drillstitle)}</h3>
      <div class="vtt-drill-list">${drillCards}</div>
    </section>
  `;
}
```

- [ ] **Step 2: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 17: Add event handlers for Research Bridge interactions

**Files:**
- Modify: `app.js` — event delegation block (~line 4060)

- [ ] **Step 1: Add three event handlers** inside the main click-delegation function, after the existing sprint handlers:

```js
// Add after the scenario-sector-filter handler:

  if (event.target.matches(".research-filter")) {
    state.learning.activeResearchFilter = event.target.dataset.researchFilter;
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }

  if (event.target.matches(".vtt-reveal-step")) {
    const drillId = event.target.dataset.vttDrill;
    const stepKey = event.target.dataset.revealVttStep;
    const stepEl = document.querySelector(`.vtt-step[data-vtt-step="${CSS.escape(stepKey)}"][data-vtt-drill="${CSS.escape(drillId)}"]`);
    if (stepEl) {
      stepEl.hidden = false;
      event.target.hidden = true;
    }
    return;
  }

  if (event.target.matches("[data-complete-vtt]")) {
    state.learning.completedViewToTradeDrills = toggleArrayValue(
      state.learning.completedViewToTradeDrills,
      event.target.dataset.completeVtt
    );
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }
```

- [ ] **Step 2: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

### Task 18: Call renderLearningResearchBridge from renderLearningHub

**Files:**
- Modify: `app.js` — `renderLearningHub()` function

- [ ] **Step 1: Find `renderLearningHub`** and add the new render call

```bash
grep -n "renderLearningHub\|renderLearning" app.js | grep "function\|renderLearning[A-Z]" | head -30
```

- [ ] **Step 2: Add the call** inside `renderLearningHub()` alongside the other render calls (after `renderLearningExoticsRisk()` or similar):

```js
  renderLearningResearchBridge();
```

- [ ] **Step 3: Update `renderLearningProgressSummary`** to include VTT drill count

```js
// Find:
  target.textContent = `${learningUiText("progressModules")} ${state.learning.completedModules.length}/${content.modules.length} · ${learningUiText("progressScenarios")} ${state.learning.completedScenarios.length}/${content.scenarios.length} · ${learningUiText("progressClientDrills")} ${state.learning.completedClientDrills.length}/${(content.clientDrills || []).length}${sprintProgress}`;
```

Replace with:
```js
  const vttTotal = (content.viewToTradeDrills || []).length;
  const vttProgress = vttTotal ? ` · ${learningLanguage() === "cn" ? "研究演练" : "Research Drills"} ${state.learning.completedViewToTradeDrills.length}/${vttTotal}` : "";
  target.textContent = `${learningUiText("progressModules")} ${state.learning.completedModules.length}/${content.modules.length} · ${learningUiText("progressScenarios")} ${state.learning.completedScenarios.length}/${content.scenarios.length} · ${learningUiText("progressClientDrills")} ${state.learning.completedClientDrills.length}/${(content.clientDrills || []).length}${sprintProgress}${vttProgress}`;
```

- [ ] **Step 4: Check syntax**

```bash
node --check app.js
```

Expected: no output.

---

## Phase 5: Tests for Research Bridge

### Task 19: Write and run Research Bridge tests

**Files:**
- Modify: `tests/learning-hub.spec.js`

- [ ] **Step 1: Add Research Bridge test block**

```js
test("Research Bridge tab renders cases, filters, and VTT drills", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  // Tab exists and opens
  await page.locator('[data-learning-tab="research-bridge"]').click();
  await expect(page.locator("#learningResearchBridge")).toBeVisible();

  // Research case cards render
  await expect(page.locator("#learningResearchBridge .research-case-card")).toHaveCount(16);

  // Filter to earnings only
  await page.locator('[data-research-filter="earnings"]').click();
  await expect(page.locator("#learningResearchBridge .research-case-card")).toHaveCount(4);

  // Filter to sector-analysis
  await page.locator('[data-research-filter="sector-analysis"]').click();
  await expect(page.locator("#learningResearchBridge .research-case-card")).toHaveCount(3);

  // All filter restores full count
  await page.locator('[data-research-filter="all"]').click();
  await expect(page.locator("#learningResearchBridge .research-case-card")).toHaveCount(16);

  // VTT drills render
  await expect(page.locator("#learningResearchBridge .vtt-drill-card")).toHaveCount(15);

  // Step reveal works
  const firstDrill = page.locator("#learningResearchBridge .vtt-drill-card").first();
  await firstDrill.locator('[data-reveal-vtt-step="view"]').click();
  await expect(firstDrill.locator('[data-vtt-step="view"]')).toBeVisible();

  // Mark complete persists
  await firstDrill.locator('[data-complete-vtt]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("Research Drills 1/15");
});

test("Sector D scenarios appear in scenario bank sector filter", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-scenarios-tab").click();
  await page.locator('[data-scenario-sector-filter="D"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(20);
  await expect(page.locator("#learningScenarios")).toContainText("NVDA");
});
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Final acceptance checks**

```bash
node --check app.js
node --check data/learning-content.js
node --check data/research-bridge-content.js
git diff --check
```

All expected to produce no output.

- [ ] **Step 4: Browser smoke check**

Open `index.html`. Verify:
1. Roadmap: 6 cards, shows "Sector A" through "Sector E" + "Sprint", Sector C says "Combines Vol Framework"
2. Scenario Bank: filter row shows A / B / C / D / E (no month numbers)
3. Research Bridge tab: opens, shows 16 case cards and 15 drills, filter works, step reveal works
4. Progress summary includes "Research Drills 0/15"
5. No "Month" label visible anywhere in Learning Hub

- [ ] **Step 5: Final commit**

```bash
git add data/research-bridge-content.js data/learning-content.js app.js index.html tests/learning-hub.spec.js
git commit -m "feat: add Sector D Research Bridge with financial skills content integration"
```
