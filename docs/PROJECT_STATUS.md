# Project Status And Roadmap

## 2026-05-28 Update: D1 Learning Hub Phase 4A/4B

Phase 4A/4B (Dealer Hedging, Market Making, Dynamic Hedging, and P&L Attribution) is now implemented as Month 4.

- Learning Hub now contains 19 modules: Month 1 Greeks, Month 2 strategy construction, Month 3 volatility framework, and Month 4 dealer/market-making modules.
- Scenario Bank now contains 155 scenarios: 30 Month 1 foundation records, 40 Month 2 construction records, 45 Month 3 volatility records, and 40 Month 4 dealer records.
- New Strategy Construction tab renders 5 comparison cards: Straddle vs Strangle, Iron Condor vs Short Strangle, Collar vs Protective Put, Bull Call Spread vs Long Call, and Calendar Spread vs Vertical Spread.
- New Client Recommendation tab renders 20 guided client structure drills.
- Vol Framework tab renders 5 volatility framework cards, an RV/IV breakeven mini calculator, and a 9-card Vol trade playbook covering long vol, short vol, event, skew, term-structure, and surface-bucket setups.
- Dealer Desk tab renders 6 dealer workflow cards and 6 P&L attribution cards.
- Gamma P&L tool now includes rehedge threshold, transaction cost, Static P&L, Dynamic P&L, hedge count, and transaction-cost attribution.
- Client drills reveal objective, profile, constraints, candidates, recommendation, risks, Dealer note, professional expression, and follow-ups step by step.
- Client drill completion and revealed step progress persist in localStorage.
- Scenario filters now support category, month, and topic, including vol/skew/term-structure/event/surface/short-vol/gamma/liquidity/dealer/hedging/quote/attribution/inventory filters.
- All 155 Learning Hub scenarios now have explicit Chinese localization records.
- Next D1 roadmap implementation should move to Phase 5: exotics and structuring bridge.

最后更新：2026-05-28

## 当前结论

项目当前是一个本地静态期权策略教学与专业训练工具，核心功能已经可以验收。当前完成度按学习/专业训练用途评估为 95%+；D1-to-Derivatives Learning Hub Phase 1、Phase 2A、Phase 2B、Phase 3A、Phase 3B 和 Phase 4A/4B 已实现，用于把用户的 commodities D1 经验系统转换成 equity derivatives 专业优势。

## 2026-05-28 完整验收记录

结论：Phase 1 / 2A / 2B / 3A / 3B / 4A / 4B 可验收。

已通过检查：

- 静态语法：`node --check app.js`、`node --check data/professional-content.js`、`node --check data/learning-content.js`。
- 空白/补丁检查：`git diff --check`。
- 数据完整性：19 modules、155 scenarios、20 client drills、5 strategy comparisons、5 vol framework cards、9 vol playbook cards、6 dealer workflow cards、6 P&L attribution cards。
- 场景分布：Month 1 = 30、Month 2 = 40、Month 3 = 45、Month 4 = 40。
- 本地化与引用：155 个 Scenario Bank 场景中文 localization 完整；scenario-module links 与 strategy links 无坏引用。
- 桌面 Playwright spot check：Learning Hub、Strategy Construction、Client Drills、Vol Framework、Dealer Desk、Gamma P&L、Scenario filters、Professional tools 均正常，无 page error / console error。
- 移动端 390x844 Playwright spot check：Learning modules、Vol Framework、Dealer Desk、Month 4 scenario filter 均正常，无 page error / console error。
- 自动化回归：`npm test` 结果为 `13 passed (14.4s)`。

保留限制：当前仍是静态教学与训练平台，不接入实时行情、真实期权链、真实 broker margin 或真实做市执行系统。

## 已完成范围

### 基础与教学

- 71 个基础策略。
- 搜索、分类筛选、难度标记、策略 hover 预览。
- 主损益图：开仓日、当前情景、到期曲线。
- 概率锥：概率分布、盈利概率、`-2σ / -1σ / +1σ / +2σ` 标注。
- 逐腿分解：组合曲线 + 每条腿曲线。
- Greeks 六联图：Risk/PnL、Delta、Gamma、Theta、Vega、Rho。
- 情景参数、风险指标、腿组合编辑。
- 详细 Notes：赚钱来源、风险、场景、参数、管理、陷阱、相关策略。
- 学习路径与完成标记。
- 重置确认弹窗。

### 进阶模式

- 40 个策略的 Trader Memo。
- Professional Concepts 独立面板。
- 专业工具面板（Tabbed Interface）：
  - 压力测试矩阵
  - Put-Call Parity 计算器
  - Portfolio Greeks 聚合器
  - Gamma P&L 与动态对冲模拟，含 rehedge threshold、transaction cost、Static/Dynamic P&L
  - Vol Surface 教育性 smile/skew
  - 组合级 Greeks Decay

### 专业模式

- 141 个专业问答。
- 专业问答覆盖 Greeks、策略构建、风险管理、客户视角、Dealer 对冲、参数选择和常见比较题。

### D1-to-Derivatives Learning Hub

- 六个月 roadmap，已开放 Month 1 Greeks、Month 2 Strategy Construction、Month 3 Volatility Framework 和 Month 4 Dealer Hedging / Market Making。
- Month 1 Greeks：Delta、Gamma、Vega、Theta/Rho。
- Month 2 Strategy Construction：vertical spreads、straddles/strangles、condors/butterflies、protection structures。
- Month 3 Volatility Framework：RV/IV、event vol、equity skew、term structure、vol surface reading。
- Month 4 Dealer Hedging / Market Making：client flow、inventory、delta hedging、gamma scalping、vega buckets、quote skewing、P&L attribution。
- Commodities Bridge：D1 commodities 经验到 equity derivatives 的迁移框架。
- Strategy Construction：5 个策略对比卡。
- Client Recommendation：20 个客户结构推荐演练，支持逐步展开和策略链接跳转。
- Vol Framework：5 个 volatility 框架卡 + RV/IV breakeven 小计算器 + 9 个 Vol trade playbook 卡，并可跳转到 Vol Surface 工具。
- Dealer Desk：6 个 dealer workflow 卡 + 6 个 P&L attribution 卡，并可跳转到 Gamma P&L 工具。
- Scenario Bank：155 个 client/risk/P&L/market-making/strategy 场景，支持 category/month/topic 过滤。
- 中文本地化：155 个 Scenario Bank 场景、9 个 Vol trade playbook、6 个 dealer workflow 和 6 个 P&L attribution 均有中文 override，不再依赖英文 fallback。
- 本地进度追踪：模块完成、场景完成、客户推荐演练完成、逐步展开状态、复习标记和当前学习 tab。
- 已批准 Phase 1 MVP 规格：`docs/superpowers/specs/2026-05-27-d1-to-derivatives-learning-system-design.md`。
- 已新增长期 Master Roadmap：`docs/superpowers/specs/2026-05-27-d1-to-derivatives-master-roadmap.md`。
- 已新增 Phase 1 实施计划：`docs/superpowers/plans/2026-05-27-d1-learning-hub-phase1.md`。
- 暂不实施：完整 250+ 专业题库、exotics 定价器、高级情景演练 dashboard、真实行情或后端。

### 测试

当前 Playwright 测试套件：

- `tests/smoke.spec.js`：基础渲染、策略切换、hover 预览、reset confirm。
- `tests/phase2.spec.js`：学习路径、难度提示、逐腿分解。
- `tests/phase3.spec.js`：概率锥、sigma 标注、增强 Notes。
- `tests/professional.spec.js`：进阶/专业模式、Professional Concepts、组合级 Greeks Decay、压力测试、Parity、Portfolio、增强 Gamma P&L。
- `tests/learning-hub.spec.js`：D1 Learning Hub、tab、filter、answer reveal、client drill step reveal、Vol Framework/RV-IV calculator、Vol trade playbook、Dealer Desk、P&L attribution、progress persistence、策略跳转。
- `tests/learning-hub.spec.js` 同时检查 Scenario Bank 与 Vol trade playbook 的中文本地化完整性。

最近验收命令：

```bash
node --check app.js
node --check data/professional-content.js
node --check data/learning-content.js
npm test
```

## 当前已知限制

### 模型限制

- 使用教育性 Black-Scholes 模型，不是实时市场定价。
- 未接入真实期权链、bid/ask、成交量、open interest、实时利率、真实股息。
- 股票期权通常是美式期权，本项目没有提前行权/指派概率模型。
- 概率锥和盈利概率基于简化分布假设。
- Vol Surface 是教学图，不是真实市场曲面。

### 风险与保证金限制

- Portfolio Margin 是教育性估算，不符合真实 broker、FINRA Rule 4210 或 Cboe 的完整规则。
- 未建模滑点、手续费、税务、借券成本、流动性和市场冲击。
- Gamma P&L 对冲模拟是路径教学，不是执行系统。

### 内容限制

- 71 个策略都有基础说明，但只有 40 个策略有专业 Trader Memo。
- 141 个专业问答覆盖核心内容，但新增策略未必每个都有固定 5 问。
- 20 个客户推荐演练、45 个 Month 3 vol 场景和 40 个 Month 4 dealer 场景覆盖常见结构推荐、vol 判断、dealer flow、hedging 与 P&L attribution 场景，但仍是教育性框架，不是实际 suitability advice、交易信号或真实做市系统。
- 仍可继续补充真实案例、专业追问、错误答案示例和策略对比表。

## 近期优先级

### P0：文档与验收基线

状态：已完成。

- 合并旧 Phase/bugfix 文档。
- 明确当前唯一准绳：`README.md`、`USER_GUIDE.md`、`docs/PROJECT_STATUS.md`、`docs/IMPLEMENTATION_HISTORY.md`。
- 保留 `docs/superpowers/` 作为早期规格参考。

### P1：D1-to-Derivatives 后续扩展

目标：基于 Phase 1 + Phase 2A + Phase 2B + Phase 3A + Phase 3B + Phase 4A/4B 使用反馈，进入 exotics 与 structuring bridge。

建议顺序：

1. Phase 5：Asian、Barrier、Quanto、Structured Products bridge。
2. Phase 5B：Exotics risk decomposition、issuer/dealer risk、client suitability cases。
3. Phase 6：Scenario drills、wrong-answer notebook、skill dashboard。

详细蓝图见 `docs/superpowers/specs/2026-05-27-d1-to-derivatives-master-roadmap.md`。

### P1：内容覆盖扩展

目标：把专业内容从 40 个策略扩展到更多策略，优先补常见专业与实战策略。

建议顺序：

1. Long Put Butterfly、Bull Put Spread、Call/Put Broken Wing、Double Diagonal。
2. Covered Put、Stock Repair、Double Bull/Bear Spread。
3. Short Calendar、Short Diagonal、更多 ratio/ladder 类策略。
4. 每个新增策略至少补 exposure、赚钱逻辑、风险、客户适当性、Dealer hedge、3-5 个专业问答。

### P1：教学体验细化

目标：让学习链路更顺。

- hover 预览从文字升级为小型 payoff sparkline。
- Notes 中加入“常见误解”和“专业表达易错回答”。
- 策略对比视图：例如 Iron Condor vs Short Strangle、Straddle vs Strangle。
- 学习进度导出/导入。

### P2：市场真实性

目标：从教学模型走向更贴近真实交易。

- 导入真实期权链 CSV。
- bid/ask、mid、spread、手续费、滑点。
- IV Rank、Historical Vol、Expected Move。
- 真实期限结构和 strike-by-strike IV。
- Early exercise / assignment 风险提示。

### P2：风险管理增强

- 更完整的 stress scenarios。
- Portfolio Greeks limit 自定义。
- 多 underlying 相关性。
- VaR / expected shortfall 教学版。
- 组合情景保存与回放。

### P3：输出与工作流

- 策略配置导入/导出。
- 图表导出图片或 PDF。
- 专业题随机抽查和错题本。
- 移动端布局优化。
- 中英文切换。

### P4：高级衍生品

- Barrier、Asian、Digital 等 exotic 教学页。
- Structured products 案例。
- Vol arbitrage、dispersion、correlation 主题。

## 验收标准

后续每轮增强至少满足：

1. `node --check app.js` 通过。
2. `node --check data/professional-content.js` 通过。
3. `node --check data/learning-content.js` 通过。
4. `npm test` 通过。
5. `git diff --check` 通过。
6. 浏览器手测覆盖新增 UI 的可见性、状态切换和关键计算。
7. 文档同步更新，不再新增互相冲突的 Phase 文档。

## 文档维护规则

- 当前功能状态写入本文档。
- 用户操作说明写入 `USER_GUIDE.md`。
- 项目入口、安装、测试写入 `README.md`。
- 历史过程、已解决问题写入 `docs/IMPLEMENTATION_HISTORY.md`。
- 不再新增 `PHASE*_SUMMARY.md`、`BUGFIX_SUMMARY.md` 这类根目录流水账文档。
