# Options Strategy Interactive Lab 使用指南

## 快速开始

### Windows

推荐直接打开本地文件：

```powershell
cd D:\option_strategy
start index.html
```

也可以使用本地服务器：

```powershell
cd D:\option_strategy
npx serve .
```

运行自动化测试：

```powershell
npm install
npx playwright install chromium
npm test
```

### Linux/Mac

推荐直接打开本地文件：

```bash
cd /home/option_strategy
xdg-open index.html    # Linux
open index.html        # Mac
```

也可以使用本地服务器：

```bash
cd /home/option_strategy
npx serve .
```

运行自动化测试：

```bash
npm install
npx playwright install chromium
npm test
```

## D1-to-Derivatives Learning Hub

Phase 4A/4B is now available here: open Dealer Desk to train client flow -> dealer exposure -> hedge action -> quote adjustment -> residual risk, and use the enhanced Gamma P&L tool to compare static P&L, dynamic hedge P&L, rehedge thresholds, and transaction costs.


页面顶部的“交易员学习中枢”用于把 commodities D1 经验转成 equity derivatives 专业表达。

- `Roadmap`：查看六个月学习路径。当前开放 Month 1 Greeks、Month 2 Strategy Construction、Month 3 Volatility Framework 和 Month 4 Dealer Hedging / Market Making。
- `学习模块`：按 Delta、Gamma、Vega、Theta/Rho、strategy construction、RV/IV、event vol、skew、term structure、vol surface、dealer inventory、delta hedging、gamma scalping、vega buckets、quote skewing 和 P&L attribution 学习。
- `Strategy Construction`：查看 Month 2 的策略选择对比，包括 straddle/strangle、iron condor/short strangle、collar/protective put 等。
- `客户推荐`：做 20 个 client recommendation drills，按客户目标、约束条件、候选结构、推荐结构、风险披露、Dealer 视角和专业表达逐步展开。
- `Vol 框架`：学习 RV/IV、event vol、skew、term structure 和 surface shifts；用小计算器理解 implied move 与 breakeven RV；用 Vol trade playbook 比较 long vol、short vol、event、skew、term structure 和 surface-bucket 交易。
- `Dealer Desk`：训练 dealer workflow，明确客户 payoff 与 dealer Greeks/inventory 的区别，并学习 delta hedge、quote adjustment、residual risk 和 P&L attribution。
- `Commodities Bridge`：对比 commodities D1 与 equity derivatives 的相同点和需要修正的直觉。
- `Scenario Bank`：按 category、month、topic 练习场景题，可过滤 vol、skew、term-structure、event、surface、short-vol、gamma、liquidity、dealer、hedging、quote、attribution、inventory，可 reveal answer、标记理解、加入复习。

模块、场景题和客户推荐演练进度保存在本机浏览器 localStorage，不会上传到服务器。

## 三种模式

### 初级模式

适合从零理解策略结构。

主要功能：

- 71 个策略列表、搜索和分类筛选。
- 主损益图：开仓日、当前情景、到期曲线。
- 概率锥视图：包含 `-2σ / -1σ / +1σ / +2σ` 区间标注。
- 逐腿分解视图：看每条腿如何贡献总体 payoff。
- Greeks 六联图：Risk/PnL、Delta、Gamma、Theta、Vega、Rho。
- 情景参数：Spot、IV Shift、DTE、利率、股息率、价格范围、合约乘数。
- 腿组合编辑：方向、数量、Call/Put、行权价、DTE、IV。
- Notes：策略赚钱逻辑、风险、适用场景、参数选择、管理路径和相关策略。
- 学习路径：访问记录、完成标记、难度跃迁提示。

### 进阶模式

适合系统训练衍生品、交易、做市、投研相关专业能力。

在初级模式之上增加：

- Trader Memo：Exposure、盈利逻辑、客户视角、Dealer 对冲视角。
- Professional Concepts：Greeks 关系、客户类型、Dealer 对冲原则、保证金与资本管理。
- Portfolio Greeks：把多个策略加入组合，查看总 Delta/Gamma/Theta/Vega/Rho、P&L 和风险提示。
- 保证金教育估算：区分 Long Option、Defined Risk Spread、Naked Short 等结构。
- 压力测试矩阵：Spot 与 IV 双维度场景 P&L。
- Gamma P&L：对比静态持有和动态 Delta hedge 的路径效果，并可调整 rehedge threshold 与 transaction cost。
- Vol Surface：教育性 smile/skew 可视化。
- Greeks Decay：组合级 Gamma/Theta/Vega 随 DTE 变化曲线，支持 ATM/ITM/OTM 和自定义中心行权价。
- Put-Call Parity：检查 `C - P = S - K·e^(-rT)`。

### 专业模式

适合最后做高强度专业表达训练。

在进阶模式之上增加专业问答与情景演练。当前共有 141 个专业问答，核心策略覆盖较完整，部分新增策略不是每个都有固定 5 问。

建议使用方式：

1. 先选策略并自己讲出腿组合、赚钱来源、最大风险。
2. 看 Trader Memo，确认 Greeks 和客户/Dealer 视角。
3. 用压力测试验证极端场景。
4. 最后打开专业问答，对照标准表达补漏洞。

## 40 个专业内容策略

方向与保护：

- Long Call
- Long Put
- Bull Call Spread
- Bear Put Spread
- Collar
- Protective Put

收租与卖方结构：

- Covered Call
- Cash-Secured Put
- Bear Call Spread
- Short Put
- Short Call
- Short Straddle
- Short Strangle
- Iron Condor
- Iron Butterfly
- Jade Lizard
- Wheel Strategy

波动率结构：

- Straddle
- Strangle
- Inverse Iron Condor
- Inverse Iron Butterfly
- Call Ratio Backspread
- Put Ratio Backspread
- Strip
- Strap
- Guts

蝶式、鹰式与翼式：

- Long Call Butterfly
- Long Call Condor
- Long Put Condor
- Short Call Butterfly
- Short Put Butterfly

跨期与对角：

- Calendar Call Spread
- Calendar Put Spread
- Diagonal Call Spread
- Diagonal Put Spread
- Poor Man's Covered Call

合成、套利与股票覆盖：

- Long Synthetic Future
- Risk Reversal
- Box Spread
- Seagull / Fence

## 学习路线

第 1 周：基础方向和价差。

- Long Call、Long Put
- Covered Call、Cash-Secured Put
- Bull Call Spread、Bear Put Spread

目标：读懂 payoff、Delta、Theta、最大盈亏和盈亏平衡。

第 2 周：波动率和收租。

- Straddle、Strangle
- Short Straddle、Short Strangle
- Iron Condor、Iron Butterfly

目标：理解 Gamma/Theta 交换、short vol 风险、IV crush 和尾部亏损。

第 3 周：对冲、合成和跨期。

- Protective Put、Collar、Seagull/Fence
- Long Synthetic Future、Risk Reversal、Box Spread
- Calendar、Diagonal、Poor Man's Covered Call

目标：理解 parity、期限结构、Vega 暴露和组合对冲。

第 4 周：专业冲刺。

- 复习 40 个专业策略。
- 用 141 个专业问答做口头回答训练。
- 对每个策略至少讲清：腿组合、赚钱来源、主要风险、适用场景、如何调整。

## 常见任务

### 判断一个策略适不适合当前观点

1. 在左侧搜索策略。
2. 看主损益图和风险指标。
3. 打开 Notes，读“适用于什么情况”和“管理路径”。
4. 切到相关策略按钮，比较更保守、更激进或更省权利金的表达方式。

### 看市场大幅波动下会怎样

1. 切到进阶模式。
2. 点击“运行压力测试”。
3. 看 `Spot -10% / IV +50%`、`Spot +10% / IV +50%` 等尾部场景。
4. 对照 Portfolio Greeks 和 Gamma P&L，判断风险来自方向、Vega 还是 Gamma。

### 学 Greeks

1. 先看 Greeks 六联图。
2. 调 Spot、IV、DTE，看曲线如何联动。
3. 点击 Greek 概念卡片。
4. 切进阶模式看 Professional Concepts。
5. 用 Greeks Decay 看快到期时 Gamma/Theta/Vega 如何变化。

### 训练专业表达

1. 进入专业模式。
2. 选一个策略，例如 Iron Condor。
3. 先口头回答：为什么赚钱、哪里亏、如何调整、Dealer 怎么 hedge。
4. 再看专业问答校对。
5. 换成相关策略，例如 Short Strangle、Iron Butterfly、Jade Lizard，练习比较题。

## 开发和内容维护

添加基础策略：

1. 修改 `data/strategies.js`。
2. 补 legs、money、risk、when、example。
3. 刷新页面检查图表和 Notes。

添加专业内容：

1. 修改 `data/professional-content.js`。
2. 按现有结构补 exposure、profitLogic、clientPerspective、dealerPerspective 和专业问答条目。
3. 运行 `node --check data/professional-content.js` 和 `npm test`。

修改 UI：

1. 结构在 `index.html`。
2. 样式在 `styles.css`。
3. 交互和计算在 `app.js`。
4. 改完至少运行 `npm test`。

## 故障排除

页面空白：

- 检查浏览器控制台。
- 确认 `index.html`、`app.js`、`styles.css`、`data/` 在同一项目目录下。
- 尝试强制刷新。

专业内容不显示：

- 确认顶部模式切到了“进阶”或“专业”。
- 某些策略只有初级内容，没有 Trader Memo 或专业问答。

测试不能运行：

- 先运行 `npm install`。
- 如果提示找不到浏览器，运行 `npx playwright install chromium`。

## 免责声明

本项目仅用于学习、网页复刻和专业训练，不构成任何证券、期权、税务、法律或投资建议。页面中的价格、Greeks、概率、保证金和压力测试均为教育性模型结果，可能与真实市场、broker 规则和实际成交结果不同。
