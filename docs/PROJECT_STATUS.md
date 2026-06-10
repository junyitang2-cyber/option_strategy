# Project Status And Roadmap

## 2026-05-29 Update: Phase 7C Content Quality Normalization

Phase 7C is now implemented.

- All 71 professional strategy records now meet the current quality bar: at least 3 professional Q&A items and at least 3 common wrong-expression records.
- Strategy-level professional Q&A coverage increased from 234 to 257 items.
- Legacy records with enough Q&A but no `commonMistakes` were backfilled with strategy-specific common wrong-expression guidance.
- The 15 older sparse records were also topped up to at least 3 professional Q&A items.
- `tests/professional-content.spec.js` now enforces this quality bar across every professional strategy, not only Phase 7A/7B targets.

## 2026-05-29 Update: Phase 7 Acceptance Review

Phase 7A/7B passed acceptance review before Phase 7C normalization.

- Coverage audit: 71 strategies, 71 professional strategy records, 234 strategy-level professional Q&A items.
- Phase 7A/7B target audit: all 31 newly covered strategies have Trader Memo, at least 3 professional Q&A items, and at least 3 common wrong-expression records.
- Stale/missing ID audit: no strategy is missing professional content, and no professional strategy record points to a removed strategy ID.
- Visible wording audit: current UI tests still guard against external-facing Interview/面试/Q&A wording.
- The then-residual quality-normalization item has since been resolved by Phase 7C.

## 2026-05-29 Update: D1 Learning Hub Phase 7B Full Professional Coverage

Phase 7B is now implemented.

- Professional Trader Memo coverage is now complete at 71 of 71 strategies.
- Professional Q&A coverage increased from 180 to 234 items.
- Added professional coverage for the remaining 18 strategies: ladders, synthetics/combos, short guts, double diagonal, Vega/Delta-neutral framework guides, covered put, stock repair, double bull/bear spreads, and short calendars.
- Every Phase 7B target includes common wrong-expression guidance.
- Playwright coverage now verifies Phase 7B data shape, no missing strategy-level professional coverage, and browser rendering for synthetic/framework strategies.

## 2026-05-29 Update: D1 Learning Hub Phase 7A Content Coverage

Phase 7A is now implemented.

- Professional Trader Memo coverage increased from 40 to 53 strategies.
- Professional Q&A coverage increased from 141 to 180 items.
- Added professional coverage for 13 high-value structures including bull put spreads, broken-wing butterflies, covered short-vol structures, short condors, reverse jade lizard, and ratio spreads.
- Added common wrong-expression guidance to newly covered strategies.
- Playwright coverage now verifies Phase 7A data shape and browser rendering.

## 2026-05-29 Update: D1 Learning Hub Phase 6B

Phase 6B is now implemented.

- Professional Sprint questions now support 0/1/2 self-scoring per question.
- Skill Dashboard score now includes sprint self-score quality in addition to module, scenario, client drill, and sprint completion progress.
- Weak-topic recommendations now rank topics by weak marks and coverage gaps, then suggest the next topic-filtered sprint.
- A local progress report export is available from the Professional Sprint panel and persists in `os_d1_learning`.
- Playwright coverage now includes scoring, recommendation-driven session creation, report generation, and persistence.
- Next D1 roadmap work should move to Content Coverage, Market Realism, Risk Management, Output Workflow, or Advanced Derivatives depending on priority.

## 2026-06-11 Update: Sector Topology Restructure + Research Bridge + Easy/Pro Skin Toggle

三项新功能已上线。

### Sector A-E 拓扑重构（commits b1c5b58 / c3bce72）

Learning Hub Roadmap 从六个月 Month 1-5 结构全面迁移至 Sector A-E 拓扑：

- **Sector A — Risk Mechanics**：Greeks 直觉，原 Month 1 内容。
- **Sector B — Trade Construction**：策略构建，原 Month 2 内容。
- **Sector C — Market Dynamics**：Vol 框架与 Dealer Desk，合并原 Month 3（波动率框架）与 Month 4（dealer/market-making），85 个 vol + dealer 场景。
- **Sector D — Research Bridge**（NEW）：把股票研究产出转化为期权决策，见下。
- **Sector E — Complex Products**：Exotics 与结构化产品，原 Month 5 内容。
- **Professional Sprint**：专业冲刺，独立于 A-E 之外。

Scenario Bank 过滤器从 month 编号（1/2/3/4/5）更新为 Sector 按钮（A/B/C/D/E），中文标注"第 X 区"。Scenario Bank 总场景数：**211 个**（Sector A≈30、B≈65、C≈85、D≈20、E≈36，含跨 sector 共享场景）。

### Research Bridge — Sector D（commits f6c5e6e / 86ffbb5 / cb8cd95 / 3de0958）

Learning Hub 新增"Research Bridge / 研究桥接"独立 Tab：

- **Research Desk**：16 张双语研究案例卡，可按类型过滤（earnings / sector-analysis / comps / ic-memo / thesis；中文：业绩前瞻 / 行业分析 / 可比公司 / 首次覆盖 / 投资逻辑）。
- **View-to-Trade 演练**：15 个演练，六步逐步展开（Market View → Constraints → Candidates → Recommendation → Key Risks → Professional Expression），完成标记持久化至 localStorage，进度摘要显示"Research Drills n/15 / 研究演练 n/15"。
- 数据文件：`data/research-bridge-content.js`（16 个研究案例 + 15 个演练）。
- Scenario Bank Sector D 含 20 个研究驱动场景。

### Easy/Pro 皮肤切换（commits 8dc8f1a / aaef21c / 8f35567）

页面右下角新增浮动胶囊按钮：

- **Pro（默认）**：现有深色 terminal 风格。
- **Easy**：浅色模式（#F8FAFC 背景、白色卡片、蓝色主色调）。
- 皮肤选择持久化至 localStorage `os_d1_skin`，与内容模式（Basic/Advanced/Professional）独立。
- `tests/skin.spec.js` 新增 5 个皮肤切换测试。

### 测试状态

当前 Playwright 测试套件：**32 个测试全部通过**（新增 `tests/skin.spec.js`，新增 learning-hub 中 Sector 过滤、Research Bridge 和 Roadmap Sector A-E 验证测试）。

---

## 2026-05-29 Update: D1 Learning Hub Phase 5B And Phase 6

Phase 5B and Phase 6 are now implemented.

- Learning Hub now contains 30 modules: existing Month 1-5 content plus 5 Month 6 Professional Sprint modules.（已重构为 Sector 拓扑，见上 2026-06-11 Update）
- Scenario Bank remains at 191 records; Phase 6 adds 60 Professional Sprint questions, bringing total learning prompts to 251.（Scenario Bank 当前已扩至 211 个场景，见上）
- New Exotics Risk tab renders 6 exotics risk-decomposition drills and 6 model-limit comparison cards across Asian, Barrier, Quanto, Digital, Autocallable, and Structured Product topics.
- New Professional Sprint tab supports topic-filtered sessions, session size controls, rubric reveal, weak-topic marking, question completion, local Skill Dashboard, topic coverage, suggested next session, and weak-topic review notebook.
- Progress continues to persist in localStorage under `os_d1_learning`.
- Phase 6B has since added export, self-scoring, and weak-topic recommendation logic.

## 2026-05-28 Update: D1 Learning Hub Phase 5

Phase 5 (Exotics And Structuring Bridge) is now implemented as Month 5.（已重构为 Sector 拓扑，见上 2026-06-11 Update）

- Learning Hub now contains 25 modules: Month 1 Greeks, Month 2 strategy construction, Month 3 volatility framework, Month 4 dealer/market-making, and Month 5 exotics/structuring modules.
- Scenario Bank now contains 191 scenarios: 30 Month 1 foundation records, 40 Month 2 construction records, 45 Month 3 volatility records, 40 Month 4 dealer records, and 36 Month 5 exotics/structuring records.（已重构为 Sector A-E 拓扑，Scenario Bank 现为 211 个场景）
- New Strategy Construction tab renders 5 comparison cards: Straddle vs Strangle, Iron Condor vs Short Strangle, Collar vs Protective Put, Bull Call Spread vs Long Call, and Calendar Spread vs Vertical Spread.
- New Client Recommendation tab renders 20 guided client structure drills.
- Vol Framework tab renders 5 volatility framework cards, an RV/IV breakeven mini calculator, and a 9-card Vol trade playbook covering long vol, short vol, event, skew, term-structure, and surface-bucket setups.
- Dealer Desk tab renders 6 dealer workflow cards and 6 P&L attribution cards.
- Exotics Bridge tab renders 6 simplified exotic payoff cards and 6 structuring workflow cases.
- Gamma P&L tool now includes rehedge threshold, transaction cost, Static P&L, Dynamic P&L, hedge count, and transaction-cost attribution.
- Client drills reveal objective, profile, constraints, candidates, recommendation, risks, Dealer note, professional expression, and follow-ups step by step.
- Client drill completion and revealed step progress persist in localStorage.
- Scenario filters now support category, month, and topic, including vol/skew/term-structure/event/surface/short-vol/gamma/liquidity/dealer/hedging/quote/attribution/inventory/exotics/asian/barrier/quanto/digital/autocallable/structured-product/path/suitability/cross-asset filters.
- All 191 Learning Hub scenarios now have explicit Chinese localization records.
- Next D1 roadmap implementation can move to Content Coverage, Market Realism, Risk Management, Output Workflow, or Advanced Derivatives.

最后更新：2026-05-29

## 当前结论

项目当前是一个本地静态期权策略教学与专业训练工具，核心功能已经可以验收。当前完成度按学习/专业训练用途评估为 95%+；D1-to-Derivatives Learning Hub Phase 1、Phase 2A、Phase 2B、Phase 3A、Phase 3B、Phase 4A/4B、Phase 5、Phase 5B、Phase 6、Phase 6B、Phase 7A 和 Phase 7B 已实现，用于把用户的 commodities D1 经验系统转换成 equity derivatives 专业优势。

## 2026-05-29 完整验收记录

结论：Phase 1 / 2A / 2B / 3A / 3B / 4A / 4B / 5 / 5B / 6 / 6B / 7A / 7B 可验收。

已通过检查：

- 静态语法：`node --check app.js`、`node --check data/professional-content.js`、`node --check data/learning-content.js`、`node --check data/phase6-content.js`。
- 空白/补丁检查：`git diff --check`。
- 数据完整性：30 modules、191 scenarios、60 Professional Sprint questions、20 client drills、5 strategy comparisons、5 vol framework cards、9 vol playbook cards、6 dealer workflow cards、6 P&L attribution cards、6 exotics bridge cards、6 structuring cases、6 exotics risk drills、6 model-limit cards。（Scenario Bank 现已重构为 Sector 拓扑，扩至 211 个场景，含 Sector D Research Bridge 内容，见 2026-06-11 Update）
- 场景分布（Phase 5 时点）：Month 1 = 30、Month 2 = 40、Month 3 = 45、Month 4 = 40、Month 5 = 36。（已重构为 Sector A-E，见上）
- 本地化与引用：全部 Scenario Bank 场景中文 localization 完整；scenario-module links 与 strategy links 无坏引用。
- Playwright browser regression：Learning Hub、Strategy Construction、Client Drills、Vol Framework、Dealer Desk、Exotics Bridge、Exotics Risk、Professional Sprint、Skill Dashboard、progress report export、Gamma P&L、Scenario filters、Professional tools 均正常。
- 自动化回归：当前以本地 `npm test` 输出为准。

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

- 71 个策略的 Trader Memo。
- Professional Concepts 独立面板。
- 专业工具面板（Tabbed Interface）：
  - 压力测试矩阵
  - Put-Call Parity 计算器
  - Portfolio Greeks 聚合器
  - Gamma P&L 与动态对冲模拟，含 rehedge threshold、transaction cost、Static/Dynamic P&L
  - Vol Surface 教育性 smile/skew
  - 组合级 Greeks Decay

### 专业模式

- 257 个专业问答。
- 专业问答覆盖 Greeks、策略构建、风险管理、客户视角、Dealer 对冲、参数选择和常见比较题。

### D1-to-Derivatives Learning Hub

- **Sector A-E + Professional Sprint roadmap**（原六个月 Month 1-5 已重构为 Sector 拓扑，见 2026-06-11 Update）：
  - Sector A — Risk Mechanics：Delta、Gamma、Vega、Theta/Rho。
  - Sector B — Trade Construction：vertical spreads、straddles/strangles、condors/butterflies、protection structures。
  - Sector C — Market Dynamics：RV/IV、event vol、equity skew、term structure、vol surface reading；client flow、inventory、delta hedging、gamma scalping、vega buckets、quote skewing、P&L attribution（合并原 Month 3 + Month 4，85 个场景）。
  - Sector D — Research Bridge：16 张研究案例卡、15 个 View-to-Trade 演练、20 个研究驱动场景。
  - Sector E — Complex Products：Asian averaging、barrier monitoring、quanto cross-asset risk、digital discontinuity、autocallable decomposition、structured product workflow。
  - Professional Sprint：专业冲刺，独立于 A-E 之外。
- Commodities Bridge：D1 commodities 经验到 equity derivatives 的迁移框架。
- Strategy Construction：5 个策略对比卡。
- Client Recommendation：20 个客户结构推荐演练，支持逐步展开和策略链接跳转。
- Vol Framework：5 个 volatility 框架卡 + RV/IV breakeven 小计算器 + 9 个 Vol trade playbook 卡，并可跳转到 Vol Surface 工具。
- Dealer Desk：6 个 dealer workflow 卡 + 6 个 P&L attribution 卡，并可跳转到 Gamma P&L 工具。
- Exotics Bridge：6 个简化 exotic payoff cards + 6 个 structuring workflow cases，并可跳转到 Put-Call Parity 工具。
- Research Bridge：16 张研究案例卡（可按 earnings / sector-analysis / comps / ic-memo / thesis 过滤）+ 15 个 View-to-Trade 演练（六步展开），数据文件 `data/research-bridge-content.js`。
- Scenario Bank：**211 个** client/risk/P&L/market-making/strategy/research-driven 场景，支持 category/sector（A/B/C/D/E）/topic 过滤。
- Easy/Pro 皮肤切换：右下角浮动胶囊，Pro（深色 terminal）/ Easy（浅色），持久化至 `os_d1_skin`。
- 中文本地化：全部 Scenario Bank 场景、9 个 Vol trade playbook、6 个 dealer workflow、6 个 P&L attribution、6 个 exotics bridge cards 和 6 个 structuring cases 均有中文 override，不再依赖英文 fallback。
- 本地进度追踪：模块完成、场景完成、客户推荐演练完成、View-to-Trade 演练完成、逐步展开状态、复习标记和当前学习 tab。
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
- `tests/learning-hub.spec.js`：D1 Learning Hub、tab、filter、answer reveal、client drill step reveal、Vol Framework/RV-IV calculator、Vol trade playbook、Dealer Desk、P&L attribution、Exotics Bridge、structuring cases、progress persistence、策略跳转。
- `tests/learning-hub.spec.js` 同时检查 Scenario Bank、Vol trade playbook、Exotics Bridge 与 structuring cases 的中文本地化完整性。

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

- 71 个策略都有基础说明和专业 Trader Memo。
- 257 个专业问答覆盖核心内容；所有 71 个专业策略均至少有 3 个专业问答和 3 条常见错误表达。
- 20 个客户推荐演练、Sector C 合并约 85 个 vol + dealer 场景覆盖常见结构推荐、vol 判断、dealer flow、hedging 与 P&L attribution，但仍是教育性框架，不是实际 suitability advice、交易信号或真实做市系统。
- Sector D Research Bridge 含 16 张研究案例卡、15 个 View-to-Trade 演练和约 20 个研究驱动场景，用于训练从研究输出到期权决策的转化，但不构成实际投资建议或研究发布。
- Sector E 约 36 个 exotics/structuring 场景覆盖 Asian、Barrier、Quanto、Digital、Autocallable 和 structured product，但不构成生产级 exotic pricer、发行条款建议或真实 suitability advice。
- 60 个 Professional Sprint questions、6 个 Exotics Risk drills 和 6 个 model-limit cards 用于训练专业表达、自我评分和风险拆解，但不代表任何外部认证、正式考试结果或真实交易权限。
- 仍可继续补充真实案例、专业追问、错误答案示例和策略对比表。

## 近期优先级

### P0：文档与验收基线

状态：已完成。

- 合并旧 Phase/bugfix 文档。
- 明确当前唯一准绳：`README.md`、`USER_GUIDE.md`、`docs/PROJECT_STATUS.md`、`docs/IMPLEMENTATION_HISTORY.md`。
- 保留 `docs/superpowers/` 作为早期规格参考。

### P1：D1-to-Derivatives 后续扩展

目标：基于 Phase 1 + Phase 2A + Phase 2B + Phase 3A + Phase 3B + Phase 4A/4B + Phase 5 + Phase 5B + Phase 6 + Phase 6B + Phase 7A + Phase 7B + Phase 7C 使用反馈，继续进入市场真实感、风险管理、输出工作流或高级衍生品扩展。

建议顺序：

1. Market realism：CSV option chain、bid/ask、IV Rank、expected move 和 early exercise/assignment 教学提示。
2. Risk management / Output workflow：组合保存回放、学习报告导出增强、图表导出和移动端体验。
3. Advanced derivatives：更深入的 vol arbitrage、dispersion、correlation 和 exotic 案例。

详细蓝图见 `docs/superpowers/specs/2026-05-27-d1-to-derivatives-master-roadmap.md`。

### P1：内容覆盖质量归一

状态：Phase 7C 已完成。

结果：71/71 个专业策略都已达到当前质量标准。

- 71 个策略都有专业 Trader Memo。
- 71 个策略都有至少 3 个专业问答。
- 71 个策略都有至少 3 条常见错误表达。
- `tests/professional-content.spec.js` 已把该质量线固化为回归测试。

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
