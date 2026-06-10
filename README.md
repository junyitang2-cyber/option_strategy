# Option Strategy Interactive Lab

2026-06-11 更新：Learning Hub Roadmap 已重构为 Sector A-E 拓扑，新增 Sector D Research Bridge（16 张研究案例卡 + 15 个 View-to-Trade 演练），Scenario Bank 扩至 211 个场景，新增 Easy/Pro 皮肤切换，Playwright 测试套件 32 个全部通过。

期权策略交互学习与专业交易员能力训练工具。项目最初用于学习并复刻 `https://options-viewer.netlify.app/` 的核心体验，现在已经扩展为本地可运行的策略分析、教学和专业训练平台。

当前状态以这几个文档为准：

- [USER_GUIDE.md](USER_GUIDE.md)：怎么使用这个工具。
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)：当前进度、已知限制、未来规划。
- [docs/IMPLEMENTATION_HISTORY.md](docs/IMPLEMENTATION_HISTORY.md)：实现过程、历史修复和被合并的旧文档索引。
- [docs/superpowers/](docs/superpowers/)：规格、实施计划和 D1-to-Derivatives Master Roadmap。

## 当前能力

项目当前包含：

- 71 个基础策略，其中 60 个来自原站结构，11 个为补充策略。
- 71 个策略的专业 Trader Memo。
- 257 个专业问答。
- 20 个客户结构推荐演练。
- 主损益图、概率锥、逐腿分解、Greeks 六联图。
- 情景参数、风险指标、腿组合编辑、学习路径追踪。
- 进阶模式：Portfolio Greeks、保证金教育估算、压力测试、Gamma P&L、波动率曲面、Greeks Decay、Put-Call Parity、交易员核心概念。
- 专业模式：进阶内容 + 专业问答与情景演练。
- D1-to-Derivatives Learning Hub Phase 1 + Phase 2A + Phase 2B + Phase 3A/3B + Phase 4A/4B + Phase 5 + Phase 5B + Phase 6 + Phase 6B + Phase 7A + Phase 7B + Phase 7C + Sector Restructure + Research Bridge + Easy/Pro 皮肤切换：Sector A-E + Professional Sprint roadmap、Sector A（Risk Mechanics）、Sector B（Trade Construction）、Sector C（Market Dynamics，合并 Vol Framework 与 Dealer Desk）、Sector D（Research Bridge：16 研究案例卡 + 15 View-to-Trade 演练）、Sector E（Complex Products）、Commodities Bridge、5 个策略对比卡、20 个客户推荐演练、Vol trade playbook、Dealer Desk、Exotics Bridge、Exotics Risk、Skill Dashboard、60 个 Professional Sprint questions、**211 个**实战/专业场景、71 个策略级 Trader Memo、257 个专业问答、本地进度追踪/报告导出和 Easy/Pro 皮肤切换。
- Playwright 真实浏览器回归测试。

## 本地使用

### Windows

直接打开：

```powershell
cd D:\option_strategy
start index.html
```

或使用静态服务器：

```powershell
cd D:\option_strategy
npx serve .
```

运行测试：

```powershell
cd D:\option_strategy
npm install
npx playwright install chromium
npm test
```

### Linux/Mac

直接打开：

```bash
cd /home/option_strategy
xdg-open index.html    # Linux
open index.html        # Mac
```

也可以用任意静态服务器打开：

```bash
cd /home/option_strategy
npx serve .
```

运行测试：

```bash
cd /home/option_strategy
npm install
npx playwright install chromium
npm test
```

如果 Playwright 和 Chromium 已经安装，直接运行 `npm test` 即可。

## 文件结构

```text
option_strategy/
├── index.html
├── styles.css
├── app.js
├── data/
│   ├── strategies.js
│   ├── professional-content.js
│   ├── learning-content.js
│   └── phase6-content.js
├── tests/
│   ├── smoke.spec.js
│   ├── phase2.spec.js
│   ├── phase3.spec.js
│   ├── professional.spec.js
│   ├── professional-content.spec.js
│   └── learning-hub.spec.js
├── docs/
│   ├── PROJECT_STATUS.md
│   ├── IMPLEMENTATION_HISTORY.md
│   └── superpowers/
├── package.json
├── README.md
└── USER_GUIDE.md
```

## 验证状态

最近一次完整验收：2026-06-11，Sector Restructure + Research Bridge + Easy/Pro 皮肤切换均通过；32 个 Playwright 测试全部通过（含 skin.spec.js 和 Sector A-E、Research Bridge 新测试）。历史验收：2026-05-29，Phase 1 / 2A / 2B / 3A / 3B / 4A / 4B / 5 / 5B / 6 / 6B / 7A / 7B / 7C 均通过；Phase 7 复核确认 71/71 策略专业内容覆盖、257 个策略级专业问答，且所有专业策略都有常见错误表达。

结果摘要：

- Learning Hub 数据完整性：30 modules、211 scenarios（Sector A-E 拓扑）、60 Professional Sprint questions、20 client drills、16 研究案例卡、15 View-to-Trade 演练、5 strategy comparisons、5 vol framework cards、9 vol playbook cards、6 dealer workflow cards、6 P&L attribution cards、6 exotics bridge cards、6 structuring cases、6 exotics risk drills、6 model-limit cards。
- Scenario Bank：**211 个场景**，Sector A-E 拓扑（原 Month 1-5 已重构，含 Sector D Research Bridge 20 个场景）。
- 中文本地化、scenario-module links、strategy links 均无缺失或坏引用。
- 浏览器回归通过：Learning Hub、Vol Framework、Dealer Desk、Exotics Bridge、Exotics Risk、Professional Sprint、Skill Dashboard、progress report export、Gamma P&L、Scenario filters、Professional tools 无控制台错误。
- Playwright：当前以本地 `npm test` 输出为准，包含 `tests/professional-content.spec.js` 的 Phase 7A/7B 内容覆盖检查。

最近一次验收覆盖：

- `node --check app.js`
- `node --check data/professional-content.js`
- `node --check data/learning-content.js`
- `node --check data/phase6-content.js`
- `git diff --check`
- `npm test`

Playwright 回归测试覆盖基础渲染、学习路径、概率锥 sigma 标注、hover 预览、重置确认、专业概念面板、Phase 7A/7B 专业内容覆盖、组合级 Greeks Decay、Portfolio/Stress/Gamma P&L/专业训练面板、客户推荐演练、Vol Framework/RV-IV calculator、Vol trade playbook、Dealer Desk、P&L attribution、Exotics Bridge、Exotics Risk、Professional Sprint、Phase 6B scoring/recommendations/report export、简化 payoff 图、structuring cases、Sector A-E 场景过滤、Research Bridge 案例卡/演练、Roadmap Sector A-E 渲染、皮肤切换（Easy/Pro）和 reload persistence。

## 重要限制

这是学习和专业训练工具，不是交易系统。

- 使用教育性 Black-Scholes 与情景模拟，不接入实时行情或真实期权链。
- Portfolio Margin 是教育性估算，不等同于真实 broker、FINRA 或 Cboe 规则。
- 未建模 bid/ask、滑点、手续费、税务、流动性、提前行权、指派概率。
- Greeks Decay 已是组合级曲线，但仍使用简化 IV 与期限假设。

任何交易决策都应由使用者独立判断，本项目不构成投资、税务、法律或交易建议。
