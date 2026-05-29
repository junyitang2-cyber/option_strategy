# D1 Phase 7A Content Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add professional Trader Memo, professional Q&A, and common wrong-expression guidance for the first high-value wave of uncovered option strategies.

**Architecture:** Keep the implementation static and local. Extend `PROFESSIONAL_CONTENT` in `data/professional-content.js`, add a small optional common-mistakes renderer in the professional panel, and cover the new behavior with data-integrity and browser tests.

**Tech Stack:** Plain JavaScript, static HTML/CSS, Playwright test runner, Node syntax checks.

---

## File Structure

- Modify `data/professional-content.js`: add Phase 7A professional content records for 13 target strategy IDs and keep the existing `module.exports`.
- Modify `index.html`: add one optional memo section container for common wrong-expression guidance.
- Modify `app.js`: render `professionalData.commonMistakes` when present; hide the section when absent; make professional coverage count dynamic in fallback copy.
- Add `tests/professional-content.spec.js`: verify data coverage and content shape for Phase 7A.
- Modify `tests/professional.spec.js`: verify a newly covered strategy renders Trader Memo, Q&A, common mistakes, and that an uncovered strategy still uses fallback copy.
- Modify `README.md`, `docs/PROJECT_STATUS.md`, and `docs/IMPLEMENTATION_HISTORY.md`: document Phase 7A content coverage after implementation.

## Target Strategies

The first Phase 7A wave covers these 13 IDs:

```js
const PHASE7A_TARGET_IDS = [
  "bull-put-spread",
  "long-put-butterfly",
  "put-broken-wing",
  "inverse-call-broken-wing",
  "call-broken-wing",
  "inverse-put-broken-wing",
  "covered-short-straddle",
  "covered-short-strangle",
  "short-call-condor",
  "short-put-condor",
  "reverse-jade-lizard",
  "call-ratio-spread",
  "put-ratio-spread",
];
```

---

### Task 1: Write Data Coverage Test

**Files:**
- Add: `tests/professional-content.spec.js`

- [ ] **Step 1: Create the failing data integrity test**

Add this file:

```js
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PHASE7A_TARGET_IDS = [
  "bull-put-spread",
  "long-put-butterfly",
  "put-broken-wing",
  "inverse-call-broken-wing",
  "call-broken-wing",
  "inverse-put-broken-wing",
  "covered-short-straddle",
  "covered-short-strangle",
  "short-call-condor",
  "short-put-condor",
  "reverse-jade-lizard",
  "call-ratio-spread",
  "put-ratio-spread",
];

function loadStrategies() {
  const strategyPath = path.resolve(__dirname, "../data/strategies.js");
  const code = fs.readFileSync(strategyPath, "utf8") + "\n;globalThis.__STRATEGIES = STRATEGIES;";
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.__STRATEGIES;
}

test("phase 7A target strategies have professional content coverage", () => {
  const strategies = loadStrategies();
  const { PROFESSIONAL_CONTENT } = require("../data/professional-content.js");
  const strategyIds = new Set(strategies.map((strategy) => strategy.id));

  for (const id of PHASE7A_TARGET_IDS) {
    expect(strategyIds.has(id), `${id} should exist in strategies.js`).toBe(true);
    const content = PROFESSIONAL_CONTENT[id];
    expect(content, `${id} should have professional content`).toBeTruthy();
    expect(content.exposure).toEqual(expect.objectContaining({
      directional: expect.any(String),
      volatility: expect.any(String),
      time: expect.any(String),
      convexity: expect.any(String),
    }));
    expect(content.profitLogic).toEqual(expect.objectContaining({
      makesMoneyFrom: expect.any(String),
      losesMoneyFrom: expect.any(String),
      bestMarketCondition: expect.any(String),
      worstScenario: expect.any(String),
    }));
    expect(content.clientPerspective.whyClientDoes.length).toBeGreaterThanOrEqual(3);
    expect(content.dealerPerspective.hedging.length).toBeGreaterThanOrEqual(3);
    expect(content.interviewQuestions.length).toBeGreaterThanOrEqual(3);
    expect(content.commonMistakes.length).toBeGreaterThanOrEqual(3);
  }
});

test("phase 7A increases professional strategy coverage while leaving later gaps", () => {
  const strategies = loadStrategies();
  const { PROFESSIONAL_CONTENT } = require("../data/professional-content.js");
  const professionalIds = Object.keys(PROFESSIONAL_CONTENT).filter((id) => id !== "professionalConcepts");
  const coveredIds = new Set(professionalIds);
  const missing = strategies.filter((strategy) => !coveredIds.has(strategy.id));

  expect(professionalIds.length).toBe(53);
  expect(missing.map((strategy) => strategy.id)).toContain("short-synthetic-future");
  expect(missing.map((strategy) => strategy.id)).not.toContain("bull-put-spread");
});
```

- [ ] **Step 2: Run the data test and verify RED**

Run:

```powershell
npx playwright test tests/professional-content.spec.js
```

Expected: fails because the Phase 7A target strategies do not yet have professional content and coverage is still 40, not 53.

---

### Task 2: Write Browser Coverage Test

**Files:**
- Modify: `tests/professional.spec.js`

- [ ] **Step 1: Add a new browser test**

Append this test after the existing test in `tests/professional.spec.js`:

```js
test("phase 7A professional content renders for new target strategies and keeps fallback", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`file://${path.resolve(__dirname, "../index.html")}`);
  await page.locator("#modeInterview").click();

  await page.locator("#searchInput").fill("Bull Put Spread");
  await page.locator('#strategyList [data-strategy="bull-put-spread"]').click();
  await expect(page.locator("#strategyTitle")).toHaveText("Bull Put Spread");
  await expect(page.locator("#professionalPanel")).toContainText("short put");
  await expect(page.locator("#commonMistakesContent")).toContainText("错误表达");
  await expect(page.locator(".interview-qa")).toHaveCount(3);
  await expect(page.locator("#interviewQuestions")).toContainText("Bull Put Spread");

  await page.locator("#searchInput").fill("Short Synthetic Future");
  await page.locator('#strategyList [data-strategy="short-synthetic-future"]').click();
  await expect(page.locator("#strategyTitle")).toHaveText("Short Synthetic Future");
  await expect(page.locator("#commonMistakesSection")).toBeHidden();
  await expect(page.locator("#interviewQuestions")).toContainText("暂无专业问答内容");

  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Run the browser test and verify RED**

Run:

```powershell
npx playwright test tests/professional.spec.js --grep "phase 7A"
```

Expected: fails because `#commonMistakesSection` does not exist and `bull-put-spread` has no professional content yet.

---

### Task 3: Add Optional Common-Mistakes UI

**Files:**
- Modify: `index.html`
- Modify: `app.js`

- [ ] **Step 1: Add the optional memo section in HTML**

In `index.html`, inside `<div class="trader-memo-grid">` after the dealer memo section, add:

```html
<div class="memo-section" id="commonMistakesSection" style="display:none">
  <h4>常见错误表达</h4>
  <div id="commonMistakesContent"></div>
</div>
```

- [ ] **Step 2: Render common mistakes and dynamic fallback copy**

In `app.js`, add this helper above `renderProfessionalContent()`:

```js
function professionalStrategyCoverageCount() {
  return Object.keys(PROFESSIONAL_CONTENT || {}).filter((id) => id !== "professionalConcepts").length;
}

function renderCommonMistakes(professionalData) {
  const section = document.getElementById("commonMistakesSection");
  const content = document.getElementById("commonMistakesContent");
  if (!section || !content) return;

  const mistakes = Array.isArray(professionalData?.commonMistakes) ? professionalData.commonMistakes : [];
  section.style.display = mistakes.length ? "" : "none";
  content.innerHTML = mistakes.length
    ? `<ul>${mistakes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
}
```

Then update the missing-content branch in `renderProfessionalContent()` to call:

```js
renderCommonMistakes(null);
```

Then add this call after dealer perspective rendering:

```js
renderCommonMistakes(professionalData);
```

Finally update the fallback in `renderInterviewQuestions()` to use the dynamic count:

```js
interviewQuestions.innerHTML = `<p class="muted" style="text-align: center; padding: 2rem;">该策略暂无专业问答内容。当前已覆盖 ${professionalStrategyCoverageCount()} 个策略的专业内容。</p>`;
```

- [ ] **Step 3: Run the phase 7A browser test**

Run:

```powershell
npx playwright test tests/professional.spec.js --grep "phase 7A"
```

Expected: still fails because content is not added yet, but it should no longer fail because `#commonMistakesSection` is missing.

---

### Task 4: Add Phase 7A Professional Content Records

**Files:**
- Modify: `data/professional-content.js`

- [ ] **Step 1: Add content before `professionalConcepts`**

Add entries for every target ID in `PROFESSIONAL_CONTENT`. Each entry must include `exposure`, `profitLogic`, `clientPerspective`, `dealerPerspective`, `commonMistakes`, and `interviewQuestions`.

For consistency, use these content rules:

```js
// Required field shape for every Phase 7A strategy.
{
  exposure: {
    directional: "...",
    volatility: "...",
    time: "...",
    convexity: "..."
  },
  profitLogic: {
    makesMoneyFrom: "...",
    losesMoneyFrom: "...",
    bestMarketCondition: "...",
    worstScenario: "..."
  },
  clientPerspective: {
    whyClientDoes: ["...", "...", "..."],
    clientType: "...",
    suitability: "..."
  },
  dealerPerspective: {
    whenDealerSells: "...",
    exposure: "...",
    hedging: ["...", "...", "..."],
    profitSource: "..."
  },
  commonMistakes: ["错误表达: ...", "错误表达: ...", "错误表达: ..."],
  interviewQuestions: [
    { q: "...", a: "..." },
    { q: "...", a: "..." },
    { q: "...", a: "..." }
  ]
}
```

Use these strategy-specific anchors:

- `bull-put-spread`: defined-risk short put spread; short put plus long lower put; positive theta, short vega, short downside gamma.
- `long-put-butterfly`: debit butterfly with put legs; earns from pin/range around body strike; limited risk but narrow profit zone.
- `put-broken-wing`: put butterfly with asymmetric lower wing; usually downside credit/range structure; tail and assignment need clear explanation.
- `inverse-call-broken-wing`: inverted call broken wing; risk comes from being wrong about direction and wing asymmetry.
- `call-broken-wing`: call-side broken wing; upside target/range with asymmetric wing and skew-sensitive pricing.
- `inverse-put-broken-wing`: inverted put broken wing; downside target/range with asymmetry and short-option risk.
- `covered-short-straddle`: stock plus short call/short put; not truly hedged, because stock only covers call assignment and leaves downside exposure.
- `covered-short-strangle`: stock plus OTM short call/short put; wider range than covered short straddle but still concentrated short-vol risk.
- `short-call-condor`: credit/range structure built with calls; short vol/range view; defined risk but expiration pin and liquidity matter.
- `short-put-condor`: credit/range structure built with puts; short vol/range view; early assignment and put skew matter.
- `reverse-jade-lizard`: inverse jade-lizard profile; explain as directional/vol structure, not free premium.
- `call-ratio-spread`: long call plus more short calls; cheap upside until short-call tail dominates.
- `put-ratio-spread`: long put plus more short puts; cheap downside until short-put tail dominates.

- [ ] **Step 2: Run the data test and verify GREEN**

Run:

```powershell
npx playwright test tests/professional-content.spec.js
```

Expected: 2 tests pass.

- [ ] **Step 3: Run the phase 7A browser test and verify GREEN**

Run:

```powershell
npx playwright test tests/professional.spec.js --grep "phase 7A"
```

Expected: 1 test passes.

---

### Task 5: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/IMPLEMENTATION_HISTORY.md`

- [ ] **Step 1: Update README current capability counts**

Update README so current professional coverage says:

```markdown
- 53 个策略的专业 Trader Memo。
```

Also update the verification summary to mention Phase 7A content coverage and the new `tests/professional-content.spec.js`.

- [ ] **Step 2: Update Project Status**

Add a new top section:

```markdown
## 2026-05-29 Update: D1 Learning Hub Phase 7A Content Coverage

Phase 7A is now implemented.

- Professional Trader Memo coverage increased from 40 to 53 strategies.
- Added professional coverage for 13 high-value structures including bull put spreads, broken-wing butterflies, covered short-vol structures, short condors, reverse jade lizard, and ratio spreads.
- Added common wrong-expression guidance to newly covered strategies.
- Playwright coverage now verifies Phase 7A data shape and browser rendering.
```

- [ ] **Step 3: Update Implementation History**

Add a new top entry:

```markdown
## D1-to-Derivatives Phase 7A Content Coverage (2026-05-29)

Scope:

- Added Trader Memo, professional Q&A, and common wrong-expression guidance for 13 high-value previously uncovered strategies.
- Added optional common-mistakes rendering to the Professional panel.
- Added data-integrity and browser regression coverage for Phase 7A.

Verification focus:

- `tests/professional-content.spec.js` verifies target IDs, content shape, coverage count, and remaining fallback gaps.
- `tests/professional.spec.js` verifies a newly covered strategy renders and an uncovered strategy still uses fallback copy.
```

---

### Task 6: Full Verification and Commit

**Files:**
- All modified files

- [ ] **Step 1: Run syntax checks**

Run:

```powershell
node --check app.js
node --check data\professional-content.js
node --check data\learning-content.js
node --check data\phase6-content.js
```

Expected: all exit 0.

- [ ] **Step 2: Run formatting/patch check**

Run:

```powershell
git diff --check
```

Expected: exit 0. CRLF warnings are acceptable; whitespace errors are not.

- [ ] **Step 3: Run full regression**

Run:

```powershell
npm test
```

Expected: all Playwright tests pass.

- [ ] **Step 4: Commit**

Run:

```powershell
git add README.md docs/PROJECT_STATUS.md docs/IMPLEMENTATION_HISTORY.md index.html app.js data/professional-content.js tests/professional-content.spec.js tests/professional.spec.js
git commit -m "feat: add D1 phase 7A professional coverage"
```

Expected: one commit containing Phase 7A implementation.

