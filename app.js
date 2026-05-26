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
  portfolio: {
    positions: [], // { id, strategyId, strategyName, quantity, legs, entrySpot }
    accountSize: 10000,
    marginType: "regT" // "regT" | "portfolio"
  }
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

function unmarkCompleted(strategyId) {
  const prog = loadProgress();
  if (!prog.completed) return;
  prog.completed = prog.completed.filter(id => id !== strategyId);
  saveProgress(prog);
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

function portfolioResult(spot = state.scenario.spot, daysElapsed = state.scenario.daysElapsed, scenario = state.scenario, legs = null, entrySpot = null) {
  const useLegs = legs || state.legs;
  // Use provided entrySpot, or fall back to state.entrySpot for current strategy
  const actualEntrySpot = entrySpot !== null ? entrySpot : state.entrySpot;
  const entryValue = useLegs.reduce((sum, leg) => sum + positionValue(leg, actualEntrySpot, 0, scenario, true).value, 0);
  const current = useLegs.reduce(
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

// ============================================================================
// Portfolio Greeks Aggregator
// ============================================================================

// Add current strategy to portfolio
function addToPortfolio(quantity = 1) {
  const strategy = selectedStrategy();
  const positionId = Date.now().toString();

  state.portfolio.positions.push({
    id: positionId,
    strategyId: strategy.id,
    strategyName: strategy.name,
    quantity: quantity,
    legs: JSON.parse(JSON.stringify(state.legs)), // Deep copy
    entrySpot: state.scenario.spot,
    entryDate: new Date().toISOString()
  });

  savePortfolioToLocalStorage();
  renderPortfolioPanel();
}

// Remove position from portfolio
function removeFromPortfolio(positionId) {
  state.portfolio.positions = state.portfolio.positions.filter(p => p.id !== positionId);
  savePortfolioToLocalStorage();
  renderPortfolioPanel();
}

// Calculate portfolio Greeks
function calculatePortfolioGreeks() {
  if (state.portfolio.positions.length === 0) {
    return {
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
      totalPnL: 0,
      totalValue: 0
    };
  }

  const aggregated = {
    delta: 0,
    gamma: 0,
    theta: 0,
    vega: 0,
    rho: 0,
    totalPnL: 0,
    totalValue: 0
  };

  state.portfolio.positions.forEach(position => {
    // Calculate Greeks for this position using its entry spot
    const result = portfolioResult(
      state.scenario.spot,
      state.scenario.daysElapsed,
      state.scenario,
      position.legs,
      position.entrySpot  // Pass the position's entry spot
    );

    // Aggregate Greeks (multiply by quantity)
    aggregated.delta += result.greeks.delta * position.quantity;
    aggregated.gamma += result.greeks.gamma * position.quantity;
    aggregated.theta += result.greeks.theta * position.quantity;
    aggregated.vega += result.greeks.vega * position.quantity;
    aggregated.rho += result.greeks.rho * position.quantity;
    aggregated.totalPnL += result.pnl * position.quantity;
    aggregated.totalValue += result.value * position.quantity;
  });

  return aggregated;
}

// Calculate portfolio margin
function calculatePortfolioMargin() {
  if (state.portfolio.positions.length === 0) {
    return { regT: 0, portfolio: 0 };
  }

  let regTMargin = 0;

  state.portfolio.positions.forEach(position => {
    const positionMargin = calculatePositionMargin(position.legs, position.quantity, position.entrySpot);
    regTMargin += positionMargin.regT;
  });

  // Portfolio Margin: simplified stress test
  // Run 16 scenarios: ±15% spot, ±25% IV
  const spotShifts = [-0.15, -0.10, 0, 0.10, 0.15];
  const ivShifts = [-0.25, 0, 0.25];

  let maxLoss = 0;

  spotShifts.forEach(spotShift => {
    ivShifts.forEach(ivShift => {
      const testSpot = state.scenario.spot * (1 + spotShift);
      const testScenario = { ...state.scenario, ivShift: state.scenario.ivShift + ivShift };

      let scenarioLoss = 0;
      state.portfolio.positions.forEach(position => {
        const result = portfolioResult(testSpot, state.scenario.daysElapsed, testScenario, position.legs, position.entrySpot);
        scenarioLoss += result.pnl * position.quantity;
      });

      if (scenarioLoss < maxLoss) {
        maxLoss = scenarioLoss;
      }
    });
  });

  // Portfolio Margin = worst-case loss from stress test
  const portfolioMargin = Math.abs(maxLoss);

  return {
    regT: regTMargin,
    portfolio: portfolioMargin
  };
}

// Calculate margin for a single position
function calculatePositionMargin(legs, quantity = 1, entrySpot = null) {
  const strategyType = detectStrategyType(legs);
  const multiplier = state.scenario.multiplier;
  const spotForCalculation = entrySpot !== null ? entrySpot : state.scenario.spot;

  if (strategyType === 'long-only') {
    // Long options: premium × qty × multiplier
    const premium = legs.reduce((sum, leg) => {
      if (leg.side === 'long' && leg.type === 'option') {
        const price = optionModel(
          leg.optionType,
          spotForCalculation,
          leg.strike,
          leg.dte,
          state.scenario.rate,
          state.scenario.dividend,
          leg.iv
        ).price;
        return sum + price * Math.abs(leg.qty);
      }
      return sum;
    }, 0);
    return { regT: premium * quantity * multiplier, portfolio: premium * quantity * multiplier };
  }

  if (strategyType === 'defined-risk') {
    // Defined-risk spreads: max loss (already in dollars, don't multiply by multiplier again)
    const maxLoss = calculateMaxLoss(legs, entrySpot);
    return { regT: maxLoss * quantity, portfolio: maxLoss * quantity * 0.7 };
  }

  if (strategyType === 'short-naked') {
    // Naked short: Reg-T formula
    let margin = 0;
    legs.forEach(leg => {
      if (leg.side === 'short' && leg.type === 'option') {
        const price = optionModel(
          leg.optionType,
          spotForCalculation,
          leg.strike,
          leg.dte,
          state.scenario.rate,
          state.scenario.dividend,
          leg.iv
        ).price;
        const spot = spotForCalculation;
        const strike = leg.strike;
        const otmAmount = leg.optionType === 'call'
          ? Math.max(strike - spot, 0)
          : Math.max(spot - strike, 0);
        const requirement = Math.max(
          price + 0.20 * spot - otmAmount,
          price + 0.10 * spot
        );
        margin += requirement * Math.abs(leg.qty);
      }
    });
    return { regT: margin * quantity * multiplier, portfolio: margin * quantity * multiplier * 0.6 };
  }

  // Default: conservative estimate
  const totalPremium = legs.reduce((sum, leg) => {
    if (leg.type === 'option') {
      const price = optionModel(
        leg.optionType,
        spotForCalculation,
        leg.strike,
        leg.dte,
        state.scenario.rate,
        state.scenario.dividend,
        leg.iv
      ).price;
      return sum + price * Math.abs(leg.qty);
    }
    return sum;
  }, 0);
  return { regT: totalPremium * quantity * multiplier * 2, portfolio: totalPremium * quantity * multiplier * 1.4 };
}

// Detect strategy type for margin calculation
function detectStrategyType(legs) {
  const hasLong = legs.some(l => l.side === 'long' && l.type === 'option');
  const hasShort = legs.some(l => l.side === 'short' && l.type === 'option');

  if (hasLong && !hasShort) return 'long-only';
  if (hasShort && !hasLong) return 'short-naked';

  // Check if defined risk (has protective long options)
  if (hasLong && hasShort) {
    // Check if it's a vertical spread (same expiry, same type, different strikes)
    const calls = legs.filter(l => l.type === 'option' && l.optionType === 'call');
    const puts = legs.filter(l => l.type === 'option' && l.optionType === 'put');

    // Vertical spread: one long, one short, same type
    const isCallSpread = calls.length === 2 && calls.some(l => l.side === 'long') && calls.some(l => l.side === 'short');
    const isPutSpread = puts.length === 2 && puts.some(l => l.side === 'long') && puts.some(l => l.side === 'short');

    // Iron Condor/Butterfly: multiple spreads
    const isIronStructure = calls.length >= 2 && puts.length >= 2;

    if (isCallSpread || isPutSpread || isIronStructure) {
      return 'defined-risk';
    }

    // Otherwise (calendar, diagonal, risk reversal, etc.) treat as mixed
    return 'short-naked'; // Conservative: treat as naked for margin
  }

  return 'unknown';
}

// Calculate max loss for defined-risk strategies
function calculateMaxLoss(legs, entrySpot = null) {
  // Simplified: calculate max loss at various spot prices
  const spot = entrySpot !== null ? entrySpot : state.scenario.spot;
  const testPrices = [spot * 0.5, spot * 0.8, spot, spot * 1.2, spot * 1.5];

  // Use DTE from legs if available, otherwise use current scenario
  const dte = legs.length > 0 && legs[0].dte ? legs[0].dte : state.scenario.daysElapsed;

  let maxLoss = 0;
  testPrices.forEach(testSpot => {
    const result = portfolioResult(testSpot, dte, state.scenario, legs, spot);
    if (result.pnl < maxLoss) {
      maxLoss = result.pnl;
    }
  });

  return Math.abs(maxLoss);
}

// Save portfolio to localStorage
function savePortfolioToLocalStorage() {
  try {
    localStorage.setItem('optionslab_portfolio', JSON.stringify(state.portfolio));
  } catch (e) {
    console.warn('Failed to save portfolio to localStorage', e);
  }
}

// Load portfolio from localStorage
function loadPortfolioFromLocalStorage() {
  try {
    const saved = localStorage.getItem('optionslab_portfolio');
    if (saved) {
      const portfolio = JSON.parse(saved);
      state.portfolio = { ...state.portfolio, ...portfolio };
    }
  } catch (e) {
    console.warn('Failed to load portfolio from localStorage', e);
  }
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

  // Breakeven labels — avoid axis overlap and keep readable
  const zeroY = yScale(0);
  const zeroRatio = (zeroY - pad.top) / (plotH || 1);
  const labelY = zeroRatio > 0.72 ? pad.top + plotH * 0.5 : zeroY - 14;
  const spotX = xScale(state.scenario.spot);
  const breakLabels = (options.breakevens || [])
    .map((spot, i, arr) => {
      let bx = xScale(spot);
      // Shift label away from spot line if too close
      const distFromSpot = Math.abs(bx - spotX);
      if (distFromSpot < 36) bx = spotX + (bx >= spotX ? 36 : -36);
      // Stagger y if two breakevens overlap horizontally
      let by = labelY;
      const prev = arr[i - 1];
      if (prev && Math.abs(xScale(spot) - xScale(prev)) < 55) {
        by = labelY - (i % 2 === 0 ? 16 : 0);
      }
      const bxStr = bx.toFixed(1);
      const byStr = by.toFixed(1);
      const lbl = `$${spot.toFixed(2)}`;
      return `<rect class="break-label-bg" x="${(bx - 22).toFixed(1)}" y="${(by - 12).toFixed(1)}" width="44" height="16" rx="3"/><text class="break-label" x="${bxStr}" y="${byStr}" text-anchor="middle">${lbl}</text>`;
    })
    .join("");

  // Annotations: vertical dashed lines with labels (used for sigma bands etc.)
  const annotations = (options.annotations || [])
    .map(a => {
      const ax = xScale(a.spot).toFixed(1);
      const topY = pad.top;
      const botY = height - pad.bottom;
      return `<line class="sigma-band" x1="${ax}" y1="${topY}" x2="${ax}" y2="${botY}"/>
        <text class="sigma-label" x="${ax}" y="${topY + 14}" text-anchor="middle">${escapeHtml(a.label)}</text>`;
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
    ${grid}${profitArea}${lossArea}${zeroLine}${breakLines}${breakLabels}${spotLine}${paths}${annotations}${overlay}
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
      (strategy) => {
        const maxP = strategy.money?.maxProfit || "";
        const maxL = strategy.money?.maxLoss || "";
        const riskSummary = maxP && maxL ? `最大盈利: ${maxP} / 最大亏损: ${maxL}` : (maxP ? `最大盈利: ${maxP}` : (maxL ? `最大亏损: ${maxL}` : ""));
        const legsSummary = (strategy.legs || []).map(l => `${l.side === "long" ? "买" : "卖"}${l.qty || 1}${l.type === "stock" ? "股" : (l.optionType === "call" ? "Call" : "Put")}`).join(" + ");
        const preview = `${strategy.cn} · ${strategy.outlook}\n${legsSummary || strategy.name}\n${riskSummary}\n${strategy.when || ""}`;
        return `<button class="strategy-item ${strategy.id === state.selectedId ? "is-selected" : ""}" type="button"
          data-strategy="${strategy.id}"
          data-preview="${escapeHtml(preview)}"
          title="${escapeHtml(strategy.cn + " · " + strategy.outlook)}">
          <span><span class="strategy-name">${escapeHtml(strategy.name)}</span><span class="strategy-description">${escapeHtml(strategy.cn)} · ${escapeHtml(strategy.outlook)}</span></span>
          <span class="strategy-tags">
            <span class="diff-badge ${DIFF_CLASS[strategy.difficulty] || ""}" title="${DIFF_LABEL[strategy.difficulty] || strategy.difficulty}"></span>
            <span class="${strategy.source === "补充" ? "source-extra" : ""}">${escapeHtml(strategy.category)}</span>
          </span>
        </button>`;
      },
    )
    .join("");

  // Strategy hover mini-preview
  const list = document.getElementById("strategyList");
  list.querySelectorAll(".strategy-item").forEach(btn => {
    btn.addEventListener("mouseenter", (e) => {
      const preview = btn.dataset.preview;
      if (!preview) return;
      const existingTip = document.getElementById("strategyPreviewTip");
      if (existingTip) existingTip.remove();
      const tip = document.createElement("div");
      tip.className = "strategy-preview-tip";
      tip.id = "strategyPreviewTip";
      preview.split("\n").filter(Boolean).forEach((line) => {
        const span = document.createElement("span");
        span.textContent = line;
        tip.appendChild(span);
      });
      document.body.appendChild(tip);
      const rect = btn.getBoundingClientRect();
      tip.style.left = Math.min(rect.right + 10, window.innerWidth - 250) + "px";
      tip.style.top = Math.min(rect.top, window.innerHeight - 140) + "px";
    });
    btn.addEventListener("mouseleave", () => {
      const tip = document.getElementById("strategyPreviewTip");
      if (tip) tip.remove();
    });
  });
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
    markBtn.textContent = doneMark ? "✓ 已理解" : "○ 已理解";
    markBtn.style.opacity = doneMark ? "1" : "0.55";
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
    probStats = { probProfit, sigma, T, mu, sd };
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

  // Sigma band annotations for probability cone
  const chartAnnotations = [];
  if (isProbability && probStats) {
    [{ mult: -2, label: "−2σ" }, { mult: -1, label: "−1σ" }, { mult: 1, label: "+1σ" }, { mult: 2, label: "+2σ" }]
      .forEach(b => {
        const s = Math.exp(probStats.mu + b.mult * probStats.sd);
        if (s > 0 && isFinite(s)) chartAnnotations.push({ spot: s, label: b.label });
      });
  }

  document.getElementById("mainChart").innerHTML = chartSvg(
    series,
    { label: "主损益图", yLabel: "PnL", breakevens: isPerLeg ? findBreakevens(combinedCurve) : breakevens, interactive: true,
      annotations: chartAnnotations,
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
    interviewQuestions.innerHTML = `<p class="muted" style="text-align: center; padding: 2rem;">该策略暂无面试问答内容。当前已覆盖 40 个策略的专业内容，包含 141 个面试问答。</p>`;
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

// Render Portfolio Panel
function renderPortfolioPanel() {
  const portfolioContent = document.getElementById("portfolioContent");
  if (!portfolioContent) return;

  const positions = state.portfolio.positions;
  const portfolioGreeks = calculatePortfolioGreeks();
  const margin = calculatePortfolioMargin();
  const accountSize = state.portfolio.accountSize;
  const marginType = state.portfolio.marginType;
  const currentMargin = marginType === 'regT' ? margin.regT : margin.portfolio;
  const buyingPower = accountSize - currentMargin;
  const marginPercent = (currentMargin / accountSize) * 100;

  // Greeks limits (for warnings)
  const deltaLimit = 0.10;
  const gammaLimit = 0.05;
  const vegaLimit = 15;

  const deltaWarning = Math.abs(portfolioGreeks.delta) > deltaLimit;
  const gammaWarning = Math.abs(portfolioGreeks.gamma) > gammaLimit;
  const vegaWarning = Math.abs(portfolioGreeks.vega) > vegaLimit;

  let html = `
    <div class="portfolio-controls">
      <button id="addToPortfolioBtn" class="primary-button" type="button">+ 添加当前策略到组合</button>
      <label class="margin-type-toggle">
        <span>保证金类型:</span>
        <select id="marginTypeSelect">
          <option value="regT" ${marginType === 'regT' ? 'selected' : ''}>Reg-T</option>
          <option value="portfolio" ${marginType === 'portfolio' ? 'selected' : ''}>Portfolio Margin</option>
        </select>
      </label>
      <label class="account-size-input">
        <span>账户规模:</span>
        <input type="number" id="accountSizeInput" value="${accountSize}" step="1000" min="1000" />
      </label>
    </div>
  `;

  if (positions.length === 0) {
    html += `<p class="muted" style="text-align: center; padding: 2rem;">组合为空。添加策略开始管理组合风险。</p>`;
  } else {
    // Positions list
    html += `<div class="portfolio-positions">`;
    positions.forEach((position, index) => {
      const posResult = portfolioResult(
        state.scenario.spot,
        state.scenario.daysElapsed,
        state.scenario,
        position.legs,
        position.entrySpot
      );
      const pnl = posResult.pnl * position.quantity;
      const pnlClass = pnl >= 0 ? 'positive' : 'negative';

      html += `
        <div class="portfolio-position">
          <div class="position-header">
            <span class="position-name">${index + 1}. ${position.strategyName} × ${position.quantity}</span>
            <button class="position-remove" data-position-id="${position.id}" title="移除">×</button>
          </div>
          <div class="position-greeks">
            <span>Δ: ${formatNumber(posResult.greeks.delta * position.quantity)}</span>
            <span>Γ: ${formatNumber(posResult.greeks.gamma * position.quantity)}</span>
            <span>Θ: ${formatNumber(posResult.greeks.theta * position.quantity)}</span>
            <span>V: ${formatNumber(posResult.greeks.vega * position.quantity)}</span>
            <span class="${pnlClass}">P&L: ${formatMoney(pnl)}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    // Portfolio Greeks summary
    html += `
      <div class="portfolio-summary">
        <h4>组合 Greeks</h4>
        <div class="portfolio-greeks-grid">
          <div class="greek-item ${deltaWarning ? 'warning' : ''}">
            <span class="greek-label">Delta:</span>
            <span class="greek-value">${formatNumber(portfolioGreeks.delta)}</span>
            <span class="greek-limit">(限额: ±${deltaLimit}) ${deltaWarning ? '⚠️' : '✅'}</span>
          </div>
          <div class="greek-item ${gammaWarning ? 'warning' : ''}">
            <span class="greek-label">Gamma:</span>
            <span class="greek-value">${formatNumber(portfolioGreeks.gamma)}</span>
            <span class="greek-limit">(限额: ${gammaLimit}) ${gammaWarning ? '⚠️' : '✅'}</span>
          </div>
          <div class="greek-item">
            <span class="greek-label">Theta:</span>
            <span class="greek-value">${formatNumber(portfolioGreeks.theta)}</span>
            <span class="greek-limit">${portfolioGreeks.theta > 0 ? '(收租策略)' : '(付出时间价值)'}</span>
          </div>
          <div class="greek-item ${vegaWarning ? 'warning' : ''}">
            <span class="greek-label">Vega:</span>
            <span class="greek-value">${formatNumber(portfolioGreeks.vega)}</span>
            <span class="greek-limit">(限额: ±${vegaLimit}) ${vegaWarning ? '⚠️' : '✅'}</span>
          </div>
          <div class="greek-item">
            <span class="greek-label">总 P&L:</span>
            <span class="greek-value ${portfolioGreeks.totalPnL >= 0 ? 'positive' : 'negative'}">${formatMoney(portfolioGreeks.totalPnL)}</span>
          </div>
        </div>

        <h4>保证金与买入力</h4>
        <div class="margin-summary">
          <div class="margin-item">
            <span>Reg-T 保证金:</span>
            <span>${formatMoney(margin.regT)}</span>
          </div>
          <div class="margin-item">
            <span>PM 估算 (教育性):</span>
            <span>${formatMoney(margin.portfolio)}</span>
          </div>
          <div class="margin-item">
            <span>当前使用 (${marginType === 'regT' ? 'Reg-T' : 'PM估算'}):</span>
            <span class="${marginPercent > 80 ? 'warning' : ''}">${formatMoney(currentMargin)} (${marginPercent.toFixed(1)}%)</span>
          </div>
          <div class="margin-item">
            <span>剩余买入力:</span>
            <span class="${buyingPower < 0 ? 'negative' : 'positive'}">${formatMoney(buyingPower)}</span>
          </div>
        </div>

        <p class="note" style="font-size:0.85em;color:var(--text-secondary);margin-top:8px;">
          ⚠️ PM 估算为教育性简化计算（15场景压力测试），不代表真实 broker 的 Portfolio Margin。
          真实 PM 基于 FINRA Rule 4210 和 broker 风险模型。
        </p>

        ${marginPercent > 80 ? '<p class="warning-text">⚠️ 保证金使用超过80%，建议降低仓位</p>' : ''}
        ${buyingPower < 0 ? '<p class="error-text">❌ 保证金不足，需要追加保证金或平仓</p>' : ''}
      </div>
    `;
  }

  portfolioContent.innerHTML = html;

  // Attach event listeners
  const addBtn = document.getElementById("addToPortfolioBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const quantity = prompt("输入数量（合约数）:", "1");
      if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
        addToPortfolio(parseInt(quantity));
      }
    });
  }

  const removeButtons = document.querySelectorAll(".position-remove");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const positionId = e.target.getAttribute("data-position-id");
      if (confirm("确定要移除这个头寸吗？")) {
        removeFromPortfolio(positionId);
      }
    });
  });

  const marginTypeSelect = document.getElementById("marginTypeSelect");
  if (marginTypeSelect) {
    marginTypeSelect.addEventListener("change", (e) => {
      state.portfolio.marginType = e.target.value;
      savePortfolioToLocalStorage();
      renderPortfolioPanel();
    });
  }

  const accountSizeInput = document.getElementById("accountSizeInput");
  if (accountSizeInput) {
    accountSizeInput.addEventListener("change", (e) => {
      const newSize = parseInt(e.target.value);
      if (!isNaN(newSize) && newSize > 0) {
        state.portfolio.accountSize = newSize;
        savePortfolioToLocalStorage();
        renderPortfolioPanel();
      }
    });
  }
}

function renderProfessionalConcepts() {
  const panel = document.getElementById("proConceptsContent");
  if (!panel) return;
  const concepts = PROFESSIONAL_CONTENT.professionalConcepts;
  if (!concepts) { panel.innerHTML = ""; return; }

  const { greeksRelationships, clientTypes, dealerHedgingPrinciples, marginAndCapital } = concepts;

  const renderSection = (title, items) => {
    const rows = Object.entries(items).map(([key, item]) => {
      if (typeof item === "string") return `<li>${item}</li>`;
      const header = item.concept || item.goal || key;
      const body = item.explanation || item.method || item.commonStrategies?.join(" / ") || item.formula || item.profitLogic || item.note || (item.longOptions ? [item.longOptions, item.shortNaked, item.definedRiskSpreads, item.note].filter(Boolean).join(" | ") : "");
      return `<li><strong>${header}</strong><br><span class="concept-detail">${typeof body === "string" ? body : ""}</span></li>`;
    }).join("");
    return `<div class="concept-block"><h4>${title}</h4><ul>${rows}</ul></div>`;
  };

  panel.innerHTML = `
    ${renderSection("Greeks 关系", greeksRelationships)}
    ${renderSection("客户类型", clientTypes)}
    ${renderSection("Dealer 对冲原则", dealerHedgingPrinciples)}
    ${renderSection("保证金与资本管理", marginAndCapital)}
  `;
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
    renderProfessionalConcepts();
    renderPortfolioPanel();
    renderVolSurface();
    renderGreeksDecay();
  } else if (mode === "interview") {
    proContent.forEach(el => el.style.display = "block");
    interviewContent.forEach(el => el.style.display = "block");
    renderProfessionalContent();
    renderProfessionalConcepts();
    renderInterviewQuestions();
    renderPortfolioPanel();
    renderVolSurface();
    renderGreeksDecay();
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
    renderPortfolioPanel();
    renderVolSurface();
    renderGreeksDecay();
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
  const strategy = selectedStrategy();
  if (!confirm(`确定要重置「${strategy.cn || strategy.name}」的所有参数吗？\n\n将恢复默认情景、入场价、腿组合、IV 变动和 DTE 偏移。`)) return;
  state.scenario = defaultScenario();
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
  // Gamma P&L simulation button
  if (event.target.id === "runGammaPnl") {
    renderGammaPnL();
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
    if (isCompleted(id)) { unmarkCompleted(id); } else { markCompleted(id); }
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

  // Load portfolio from localStorage
  loadPortfolioFromLocalStorage();

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

// ============================================================================
// Gamma P&L Simulation
// ============================================================================

// Simulate Gamma P&L with dynamic hedging
function simulateGammaPnL(finalSpot, steps = 20) {
  const initialSpot = state.scenario.spot;
  const path = [];
  let spot = initialSpot;
  let hedgeShares = 0;
  let cashBalance = 0;  // Cash balance from trading
  let prevSpot = initialSpot;
  const stepSize = (finalSpot - initialSpot) / steps;

  // Initial position
  const initialResult = portfolioResult(spot, state.scenario.daysElapsed);
  const initialValue = initialResult.value;

  for (let i = 0; i <= steps; i++) {
    // Observe current delta and rehedge
    const result = portfolioResult(spot, state.scenario.daysElapsed);
    const targetDelta = -result.greeks.delta;  // Hedge is opposite direction of delta
    const rehedge = targetDelta - hedgeShares;

    // Rehedging cost: buying stock costs cash, selling stock generates cash
    cashBalance -= rehedge * spot;
    hedgeShares = targetDelta;

    // Calculate total hedge P&L: cash balance + stock position value
    const stockPositionValue = hedgeShares * spot;
    const hedgePnL = cashBalance + stockPositionValue;

    const optionValue = result.value;
    const optionPnL = optionValue - initialValue;
    const totalPnL = optionPnL + hedgePnL;

    path.push({
      step: i,
      spot: spot,
      optionPnL: optionPnL,
      cashPnL: hedgePnL,  // Total hedge P&L (cash + stock value)
      totalPnL: totalPnL,
      delta: result.greeks.delta,
      gamma: result.greeks.gamma,
      hedgeShares: hedgeShares,
      cashBalance: cashBalance,
      stockValue: stockPositionValue
    });

    prevSpot = spot;
    spot += stepSize;
  }

  // Calculate realized volatility
  const spotMove = Math.abs(finalSpot - initialSpot);
  const spotMovePercent = (spotMove / initialSpot) * 100;
  const timeElapsed = Math.max(state.scenario.daysElapsed, 1) / 365;
  const realizedVol = (spotMovePercent / Math.sqrt(timeElapsed)) / 100;

  // Get implied volatility
  const optionLegs = state.legs.filter(l => l.type === 'option');
  const avgIV = optionLegs.length > 0 
    ? optionLegs.reduce((sum, leg) => sum + leg.iv, 0) / optionLegs.length
    : 0.20;

  const finalResult = path[path.length - 1];
  const initialGamma = portfolioResult(initialSpot, state.scenario.daysElapsed).greeks.gamma;

  return {
    path: path,
    initialSpot: initialSpot,
    finalSpot: finalSpot,
    spotMove: spotMove,
    spotMovePercent: spotMovePercent,
    optionPnL: finalResult.optionPnL,
    hedgePnL: finalResult.cashPnL,
    totalPnL: finalResult.totalPnL,
    realizedVol: realizedVol,
    impliedVol: avgIV,
    volDiff: realizedVol - avgIV,
    isLongGamma: initialGamma > 0
  };
}

// Render Gamma P&L simulation
function renderGammaPnL() {
  const finalSpot = parseFloat(document.getElementById("gammaPnlSpot").value);
  const steps = parseInt(document.getElementById("gammaPnlSteps").value);

  const simulation = simulateGammaPnL(finalSpot, steps);

  // Render chart
  const chartDiv = document.getElementById("gammaPnlChart");
  const maxPnL = Math.max(...simulation.path.map(p => Math.abs(p.totalPnL)), 10);
  const chartHeight = 200;

  let chartHtml = '<div class="gamma-chart-container">';
  chartHtml += '<svg width="100%" height="' + chartHeight + '" class="gamma-chart-svg">';

  // Draw axes
  chartHtml += '<line x1="40" y1="10" x2="40" y2="' + (chartHeight - 30) + '" stroke="var(--border)" stroke-width="1"/>';
  chartHtml += '<line x1="40" y1="' + (chartHeight - 30) + '" x2="95%" y2="' + (chartHeight - 30) + '" stroke="var(--border)" stroke-width="1"/>';

  // Draw zero line
  const zeroY = chartHeight / 2;
  chartHtml += '<line x1="40" y1="' + zeroY + '" x2="95%" y2="' + zeroY + '" stroke="var(--muted)" stroke-width="1" stroke-dasharray="2,2"/>';

  // Draw P&L path
  const width = 600;
  const xScale = width / simulation.path.length;
  const yScale = (chartHeight - 60) / (maxPnL * 2);

  let pathD = '';
  simulation.path.forEach((point, i) => {
    const x = 40 + i * xScale;
    const y = zeroY - point.totalPnL * yScale;
    if (i === 0) {
      pathD += 'M ' + x + ' ' + y;
    } else {
      pathD += ' L ' + x + ' ' + y;
    }
  });

  const pathColor = simulation.totalPnL >= 0 ? 'var(--green)' : 'var(--red)';
  chartHtml += '<path d="' + pathD + '" stroke="' + pathColor + '" stroke-width="2" fill="none"/>';

  // Labels
  chartHtml += '<text x="10" y="15" fill="var(--text)" font-size="11">P&L</text>';
  chartHtml += '<text x="45" y="' + (chartHeight - 10) + '" fill="var(--text)" font-size="11">Spot: ' + simulation.initialSpot.toFixed(0) + ' → ' + simulation.finalSpot.toFixed(0) + '</text>';

  chartHtml += '</svg></div>';

  chartDiv.innerHTML = chartHtml;

  // Render results
  const resultsDiv = document.getElementById("gammaPnlResults");
  const pnlClass = simulation.totalPnL >= 0 ? 'positive' : 'negative';

  let resultsHtml = `
    <div class="gamma-results-grid">
      <div class="gamma-result-item">
        <span class="result-label">期权 P&L:</span>
        <span class="result-value ${simulation.optionPnL >= 0 ? 'positive' : 'negative'}">${formatMoney(simulation.optionPnL)}</span>
      </div>
      <div class="gamma-result-item">
        <span class="result-label">对冲 P&L:</span>
        <span class="result-value ${simulation.hedgePnL >= 0 ? 'positive' : 'negative'}">${formatMoney(simulation.hedgePnL)}</span>
      </div>
      <div class="gamma-result-item">
        <span class="result-label">总 P&L:</span>
        <span class="result-value ${pnlClass}">${formatMoney(simulation.totalPnL)}</span>
      </div>
      <div class="gamma-result-item">
        <span class="result-label">Realized Vol:</span>
        <span class="result-value">${(simulation.realizedVol * 100).toFixed(1)}%</span>
      </div>
      <div class="gamma-result-item">
        <span class="result-label">Implied Vol:</span>
        <span class="result-value">${(simulation.impliedVol * 100).toFixed(1)}%</span>
      </div>
      <div class="gamma-result-item">
        <span class="result-label">Vol 差异:</span>
        <span class="result-value">${(simulation.volDiff * 100).toFixed(1)}%</span>
      </div>
    </div>

    <div class="gamma-interpretation">
      <h4>解读</h4>
      ${simulation.isLongGamma ? `
        <p><strong>Long Gamma 策略</strong>：你持有正 Gamma，受益于价格波动。</p>
        <ul>
          <li>期权 P&L: ${simulation.optionPnL >= 0 ? '盈利' : '亏损'} ${formatMoney(Math.abs(simulation.optionPnL))}</li>
          <li>对冲 P&L: ${simulation.hedgePnL >= 0 ? '盈利' : '亏损'} ${formatMoney(Math.abs(simulation.hedgePnL))} (动态对冲成本)</li>
          <li>Realized Vol ${simulation.realizedVol > simulation.impliedVol ? '高于' : '低于'} Implied Vol</li>
        </ul>
      ` : `
        <p><strong>Short Gamma 策略</strong>：你持有负 Gamma，害怕价格大幅波动。</p>
        <ul>
          <li>期权 P&L: ${simulation.optionPnL >= 0 ? '盈利' : '亏损'} ${formatMoney(Math.abs(simulation.optionPnL))} (Theta 收益)</li>
          <li>对冲 P&L: ${simulation.hedgePnL >= 0 ? '盈利' : '亏损'} ${formatMoney(Math.abs(simulation.hedgePnL))} (追涨杀跌成本)</li>
          <li>Realized Vol ${simulation.realizedVol > simulation.impliedVol ? '高于' : '低于'} Implied Vol</li>
        </ul>
      `}
      <p class="note">💡 关键：${simulation.isLongGamma ? 'Long gamma 需要 realized vol > implied vol 才能盈利' : 'Short gamma 需要 realized vol < implied vol 才能盈利'}</p>
    </div>
  `;

  resultsDiv.innerHTML = resultsHtml;
}

// Gamma P&L slider updates
document.addEventListener("DOMContentLoaded", () => {
  const gammaPnlSpot = document.getElementById("gammaPnlSpot");
  const gammaPnlSpotOutput = document.getElementById("gammaPnlSpotOutput");
  const gammaPnlSteps = document.getElementById("gammaPnlSteps");
  const gammaPnlStepsOutput = document.getElementById("gammaPnlStepsOutput");

  if (gammaPnlSpot && gammaPnlSpotOutput) {
    gammaPnlSpot.addEventListener("input", (e) => {
      gammaPnlSpotOutput.textContent = e.target.value;
    });
  }

  if (gammaPnlSteps && gammaPnlStepsOutput) {
    gammaPnlSteps.addEventListener("input", (e) => {
      gammaPnlStepsOutput.textContent = e.target.value;
    });
  }
});

// Volatility Surface and Greeks Decay functions
function calculateVolSmile(strikes, dte) {
  const spot = state.scenario.spot;
  const smileData = [];
  strikes.forEach(strike => {
    const k = Math.log(strike / spot);
    const a = 0.04, b = 0.3, rho = -0.4, m = 0, sigma = 0.2;
    const variance = a + b * (rho * (k - m) + Math.sqrt(Math.pow(k - m, 2) + sigma * sigma));
    const termAdj = Math.sqrt(30 / dte);
    const iv = Math.sqrt(Math.max(variance, 0.01)) * termAdj;
    smileData.push({ strike: strike, iv: iv, moneyness: strike / spot });
  });
  return smileData;
}

function renderVolSurface() {
  const spot = state.scenario.spot;
  const strikes = [];
  for (let i = 0.8; i <= 1.2; i += 0.05) strikes.push(spot * i);

  // Use correct DTE field: state.legs[0].dte or default to 30
  const dte = (state.legs.length > 0 && state.legs[0].dte) ? state.legs[0].dte : 30;
  const smileData = calculateVolSmile(strikes, dte);
  const chartDiv = document.getElementById("volSurfaceChart");
  if (!chartDiv) return;

  const atmIndex = Math.floor(smileData.length / 2);
  const atmIV = smileData[atmIndex].iv;
  const otmPutIV = smileData[Math.floor(smileData.length * 0.2)].iv;
  const putSkew = ((otmPutIV - atmIV) / atmIV * 100).toFixed(1);

  // Build SVG chart
  const width = 720;
  const height = 280;
  const pad = { left: 58, right: 48, top: 24, bottom: 38 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  // Find IV range
  const ivValues = smileData.map(d => d.iv);
  const minIV = Math.min(...ivValues);
  const maxIV = Math.max(...ivValues);
  const ivPadding = (maxIV - minIV) * 0.1;
  const ivMin = minIV - ivPadding;
  const ivMax = maxIV + ivPadding;

  // Scales
  const xScale = (strike) => pad.left + ((strike - strikes[0]) / (strikes[strikes.length - 1] - strikes[0])) * plotW;
  const yScale = (iv) => pad.top + ((ivMax - iv) / (ivMax - ivMin)) * plotH;

  // Build path
  const pathData = smileData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(d.strike).toFixed(1)} ${yScale(d.iv).toFixed(1)}`
  ).join(' ');

  // Grid lines and labels
  const xTicks = [strikes[0], spot * 0.9, spot, spot * 1.1, strikes[strikes.length - 1]];
  const yTicks = [ivMin, (ivMin + ivMax) / 2, ivMax];

  const gridLines = xTicks.map(strike =>
    `<line class="grid-line" x1="${xScale(strike).toFixed(1)}" y1="${pad.top}" x2="${xScale(strike).toFixed(1)}" y2="${height - pad.bottom}"/>
     <text class="tick-label" x="${xScale(strike).toFixed(1)}" y="${height - 10}" text-anchor="middle">${strike.toFixed(0)}</text>`
  ).join('');

  const yGridLines = yTicks.map(iv =>
    `<line class="grid-line" x1="${pad.left}" y1="${yScale(iv).toFixed(1)}" x2="${width - pad.right}" y2="${yScale(iv).toFixed(1)}"/>
     <text class="tick-label" x="${pad.left - 8}" y="${yScale(iv).toFixed(1) + 4}" text-anchor="end">${(iv * 100).toFixed(1)}%</text>`
  ).join('');

  // ATM marker
  const atmMarker = `<circle cx="${xScale(spot).toFixed(1)}" cy="${yScale(atmIV).toFixed(1)}" r="4" fill="var(--cyan)" stroke="var(--bg-primary)" stroke-width="2"/>`;

  const svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Volatility Smile">
    <defs>
      <linearGradient id="volBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(57,199,229,.08)"/>
        <stop offset="100%" stop-color="rgba(57,199,229,.02)"/>
      </linearGradient>
    </defs>
    <rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="url(#volBg)" rx="2"/>
    ${gridLines}
    ${yGridLines}
    <path class="vol-smile-curve" d="${pathData}" stroke="var(--cyan)" stroke-width="2.5" fill="none"/>
    ${atmMarker}
    <text class="axis-label" x="${width / 2}" y="${height - 4}" text-anchor="middle">Strike</text>
    <text class="axis-label" x="${pad.left - 8}" y="16">IV</text>
    <text class="axis-label" x="${xScale(spot).toFixed(1)}" y="${pad.top - 6}" text-anchor="middle" fill="var(--cyan)">ATM</text>
  </svg>`;

  chartDiv.innerHTML = svg;

  const infoDiv = document.getElementById("volSurfaceInfo");
  if (infoDiv) {
    infoDiv.innerHTML = `
      <div class="vol-summary">
        <span><strong>ATM IV:</strong> ${(atmIV * 100).toFixed(1)}%</span>
        <span><strong>Put Skew:</strong> ${putSkew}%</span>
        <span><strong>DTE:</strong> ${dte}d</span>
      </div>
      <p class="vol-note">💡 Equity 典型特征：Put skew（OTM put 比 ATM 贵），反映市场对下行风险的恐慌溢价</p>
    `;
  }
}

function renderGreeksDecay() {
  const chartDiv = document.getElementById("greeksDecayChart");
  if (!chartDiv) return;

  const spot = state.scenario.spot;
  const optionLegs = (state.legs || []).filter((leg) => leg.type === "option");
  const info = document.getElementById("greeksDecayInfo");
  if (!optionLegs.length) {
    if (info) info.textContent = "组合级 | 当前策略没有期权腿";
    chartDiv.innerHTML = '<p class="empty-state">当前策略没有期权腿，因此 Gamma / Theta / Vega Decay 接近 0。</p>';
    return;
  }

  const strikeInput = document.getElementById("greeksDecayStrike");
  const moneynessBtn = document.querySelector(".decay-preset-btn.active");
  const moneyness = moneynessBtn ? moneynessBtn.dataset.decayMoneyness : "atm";
  const originalStrikes = optionLegs.map((leg) => Number(leg.strike) || spot);
  const anchorStrike = originalStrikes.reduce((sum, strike) => sum + strike, 0) / originalStrikes.length;
  const optionTypes = new Set(optionLegs.map((leg) => leg.optionType));
  const firstType = optionLegs[0]?.optionType || "call";
  const isMixedType = optionTypes.size > 1;

  let centerStrike;
  let presetLabel = moneyness.toUpperCase();
  if (strikeInput && strikeInput.value) {
    centerStrike = Number(strikeInput.value);
    presetLabel = "Custom";
  } else if (moneyness === "itm") {
    centerStrike = !isMixedType && firstType === "put" ? spot * 1.05 : spot * 0.95;
  } else if (moneyness === "otm") {
    centerStrike = !isMixedType && firstType === "put" ? spot * 0.95 : spot * 1.05;
  } else {
    centerStrike = spot;
  }
  if (!Number.isFinite(centerStrike) || centerStrike <= 0) centerStrike = spot;

  const adjustedLegs = (state.legs || []).map((leg) => {
    if (leg.type !== "option") return leg;
    const originalStrike = Number(leg.strike) || anchorStrike;
    return {
      ...leg,
      strike: Math.max(0.01, centerStrike + (originalStrike - anchorStrike)),
    };
  });

  const avgIv = optionLegs.reduce((sum, leg) => sum + (Number(leg.iv) || 0.32), 0) / optionLegs.length;
  const rate = state.scenario.rate || 0.05;
  const dividend = state.scenario.dividend || 0;
  const multiplier = Number.isFinite(Number(state.scenario.multiplier)) ? Number(state.scenario.multiplier) : 100;
  const frontDte = Math.min(...optionLegs.map((leg) => Number(leg.dte) || 45));

  const dteSlider = document.getElementById("greeksDecayDte");
  const maxDte = dteSlider ? Number(dteSlider.value) : 45;

  if (info) {
    const typeLabel = isMixedType ? "MIXED" : firstType.toUpperCase();
    info.textContent = `组合级 | ${optionLegs.length} 条期权腿 | ${typeLabel} | Center=$${centerStrike.toFixed(0)} (${presetLabel}) | Avg IV=${(avgIv * 100).toFixed(0)}%`;
  }

  const aggregateGreeksAtDte = (frontRemainingDte) => {
    return adjustedLegs.reduce((sum, leg) => {
      const qty = Number.isFinite(Number(leg.qty)) ? Number(leg.qty) : 1;
      const scale = sideSign(leg.side) * qty * multiplier;
      if (leg.type === "stock") {
        sum.delta += scale;
        return sum;
      }

      const originalDte = Number(leg.dte) || frontDte;
      const remainingDte = Math.max(0.2, frontRemainingDte + (originalDte - frontDte));
      const legIv = Math.max(0.01, (Number(leg.iv) || 0.32) + (state.scenario.ivShift || 0));
      const model = optionModel(leg.optionType, spot, Number(leg.strike), remainingDte, rate, dividend, legIv);
      sum.delta += scale * model.delta;
      sum.gamma += scale * model.gamma;
      sum.theta += scale * model.theta;
      sum.vega += scale * model.vega;
      return sum;
    }, { delta: 0, gamma: 0, theta: 0, vega: 0 });
  };

  const valueRange = (pts) => {
    const values = pts.map((p) => p.value).filter(Number.isFinite);
    let min = Math.min(0, ...values);
    let max = Math.max(0, ...values);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = -1;
      max = 1;
    }
    if (Math.abs(max - min) < 1e-6) {
      const padding = Math.max(Math.abs(max) * 0.2, 1);
      min -= padding;
      max += padding;
    } else {
      const padding = (max - min) * 0.08;
      min -= padding;
      max += padding;
    }
    return { min, max };
  }

  // Sample Greeks at 70 points from 0.2 to maxDte
  const numPoints = 70;
  const gammaPts = [];
  const thetaPts = [];
  const vegaPts = [];
  for (let i = 0; i <= numPoints; i++) {
    const dte = Math.max(0.2, maxDte * i / numPoints);
    const result = aggregateGreeksAtDte(dte);
    gammaPts.push({ dte, value: result.gamma });
    thetaPts.push({ dte, value: result.theta });
    vegaPts.push({ dte, value: result.vega });
  }

  const gammaRange = valueRange(gammaPts);
  const thetaRange = valueRange(thetaPts);
  const vegaRange = valueRange(vegaPts);

  // SVG dimensions
  const width = 720;
  const height = 320;
  const pad = { left: 58, right: 58, top: 24, bottom: 38 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const xScale = (dte) => pad.left + ((dte - 0) / (maxDte || 1)) * plotW;
  const rangeY = (range) => (v) => pad.top + ((range.max - v) / (range.max - range.min || 1)) * plotH;
  const gammaY = rangeY(gammaRange);
  const vegaY = rangeY(vegaRange);
  const thetaY = rangeY(thetaRange);

  // Build SVG paths
  const buildPath = (pts, yFn) => pts.map((p, j) =>
    `${j === 0 ? "M" : "L"} ${xScale(p.dte).toFixed(1)} ${yFn(p.value).toFixed(1)}`
  ).join(" ");

  // Grid + tick labels
  const xTicks = [0, maxDte * 0.25, maxDte * 0.5, maxDte * 0.75, maxDte];
  const gridLines = xTicks.map(t =>
    `<line class="grid-line" x1="${xScale(t).toFixed(1)}" y1="${pad.top}" x2="${xScale(t).toFixed(1)}" y2="${height - pad.bottom}"/>
     <text class="tick-label" x="${xScale(t).toFixed(1)}" y="${height - 10}" text-anchor="middle">${t.toFixed(0)}d</text>`
  ).join("");

  const svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Greeks Decay">
    <defs>
      <linearGradient id="decayBg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(159,131,255,.06)"/>
        <stop offset="100%" stop-color="rgba(159,131,255,.01)"/>
      </linearGradient>
    </defs>
    <rect x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="url(#decayBg)" rx="2"/>
    ${gridLines}
    <!-- Gamma curve (left axis) -->
    <path class="decay-gamma" d="${buildPath(gammaPts, gammaY)}"/>
    <!-- Theta curve (bottom half of right axis) -->
    <path class="decay-theta" d="${buildPath(thetaPts, thetaY)}"/>
    <!-- Vega curve (top half, shares right concept) -->
    <path class="decay-vega" d="${buildPath(vegaPts, vegaY)}"/>
    <!-- Labels -->
    <text class="axis-label" x="${width - pad.right + 4}" y="16" text-anchor="start">DTE →</text>
    <text class="axis-label decay-axis-gamma" x="${pad.left - 8}" y="16">Gamma</text>
    <text class="axis-label decay-axis-vega" x="${width - pad.right + 4}" y="${pad.top + 14}" text-anchor="start">Vega</text>
    <text class="axis-label decay-axis-theta" x="${width - pad.right + 4}" y="${pad.top + 28}" text-anchor="start">Theta</text>
  </svg>`;

  // Legend with current values at maxDte
  const cur = aggregateGreeksAtDte(maxDte);
  chartDiv.innerHTML = `
    <div class="decay-legend">
      <span class="legend-item" style="color:var(--violet)"><span class="legend-line"></span>Gamma ${cur.gamma.toFixed(4)}</span>
      <span class="legend-item" style="color:var(--cyan)"><span class="legend-line"></span>Theta ${cur.theta.toFixed(4)}/day</span>
      <span class="legend-item" style="color:var(--green)"><span class="legend-line"></span>Vega ${cur.vega.toFixed(4)}</span>
    </div>
    ${svg}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const greeksDecayDte = document.getElementById("greeksDecayDte");
  const greeksDecayDteOutput = document.getElementById("greeksDecayDteOutput");
  if (greeksDecayDte && greeksDecayDteOutput) {
    greeksDecayDte.addEventListener("input", (e) => {
      greeksDecayDteOutput.textContent = e.target.value;
      renderGreeksDecay();
    });
  }
  // Greeks Decay: moneyness preset buttons
  document.querySelectorAll(".decay-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".decay-preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const strikeInput = document.getElementById("greeksDecayStrike");
      if (strikeInput) strikeInput.value = "";
      renderGreeksDecay();
    });
  });
  const greeksDecayStrike = document.getElementById("greeksDecayStrike");
  if (greeksDecayStrike) {
    greeksDecayStrike.addEventListener("input", () => {
      document.querySelectorAll(".decay-preset-btn").forEach(b => b.classList.remove("active"));
      renderGreeksDecay();
    });
  }
});
