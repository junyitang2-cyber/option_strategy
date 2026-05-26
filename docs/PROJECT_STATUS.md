# Project Status And Roadmap

最后更新：2026-05-26

## 当前结论

项目当前是一个本地静态期权策略教学与面试准备工具，核心功能已经可以验收。当前完成度按学习/面试用途评估为 95%+；剩余工作主要是模型真实性、市场数据、执行成本、更多专业内容和更高级策略扩展。

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

### 专业模式

- 40 个策略的 Trader Memo。
- Professional Concepts 独立面板。
- Portfolio Greeks 聚合器。
- 保证金教育估算。
- 压力测试矩阵。
- Put-Call Parity 计算器。
- Gamma P&L 与动态对冲模拟。
- Vol Surface 教育性 smile/skew。
- 组合级 Greeks Decay：按当前所有期权腿聚合 Gamma/Theta/Vega，支持 ATM/ITM/OTM 和自定义中心行权价。

### 面试模式

- 141 个面试问答。
- Q&A 覆盖 Greeks、策略构建、风险管理、客户视角、Dealer 对冲、参数选择和常见比较题。

### 测试

当前 Playwright 测试套件：

- `tests/smoke.spec.js`：基础渲染、策略切换、hover 预览、reset confirm。
- `tests/phase2.spec.js`：学习路径、难度提示、逐腿分解。
- `tests/phase3.spec.js`：概率锥、sigma 标注、增强 Notes。
- `tests/professional.spec.js`：专业/面试模式、Professional Concepts、组合级 Greeks Decay、压力测试、Parity、Portfolio、Gamma P&L。

最近验收命令：

```bash
node --check app.js
node --check data/professional-content.js
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
- 141 个 Q&A 覆盖核心内容，但新增策略未必每个都有固定 5 问。
- 仍可继续补充真实案例、面试追问、错误答案示例和策略对比表。

## 近期优先级

### P0：文档与验收基线

状态：已完成。

- 合并旧 Phase/bugfix 文档。
- 明确当前唯一准绳：`README.md`、`USER_GUIDE.md`、`docs/PROJECT_STATUS.md`、`docs/IMPLEMENTATION_HISTORY.md`。
- 保留 `docs/superpowers/` 作为早期规格参考。

### P1：内容覆盖扩展

目标：把专业内容从 40 个策略扩展到更多策略，优先补常见面试与实战策略。

建议顺序：

1. Long Put Butterfly、Bull Put Spread、Call/Put Broken Wing、Double Diagonal。
2. Covered Put、Stock Repair、Double Bull/Bear Spread。
3. Short Calendar、Short Diagonal、更多 ratio/ladder 类策略。
4. 每个新增策略至少补 exposure、赚钱逻辑、风险、客户适当性、Dealer hedge、3-5 个 Q&A。

### P1：教学体验细化

目标：让学习链路更顺。

- hover 预览从文字升级为小型 payoff sparkline。
- Notes 中加入“常见误解”和“面试易错回答”。
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
- 面试题随机抽查和错题本。
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
3. `npm test` 通过。
4. 浏览器手测覆盖新增 UI 的可见性、状态切换和关键计算。
5. 文档同步更新，不再新增互相冲突的 Phase 文档。

## 文档维护规则

- 当前功能状态写入本文档。
- 用户操作说明写入 `USER_GUIDE.md`。
- 项目入口、安装、测试写入 `README.md`。
- 历史过程、已解决问题写入 `docs/IMPLEMENTATION_HISTORY.md`。
- 不再新增 `PHASE*_SUMMARY.md`、`BUGFIX_SUMMARY.md` 这类根目录流水账文档。
