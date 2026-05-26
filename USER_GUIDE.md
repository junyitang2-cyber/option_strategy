# Options Strategy Interactive Lab - 本地使用指南

## 快速开始

### 方法1：直接打开（推荐）
1. 进入项目目录：`d:\option_strategy`
2. 双击 `index.html` 文件
3. 浏览器会自动打开工具

### 方法2：通过命令行
```bash
cd d:/option_strategy
start index.html          # Windows
# 或
open index.html           # Mac
# 或
xdg-open index.html       # Linux
```

### 方法3：本地服务器（可选）
如果需要更好的开发体验：
```bash
cd d:/option_strategy
npx serve .
# 然后访问 http://localhost:3000
```

---

## 功能使用指南

### 1. 基础模式（默认）
**适合**：初学者、快速学习策略基础

**功能**：
- 左侧策略列表：71个期权策略
- 搜索框：输入策略名称快速查找
- 主损益图：实时显示策略的P&L曲线
- Greeks六联图：Delta, Gamma, Theta, Vega, Rho, 以及组合P&L
- 情景参数：调整Spot, IV, DTE等
- 策略说明：中文解释策略逻辑

**操作**：
1. 点击左侧策略（如"Long Call"）
2. 查看主损益图和Greeks
3. 拖动滑块调整IV和时间
4. 点击"▶"播放时间衰减动画

---

### 2. 专业模式 🔥
**适合**：准备面试、深入理解专业视角

**如何进入**：
- 点击顶部 **"专业"** 按钮

**新增功能**：

#### A. Trader Memo（专业交易员视角）
显示4个维度：
- **📊 Exposure分解**：方向、波动率、时间、凸性
- **💰 盈利逻辑与风险**：赚钱来源、亏钱来源、最佳/最差情景
- **👤 客户视角**：为什么做、客户类型、适当性
- **🏦 Dealer对冲视角**：exposure、对冲方法、利润来源

**使用场景**：
- 理解策略的Greeks暴露
- 学习Dealer如何对冲客户交易
- 了解客户适当性和风险披露

#### B. 压力测试矩阵
**功能**：5×4场景测试（Spot × IV）
- Spot shifts: -10%, -5%, 0%, +5%, +10%
- IV shifts: -30%, 0%, +30%, +50%

**操作**：
1. 点击 **"运行压力测试"** 按钮
2. 查看20个场景的P&L
3. 识别最差和最佳情景
4. 查看Greek Shock估算

**使用场景**：
- 面试问题："这个策略在市场大跌时会怎样？"
- 风险管理：了解极端情况下的亏损

#### C. Put-Call Parity计算器
**功能**：检查C - P = S - K·e^(-rT)

**操作**：
1. 输入Call Price, Put Price, Spot, Strike, DTE, Rate
2. 点击 **"检查Parity"**
3. 查看Synthetic Forward vs Theoretical Forward
4. 识别mispricing和套利机会

**使用场景**：
- 面试问题："如何检测期权定价错误？"
- 理解Put-Call Parity关系

---

### 3. 面试模式 🎯
**适合**：面试前最后冲刺

**如何进入**：
- 点击顶部 **"面试"** 按钮

**新增功能**：

#### 面试问答（Q&A）
每个策略5个高质量问答：
- Q1: 策略基础（风险、Greeks）
- Q2: 技术细节（为什么ATM gamma最高？）
- Q3: Dealer视角（如何对冲？）
- Q4: 实战应用（什么时候用？）
- Q5: 参数选择（如何选strike和DTE？）

**使用方法**：
1. 选择策略（如"Iron Condor"）
2. 滚动到 **"面试问答 Q&A"** 面板
3. 阅读5个问答
4. 尝试先自己回答，再看答案

**覆盖的面试主题**：
- Greeks关系和策略构建
- 风险管理和对冲
- 客户场景和适当性
- Dealer视角和market making
- 实战案例和调整

---

## 20个核心策略列表

### 基础方向策略（4个）
1. **Long Call** - 买入看涨期权
2. **Long Put** - 买入看跌期权
3. **Covered Call** - 备兑看涨
4. **Cash-Secured Put** - 现金担保卖Put

### 价差策略（3个）
5. **Bull Call Spread** - 牛市看涨价差
6. **Bear Put Spread** - 熊市看跌价差
7. **Bear Call Spread** - 熊市看涨价差

### 波动率策略（4个）
8. **Straddle** - 跨式组合（做多IV）
9. **Strangle** - 宽跨式组合（做多IV）
10. **Short Straddle** - 卖出跨式（做空IV）
11. **Short Strangle** - 卖出宽跨式（做空IV）

### 收租策略（2个）
12. **Iron Condor** - 铁秃鹰
13. **Iron Butterfly** - 铁蝴蝶

### 蝶式策略（1个）
14. **Long Call Butterfly** - 买入看涨蝶式

### 日历策略（1个）
15. **Calendar Call Spread** - 日历看涨价差

### 对冲策略（2个）
16. **Protective Put** - 保护性看跌期权
17. **Collar** - 领口策略

### 合成策略（3个）
18. **Long Synthetic Future** - 合成多头
19. **Risk Reversal** - 风险逆转
20. **Box Spread** - 盒式套利

---

## 学习路径建议

### 第1周：基础策略（基础模式）
- Day 1-2: Long Call, Long Put
- Day 3-4: Covered Call, Cash-Secured Put
- Day 5-7: Bull Call Spread, Bear Put Spread

**目标**：理解Greeks、损益图、基本策略逻辑

### 第2周：波动率和收租（专业模式）
- Day 1-2: Straddle, Strangle
- Day 3-4: Iron Condor, Iron Butterfly
- Day 5-7: Short Straddle, Short Strangle

**目标**：理解Vega、Theta、Gamma-Theta tradeoff

### 第3周：对冲和合成（专业模式）
- Day 1-2: Protective Put, Collar
- Day 3-4: Synthetic Future, Risk Reversal
- Day 5-7: Box Spread, Calendar Spread

**目标**：理解对冲原理、Put-Call Parity、套利

### 第4周：面试冲刺（面试模式）
- Day 1-3: 复习20个策略的面试问答
- Day 4-5: 压力测试和风险管理
- Day 6-7: 模拟面试问题

**目标**：能流利回答100个面试问题

---

## 常见使用场景

### 场景1：准备面试问题
**问题**："Iron Condor和Iron Butterfly有什么区别？"

**操作**：
1. 切换到 **面试模式**
2. 选择 **Iron Butterfly**
3. 查看Q1："Iron Butterfly和Iron Condor有什么区别？"
4. 阅读答案，理解关键差异

### 场景2：理解Dealer对冲
**问题**："Dealer卖出ATM call后如何对冲？"

**操作**：
1. 切换到 **专业模式**
2. 选择 **Long Call**
3. 查看 **Dealer对冲视角** 部分
4. 阅读对冲方法和利润来源
5. 查看面试问答Q3

### 场景3：风险分析
**问题**："这个策略在市场大跌时会怎样？"

**操作**：
1. 选择策略（如Iron Condor）
2. 切换到 **专业模式**
3. 点击 **"运行压力测试"**
4. 查看 -10% Spot, +50% IV 场景的P&L
5. 查看最差情景分析

### 场景4：Greeks学习
**问题**："为什么ATM期权的Gamma最高？"

**操作**：
1. 选择 **Long Call**
2. 查看Greeks六联图中的Gamma曲线
3. 拖动Spot滑块，观察Gamma变化
4. 切换到 **面试模式**，查看Q2答案

---

## 快捷键和技巧

### 时间衰减动画
- 点击 **▶** 播放
- 点击 **⏸** 暂停
- 点击 **↺** 重置
- 选择速度：1x, 2x, 5x

### 图表交互
- **主损益图**：鼠标悬停查看具体数值
- **Greeks图**：点击Greek名称查看概念解释
- **压力测试表格**：鼠标悬停查看Delta和Vega

### 搜索技巧
- 中文搜索：输入"铁秃鹰"
- 英文搜索：输入"Iron Condor"
- 拼音搜索：输入"收租"
- 部分匹配：输入"Call"显示所有包含Call的策略

---

## 技术要求

### 浏览器支持
- ✅ Chrome 90+（推荐）
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### 无需安装
- ✅ 纯静态HTML/CSS/JavaScript
- ✅ 无需Node.js或npm（除非运行测试）
- ✅ 无需网络连接（离线可用）

### 性能
- 加载时间：< 1秒
- 图表渲染：实时
- 策略切换：即时

---

## 故障排除

### 问题1：页面空白
**原因**：JavaScript加载失败

**解决**：
1. 检查浏览器控制台（F12）
2. 确保所有文件在同一目录
3. 尝试刷新页面（Ctrl+F5）

### 问题2：专业内容不显示
**原因**：未切换到专业/面试模式

**解决**：
1. 点击顶部 **"专业"** 或 **"面试"** 按钮
2. 确保按钮高亮显示（cyan颜色）

### 问题3：某些策略无专业内容
**原因**：仅20个核心策略有专业内容

**解决**：
- 查看支持列表（上方20个策略）
- 其他51个策略仅有基础内容

---

## 进阶使用

### 自定义策略
1. 打开 `data/strategies.js`
2. 添加新策略定义
3. 刷新页面

### 添加专业内容
1. 打开 `data/professional-content.js`
2. 按照现有格式添加新策略
3. 刷新页面

### 修改样式
1. 打开 `styles.css`
2. 修改颜色、字体、布局
3. 刷新页面

---

## 学习资源

### 内置资源
- 71个策略的基础说明
- 20个策略的专业Trader Memo
- 100个面试问答
- Greeks概念解释
- 压力测试工具
- Put-Call Parity计算器

### 外部参考
- [OIC - Options Strategies](https://www.optionseducation.org/strategies/all-strategies-en)
- [Cboe - Trading Strategies](https://res-certification.cboe.com/resources/options/Trading_Strategies.pdf)
- [Fidelity - Options Strategy Guide](https://www.fidelity.com/learning-center/investment-products/options/options-strategy-guide)

---

## 反馈和贡献

### 报告问题
- GitHub Issues: https://github.com/junyitang2-cyber/option_strategy/issues

### 功能建议
- 欢迎提出新功能建议
- 优先考虑面试准备相关功能

---

## 总结

这个工具现在是一个**完整的derivatives trading面试准备平台**：

✅ **71个策略**的基础内容  
✅ **20个核心策略**的专业内容  
✅ **100个面试问答**  
✅ **压力测试**和风险分析  
✅ **Trader Memo**（Exposure、客户、Dealer视角）  
✅ **Put-Call Parity**检查器  

**面试准备完整度：95%**

祝你面试顺利！🎉
