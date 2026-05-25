const SPOT = 100;
const RATE = 0.04;


const filters = ["全部", "新手", "中级", "高级", "专家", "原站", "补充", "方向", "收租", "波动率", "跨期", "复杂", "合成", "股票覆盖", "向导"];
const DIFFICULTY_LEVELS = ["新手", "中级", "高级", "专家"];
const DIFF_CLASS = { Novice: "diff-novice", Intermediate: "diff-intermediate", Advanced: "diff-advanced", Expert: "diff-expert", Framework: "diff-framework" };
const DIFF_LABEL = { Novice: "新手", Intermediate: "中级", Advanced: "高级", Expert: "专家", Framework: "向导" };

const state = {
  selectedId: "long-call",
  filter: "全部",
  search: "",
  entrySpot: SPOT,
  scenario: defaultScenario(),
  legs: [],
  mode: "basic", // "basic" | "professional" | "interview"
};

const greekPanels = [
  {
    key: "risk", label: "Risk / PnL", className: "curve-risk",
    note: "不同标的价格下的理论盈亏，包含当前 DTE 与 IV 情景。",
    concept: null,
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
    },
  },
  {
    key: "gamma", label: "Gamma", className: "curve-gamma",
    note: "Delta 对价格变化的敏感度；临近执行价和到期时会更尖锐。",
    concept: {
      what: "Gamma 衡量 Delta 随标的价格变化的速度。可以把 Gamma 理解为「加速度」——Delta 告诉你在某一点价格会怎么变，Gamma 告诉你当价格移动时 Delta 本身会怎么变。正 Gamma 意味着价格上涨时 Delta 变得更大（赚钱加速），价格下跌时 Delta 变得更小（亏钱减速）——这是期权买方的「凸性」优势。",
      benchmark: [
        "正 Gamma：期权买方特征，受益于价格大幅波动，类似「免费加速」",
        "负 Gamma：期权卖方特征，怕跳空和剧烈波动，需要更频繁地对冲",
        "ATM 近到期期权 Gamma 最高——此时 Delta 变化最剧烈",
        "核心取舍：高 Gamma = 高 Theta 成本（没有免费的午餐）",
      ],
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
    },
  },
  {
    key: "vega", label: "Vega", className: "curve-vega",
    note: "IV 每变化 1 个百分点时组合理论价值的变化。",
    concept: {
      what: "Vega 衡量期权价格对隐含波动率（IV）变化的敏感度。IV 是市场对未来波动幅度的预期——IV 上升意味着市场预期未来波动更大，期权变贵；IV 下降意味着预期趋于平稳，期权变便宜。Vega 告诉你 IV 变化 1 个百分点，你的组合会赚/亏多少。远到期期权的 Vega 更大（不确定性时间更长），近到期期权的 Vega 很小。",
      benchmark: [
        "正 Vega：受益于 IV 上升，适合在市场恐慌/事件前买入",
        "负 Vega：受益于 IV 回落，适合在 IV 高位卖出（如财报后 IV Crush）",
        "远到期期权 Vega 高——时间越长，波动率的影响越大",
        "关键概念：IV（市场预期）vs 已实现波动率（实际发生）——Vega 赌的是两者之差",
      ],
    },
  },
  {
    key: "rho", label: "Rho", className: "curve-rho",
    note: "利率每变化 1 个百分点时组合理论价值的变化。",
    concept: {
      what: "Rho 衡量期权价格对无风险利率变化的敏感度。利率上升 → Call 更贵（持有 Call 可以推迟买股票，省下的钱可以赚更高利息）、Put 更便宜。在低利率环境下，Rho 对大多数策略影响很小。只有深度 ITM 的远到期期权才需要关注 Rho。",
      benchmark: [
        "当前低利率环境：对大多数短期策略 Rho 几乎可忽略",
        "深度 ITM + 远到期：Rho 才有实际意义",
        "正 Rho：受益于加息（Long Call、Short Put）",
      ],
    },
  },
];

// --- Greek interpretation helpers (used by concept cards) ---
function interpretDelta() {
  const metrics = riskMetrics();
  const d = metrics.greeks.delta;
  const abs = Math.abs(d);
  let desc = abs < 0.1 ? "接近 Delta 中性。此策略不依赖方向判断。" :
    abs < 0.3 ? "轻度方向性敞口。标的移动对组合有影响但不算大。" :
    abs < 0.6 ? "中等方向性敞口。标的走势是盈亏的重要因素。" :
    "强方向性敞口。组合盈亏高度依赖标的价格走势。";
  desc += d > 0 ? ` 当前组合 Delta = +${d.toFixed(2)}，标的上涨对组合有利。` : ` 当前组合 Delta = ${d.toFixed(2)}，标的下跌对组合有利。`;
  return desc;
}

function interpretGamma() {
  const metrics = riskMetrics();
  const g = metrics.greeks.gamma;
  if (g > 0.5) return `当前组合 Gamma = +${g.toFixed(2)}，正值较大。价格波动时 Delta 会朝有利方向变化（买方凸性优势明显），但需要标的真的动起来才能兑现。`;
  if (g > 0) return `当前组合 Gamma = +${g.toFixed(2)}（正），具有买方特征——价格上涨时加速盈利，价格下跌时减速亏损。`;
  if (g > -0.5) return `当前组合 Gamma = ${g.toFixed(2)}（轻微负），卖方特征较弱，Delta 变化不会太剧烈。`;
  return `当前组合 Gamma = ${g.toFixed(2)}（负），具有卖方特征——价格剧烈波动时 Delta 变化对你不利，需要注意风险管理和止损。`;
}

function interpretTheta() {
  const metrics = riskMetrics();
  const th = metrics.greeks.theta;
  if (th > 0) return `当前组合 Theta = +$${Math.abs(th).toFixed(2)}/天。时间是朋友——每天持仓不动就赚约 $${Math.abs(th).toFixed(2)}。这是期权卖方的核心收益来源。`;
  return `当前组合 Theta = -$${Math.abs(th).toFixed(2)}/天。时间是敌人——每天持有不动就亏约 $${Math.abs(th).toFixed(2)}。需要标的有足够波动才能覆盖时间损耗。`;
}

function interpretVega() {
  const metrics = riskMetrics();
  const v = metrics.greeks.vega;
  const abs = Math.abs(v);
  if (abs < 1) return `当前组合 Vega = ${v.toFixed(2)}，几乎不受 IV 变化影响。此策略对波动率的敏感度很低。`;
  if (v > 0) return `当前组合 Vega = +${v.toFixed(2)}。IV 每涨 1 个百分点，组合赚约 $${v.toFixed(2)}。适合在低 IV 环境买入，期待 IV 上升。`;
  return `当前组合 Vega = ${v.toFixed(2)}。IV 每涨 1 个百分点，组合亏约 $${abs.toFixed(2)}。适合在高 IV 环境卖出，期待 IV 回落（IV Crush）。`;
}

function interpretRho() {
  const metrics = riskMetrics();
  const r = metrics.greeks.rho;
  if (Math.abs(r) < 1) return `当前组合 Rho = ${r.toFixed(2)}，在当前利率环境下几乎可以忽略。`;
  if (r > 0) return `当前组合 Rho = +${r.toFixed(2)}，加息对组合有利。`;
  return `当前组合 Rho = ${r.toFixed(2)}，加息对组合不利。`;
}

const GREEK_INTERPRETERS = {
  delta: interpretDelta,
  gamma: interpretGamma,
  theta: interpretTheta,
  vega: interpretVega,
  rho: interpretRho,
};

const GREEK_RELATED = { delta: "gamma", gamma: "theta", theta: "vega", vega: "delta", rho: "delta" };

function showConceptCard(panel) {
  const card = document.getElementById("conceptCard");
  const content = document.getElementById("conceptContent");
  const con = panel.concept;
  if (!con) return;
  const interp = GREEK_INTERPRETERS[panel.key] ? GREEK_INTERPRETERS[panel.key]() : "";
  const relatedKey = GREEK_RELATED[panel.key];
  const relatedPanel = relatedKey ? greekPanels.find(p => p.key === relatedKey) : null;

  content.innerHTML = `
    <h4>${panel.label}（希腊值）</h4>
    <h5>📖 是什么？</h5>
    <p>${con.what}</p>
    ${interp ? `<div class="interpret">🎯 <strong>当前策略解读：</strong>${interp}</div>` : ""}
    <h5>💡 怎么看？</h5>
    <ul>${con.benchmark.map(b => `<li>${b}</li>`).join("")}</ul>
    ${relatedPanel?.concept ? `<p style="margin-top:12px">🔗 相关概念：<span class="related-link" data-concept="${relatedPanel.key}">${relatedPanel.label}</span></p>` : ""}
  `;
  card.hidden = false;

  content.querySelector(".related-link")?.addEventListener("click", (e) => {
    const targetKey = e.target.dataset.concept;
    const targetPanel = greekPanels.find(p => p.key === targetKey);
    if (targetPanel?.concept) showConceptCard(targetPanel);
  });
}

function hideConceptCard() {
  document.getElementById("conceptCard").hidden = true;
}

function defaultScenario() {
  return {
    spot: SPOT,
    ivShift: 0,
    rate: RATE,
    dividend: 0,
    multiplier: 100,
    priceRange: 50,
    daysElapsed: 0,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// --- Learning path / progress ---
const DIFF_ORDER = { Novice: 0, Intermediate: 1, Advanced: 2, Expert: 3, Framework: 4 };

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("os_learning") || "{}");
  } catch { return {}; }
}

function saveProgress(prog) {
  try { localStorage.setItem("os_learning", JSON.stringify(prog)); } catch { /* quota */ }
}

function markVisited(strategyId) {
  const prog = loadProgress();
  if (!prog.visited) prog.visited = [];
  if (!prog.visited.includes(strategyId)) { prog.visited.push(strategyId); saveProgress(prog); }
}

function markCompleted(strategyId) {
  const prog = loadProgress();
  if (!prog.completed) prog.completed = [];
  if (!prog.completed.includes(strategyId)) { prog.completed.push(strategyId); saveProgress(prog); }
}

function isCompleted(strategyId) {
  return (loadProgress().completed || []).includes(strategyId);
}

function learningPathFor(strategy) {
  const sameFamily = STRATEGIES.filter(s => s.category === strategy.category && s.id !== strategy.id);
  const curOrder = DIFF_ORDER[strategy.difficulty] ?? 2;
  // Prev: highest difficulty below current in same family
  const prevCandidates = sameFamily.filter(s => (DIFF_ORDER[s.difficulty] ?? 2) < curOrder);
  const prev = prevCandidates.sort((a, b) => (DIFF_ORDER[b.difficulty] ?? 2) - (DIFF_ORDER[a.difficulty] ?? 2))[0] || null;
  // Next: lowest difficulty above current in same family, or from related
  const nextCandidates = sameFamily.filter(s => (DIFF_ORDER[s.difficulty] ?? 2) > curOrder);
  const next = nextCandidates.sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 2) - (DIFF_ORDER[b.difficulty] ?? 2))[0] || null;
  return { prev, next };
}

function difficultyProgress(difficulty) {
  const all = STRATEGIES.filter(s => s.difficulty === difficulty);
  const done = (loadProgress().completed || []);
  const completed = all.filter(s => done.includes(s.id)).length;
  return { total: all.length, completed };
}

function selectedStrategy() {
  return STRATEGIES.find((strategy) => strategy.id === state.selectedId) || STRATEGIES[0];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sideSign(side) {
  return side === "long" ? 1 : -1;
}

function formatMoney(value) {
  if (value === Infinity) return "Unlimited";
  if (value === -Infinity) return "-Unlimited";
  if (!Number.isFinite(value)) return "n/a";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const body = abs >= 1000 ? abs.toLocaleString(undefined, { maximumFractionDigits: 0 }) : abs.toFixed(2);
  return `${sign}$${body}`;
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "n/a";
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (abs < 0.01 && abs > 0) return value.toExponential(2);
  return value.toFixed(digits);
}

function normPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normCdf(x) {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * z);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z));
  return 0.5 * (1 + sign * erf);
}

function optionIntrinsic(optionType, spot, strike) {
  return Math.max(optionType === "call" ? spot - strike : strike - spot, 0);
}

function optionModel(optionType, spot, strike, dte, rate, dividend, iv) {
  // Guard against NaN inputs — prevent pollution through charts and metrics
  if (isNaN(dte) || isNaN(spot) || isNaN(strike) || isNaN(iv) || isNaN(rate) || isNaN(dividend)) {
    return { price: 0, delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }
  const t = Math.max(dte, 0) / 365;
  const vol = Math.max(iv, 0.01);
  const safeSpot = Math.max(spot, 0.01);
  if (t <= 1e-6) {
    return {
      price: optionIntrinsic(optionType, safeSpot, strike),
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }
  const sqrtT = Math.sqrt(t);
  const d1 = (Math.log(safeSpot / strike) + (rate - dividend + 0.5 * vol * vol) * t) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  const dfR = Math.exp(-rate * t);
  const dfQ = Math.exp(-dividend * t);
  const pdf = normPdf(d1);
  const gamma = (dfQ * pdf) / (safeSpot * vol * sqrtT);
  const vega = safeSpot * dfQ * pdf * sqrtT * 0.01;

  if (optionType === "call") {
    const price = safeSpot * dfQ * normCdf(d1) - strike * dfR * normCdf(d2);
    const delta = dfQ * normCdf(d1);
    const theta = (-safeSpot * dfQ * pdf * vol / (2 * sqrtT) - rate * strike * dfR * normCdf(d2) + dividend * safeSpot * dfQ * normCdf(d1)) / 365;
    const rho = strike * t * dfR * normCdf(d2) * 0.01;
    return { price, delta, gamma, theta, vega, rho };
  }

  const price = strike * dfR * normCdf(-d2) - safeSpot * dfQ * normCdf(-d1);
  const delta = dfQ * (normCdf(d1) - 1);
  const theta = (-safeSpot * dfQ * pdf * vol / (2 * sqrtT) + rate * strike * dfR * normCdf(-d2) - dividend * safeSpot * dfQ * normCdf(-d1)) / 365;
  const rho = -strike * t * dfR * normCdf(-d2) * 0.01;
  return { price, delta, gamma, theta, vega, rho };
}

function maxDte() {
  const dtes = state.legs.filter((leg) => leg.type === "option").map((leg) => Number(leg.dte) || 0);
  return Math.max(1, ...dtes);
}

function chartHorizon() {
  const dtes = state.legs.filter((leg) => leg.type === "option").map((leg) => Number(leg.dte) || 0);
  if (!dtes.length) return 1;
  const unique = new Set(dtes.map((dte) => Math.round(dte)));
  return unique.size > 1 ? Math.min(...dtes) : Math.max(...dtes);
}

function normalizeLegs(legs, entrySpot) {
  return clone(legs).map((leg) => {
    if (leg.type === "stock") {
      return { ...leg, entry: Number.isFinite(Number(leg.entry)) ? Number(leg.entry) : entrySpot };
    }
    return {
      ...leg,
      qty: Number.isFinite(Number(leg.qty)) ? Number(leg.qty) : 1,
      strike: Number.isFinite(Number(leg.strike)) ? Number(leg.strike) : entrySpot,
      dte: Number.isFinite(Number(leg.dte)) ? Number(leg.dte) : 45,
      iv: Number.isFinite(Number(leg.iv)) ? Number(leg.iv) : 0.32,
    };
  });
}

function positionValue(leg, spot, daysElapsed, scenario, useEntry = false) {
  const multiplier = Number.isFinite(Number(scenario.multiplier)) ? Number(scenario.multiplier) : 100;
  const sign = sideSign(leg.side);

  if (leg.type === "stock") {
    const price = useEntry ? (Number.isFinite(Number(leg.entry)) ? Number(leg.entry) : state.entrySpot) : spot;
    const qty = Number.isFinite(Number(leg.qty)) ? Number(leg.qty) : 1;
    return {
      value: sign * qty * price * multiplier,
      greeks: { delta: sign * qty * multiplier, gamma: 0, theta: 0, vega: 0, rho: 0 },
    };
  }

  const legDte = Number.isFinite(Number(leg.dte)) ? Number(leg.dte) : 45;
  const remaining = useEntry ? legDte : Math.max(legDte - daysElapsed, 0);
  const legIv = Number.isFinite(Number(leg.iv)) ? Number(leg.iv) : 0.32;
  const iv = Math.max(0.01, legIv + (useEntry ? 0 : scenario.ivShift));
  const model = optionModel(leg.optionType, spot, Number(leg.strike), remaining, scenario.rate, scenario.dividend, iv);
  const qty = Number.isFinite(Number(leg.qty)) ? Number(leg.qty) : 1;
  const scale = sign * qty * multiplier;
  return {
    value: scale * model.price,
    greeks: {
      delta: scale * model.delta,
      gamma: scale * model.gamma,
      theta: scale * model.theta,
      vega: scale * model.vega,
      rho: scale * model.rho,
    },
  };
}

function portfolioResult(spot = state.scenario.spot, daysElapsed = state.scenario.daysElapsed, scenario = state.scenario) {
  const entryValue = state.legs.reduce((sum, leg) => sum + positionValue(leg, state.entrySpot, 0, scenario, true).value, 0);
  const current = state.legs.reduce(
    (acc, leg) => {
      const result = positionValue(leg, spot, daysElapsed, scenario, false);
      acc.value += result.value;
      for (const key of ["delta", "gamma", "theta", "vega", "rho"]) acc.greeks[key] += result.greeks[key];
      return acc;
    },
    { value: 0, greeks: { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 } },
  );
  return { entryValue, value: current.value, pnl: current.value - entryValue, greeks: current.greeks };
}

function priceRange(count = 160, rangePct = state.scenario.priceRange) {
  const base = Math.max(0.01, Number(state.scenario.spot) || SPOT);
  const pct = clamp(Number(rangePct) || 50, 5, 250) / 100;
  const low = Math.max(0.01, base * (1 - pct));
  const high = base * (1 + pct);
  return Array.from({ length: count }, (_, index) => low + ((high - low) * index) / (count - 1));
}

const LEG_COLORS = ["#48d47a", "#f06474", "#39c7e5", "#e6b84a", "#c084fc", "#f08c4a"];
let chartViewMode = "combined"; // "combined" | "perLeg" | "probability"
let hiddenLegs = new Set();

function curveData(key, daysElapsed = state.scenario.daysElapsed, count = 160, rangePct = state.scenario.priceRange) {
  return priceRange(count, rangePct).map((spot) => {
    const result = portfolioResult(spot, daysElapsed, state.scenario);
    return { spot, value: key === "risk" ? result.pnl : result.greeks[key], result };
  });
}

function perLegCurves(daysElapsed, count = 170, rangePct = state.scenario.priceRange) {
  const spots = priceRange(count, rangePct);
  return state.legs.map((leg, i) => {
    const entryVal = positionValue(leg, state.entrySpot, 0, state.scenario, true).value;
    const points = spots.map((spot) => {
      const currentVal = positionValue(leg, spot, daysElapsed, state.scenario, false).value;
      return { spot, value: currentVal - entryVal };
    });
    return { legIndex: i, color: LEG_COLORS[i % LEG_COLORS.length], points, label: legTitle(leg) };
  });
}

function findBreakevens(points) {
  const breaks = [];
  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const curr = points[index];
    if (Math.abs(curr.value) < 0.01) breaks.push(curr.spot);
    if (prev.value === 0 || curr.value === 0 || prev.value * curr.value > 0) continue;
    const ratio = Math.abs(prev.value) / (Math.abs(prev.value) + Math.abs(curr.value));
    breaks.push(prev.spot + (curr.spot - prev.spot) * ratio);
  }
  return breaks.filter((value, index, arr) => arr.findIndex((item) => Math.abs(item - value) < 0.25) === index);
}

function riskMetrics() {
  const horizon = chartHorizon();
  const points = curveData("risk", horizon, 300, 180);
  let maxProfit = Math.max(...points.map((point) => point.value));
  let maxLoss = Math.min(...points.map((point) => point.value));

  // Detect unbounded risk/reward by checking tail slope.
  // Normalize by contract multiplier so the threshold works for any multiplier setting.
  const spot = state.scenario.spot;
  const mult = state.scenario.multiplier;
  const farA = portfolioResult(spot * 3.5, horizon).pnl;
  const farB = portfolioResult(spot * 4, horizon).pnl;
  const dSpot = spot * 4 - spot * 3.5;
  const slopePerContract = dSpot > 0 ? (farB - farA) / (dSpot * mult) : 0;
  // >$0.50 PnL per $1 spot move per 1 contract → effectively linear, treat as unbounded
  if (slopePerContract > 0.5) maxProfit = Infinity;
  if (slopePerContract < -0.5) maxLoss = -Infinity;

  const current = portfolioResult(spot, state.scenario.daysElapsed);
  return {
    maxProfit,
    maxLoss,
    breakevens: findBreakevens(points),
    currentPnl: current.pnl,
    netValue: current.entryValue,
    greeks: current.greeks,
  };
}

// Stress Test Matrix: Spot × IV scenarios
function runStressTest() {
  const spotShifts = [-0.10, -0.05, 0, 0.05, 0.10]; // -10%, -5%, 0%, +5%, +10%
  const ivShifts = [-0.30, 0, 0.30, 0.50]; // -30%, 0%, +30%, +50%

  const baseSpot = state.scenario.spot;
  const baseDaysElapsed = state.scenario.daysElapsed;
  const baseIvShift = state.scenario.ivShift;

  const results = [];

  for (const spotShift of spotShifts) {
    for (const ivShift of ivShifts) {
      const testSpot = baseSpot * (1 + spotShift);
      const testIvShift = baseIvShift + ivShift;
      const testScenario = { ...state.scenario, ivShift: testIvShift };

      const result = portfolioResult(testSpot, baseDaysElapsed, testScenario);

      results.push({
        spotShift: spotShift * 100, // Convert to percentage
        ivShift: ivShift * 100,
        spot: testSpot,
        pnl: result.pnl,
        delta: result.greeks.delta,
        gamma: result.greeks.gamma,
        vega: result.greeks.vega,
        theta: result.greeks.theta
      });
    }
  }

  // Find worst and best case
  const sortedByPnl = [...results].sort((a, b) => a.pnl - b.pnl);
  const worstCase = sortedByPnl[0];
  const bestCase = sortedByPnl[sortedByPnl.length - 1];

  return {
    matrix: results,
    worstCase,
    bestCase,
    spotShifts: spotShifts.map(s => s * 100), // Convert to percentage for display
    ivShifts: ivShifts.map(iv => iv * 100)
  };
}

// Greek Shock Estimate (simplified VaR-like calculation)
// Note: This is educational estimate, not professional VaR
function calculateGreekShockEstimate() {
  const metrics = riskMetrics();
  const spot = state.scenario.spot;

  // Assume typical daily moves
  const dailySpotMove = 0.02; // 2% daily move (typical for equity)
  const dailyIvMove = 0.02; // 2 percentage points IV move

  // Delta risk: how much P&L changes with spot move
  const deltaRisk = Math.abs(metrics.greeks.delta * spot * dailySpotMove);

  // Gamma risk: second-order effect
  const gammaRisk = 0.5 * Math.abs(metrics.greeks.gamma) * Math.pow(spot * dailySpotMove, 2);

  // Vega risk: how much P&L changes with IV move
  const vegaRisk = Math.abs(metrics.greeks.vega * dailyIvMove);

  // Theta risk: time decay (1 day)
  const thetaRisk = Math.abs(metrics.greeks.theta);

  // Total estimated 1-day risk (simplified, not true VaR)
  const totalRisk = deltaRisk + gammaRisk + vegaRisk;

  return {
    deltaRisk,
    gammaRisk,
    vegaRisk,
    thetaRisk,
    totalRisk,
    note: "教育性估算 - 非专业VaR计算"
  };
}

// Put-Call Parity checker (teaching tool)
function checkPutCallParity(callPrice, putPrice, spot, strike, dte, rate) {
  const t = dte / 365;
  const syntheticForward = callPrice - putPrice;
  const theoreticalForward = spot - strike * Math.exp(-rate * t);
  const mispricing = syntheticForward - theoreticalForward;

  let interpretation = "";
  let arbitrageTrade = "";

  if (Math.abs(mispricing) < 0.05) {
    interpretation = "Put-Call Parity基本成立，无明显套利机会";
    arbitrageTrade = "无套利";
  } else if (mispricing > 0) {
    interpretation = "Synthetic forward被高估";
    arbitrageTrade = "卖出synthetic (卖call + 买put)，买入股票";
  } else {
    interpretation = "Synthetic forward被低估";
    arbitrageTrade = "买入synthetic (买call + 卖put)，卖出股票";
  }

  return {
    syntheticForward,
    theoreticalForward,
    mispricing,
    mispricingPercent: (mispricing / theoreticalForward) * 100,
    interpretation,
    arbitrageTrade,
    note: "教学工具 - 实际套利需考虑bid-ask、交易成本、提前行权风险"
  };
}


function svgPath(points, xScale, yScale) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.spot).toFixed(1)} ${yScale(point.value).toFixed(1)}`).join(" ");
}

function chartSvg(series, options = {}) {
  const width = options.width || 720;
  const height = options.height || 430;
  const pad = options.pad || { left: 54, right: 18, top: 18, bottom: 34 };
  const allPoints = series.flatMap((item) => item.points);
  const minX = Math.min(...allPoints.map((point) => point.spot));
  const maxX = Math.max(...allPoints.map((point) => point.spot));
  let minY = Math.min(...allPoints.map((point) => point.value));
  let maxY = Math.max(...allPoints.map((point) => point.value));
  if (Math.abs(maxY - minY) < 0.5) {
    maxY += 5;
    minY -= 5;
  }
  const padding = (maxY - minY) * 0.14;
  minY -= padding;
  maxY += padding;
  if (minY > 0) minY = 0;
  if (maxY < 0) maxY = 0;

  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const xScale = (spot) => pad.left + ((spot - minX) / (maxX - minX || 1)) * plotW;
  const yScale = (value) => pad.top + ((maxY - value) / (maxY - minY || 1)) * plotH;
  const xTicks = [minX, minX + (maxX - minX) * 0.25, minX + (maxX - minX) * 0.5, minX + (maxX - minX) * 0.75, maxX];
  const yTicks = [minY, 0, maxY].filter((value, index, arr) => arr.findIndex((item) => Math.abs(item - value) < 0.01) === index);

  const grid = [
    ...xTicks.map((tick) => `<line class="grid-line" x1="${xScale(tick).toFixed(1)}" y1="${pad.top}" x2="${xScale(tick).toFixed(1)}" y2="${height - pad.bottom}"/><text class="tick-label" x="${xScale(tick).toFixed(1)}" y="${height - 10}" text-anchor="middle">${tick.toFixed(0)}</text>`),
    ...yTicks.map((tick) => `<line class="grid-line" x1="${pad.left}" y1="${yScale(tick).toFixed(1)}" x2="${width - pad.right}" y2="${yScale(tick).toFixed(1)}"/><text class="tick-label" x="${pad.left - 8}" y="${(yScale(tick) + 3).toFixed(1)}" text-anchor="end">${tick.toFixed(0)}</text>`),
  ].join("");

  const zeroLine = `<line class="zero-line" x1="${pad.left}" y1="${yScale(0).toFixed(1)}" x2="${width - pad.right}" y2="${yScale(0).toFixed(1)}"/>`;
  const spotLine = `<line class="spot-line" x1="${xScale(state.scenario.spot).toFixed(1)}" y1="${pad.top}" x2="${xScale(state.scenario.spot).toFixed(1)}" y2="${height - pad.bottom}"/>`;
  const breakLines = (options.breakevens || [])
    .map((spot) => `<line class="break-line" x1="${xScale(spot).toFixed(1)}" y1="${pad.top}" x2="${xScale(spot).toFixed(1)}" y2="${height - pad.bottom}"/>`)
    .join("");
  const paths = series.map((item) => {
    const legAttr = item.legIndex != null ? ` data-leg-index="${item.legIndex}"` : "";
    return `<path class="${item.className}" d="${svgPath(item.points, xScale, yScale)}"${legAttr}/>`;
  }).join("");

  // Profit/loss area shading from expiry curve points
  let profitArea = "";
  let lossArea = "";
  const expiryPts = series.find(s => s.className === "payoff-expiry")?.points;
  if (expiryPts && expiryPts.length > 1) {
    // Find zero crossings
    const zeroCrossings = [];
    for (let i = 0; i < expiryPts.length - 1; i++) {
      const a = expiryPts[i]; const b = expiryPts[i + 1];
      if ((a.value <= 0 && b.value > 0) || (a.value >= 0 && b.value < 0)) {
        const t = Math.abs(a.value) / (Math.abs(a.value) + Math.abs(b.value));
        zeroCrossings.push(a.spot + (b.spot - a.spot) * t);
      }
    }
    const buildArea = (signFilter, className) => {
      const boundaries = [minX, ...zeroCrossings.sort((a,b)=>a-b), maxX];
      let result = "";
      for (let i = 0; i < boundaries.length - 1; i++) {
        const mid = (boundaries[i] + boundaries[i+1]) / 2;
        // Find nearest expiry point to determine sign at mid
        const nearest = expiryPts.reduce((prev, curr) =>
          Math.abs(curr.spot - mid) < Math.abs(prev.spot - mid) ? curr : prev);
        if (signFilter(nearest.value)) {
          const x1 = xScale(boundaries[i]); const x2 = xScale(boundaries[i+1]);
          const y0 = yScale(0);
          const topPts = expiryPts.filter(p => p.spot >= boundaries[i] && p.spot <= boundaries[i+1]);
          if (topPts.length >= 2) {
            const areaPath = [
              `M ${x1.toFixed(1)} ${y0.toFixed(1)}`,
              ...topPts.map(p => `L ${xScale(p.spot).toFixed(1)} ${yScale(p.value).toFixed(1)}`),
              `L ${x2.toFixed(1)} ${y0.toFixed(1)} Z`,
            ].join(" ");
            result += `<path class="${className}" d="${areaPath}"/>`;
          }
        }
      }
      return result;
    };
    profitArea = buildArea((v) => v > 0, "profit-area");
    lossArea = buildArea((v) => v < 0, "loss-area");
  }

  // Breakeven labels
  const breakLabels = (options.breakevens || [])
    .map((spot) => {
      const bx = xScale(spot).toFixed(1);
      const by = (yScale(0) - 14).toFixed(1);
      return `<text class="break-label" x="${bx}" y="${by}" text-anchor="middle">$${spot.toFixed(2)}</text>`;
    })
    .join("");

  const overlay = options.interactive
    ? `<rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="transparent" data-chart-overlay="true"/>`
    : "";

  // Expose computed scales for external tooltip use
  if (options.onRender) {
    options.onRender({ xScale, yScale, plotW, plotH, pad, width, height, minX, maxX, minY, maxY });
  }

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.label || "chart")}">
    ${grid}${profitArea}${lossArea}${zeroLine}${breakLines}${breakLabels}${spotLine}${paths}${overlay}
    <text class="axis-label" x="${width - 18}" y="${height - 10}" text-anchor="end">标的价格</text>
    <text class="axis-label" x="${pad.left}" y="12">${escapeHtml(options.yLabel || "值")}</text>
  </svg>`;
}

function miniChartSvg(panel) {
  const points = curveData(panel.key, state.scenario.daysElapsed, 120, state.scenario.priceRange);
  return chartSvg([{ points, className: panel.className }], {
    width: 360,
    height: 178,
    pad: { left: 46, right: 12, top: 14, bottom: 28 },
    label: panel.label,
    yLabel: panel.label,
  });
}

function renderFilters() {
  document.getElementById("filterRow").innerHTML = filters
    .map((filter) => `<button class="filter-pill ${filter === state.filter ? "is-active" : ""}" type="button" data-filter="${escapeHtml(filter)}">${escapeHtml(filter)}</button>`)
    .join("");
}

function visibleStrategies() {
  const search = state.search.trim().toLowerCase();
  return STRATEGIES.filter((strategy) => {
    const filterOk =
      state.filter === "全部" ||
      (state.filter === "原站" && strategy.source === "原站") ||
      (state.filter === "补充" && strategy.source === "补充") ||
      (DIFFICULTY_LEVELS.includes(state.filter) && DIFF_LABEL[strategy.difficulty] === state.filter) ||
      strategy.category === state.filter;
    const haystack = [strategy.name, strategy.cn, strategy.category, strategy.outlook, strategy.difficulty, strategy.money, strategy.risk, strategy.when]
      .join(" ")
      .toLowerCase();
    return filterOk && (!search || haystack.includes(search));
  });
}

function renderStrategyList() {
  const strategies = visibleStrategies();
  document.getElementById("originCount").textContent = STRATEGIES.filter((strategy) => strategy.source === "原站").length;
  document.getElementById("extraCount").textContent = STRATEGIES.filter((strategy) => strategy.source === "补充").length;
  document.getElementById("visibleCount").textContent = strategies.length;
  document.getElementById("strategyList").innerHTML = strategies
    .map(
      (strategy) => `<button class="strategy-item ${strategy.id === state.selectedId ? "is-selected" : ""}" type="button" data-strategy="${strategy.id}">
        <span><span class="strategy-name">${escapeHtml(strategy.name)}</span><span class="strategy-description">${escapeHtml(strategy.cn)} · ${escapeHtml(strategy.outlook)}</span></span>
        <span class="strategy-tags">
          <span class="diff-badge ${DIFF_CLASS[strategy.difficulty] || ""}" title="${DIFF_LABEL[strategy.difficulty] || strategy.difficulty}"></span>
          <span class="${strategy.source === "补充" ? "source-extra" : ""}">${escapeHtml(strategy.category)}</span>
        </span>
      </button>`,
    )
    .join("");
}

function renderTopbar() {
  const strategy = selectedStrategy();
  document.getElementById("strategyMeta").textContent = `${strategy.source} / ${strategy.category} / ${strategy.outlook} / ${strategy.difficulty}`;
  document.getElementById("strategyTitle").textContent = strategy.name;
  document.getElementById("strategySubtitle").textContent = strategy.cn;

  // Learning path bar
  const path = learningPathFor(strategy);
  const diffProg = difficultyProgress(strategy.difficulty);
  const doneMark = isCompleted(strategy.id);
  const markBtn = document.getElementById("markCompletedBtn");
  if (markBtn) {
    markBtn.textContent = doneMark ? "✓ 已理解" : "○ 标记已理解";
    markBtn.style.opacity = doneMark ? "1" : "0.6";
  }

  let pathHTML = "";
  if (path.prev) {
    pathHTML += `<button class="path-link" type="button" data-strategy="${path.prev.id}" title="${escapeHtml(path.prev.cn)}">← ${escapeHtml(path.prev.name)} <span class="path-diff">${DIFF_LABEL[path.prev.difficulty] || path.prev.difficulty}</span></button>`;
  }
  pathHTML += `<span class="path-current">${escapeHtml(strategy.name)} <span class="path-diff">${DIFF_LABEL[strategy.difficulty] || strategy.difficulty}</span> · ${diffProg.completed}/${diffProg.total} 已学</span>`;
  if (path.next) {
    pathHTML += `<button class="path-link" type="button" data-strategy="${path.next.id}" title="${escapeHtml(path.next.cn)}">${escapeHtml(path.next.name)} <span class="path-diff">${DIFF_LABEL[path.next.difficulty] || path.next.difficulty}</span> →</button>`;
  }
  document.getElementById("learningPathBar").innerHTML = pathHTML;
}

function renderScenarioControls() {
  const scenario = state.scenario;
  const tips = {
    rate: "更高利率 → Call更贵(Put更便宜)，因持有Call可推迟买入股票赚更多利息",
    dividend: "更高股息 → Call更便宜(Put更贵)，因持有股票的人能收到股息而期权买方不能",
    multiplier: "美股期权通常为100，代表每份合约对应100股",
    priceRange: "控制图表X轴范围——增大可看到更远端的盈亏情况",
  };
  document.getElementById("scenarioControls").innerHTML = [
    ["spot", "当前价格", scenario.spot, "0.5"],
    ["priceRange", "图表范围(%)", scenario.priceRange, "5"],
    ["rate", "利率(%)", scenario.rate * 100, "0.25"],
    ["dividend", "股息率(%)", scenario.dividend * 100, "0.25"],
    ["multiplier", "合约乘数", scenario.multiplier, "1"],
  ]
    .map(([key, label, value, step]) => {
      const tip = tips[key] ? ` title="${tips[key]}"` : "";
      return `<label class="control-field"><span${tip}>${label}${tips[key] ? " ⓘ" : ""}</span><input type="number" step="${step}" data-scenario="${key}" value="${formatNumber(value, key === "multiplier" ? 0 : 2)}" /></label>`;
    })
    .join("");
}

function renderSliders() {
  const maxDays = maxDte();
  state.scenario.daysElapsed = clamp(state.scenario.daysElapsed, 0, maxDays);
  const timeSlider = document.getElementById("timeSlider");
  const ivSlider = document.getElementById("ivShiftSlider");
  timeSlider.max = String(Math.round(maxDays));
  timeSlider.value = String(Math.round(state.scenario.daysElapsed));
  ivSlider.value = String(Math.round(state.scenario.ivShift * 100));
  document.getElementById("ivShiftReadout").textContent = `${Math.round(state.scenario.ivShift * 100)}%`;
  document.getElementById("dateReadout").textContent = `${Math.round(state.scenario.daysElapsed)} / ${Math.round(maxDays)} DTE`;
}

// --- Time decay animation ---
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
  const playBtn = document.getElementById("playBtn");
  if (playBtn) playBtn.textContent = "⏸";
}

function stopTimeAnimation() {
  if (timeAnimationId) {
    clearInterval(timeAnimationId);
    timeAnimationId = null;
  }
  const playBtn = document.getElementById("playBtn");
  if (playBtn) playBtn.textContent = "▶";
}

function resetTimeAnimation() {
  stopTimeAnimation();
  state.scenario.daysElapsed = 0;
  refreshAnalysis({ controls: false, legs: false });
}

let chartScale = null;

function renderMainChart() {
  const horizon = chartHorizon();
  const currentCurve = curveData("risk", state.scenario.daysElapsed, 170, state.scenario.priceRange);
  const expiryCurve = curveData("risk", horizon, 170, state.scenario.priceRange);
  const baselineScenario = { ...state.scenario, ivShift: 0 };
  const baseline = priceRange(170, state.scenario.priceRange).map((spot) => ({
    spot,
    value: portfolioResult(spot, 0, baselineScenario).pnl,
  }));
  const breakevens = findBreakevens(expiryCurve);

  // Probability cone: lognormal PDF from average IV
  const isProbability = chartViewMode === "probability";
  let probCurve = null;
  let probStats = null;
  if (isProbability) {
    const optLegs = state.legs.filter(l => l.type === "option");
    const avgIV = optLegs.length ? optLegs.reduce((s, l) => s + (Number(l.iv) || 0.32), 0) / optLegs.length : 0.32;
    const T = Math.max(horizon, 1) / 365;
    const S0 = state.scenario.spot;
    const r = state.scenario.rate;
    const q = state.scenario.dividend;
    const sigma = avgIV;
    const mu = Math.log(S0) + (r - q - 0.5 * sigma * sigma) * T;
    const sd = Math.max(sigma * Math.sqrt(T), 1e-6);

    // Compute probability within profit zone
    const probRange = priceRange(200, state.scenario.priceRange);
    const pdfPoints = probRange.map(spot => {
      const x = spot > 0.01 ? spot : 0.01;
      const d = (Math.log(x) - mu) / sd;
      const pdf = Math.exp(-0.5 * d * d) / (x * sd * Math.sqrt(2 * Math.PI));
      return { spot, value: pdf };
    });
    const maxPdf = Math.max(...pdfPoints.map(p => p.value));
    // Scale so peak is ~35% of P&L range height
    const pnlRange = Math.max(Math.abs(maxY(expiryCurve)), Math.abs(minY(expiryCurve)), 10);
    const scale = pnlRange * 0.35 / (maxPdf || 0.001);
    probCurve = pdfPoints.map(p => ({ spot: p.spot, value: p.value * scale }));
    // Probability of profit: evaluate each breakeven interval instead of assuming
    // profit is always between two breakevens.
    const probabilityBreakevens = findBreakevens(curveData("risk", horizon, 420, 250));
    const profitBreaks = [...probabilityBreakevens].filter(b => b > 0).sort((a, b) => a - b);
    const cdfAt = (spot) => spot === Infinity ? 1 : normCdf((Math.log(Math.max(spot, 0.01)) - mu) / sd);
    const probabilityMass = (lower, upper) => Math.max(0, cdfAt(upper) - cdfAt(lower));
    const sampleForInterval = (lower, upper, index) => {
      if (lower <= 0 && upper !== Infinity) return Math.max(0.01, upper * 0.5);
      if (upper === Infinity) {
        const prev = profitBreaks[index - 2] || 0;
        const step = Math.max(1, lower - prev, S0 * 0.1);
        return lower + step;
      }
      return (lower + upper) / 2;
    };

    let probProfit = 0;
    if (!profitBreaks.length) {
      probProfit = portfolioResult(S0, horizon, state.scenario).pnl >= 0 ? 100 : 0;
    } else {
      const boundaries = [0, ...profitBreaks, Infinity];
      let probability = 0;
      for (let i = 0; i < boundaries.length - 1; i++) {
        const lower = boundaries[i];
        const upper = boundaries[i + 1];
        const sampleSpot = sampleForInterval(lower, upper, i);
        if (portfolioResult(sampleSpot, horizon, state.scenario).pnl >= 0) {
          probability += probabilityMass(lower, upper);
        }
      }
      probProfit = Math.round(clamp(probability, 0, 1) * 100);
    }
    probStats = { probProfit, sigma, T };
  }

  function maxY(curve) { return Math.max(...curve.map(p => p.value)); }
  function minY(curve) { return Math.min(...curve.map(p => p.value)); }

  // Per-leg mode: build individual leg curves + combined overlay
  const isPerLeg = chartViewMode === "perLeg";
  const allLegCurves = isPerLeg ? perLegCurves(horizon, 170, state.scenario.priceRange) : [];
  const visibleLegCurves = allLegCurves.filter((_, i) => !hiddenLegs.has(i));
  // Combined PnL computed from VISIBLE leg curves only
  const combinedCurve = isPerLeg && visibleLegCurves.length
    ? visibleLegCurves[0].points.map((_, j) => {
        const spot = visibleLegCurves[0].points[j].spot;
        const value = visibleLegCurves.reduce((sum, lc) => sum + lc.points[j].value, 0);
        return { spot, value };
      })
    : null;

  // Build series array
  let series;
  if (isPerLeg) {
    series = [
      { points: baseline, className: "payoff-entry" },
      ...visibleLegCurves.map((lc) => ({ points: lc.points, className: `payoff-leg-${lc.legIndex}`, legIndex: lc.legIndex })),
      ...(combinedCurve ? [{ points: combinedCurve, className: "payoff-leg-combined" }] : []),
    ];
  } else if (isProbability && probCurve) {
    series = [
      { points: baseline, className: "payoff-entry" },
      { points: expiryCurve, className: "payoff-expiry" },
      { points: currentCurve, className: "payoff-current" },
      { points: probCurve, className: "payoff-probability" },
    ];
  } else {
    series = [
      { points: baseline, className: "payoff-entry" },
      { points: expiryCurve, className: "payoff-expiry" },
      { points: currentCurve, className: "payoff-current" },
    ];
  }

  // Legend
  if (isPerLeg) {
    const legLegend = allLegCurves.map((lc, i) => {
      const checked = hiddenLegs.has(i) ? "" : "checked";
      return `<label class="legend-item leg-check-label" style="color: ${lc.color};cursor:pointer">
        <input type="checkbox" data-leg-toggle="${i}" ${checked} style="accent-color:${lc.color};margin:0 4px 0 0;vertical-align:middle" />
        <span class="legend-line" style="background:${lc.color}"></span>${escapeHtml(lc.label)}
      </label>`;
    }).join("");
    document.getElementById("chartLegend").innerHTML = `
      <span class="legend-item" style="color: var(--muted)"><span class="legend-line dashed"></span>开仓日</span>
      ${legLegend}
      <span class="legend-item" style="color: #fff"><span class="legend-line" style="background:#fff"></span>组合</span>`;
  } else if (isProbability) {
    const pp = probStats?.probProfit;
    const probText = pp != null ? `盈利概率约 ${pp}%` : "";
    document.getElementById("chartLegend").innerHTML = `
      <span class="legend-item" style="color: var(--cyan)"><span class="legend-line"></span>当前情景</span>
      <span class="legend-item" style="color: var(--green)"><span class="legend-line"></span>到期</span>
      <span class="legend-item" style="color: var(--muted)"><span class="legend-line dashed"></span>开仓日</span>
      <span class="legend-item" style="color: var(--amber)"><span class="legend-line dashed"></span>现价 / 盈亏平衡</span>
      <span class="legend-item" style="color: var(--violet)"><span class="legend-line" style="background:var(--violet);opacity:.5"></span>概率分布 ${probText}</span>`;
  } else {
    document.getElementById("chartLegend").innerHTML = `
      <span class="legend-item" style="color: var(--cyan)"><span class="legend-line"></span>当前情景</span>
      <span class="legend-item" style="color: var(--green)"><span class="legend-line"></span>到期</span>
      <span class="legend-item" style="color: var(--muted)"><span class="legend-line dashed"></span>开仓日</span>
      <span class="legend-item" style="color: var(--amber)"><span class="legend-line dashed"></span>现价 / 盈亏平衡</span>`;
  }

  // Store curve data + horizon for tooltip lookup
  const tooltipData = { horizon, current: currentCurve, expiry: expiryCurve, baseline, legCurves: visibleLegCurves, allLegCurves, isPerLeg };

  document.getElementById("mainChart").innerHTML = chartSvg(
    series,
    { label: "主损益图", yLabel: "PnL", breakevens: isPerLeg ? findBreakevens(combinedCurve) : breakevens, interactive: true,
      onRender: (scale) => { chartScale = scale; chartScale._ttData = tooltipData; } },
  );

  // Attach tooltip mousemove handler
  const chartEl = document.getElementById("mainChart");
  const tooltip = document.getElementById("chartTooltip");
  // Hover highlight: track which leg path is hovered → highlight editor card
  let hoveredLegIdx = -1;
  chartEl.onmousemove = (e) => {
    const cs = chartScale;
    // Highlight leg editor card when hovering a per-leg curve
    if (chartViewMode === "perLeg") {
      const legPath = e.target.closest("path[data-leg-index]");
      const newIdx = legPath ? Number(legPath.dataset.legIndex) : -1;
      if (newIdx !== hoveredLegIdx) {
        // Remove previous highlight
        if (hoveredLegIdx >= 0) {
          const prevCard = document.querySelector(`.leg-row[data-leg-card="${hoveredLegIdx}"]`);
          if (prevCard) prevCard.classList.remove("leg-highlight");
        }
        // Add new highlight
        if (newIdx >= 0) {
          const card = document.querySelector(`.leg-row[data-leg-card="${newIdx}"]`);
          if (card) card.classList.add("leg-highlight");
        }
        hoveredLegIdx = newIdx;
      }
    }
    if (!cs) return;
    const svg = chartEl.querySelector("svg");
    if (!svg) return;
    const svgRect = svg.getBoundingClientRect();
    const mouseSvgX = ((e.clientX - svgRect.left) / svgRect.width) * cs.width;
    if (mouseSvgX < cs.pad.left || mouseSvgX > cs.width - cs.pad.right) {
      tooltip.hidden = true;
      return;
    }
    const spot = cs.minX + ((mouseSvgX - cs.pad.left) / cs.plotW) * (cs.maxX - cs.minX);
    const data = cs._ttData;
    const expiryPnl = portfolioResult(spot, data.horizon, state.scenario).pnl;
    const currentPnl = portfolioResult(spot, state.scenario.daysElapsed, state.scenario).pnl;
    const entryPnl = portfolioResult(spot, 0, { ...state.scenario, ivShift: 0 }).pnl;

    let html = `
      <div>现货: <strong>$${spot.toFixed(2)}</strong></div>
      <div>到期盈亏: <strong>${formatMoney(expiryPnl)}</strong></div>
      <div>当前盈亏: <strong>${formatMoney(currentPnl)}</strong></div>
      <div>开仓盈亏: <strong>${formatMoney(entryPnl)}</strong></div>`;
    if (data.isPerLeg && data.legCurves) {
      html += `<div style="margin-top:4px;border-top:1px solid var(--line);padding-top:4px">`;
      for (const lc of data.legCurves) {
        const nearest = lc.points.reduce((p, c) => Math.abs(c.spot - spot) < Math.abs(p.spot - spot) ? c : p);
        html += `<div style="color:${lc.color}">${escapeHtml(lc.label)}: <strong>${formatMoney(nearest.value)}</strong></div>`;
      }
      html += `</div>`;
    }
    tooltip.hidden = false;
    tooltip.style.left = Math.min(e.clientX + 14, window.innerWidth - 220) + "px";
    tooltip.style.top = Math.max(10, e.clientY - 100) + "px";
    tooltip.innerHTML = html;
  };
  chartEl.onmouseleave = () => { tooltip.hidden = true; };

  // Update toggle button states
  ["viewCombined", "viewPerLeg", "viewProbability"].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const mode = id === "viewPerLeg" ? "perLeg" : id === "viewProbability" ? "probability" : "combined";
    btn.classList.toggle("active", chartViewMode === mode);
  });
}

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

function renderMetrics() {
  const metrics = riskMetrics();
  const entries = [
    ["最大收益", formatMoney(metrics.maxProfit), metrics.maxProfit >= 0 ? "positive" : ""],
    ["最大亏损", formatMoney(metrics.maxLoss), "negative"],
    ["盈亏平衡", metrics.breakevens.length ? metrics.breakevens.map((value) => value.toFixed(2)).join(" / ") : "n/a", ""],
    ["当前 PnL", formatMoney(metrics.currentPnl), metrics.currentPnl >= 0 ? "positive" : "negative"],
    ["净初始价值", formatMoney(metrics.netValue), ""],
    ["Delta", formatNumber(metrics.greeks.delta), ""],
    ["Gamma", formatNumber(metrics.greeks.gamma, 4), ""],
    ["Theta/日", formatMoney(metrics.greeks.theta), metrics.greeks.theta >= 0 ? "positive" : "negative"],
    ["Vega/1%", formatMoney(metrics.greeks.vega), metrics.greeks.vega >= 0 ? "positive" : "negative"],
    ["Rho/1%", formatMoney(metrics.greeks.rho), ""],
  ];
  document.getElementById("metricsGrid").innerHTML = entries
    .map(([label, value, klass]) => `<div class="metric ${klass}"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join("");
}

function legTitle(leg) {
  if (leg.type === "stock") return `${leg.side === "long" ? "Long" : "Short"} Stock`;
  return `${leg.side === "long" ? "Long" : "Short"} ${leg.qty} ${leg.optionType.toUpperCase()} @ ${leg.strike}`;
}

function legColorBar(index) {
  const color = LEG_COLORS[index % LEG_COLORS.length];
  return `<span class="leg-color-bar" style="background:${color};min-height:100%" aria-hidden="true"></span>`;
}

function renderLegsEditor() {
  const moneynessTip = "ITM=实值(有内在价值), ATM=平值(≈现价), OTM=虚值(仅有时间价值)";
  document.getElementById("legsEditor").innerHTML = state.legs
    .map((leg, index) => {
      const bar = legColorBar(index);
      if (leg.type === "stock") {
        return `<div class="leg-row" data-leg-card="${index}" style="display:flex;gap:10px">
          ${bar}
          <div style="flex:1;min-width:0">
          <div class="leg-title"><strong>${escapeHtml(legTitle(leg))}</strong><span class="leg-type">Stock</span></div>
          <div class="leg-grid">
            <label class="leg-field"><span>方向</span><select data-leg="${index}" data-key="side"><option value="long" ${leg.side === "long" ? "selected" : ""}>Long</option><option value="short" ${leg.side === "short" ? "selected" : ""}>Short</option></select></label>
            <label class="leg-field"><span>数量</span><input type="number" step="1" data-leg="${index}" data-key="qty" value="${leg.qty}" /></label>
            <label class="leg-field"><span>入场价</span><input type="number" step="0.5" data-leg="${index}" data-key="entry" value="${leg.entry}" /></label>
          </div>
          </div>
        </div>`;
      }
      return `<div class="leg-row" data-leg-card="${index}" style="display:flex;gap:10px">
        ${bar}
        <div style="flex:1;min-width:0">
        <div class="leg-title"><strong>${escapeHtml(legTitle(leg))}</strong><span class="leg-type">Option</span></div>
        <div class="leg-grid">
          <label class="leg-field"><span>方向</span><select data-leg="${index}" data-key="side"><option value="long" ${leg.side === "long" ? "selected" : ""}>Long</option><option value="short" ${leg.side === "short" ? "selected" : ""}>Short</option></select></label>
          <label class="leg-field"><span>类型</span><select data-leg="${index}" data-key="optionType"><option value="call" ${leg.optionType === "call" ? "selected" : ""}>Call</option><option value="put" ${leg.optionType === "put" ? "selected" : ""}>Put</option></select></label>
          <label class="leg-field"><span>数量</span><input type="number" step="1" data-leg="${index}" data-key="qty" value="${leg.qty}" /></label>
          <label class="leg-field"><span title="${moneynessTip}">行权价 ⓘ</span><input type="number" step="0.5" data-leg="${index}" data-key="strike" value="${leg.strike}" title="${moneynessTip}" aria-label="行权价 (${moneynessTip})" /></label>
          <label class="leg-field"><span>DTE</span><input type="number" step="1" data-leg="${index}" data-key="dte" value="${leg.dte}" /></label>
          <label class="leg-field"><span>IV(%)</span><input type="number" step="1" data-leg="${index}" data-key="iv" value="${formatNumber((leg.iv || 0) * 100, 0)}" /></label>
        </div>
        </div>
      </div>`;
    })
    .join("");
}

function textTone(strategy) {
  const value = `${strategy.name} ${strategy.cn} ${strategy.category} ${strategy.outlook}`.toLowerCase();
  return {
    bullish: /bull|看涨|偏多|多头|protected bullish|income/.test(value),
    bearish: /bear|看跌|偏空|空头|bearish hedge/.test(value),
    neutral: /neutral|中性|震荡|区间|收租/.test(value),
    bigMove: /big move|波动|突破|tail|straddle|strangle|backspread|strap|strip|guts|inverse/.test(value),
    income: strategy.category === "收租" || /short|covered|cash-secured|jade|wheel/.test(value),
    calendar: strategy.category === "跨期" || /calendar|diagonal|poor man/.test(value),
    synthetic: strategy.category === "合成" || /synthetic|combo|risk reversal|box/.test(value),
    stock: state.legs.some((leg) => leg.type === "stock"),
  };
}

function findStrategyById(id) {
  return STRATEGIES.find((strategy) => strategy.id === id);
}

function uniqueExisting(ids, currentId) {
  return ids.filter((id, index, arr) => id !== currentId && arr.indexOf(id) === index && findStrategyById(id));
}

function relatedIdsFor(strategy) {
  const explicit = {
    "long-call": ["bull-call-spread", "diagonal-call-spread", "call-ratio-backspread", "long-combo", "poor-man-s-covered-call"],
    "long-put": ["bear-put-spread", "protective-put", "put-ratio-backspread", "synthetic-put", "short-synthetic-future"],
    "covered-call": ["collar", "poor-man-s-covered-call", "covered-short-strangle", "stock-repair-covered-ratio-spread", "seagull-fence"],
    "cash-secured-put": ["wheel-strategy", "short-put", "bull-put-spread", "jade-lizard", "put-broken-wing"],
    "protective-put": ["collar", "seagull-fence", "bear-put-spread", "long-put", "synthetic-put"],
    "bull-put-spread": ["cash-secured-put", "iron-condor", "jade-lizard", "double-bull-spread", "put-broken-wing"],
    "bear-call-spread": ["short-call", "iron-condor", "reverse-jade-lizard", "double-bear-spread", "call-broken-wing"],
    "iron-condor": ["short-strangle", "iron-butterfly", "double-diagonal", "delta-neutraldelta-中性", "inverse-iron-condor"],
    "iron-butterfly": ["short-straddle", "iron-condor", "long-call-butterfly", "long-put-butterfly", "inverse-iron-butterfly"],
    "straddle": ["strangle", "strip", "strap", "inverse-iron-butterfly", "short-straddle"],
    "strangle": ["straddle", "inverse-iron-condor", "strip", "strap", "short-strangle"],
    "short-straddle": ["iron-butterfly", "short-strangle", "delta-neutraldelta-中性", "vega-套利", "straddle"],
    "short-strangle": ["iron-condor", "short-straddle", "double-diagonal", "delta-neutraldelta-中性", "strangle"],
    "calendar-call-spread": ["diagonal-call-spread", "double-diagonal", "poor-man-s-covered-call", "vega-套利", "short-call-calendar-spread"],
    "calendar-put-spread": ["diagonal-put-spread", "double-diagonal", "vega-套利", "short-put-calendar-spread", "protective-put"],
    "diagonal-call-spread": ["calendar-call-spread", "poor-man-s-covered-call", "covered-call", "bull-call-spread", "double-diagonal"],
    "diagonal-put-spread": ["calendar-put-spread", "bear-put-spread", "protective-put", "double-diagonal", "vega-套利"],
    "long-synthetic-future": ["long-combo", "risk-reversal", "bull-call-spread", "cash-secured-put", "box-spread"],
    "short-synthetic-future": ["short-combo", "risk-reversal", "bear-put-spread", "bear-call-spread", "box-spread"],
    "wheel-strategy": ["cash-secured-put", "covered-call", "collar", "jade-lizard", "poor-man-s-covered-call"],
    "box-spread": ["long-synthetic-future", "short-synthetic-future", "risk-reversal", "long-combo", "short-combo"],
  };
  const generic = {
    "方向": ["long-call", "long-put", "bull-call-spread", "bear-put-spread", "collar"],
    "收租": ["iron-condor", "short-strangle", "bull-put-spread", "bear-call-spread", "jade-lizard"],
    "波动率": ["straddle", "strangle", "inverse-iron-condor", "short-strangle", "vega-套利"],
    "跨期": ["calendar-call-spread", "calendar-put-spread", "diagonal-call-spread", "double-diagonal", "poor-man-s-covered-call"],
    "复杂": ["long-call-butterfly", "long-call-condor", "call-ratio-spread", "put-ratio-spread", "box-spread"],
    "合成": ["long-synthetic-future", "short-synthetic-future", "long-combo", "short-combo", "risk-reversal"],
    "股票覆盖": ["covered-call", "covered-put", "collar", "seagull-fence", "stock-repair-covered-ratio-spread"],
    "向导": ["iron-condor", "double-diagonal", "short-strangle", "wheel-strategy", "vega-套利"],
  };
  return uniqueExisting([...(explicit[strategy.id] || []), ...(generic[strategy.category] || [])], strategy.id).slice(0, 6);
}

function relatedReason(target) {
  const category = target.category;
  if (category === "方向") return "用来把观点改成更纯粹的方向表达，通常更依赖标的价格移动。";
  if (category === "收租") return "用来把买方思路改成卖方收租，重点看 IV、短腿距离和尾部风险。";
  if (category === "波动率") return "用来把判断从方向切到波动大小，适合事件或突破预期。";
  if (category === "跨期") return "用来交易近远月 IV 和 Theta 差异，适合价格目标更稳定的场景。";
  if (category === "合成") return "用来理解或复制正股/融资暴露，重点看保证金、利率和指派。";
  if (category === "股票覆盖") return "适合已有股票或空头股票仓位时，把期权叠加成保护或收租结构。";
  return "相同策略家族的替代结构，用来比较成本、胜率和最大风险。";
}

function playbookFor(strategy) {
  const tone = textTone(strategy);
  const metrics = riskMetrics();
  const netTheta = metrics.greeks.theta;
  const netVega = metrics.greeks.vega;
  const netDelta = metrics.greeks.delta;
  const horizon = Math.round(chartHorizon());
  const shortLegs = state.legs.filter((leg) => leg.type === "option" && leg.side === "short");
  const longLegs = state.legs.filter((leg) => leg.type === "option" && leg.side === "long");
  const strikes = state.legs.filter((leg) => leg.type === "option").map((leg) => leg.strike).sort((a, b) => a - b);
  const strikeText = strikes.length ? `${strikes[0]} 到 ${strikes[strikes.length - 1]}` : "无期权行权价";

  let setup = [];
  if (tone.calendar) {
    setup.push("当你认为近月和远月波动率、时间衰减速度不一致时使用。重点不是只猜方向，而是猜价格会不会留在短腿附近，以及近月 IV 会不会更快回落。");
  } else if (tone.bigMove && !tone.income) {
    setup.push("当你预期会出现明显突破、财报跳空、政策消息或波动率重新定价，但方向不确定或只想买凸性时使用。实际波动要大于市场已经计入的权利金才划算。");
  } else if (tone.income) {
    setup.push("当你认为价格大概率留在某个区间，且 IV 偏高、权利金值得卖时使用。这里赚的是时间价值和 IV 回落，不是追求标的快速单边。短腿越近，租金越高，容错越小。");
  } else if (tone.synthetic) {
    setup.push("当你想复制正股多空、比较 Put-Call parity、降低现金占用或表达风险反转时使用。它看起来是期权，风险往往更接近股票或融资仓位。");
    setup.push(`📐 Put-Call Parity 核心公式：Call − Put = 远期价格。即 C − P = S − K·e^(−rT)。Long Call + Short Put = Long Synthetic Future（等效持有正股）。如果等式两边价格不相等，就存在套利空间（Box Spread 正是利用这个原理）。`);
  } else if (tone.stock) {
    setup.push("当你已经有股票仓位，需要在持有、保护、收租和目标价卖出之间做取舍时使用。股票本身的方向风险仍是主风险，期权只是改变收益分布。");
  } else if (tone.bullish) {
    setup.push("当你有明确上行假设时使用：例如突破平台、回踩支撑后重新放量、财报后预期上修，或行业催化可能推动标的在当前 DTE 内上涨。");
  } else if (tone.bearish) {
    setup.push("当你有明确下行假设时使用：例如跌破关键支撑、盈利预警、估值回落、财报风险，或需要给组合做短期下行保护。");
  } else {
    setup.push("当你认为价格会围绕某个区域运行，且你能接受该结构的最大亏损和流动性成本时使用。先确认目标区间，再确认权利金是否足够补偿风险。");
  }
  setup.push(strategy.when);

  const entry = [];
  if (tone.income) {
    entry.push("优先在 IV Rank/IV Percentile 偏高时开仓；短腿常放在支撑/压力外侧，常见参考是 0.15 到 0.30 Delta，DTE 多用 21 到 45 天。收到的信用必须和最大亏损、保证金占用一起看。");
  } else if (tone.calendar) {
    entry.push("短腿行权价通常放在你认为近月最可能停留的目标价附近；远月腿负责保留 Vega 和时间价值。近月常见 21 到 45 DTE，远月可以 45 到 120 DTE。近远月 IV 差比单个 IV 更重要。");
  } else if (tone.bigMove && longLegs.length >= shortLegs.length) {
    entry.push("买方波动结构更怕贵，适合 IV 没有过度抬升、或你认为真实波动会超过隐含波动的时候。DTE 要覆盖事件窗口，行权价越 OTM 成本越低但需要更大移动。 ");
  } else if (tone.stock) {
    entry.push("先从股票计划倒推：你愿意在哪个价格被卖出、愿意在哪个价格继续买入、最多能承受多大回撤。期权行权价应该服务于这个持仓计划，而不是只看权利金高低。");
  } else {
    entry.push("方向买方通常选 ATM 或略 ITM 提高胜率，选 OTM 降低成本但需要更大的价格移动。DTE 不宜太短，除非你交易的是明确事件；否则 Theta 会让方向判断来不及兑现。 ");
  }
  entry.push(`当前模板的期权行权价范围是 ${strikeText}，主图的到期参考窗口约 ${horizon} 天；你可以先拖 DTE 滑杆看时间衰减，再拖 IV 变动看 Vega 敏感度。`);

  const chartUse = [];
  if (tone.income && !tone.bigMove) {
    chartUse.push(`看绿色到期线的"利润平台"——两短腿之间的平顶区间就是你的盈利区。注意平台宽度和两侧坡度：翼宽则盈利区大但净权利金少，翼窄则权利金多但安全边际小。`);
  } else if (tone.bigMove && !tone.income) {
    chartUse.push(`看绿色到期线的盈亏平衡点距离当前价格有多远。买方波动率策略需要标的移动超过这个距离才能赚钱。拖动 DTE 滑杆能看到时间越少、盈亏平衡点越难触及。`);
  } else if (tone.calendar) {
    chartUse.push(`看到期日线的差异：近月短腿到期后留下远月长腿，重点观察近月到期时远月曲线的位置。拖动 DTE 滑杆到近月到期日附近，能看到日历价差在中间节点的损益状态。`);
  } else if (tone.synthetic) {
    chartUse.push(`合成策略的到期线通常是直线，说明它不依赖波动率或时间，而是在复制一个纯方向头寸。重点看到期线的斜率和截距，这对应合成头寸的等效 Delta 和成本。`);
  } else if (strategy.category === "方向" && strategy.difficulty === "Novice") {
    chartUse.push(`看绿色到期线从哪个现货价开始转正——那就是你的盈亏平衡点。曲线弯曲度反映 Gamma 加速：价格越接近行权价，Delta 变化越快，赚钱加速但亏钱也加速。`);
  } else {
    chartUse.push(`先看主损益图的绿色到期线：它告诉你到期时价格必须到哪里才真的赚钱。当前情景线随 IV、DTE 和价格区间联动，适合观察中途退出而不是只看满到期。`);
  }
  chartUse.push(`再看风险指标：当前 Delta ${formatNumber(netDelta)}，Theta/日 ${formatMoney(netTheta)}，Vega/1% ${formatMoney(netVega)}。Delta 告诉你方向暴露，Theta 告诉你每天时间损耗/收入，Vega 告诉你 IV 变动对净值的影响。`);
  chartUse.push(`拖动 IV 变动滑杆观察 Vega——IV 变化会改变所有期权腿的价值。拖动 DTE 滑杆观察 Theta——时间衰减对买方是敌人、对卖方是朋友。试试用 ▶ 播放按钮看连续时间衰减效果。`);

  const management = [];
  if (tone.income) {
    management.push("收租策略不要贪最后一点权利金。常见做法是权利金回收 50% 到 70% 先落袋；若价格触及短腿、短腿 Delta 快速升高，或亏损达到预设倍数，就滚动、减仓或整体平仓。 ");
  } else if (tone.calendar) {
    management.push("跨期策略要同时管理价格和期限结构。若价格远离短腿，先考虑滚动短腿行权价；若近月 IV 已经回落或事件结束，不要继续把 Vega 仓位拿成方向仓位。 ");
  } else if (tone.bigMove && !tone.income) {
    management.push("买波动策略要在移动或 IV 兑现后分批止盈。若事件结束但价格没动、IV Crush 已经发生，要快速评估剩余权利金是否还值得持有。 ");
  } else if (tone.stock) {
    management.push("股票覆盖策略的管理关键是提前接受结果：上方被叫走是否可以，下方继续持股或加仓是否可以。除息日、提前行权和税务影响需要单独检查。 ");
  } else {
    management.push("方向买方可以用价格目标、权利金亏损比例或假设失效点止损。若方向对但速度慢，可以滚到更远 DTE；若 IV 已经很高，可以考虑改成价差降低 Vega 风险。 ");
  }
  management.push(strategy.manage);

  const pitfalls = [];
  // Strategy-specific pitfalls
  if (strategy.name.includes("Long Call") || strategy.name.includes("Long Put")) {
    pitfalls.push("买太虚值（OTM）的期权虽然便宜但胜率极低。小单试水也要注意 bid-ask 价差，避免隐性成本吃掉潜在利润。");
  } else if (strategy.name.includes("Iron Condor") || strategy.name.includes("Iron Butterfly")) {
    pitfalls.push("腿间距太窄导致盈亏比失衡（赚小钱亏大钱）。翼宽需要同时考虑胜率（宽→高胜率但少赚）和赔率（窄→高赔率但低胜率）。");
  } else if (strategy.name.includes("Straddle") || strategy.name.includes("Strangle")) {
    pitfalls.push("忽略了 IV Crush：即使方向对了，如果实际波动不及市场预期，两个期权可能同时贬值。买入前确认 IV 处于相对低位。");
  } else if (strategy.name.includes("Butterfly")) {
    pitfalls.push("腿间距不对称会导致意外的方向暴露。蝶式的盈利窗口很窄，到期前一周 Gamma 会剧烈变化——不要等到最后一刻才调整。");
  } else if (strategy.name.includes("Calendar") || strategy.name.includes("Diagonal")) {
    pitfalls.push("近远月 IV 变化不对称时，远月保护可能不够。事件驱动型日历价差在事件结束后的 IV Crush 会同时伤害两条腿。");
  } else if (strategy.name.includes("Covered Call") || strategy.name.includes("Wheel")) {
    pitfalls.push("只看权利金不看总回报：持仓的最大风险仍然是股价大跌。不要为了多收权利金而选太近的行权价，否则容易被意外行权。");
  }
  if (shortLegs.length) pitfalls.push("有短腿就有指派、保证金和尾部风险。不要只看胜率，要看最大亏损、流动性和极端跳空。");
  if (longLegs.length && netTheta < 0) pitfalls.push("净 Theta 为负时，时间站在你对面。方向或波动如果不尽快兑现，图上看似有限亏损，实际体验会是持续失血。");
  if (Math.abs(netVega) > 25) pitfalls.push("Vega 暴露较明显。买方怕 IV 回落，卖方怕 IV 继续上升；拖动 IV 变动滑杆能看到这个风险。");
  if (!pitfalls.length) pitfalls.push("最大的坑通常来自仓位过大、成交价差过宽、以及把一个有明确到期逻辑的策略拖成长期持仓。");

  return { setup, entry, chartUse, management, pitfalls };
}

function renderNoteList(lines) {
  return `<ul class="note-list">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

function renderEducation() {
  const strategy = selectedStrategy();
  const playbook = playbookFor(strategy);
  const related = relatedIdsFor(strategy).map(findStrategyById).filter(Boolean);
  const relatedHtml = related.length
    ? `<div class="related-actions">${related
        .map((item) => `<button type="button" data-strategy="${item.id}"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.cn)} · ${escapeHtml(item.category)}</span></button>`)
        .join("")}</div><p class="related-copy">${related.map((item) => `${item.name}: ${relatedReason(item)}`).join(" ")}</p>`
    : `<p>暂无直接关联策略。</p>`;

  const items = [
    ["腿组合", [`当前结构：${state.legs.map(legTitle).join("，")}。`, `合约乘数 ${state.scenario.multiplier}，当前价格 ${formatNumber(state.scenario.spot)}，你可以在右侧腿组合里直接改行权价、DTE、IV 和买卖方向。`], ""],
    ["具体什么场景怎么用", playbook.setup, "wide"],
    ["开仓参数怎么选", playbook.entry, "wide"],
    ["如何看图和 Greeks", playbook.chartUse, "wide"],
    ["管理和调整路径", playbook.management, "wide"],
    ["容易踩坑的地方", playbook.pitfalls, ""],
    ["相关策略联动", relatedHtml, "full related-card", true],
  ];

  document.getElementById("educationGrid").innerHTML = items
    .map(([title, content, klass, raw]) => `<div class="education-item ${klass}"><h4>${escapeHtml(title)}</h4>${raw ? content : renderNoteList(content)}</div>`)
    .join("");
}

// Render Professional Content (Trader Memo)
function renderProfessionalContent() {
  const strategy = selectedStrategy();
  const professionalData = PROFESSIONAL_CONTENT[strategy.id];

  if (!professionalData) {
    // Show message in each section, preserving the container structure
    document.getElementById("exposureBreakdown").innerHTML = `<p class="muted" style="text-align: center; padding: 1rem;">该策略暂无专业内容</p>`;
    document.getElementById("profitLogic").innerHTML = `<p class="muted" style="text-align: center; padding: 1rem;">该策略暂无专业内容</p>`;
    document.getElementById("clientPerspective").innerHTML = `<p class="muted" style="text-align: center; padding: 1rem;">该策略暂无专业内容</p>`;
    document.getElementById("dealerPerspective").innerHTML = `<p class="muted" style="text-align: center; padding: 1rem;">该策略暂无专业内容</p>`;
    return;
  }

  // Exposure Breakdown
  const exposureHtml = `
    <div class="exposure-grid">
      <div class="exposure-item"><strong>方向:</strong> ${professionalData.exposure.directional}</div>
      <div class="exposure-item"><strong>波动率:</strong> ${professionalData.exposure.volatility}</div>
      <div class="exposure-item"><strong>时间:</strong> ${professionalData.exposure.time}</div>
      <div class="exposure-item"><strong>凸性:</strong> ${professionalData.exposure.convexity}</div>
    </div>
  `;
  document.getElementById("exposureBreakdown").innerHTML = exposureHtml;

  // Profit Logic
  const profitHtml = `
    <div class="profit-logic">
      <p><strong>赚钱来源:</strong> ${professionalData.profitLogic.makesMoneyFrom}</p>
      <p><strong>亏钱来源:</strong> ${professionalData.profitLogic.losesMoneyFrom}</p>
      <p><strong>最佳市场环境:</strong> ${professionalData.profitLogic.bestMarketCondition}</p>
      <p><strong>最差情景:</strong> ${professionalData.profitLogic.worstScenario}</p>
    </div>
  `;
  document.getElementById("profitLogic").innerHTML = profitHtml;

  // Client Perspective
  const clientHtml = `
    <div class="client-perspective">
      <p><strong>客户为什么做:</strong></p>
      <ul>${professionalData.clientPerspective.whyClientDoes.map(reason => `<li>${reason}</li>`).join('')}</ul>
      <p><strong>客户类型:</strong> ${professionalData.clientPerspective.clientType}</p>
      <p><strong>适当性:</strong> ${professionalData.clientPerspective.suitability}</p>
    </div>
  `;
  document.getElementById("clientPerspective").innerHTML = clientHtml;

  // Dealer Perspective
  const dealerHtml = `
    <div class="dealer-perspective">
      <p><strong>${professionalData.dealerPerspective.whenDealerSells}</strong></p>
      <p><strong>Exposure:</strong> ${professionalData.dealerPerspective.exposure}</p>
      <p><strong>对冲方法:</strong></p>
      <ul>${professionalData.dealerPerspective.hedging.map(method => `<li>${method}</li>`).join('')}</ul>
      <p><strong>利润来源:</strong> ${professionalData.dealerPerspective.profitSource}</p>
    </div>
  `;
  document.getElementById("dealerPerspective").innerHTML = dealerHtml;
}

// Render Interview Questions
function renderInterviewQuestions() {
  const strategy = selectedStrategy();
  const professionalData = PROFESSIONAL_CONTENT[strategy.id];

  const interviewQuestions = document.getElementById("interviewQuestions");

  if (!professionalData || !professionalData.interviewQuestions) {
    interviewQuestions.innerHTML = `<p class="muted" style="text-align: center; padding: 2rem;">该策略暂无面试问答内容。当前支持12个核心策略的面试问答。</p>`;
    return;
  }

  const questionsHtml = professionalData.interviewQuestions.map((qa, index) => `
    <div class="interview-qa">
      <div class="qa-question">
        <strong>Q${index + 1}:</strong> ${qa.q}
      </div>
      <div class="qa-answer">
        <strong>A:</strong> ${qa.a}
      </div>
    </div>
  `).join('');

  interviewQuestions.innerHTML = questionsHtml;
}

// Render Stress Test Results
function renderStressTestResults() {
  const stressTest = runStressTest();

  // Build matrix table
  let tableHtml = `
    <div class="stress-matrix">
      <table class="stress-table">
        <thead>
          <tr>
            <th>Spot \\ IV</th>
            ${stressTest.ivShifts.map(iv => `<th>${iv > 0 ? '+' : ''}${iv}%</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  stressTest.spotShifts.forEach(spotShift => {
    tableHtml += `<tr><th>${spotShift > 0 ? '+' : ''}${spotShift}%</th>`;
    stressTest.ivShifts.forEach(ivShift => {
      const result = stressTest.matrix.find(r => r.spotShift === spotShift && r.ivShift === ivShift);
      const pnlClass = result.pnl >= 0 ? 'positive' : 'negative';
      tableHtml += `<td class="${pnlClass}" title="Delta: ${formatNumber(result.delta)}, Vega: ${formatNumber(result.vega)}">${formatMoney(result.pnl)}</td>`;
    });
    tableHtml += `</tr>`;
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
    <div class="stress-summary">
      <div class="stress-case worst-case">
        <h4>最差情景</h4>
        <p>Spot ${stressTest.worstCase.spotShift > 0 ? '+' : ''}${stressTest.worstCase.spotShift}%, IV ${stressTest.worstCase.ivShift > 0 ? '+' : ''}${stressTest.worstCase.ivShift}%</p>
        <p class="large negative">${formatMoney(stressTest.worstCase.pnl)}</p>
      </div>
      <div class="stress-case best-case">
        <h4>最佳情景</h4>
        <p>Spot ${stressTest.bestCase.spotShift > 0 ? '+' : ''}${stressTest.bestCase.spotShift}%, IV ${stressTest.bestCase.ivShift > 0 ? '+' : ''}${stressTest.bestCase.ivShift}%</p>
        <p class="large positive">${formatMoney(stressTest.bestCase.pnl)}</p>
      </div>
    </div>
  `;

  document.getElementById("stressTestResults").innerHTML = tableHtml;

  // Greek Shock Estimate
  const shockEstimate = calculateGreekShockEstimate();
  const shockHtml = `
    <div class="shock-estimate">
      <h4>Greek Shock 估算 (1-day)</h4>
      <p class="note">${shockEstimate.note}</p>
      <div class="shock-grid">
        <div class="shock-item"><strong>Delta Risk:</strong> ${formatMoney(shockEstimate.deltaRisk)}</div>
        <div class="shock-item"><strong>Gamma Risk:</strong> ${formatMoney(shockEstimate.gammaRisk)}</div>
        <div class="shock-item"><strong>Vega Risk:</strong> ${formatMoney(shockEstimate.vegaRisk)}</div>
        <div class="shock-item"><strong>Theta (1-day):</strong> ${formatMoney(shockEstimate.thetaRisk)}</div>
        <div class="shock-item total"><strong>Total Risk:</strong> ${formatMoney(shockEstimate.totalRisk)}</div>
      </div>
    </div>
  `;

  document.getElementById("greekShockEstimate").innerHTML = shockHtml;
}

// Handle Mode Toggle
function handleModeToggle(mode) {
  state.mode = mode;
  localStorage.setItem('os_mode', mode);

  // Update button states
  document.getElementById("modeBasic").classList.toggle("active", mode === "basic");
  document.getElementById("modePro").classList.toggle("active", mode === "professional");
  document.getElementById("modeInterview").classList.toggle("active", mode === "interview");

  // Show/hide panels
  const proContent = document.querySelectorAll(".pro-content");
  const interviewContent = document.querySelectorAll(".interview-content");

  if (mode === "basic") {
    proContent.forEach(el => el.style.display = "none");
    interviewContent.forEach(el => el.style.display = "none");
  } else if (mode === "professional") {
    proContent.forEach(el => el.style.display = "block");
    interviewContent.forEach(el => el.style.display = "none");
    renderProfessionalContent();
  } else if (mode === "interview") {
    proContent.forEach(el => el.style.display = "block");
    interviewContent.forEach(el => el.style.display = "block");
    renderProfessionalContent();
    renderInterviewQuestions();
  }
}

function renderCoverage() {
  const extras = STRATEGIES.filter((strategy) => strategy.source === "补充");
  document.getElementById("coverageSummary").textContent = `目标站覆盖 ${STRATEGIES.length - extras.length} 个条目；本页额外补充 ${extras.length} 个常见策略。`;
  document.getElementById("missingList").innerHTML = extras
    .map((strategy) => `<button type="button" data-strategy="${strategy.id}">${escapeHtml(strategy.name)}</button>`)
    .join("");
}

function renderStaticShell() {
  renderFilters();
  renderCoverage();
}

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

// --- URL state persistence ---
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
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = state.search;
  }
  if (params.has("spot")) state.scenario.spot = Math.max(0.01, Number(params.get("spot")));
  if (params.has("iv")) state.scenario.ivShift = Number(params.get("iv")) / 100;
  if (params.has("dte")) state.scenario.daysElapsed = Math.max(0, Number(params.get("dte")));
  if (params.has("rate")) state.scenario.rate = Number(params.get("rate"));
  if (params.has("div")) state.scenario.dividend = Number(params.get("div"));
  if (params.has("mult")) state.scenario.multiplier = Math.max(1, Number(params.get("mult")));
}

function refreshAnalysis(options = {}) {
  renderTopbar();
  renderSliders();
  renderMainChart();
  renderGreeks();
  renderMetrics();
  renderEducation();
  if (options.legs !== false) renderLegsEditor();
  if (options.controls !== false) renderScenarioControls();

  // Render professional content if in professional or interview mode
  if (state.mode === 'professional' || state.mode === 'interview') {
    renderProfessionalContent();
  }
  if (state.mode === 'interview') {
    renderInterviewQuestions();
  }

  saveStateToURL();
}

function maxCompletedDifficulty() {
  const done = loadProgress().completed || [];
  let max = -1;
  for (const id of done) {
    const s = STRATEGIES.find(s => s.id === id);
    if (s) max = Math.max(max, DIFF_ORDER[s.difficulty] ?? -1);
  }
  return max;
}

function showDiffWarning(targetStrategy) {
  const content = document.getElementById("diffWarnContent");
  const curOrder = DIFF_ORDER[targetStrategy.difficulty] ?? 2;
  // Find easier related strategies in same category
  const easier = STRATEGIES
    .filter(s => s.category === targetStrategy.category && (DIFF_ORDER[s.difficulty] ?? 2) < curOrder)
    .sort((a, b) => (DIFF_ORDER[b.difficulty] ?? 2) - (DIFF_ORDER[a.difficulty] ?? 2))
    .slice(0, 3);

  content.innerHTML = `
    <h4>⚠️ 难度跃升提示</h4>
    <p style="margin:12px 0">「${escapeHtml(targetStrategy.name)}」是 <strong>${DIFF_LABEL[targetStrategy.difficulty] || targetStrategy.difficulty}</strong> 级策略，需要理解更深层的期权概念。</p>
    ${easier.length ? `
      <p style="margin:12px 0 6px">建议先掌握同类别中难度较低的策略：</p>
      <ul>${easier.map(s => `<li><button class="related-link" type="button" data-strategy="${s.id}">${escapeHtml(s.name)}（${DIFF_LABEL[s.difficulty] || s.difficulty}）</button> — ${escapeHtml(s.cn)}</li>`).join("")}</ul>
    ` : ""}
    <div style="margin-top:16px;display:flex;gap:8px">
      <button id="skipDiffWarn" class="primary-button" type="button" style="background:var(--amber);color:#000">仍然查看</button>
      <button id="closeDiffWarn" class="primary-button" type="button">关闭</button>
    </div>
  `;
  document.getElementById("diffWarnModal").hidden = false;

  // Wire inner buttons
  document.getElementById("skipDiffWarn").onclick = () => {
    document.getElementById("diffWarnModal").hidden = true;
    doSelectStrategy(targetStrategy);
  };
  content.querySelectorAll('[data-strategy]').forEach(btn => {
    btn.onclick = () => {
      document.getElementById("diffWarnModal").hidden = true;
      selectStrategy(btn.dataset.strategy);
    };
  });
}

function doSelectStrategy(strategy) {
  state.selectedId = strategy.id;
  state.entrySpot = Math.max(0.01, Number(state.scenario.spot) || SPOT);
  state.legs = normalizeLegs(strategy.legs, state.entrySpot);
  state.scenario.daysElapsed = 0;
  markVisited(strategy.id);
  renderStrategyList();
  refreshAnalysis();
}

function selectStrategy(id) {
  const strategy = STRATEGIES.find((item) => item.id === id);
  if (!strategy) return;

  const curOrder = DIFF_ORDER[strategy.difficulty] ?? 2;
  const maxDone = maxCompletedDifficulty();
  // Show warning when jumping far beyond completed knowledge.
  // With no completed strategies, advanced/expert strategies still deserve a warning.
  const shouldWarn = maxDone >= 0 ? curOrder - maxDone >= 2 : curOrder >= DIFF_ORDER.Advanced;
  if (shouldWarn) {
    showDiffWarning(strategy);
    return;
  }

  doSelectStrategy(strategy);
}

function resetCurrentStrategy() {
  state.scenario = defaultScenario();
  const strategy = selectedStrategy();
  state.entrySpot = state.scenario.spot;
  state.legs = normalizeLegs(strategy.legs, state.entrySpot);
  renderAll();
}

function updateScenario(key, rawValue) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return;
  if (key === "rate" || key === "dividend") state.scenario[key] = value / 100;
  else if (key === "spot") state.scenario.spot = Math.max(0.01, value);
  else if (key === "priceRange") state.scenario.priceRange = clamp(value, 5, 250);
  else if (key === "multiplier") state.scenario.multiplier = Math.max(1, value);
  state.scenario.daysElapsed = clamp(state.scenario.daysElapsed, 0, maxDte());
}

function updateLeg(target) {
  const index = Number(target.dataset.leg);
  const key = target.dataset.key;
  const leg = state.legs[index];
  if (!leg || !key) return;
  if (target.tagName === "SELECT") {
    leg[key] = target.value;
    return;
  }
  const value = Number(target.value);
  if (!Number.isFinite(value)) return;
  if (key === "iv") leg.iv = Math.max(1, value) / 100;
  else if (key === "qty") leg.qty = Math.max(0, value);
  else if (key === "dte") leg.dte = Math.max(1, value);
  else if (key === "strike" || key === "entry") leg[key] = Math.max(0.01, value);
  else leg[key] = value;
  state.scenario.daysElapsed = clamp(state.scenario.daysElapsed, 0, maxDte());
}

function handleInput(event) {
  const target = event.target;
  if (target.id === "searchInput") {
    state.search = target.value;
    renderStrategyList();
    return;
  }
  if (target.id === "ivShiftSlider") {
    state.scenario.ivShift = Number(target.value) / 100;
    refreshAnalysis({ controls: false, legs: false });
    return;
  }
  if (target.id === "timeSlider") {
    state.scenario.daysElapsed = Number(target.value);
    refreshAnalysis({ controls: false, legs: false });
    return;
  }
  if (target.matches("[data-scenario]")) {
    updateScenario(target.dataset.scenario, target.value);
    refreshAnalysis({ controls: false, legs: false });
    return;
  }
  if (target.matches("[data-leg-toggle]")) {
    const idx = Number(target.dataset.legToggle);
    if (target.checked) hiddenLegs.delete(idx);
    else hiddenLegs.add(idx);
    refreshAnalysis({ controls: false, legs: false });
    return;
  }
  if (target.matches("[data-leg]") && target.tagName !== "SELECT") {
    updateLeg(target);
    refreshAnalysis({ controls: false, legs: false });
  }
}

function handleChange(event) {
  const target = event.target;
  if (target.matches("[data-leg]")) {
    updateLeg(target);
    refreshAnalysis({ controls: false });
  }
}

function handleClick(event) {
  // Mode toggle buttons
  if (event.target.id === "modeBasic") {
    handleModeToggle("basic");
    return;
  }
  if (event.target.id === "modePro") {
    handleModeToggle("professional");
    return;
  }
  if (event.target.id === "modeInterview") {
    handleModeToggle("interview");
    return;
  }
  // Run stress test button
  if (event.target.id === "runStressTest") {
    renderStressTestResults();
    return;
  }
  // Check Put-Call Parity button
  if (event.target.id === "checkParity") {
    const callPrice = Number(document.getElementById("parityCallPrice").value);
    const putPrice = Number(document.getElementById("parityPutPrice").value);
    const spot = Number(document.getElementById("paritySpot").value);
    const strike = Number(document.getElementById("parityStrike").value);
    const dte = Number(document.getElementById("parityDte").value);
    const rate = Number(document.getElementById("parityRate").value) / 100;

    const result = checkPutCallParity(callPrice, putPrice, spot, strike, dte, rate);

    const resultsHtml = `
      <div class="parity-result">
        <h4>Put-Call Parity 检查结果</h4>
        <div class="parity-calc">
          <p><strong>Synthetic Forward (C - P):</strong> $${result.syntheticForward.toFixed(2)}</p>
          <p><strong>Theoretical Forward (S - K·e^(-rT)):</strong> $${result.theoreticalForward.toFixed(2)}</p>
          <p class="${result.mispricing >= 0 ? 'positive' : 'negative'}"><strong>Mispricing:</strong> $${result.mispricing.toFixed(2)} (${result.mispricingPercent.toFixed(2)}%)</p>
        </div>
        <div class="parity-interpretation">
          <p><strong>解读:</strong> ${result.interpretation}</p>
          <p><strong>套利交易:</strong> ${result.arbitrageTrade}</p>
          <p class="note">${result.note}</p>
        </div>
      </div>
    `;

    document.getElementById("parityResults").innerHTML = resultsHtml;
    return;
  }
  // Mark strategy as completed
  if (event.target.id === "markCompletedBtn") {
    const id = state.selectedId;
    if (isCompleted(id)) return; // already done, no toggle-off
    markCompleted(id);
    renderTopbar();
    return;
  }
  // Close diff warn modal
  if (event.target.id === "closeDiffWarn") {
    document.getElementById("diffWarnModal").hidden = true;
    return;
  }
  // Close concept card
  if (event.target.id === "closeConceptCard") { hideConceptCard(); return; }
  // Open concept card from [?] button
  const conceptBtn = event.target.closest("[data-concept]");
  if (conceptBtn) {
    const key = conceptBtn.dataset.concept;
    const panel = greekPanels.find(p => p.key === key);
    if (panel?.concept) showConceptCard(panel);
    return;
  }
  // Close concept card when clicking outside
  const card = document.getElementById("conceptCard");
  if (card && !card.hidden && !event.target.closest(".concept-card")) {
    hideConceptCard();
  }
  // Chart view toggle (combined vs per-leg vs probability)
  if (event.target.id === "viewCombined" || event.target.id === "viewPerLeg" || event.target.id === "viewProbability") {
    const newMode = event.target.id === "viewPerLeg" ? "perLeg" : event.target.id === "viewProbability" ? "probability" : "combined";
    chartViewMode = newMode;
    refreshAnalysis({ controls: false, legs: false });
    return;
  }
  // Filter pills
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    state.filter = filter.dataset.filter;
    renderFilters();
    renderStrategyList();
    return;
  }
  // Strategy selection
  const strategyButton = event.target.closest("[data-strategy]");
  if (strategyButton) {
    selectStrategy(strategyButton.dataset.strategy);
  }
}

function boot() {
  loadStateFromURL();

  // Load saved mode from localStorage
  const savedMode = localStorage.getItem('os_mode') || 'basic';
  state.mode = savedMode;

  const first = selectedStrategy();
  state.entrySpot = state.scenario.spot;
  state.legs = normalizeLegs(first.legs, state.entrySpot);
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);
  document.addEventListener("click", handleClick);
  document.getElementById("resetStrategy").addEventListener("click", resetCurrentStrategy);
  document.getElementById("playBtn").addEventListener("click", () => {
    if (timeAnimationId) stopTimeAnimation();
    else startTimeAnimation();
  });
  document.getElementById("pauseBtn").addEventListener("click", stopTimeAnimation);
  document.getElementById("resetTimeBtn").addEventListener("click", resetTimeAnimation);
  renderAll();

  // Initialize mode after rendering
  handleModeToggle(state.mode);
}

boot();
