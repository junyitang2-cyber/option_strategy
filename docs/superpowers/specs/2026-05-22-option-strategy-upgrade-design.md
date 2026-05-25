# Option Strategy Interactive Lab — 升级设计规格

**Date**: 2026-05-22
**Status**: Draft
**Topic**: 从纯前端教学工具升级为支持真实行情数据的策略分析平台

---

## Context

当前 `option_strategy` 是一个零依赖的纯前端期权策略教学工具，包含 55+ 策略定义、Black-Scholes 定价、SVG 图表渲染和教育系统。所有参数硬编码 (SPOT=100, IV=0.32)。

用户是 broker trader，日常工作流程:
1. 从 Reuters Eikon 导出期权链数据到 Excel
2. 从 broker/上手获取期权 b/a vol 报价
3. 需要: IV 反推、fair price 比较、策略风险分析、多策略横向对比、历史回测

**目标**: 保留现有教学工具的全部能力，新增实盘分析模式。

---

## Architecture

```
Reuters Eikon → Excel文件 → pandas读取
                                ↓
┌──────────────────────────────────────────────────────────┐
│                 Python FastAPI 后端 (新增)                 │
│                                                          │
│  data/excel_reader.py    ← 读取Reuters Excel，输出标准化期权链 │
│  pricing/black_scholes.py ← BS定价 + Greeks (scipy)       │
│  pricing/iv_solver.py    ← IV反推 (Brent root-finding)    │
│  pricing/fair_value.py   ← broker vol vs fair price 比价  │
│  strategy/engine.py      ← 单策略风险分析                  │
│  strategy/compare.py     ← 多策略横向对比                  │
│  backtest/engine.py      ← 历史回测引擎                    │
│  api/routes.py           ← REST API 路由                  │
│                                                          │
│  启动: uvicorn main:app --host 0.0.0.0 --port 8765        │
└─────────────────────┬────────────────────────────────────┘
                      │ JSON over HTTP
                      ▼
┌──────────────────────────────────────────────────────────┐
│              现有 HTML/CSS/JS 前端 (增强)                   │
│                                                          │
│  教学模式 (离线)          实盘模式 (需Python后端)            │
│  ├─ 55+策略定义           ├─ 上传Excel → 后端解析           │
│  ├─ 硬编码参数            ├─ 真实期权链 + IV反推结果        │
│  ├─ BS定价 + Greeks       ├─ Fair Value 比价面板            │
│  ├─ SVG图表 + 教育        ├─ 策略风险分析 (实时数据)         │
│  └─ 零依赖，直接打开       ├─ 多策略对比叠加                  │
│                           └─ 回测结果展示                   │
│                                                          │
│  通用增强: hover tooltip / URL持久化 / 对比叠加 / Bug修复    │
└──────────────────────────────────────────────────────────┘
```

**设计原则**: 两个模式共存。教学模式保持零依赖 (直接浏览器打开 index.html)。实盘模式需要先启动 Python 后端。

---

## Python Backend Design

### data/excel_reader.py

```
输入: Reuters Excel 文件路径
输出: 标准化 OptionChain (pandas DataFrame)

功能:
- pandas.read_excel() 读取
- 列映射配置 (JSON), 适配不同版本的路透导出格式
- 自动识别: underlying spot, strike, call/put, bid/ask, expiry, rate, dividend
- 清洗: 去NaN行, 标准化expiry日期, 统一货币单位
- 输出 columns:
  ['symbol','expiry','strike','type','bid','ask','mid','volume','open_interest']
```

### pricing/black_scholes.py

```
- 用 scipy.stats.norm 实现 BS 定价 + 5个Greeks
- API: bs_price(S, K, T, r, q, sigma, option_type) -> {price, delta, gamma, theta, vega, rho}
- 支持 call/put
```

### pricing/iv_solver.py

```
- 输入: market_price, S, K, T, r, q, option_type
- 方法: scipy.optimize.root_scalar (Brent's method)
- 求解: BS(sigma) - market_price = 0
- 边界: sigma ∈ [0.001, 5.0]
- 返回: {iv, iterations, converged, error_msg}
- 对期权链批量计算, 构建 IV skew/smile 数据
```

### pricing/fair_value.py

```
- 输入: option_chain + broker_bid_vol + broker_ask_vol
- 计算:
  1. 用 broker vol 反推 broker 理论价
  2. 用自己的 IV 计算 fair price (取 bid/ask/mid 的 mid 反推)
  3. mispricing = broker_price - fair_price
- 输出: 每行 + {broker_bid, broker_ask, fair_price, rich/cheap/fair 判断}
```

### strategy/engine.py

```
- 迁移现有 JS STRATEGIES 的策略 leg 定义结构
- 输入: 策略定义 + 真实期权链 (pandas DataFrame)
- 逻辑:
  1. 对每个 leg, 从期权链匹配合约 (strike + expiry + type)
  2. 汇总组合 P&L, Greeks
  3. 计算 max_profit, max_loss, breakevens
- 输出:
  { strategy_name, legs_matched[], entry_cost, max_profit, max_loss,
    breakevens[], current_pnl, greeks: {delta,gamma,theta,vega,rho},
    payoff_curve: [{spot, pnl}...] }
```

### strategy/compare.py

```
- 输入: 多个策略定义 + 同一份期权链
- 并行调用 engine.py
- 输出: 对比表 [{strategy, cost, max_profit, max_loss, risk_reward_ratio, ...}]
- 支持按风险收益比/最大亏损/成本排序
```

### backtest/engine.py

```
- 输入: 策略定义 + 历史期权链数据 (多日, 含历史成交价)
- 方法: 逐日模拟建仓 → 持有 → 到期/平仓
- 输出:
  { total_trades, win_rate, avg_win, avg_loss, profit_factor,
    max_drawdown, sharpe_ratio, daily_pnl: [{date, pnl}...],
    equity_curve: [{date, equity}...] }
```

### api/routes.py

| 端点 | 方法 | 功能 |
|---|---|---|
| `/api/upload-excel` | POST | 上传 Reuters Excel, 返回解析后的期权链 JSON |
| `/api/iv-surface` | POST | 输入期权链, 返回每行 IV + skew 数据 |
| `/api/fair-value` | POST | 期权链 + broker vol → 定价偏差分析 |
| `/api/strategy/analyze` | POST | 策略 + 期权链 → 风险指标 + payoff 曲线 |
| `/api/strategy/compare` | POST | 多策略 + 期权链 → 横向对比表 |
| `/api/backtest/run` | POST | 策略 + 历史数据 → 回测报告 |

**API 关键设计决策**: 策略定义 (legs) 由前端作为 JSON 发送, 不做 Python 端重复定义。
前端是策略数据的唯一真实来源, 后端只负责计算。

`POST /api/strategy/analyze` 请求体示例:
```json
{
  "option_chain": [
    {"expiry":"2026-06-19","strike":95,"type":"P","bid":1.80,"ask":1.95,"mid":1.875}
  ],
  "strategy": {
    "name": "Iron Condor",
    "legs": [
      {"type":"option","side":"sell","optionType":"call","strike":105,"dte":28,"iv":0.34,"qty":1},
      {"type":"option","side":"buy","optionType":"call","strike":110,"dte":28,"iv":0.32,"qty":1}
    ]
  },
  "scenario": {"spot":100.5,"rate":0.04,"dividend":0.015,"multiplier":100}
}
```

---

## Frontend Enhancements

### Mode Toggle (新增)

顶部栏加开关: `教学模式 ◉━━○ 实盘模式`
- 教学模式: 离线, 现有逻辑不变
- 实盘模式: 需要 Python 后端运行, 数据从 API 拉取

### New Panels (实盘模式)

1. **数据面板**: 上传 Excel 按钮 + 期权链摘要 (标的现价, 合约数, IV 偏斜小图)
2. **Fair Value 比价面板**: 表格展示每组合约的 broker bid/ask vs fair price + 偏差标记
3. **回测结果面板** (Phase 2): 权益曲线 + 统计指标 (胜率, 盈亏比, Sharpe 等)

### Chart Interaction Upgrades

| 改进 | 实现 |
|---|---|
| Hover tooltip | SVG `<title>` + `mousemove`, 显示 (spot, PnL) |
| 盈亏平衡标签 | breakeven 线旁直接标注数值 |
| 对比叠加 | 第二条策略曲线以虚线叠加, 通过对比模式开关控制 |
| 双击缩放 | 双击图表区域放大到 ±20% 范围 |

### Bug Fixes

| Bug | 文件:行号 | 修复方案 |
|---|---|---|
| `0 \|\| default` 将有效零值静默替换 | app.js:1363,1365,1370 | 改为 `??` (nullish coalescing) |
| `optionModel()` NaN 传播 | app.js:1293 | 入口加 `if(isNaN(t)) return zeroResult()` |
| Delta Neutral slug 破损 | app.js:979 | 名称改为 `"Delta Neutral / Delta 中性"` |
| `replaceAll` 旧浏览器不兼容 | app.js:1243-1247 | 改为 `.replace(/[&<>"']/g, ...)` 正则 |
| `riskMetrics` 硬编码阈值不可靠 | app.js:1433-1437 | 阈值改为相对值 (基于 portfolio notional 的 %) |

### URL State Persistence (新增)

```
URL 格式:
?s=iron-condor&spot=100&ivShift=5&days=7&rate=4&div=1.5&mult=100

- s: strategy slug
- spot, rate, div, mult: 情景参数
- ivShift, days: 滑块位置

boot() 时读取 URLSearchParams 恢复状态
每次修改用 history.replaceState 更新 URL
支持浏览器前进/后退
```

### Performance

| 改进 | 实现 |
|---|---|
| 期权模型计算结果缓存 | `portfolioResult()` 加 memoization, key=(spot, daysElapsed, leg_hash) |
| 希腊值小图复用曲线数据 | `curveData()` 一次计算, 6个面板共享 |

---

## Implementation Plan

### Phase 1: Core Pipeline (优先)

**Python 后端:**
- [ ] `data/excel_reader.py` — Reuters Excel 解析
- [ ] `pricing/black_scholes.py` — BS 定价 + Greeks
- [ ] `pricing/iv_solver.py` — IV 反推
- [ ] `pricing/fair_value.py` — Fair value 比价
- [ ] `strategy/engine.py` — 单策略分析
- [ ] `api/routes.py` — FastAPI 路由 + 启动

**前端增强:**
- [ ] 模式切换开关 (教学/实盘)
- [ ] 数据面板 (上传 Excel + 期权链摘要)
- [ ] Fair Value 比价面板
- [ ] 策略分析接入真实数据
- [ ] 图表 hover tooltip
- [ ] URL 状态持久化
- [ ] Bug 修复 (5 处)

### Phase 2: Advanced Features

**Python 后端:**
- [ ] `strategy/compare.py` — 多策略横向对比
- [ ] `backtest/engine.py` — 历史回测引擎

**前端增强:**
- [ ] 多策略对比叠加模式
- [ ] 回测结果展示 (权益曲线 + 统计)
- [ ] IV 偏斜曲线小图
- [ ] 策略保存/收藏 (localStorage)

---

## Verification

### Phase 1 验证:

1. **后端单元测试**: BS 定价 vs 已知值 (ATM call, delta ~0.5 等)
2. **IV 反推验证**: 用已知 vol 生成价格 → 反推应回到原 vol (误差 < 0.01%)
3. **Fair value 验证**: 手工构造 bid/ask → 验证 rich/cheap 判断
4. **端到端**: 上传样本 Excel → 解析成功 → 选策略 → 图表展示真实 P&L
5. **教学模式回归**: 不启动后端, 直接打开 index.html, 全部功能正常

### Phase 2 验证:

1. **回测验证**: 用简单策略 (Long Call) + 模拟历史数据, 手工验算一期 P&L
2. **对比模式**: 两个策略叠加在同一图表, 曲线颜色区分, 图例正确
3. **URL 持久化**: 修改参数 → 刷新 → 状态恢复正确
