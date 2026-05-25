# Option Strategy Interactive Lab 项目文档

## 1. 项目目标

本项目用于学习并复刻 `https://options-viewer.netlify.app/` 的期权策略查看网页。

最终实现的是一个纯静态、可离线打开的期权策略交互分析台，核心目标包括：

- 复刻原站的主要信息架构：策略库、主损益图、Greeks 六联图、情景参数、风险指标、腿组合、策略说明。
- 总结原站已有期权策略，并补充常见但原站未单列的策略。
- 每个策略提供更详细的中文 Notes，包括适用场景、开仓参数、看图方法、管理路径、风险坑点和相关策略联动。
- 所有文件都放在 `option_strategy` 文件夹下，本地直接打开 `index.html` 即可使用。

## 2. 当前文件结构

```text
option_strategy/
├── index.html   页面骨架，包含左侧策略库、右侧工作台、图表区、参数区和 Notes 区
├── styles.css   深色 UI、网格布局、图表、Greeks、腿组合和 Notes 样式
├── app.js       策略数据、Black-Scholes 估值、盈亏/Greeks 计算、图表渲染和交互逻辑
└── README.md    本项目文档
```

## 3. 使用方式

这是纯静态项目，不依赖后端、不需要 npm、不需要联网。

直接打开：

```text
/home/option_strategy/index.html
```

或者把整个 `option_strategy` 文件夹复制到本地电脑，保持 `index.html`、`styles.css`、`app.js` 在同一目录下，然后用浏览器打开 `index.html`。

## 4. 参考网页分析

目标站点是一个静态部署的单页应用。初始 HTML 只包含页面容器，真正的策略数据、计算逻辑和渲染逻辑都在打包后的 JS 文件里。

原站主要结构：

- 左侧：策略库、搜索框、分类筛选。
- 顶部：当前策略名称、分类、重置模板。
- 主区：主损益图，可通过 IV 和 DTE 滑杆联动。
- Greeks：Risk/PnL、Delta、Gamma、Theta、Vega、Rho 六联图。
- 右侧：情景参数、风险指标、腿组合编辑。
- 底部：策略说明和免责声明。

原站策略数据的基本模型：

```js
{
  name,
  category,
  outlook,
  difficulty,
  legs,
  education
}
```

每条腿大致包含：

```js
{
  type: "option" | "stock",
  optionType: "call" | "put",
  side: "long" | "short",
  qty,
  strike,
  dte,
  iv
}
```

## 5. 策略覆盖

当前共整理了 71 个策略：

- 原站策略：60 个
- 补充策略：11 个

补充策略包括：

- Covered Put
- Stock Repair / Covered Ratio Spread
- Double Bull Spread
- Double Bear Spread
- Box Spread
- Short Call Calendar Spread
- Short Put Calendar Spread
- Risk Reversal
- Wheel Strategy
- Seagull / Fence
- Poor Man's Covered Call

补充逻辑主要参考 OIC、Cboe、Fidelity 等常见期权教育资料中的策略谱系。补充策略不是为了鼓励交易，而是让学习结构更完整，便于理解不同策略之间的转换关系。

## 6. 主要功能

### 6.1 左侧策略库

支持：

- 按名称、中文说明、分类、策略用途搜索。
- 按 `方向`、`收租`、`波动率`、`跨期`、`复杂`、`合成`、`股票覆盖`、`向导` 等分类筛选。
- 显示原站策略数量、补充策略数量和当前筛选结果数量。
- 点击策略后，右侧所有图表、参数、风险指标和 Notes 同步切换。

### 6.2 主损益图

主损益图显示三条曲线：

- 开仓日曲线
- 当前情景曲线
- 到期曲线

可联动参数：

- IV 变动滑杆
- Date / DTE 滑杆
- 当前价格
- 图表价格范围
- 利率
- 股息率
- 合约乘数
- 每条腿的方向、数量、行权价、DTE、IV

图中还显示：

- 当前价格线
- 盈亏平衡线
- 0 盈亏线

### 6.3 Greeks 六联图

六联图包括：

- Risk / PnL
- Delta
- Gamma
- Theta
- Vega
- Rho

这些图会随着情景参数、IV 滑杆、DTE 滑杆和腿组合编辑实时变化。

### 6.4 风险指标

当前计算并展示：

- 最大收益
- 最大亏损
- 盈亏平衡点
- 当前 PnL
- 净初始价值
- Delta
- Gamma
- Theta/日
- Vega/1%
- Rho/1%

### 6.5 腿组合编辑

股票腿支持：

- Long / Short
- 数量
- 入场价

期权腿支持：

- Long / Short
- Call / Put
- 数量
- 行权价
- DTE
- IV

编辑后会触发图表、Greeks、风险指标和 Notes 重新计算。

### 6.6 Notes 策略手册

Notes 区从最初的简短说明升级为策略 playbook，包括：

- 腿组合
- 具体什么场景怎么用
- 开仓参数怎么选
- 如何看图和 Greeks
- 管理和调整路径
- 容易踩坑的地方
- 相关策略联动

相关策略联动是可点击按钮。例如 Long Call 会联动到：

- Bull Call Spread
- Diagonal Call Spread
- Call Ratio Backspread
- Long Combo
- Poor Man's Covered Call

这样可以从一个策略自然跳到成本更低、风险更定义、跨期、收租或合成版本。

## 7. 核心计算逻辑

### 7.1 期权估值

项目使用简化版 Black-Scholes 模型计算期权理论价值和 Greeks。

计算内容：

- Price
- Delta
- Gamma
- Theta
- Vega
- Rho

注意：

- 模型是学习用途，不等于真实市场报价。
- 未处理真实盘口、买卖价差、提前行权概率、波动率曲面、偏斜、流动性、保证金、手续费和税务。
- 股票期权通常是美式期权，而 Black-Scholes 更接近欧式估值假设。

### 7.2 组合盈亏

组合计算方式：

1. 计算每条腿开仓时的理论价值。
2. 根据当前情景重新计算每条腿价值。
3. 用当前组合价值减去初始组合价值，得到 PnL。
4. 把每条腿的 Greeks 按方向、数量和合约乘数加总。

买卖方向处理：

- Long 为正方向。
- Short 为负方向。
- 股票腿按线性价格变化计算。
- 期权腿按 Black-Scholes 重新估值。

### 7.3 到期曲线和当前曲线

主损益图里：

- 当前情景曲线使用当前 DTE、IV Shift 和情景参数。
- 到期曲线使用剩余 DTE 归零后的内在价值。
- 开仓日曲线用于对照初始结构。

跨期策略中，不同腿 DTE 不一致，因此图表用较近到期腿作为主要观察窗口。

## 8. 实现过程

### 第一步：读取目标站点

先访问目标站点，确认它是一个单页应用。普通 HTML 里只有容器结构，策略和计算逻辑在打包 JS 中。

随后读取打包资源，提取出：

- 策略名称
- 策略分类
- 腿组合
- 原站说明结构
- Black-Scholes 近似计算方式
- 主图和 Greeks 联动方式

### 第二步：先做静态学习版

最初版本先做了一个策略总结页：

- 每个策略一张卡片。
- 每张卡片有腿组合、赚钱逻辑、风险、适用场景、简单例子和 payoff 图。
- 补充了原站没有单列的常见策略。

这个版本适合阅读，但不够接近原站的交互体验。

### 第三步：升级成交互分析台

根据需求，页面改造成原站式布局：

- 左侧策略库。
- 右侧单策略工作区。
- 主损益图。
- Greeks 六联图。
- 情景参数。
- 风险指标。
- 腿组合编辑。
- Notes。

这一步把静态 payoff 图升级成了由情景参数驱动的实时图表。

### 第四步：增强 Notes

最初 Notes 仍然偏简短。后来根据需求升级为更详细的策略手册：

- 根据策略类型自动生成使用场景。
- 根据收入型、跨期型、买波动型、合成型、股票覆盖型等不同结构给出不同开仓和管理逻辑。
- 根据当前策略的 Greeks 动态解释图表。
- 加入相关策略按钮，实现策略之间联动学习。

### 第五步：修复图表渲染 bug

Greeks 六联图中出现过黑色块状区域。

原因：

- SVG 的 `<path>` 默认 `fill` 是黑色。
- Greeks 曲线是 open path，但没有显式设置 `fill: none`。
- 浏览器就把曲线路径内部区域填充成黑色，看起来像图表里出现了黑框或黑三角。

解决：

在 `styles.css` 中给 Greeks 曲线统一加上：

```css
.curve-risk,
.curve-delta,
.curve-gamma,
.curve-theta,
.curve-vega,
.curve-rho {
  fill: none;
  stroke-width: 1.8;
}
```

修复后，六联图只显示曲线，不再有黑色填充块。

## 9. 遇到的问题和解决方式

### 9.1 `/home/option_strategy` 无法直接创建

问题：

`/home` 目录属于 root，普通用户直接创建 `/home/option_strategy` 会遇到权限问题。

解决：

使用 sudo 创建目录，并把目录 owner 改回当前用户：

```bash
sudo -n mkdir -p /home/option_strategy
sudo -n chown ubuntu:ubuntu /home/option_strategy
```

### 9.2 目标站点是单页应用，HTML 里没有策略数据

问题：

直接查看目标网页 HTML，只能看到页面骨架，看不到策略列表。

解决：

读取目标站点引用的打包 JS 文件，从 JS 中提取策略数组、腿组合和计算逻辑。

### 9.3 沙箱 `bwrap` 报错

问题：

执行一些本地命令时出现：

```text
bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted
```

解决：

对必要命令使用提升权限执行，保证能读取和写入项目文件。改动范围仍然限制在 `/home/option_strategy`。

### 9.4 Notes 太浅，不能指导策略选择

问题：

初版 Notes 只有赚钱逻辑、风险和例子，缺少“什么时候用、怎么选参数、出了问题怎么调整”的实战学习价值。

解决：

新增 playbook 逻辑，根据策略类型和当前 Greeks 动态生成更详细说明，并加入相关策略联动按钮。

### 9.5 Greeks 六联图出现黑块

问题：

SVG 曲线默认填充导致图表出现黑色块状区域。

解决：

给 Greeks 曲线样式加 `fill: none`。

### 9.6 相关策略 slug 不一致

问题：

某些中文/括号策略名称生成的 slug 和手写关联 ID 不完全一致，例如 Delta Neutral。

解决：

检查 slug 生成规则，并修正相关策略 ID，确保按钮能切换到正确策略。

## 10. 验证方式

常用检查：

```bash
node --check /home/option_strategy/app.js
```

已安装 Playwright + Chromium，可以运行真实浏览器 smoke test：

```bash
cd /home/option_strategy
npm test
```

目前已经验证：

- JS 语法通过。
- Playwright 浏览器测试通过。
- 初始页面能渲染 Long Call。
- 主损益图能生成。
- Greeks 六联图能生成。
- 情景参数能生成。
- 风险指标能生成。
- Notes 详细内容和相关策略按钮能生成。

## 11. 当前限制

本项目是学习工具，不是交易系统。

当前限制：

- 使用简化 Black-Scholes 模型。
- 没有实时行情。
- 没有真实期权链。
- 没有 bid/ask、滑点、手续费。
- 没有保证金模型。
- 没有提前行权和指派概率模型。
- 没有波动率曲面和 skew。
- 没有保存用户自定义策略。
- 没有导入/导出策略配置。

## 12. 后续可以继续做的方向

可以继续迭代：

- 增加自定义添加/删除腿。
- 增加保存策略到 localStorage。
- 增加导出图片或 PDF。
- 增加真实期权链导入。
- 增加 IV Rank、历史波动率、预期移动计算。
- 增加概率分析，例如到期落在区间内的概率。
- 增加策略对比视图，同时比较两个策略。
- 增加移动端专门布局优化。
- 增加中英文切换。

## 13. 免责声明

本项目仅用于期权策略学习、网页复刻和情景模拟，不构成任何证券、期权、税务、法律或投资建议。

页面中的损益图、Greeks、IV 变动和 DTE 模拟均基于简化模型，可能与真实市场报价、成交价格、流动性、保证金要求、交易费用、税费和行权/指派结果存在差异。

期权交易具有高风险，部分策略可能导致超过初始投入的损失。任何交易决策都应由使用者独立判断，并结合自身风险承受能力和专业意见自行承担后果。
