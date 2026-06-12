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

## 四目的地导航

App 打开后默认进入**转型计划**。页面左侧 primary nav 提供四个顶级目的地，点击切换，选择持久化至 localStorage（`os_d1_dest`）：

- **转型计划** — D1-to-Derivatives 学习主路径（见下方详细说明）。
- **策略库** — 71 个策略可搜索 grid，独立浏览；点击策略跳至实验室。
- **实验室** — 完整交互分析面板（payoff chart、Greeks、scenario sliders、metrics、legs）全屏展示。
- **练习场** — Scenario Bank（211 个场景，sector + topic 过滤器），独立练习。

**全局控制**（CN/EN 语言切换 + 初级/进阶/专业模式）位于 primary nav 右侧，在所有目的地均可访问。Easy/Pro 皮肤切换在页面右下角浮动胶囊（见下方”Easy/Pro 皮肤切换”）。

## 转型计划（D1-to-Derivatives Learning Hub）

**转型计划**是把 commodities D1 经验转成 equity derivatives 专业表达的学习主脊柱。页面左侧 Sector 脊柱（`#sectorSpine`）展示学习节点，从左到右依次为：

- **总览** — Sector A-E + Professional Sprint 学习路径 Roadmap。
- **Sector A — Risk Mechanics**：Delta、Gamma、Vega、Theta/Rho 直觉训练；含 Commodities Bridge（D1 经验迁移框架）。
- **Sector B — Trade Construction**：策略选择与构建；含 strategy comparisons（straddle/strangle、iron condor/short strangle、collar/protective put 等）和 20 个 client recommendation drills。
- **Sector C — Market Dynamics**：Vol 框架（RV/IV、event vol、skew、term structure、surface）+ Dealer Desk（dealer workflow、inventory、delta hedge、P&L attribution）；约 85 个 vol + dealer 场景。
- **Sector D — Research Bridge**：把股票研究产出转化为期权决策；含 Research Desk 案例卡 + View-to-Trade 演练（见下方”Research Bridge 使用说明”）。
- **Sector E — Complex Products**：Asian、Barrier、Quanto、Digital、Autocallable 和 structured product；含 Exotics Bridge 卡 + structuring cases + Exotics Risk 训练。
- **🏁 冲刺（Professional Sprint）** — topic-filtered sessions，0/1/2 自评分，弱项标记，Skill Dashboard，本地 progress report 导出。

选中 Sector 后，该 Sector 的**学习模块流**（按模块卡片排列）与**深度内容**（vol-framework、dealer-desk、exotics-bridge、exotics-risk、research-bridge、bridge、construction、client-drills 等，视 Sector 而定）均在同一视图内堆叠显示，无需切换子 tab。

模块卡片内的策略 chip 点击后以**全屏 overlay** 打开实验室分析面板，分析完毕关闭 overlay 后自动回到转型计划同一位置。

模块、场景题、客户推荐演练和 Research Bridge 演练进度保存在本机浏览器 localStorage，不会上传到服务器。

## Research Bridge 使用说明（Sector D）

Research Bridge 帮助你把股票研究产出（earnings preview、sector analysis、comps、IC memo、investment thesis）转化为具体的期权策略决策。

### Research Desk（研究案例卡）

进入**转型计划**，在 Sector 脊柱选 **Sector D（Research Bridge / 研究桥接）**，向下滚动至 Research Desk 区域：

- 页面展示 16 张双语研究案例卡，每张卡包含研究结论、期权策略建议和风险考量。
- 顶部过滤栏按研究类型筛选：
  - **Earnings / 业绩前瞻**：围绕财报预期和 IV crush 的策略决策。
  - **Sector Analysis / 行业分析**：行业轮动和宏观主题驱动的期权结构。
  - **Comps / 可比公司**：通过可比公司估值差异选择方向和结构。
  - **IC Memo / 首次覆盖**：首次覆盖报告初始建仓逻辑的期权化。
  - **Thesis / 投资逻辑**：长期投资逻辑转化为期权收益结构。
- 点击卡片展开详情，查看完整的研究-策略映射逻辑和专业表达示例。

### View-to-Trade 演练

Research Desk 下方为 15 个 View-to-Trade 演练：

1. 阅读研究观点摘要，先自行思考应选什么期权结构及原因。
2. 点击"**Market View**"展开市场观点确认。
3. 依次点击"**Constraints**"（交易约束）→"**Candidates**"（候选结构）→"**Recommendation**"（推荐方案）→"**Key Risks**"（关键风险）→"**Professional Expression**"（专业表达）逐步揭示。
4. 完成演练后点击"Mark Complete / 标记完成"，进度记录在 localStorage 中并显示于进度摘要（"Research Drills n/15 / 研究演练 n/15"）。

## Easy/Pro 皮肤切换

页面右下角有一个浮动胶囊按钮，包含两个选项：

- **Pro（默认）**：Heritage Terminal 风格，琥珀色主色（Bloomberg 特征色）、近黑 OLED 背景、等宽数字（IBM Plex Mono）、F 键位 tab 前缀、斑马纹数据表格。适合习惯专业 terminal 界面的用户。
- **Easy**：浅色模式（白色卡片、蓝色主色调），对浅色偏好用户更友好。

切换方式：点击胶囊中的"Easy"或"Pro"按钮即可立即切换，选择持久化至 localStorage（`os_d1_skin`），下次打开页面自动恢复。皮肤切换与内容难度（初级/进阶/专业）完全独立，不影响任何学习进度或内容显示。

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
