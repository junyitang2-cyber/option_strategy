# Implementation History

本文档合并了原根目录中的 Phase、bugfix、acceptance 和 documentation correction 文档。旧文档中的关键结论保留在这里，过期口径不再作为当前状态依据。

## 起点：复刻目标站

目标站 `https://options-viewer.netlify.app/` 是一个静态部署的单页应用。初始 HTML 只有容器，策略数据、计算逻辑和渲染逻辑都在打包后的 JS 中。

复刻出的核心结构：

- 左侧策略库、搜索和筛选。
- 当前策略标题、分类、重置模板。
- 主损益图，随 IV、DTE、spot 和腿参数联动。
- Greeks 六联图。
- 情景参数、风险指标、腿组合编辑。
- Notes 和免责声明。

## 初始实现

第一版先做了静态策略学习页：

- 每个策略一张卡片。
- 展示腿组合、赚钱逻辑、风险、适用场景、例子和 payoff 图。
- 补充原站没有单列的常见策略。

随后升级成交互分析台：

- 使用 Black-Scholes 教学模型。
- 实现主损益图、Greeks、风险指标。
- 支持腿组合编辑和情景参数联动。
- Notes 从简短说明升级为策略 playbook。

## Phase 1：专业交易员视角

新增内容：

- 三档模式：基础、专业、面试。
- Trader Memo：Exposure、盈利逻辑、客户视角、Dealer 对冲。
- 面试问答。
- 压力测试矩阵。
- Put-Call Parity 检查器。

后续扩展：

- 专业内容从 13 个核心策略扩到 20 个。
- 修复多处内容准确性问题。
- 明确不是所有策略都有专业内容，基础内容和专业内容分层展示。

代表性修复：

- 专业/面试模式切换后内容不更新。
- 未覆盖策略导致专业面板结构异常。
- Long Call 的 Dealer hedging 方向讲反。
- Bear Call Spread、Iron Condor、Risk Reversal、Short Strangle 等 Q&A 风险描述不准确。

## Phase 2：专业风险工具

新增功能：

- Portfolio Greeks 聚合器。
- 保证金教育估算。
- Gamma P&L 与动态对冲模拟。
- Vol Surface 教学可视化。
- Greeks Decay 面板。

关键计算修复：

- `portfolioResult()` 一度忽略传入 legs，导致组合计算污染。
- Portfolio P&L 曾显示为 0，后改为基于入场价值和当前价值差。
- Reg-T 保证金一度 double-count multiplier，后修复单位。
- Defined-risk spread、Iron Condor、Butterfly 等策略识别逻辑增强。
- Gamma P&L 对冲现金流和股票资产记账修复。
- 价格不变时 Gamma P&L 不应产生虚假的 hedge P&L。
- Vol Surface 和 Greeks Decay 在切换专业模式时需要立即渲染。

## 教学模式增强

新增功能：

- 概率锥和盈利概率。
- `-2σ / -1σ / +1σ / +2σ` 区间标注。
- 逐腿分解图。
- 学习路径、完成标记、难度跃迁提示。
- 策略列表 hover 预览。
- 重置确认弹窗。
- Professional Concepts 独立 UI。
- 更详细的 Notes 和相关策略联动。

## 最新验收修复

最近一次验收中发现：

- Greeks Decay 虽然有图和 ATM/ITM/OTM 控件，但仍然只读取第一条期权腿。
- Iron Condor 下显示的是单条 put 腿，而不是 4 条腿组合。
- 旧文档仍残留“占位符”“20 个策略”“100 个问答”“80-85%”等过期口径。

已修复：

- Greeks Decay 改为按当前所有期权腿聚合 Gamma/Theta/Vega。
- ATM/ITM/OTM 与自定义 strike 改为移动组合中心，并保留原有价差宽度。
- Iron Condor 现在显示 `组合级 | 4 条期权腿 | MIXED`。
- hover 预览改为 DOM textContent 渲染，并清理重复浮层。
- 测试覆盖 sigma 标注、hover、reset confirm、Professional Concepts、组合级 Greeks Decay。
- 文档合并为当前四份主文档，根目录旧 Phase/bugfix 文档移除。

## 图表黑块问题

问题：

Greeks 六联图出现黑色块状区域。

原因：

SVG open path 默认可能被填充，曲线路径未显式设置 `fill: none`。

解决：

在 `styles.css` 中统一给 Greeks 曲线设置：

```css
.curve-risk,
.curve-delta,
.curve-gamma,
.curve-theta,
.curve-vega,
.curve-rho {
  fill: none;
}
```

## 被合并的旧文档

以下根目录历史文档已合并到本文档和 `docs/PROJECT_STATUS.md`：

- `IMPLEMENTATION_SUMMARY.md`
- `BUGFIX_SUMMARY.md`
- `PHASE1_PROGRESS.md`
- `PHASE1_ACCEPTANCE.md`
- `PHASE1_EXTENSION.md`
- `CONTENT_ACCURACY_FIXES.md`
- `PHASE2_IMPLEMENTATION.md`
- `PHASE2_BUGFIX_SUMMARY.md`
- `PHASE2_CRITICAL_FIXES.md`
- `PHASE2_ROUND3_FIXES.md`
- `PHASE2_DOCUMENTATION_CORRECTIONS.md`
- `PHASE2_PROGRESS_SUMMARY.md`

`docs/superpowers/` 中的 spec 和 plan 作为早期设计资料保留，不代表当前完成状态。

## 当前验收基线

最后确认的基线：

```bash
node --check app.js
node --check data/professional-content.js
npm test
```

Playwright 结果：4 个测试套件通过。
