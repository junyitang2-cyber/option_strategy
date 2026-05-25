# Teaching Mode Upgrade — Phase 1 Implementation Plan

> **Status: COMPLETE (2026-05-25)** — All 8 tasks implemented.
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Greeks concept cards, chart interactions (tooltip/shading/breakeven labels/time animation), strategy list difficulty badges, and critical bug fixes to the option_strategy teaching mode.

**Architecture:** Final structure — data/strategies.js (1195 lines, pure data) + app.js (1171 lines, logic) + styles.css (259 lines) + index.html (167 lines). Zero dependencies, no build tooling.

**Tech Stack:** Vanilla HTML/CSS/JS, zero dependencies.

**Completed Deliverables:**
- [x] Task 0: Bug fixes (qty=0, NaN guard, riskMetrics threshold)
- [x] Task 1: Greeks concept cards — data + rendering
- [x] Task 2: Greeks concept cards — show/hide interaction
- [x] Task 3: Chart hover tooltip
- [x] Task 4: Profit/loss area shading + breakeven labels
- [x] Task 5: Time decay play button
- [x] Task 6: Strategy list difficulty badges + filter
- [x] Task 7: URL state persistence
- [x] Module split: data/strategies.js extracted from app.js

---

### Task 0: Bug Fixes (Foundation)

**Files:**
- Modify: `/home/option_strategy/app.js:979,1243-1247,1293,1363-1370`

These fixes must land first to avoid building features on broken behavior.

- [ ] **Step 1: Fix Delta Neutral slug (line 979)**

Change the strategy name to use `/` separator instead of Chinese parentheses, which the `slug()` function strips incorrectly:

```javascript
// Line 979 in the STRATEGIES array — change:
name: "Delta Neutral（Delta 中性）",
// To:
name: "Delta Neutral / Delta 中性",
```

This makes the slug become `"delta-neutral-/-delta-中性"` which is clean and won't break when `slug()` strips parens.

- [ ] **Step 2: Fix `replaceAll` to regex for browser compat (lines 1243-1247)**

Replace `escapeHtml()` body:

```javascript
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

- [ ] **Step 3: Fix `0 || default` falsy-zero bugs (lines 1363, 1365, 1370)**

In `positionValue()`:

```javascript
// Line 1363: change Number(leg.entry || state.entrySpot) to:
const price = useEntry ? (Number(leg.entry) ?? state.entrySpot) : spot;

// Line 1365: change Number(leg.qty || 1) to:
value: sign * (Number(leg.qty) ?? 1) * price * multiplier,
greeks: { delta: sign * (Number(leg.qty) ?? 1) * multiplier, gamma: 0, theta: 0, vega: 0, rho: 0 },

// Line 1370: change Number(leg.dte || 45) to:
const remaining = useEntry ? (Number(leg.dte) ?? 45) : Math.max((Number(leg.dte) ?? 45) - daysElapsed, 0);

// Line 1371: change Number(leg.iv || 0.32) to:
const iv = Math.max(0.01, (Number(leg.iv) ?? 0.32) + (useEntry ? 0 : scenario.ivShift));

// Line 1373: change Number(leg.qty || 1) to:
const scale = sign * (Number(leg.qty) ?? 1) * multiplier;
```

Same fix in `normalizeLegs()` (lines 1348-1353):

```javascript
// Change all || to ?? :
qty: Number(leg.qty) ?? 1,
strike: Number(leg.strike) ?? entrySpot,
dte: Number(leg.dte) ?? 45,
iv: Number(leg.iv) ?? 0.32,
```

- [ ] **Step 4: Fix NaN propagation in `optionModel()` (after line 1292)**

Add a guard right after computing `t`:

```javascript
function optionModel(type, spot, strike, dte, rate, dividend, iv) {
  const t = Math.max(dte, 0) / 365;
  if (t <= 1e-6 || isNaN(t) || isNaN(spot) || isNaN(strike) || isNaN(iv)) {
    // Return zero-result for invalid inputs instead of propagating NaN
    const isCall = type === "call";
    return { price: 0, delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }
  // ... rest of function unchanged
```

- [ ] **Step 5: Verify bug fixes**

Open `index.html` in a browser and confirm:
- Delta Neutral strategy appears in the strategy list (search "Delta Neutral")
- No console errors
- Long Call shows correct default values
- Set quantity to 0 in legs editor → shows 0 (not 1)

---

### Task 1: Greeks Concept Cards — Data + Rendering

**Files:**
- Modify: `/home/option_strategy/app.js:1208-1215` (greekPanels)
- Modify: `/home/option_strategy/app.js:1601-1608` (renderGreeks)
- Modify: `/home/option_strategy/index.html` (add concept card container)

- [ ] **Step 1: Add concept card container to HTML**

After line 79 (`<div id="greekGrid" class="greek-grid"></div>`) add:

```html
<div id="conceptCard" class="concept-card" hidden>
  <button id="closeConceptCard" class="concept-close" type="button" aria-label="关闭">&times;</button>
  <div id="conceptContent"></div>
</div>
```

- [ ] **Step 2: Extend `greekPanels` with concept data**

Replace the greekPanels array (lines 1208-1215) with:

```javascript
const greekPanels = [
  {
    key: "risk", label: "Risk / PnL", className: "curve-risk",
    note: "不同标的价格下的理论盈亏，包含当前 DTE 与 IV 情景。",
    concept: null, // Risk/PnL does not get a concept card
  },
  {
    key: "delta", label: "Delta", className: "curve-delta",
    note: "方向暴露；正值偏受益上涨，负值偏受益下跌。",
    concept: {
      what: "Delta 衡量期权价格对标的股价变化的敏感度。Call 的 Delta 在 0 到 1 之间，Put 的 Delta 在 -1 到 0 之间。ATM（平值）期权的 Delta 约为 ±0.5，深度 ITM（实值）接近 ±1，深度 OTM（虚值）接近 0。",
      benchmark: [
        "|Delta| > 0.5：强方向性策略，赌的是价格朝一个方向大幅移动",
        "|Delta| < 0.1：市场中性的收租/波动率策略，不依赖方向判断",
        "负 Delta：偏空头敞口，适合看跌；正 Delta：偏多头敞口",
      ],
      interpret(s) { return interpretDelta(s); },
    },
  },
  {
    key: "gamma", label: "Gamma", className: "curve-gamma",
    note: "Delta 对价格变化的敏感度；临近执行价和到期时会更尖锐。",
    concept: {
      what: "Gamma 衡量 Delta 随标的价格变化的速度。可以把 Gamma 理解为\"加速度\"——Delta 告诉你在某一点价格会怎么变，Gamma 告诉你当价格移动时 Delta 本身会怎么变。正 Gamma 意味着价格上涨时 Delta 变得更大（赚钱加速），价格下跌时 Delta 变得更小（亏钱减速）——这是期权买方的\"凸性\"优势。",
      benchmark: [
        "正 Gamma：期权买方特征，受益于价格大幅波动，类似\"免费加速\"",
        "负 Gamma：期权卖方特征，怕跳空和剧烈波动，需要更频繁地对冲",
        "ATM 近到期期权 Gamma 最高——此时 Delta 变化最剧烈",
        "核心取舍：高 Gamma = 高 Theta 成本（没有免费的午餐）",
      ],
      interpret(s) { return interpretGamma(s); },
    },
  },
  {
    key: "theta", label: "Theta", className: "curve-theta",
    note: "每日时间价值变化；卖方结构通常希望 Theta 为正。",
    concept: {
      what: "Theta 衡量期权价格随时间流逝的变化量。每过一天，期权的时间价值就会减少（因为距离到期更近，不确定性降低）。Theta 通常是负数（买方每天亏时间价值），但对卖方来说 Theta 是正的——每天坐收时间价值衰减。近到期时 Theta 衰减加速，到期前最后一周衰减最快。",
      benchmark: [
        "正 Theta：期权卖方特征，时间是朋友，每天坐收时间价值",
        "负 Theta：期权买方特征，时间是敌人，持仓不动就亏钱",
        "近到期 ATM 期权 Theta 最高（绝对值），时间衰减最剧烈",
        "Theta 和 Gamma 总是同号相反：高正 Gamma 必伴随高负 Theta",
      ],
      interpret(s) { return interpretTheta(s); },
    },
  },
  {
    key: "vega", label: "Vega", className: "curve-vega",
    note: "IV 每变化 1 个百分点时组合理论价值的变化。",
    concept: {
      what: "Vega 衡量期权价格对隐含波动率（IV）变化的敏感度。IV 是市场对未来波动幅度的预期——IV 上升意味着市场预期未来波动更大，期权变贵；IV 下降意味着预期趋于平稳，期权变便宜。Vega 告诉你 IV 变化 1 个百分点，你的组合会赚/亏多少。远到期期权的 Vega 更大（不确定性时间更长），近到期期权的 Vega 很小。",
      benchmark: [
        "正 Vega：受益于 IV 上升，适合在市场恐慌/事件前买入",
        "负 Vega：受益于 IV 回落，适合在 IV 高位卖出（如财报后）",
        "远到期期权 Vega 高——时间越长，波动率的影响越大",
        "关键概念：IV（市场预期）vs 已实现波动率（实际发生）——Vega 赌的是两者之差",
      ],
      interpret(s) { return interpretVega(s); },
    },
  },
  {
    key: "rho", label: "Rho", className: "curve-rho",
    note: "利率每变化 1 个百分点时组合理论价值的变化。",
    concept: {
      what: "Rho 衡量期权价格对无风险利率变化的敏感度。利率上升 → Call 更贵（持有 Call 可以推迟买股票，省下的钱可以赚更高利息）、Put 更便宜。在低利率环境下（如当前 4%），Rho 对大多数策略影响很小。只有深度 ITM 的远到期期权才需要关注 Rho。",
      benchmark: [
        "当前低利率（4%）：对大多数短期策略 Rho 几乎可忽略",
        "深度 ITM + 远到期：Rho 才有实际意义",
        "正 Rho：受益于加息（Long Call、Short Put）",
      ],
      interpret(s) { return interpretRho(s); },
    },
  },
];
```

- [ ] **Step 3: Add interpretation helper functions**

Add after the greekPanels definition (after line 1215, before `defaultScenario`):

```javascript
function interpretDelta(strategy) {
  const metrics = riskMetrics();
  const d = metrics.delta;
  const abs = Math.abs(d);
  let desc = "";
  if (abs < 0.1) desc = "接近 Delta 中性。此策略不依赖方向判断。";
  else if (abs < 0.3) desc = "轻度方向性敞口。标的移动对组合有影响但不算大。";
  else if (abs < 0.6) desc = "中等方向性敞口。标的走势是盈亏的重要因素。";
  else desc = "强方向性敞口。组合盈亏高度依赖标的价格走势。";
  if (d > 0) desc += ` 当前组合 Delta = +${d.toFixed(2)}，标的上涨对组合有利。`;
  else desc += ` 当前组合 Delta = ${d.toFixed(2)}，标的下跌对组合有利。`;
  return desc;
}

function interpretGamma(strategy) {
  const metrics = riskMetrics();
  const g = metrics.gamma;
  if (g > 0.5) return `当前组合 Gamma = +${g.toFixed(2)}，正值较大。价格波动时 Delta 会朝有利方向变化（买方凸性优势明显），但需要标的真的动起来才能兑现。`;
  if (g > 0) return `当前组合 Gamma = +${g.toFixed(2)}（正），具有买方特征——价格上涨时加速盈利，价格下跌时减速亏损。`;
  if (g > -0.5) return `当前组合 Gamma = ${g.toFixed(2)}（轻微负），卖方特征较弱，Delta 变化不会太剧烈。`;
  return `当前组合 Gamma = ${g.toFixed(2)}（负），具有卖方特征——价格剧烈波动时 Delta 变化对你不利，需要注意风险管理和止损。`;
}

function interpretTheta(strategy) {
  const metrics = riskMetrics();
  const th = metrics.theta;
  if (th > 0) return `当前组合 Theta = +$${Math.abs(th).toFixed(2)}/天。时间是朋友——每天持仓不动就赚约 $${Math.abs(th).toFixed(2)}。这是期权卖方的核心收益来源。`;
  return `当前组合 Theta = -$${Math.abs(th).toFixed(2)}/天。时间是敌人——每天持有不动就亏约 $${Math.abs(th).toFixed(2)}。需要标的有足够波动才能覆盖时间损耗。`;
}

function interpretVega(strategy) {
  const metrics = riskMetrics();
  const v = metrics.vega;
  const abs = Math.abs(v);
  if (abs < 1) return `当前组合 Vega = ${v.toFixed(2)}，几乎不受 IV 变化影响。此策略对波动率的敏感度很低。`;
  if (v > 0) return `当前组合 Vega = +${v.toFixed(2)}。IV 每涨 1 个百分点，组合赚约 $${v.toFixed(2)}。适合在低 IV 环境买入，期待 IV 上升。`;
  return `当前组合 Vega = ${v.toFixed(2)}。IV 每涨 1 个百分点，组合亏约 $${abs.toFixed(2)}。适合在高 IV 环境卖出，期待 IV 回落（IV Crush）。`;
}

function interpretRho(strategy) {
  const metrics = riskMetrics();
  const r = metrics.rho;
  if (Math.abs(r) < 1) return `当前组合 Rho = ${r.toFixed(2)}，在当前利率环境下几乎可以忽略。`;
  if (r > 0) return `当前组合 Rho = +${r.toFixed(2)}，加息对组合有利。`;
  return `当前组合 Rho = ${r.toFixed(2)}，加息对组合不利。`;
}
```

- [ ] **Step 4: Modify `renderGreeks()` to add [?] buttons**

Replace the `renderGreeks()` function (lines 1601-1608) with:

```javascript
function renderGreeks() {
  document.getElementById("multiLegend").innerHTML = greekPanels
    .map((panel) => `<span class="legend-item"><span class="legend-line ${panel.className}" style="background: currentColor"></span>${panel.label}</span>`)
    .join("");
  document.getElementById("greekGrid").innerHTML = greekPanels
    .map((panel) => {
      const infoBtn = panel.concept
        ? `<button class="concept-btn" type="button" data-concept="${panel.key}" aria-label="了解 ${panel.label}">?</button>`
        : "";
      return `<article class="mini-chart">
        <h4>${panel.label}${infoBtn}</h4>
        <div class="mini-svg">${miniChartSvg(panel)}</div>
        <p class="mini-copy">${escapeHtml(panel.note)}</p>
      </article>`;
    })
    .join("");
}
```

- [ ] **Step 5: Add concept card CSS**

Add to `/home/option_strategy/styles.css`:

```css
/* Concept Card */
.concept-card {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 100; max-width: 520px; width: calc(100vw - 40px); max-height: 80vh;
  overflow-y: auto; background: #111827; border: 1px solid rgba(57,199,229,.5);
  border-radius: 12px; padding: 24px; box-shadow: 0 12px 40px rgba(0,0,0,.6);
}
.concept-card h4 { margin: 0 0 8px; color: var(--cyan); font-size: 18px; }
.concept-card h5 { margin: 16px 0 6px; color: var(--text); font-size: 14px; }
.concept-card p, .concept-card li { color: var(--muted); line-height: 1.6; font-size: 13px; }
.concept-card ul { margin: 6px 0 0; padding-left: 18px; }
.concept-card li { margin-bottom: 6px; }
.concept-card .interpret { border-left: 2px solid var(--cyan); padding-left: 12px; margin: 12px 0; color: var(--text); }
.concept-card .related-link { color: var(--cyan); cursor: pointer; text-decoration: underline; }
.concept-close {
  position: sticky; top: 0; float: right; background: none; border: none;
  color: var(--muted); font-size: 22px; cursor: pointer; line-height: 1;
}
.concept-close:hover { color: var(--text); }

.concept-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; margin-left: 4px; border: 1px solid var(--cyan);
  border-radius: 50%; background: transparent; color: var(--cyan);
  font-size: 11px; font-weight: 700; cursor: pointer; vertical-align: middle;
}
.concept-btn:hover { background: var(--cyan); color: #000; }
```

- [ ] **Step 6: Verify concept cards**

Open `index.html`, click `?` next to Delta in the Greeks panel → card appears with "是什么", "怎么看", strategy-specific interpretation. Click × or click outside → card closes. Test Gamma, Theta, Vega, Rho cards.

---

### Task 2: Greeks Concept Cards — Show/Hide Interaction

**Files:**
- Modify: `/home/option_strategy/app.js:1956-1968` (handleClick)

- [ ] **Step 1: Add concept card show/hide functions**

Add after the interpret helpers (before `defaultScenario`):

```javascript
function showConceptCard(panel) {
  const card = document.getElementById("conceptCard");
  const content = document.getElementById("conceptContent");
  const con = panel.concept;
  const strategy = selectedStrategy();
  const interp = con.interpret ? con.interpret(strategy) : "";
  const relatedKeys = { delta: "gamma", gamma: "theta", theta: "vega", vega: "delta", rho: "delta" };
  const relatedLabel = greekPanels.find(p => p.key === relatedKeys[panel.key])?.label || "";

  content.innerHTML = `
    <h4>${panel.label}（希腊值）</h4>
    <h5>📖 是什么？</h5>
    <p>${con.what}</p>
    ${interp ? `<div class="interpret">🎯 <strong>当前策略解读：</strong>${interp}</div>` : ""}
    <h5>💡 怎么看？</h5>
    <ul>${con.benchmark.map(b => `<li>${b}</li>`).join("")}</ul>
    ${relatedLabel ? `<p style="margin-top:12px">🔗 相关概念：<span class="related-link" data-concept="${relatedKeys[panel.key]}">${relatedLabel}</span></p>` : ""}
  `;
  card.hidden = false;

  // Click related link to switch cards
  content.querySelector(".related-link")?.addEventListener("click", (e) => {
    const targetKey = e.target.dataset.concept;
    const targetPanel = greekPanels.find(p => p.key === targetKey);
    if (targetPanel?.concept) showConceptCard(targetPanel);
  });
}

function hideConceptCard() {
  document.getElementById("conceptCard").hidden = true;
}
```

- [ ] **Step 2: Wire click events**

Modify `handleClick()` (after line 1968) to handle concept card interactions:

```javascript
function handleClick(event) {
  // ... existing filter and strategy click handling (keep as-is) ...

  const filter = event.target.closest("[data-filter]");
  if (filter) {
    state.filter = filter.dataset.filter;
    renderFilters();
    renderStrategyList();
    return;
  }
  const strategyButton = event.target.closest("[data-strategy]");
  if (strategyButton) {
    selectStrategy(strategyButton.dataset.strategy);
    return;
  }
  // NEW: Concept card triggers
  const conceptBtn = event.target.closest("[data-concept]");
  if (conceptBtn) {
    const key = conceptBtn.dataset.concept;
    const panel = greekPanels.find(p => p.key === key);
    if (panel?.concept) showConceptCard(panel);
    return;
  }
  // NEW: Close concept card
  if (event.target.id === "closeConceptCard" || (!event.target.closest(".concept-card") && !event.target.closest("[data-concept]"))) {
    hideConceptCard();
  }
}
```

Wait—the close-on-outside-click logic above is wrong because `handleClick` already returns early for other matches. Restructure `handleClick` properly:

```javascript
function handleClick(event) {
  // Concept card close button
  if (event.target.id === "closeConceptCard") {
    hideConceptCard();
    return;
  }
  // Concept card [?] button
  const conceptBtn = event.target.closest("[data-concept]");
  if (conceptBtn) {
    const key = conceptBtn.dataset.concept;
    const panel = greekPanels.find(p => p.key === key);
    if (panel?.concept) showConceptCard(panel);
    return;
  }
  // Close concept card when clicking outside
  const card = document.getElementById("conceptCard");
  if (!card.hidden && !event.target.closest(".concept-card")) {
    hideConceptCard();
  }
  // Existing filter logic
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    state.filter = filter.dataset.filter;
    renderFilters();
    renderStrategyList();
    return;
  }
  // Existing strategy selection
  const strategyButton = event.target.closest("[data-strategy]");
  if (strategyButton) {
    selectStrategy(strategyButton.dataset.strategy);
  }
}
```

- [ ] **Step 3: Verify card interaction**

- Click `?` on Delta → card opens
- Click `?` on Gamma → card opens with Gamma content
- Click related link inside card → switches to other Greek card
- Click × → card closes
- Click backdrop → card closes
- Switch strategies → interpretation text updates

---

### Task 3: Chart Hover Tooltip

**Files:**
- Modify: `/home/option_strategy/app.js:1453-1496` (chartSvg)
- Modify: `/home/option_strategy/app.js:1577-1599` (renderMainChart)
- Modify: `/home/option_strategy/index.html` (add tooltip element)
- Modify: `/home/option_strategy/styles.css`

- [ ] **Step 1: Add tooltip HTML element**

Add after line 68 (`<div id="mainChart" class="main-chart" ...>`) in index.html:

```html
<div id="chartTooltip" class="chart-tooltip" hidden></div>
```

- [ ] **Step 2: Modify `chartSvg()` to include an invisible overlay rect for mouse tracking**

In `chartSvg()` (line 1491), replace the return statement to add a transparent overlay:

```javascript
// Replace the return statement at line 1491-1495:
const overlay = options.interactive
  ? `<rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="transparent" data-chart-overlay="true"/>`
  : "";

return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.label || "chart")}">
  ${grid}${zeroLine}${breakLines}${spotLine}${paths}${overlay}
  <text class="axis-label" x="${width - 18}" y="${height - 10}" text-anchor="end">标的价格</text>
  <text class="axis-label" x="${pad.left}" y="12">${escapeHtml(options.yLabel || "值")}</text>
</svg>`;
```

- [ ] **Step 3: Add `xScale`/`yScale` to the `chartSvg` options for external use**

The `chartSvg` function computes `xScale` and `yScale` internally — we need to expose them. Modify `chartSvg` to accept an `onRender` callback:

Add a new parameter in the `options` usage. After the SVG string is built (before return), call the callback:

```javascript
function chartSvg(series, options = {}) {
  // ... all existing computation (lines 1454-1495) stays ...

  const svg = `<svg ...>...</svg>`;

  if (options.onRender) {
    options.onRender({ xScale, yScale, plotW, plotH, pad, width, height, minX, maxX, minY, maxY });
  }

  return svg;
}
```

- [ ] **Step 4: Add tooltip event handling in `renderMainChart()`**

Modify `renderMainChart()` (after line 1598) to attach the tooltip handler:

```javascript
function renderMainChart() {
  const horizon = chartHorizon();
  const current = curveData("risk", state.scenario.daysElapsed, 170, state.scenario.priceRange);
  const expiry = curveData("risk", horizon, 170, state.scenario.priceRange);
  const baselineScenario = { ...state.scenario, ivShift: 0 };
  const baseline = priceRange(170, state.scenario.priceRange).map((spot) => ({
    spot,
    value: portfolioResult(spot, 0, baselineScenario).pnl,
  }));

  document.getElementById("chartLegend").innerHTML = `
    <span class="legend-item" style="color: var(--cyan)"><span class="legend-line"></span>当前情景</span>
    <span class="legend-item" style="color: var(--green)"><span class="legend-line"></span>到期</span>
    <span class="legend-item" style="color: var(--muted)"><span class="legend-line dashed"></span>开仓日</span>
    <span class="legend-item" style="color: var(--amber)"><span class="legend-line dashed"></span>现价 / 盈亏平衡</span>`;

  // Store curve data for tooltip lookup
  const curves = { baseline, expiry, current };
  let chartScale = null;

  document.getElementById("mainChart").innerHTML = chartSvg(
    [
      { points: baseline, className: "payoff-entry" },
      { points: expiry, className: "payoff-expiry" },
      { points: current, className: "payoff-current" },
    ],
    {
      label: "主损益图", yLabel: "PnL", breakevens: findBreakevens(expiry),
      interactive: true,
      onRender: (scale) => { chartScale = scale; },
    },
  );

  // Attach tooltip listener
  const chartEl = document.getElementById("mainChart");
  const tooltip = document.getElementById("chartTooltip");
  chartEl.onmousemove = (e) => {
    if (!chartScale) return;
    const svgRect = chartEl.querySelector("svg").getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const svgX = (mouseX / svgRect.width) * chartScale.width;
    if (svgX < chartScale.pad.left || svgX > chartScale.width - chartScale.pad.right) {
      tooltip.hidden = true;
      return;
    }
    const spot = chartScale.minX + ((svgX - chartScale.pad.left) / chartScale.plotW) * (chartScale.maxX - chartScale.minX);
    const expiryPnl = portfolioResult(spot, horizon, state.scenario).pnl;
    const currentPnl = portfolioResult(spot, state.scenario.daysElapsed, state.scenario).pnl;
    const entryPnl = portfolioResult(spot, 0, { ...state.scenario, ivShift: 0 }).pnl;

    tooltip.hidden = false;
    tooltip.style.left = (e.clientX + 14) + "px";
    tooltip.style.top = (e.clientY - 60) + "px";
    tooltip.innerHTML = `
      <div>现货: <strong>$${spot.toFixed(2)}</strong></div>
      <div>到期盈亏: <strong>${formatMoney(expiryPnl)}</strong></div>
      <div>当前盈亏: <strong>${formatMoney(currentPnl)}</strong></div>
      <div>开仓盈亏: <strong>${formatMoney(entryPnl)}</strong></div>
    `;
  };
  chartEl.onmouseleave = () => { tooltip.hidden = true; };
}
```

- [ ] **Step 5: Add tooltip CSS**

```css
.chart-tooltip {
  position: fixed; z-index: 90; pointer-events: none;
  background: rgba(17,24,39,.94); border: 1px solid rgba(57,199,229,.5);
  border-radius: 8px; padding: 10px 14px; font-size: 12px; line-height: 1.6;
  color: var(--muted); min-width: 160px;
}
.chart-tooltip strong { color: var(--text); }
```

- [ ] **Step 6: Verify tooltip**

Open browser, hover over main chart → tooltip follows mouse, shows spot + 3 P&L values. Move mouse outside chart area → tooltip hides. Values change correctly when IV slider or time slider adjusted.

---

### Task 4: Profit/Loss Area Shading + Breakeven Labels

**Files:**
- Modify: `/home/option_strategy/app.js:1453-1496` (chartSvg)

- [ ] **Step 1: Add profit/loss area polygons to `chartSvg()`**

After the paths are computed (line 1489), add area shading using the series points directly (no external function calls needed — the points already contain PnL values). Insert before the return statement:

```javascript
// Add profit/loss area shading from the expiry series points
let profitArea = "";
let lossArea = "";
const expiryPts = series.find(s => s.className === "payoff-expiry")?.points;
if (expiryPts && expiryPts.length > 1) {
  // Find zero crossings by scanning adjacent points
  const zeroCrossings = [];
  for (let i = 0; i < expiryPts.length - 1; i++) {
    const a = expiryPts[i]; const b = expiryPts[i + 1];
    if ((a.value <= 0 && b.value > 0) || (a.value >= 0 && b.value < 0)) {
      const t = Math.abs(a.value) / (Math.abs(a.value) + Math.abs(b.value));
      zeroCrossings.push(a.spot + (b.spot - a.spot) * t);
    }
  }
  // Build polygon for a region: from zero-line up to curve, then back along zero-line
  const buildArea = (signFilter, className) => {
    // Determine which segments have the right sign
    const segments = [];
    const boundaries = [minX, ...zeroCrossings.sort((a,b)=>a-b), maxX];
    for (let i = 0; i < boundaries.length - 1; i++) {
      const mid = (boundaries[i] + boundaries[i+1]) / 2;
      // Interpolate value at mid from nearest expiryPts
      const pt = expiryPts.reduce((prev, curr) =>
        Math.abs(curr.spot - mid) < Math.abs(prev.spot - mid) ? curr : prev
      );
      if (signFilter(pt.value)) {
        segments.push({ x1: boundaries[i], x2: boundaries[i+1] });
      }
    }
    return segments.map(seg => {
      const x1 = xScale(seg.x1); const x2 = xScale(seg.x2);
      const y0 = yScale(0);
      const topPts = expiryPts.filter(p => p.spot >= seg.x1 && p.spot <= seg.x2);
      if (topPts.length < 2) return "";
      const areaPath = [
        `M ${x1.toFixed(1)} ${y0.toFixed(1)}`,
        ...topPts.map(p => `L ${xScale(p.spot).toFixed(1)} ${yScale(p.value).toFixed(1)}`),
        `L ${x2.toFixed(1)} ${y0.toFixed(1)} Z`,
      ].join(" ");
      return `<path class="${className}" d="${areaPath}"/>`;
    }).join("");
  };
  profitArea = buildArea((v) => v > 0, "profit-area");
  lossArea = buildArea((v) => v < 0, "loss-area");
}
```

Then add `${profitArea}${lossArea}` into the SVG markup, right after `${paths}` and before `${overlay}`.

- [ ] **Step 2: Add breakeven labels**

After the breakLines computation (line 1488), add labels:

```javascript
const breakLabels = (options.breakevens || [])
  .map((spot) => {
    const bx = xScale(spot).toFixed(1);
    const by = (yScale(0) - 14).toFixed(1);
    return `<text class="break-label" x="${bx}" y="${by}" text-anchor="middle">$${spot.toFixed(2)}</text>`;
  })
  .join("");
```

Add `${breakLabels}` to the SVG markup.

- [ ] **Step 3: Add CSS for break labels**

```css
.break-label { fill: var(--amber); font-size: 11px; }
```

- [ ] **Step 4: Verify shading + labels**

Test with Long Call: one breakeven above spot, green area to the right, red area to the left. Test with Iron Condor: two breakevens, green "platform" between them. Breakeven values displayed correctly.

---

### Task 5: Time Decay Play Button

**Files:**
- Modify: `/home/option_strategy/index.html:57-65` (slider area)
- Modify: `/home/option_strategy/app.js:1565-1575` (renderSliders)
- Add: animation state and functions to app.js
- Modify: `/home/option_strategy/styles.css`

- [ ] **Step 1: Add play controls to HTML**

Replace lines 61-64 (the time slider label area) with:

```html
<label class="range-control">
  <span class="range-label-row">
    <span>Date / DTE</span>
    <output id="dateReadout" class="readout"></output>
  </span>
  <input id="timeSlider" type="range" min="0" max="45" step="1" value="0" />
  <span class="play-controls">
    <button id="playBtn" class="play-btn" type="button" title="播放时间衰减">▶</button>
    <button id="pauseBtn" class="play-btn" type="button" title="暂停">⏸</button>
    <button id="resetTimeBtn" class="play-btn" type="button" title="重置">↺</button>
    <select id="playSpeed" class="play-speed">
      <option value="1">1x</option>
      <option value="2">2x</option>
      <option value="5">5x</option>
    </select>
  </span>
</label>
```

- [ ] **Step 2: Add animation logic to app.js**

Add after `renderSliders()`:

```javascript
let timeAnimationId = null;

function startTimeAnimation() {
  if (timeAnimationId) return;
  const maxDays = maxDte();
  if (state.scenario.daysElapsed >= maxDays) {
    state.scenario.daysElapsed = 0;
  }
  const speed = Number(document.getElementById("playSpeed")?.value || 1);
  const fps = 10;
  const increment = speed / fps;

  timeAnimationId = setInterval(() => {
    state.scenario.daysElapsed = Math.min(maxDays, state.scenario.daysElapsed + increment);
    refreshAnalysis({ controls: false, legs: false });
    if (state.scenario.daysElapsed >= maxDays) {
      stopTimeAnimation();
    }
  }, 1000 / fps);
  document.getElementById("playBtn").textContent = "⏸";
}

function stopTimeAnimation() {
  if (timeAnimationId) {
    clearInterval(timeAnimationId);
    timeAnimationId = null;
  }
  document.getElementById("playBtn").textContent = "▶";
}

function resetTimeAnimation() {
  stopTimeAnimation();
  state.scenario.daysElapsed = 0;
  refreshAnalysis({ controls: false, legs: false });
}
```

- [ ] **Step 3: Wire play button events in `boot()`**

Add after line 1977 (`document.getElementById("resetStrategy")...`):

```javascript
document.getElementById("playBtn").addEventListener("click", () => {
  if (timeAnimationId) stopTimeAnimation();
  else startTimeAnimation();
});
document.getElementById("pauseBtn").addEventListener("click", stopTimeAnimation);
document.getElementById("resetTimeBtn").addEventListener("click", resetTimeAnimation);
```

- [ ] **Step 4: Add play button CSS**

```css
.play-controls { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.play-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: 1px solid var(--line); border-radius: 6px;
  background: var(--panel-3); color: var(--text); font-size: 13px; cursor: pointer;
}
.play-btn:hover { border-color: var(--cyan); color: var(--cyan); }
.play-speed {
  border: 1px solid var(--line); border-radius: 6px; background: var(--panel-3);
  color: var(--text); font-size: 11px; padding: 4px 6px; cursor: pointer;
}
```

- [ ] **Step 5: Verify animation**

- Click ▶ → time slider advances automatically, chart and Greeks update in real-time
- Click ⏸ → animation pauses at current DTE
- Click ↺ → resets to day 0
- Change speed to 5x → faster animation
- Works correctly when DTE reaches max (auto-stop)

---

### Task 6: Strategy List Difficulty Badges + Filter

**Files:**
- Modify: `/home/option_strategy/app.js:1197` (filters array)
- Modify: `/home/option_strategy/app.js:1515-1528` (visibleStrategies)
- Modify: `/home/option_strategy/app.js:1530-1543` (renderStrategyList)
- Modify: `/home/option_strategy/styles.css`

- [ ] **Step 1: Add difficulty filters**

Change the `filters` array (line 1197) to include difficulty:

```javascript
const filters = ["全部", "新手", "中级", "高级", "专家", "原站", "补充", "方向", "收租", "波动率", "跨期", "复杂", "合成", "股票覆盖", "向导"];
```

- [ ] **Step 2: Update `visibleStrategies()` to filter by difficulty**

Modify the filter logic (lines 1518-1521):

```javascript
const difficultyLevels = ["新手", "中级", "高级", "专家"];
const filterOk =
  state.filter === "全部" ||
  (state.filter === "原站" && strategy.source === "原站") ||
  (state.filter === "补充" && strategy.source === "补充") ||
  (difficultyLevels.includes(state.filter) && strategy.difficulty === state.filter) ||
  strategy.category === state.filter;
```

- [ ] **Step 3: Update `renderStrategyList()` to show difficulty badges**

Replace the strategy item template (lines 1537-1541):

```javascript
const diffClass = { Novice: "diff-novice", Intermediate: "diff-intermediate", Advanced: "diff-advanced", Expert: "diff-expert", Framework: "diff-framework" };
const diffLabel = { Novice: "新手", Intermediate: "中级", Advanced: "高级", Expert: "专家", Framework: "向导" };

document.getElementById("strategyList").innerHTML = strategies
  .map(
    (strategy) => `<button class="strategy-item ${strategy.id === state.selectedId ? "is-selected" : ""}" type="button" data-strategy="${strategy.id}">
      <span>
        <span class="strategy-name">${escapeHtml(strategy.name)}</span>
        <span class="strategy-description">${escapeHtml(strategy.cn)} · ${escapeHtml(strategy.outlook)}</span>
      </span>
      <span class="strategy-tags">
        <span class="diff-badge ${diffClass[strategy.difficulty] || ""}" title="${diffLabel[strategy.difficulty] || strategy.difficulty}"></span>
        <span class="${strategy.source === "补充" ? "source-extra" : ""}">${escapeHtml(strategy.category)}</span>
      </span>
    </button>`,
  )
  .join("");
```

- [ ] **Step 4: Add difficulty badge CSS**

```css
.diff-badge { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
.diff-novice { background: #48d47a; }
.diff-intermediate { background: #e6b84a; }
.diff-advanced { background: #f08c4a; }
.diff-expert { background: #f06474; }
.diff-framework { background: #39c7e5; }
```

- [ ] **Step 5: Verify difficulty display**

- Strategy list shows colored dots next to each strategy
- Click "新手" filter → only 5 Novice strategies shown
- Click "专家" filter → only Expert strategies shown
- Click "全部" → all strategies shown
- Search + difficulty filter work together correctly

---

### Task 7: URL State Persistence for Filters + Strategy

**Files:**
- Modify: `/home/option_strategy/app.js:1970-1978` (boot)

- [ ] **Step 1: Add URL read/write functions**

Add before `boot()`:

```javascript
function saveStateToURL() {
  const params = new URLSearchParams();
  if (state.selectedId !== "long-call") params.set("s", state.selectedId);
  if (state.filter !== "全部") params.set("f", state.filter);
  if (state.search) params.set("q", state.search);
  if (state.scenario.spot !== SPOT) params.set("spot", state.scenario.spot);
  if (state.scenario.ivShift !== 0) params.set("iv", Math.round(state.scenario.ivShift * 100));
  if (state.scenario.daysElapsed !== 0) params.set("dte", Math.round(state.scenario.daysElapsed));
  if (state.scenario.rate !== RATE) params.set("rate", state.scenario.rate);
  if (state.scenario.dividend !== 0) params.set("div", state.scenario.dividend);
  if (state.scenario.multiplier !== 100) params.set("mult", state.scenario.multiplier);

  const newURL = params.toString()
    ? window.location.pathname + "?" + params.toString()
    : window.location.pathname;
  window.history.replaceState(null, "", newURL);
}

function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("s")) state.selectedId = params.get("s");
  if (params.has("f")) state.filter = params.get("f");
  if (params.has("q")) {
    state.search = params.get("q");
    document.getElementById("searchInput").value = state.search;
  }
  if (params.has("spot")) state.scenario.spot = Math.max(0.01, Number(params.get("spot")));
  if (params.has("iv")) state.scenario.ivShift = Number(params.get("iv")) / 100;
  if (params.has("dte")) state.scenario.daysElapsed = Math.max(0, Number(params.get("dte")));
  if (params.has("rate")) state.scenario.rate = Number(params.get("rate"));
  if (params.has("div")) state.scenario.dividend = Number(params.get("div"));
  if (params.has("mult")) state.scenario.multiplier = Math.max(1, Number(params.get("mult")));
}
```

- [ ] **Step 2: Call `saveStateToURL()` after every state change**

Add at the end of `selectStrategy()` (after `refreshAnalysis()`):

```javascript
saveStateToURL();
```

Add at the end of `handleInput()` (after each state-changing branch) and `handleClick()` (after filter change). Simplest approach: call `saveStateToURL()` at the end of `renderAll()` and `refreshAnalysis()`:

```javascript
function refreshAnalysis(options = {}) {
  renderTopbar();
  renderSliders();
  renderMainChart();
  renderGreeks();
  renderMetrics();
  renderEducation();
  if (options.legs !== false) renderLegsEditor();
  if (options.controls !== false) renderScenarioControls();
  saveStateToURL();  // <-- ADD
}
```

- [ ] **Step 3: Call `loadStateFromURL()` in `boot()`**

In `boot()` (line 1970), after `const first = selectedStrategy()`:

```javascript
function boot() {
  loadStateFromURL();  // <-- ADD: load before initializing
  const first = selectedStrategy();
  state.entrySpot = state.scenario.spot;
  state.legs = normalizeLegs(first.legs, state.entrySpot);
  // ... rest unchanged
```

- [ ] **Step 4: Verify URL persistence**

- Select "Iron Condor" → URL shows `?s=iron-condor`
- Change IV slider to +10% → URL shows `&iv=10`
- Select "新手" filter → URL shows `&f=新手`
- Refresh page → state restored correctly
- Copy URL to new tab → same strategy/filter/parameters loaded
- Click "全部" filter → `f=全部` removed from URL (default values omitted)

---

## Verification Summary

After all tasks complete, run through:

1. **Bug fixes**: Delta Neutral slug loads, zero qty respected, NaN inputs don't crash
2. **Concept cards**: All 5 Greek cards open/close, show strategy-specific interpretation, related links work
3. **Chart tooltip**: Hover shows spot + 3 P&L values, follows mouse, hides outside chart
4. **Area shading**: Green above zero, red below zero, correct for Long Call / Iron Condor / Straddle
5. **Breakeven labels**: Values displayed next to breakeven lines
6. **Time animation**: Play/pause/reset work, chart updates in real-time, speed control works
7. **Difficulty badges**: Colored dots in list, difficulty filter works, counts update
8. **URL persistence**: Strategy/filter/parameters survive refresh, shareable via URL
9. **No regressions**: All existing functionality intact (sliders, legs editor, scenario controls, playbook, strategy switching)
