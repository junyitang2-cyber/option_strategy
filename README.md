# Option Strategy Interactive Lab

2026-05-28 update: D1-to-Derivatives Learning Hub Phase 2A is implemented with 8 modules, 70 scenarios, a Strategy Construction tab, 5 comparison cards, and scenario filters by category, month, and topic.

期权策略交互学习与专业交易员能力训练工具。项目最初用于学习并复刻 `https://options-viewer.netlify.app/` 的核心体验，现在已经扩展为本地可运行的策略分析、教学和专业训练平台。

当前状态以这几个文档为准：

- [USER_GUIDE.md](USER_GUIDE.md)：怎么使用这个工具。
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)：当前进度、已知限制、未来规划。
- [docs/IMPLEMENTATION_HISTORY.md](docs/IMPLEMENTATION_HISTORY.md)：实现过程、历史修复和被合并的旧文档索引。
- [docs/superpowers/](docs/superpowers/)：规格、实施计划和 D1-to-Derivatives Master Roadmap。

## 当前能力

项目当前包含：

- 71 个基础策略，其中 60 个来自原站结构，11 个为补充策略。
- 40 个策略的专业 Trader Memo。
- 141 个专业问答。
- 主损益图、概率锥、逐腿分解、Greeks 六联图。
- 情景参数、风险指标、腿组合编辑、学习路径追踪。
- 进阶模式：Portfolio Greeks、保证金教育估算、压力测试、Gamma P&L、波动率曲面、Greeks Decay、Put-Call Parity、交易员核心概念。
- 专业模式：进阶内容 + 专业问答与情景演练。
- D1-to-Derivatives Learning Hub Phase 1 + Phase 2A：六个月 roadmap、Month 1 Greeks、Month 2 Strategy Construction、Commodities Bridge、5 个策略对比卡、70 个实战/专业场景和本地进度追踪。
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
│   └── professional-content.js
├── tests/
│   ├── smoke.spec.js
│   ├── phase2.spec.js
│   ├── phase3.spec.js
│   └── professional.spec.js
├── docs/
│   ├── PROJECT_STATUS.md
│   ├── IMPLEMENTATION_HISTORY.md
│   └── superpowers/
├── package.json
├── README.md
└── USER_GUIDE.md
```

## 验证状态

最近一次验收覆盖：

- `node --check app.js`
- `node --check data/professional-content.js`
- `node --check data/learning-content.js`
- `npm test`

Playwright 回归测试覆盖基础渲染、学习路径、概率锥 sigma 标注、hover 预览、重置确认、专业概念面板、组合级 Greeks Decay、Portfolio/Stress/Gamma P&L/专业训练面板。

## 重要限制

这是学习和专业训练工具，不是交易系统。

- 使用教育性 Black-Scholes 与情景模拟，不接入实时行情或真实期权链。
- Portfolio Margin 是教育性估算，不等同于真实 broker、FINRA 或 Cboe 规则。
- 未建模 bid/ask、滑点、手续费、税务、流动性、提前行权、指派概率。
- Greeks Decay 已是组合级曲线，但仍使用简化 IV 与期限假设。

任何交易决策都应由使用者独立判断，本项目不构成投资、税务、法律或交易建议。
