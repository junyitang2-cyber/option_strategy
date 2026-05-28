# Implementation History

## D1-to-Derivatives Learning Hub Phase 5 (2026-05-28)

Scope:

- Implemented Month 5 Exotics And Structuring Bridge.
- Added 6 Month 5 modules: Asian averaging, barrier monitoring, quanto cross-asset risk, digital discontinuity, autocallable decomposition, and structured-product workflow.
- Added a Learning Hub `Exotics Bridge` tab.
- Added 6 simplified exotic payoff cards with model-limit labels, embedded option legs, key risks, and professional phrasing.
- Added 6 structuring workflow cases covering client objective, payoff design, embedded legs, dealer risk, key risks, disclosure language, and model limits.
- Added 36 Month 5 scenarios across client, risk, P&L, market-making, and strategy categories.
- Added scenario topic filters for exotics, asian, barrier, quanto, digital, autocallable, structured-product, path, suitability, and cross-asset.
- Maintained complete Chinese localization across all 191 Scenario Bank records and all new Phase 5 cards.
- Updated roadmap and status docs so Phase 6 interview sprint and readiness dashboard is the next main D1-to-Derivatives implementation target.

Verification focus:

- `tests/learning-hub.spec.js` covers 25 modules, 191 scenarios, 36 Month 5 scenarios, Exotics Bridge rendering, payoff SVG visibility, structuring cases, exotics filters, Month 5 scenario filters, and localization completeness.

Acceptance result:

- 2026-05-28 full regression passed.
- Static checks passed: `node --check app.js`, `node --check data/professional-content.js`, `node --check data/learning-content.js`, and `git diff --check`.
- Data integrity passed: 25 modules, 191 scenarios, 20 client drills, 5 strategy comparisons, 5 vol framework cards, 9 vol playbook cards, 6 dealer workflow cards, 6 P&L attribution cards, 6 exotics bridge cards, and 6 structuring cases.
- Full Playwright suite passed: `14 passed (19.2s)`.

## D1-to-Derivatives Learning Hub Phase 4A/4B (2026-05-28)

Scope:

- Implemented Month 4 Dealer Hedging / Market Making as Phase 4A and Phase 4B.
- Added 6 Month 4 modules: client flow/inventory, delta hedging triggers, gamma scalping with transaction costs, vega bucket hedging, quote skewing, and P&L attribution.
- Added a Learning Hub `Dealer Desk` tab with 6 dealer workflow cards.
- Added 6 P&L attribution cards covering delta, gamma/rehedging, vega/surface, theta/carry, execution, and residual/model buckets.
- Enhanced the professional Gamma P&L tool with rehedge threshold, transaction cost, Static P&L, Dynamic P&L, hedge count, and transaction-cost attribution.
- Added 40 Month 4 dealer/market-making scenarios across market-making, risk, P&L, and strategy categories.
- Added scenario topic filters for dealer, hedging, quote, attribution, and inventory.
- Maintained complete Chinese localization across all 155 Scenario Bank records.
- Updated roadmap and status docs so Phase 5 exotics and structuring is the next D1-to-Derivatives implementation target.

Verification focus:

- `tests/learning-hub.spec.js` covers 19 modules, 155 scenarios, 40 Month 4 scenarios, Dealer Desk rendering, Gamma P&L tool jump, dealer topic filters, and localization completeness.
- `tests/professional.spec.js` covers the enhanced Gamma P&L outputs.

Acceptance result:

- 2026-05-28 full regression passed.
- Static checks passed: `node --check app.js`, `node --check data/professional-content.js`, `node --check data/learning-content.js`, and `git diff --check`.
- Data integrity passed: 19 modules, 155 scenarios, 20 client drills, 5 strategy comparisons, 5 vol framework cards, 9 vol playbook cards, 6 dealer workflow cards, and 6 P&L attribution cards.
- Desktop and mobile Playwright spot checks passed with no page errors or console errors.
- Full Playwright suite passed: `13 passed (14.4s)`.

## D1-to-Derivatives Learning Hub Phase 3B (2026-05-28)

Scope:

- Implemented the second Month 3 volatility slice: trade construction and risk management.
- Added a 9-card Vol trade playbook inside `Vol 框架`, covering long vol, defined-risk short vol, event movement, event direction, skew protection, risk reversal, calendar, diagonal, and surface-bucket setups.
- Added playbook filters for long-vol, short-vol, event, skew, term-structure, and surface.
- Expanded Month 3 volatility scenarios from 17 to 45, bringing the total Scenario Bank from 87 to 115 records.
- Added topic filters for surface, short-vol, gamma, and liquidity.
- Backfilled Chinese localization for all Month 1 and Month 2 scenario records, so all 115 Scenario Bank records now have explicit CN overrides.
- Updated roadmap and status docs so Phase 4 is now the next D1-to-Derivatives implementation target.

Verification focus:

- `tests/learning-hub.spec.js` now covers 13 modules, 115 scenarios, 45 Month 3 scenarios, Vol Framework cards, Vol trade playbook filters, RV/IV calculator updates, vol topic filters, Chinese localization completeness, and the Vol Surface tool jump.

## D1-to-Derivatives Learning Hub Phase 3A (2026-05-28)

Scope:

- Implemented the first Month 3 Volatility Trading Framework slice.
- Added 5 Month 3 modules: RV vs IV, event vol/IV crush, equity skew, term structure, and vol surface reading.
- Added a Learning Hub `Vol 框架` tab with 5 framework cards.
- Added an RV/IV mini calculator using a static realized-vol sample, implied-vol input, DTE input, expected move, and breakeven-RV explanation.
- Added 17 Month 3 scenarios across vol, skew, term-structure, event vol, P&L, risk, client, and market-making topics.
- Extended scenario topic filters with vol/skew/term-structure/event.
- Added a Learning Hub action that opens the existing Vol Surface professional tool from the Vol Framework panel.

Verification focus:

- `tests/learning-hub.spec.js` now covers 13 modules, 87 scenarios, the Vol Framework cards, RV/IV calculator updates, Month 3 filters, vol topic filters, and the Vol Surface tool jump.

## D1-to-Derivatives Learning Hub Phase 2B (2026-05-28)

Scope:

- Implemented Client Recommendation Drill as the next Month 2 step after Strategy Construction.
- Added a Learning Hub `客户推荐` tab with 20 guided client structure drills.
- Each drill covers client objective, profile, constraints, candidate structures, recommendation, risks, Dealer note, professional expression, follow-up questions, and strategy links.
- Added step-by-step reveal, reset, completion tracking, and localStorage persistence for drill progress.
- Kept the outward framing as professional training rather than public-facing preparation language.
- Updated the Master Roadmap so the next recommended implementation is Phase 3 Volatility Trading Framework.

Verification focus:

- `tests/learning-hub.spec.js` now covers 20 client drills, step reveal, completion persistence, active-tab persistence, and strategy chip navigation from a drill.

## D1-to-Derivatives Learning Hub Phase 2A (2026-05-28)

Scope:

- Implemented Month 2 Strategy Construction as the next step after Phase 1.
- Added 4 Month 2 modules: vertical spreads, straddles/strangles, condors/butterflies, and protection structures.
- Added a Strategy Construction tab with 5 comparison cards.
- Expanded the scenario bank from 30 to 70 records.
- Added scenario filters by category, month, and topic.
- Preserved existing Learning Hub progress persistence and strategy-chip navigation.
- Updated the Master Roadmap so the next recommended implementation is Phase 2B Client Recommendation Drill.

Verification focus:

- `tests/learning-hub.spec.js` now covers 8 modules, 70 scenarios, 5 comparison cards, Month 2 filtering, topic filtering, strategy chip navigation, progress persistence, and invalid saved-filter recovery.

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

## D1-to-Derivatives Learning Hub Phase 1 (2026-05-27)

背景：

用户希望系统不只是展示期权策略，还要服务于从 commodities D1 trader 转向 equity derivatives trader 的学习和面试准备。核心要求是：利用已有 LME/CME、physical hedge、Asian options、FX-linked hedge 经验，形成更专业的 Greeks、vol、dealer risk、client suitability 和 scenario interview 语言。

已完成的文档与代码工作：

- 重写 `docs/superpowers/specs/2026-05-27-d1-to-derivatives-learning-system-design.md`。
- 将原本过大的六个月愿景收敛为 Phase 1 MVP。
- 明确 Phase 1 只实现 Learning Hub、Month 1 Greeks、Commodities Bridge、30 个 scenarios、本地进度追踪和 Playwright 覆盖。
- 新增 `docs/superpowers/plans/2026-05-27-d1-learning-hub-phase1.md`。
- 新增 `data/learning-content.js`：roadmap、Month 1 modules、Commodities Bridge、30 个 scenarios。
- 新增 Learning Hub UI：Roadmap、Month 1 Greeks、Commodities Bridge、Scenario Bank。
- 新增 localStorage key `os_d1_learning`：模块完成、场景完成、复习标记、当前 tab 和 scenario filter。
- 新增 `tests/learning-hub.spec.js`：学习中枢渲染、tab、filter、answer reveal、进度持久化和策略跳转。

关键设计决策：

- 不复制现有 strategy lab，而是在其上方增加学习中枢。
- 学习内容放入新文件 `data/learning-content.js`，避免继续膨胀 `app.js` 或 `professional-content.js`。
- 新进度使用 localStorage key `os_d1_learning`，与现有策略完成进度 `os_learning` 分离。
- 内容表述必须保留金融准确性：commodity skew 不写成普遍规律，Vega/D1 关系需要限定在 linear outright exposure，RV/IV 交易不能忽略成本和跳空风险。

验证方法：

```bash
node --check app.js
node --check data/professional-content.js
node --check data/learning-content.js
npm test
```

## D1-to-Derivatives Master Roadmap (2026-05-27)

目标：

保留 Phase 1 之后的六个月大蓝图，并把 Month 2-6 拆成后续可以连续实施的阶段。

新增：

- `docs/superpowers/specs/2026-05-27-d1-to-derivatives-master-roadmap.md`

路线图阶段：

1. Phase 2A：Month 2 Strategy Construction。
2. Phase 2B：Client Recommendation Drill。
3. Phase 3：Volatility Trading Framework。
4. Phase 4：Dealer Hedging And Market Making。
5. Phase 5：Exotics And Structuring Bridge。
6. Phase 6：Interview Sprint And Readiness Dashboard。

关键约束：

- 后续仍然保持纯静态实现，除非明确决定引入后端。
- 学习内容继续放在 `data/learning-content.js` 或后续专门数据文件，不把大段内容塞进 `app.js`。
- 每个后续阶段都必须有 Playwright 覆盖、文档同步和明确验收标准。

## 专业工具标签化布局 (2026-05-27)

**目标**：将 6 个垂直堆叠的专业工具面板整合为单个标签化界面，减少约 500px 的垂直滚动空间。

**实施方法**：使用 subagent-driven-development 技能执行实施计划。

**完成的任务**：

1. **Task 1: CSS 样式** (commit e31c451)
   - 添加标签栏样式 (`.tools-tabs`, `.tool-tab`)
   - 添加面板可见性切换 (`.tool-panel`, `.tool-panel.active`)
   - 添加焦点状态支持 (`:focus-visible`)
   - 修复了活动标签边框显示问题

2. **Task 2: JavaScript 逻辑** (commit 1a4372f)
   - 添加 `state.activeTool` 属性
   - 实现 `switchTool()` 函数处理标签切换
   - 添加 localStorage 持久化
   - 在 `handleClick()` 中添加标签点击处理
   - 在 `handleModeToggle()` 和 `boot()` 中初始化活动工具
   - 添加 toolId 验证和回退逻辑

3. **Task 3: HTML 结构** (commit ad2c9d1)
   - 删除 6 个独立面板 sections (stressTestPanel, parityPanel, portfolioPanel, gammaPnlPanel, volSurfacePanel, greeksDecayPanel)
   - 添加统一的 `professionalToolsPanel` 标签化面板
   - 保留所有现有 ID (stressTestResults, parityResults, portfolioContent, etc.)
   - 添加完整的 ARIA 属性支持 (role="tablist", role="tab", aria-selected, role="tabpanel")

4. **Task 4: 手动测试**
   - 验证页面加载无错误
   - 验证专业模式激活和 6 个标签可见
   - 验证标签切换和视觉反馈
   - 验证所有工具功能正常
   - 验证 localStorage 持久化
   - 验证模式切换时状态保持

5. **Task 5: 自动化测试**
   - 更新 `tests/professional.spec.js` 以适配新的标签化结构
   - 所有 4 个测试套件通过 (smoke, phase2, phase3, professional)
   - 修复了旧面板 ID 引用
   - 添加了显式标签点击以确保内容可见

6. **Task 6: 文档更新** (commit daf57bc)
   - 更新 `docs/PROJECT_STATUS.md` 描述专业工具面板为标签化界面
   - 最终验证所有功能正常
   - 推送所有更改到 GitHub

**技术细节**：
- 使用 vanilla JavaScript, CSS, HTML (无新依赖)
- CSS 变量用于主题一致性 (--cyan, --text, --muted, --panel-2, --line)
- localStorage 键: `activeTool` (默认值: 'stress')
- 6 个工具标签: stress, parity, portfolio, gamma, vol, decay
- 完整的 ARIA 支持用于可访问性

**成果**：
- ✅ 减少约 500px 垂直滚动空间
- ✅ 改善用户体验 - 无需滚动即可访问所有工具
- ✅ 保持所有现有功能
- ✅ 通过所有自动化测试
- ✅ 完整的可访问性支持

**相关文件**：
- 设计规格: `docs/superpowers/specs/2026-05-27-professional-tools-tabbed-layout-design.md`
- 实施计划: `docs/superpowers/plans/2026-05-27-professional-tools-tabbed-layout.md`

---

## 当前验收基线

最后确认的基线：

```bash
node --check app.js
node --check data/professional-content.js
npm test
```

Playwright 结果：4 个测试套件通过。
