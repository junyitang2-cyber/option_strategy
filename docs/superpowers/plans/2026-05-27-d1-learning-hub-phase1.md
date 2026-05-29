# D1 Learning Hub Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Phase 1 D1-to-Derivatives Learning Hub that turns the user's commodities D1 experience into option Greeks intuition, client/dealer framing, and professional scenario practice.

**Architecture:** Add one new learning data file, one compact Learning Hub panel, and focused rendering/state logic inside the existing static app. The hub reuses the current strategy lab and professional tools instead of replacing them.

**Tech Stack:** Vanilla JavaScript, static HTML/CSS, localStorage, Playwright.

---

## File Structure

**Create:**

- `data/learning-content.js` - D1 roadmap, Month 1 modules, bridge comparisons, and 30 scenario records.
- `tests/learning-hub.spec.js` - Playwright coverage for rendering, tabs, filters, answer reveal, strategy links, and progress persistence.

**Modify:**

- `index.html` - Load `data/learning-content.js` and add the Learning Hub panel.
- `styles.css` - Add Learning Hub layout, tabs, module cards, bridge rows, scenario cards, and progress styles.
- `app.js` - Add learning state, render functions, event handlers, and localStorage persistence.
- `README.md` - Mention the Learning Hub after implementation.
- `USER_GUIDE.md` - Add user-facing usage instructions after implementation.
- `docs/PROJECT_STATUS.md` - Mark implementation status after implementation.
- `docs/IMPLEMENTATION_HISTORY.md` - Record completed tasks after implementation.

**Do not modify in Phase 1:**

- `data/strategies.js`
- `data/professional-content.js`, unless a test proves an existing content conflict.

---

## Content Contract

### Data object

Create `data/learning-content.js` with this global:

```javascript
window.D1_LEARNING_CONTENT = {
  roadmap: [],
  modules: [],
  bridgeComparisons: [],
  scenarios: []
};
```

The final file must contain:

- 6 roadmap records.
- 4 Month 1 module records.
- 6 bridge comparison records.
- 30 scenario records.

### Roadmap records

Use these six records:

| Month | Status | Title | Focus |
| --- | --- | --- | --- |
| 1 | active | Greeks intuition from D1 exposure | Translate linear commodities exposure into delta, gamma, vega, theta, and carry intuition. |
| 2 | locked | Strategy construction | Spreads, straddles, strangles, butterflies, condors, collars, and client suitability. |
| 3 | locked | Volatility trading framework | RV vs IV, skew, term structure, event vol, and vol risk premium. |
| 4 | locked | Dynamic hedging and market making | Delta hedging, gamma scalping, inventory, bid-ask, and P&L attribution. |
| 5 | locked | Exotics and structuring | Asian, barrier, quanto, autocallable, and client-driven payoff design. |
| 6 | locked | Portfolio risk and professional sprint | Portfolio Greeks limits, stress testing, professional scenario drills, and trade idea articulation. |

### Month 1 module records

Use these four module ids:

| Id | Week | Title |
| --- | --- | --- |
| `delta-d1` | 1 | Delta: D1 directional exposure becomes dynamic |
| `gamma-convexity` | 2 | Gamma: the cost and value of convexity |
| `vega-vol` | 3 | Vega: implied volatility as its own risk factor |
| `theta-carry` | 4 | Theta/Rho: time value, funding, and carry |

Each module must include these fields:

```javascript
{
  id: "delta-d1",
  week: 1,
  title: "Delta: D1 directional exposure becomes dynamic",
  coreQuestion: "How does a linear D1 trader translate directional exposure into option delta?",
  d1Anchor: "A futures or forward hedge gives roughly constant directional exposure to the commodity price.",
  derivativesUpgrade: "Option delta is directional exposure that changes with spot, strike, DTE, IV, and moneyness.",
  dealerLens: "If a client buys calls, the dealer sells calls and is usually short delta and short gamma, then buys underlying or futures to reduce delta.",
  keyFraming: "Delta is familiar directionality, but options make the exposure state-dependent. I would discuss current delta, how gamma changes it, and how the hedge evolves.",
  strategyLinks: ["long-call", "short-put", "covered-call", "collar"],
  practiceIds: ["client-collar-downside", "risk-short-call-rally", "pnl-delta-vs-gamma", "mm-client-buys-calls"]
}
```

Use these remaining three module records:

```javascript
{
  id: "gamma-convexity",
  week: 2,
  title: "Gamma: the cost and value of convexity",
  coreQuestion: "What changes when exposure is no longer linear?",
  d1Anchor: "A linear D1 position does not automatically become longer as the market rallies or shorter as it sells off.",
  derivativesUpgrade: "Gamma measures how delta changes as spot moves. Long gamma adapts favorably but pays theta; short gamma collects theta but needs risk control.",
  dealerLens: "A short-gamma dealer must rebalance into moves. Hedging frequency depends on gamma size, liquidity, jump risk, and transaction cost.",
  keyFraming: "Gamma is the key difference from D1 linear risk: it creates convexity and rehedging risk, not just a bigger or smaller directional position.",
  strategyLinks: ["straddle", "short-straddle", "strangle", "iron-condor"],
  practiceIds: ["risk-short-straddle-gap", "risk-pin-near-strike", "pnl-long-gamma-lost", "mm-short-gamma-wide-market"]
},
{
  id: "vega-vol",
  week: 3,
  title: "Vega: implied volatility as its own risk factor",
  coreQuestion: "What does it mean to trade implied volatility rather than only price direction?",
  d1Anchor: "Linear outright futures exposure has no direct Vega, though client optionality can introduce volatility exposure.",
  derivativesUpgrade: "Vega is sensitivity to implied volatility. A position can be directionally hedged and still gain or lose from IV changes.",
  dealerLens: "Dealers manage net vega across strikes and expiries, not only one trade. They also charge for event risk, liquidity, and inventory.",
  keyFraming: "RV vs IV is a starting point, but a real vol trade must include jumps, costs, liquidity, and the vol risk premium.",
  strategyLinks: ["straddle", "short-strangle", "calendar-call-spread", "risk-reversal"],
  practiceIds: ["client-earnings-vol", "risk-iv-spike-short-premium", "pnl-vega-offsets-delta", "mm-otm-put-demand"]
},
{
  id: "theta-carry",
  week: 4,
  title: "Theta/Rho: time value, funding, and carry",
  coreQuestion: "How does time value connect to carry, funding, dividends, storage, and convenience yield?",
  d1Anchor: "Commodity forwards already require carry thinking: storage, financing, convenience yield, seasonality, and curve shape.",
  derivativesUpgrade: "Options add time decay, rates, dividends, borrow, early exercise, and moneyness-sensitive time value.",
  dealerLens: "Theta is not free income. The dealer earns theta for taking gamma, vega, gap, liquidity, and model risk.",
  keyFraming: "I would link theta to the cost of optionality and explain why collecting theta means warehousing tail and convexity risk.",
  strategyLinks: ["covered-call", "short-put", "calendar-call-spread", "iron-butterfly"],
  practiceIds: ["client-income-defined-risk", "risk-theta-vs-tail", "pnl-theta-positive-losing", "mm-carry-and-dividend"]
}
```

### Bridge comparison records

Use these six complete bridge records:

| Id | Topic | D1 world | Equity derivatives world | Transferable instinct | Refine or unlearn | Professional line |
| --- | --- | --- | --- | --- | --- | --- |
| `linear-vs-delta` | Linear exposure vs option delta | Futures hedges create direct price exposure. | Options have delta that changes with spot, time, IV, and moneyness. | Direction, size, and hedge ratio thinking transfer. | Do not treat delta as static; gamma changes the hedge. | My D1 background helps with directional risk, but options require dynamic delta management. |
| `curve-carry` | Forward curve and carry | Commodity forwards reflect storage, financing, convenience yield, and supply-demand constraints. | Equity option forwards reflect rates, dividends, borrow, and settlement mechanics. | Carry and curve-shape intuition transfer. | Equity dividends and borrow can dominate early exercise and parity relationships. | I translate commodity carry intuition into equity forwards through rates, dividends, and borrow. |
| `skew` | Skew and crash/supply risk | Many supply-shock-sensitive commodities can show call skew, but it is product- and regime-dependent. | Equity indices often show put skew from crash protection demand and leverage effects. | Risk premium lives where clients need protection. | Do not assume one skew direction across every market. | I first ask what risk the market is paying to hedge before choosing a skew trade. |
| `settlement` | Physical delivery vs cash or stock settlement | Physical delivery, logistics, squeezes, quality, and location can matter. | Index options are often cash-settled; single-name options can settle into stock with assignment risk. | Settlement details matter for hedging and suitability. | Equity assignment, dividends, and borrow create different operational risks. | I check settlement, exercise style, and corporate actions before calling a hedge clean. |
| `asian-options` | Asian options | Monthly average price options are common for physical commodity hedging. | Asian features are less common in vanilla equity flow but appear in structured products. | Path dependency and averaging intuition transfer. | The hedge is path-dependent; vanilla delta intuition is incomplete. | My Asian option experience is useful because it forces path-dependent hedging thinking. |
| `quanto-fx` | Quanto and FX-linked exposure | LME pricing and client currency exposure can introduce FX-linked hedge needs. | Quanto equity options pay in one currency on an asset denominated in another. | Cross-asset hedge decomposition transfers well. | Quanto pricing depends on asset-FX correlation, not just two separate hedges. | I identify asset risk, FX risk, and correlation risk separately. |

### Scenario records

Use exactly these 30 ids and categories:

| Id | Category | Level | Title |
| --- | --- | --- | --- |
| `client-collar-downside` | client | foundation | Bullish client wants downside protection |
| `client-income-defined-risk` | client | foundation | Client wants theta income with defined risk |
| `client-earnings-vol` | client | foundation | Client expects earnings move but direction is unclear |
| `client-hedge-physical-analogy` | client | foundation | Translate physical hedge experience |
| `client-protective-put-vs-stop` | client | foundation | Protective put vs stop loss |
| `client-risk-reversal-commodity` | client | intermediate | Risk reversal and skew intuition |
| `client-asian-edge` | client | intermediate | Asian option structuring edge |
| `client-zero-cost-hedge` | client | foundation | Zero-cost hedge trade-off |
| `risk-short-call-rally` | risk | foundation | Short call after spot rally |
| `risk-short-straddle-gap` | risk | foundation | Short straddle gap move |
| `risk-pin-near-strike` | risk | foundation | Pin risk near expiry |
| `risk-iv-spike-short-premium` | risk | foundation | Short premium during IV spike |
| `risk-theta-vs-tail` | risk | foundation | Positive theta with hidden tail risk |
| `risk-calendar-event` | risk | intermediate | Calendar spread around event |
| `risk-box-arb-costs` | risk | intermediate | Box spread is not free money |
| `risk-dividend-assignment` | risk | intermediate | Dividend and early assignment |
| `pnl-delta-vs-gamma` | pnl | foundation | Separate delta P&L from gamma P&L |
| `pnl-long-gamma-lost` | pnl | foundation | Long gamma but lost money |
| `pnl-vega-offsets-delta` | pnl | foundation | Correct direction, wrong P&L |
| `pnl-theta-positive-losing` | pnl | foundation | Positive theta losing day |
| `pnl-skew-shift` | pnl | intermediate | Skew shift P&L |
| `pnl-hedging-cost` | pnl | intermediate | Gamma scalping and costs |
| `pnl-forward-carry` | pnl | intermediate | Carry input changed option value |
| `mm-client-buys-calls` | market-making | foundation | Client buys calls from dealer |
| `mm-short-gamma-wide-market` | market-making | foundation | Short gamma and spread width |
| `mm-otm-put-demand` | market-making | foundation | Client demand for OTM puts |
| `mm-carry-and-dividend` | market-making | foundation | Dividend in option quote |
| `mm-inventory-adjust-quote` | market-making | intermediate | Inventory affects quote |
| `mm-when-refuse` | market-making | intermediate | When to refuse or reshape a trade |
| `mm-quanto-risk` | market-making | intermediate | Quanto risk decomposition |

Every scenario must include:

```javascript
{
  id: "client-collar-downside",
  category: "client",
  level: "foundation",
  title: "Bullish client wants downside protection",
  prompt: "Client is bullish on a stock but cannot tolerate more than 10% downside over three months. What structure do you discuss?",
  expectedAnswer: "Discuss a protective put or collar. If premium budget is limited, sell an OTM call to finance the put. Explain cap, floor, tenor, liquidity, and suitability.",
  followUp: "How would you choose strikes if the client wants close to zero upfront premium?",
  commonMistake: "Recommending a naked short put because the client is bullish, without matching the downside constraint.",
  tags: ["delta", "client", "collar"],
  linkedModuleIds: ["delta-d1"]
}
```

Use the detailed scenario content in Appendix A. Each scenario record must have the same fields as the example above.

---

### Task 1: Add Learning Content Data

**Files:**

- Create: `data/learning-content.js`

- [ ] **Step 1: Write `data/learning-content.js`**

Create the file with the content contract above.

- [ ] **Step 2: Verify JavaScript syntax**

Run:

```powershell
node --check data\learning-content.js
```

Expected: no output and exit code 0.

- [ ] **Step 3: Commit data file**

Run:

```powershell
git add data\learning-content.js
git commit -m "feat: add D1 learning hub content data"
```

---

### Task 2: Add Learning Hub HTML Shell

**Files:**

- Modify: `index.html`

- [ ] **Step 1: Load the data file before `app.js`**

Near the bottom of `index.html`, use:

```html
<script src="./data/strategies.js"></script>
<script src="./data/professional-content.js"></script>
<script src="./data/learning-content.js"></script>
<script src="./app.js"></script>
```

- [ ] **Step 2: Add the Learning Hub panel after `learningPathBar`**

Insert this immediately after `<div id="learningPathBar" class="learning-path-bar"></div>`:

```html
<section class="panel learning-hub-panel" id="learningHubPanel">
  <div class="panel-heading compact">
    <div>
      <p class="eyebrow">D1 to Derivatives</p>
      <h3>交易员学习中枢</h3>
    </div>
    <div id="learningProgressSummary" class="learning-progress-summary"></div>
  </div>

  <div class="learning-tabs" role="tablist" aria-label="D1 Learning Hub">
    <button class="learning-tab active" data-learning-tab="roadmap" type="button"
            role="tab" aria-selected="true" aria-controls="learning-roadmap-panel" id="learning-roadmap-tab">Roadmap</button>
    <button class="learning-tab" data-learning-tab="modules" type="button"
            role="tab" aria-selected="false" aria-controls="learning-modules-panel" id="learning-modules-tab">Month 1 Greeks</button>
    <button class="learning-tab" data-learning-tab="bridge" type="button"
            role="tab" aria-selected="false" aria-controls="learning-bridge-panel" id="learning-bridge-tab">Commodities Bridge</button>
    <button class="learning-tab" data-learning-tab="scenarios" type="button"
            role="tab" aria-selected="false" aria-controls="learning-scenarios-panel" id="learning-scenarios-tab">Scenario Bank</button>
  </div>

  <div class="learning-content">
    <div class="learning-panel active" data-learning-panel="roadmap"
         role="tabpanel" aria-labelledby="learning-roadmap-tab" id="learning-roadmap-panel">
      <div id="learningRoadmap"></div>
    </div>
    <div class="learning-panel" data-learning-panel="modules"
         role="tabpanel" aria-labelledby="learning-modules-tab" id="learning-modules-panel">
      <div id="learningModules"></div>
    </div>
    <div class="learning-panel" data-learning-panel="bridge"
         role="tabpanel" aria-labelledby="learning-bridge-tab" id="learning-bridge-panel">
      <div id="learningBridge"></div>
    </div>
    <div class="learning-panel" data-learning-panel="scenarios"
         role="tabpanel" aria-labelledby="learning-scenarios-tab" id="learning-scenarios-panel">
      <div class="scenario-filter-row" id="scenarioFilterRow"></div>
      <div id="learningScenarios"></div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Commit HTML shell**

Run:

```powershell
git add index.html
git commit -m "feat: add D1 learning hub shell"
```

---

### Task 3: Add Learning Hub CSS

**Files:**

- Modify: `styles.css`

- [ ] **Step 1: Append Learning Hub styles**

Add this to the end of `styles.css`:

```css
/* D1 Learning Hub */
.learning-hub-panel {
  margin-bottom: 20px;
}

.learning-progress-summary {
  color: var(--muted);
  font-size: 13px;
  text-align: right;
}

.learning-tabs,
.scenario-filter-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  border-bottom: 1px solid var(--line);
  margin-bottom: 16px;
  padding-bottom: 2px;
}

.learning-tab,
.scenario-filter {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 14px;
  padding: 9px 12px;
  white-space: nowrap;
}

.learning-tab:hover,
.scenario-filter:hover {
  background: var(--panel-2);
  color: var(--text);
}

.learning-tab.active,
.scenario-filter.active {
  border-bottom-color: var(--cyan);
  color: var(--cyan);
}

.learning-tab:focus-visible,
.scenario-filter:focus-visible,
.learning-action:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
}

.learning-panel {
  display: none;
}

.learning-panel.active {
  display: block;
}

.roadmap-grid,
.module-grid,
.bridge-grid,
.scenario-grid {
  display: grid;
  gap: 12px;
}

.roadmap-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.module-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.bridge-grid,
.scenario-grid {
  grid-template-columns: 1fr;
}

.roadmap-card,
.module-card,
.bridge-card,
.scenario-card {
  background: var(--panel-2);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 14px;
}

.roadmap-card.locked {
  opacity: 0.62;
}

.learning-kicker {
  color: var(--muted);
  font-size: 12px;
  margin: 0 0 4px;
  text-transform: uppercase;
}

.learning-title {
  color: var(--text);
  font-size: 15px;
  margin: 0 0 8px;
}

.learning-copy {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 8px;
}

.learning-label {
  color: var(--cyan);
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-top: 10px;
}

.learning-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.learning-action {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
  padding: 7px 10px;
}

.learning-action.active {
  border-color: var(--cyan);
  color: var(--cyan);
}

.strategy-link-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.strategy-link-chip {
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
}

.scenario-answer {
  border-top: 1px solid var(--line);
  margin-top: 10px;
  padding-top: 10px;
}

.scenario-answer[hidden] {
  display: none;
}

.scenario-meta {
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  gap: 8px;
  margin-bottom: 8px;
}
```

- [ ] **Step 2: Commit CSS**

Run:

```powershell
git add styles.css
git commit -m "style: add D1 learning hub styles"
```

---

### Task 4: Add Learning State And Rendering

**Files:**

- Modify: `app.js`

- [ ] **Step 1: Add learning state**

Add to the top-level `state` object:

```javascript
  learning: loadD1LearningProgress(),
```

- [ ] **Step 2: Add persistence helpers**

Add after existing `isCompleted(strategyId)`:

```javascript
function defaultD1LearningProgress() {
  return {
    completedModules: [],
    completedScenarios: [],
    reviewLaterScenarios: [],
    activeLearningTab: "roadmap",
    scenarioFilter: "all",
  };
}

function loadD1LearningProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem("os_d1_learning") || "null");
    return { ...defaultD1LearningProgress(), ...(saved || {}) };
  } catch {
    return defaultD1LearningProgress();
  }
}

function saveD1LearningProgress() {
  try {
    localStorage.setItem("os_d1_learning", JSON.stringify(state.learning));
  } catch {
    /* storage unavailable */
  }
}

function toggleArrayValue(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
```

- [ ] **Step 3: Add render functions**

Add before `renderStaticShell()`:

```javascript
function learningContent() {
  return window.D1_LEARNING_CONTENT || { roadmap: [], modules: [], bridgeComparisons: [], scenarios: [] };
}

function renderLearningProgressSummary() {
  const target = document.getElementById("learningProgressSummary");
  if (!target) return;
  const content = learningContent();
  target.textContent = `Modules ${state.learning.completedModules.length}/${content.modules.length} · Scenarios ${state.learning.completedScenarios.length}/${content.scenarios.length}`;
}

function renderLearningTabs() {
  const active = state.learning.activeLearningTab || "roadmap";
  document.querySelectorAll(".learning-tab").forEach((tab) => {
    const isActive = tab.dataset.learningTab === active;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".learning-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.learningPanel === active);
  });
}

function renderLearningRoadmap() {
  const target = document.getElementById("learningRoadmap");
  if (!target) return;
  target.innerHTML = `<div class="roadmap-grid">${learningContent().roadmap.map((item) => `
    <article class="roadmap-card ${item.status === "locked" ? "locked" : "active"}">
      <p class="learning-kicker">Month ${item.month} · ${item.status === "active" ? "Active" : "Locked"}</p>
      <h4 class="learning-title">${escapeHtml(item.title)}</h4>
      <p class="learning-copy">${escapeHtml(item.focus)}</p>
      <span class="learning-label">Deliverables</span>
      <ul>${item.deliverables.map((deliverable) => `<li>${escapeHtml(deliverable)}</li>`).join("")}</ul>
    </article>
  `).join("")}</div>`;
}
```

Add these functions after `renderLearningRoadmap()`:

```javascript
function renderLearningModules() {
  const target = document.getElementById("learningModules");
  if (!target) return;
  const strategiesById = new Map(STRATEGIES.map((strategy) => [strategy.id, strategy]));
  const cards = learningContent().modules.map((module) => {
    const done = state.learning.completedModules.includes(module.id);
    const links = module.strategyLinks.map((id) => {
      const strategy = strategiesById.get(id);
      if (!strategy) return "";
      return `<button class="strategy-link-chip" type="button" data-select-strategy="${escapeHtml(id)}">${escapeHtml(strategy.name)}</button>`;
    }).join("");
    return `
      <article class="module-card">
        <p class="learning-kicker">Week ${module.week}</p>
        <h4 class="learning-title">${escapeHtml(module.title)}</h4>
        <p class="learning-copy"><strong>Core question:</strong> ${escapeHtml(module.coreQuestion)}</p>
        <span class="learning-label">D1 anchor</span>
        <p class="learning-copy">${escapeHtml(module.d1Anchor)}</p>
        <span class="learning-label">Options upgrade</span>
        <p class="learning-copy">${escapeHtml(module.derivativesUpgrade)}</p>
        <span class="learning-label">Dealer lens</span>
        <p class="learning-copy">${escapeHtml(module.dealerLens)}</p>
        <span class="learning-label">Key framing</span>
        <p class="learning-copy">${escapeHtml(module.keyFraming)}</p>
        <div class="strategy-link-list">${links}</div>
        <div class="learning-action-row">
          <button class="learning-action ${done ? "active" : ""}" type="button" data-complete-module="${escapeHtml(module.id)}">
            ${done ? "已完成" : "标记完成"}
          </button>
        </div>
      </article>
    `;
  }).join("");
  target.innerHTML = `<div class="module-grid">${cards}</div>`;
}

function renderLearningBridge() {
  const target = document.getElementById("learningBridge");
  if (!target) return;
  const cards = learningContent().bridgeComparisons.map((item) => `
    <article class="bridge-card">
      <p class="learning-kicker">${escapeHtml(item.topic)}</p>
      <span class="learning-label">D1 world</span>
      <p class="learning-copy">${escapeHtml(item.d1World)}</p>
      <span class="learning-label">Equity derivatives world</span>
      <p class="learning-copy">${escapeHtml(item.equityDerivativesWorld)}</p>
      <span class="learning-label">Transferable instinct</span>
      <p class="learning-copy">${escapeHtml(item.transferableInstinct)}</p>
      <span class="learning-label">Refine or unlearn</span>
      <p class="learning-copy">${escapeHtml(item.unlearnOrRefine)}</p>
      <span class="learning-label">Professional line</span>
      <p class="learning-copy">${escapeHtml(item.professionalLine)}</p>
    </article>
  `).join("");
  target.innerHTML = `<div class="bridge-grid">${cards}</div>`;
}

function renderScenarioFilters() {
  const target = document.getElementById("scenarioFilterRow");
  if (!target) return;
  const filters = [
    ["all", "All"],
    ["client", "Client"],
    ["risk", "Risk"],
    ["pnl", "P&L"],
    ["market-making", "Market-making"],
  ];
  target.innerHTML = filters.map(([id, label]) => `
    <button class="scenario-filter ${state.learning.scenarioFilter === id ? "active" : ""}" type="button" data-scenario-filter="${id}">
      ${label}
    </button>
  `).join("");
}

function renderLearningScenarios() {
  const target = document.getElementById("learningScenarios");
  if (!target) return;
  const filter = state.learning.scenarioFilter || "all";
  const scenarios = learningContent().scenarios.filter((scenario) => filter === "all" || scenario.category === filter);
  const cards = scenarios.map((scenario) => {
    const completed = state.learning.completedScenarios.includes(scenario.id);
    const reviewLater = state.learning.reviewLaterScenarios.includes(scenario.id);
    return `
      <article class="scenario-card" data-scenario-card="${escapeHtml(scenario.id)}">
        <div class="scenario-meta">
          <span>${escapeHtml(scenario.category)}</span>
          <span>${escapeHtml(scenario.level)}</span>
          <span>${scenario.tags.map(escapeHtml).join(" · ")}</span>
        </div>
        <h4 class="learning-title">${escapeHtml(scenario.title)}</h4>
        <p class="learning-copy">${escapeHtml(scenario.prompt)}</p>
        <div class="learning-action-row">
          <button class="learning-action" type="button" data-reveal-scenario="${escapeHtml(scenario.id)}">Reveal answer</button>
          <button class="learning-action ${completed ? "active" : ""}" type="button" data-complete-scenario="${escapeHtml(scenario.id)}">${completed ? "已理解" : "标记理解"}</button>
          <button class="learning-action ${reviewLater ? "active" : ""}" type="button" data-review-scenario="${escapeHtml(scenario.id)}">${reviewLater ? "已加入复习" : "Review later"}</button>
        </div>
        <div class="scenario-answer" id="scenario-answer-${escapeHtml(scenario.id)}" hidden>
          <span class="learning-label">Expected answer</span>
          <p class="learning-copy">${escapeHtml(scenario.expectedAnswer)}</p>
          <span class="learning-label">Follow-up</span>
          <p class="learning-copy">${escapeHtml(scenario.followUp)}</p>
          <span class="learning-label">Common mistake</span>
          <p class="learning-copy">${escapeHtml(scenario.commonMistake)}</p>
        </div>
      </article>
    `;
  }).join("");
  target.innerHTML = `<div class="scenario-grid">${cards}</div>`;
}

function renderLearningHub() {
  renderLearningProgressSummary();
  renderLearningTabs();
  renderLearningRoadmap();
  renderLearningModules();
  renderLearningBridge();
  renderScenarioFilters();
  renderLearningScenarios();
}
```

- [ ] **Step 4: Wire static rendering**

Update `renderStaticShell()`:

```javascript
function renderStaticShell() {
  renderFilters();
  renderCoverage();
  renderLearningHub();
}
```

- [ ] **Step 5: Run syntax checks**

Run:

```powershell
node --check app.js
node --check data\learning-content.js
```

Expected: both commands exit 0 with no output.

- [ ] **Step 6: Commit rendering**

Run:

```powershell
git add app.js
git commit -m "feat: render D1 learning hub"
```

---

### Task 5: Add Learning Hub Event Handlers

**Files:**

- Modify: `app.js`

- [ ] **Step 1: Add click handling**

Add these checks near the top of `handleClick(event)`, before mode button checks:

```javascript
  if (event.target.matches(".learning-tab")) {
    state.learning.activeLearningTab = event.target.dataset.learningTab;
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }

  if (event.target.matches(".scenario-filter")) {
    state.learning.scenarioFilter = event.target.dataset.scenarioFilter;
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }

  if (event.target.matches("[data-complete-module]")) {
    state.learning.completedModules = toggleArrayValue(state.learning.completedModules, event.target.dataset.completeModule);
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }

  if (event.target.matches("[data-complete-scenario]")) {
    state.learning.completedScenarios = toggleArrayValue(state.learning.completedScenarios, event.target.dataset.completeScenario);
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }

  if (event.target.matches("[data-review-scenario]")) {
    state.learning.reviewLaterScenarios = toggleArrayValue(state.learning.reviewLaterScenarios, event.target.dataset.reviewScenario);
    saveD1LearningProgress();
    renderLearningHub();
    return;
  }

  if (event.target.matches("[data-reveal-scenario]")) {
    const answer = document.getElementById(`scenario-answer-${event.target.dataset.revealScenario}`);
    if (answer) answer.hidden = !answer.hidden;
    return;
  }

  if (event.target.matches("[data-select-strategy]")) {
    const strategy = STRATEGIES.find((item) => item.id === event.target.dataset.selectStrategy);
    if (strategy) selectStrategy(strategy);
    return;
  }
```

- [ ] **Step 2: Keep progress summary fresh**

In `rerenderDynamic(options = {})`, add:

```javascript
  renderLearningProgressSummary();
```

- [ ] **Step 3: Run syntax checks**

Run:

```powershell
node --check app.js
node --check data\learning-content.js
```

Expected: both commands exit 0 with no output.

- [ ] **Step 4: Commit interactions**

Run:

```powershell
git add app.js
git commit -m "feat: add D1 learning hub interactions"
```

---

### Task 6: Add Playwright Tests

**Files:**

- Create: `tests/learning-hub.spec.js`

- [ ] **Step 1: Create test suite**

Add:

```javascript
const { test, expect } = require("@playwright/test");

test("D1 learning hub renders and supports progress", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await expect(page.locator("#learningHubPanel")).toBeVisible();
  await expect(page.locator("#learningProgressSummary")).toContainText("Modules 0/4");
  await expect(page.locator("#learningProgressSummary")).toContainText("Scenarios 0/30");

  await expect(page.locator("#learningRoadmap .roadmap-card")).toHaveCount(6);

  await page.locator("#learning-modules-tab").click();
  await expect(page.locator("#learningModules .module-card")).toHaveCount(4);
  await expect(page.locator("#learningModules")).toContainText("Delta: D1 directional exposure becomes dynamic");
  await page.locator('[data-complete-module="delta-d1"]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("Modules 1/4");

  await page.locator("#learning-bridge-tab").click();
  await expect(page.locator("#learningBridge .bridge-card")).toHaveCount(6);
  await expect(page.locator("#learningBridge")).toContainText("regime-dependent");

  await page.locator("#learning-scenarios-tab").click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(30);
  await page.locator('[data-scenario-filter="client"]').click();
  await expect(page.locator("#learningScenarios .scenario-card")).toHaveCount(8);

  await page.locator('[data-reveal-scenario="client-collar-downside"]').click();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toBeVisible();
  await expect(page.locator("#scenario-answer-client-collar-downside")).toContainText("protective put or collar");

  await page.locator('[data-complete-scenario="client-collar-downside"]').click();
  await expect(page.locator("#learningProgressSummary")).toContainText("Scenarios 1/30");

  await page.reload();
  await expect(page.locator("#learningProgressSummary")).toContainText("Modules 1/4");
  await expect(page.locator("#learningProgressSummary")).toContainText("Scenarios 1/30");
  await expect(page.locator("#learning-scenarios-tab")).toHaveClass(/active/);
});

test("strategy chips in learning modules select existing strategies", async ({ page }) => {
  await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/index.html");

  await page.locator("#learning-modules-tab").click();
  await page.locator('[data-select-strategy="long-call"]').first().click();

  await expect(page.locator("#strategyTitle")).toContainText("Long Call");
  await expect(page.locator("#mainChart svg")).toBeVisible();
});
```

- [ ] **Step 2: Run new test**

Run:

```powershell
npx playwright test tests\learning-hub.spec.js
```

Expected:

```text
2 passed
```

- [ ] **Step 3: Run full suite**

Run:

```powershell
npm test
```

Expected:

```text
6 passed
```

- [ ] **Step 4: Commit tests**

Run:

```powershell
git add tests\learning-hub.spec.js
git commit -m "test: cover D1 learning hub"
```

---

### Task 7: Update User-Facing Documentation

**Files:**

- Modify: `README.md`
- Modify: `USER_GUIDE.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/IMPLEMENTATION_HISTORY.md`

- [ ] **Step 1: Update README capability list**

Add under "当前能力":

```markdown
- D1-to-Derivatives Learning Hub：六个月 roadmap、Month 1 Greeks、Commodities Bridge、30 个专业/实战场景和本地进度追踪。
```

- [ ] **Step 2: Update USER_GUIDE**

Add:

```markdown
## D1-to-Derivatives Learning Hub

页面顶部的“交易员学习中枢”用于把 commodities D1 经验转成 equity derivatives 专业表达。

- `Roadmap`：查看六个月学习路径。Phase 1 先开放 Month 1。
- `Month 1 Greeks`：按 Delta、Gamma、Vega、Theta/Rho 学习，每张卡片包含 D1 anchor、options upgrade、dealer lens 和 key framing。
- `Commodities Bridge`：对比 commodities D1 与 equity derivatives 的相同点和需要修正的直觉。
- `Scenario Bank`：按 Client、Risk、P&L、Market-making 练习场景题，可 reveal answer、标记理解、加入复习。

进度保存在本机浏览器 localStorage，不会上传到服务器。
```

- [ ] **Step 3: Update project status and history**

Once implementation passes, move the D1 Learning Hub section in `docs/PROJECT_STATUS.md` from "近期优先级" to "已完成范围", then add a completion section to `docs/IMPLEMENTATION_HISTORY.md` with changed files and verification commands.

- [ ] **Step 4: Commit docs**

Run:

```powershell
git add README.md USER_GUIDE.md docs\PROJECT_STATUS.md docs\IMPLEMENTATION_HISTORY.md
git commit -m "docs: document D1 learning hub phase 1"
```

---

### Task 8: Final Verification

**Files:**

- Verify all changed files.

- [ ] **Step 1: Run syntax checks**

Run:

```powershell
node --check app.js
node --check data\professional-content.js
node --check data\learning-content.js
```

Expected: all commands exit 0 with no output.

- [ ] **Step 2: Run full Playwright regression**

Run:

```powershell
npm test
```

Expected:

```text
6 passed
```

- [ ] **Step 3: Check whitespace**

Run:

```powershell
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 4: Browser smoke check**

Open `index.html` and verify:

- Learning Hub appears above the main chart.
- Four Learning Hub tabs switch.
- Month 1 has four module cards.
- Commodities Bridge has six cards.
- Scenario Bank has 30 cards.
- Client filter shows 8 cards.
- Revealing an answer displays expected answer, follow-up, and common mistake.
- Completion persists after refresh.
- Professional mode still shows professional tools.
- Professional mode still shows Q&A.

---

## Appendix A: Scenario Content

Use this content when creating the 30 `scenarios` records in `data/learning-content.js`.

### Client Scenarios

**`client-collar-downside`**

- Prompt: Client is bullish on a stock but cannot tolerate more than 10% downside over three months. What structure do you discuss?
- Expected answer: Discuss a protective put or collar. If premium budget is limited, sell an OTM call to finance the put. Explain cap, floor, tenor, liquidity, and suitability.
- Follow-up: How would you choose strikes if the client wants close to zero upfront premium?
- Common mistake: Recommending a naked short put because the client is bullish, without matching the downside constraint.
- Tags: `delta`, `client`, `collar`
- Linked modules: `delta-d1`

**`client-income-defined-risk`**

- Prompt: Client wants to earn option premium but does not want unlimited downside. What do you recommend?
- Expected answer: Use defined-risk structures such as credit spreads or iron condors, sized to risk budget. Explain max loss, margin, assignment, and stress scenarios.
- Follow-up: When would you prefer an iron condor over a short strangle?
- Common mistake: Selling naked options because theta is positive while ignoring tail risk and margin.
- Tags: `theta`, `client`, `defined-risk`
- Linked modules: `theta-carry`

**`client-earnings-vol`**

- Prompt: Client thinks a single name will move sharply after earnings but does not know direction. What do you discuss?
- Expected answer: Discuss long straddle or strangle, then compare premium, breakevens, IV level, expected move, and IV crush risk.
- Follow-up: What makes you choose straddle versus strangle?
- Common mistake: Ignoring that IV may already price the expected move.
- Tags: `vega`, `earnings`, `straddle`
- Linked modules: `vega-vol`

**`client-hedge-physical-analogy`**

- Prompt: How would you explain your commodity client hedging experience to a senior equity derivatives trader?
- Expected answer: Frame it as understanding client objective, exposure uncertainty, hedge tenor, liquidity, basis/carry, and risk disclosure. Then bridge to equity options suitability.
- Follow-up: What changes when the hedge uses options instead of futures?
- Common mistake: Only listing products traded instead of explaining risk-management process.
- Tags: `bridge`, `client`, `professional`
- Linked modules: `delta-d1`, `theta-carry`

**`client-protective-put-vs-stop`**

- Prompt: Client asks why they should buy a put instead of using a stop loss. How do you answer?
- Expected answer: A put gives contractual downside protection and keeps upside, while a stop can gap through and may force sale. The put costs premium and has expiry.
- Follow-up: When is the stop loss still reasonable?
- Common mistake: Calling the put strictly better without mentioning premium and tenor.
- Tags: `delta`, `client`, `risk-management`
- Linked modules: `delta-d1`

**`client-risk-reversal-commodity`**

- Prompt: Client wants upside participation with limited premium. How can skew affect a risk reversal recommendation?
- Expected answer: Risk reversal pricing depends on relative put and call IV. In equity, put skew may make sold puts rich; in some commodity regimes, calls can be rich. Suitability and downside obligation matter.
- Follow-up: What client objective would make a collar safer than a risk reversal?
- Common mistake: Assuming all markets have the same skew direction.
- Tags: `skew`, `client`, `risk-reversal`
- Linked modules: `vega-vol`

**`client-asian-edge`**

- Prompt: How would you use Asian option experience as a structuring advantage in equity derivatives?
- Expected answer: Explain path dependency, averaging, reduced timing risk, and hedging differences versus vanilla options. Connect it to structured products rather than pretending it is common vanilla equity flow.
- Follow-up: Why can averaging reduce option value compared with a vanilla option?
- Common mistake: Only saying Asian options are exotic without explaining the hedge implications.
- Tags: `asian`, `exotics`, `bridge`
- Linked modules: `theta-carry`

**`client-zero-cost-hedge`**

- Prompt: Client asks for a zero-cost hedge. What trade-off do you explain?
- Expected answer: Zero upfront premium usually means selling another payoff feature, such as upside cap or downside obligation. Discuss opportunity cost, tail risk, and whether the sold option fits the client's mandate.
- Follow-up: How would you stress this structure?
- Common mistake: Calling it free protection.
- Tags: `client`, `collar`, `suitability`
- Linked modules: `delta-d1`, `theta-carry`

### Risk Scenarios

**`risk-short-call-rally`**

- Prompt: You are short calls and spot rallies 5%. What risks changed?
- Expected answer: Delta became more negative for the dealer, gamma exposure is adverse, losses may accelerate, and IV may also move. Reassess hedge, liquidity, and whether to reduce exposure.
- Follow-up: How much underlying would you buy to rehedge?
- Common mistake: Only saying buy stock without checking new delta and gamma.
- Tags: `delta`, `gamma`, `hedging`
- Linked modules: `delta-d1`, `gamma-convexity`

**`risk-short-straddle-gap`**

- Prompt: You are short ATM straddles and the stock gaps 8% overnight. What do you do first?
- Expected answer: Quantify new delta, gamma, vega, and P&L. Hedge urgent delta if liquidity allows, evaluate closing or reducing gamma, and avoid assuming mean reversion.
- Follow-up: What if IV also spikes?
- Common mistake: Waiting because theta is positive.
- Tags: `gamma`, `vega`, `risk`
- Linked modules: `gamma-convexity`, `vega-vol`

**`risk-pin-near-strike`**

- Prompt: Spot is near your short option strike with two days to expiry. What risk matters?
- Expected answer: Pin risk and assignment uncertainty matter. Gamma is high, small spot moves change delta quickly, and closing or reducing exposure may be safer than waiting.
- Follow-up: How does poor liquidity change the decision?
- Common mistake: Only looking at current mark-to-market.
- Tags: `gamma`, `assignment`, `expiry`
- Linked modules: `gamma-convexity`

**`risk-iv-spike-short-premium`**

- Prompt: You are short premium and IV jumps 15 vol points while spot is unchanged. Why are you losing money?
- Expected answer: Negative vega. Option marks rise when IV rises, even if delta P&L is flat. Check vega, term concentration, event risk, and liquidity.
- Follow-up: How could you reduce vega without closing the whole trade?
- Common mistake: Assuming no spot move means no P&L.
- Tags: `vega`, `risk`, `short-premium`
- Linked modules: `vega-vol`

**`risk-theta-vs-tail`**

- Prompt: A position has positive theta every day. Why can it still be dangerous?
- Expected answer: Positive theta is compensation for risks such as short gamma, short vega, jump risk, assignment, and liquidity. The small daily income can be overwhelmed by stress moves.
- Follow-up: Which stress scenarios would you run?
- Common mistake: Treating theta income as yield without risk.
- Tags: `theta`, `tail-risk`, `stress`
- Linked modules: `theta-carry`

**`risk-calendar-event`**

- Prompt: You hold a calendar spread into an event. What can go wrong?
- Expected answer: Term structure may move differently than expected, front IV crush may not cover spot/gamma loss, and back-month IV can move too. Check net delta, gamma, vega by expiry.
- Follow-up: Why is calendar not a pure theta trade?
- Common mistake: Only focusing on front-month decay.
- Tags: `calendar`, `term-structure`, `vega`
- Linked modules: `vega-vol`, `theta-carry`

**`risk-box-arb-costs`**

- Prompt: A box spread appears to offer arbitrage. What do you check?
- Expected answer: Check bid-ask, execution certainty, assignment, financing, borrow, fees, capital usage, and whether quoted prices are executable.
- Follow-up: Why might retail screens show false arbitrage?
- Common mistake: Ignoring transaction costs and fill risk.
- Tags: `parity`, `execution`, `risk`
- Linked modules: `theta-carry`

**`risk-dividend-assignment`**

- Prompt: You are short ITM calls before ex-dividend date. What risk matters?
- Expected answer: Early assignment risk increases if exercising captures dividend better than holding option time value. Check extrinsic value, borrow, and operational settlement.
- Follow-up: How would you reduce the risk?
- Common mistake: Forgetting American-style equity option exercise.
- Tags: `rho`, `dividend`, `assignment`
- Linked modules: `theta-carry`

### P&L Scenarios

**`pnl-delta-vs-gamma`**

- Prompt: Spot moves up 3%. Your delta hedge was set yesterday. How do you attribute P&L?
- Expected answer: Start with delta times spot move, then add convexity/gamma effect, vega change, theta decay, and residual/model or execution effects.
- Follow-up: When does the gamma term become material?
- Common mistake: Using only starting delta for a large move.
- Tags: `delta`, `gamma`, `pnl`
- Linked modules: `delta-d1`, `gamma-convexity`

**`pnl-long-gamma-lost`**

- Prompt: You are long gamma and spot moved, but you still lost money. How is that possible?
- Expected answer: Theta decay, vega decline, poor rehedging, transaction costs, or movement below breakeven can outweigh gamma benefit.
- Follow-up: How would realized vol versus implied vol explain it?
- Common mistake: Assuming long gamma always profits from any move.
- Tags: `gamma`, `theta`, `vega`, `pnl`
- Linked modules: `gamma-convexity`, `vega-vol`

**`pnl-vega-offsets-delta`**

- Prompt: You are bullish and spot rises, but your option position loses money. What could explain it?
- Expected answer: IV may have fallen, theta may have decayed, delta may have been too low, or the trade paid too much premium. Attribute delta, gamma, vega, and theta separately.
- Follow-up: How does this differ from a futures D1 position?
- Common mistake: Assuming direction alone determines option P&L.
- Tags: `vega`, `theta`, `delta`, `pnl`
- Linked modules: `delta-d1`, `vega-vol`

**`pnl-theta-positive-losing`**

- Prompt: A portfolio has positive theta but loses money today. What do you check?
- Expected answer: Check delta move, gamma loss, vega move, skew change, rates/dividend effects, and execution. Theta is only one component.
- Follow-up: How would you explain this to a junior trader?
- Common mistake: Thinking positive theta guarantees daily profit.
- Tags: `theta`, `pnl`, `risk`
- Linked modules: `theta-carry`

**`pnl-skew-shift`**

- Prompt: Spot is unchanged, ATM IV unchanged, but your risk reversal loses money. Why?
- Expected answer: Skew can move independently. OTM put and call IV changes can affect the two legs differently, creating vega/skew P&L.
- Follow-up: How would you hedge skew exposure?
- Common mistake: Watching only ATM IV.
- Tags: `skew`, `risk-reversal`, `pnl`
- Linked modules: `vega-vol`

**`pnl-hedging-cost`**

- Prompt: A long-gamma strategy generated positive hedge P&L, but total P&L is flat. Why?
- Expected answer: Hedge gains may be offset by theta, bid-ask, commissions, slippage, and vega changes. Realized movement must beat implied plus costs.
- Follow-up: How does hedge frequency change the outcome?
- Common mistake: Ignoring execution costs.
- Tags: `gamma`, `execution`, `pnl`
- Linked modules: `gamma-convexity`

**`pnl-forward-carry`**

- Prompt: Spot and IV are unchanged, but a dividend or carry assumption changes. Why can option value move?
- Expected answer: Forward input changed. Rates, dividends, borrow, storage-like carry analogies, and convenience yield equivalents affect forward price and option value.
- Follow-up: How would you connect this to commodity curve experience?
- Common mistake: Treating spot as the only pricing input.
- Tags: `carry`, `rho`, `pnl`
- Linked modules: `theta-carry`

### Market-Making Scenarios

**`mm-client-buys-calls`**

- Prompt: Client buys calls from you. What exposure do you have as dealer?
- Expected answer: Dealer is short calls: typically short delta, short gamma, short vega, and long theta. Hedge delta first, then manage gamma/vega and inventory.
- Follow-up: What changes if calls are far OTM and illiquid?
- Common mistake: Mixing up client and dealer perspective.
- Tags: `dealer`, `delta`, `gamma`
- Linked modules: `delta-d1`, `gamma-convexity`

**`mm-short-gamma-wide-market`**

- Prompt: Why might a market maker quote wider near expiry ATM options?
- Expected answer: Gamma is high, delta changes quickly, rehedging risk and execution cost rise, and inventory can become unstable. Wider markets compensate for that risk.
- Follow-up: What market conditions make this worse?
- Common mistake: Saying only that liquidity is lower.
- Tags: `dealer`, `gamma`, `bid-ask`
- Linked modules: `gamma-convexity`

**`mm-otm-put-demand`**

- Prompt: Many clients want to buy OTM index puts. How does that affect skew and your book?
- Expected answer: Demand can richen put skew. Dealer selling puts becomes short downside convexity and vega, requiring hedging, inventory limits, and wider pricing.
- Follow-up: How is this different from some commodity upside call demand?
- Common mistake: Ignoring skew and inventory effects.
- Tags: `skew`, `dealer`, `vega`
- Linked modules: `vega-vol`

**`mm-carry-and-dividend`**

- Prompt: How does a dealer think about dividends when quoting equity options?
- Expected answer: Dividends affect forward price, call/put parity, early exercise risk, and borrow economics. The quote must reflect expected dividends and uncertainty.
- Follow-up: How would you compare this to commodity carry?
- Common mistake: Ignoring dividends in single-name equity options.
- Tags: `dealer`, `dividend`, `carry`
- Linked modules: `theta-carry`

**`mm-inventory-adjust-quote`**

- Prompt: You are already long a lot of calls and a client asks to buy more. How might your quote change?
- Expected answer: You may widen offer, skew price to discourage more of the same inventory, or hedge first. The quote reflects market mid, liquidity, inventory, and risk limits.
- Follow-up: What if the client is important and price-sensitive?
- Common mistake: Quoting only theoretical mid.
- Tags: `dealer`, `inventory`, `quote`
- Linked modules: `vega-vol`, `gamma-convexity`

**`mm-when-refuse`**

- Prompt: When might a dealer refuse or reshape a client option order?
- Expected answer: If risk is too concentrated, liquidity is poor, size exceeds limits, model uncertainty is high, or suitability is questionable. Offer an alternative structure or smaller size.
- Follow-up: How do you explain this without losing the client?
- Common mistake: Assuming every client flow should be accepted if priced wide enough.
- Tags: `dealer`, `risk-limits`, `client`
- Linked modules: `gamma-convexity`, `theta-carry`

**`mm-quanto-risk`**

- Prompt: A client asks for USD payout on a foreign equity index option. What extra risk appears?
- Expected answer: Quanto structure introduces asset-FX correlation risk, plus normal delta, gamma, vega, rates, and liquidity risks. Hedge asset and FX components while monitoring correlation.
- Follow-up: How does your LME/FX-linked experience help here?
- Common mistake: Treating it as only an equity option plus an FX forward.
- Tags: `quanto`, `dealer`, `correlation`
- Linked modules: `vega-vol`, `theta-carry`

---

## Self-Review Checklist

**Spec coverage:**

- Phase 1 Learning Hub panel: Tasks 2-5.
- Month 1 Greeks modules: Tasks 1 and 4.
- Commodities Bridge: Tasks 1 and 4.
- 30 scenarios: Tasks 1 and 6.
- Progress persistence: Tasks 4 and 5.
- Tests: Tasks 6 and 8.
- Documentation: Task 7.

**No placeholder scan:**

- Data counts and required ids are explicit.
- Selectors and localStorage keys are explicit.
- Test commands and expected outputs are explicit.

**Type and selector consistency:**

- `activeLearningTab` values match `data-learning-tab` and `data-learning-panel`.
- Scenario categories match filter ids.
- LocalStorage key is `os_d1_learning`.
- Tests expect 4 modules, 6 bridge records, and 30 scenarios.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-27-d1-learning-hub-phase1.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.
