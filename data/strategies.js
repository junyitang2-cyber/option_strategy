// Option strategy definitions — used by the Option Strategy Interactive Lab
// Extracted from app.js to keep the main application file manageable.

const option = (optionType, side, qty, strike, dte = 45, iv = 0.32) => ({
  type: "option",
  optionType,
  side,
  qty,
  strike,
  dte,
  iv,
});

const stock = (side, qty = 1, entry = 100) => ({
  type: "stock",
  side,
  qty,
  entry,
});

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[()（）]/g, "")
    .replace(/[^a-z0-9一-龥]+/g, "-")
    .replace(/^-|-$/g, "");

const baseManage =
  "先定义最大亏损和退出条件；到期前若价格靠近短腿或 Greeks 明显变化，应提前减仓、滚动或整体平仓，而不是只等到期。";

function s(config) {
  return {
    id: slug(config.name),
    source: "原站",
    manage: baseManage,
    ...config,
  };
}

const STRATEGIES = [
  s({
    name: "Long Call",
    cn: "买入看涨期权",
    category: "方向",
    outlook: "强看涨",
    difficulty: "Novice",
    legs: [option("call", "long", 1, 100, 45, 0.3)],
    money:
      "赚的是标的上涨带来的 Call 内在价值扩张，以及买方正 Gamma 带来的加速收益；如果 IV 同时上升，期权价格还会受 Vega 支撑。",
    risk:
      "最大亏损是权利金；主要敌人是方向不动、时间价值衰减和买在高 IV 后的波动率回落。",
    when:
      "适合强看涨、想用有限亏损换上行杠杆，且预期上涨速度足以覆盖 Theta 的情形。",
    example: "股价 100，买入 100C。若到期股价 120，盈利约等于 20 减去权利金；若低于 100，到期归零。",
  }),
  s({
    name: "Long Put",
    cn: "买入看跌期权",
    category: "方向",
    outlook: "强看跌",
    difficulty: "Novice",
    legs: [option("put", "long", 1, 100, 45, 0.3)],
    money:
      "赚的是标的下跌带来的 Put 内在价值扩张，也可以赚恐慌时 IV 上升；下跌越快，正 Gamma 越有利。",
    risk:
      "最大亏损是权利金；如果股价横盘或反弹，Put 会被时间衰减和 IV 回落同时挤压。",
    when:
      "适合明确看跌、做事件保护，或不想承担卖空股票无限风险的下行表达。",
    example: "股价 100，买入 100P。若到期股价 82，盈利约等于 18 减去权利金；若高于 100，期权到期归零。",
  }),
  s({
    name: "Covered Call",
    cn: "备兑看涨",
    category: "收租",
    outlook: "温和看涨 / 收租",
    difficulty: "Novice",
    legs: [stock("long"), option("call", "short", 1, 108, 45, 0.3)],
    money:
      "赚的是持有正股的上涨和卖出 Call 收到的权利金；如果股价不过执行价，权利金就是额外收益。",
    risk:
      "下跌风险仍接近持股风险；上涨过快时收益被短 Call 封顶，还可能遇到提前指派。",
    when:
      "适合愿意继续持股、但认为短期涨幅有限，并愿意在目标价卖出股票的投资者。",
    example: "持有 100 股成本 100，卖出 108C。到期股价 105，保留股票并收权利金；到 115，则大概率按 108 卖出。",
  }),
  s({
    name: "Cash-Secured Put",
    cn: "现金担保卖 Put",
    category: "收租",
    outlook: "温和看涨 / 想低价接货",
    difficulty: "Novice",
    legs: [option("put", "short", 1, 92, 45, 0.32)],
    money:
      "赚的是卖出 Put 收取的权利金；只要股价到期高于执行价，Put 归零，权利金留下。",
    risk:
      "股价大跌时会被按执行价买入股票，实际亏损接近持股下跌，只是被权利金略微缓冲。",
    when:
      "适合本来就愿意以某个较低价格买入标的，并且账户有足够现金承担指派。",
    example: "股价 100，卖出 92P。若到期股价 96，赚全部权利金；若跌到 80，可能以 92 接货。",
  }),
  s({
    name: "Protective Put",
    cn: "保护性 Put",
    category: "方向",
    outlook: "保护性看涨",
    difficulty: "Novice",
    legs: [stock("long"), option("put", "long", 1, 93, 60, 0.3)],
    money:
      "核心收益仍来自正股上涨；买入 Put 是给下跌买保险，把灾难亏损限制在可估范围内。",
    risk:
      "保险费会降低整体收益；如果股价横盘或小涨，Put 的时间价值损耗会拖累组合。",
    when:
      "适合已有盈利持仓、担心短期回撤，但又不想卖出股票或触发税务/仓位变化。",
    example: "持有股票 100，同时买 93P。若跌到 75，Put 抵消 93 以下的大部分损失；若涨到 115，享受上涨但扣除保险费。",
  }),
  s({
    name: "Bull Put Spread",
    cn: "牛市 Put 信用价差",
    category: "收租",
    outlook: "温和看涨",
    difficulty: "Intermediate",
    legs: [option("put", "short", 1, 95, 45, 0.32), option("put", "long", 1, 90, 45, 0.32)],
    money:
      "赚的是卖出较高执行价 Put 的权利金净收入，以及股价维持在短 Put 上方时的时间衰减。",
    risk:
      "最大亏损被低执行价长 Put 限定，但若股价跌破短 Put，亏损会快速扩大到价差宽度减净权利金。",
    when:
      "适合看涨或看不跌、IV 偏高、希望用定义风险方式收租的情形。",
    example: "卖 95P、买 90P，收 1.50。若到期股价高于 95，赚 1.50；若低于 90，最大亏损约 3.50。",
  }),
  s({
    name: "Bear Call Spread",
    cn: "熊市 Call 信用价差",
    category: "收租",
    outlook: "温和看跌",
    difficulty: "Intermediate",
    legs: [option("call", "short", 1, 105, 45, 0.32), option("call", "long", 1, 110, 45, 0.32)],
    money:
      "赚的是卖出较低执行价 Call 的净权利金；只要股价不突破短 Call，时间衰减对组合有利。",
    risk:
      "股价大涨会让短 Call 受压，最大亏损为价差宽度减净权利金，且临近到期 Gamma 会变得尖锐。",
    when:
      "适合看跌或认为上方压力明显，同时想用有限风险卖出波动率。",
    example: "卖 105C、买 110C，收 1.40。到期股价低于 105，赚全部权利金；高于 110，亏到上限。",
  }),
  s({
    name: "Iron Butterfly",
    cn: "铁蝶",
    category: "收租",
    outlook: "中性",
    difficulty: "Intermediate",
    legs: [
      option("put", "long", 1, 90, 45, 0.32),
      option("put", "short", 1, 100, 45, 0.32),
      option("call", "short", 1, 100, 45, 0.32),
      option("call", "long", 1, 110, 45, 0.32),
    ],
    money:
      "赚的是中间短 Straddle 的高权利金和 Theta；理想状态是到期价格停在中间执行价附近。",
    risk:
      "两侧突破都会亏损，虽然长翼定义了最大亏损；价格靠近翼端时 Gamma 与调整压力很高。",
    when:
      "适合预期区间极窄、IV 偏高并可能回落，且愿意主动管理短腿风险。",
    example: "买 90P、卖 100P、卖 100C、买 110C。股价到期接近 100 时收益最大，远离中心则利润快速下降。",
  }),
  s({
    name: "Iron Condor",
    cn: "铁秃鹰",
    category: "收租",
    outlook: "区间震荡",
    difficulty: "Intermediate",
    legs: [
      option("put", "long", 1, 85, 45, 0.32),
      option("put", "short", 1, 90, 45, 0.32),
      option("call", "short", 1, 110, 45, 0.32),
      option("call", "long", 1, 115, 45, 0.32),
    ],
    money:
      "赚的是两侧信用价差的净权利金；只要股价在短 Put 和短 Call 之间，两个短腿都随时间衰减。",
    risk:
      "单边突破会触发一侧价差亏损；最大亏损有限，但高波动行情中胜率和赔率会迅速恶化。",
    when:
      "适合预期低波动、区间清楚、IV 偏高且想用定义风险方式做中性收租。",
    example: "买 85P、卖 90P、卖 110C、买 115C。到期在 90-110 间收益最大，低于 85 或高于 115 亏损封顶。",
  }),
  s({
    name: "Long Put Butterfly",
    cn: "买入 Put 蝶式",
    category: "复杂",
    outlook: "中性 / 目标价",
    difficulty: "Intermediate",
    legs: [option("put", "long", 1, 110), option("put", "short", 2, 100), option("put", "long", 1, 90)],
    money:
      "赚的是价格到期停在中间执行价附近时，短 Put 腿价值衰减而两端长 Put 控制尾部。",
    risk:
      "最大亏损通常是净成本；如果价格远离中间执行价，蝶式会失去价值，且盈利窗口较窄。",
    when:
      "适合有明确目标价、预期到期前价格收敛到某一区域，而不是单边大趋势。",
    example: "买 110P、卖 2 张 100P、买 90P。若到期股价约 100，收益最高；若远高于 110 或低于 90，接近亏净成本。",
  }),
  s({
    name: "Long Call Butterfly",
    cn: "买入 Call 蝶式",
    category: "复杂",
    outlook: "中性 / 目标价",
    difficulty: "Intermediate",
    legs: [option("call", "long", 1, 90), option("call", "short", 2, 100), option("call", "long", 1, 110)],
    money:
      "赚的是股价到期停在中间 Call 执行价附近时的价差收敛，成本小、收益集中。",
    risk:
      "亏损通常限于净借记，但盈利区间窄；价格大涨或大跌都会让结构失去大部分价值。",
    when:
      "适合判断标的会靠近某个目标价，并希望用低成本表达范围观点。",
    example: "买 90C、卖 2 张 100C、买 110C。到期股价约 100 最佳，跌破 90 或涨破 110 后收益消失。",
  }),
  s({
    name: "Calendar Call Spread",
    cn: "Call 日历价差",
    category: "跨期",
    outlook: "中性偏多",
    difficulty: "Intermediate",
    legs: [option("call", "short", 1, 100, 30, 0.32), option("call", "long", 1, 100, 60, 0.3)],
    money:
      "赚的是近月 Call 衰减快、远月 Call 保留时间价值和 Vega；价格停在执行价附近时最理想。",
    risk:
      "股价快速远离执行价会伤害结构；近远月 IV 变化不利时，远月多头无法抵消近月风险。",
    when:
      "适合短期看震荡、稍长期看温和上行，或想交易期限结构与事件前后 IV 差。",
    example: "卖 30 天 100C、买 60 天 100C。30 天后股价仍接近 100，近月衰减明显，远月仍有价值。",
  }),
  s({
    name: "Calendar Put Spread",
    cn: "Put 日历价差",
    category: "跨期",
    outlook: "中性偏空",
    difficulty: "Intermediate",
    legs: [option("put", "short", 1, 100, 30, 0.32), option("put", "long", 1, 100, 60, 0.3)],
    money:
      "赚的是近月 Put 的快速 Theta 衰减，同时远月 Put 保留保护和 Vega 暴露。",
    risk:
      "价格大幅上涨或下跌都会偏离中心；若远月 IV 下跌过多，组合价值会被压低。",
    when:
      "适合短期不看大跌、但中期想保留偏空保护或波动率敞口。",
    example: "卖 30 天 100P、买 60 天 100P。近月到期股价接近 100 时，短腿衰减给组合贡献最大。",
  }),
  s({
    name: "Diagonal Call Spread",
    cn: "Call 斜跨价差",
    category: "跨期",
    outlook: "温和看涨",
    difficulty: "Intermediate",
    legs: [option("call", "long", 1, 100, 60, 0.3), option("call", "short", 1, 110, 30, 0.32)],
    money:
      "赚的是远月 Call 的方向收益和近月 OTM Call 的权利金衰减，类似带杠杆的备兑 Call。",
    risk:
      "如果股价快速越过短 Call，收益被压制并可能需要滚动；若股价下跌，远月 Call 会贬值。",
    when:
      "适合温和看涨、希望降低买入远月 Call 成本，并愿意管理短 Call。",
    example: "买 60 天 100C、卖 30 天 110C。股价缓慢涨到 108 附近较理想，暴涨到 125 则短腿受压。",
  }),
  s({
    name: "Diagonal Put Spread",
    cn: "Put 斜跨价差",
    category: "跨期",
    outlook: "温和看跌",
    difficulty: "Intermediate",
    legs: [option("put", "long", 1, 100, 60, 0.3), option("put", "short", 1, 90, 30, 0.32)],
    money:
      "赚的是远月 Put 的下行暴露，同时用卖出近月低执行价 Put 降低成本。",
    risk:
      "快速下跌到短 Put 下方会让短腿承压；若股价上涨，远月 Put 价值会被时间衰减消耗。",
    when:
      "适合温和看跌、想买保护但希望通过近月 Put 收租降低净成本。",
    example: "买 60 天 100P、卖 30 天 90P。温和下跌有利，暴跌穿 90 时需要处理短 Put。",
  }),
  s({
    name: "Bull Call Spread",
    cn: "牛市 Call 借记价差",
    category: "方向",
    outlook: "温和看涨",
    difficulty: "Intermediate",
    legs: [option("call", "long", 1, 100), option("call", "short", 1, 110)],
    money:
      "赚的是股价上涨到高执行价附近的方向收益；卖出上方 Call 降低成本，但也封顶利润。",
    risk:
      "最大亏损是净借记；如果股价不涨或涨得太慢，时间衰减会吞掉成本。",
    when:
      "适合看涨但目标价有限，或者觉得 Long Call 太贵、想降低权利金支出。",
    example: "买 100C、卖 110C，花 3。若到期股价 112，最大收益约 7；若低于 100，亏 3。",
  }),
  s({
    name: "Bear Put Spread",
    cn: "熊市 Put 借记价差",
    category: "方向",
    outlook: "温和看跌",
    difficulty: "Intermediate",
    legs: [option("put", "long", 1, 100), option("put", "short", 1, 90)],
    money:
      "赚的是股价下跌到低执行价附近的方向收益；卖出低执行价 Put 降低成本，同时限制最大盈利。",
    risk:
      "最大亏损是净成本；若股价不跌、反弹或 IV 回落，价差会缩水。",
    when:
      "适合看跌但目标跌幅有限，希望用比 Long Put 更低的成本表达观点。",
    example: "买 100P、卖 90P，花 3。若到期股价 88，最大收益约 7；若高于 100，亏 3。",
  }),
  s({
    name: "Inverse Iron Butterfly",
    cn: "反向铁蝶 / Long Iron Fly",
    category: "波动率",
    outlook: "大波动",
    difficulty: "Intermediate",
    legs: [
      option("put", "short", 1, 90),
      option("put", "long", 1, 100),
      option("call", "long", 1, 100),
      option("call", "short", 1, 110),
    ],
    money:
      "赚的是价格向任一方向突破中心区域，长 Straddle 受益，同时外侧短翼帮助降低成本。",
    risk:
      "如果股价停在中心附近，长 ATM 期权的时间价值会衰减；盈利同样被外侧短翼封顶。",
    when:
      "适合预期事件后会大幅波动，但又想比纯 Long Straddle 更低成本、更有限风险。",
    example: "卖 90P、买 100P、买 100C、卖 110C。到期停在 100 附近亏损最大，向 90 以下或 110 以上移动有利。",
  }),
  s({
    name: "Inverse Iron Condor",
    cn: "反向铁秃鹰 / Long Iron Condor",
    category: "波动率",
    outlook: "大波动",
    difficulty: "Intermediate",
    legs: [
      option("put", "short", 1, 85),
      option("put", "long", 1, 95),
      option("call", "long", 1, 105),
      option("call", "short", 1, 115),
    ],
    money:
      "赚的是价格突破中间区间后的方向位移；用两侧借记价差表达双向大波动。",
    risk:
      "如果标的停在中间区域，两个长腿都可能变成时间价值损耗，最大亏损通常为净成本。",
    when:
      "适合预期会离开当前区间，但不确定方向，并希望风险和收益都被限定。",
    example: "卖 85P、买 95P、买 105C、卖 115C。到期低于 85 或高于 115 较理想，中间横盘不利。",
  }),
  s({
    name: "Short Put Butterfly",
    cn: "卖出 Put 蝶式",
    category: "复杂",
    outlook: "突破 / 非中心",
    difficulty: "Intermediate",
    legs: [option("put", "short", 1, 110), option("put", "long", 2, 100), option("put", "short", 1, 90)],
    money:
      "赚的是价格不要停在中间执行价附近；本质上是做空一个窄目标区间，收取或降低成本。",
    risk:
      "若到期正好接近中间执行价，亏损最大；虽然风险通常有限，但中间区域的亏损集中。",
    when:
      "适合不看好价格停在某个关键位，或想表达突破中心区域的观点。",
    example: "卖 110P、买 2 张 100P、卖 90P。到期接近 100 最差，远离中心时更好。",
  }),
  s({
    name: "Short Call Butterfly",
    cn: "卖出 Call 蝶式",
    category: "复杂",
    outlook: "突破 / 非中心",
    difficulty: "Intermediate",
    legs: [option("call", "short", 1, 90), option("call", "long", 2, 100), option("call", "short", 1, 110)],
    money:
      "赚的是价格远离中间执行价，或开仓时收到的信用随时间保留。",
    risk:
      "到期价格落在中间执行价附近时亏损最大；结构虽有限风险，但对中心价非常敏感。",
    when:
      "适合预期价格不会停在某个中枢，或事件后会离开当前关键价位。",
    example: "卖 90C、买 2 张 100C、卖 110C。到期接近 100 最不利，低于 90 或高于 110 更有利。",
  }),
  s({
    name: "Straddle",
    cn: "买入跨式",
    category: "波动率",
    outlook: "大波动",
    difficulty: "Intermediate",
    legs: [option("call", "long", 1, 100), option("put", "long", 1, 100)],
    money:
      "赚的是任意方向的大幅移动，以及事件前后 IV 上升；买入同执行价 Call 和 Put，方向由市场选择。",
    risk:
      "成本高、Theta 很重；如果事件后股价不动或 IV Crush，两个期权会同时受损。",
    when:
      "适合预期大波动但方向难判，并且预期实际波动超过市场已定价波动。",
    example: "买 100C 和 100P，总成本 8。到期股价高于 108 或低于 92 才开始盈利。",
  }),
  s({
    name: "Strangle",
    cn: "买入宽跨式",
    category: "波动率",
    outlook: "大波动",
    difficulty: "Intermediate",
    legs: [option("put", "long", 1, 90), option("call", "long", 1, 110)],
    money:
      "赚的是突破两侧行权价后的大波动；相比 Straddle 成本较低，但需要更大的移动。",
    risk:
      "如果价格停在两个执行价之间，两个 OTM 期权可能全部归零；Theta 和 IV 回落都不利。",
    when:
      "适合预期极端波动、但想降低买入波动率的成本。",
    example: "买 90P 和 110C。到期必须明显低于 90 或高于 110，再扣除总权利金后才赚钱。",
  }),
  s({
    name: "Collar",
    cn: "领口策略",
    category: "方向",
    outlook: "保护性看涨",
    difficulty: "Intermediate",
    legs: [stock("long"), option("put", "long", 1, 92, 60), option("call", "short", 1, 110, 60)],
    money:
      "赚的是正股在保护区间内的上涨；卖出上方 Call 用来补贴下方 Put 的保险成本。",
    risk:
      "下跌风险被 Put 限制，但上涨收益被 Call 封顶；提前指派和除息也需要关注。",
    when:
      "适合持有股票但想锁定下方风险，并愿意牺牲一部分上行空间。",
    example: "持股 100，买 92P、卖 110C。跌破 92 有保护，涨过 110 大概率被卖出。",
  }),
  s({
    name: "Short Put",
    cn: "裸卖 Put",
    category: "收租",
    outlook: "看涨 / 不看跌",
    difficulty: "Advanced",
    legs: [option("put", "short", 1, 92, 45, 0.34)],
    money:
      "赚的是卖出 Put 的权利金、时间衰减和 IV 回落；股价只要不跌破太多，就可能盈利。",
    risk:
      "下跌风险很大，接近以执行价买入股票后的下行亏损；保证金和指派风险必须提前准备。",
    when:
      "适合高 IV、愿意接货或有严格风控的账户，不适合无法承受大跌的人。",
    example: "卖 92P 收 2。到期高于 92 赚 2；若跌到 70，亏损约 20。",
  }),
  s({
    name: "Short Call",
    cn: "裸卖 Call",
    category: "收租",
    outlook: "看跌 / 不看涨",
    difficulty: "Advanced",
    legs: [option("call", "short", 1, 108, 45, 0.34)],
    money:
      "赚的是卖出 Call 的权利金、时间衰减和 IV 回落；股价不上破执行价时最舒服。",
    risk:
      "理论上上行风险无限；逼空、财报跳空或收购消息都可能让亏损远超权利金。",
    when:
      "只适合高级账户和明确风险预算，通常更建议用 Bear Call Spread 替代裸卖。",
    example: "卖 108C 收 2。到期低于 108 赚 2；若涨到 130，亏损约 20。",
  }),
  s({
    name: "Short Straddle",
    cn: "卖出跨式",
    category: "收租",
    outlook: "强中性",
    difficulty: "Advanced",
    legs: [option("call", "short", 1, 100, 45, 0.34), option("put", "short", 1, 100, 45, 0.34)],
    money:
      "赚的是同执行价 Call 和 Put 的高额权利金、Theta 和 IV 回落；价格越贴近中心越好。",
    risk:
      "两边尾部风险巨大，上涨理论无限、下跌接近股票归零风险；Gamma 风险在临近到期急剧上升。",
    when:
      "适合高 IV、强烈预期横盘并能动态对冲或快速止损的高级交易。",
    example: "卖 100C 和 100P，总收 8。到期在 92-108 间盈利，突破越远亏损越大。",
  }),
  s({
    name: "Short Strangle",
    cn: "卖出宽跨式",
    category: "收租",
    outlook: "区间震荡",
    difficulty: "Advanced",
    legs: [option("put", "short", 1, 90, 45, 0.34), option("call", "short", 1, 110, 45, 0.34)],
    money:
      "赚的是两侧 OTM 期权的权利金和时间衰减；只要价格留在区间内，两个短腿会逐渐缩水。",
    risk:
      "下跌风险很大、上涨风险理论无限；极端行情会把小权利金变成大亏损。",
    when:
      "适合高 IV、预期区间清楚、账户能承受保证金和尾部风险的情形。",
    example: "卖 90P 和 110C，总收 3。到期在 90-110 间赚 3，跌破或涨破后亏损扩大。",
  }),
  s({
    name: "Long Call Condor",
    cn: "买入 Call 秃鹰",
    category: "复杂",
    outlook: "中性区间",
    difficulty: "Advanced",
    legs: [
      option("call", "long", 1, 90),
      option("call", "short", 1, 100),
      option("call", "short", 1, 110),
      option("call", "long", 1, 120),
    ],
    money:
      "赚的是到期价格落在两个中间短 Call 执行价之间，时间衰减让中间区间形成平台收益。",
    risk:
      "最大亏损为净成本；价格跑到最外侧之外时收益消失，交易成本也会显著影响结果。",
    when:
      "适合预期价格留在较宽区间，而不是精准停在单一执行价。",
    example: "买 90C、卖 100C、卖 110C、买 120C。到期在 100-110 间收益最大。",
  }),
  s({
    name: "Long Put Condor",
    cn: "买入 Put 秃鹰",
    category: "复杂",
    outlook: "中性区间",
    difficulty: "Advanced",
    legs: [
      option("put", "long", 1, 120),
      option("put", "short", 1, 110),
      option("put", "short", 1, 100),
      option("put", "long", 1, 90),
    ],
    money:
      "赚的是到期价格落在中间两个 Put 执行价之间，形成有限风险的区间收益。",
    risk:
      "亏损通常限于净借记；若价格低于最低腿或高于最高腿，结构价值会接近消失。",
    when:
      "适合中性震荡观点，尤其是希望用 Put 构造与 Call Condor 相似的 payoff。",
    example: "买 120P、卖 110P、卖 100P、买 90P。到期在 100-110 区间最理想。",
  }),
  s({
    name: "Call Ratio Backspread",
    cn: "Call 反比率价差",
    category: "波动率",
    outlook: "看涨尾部",
    difficulty: "Advanced",
    legs: [option("call", "short", 1, 100), option("call", "long", 2, 110)],
    money:
      "赚的是上行大突破：多买的两张高执行价 Call 会在大涨时压过一张短 Call。",
    risk:
      "最差区域通常在高执行价附近，短 Call 已亏、长 Call 还没完全接力；若以借记开仓还会有成本风险。",
    when:
      "适合预期可能暴涨、IV 不太贵，且愿意承受中等上涨反而不舒服的结构。",
    example: "卖 100C、买 2 张 110C。涨到 110 附近可能最差，涨到 130 以上则多头 Call 开始占优。",
  }),
  s({
    name: "Put Broken Wing",
    cn: "Put 破翼蝶式",
    category: "复杂",
    outlook: "偏多 / 防守",
    difficulty: "Advanced",
    legs: [option("put", "long", 1, 105), option("put", "short", 2, 95), option("put", "long", 1, 80)],
    money:
      "赚的是价格维持在短 Put 附近或上方，同时用不对称翼降低成本，常用于偏多收租或低成本防守。",
    risk:
      "破掉较宽的下侧翼后，尾部亏损会比标准蝶式更大；结构看似便宜但风险偏向一侧。",
    when:
      "适合偏多、不希望股价大跌，并希望把最大风险放在远端下方。",
    example: "买 105P、卖 2 张 95P、买 80P。股价接近 95 有利，跌穿 80 后风险暴露更明显。",
  }),
  s({
    name: "Inverse Call Broken Wing",
    cn: "反向 Call 破翼蝶式",
    category: "复杂",
    outlook: "偏多突破",
    difficulty: "Advanced",
    legs: [option("call", "short", 1, 95), option("call", "long", 2, 105), option("call", "short", 1, 120)],
    money:
      "赚的是价格向上离开低执行价区域，且在中间长 Call 区域形成较好的凸性。",
    risk:
      "价格停在不利区间或超过远端短翼后，收益会被压缩；不对称结构需要特别看最大亏损点。",
    when:
      "适合偏多但不想用简单 Long Call，愿意用复杂腿组合换取更低成本或特定区间收益。",
    example: "卖 95C、买 2 张 105C、卖 120C。向 105-120 区间移动有利，超过远翼后收益变化受限。",
  }),
  s({
    name: "Put Ratio Backspread",
    cn: "Put 反比率价差",
    category: "波动率",
    outlook: "看跌尾部",
    difficulty: "Advanced",
    legs: [option("put", "short", 1, 100), option("put", "long", 2, 90)],
    money:
      "赚的是大跌尾部：两张低执行价 Put 在暴跌中提供凸性，覆盖一张短 Put 的亏损。",
    risk:
      "最差区域通常在低执行价附近；小跌可能比不跌更差，因为短 Put 亏损先出现。",
    when:
      "适合预期可能暴跌但方向未必马上兑现，且希望用信用或低成本拿下行尾部。",
    example: "卖 100P、买 2 张 90P。跌到 90 附近最尴尬，跌到 70 则长 Put 数量优势明显。",
  }),
  s({
    name: "Call Broken Wing",
    cn: "Call 破翼蝶式",
    category: "复杂",
    outlook: "偏空 / 上方防守",
    difficulty: "Advanced",
    legs: [option("call", "long", 1, 95), option("call", "short", 2, 105), option("call", "long", 1, 120)],
    money:
      "赚的是价格停在短 Call 附近或不上破太多，用较宽上翼换取更低成本或信用。",
    risk:
      "若价格大涨穿过较宽翼，亏损会偏向上方尾部；低成本并不等于低风险。",
    when:
      "适合中性偏空或认为上涨空间有限，同时想用不对称结构改善成本。",
    example: "买 95C、卖 2 张 105C、买 120C。股价靠近 105 有利，继续大涨则风险升高。",
  }),
  s({
    name: "Inverse Put Broken Wing",
    cn: "反向 Put 破翼蝶式",
    category: "复杂",
    outlook: "偏空突破",
    difficulty: "Advanced",
    legs: [option("put", "short", 1, 105), option("put", "long", 2, 95), option("put", "short", 1, 80)],
    money:
      "赚的是价格向下离开高执行价区域，长 Put 在中间区间提供下跌凸性。",
    risk:
      "远端短 Put 会限制极端下跌后的收益，并可能带来深度下跌风险；需要看清 payoff 的凹陷区。",
    when:
      "适合偏空但希望用低成本或信用结构捕捉中等下跌。",
    example: "卖 105P、买 2 张 95P、卖 80P。跌向 95-80 区间较好，极端跌穿 80 后收益受限或转差。",
  }),
  s({
    name: "Covered Short Straddle",
    cn: "持股卖跨式",
    category: "收租",
    outlook: "偏多收租",
    difficulty: "Advanced",
    legs: [stock("long"), option("call", "short", 1, 100, 45, 0.34), option("put", "short", 1, 100, 45, 0.34)],
    money:
      "赚的是持股收益加上卖出 ATM Call 和 Put 的高权利金；横盘或小涨时权利金贡献很大。",
    risk:
      "下跌时既有持股亏损又可能被短 Put 加仓；上涨时股票可能被 Call 叫走，收益上限受限。",
    when:
      "适合非常愿意持有并加仓该股票、且认为短期不会大幅波动的高级投资者。",
    example: "持股 100，卖 100C 和 100P。横盘赚租；跌破 100 可能继续买入，涨过 100 可能卖出原股。",
  }),
  s({
    name: "Covered Short Strangle",
    cn: "持股卖宽跨式",
    category: "收租",
    outlook: "偏多区间收租",
    difficulty: "Advanced",
    legs: [stock("long"), option("put", "short", 1, 90, 45, 0.34), option("call", "short", 1, 110, 45, 0.34)],
    money:
      "赚的是持股上涨、短 Put/Call 权利金和时间衰减；价格在宽区间内最舒服。",
    risk:
      "大跌时会同时承受持股亏损和短 Put 指派；大涨时收益被短 Call 限制。",
    when:
      "适合愿意低位加仓、高位减仓，并且把股票当成长期仓位管理的人。",
    example: "持股 100，卖 90P 和 110C。90-110 区间内收租，跌破 90 可能加仓，涨过 110 可能卖股。",
  }),
  s({
    name: "Short Call Condor",
    cn: "卖出 Call 秃鹰",
    category: "波动率",
    outlook: "非中性 / 大移动",
    difficulty: "Advanced",
    legs: [
      option("call", "short", 1, 90),
      option("call", "long", 1, 100),
      option("call", "long", 1, 110),
      option("call", "short", 1, 120),
    ],
    money:
      "赚的是价格离开中间区间，或者开仓信用在极端区域保留；它是 Long Call Condor 的反向。",
    risk:
      "价格落在中间两个执行价之间会形成最大亏损；虽然风险有限，但亏损区间较宽。",
    when:
      "适合预期会发生明显移动，但不确定方向，且想用有限风险表达。",
    example: "卖 90C、买 100C、买 110C、卖 120C。到期在 100-110 最差，远离该区间更好。",
  }),
  s({
    name: "Short Put Condor",
    cn: "卖出 Put 秃鹰",
    category: "波动率",
    outlook: "非中性 / 大移动",
    difficulty: "Advanced",
    legs: [
      option("put", "short", 1, 120),
      option("put", "long", 1, 110),
      option("put", "long", 1, 100),
      option("put", "short", 1, 90),
    ],
    money:
      "赚的是价格不要停在中间区间；通过反向 Put Condor 表达突破或区间外停留。",
    risk:
      "中间区间亏损最大，且多腿结构对成交价和手续费敏感。",
    when:
      "适合预期大移动但希望风险封顶，并能接受收益也封顶。",
    example: "卖 120P、买 110P、买 100P、卖 90P。到期在 100-110 最差，外侧更有利。",
  }),
  s({
    name: "Bull Call Ladder",
    cn: "牛市 Call 梯式",
    category: "复杂",
    outlook: "温和看涨",
    difficulty: "Advanced",
    legs: [option("call", "long", 1, 100), option("call", "short", 1, 110), option("call", "short", 1, 120)],
    money:
      "赚的是温和上涨到中高执行价附近，同时通过卖出两个上方 Call 降低成本甚至收信用。",
    risk:
      "如果股价暴涨，额外裸卖 Call 会带来无限上行风险；这不是普通牛市价差。",
    when:
      "适合只看温和上涨、认为大涨概率低，且能处理上方短 Call 风险。",
    example: "买 100C、卖 110C、卖 120C。涨到 110-120 较好，远超 120 后风险变大。",
  }),
  s({
    name: "Bear Call Ladder",
    cn: "熊市 Call 梯式",
    category: "复杂",
    outlook: "看跌但怕反弹",
    difficulty: "Advanced",
    legs: [option("call", "short", 1, 100), option("call", "long", 1, 110), option("call", "long", 1, 120)],
    money:
      "赚的是股价不上涨时短 Call 权利金，也保留上方大涨时两张长 Call 的反向凸性。",
    risk:
      "中等上涨到长 Call 尚未完全覆盖短 Call 的区域可能最难受；结构路径依赖较强。",
    when:
      "适合看跌或中性，但担心突然大涨，想用上方长 Call 做尾部保护。",
    example: "卖 100C、买 110C、买 120C。不上涨赚租；中等上涨受压；极端上涨由长 Call 接力。",
  }),
  s({
    name: "Bull Put Ladder",
    cn: "牛市 Put 梯式",
    category: "复杂",
    outlook: "看涨但怕暴跌",
    difficulty: "Advanced",
    legs: [option("put", "short", 1, 100), option("put", "long", 1, 90), option("put", "long", 1, 80)],
    money:
      "赚的是股价不跌时短 Put 权利金，同时用两张更低执行价 Put 保留暴跌保护或下行凸性。",
    risk:
      "中等下跌区域可能最差，因为短 Put 先亏而长 Put 还不够深；成交价格决定结构质量。",
    when:
      "适合温和看涨但担心尾部暴跌，希望收租同时买远端保护。",
    example: "卖 100P、买 90P、买 80P。股价不跌收租；若暴跌到 70，低执行价 Put 会提供保护。",
  }),
  s({
    name: "Bear Put Ladder",
    cn: "熊市 Put 梯式",
    category: "复杂",
    outlook: "温和看跌",
    difficulty: "Advanced",
    legs: [option("put", "long", 1, 100), option("put", "short", 1, 90), option("put", "short", 1, 80)],
    money:
      "赚的是温和下跌到较低执行价附近；卖出额外低执行价 Put 降低成本或形成信用。",
    risk:
      "如果标的暴跌，额外短 Put 会让下方风险重新打开，亏损可能很大。",
    when:
      "适合看跌但认为跌幅有限，且愿意承担极端下跌后的短 Put 风险。",
    example: "买 100P、卖 90P、卖 80P。跌到 90-80 区间较好，跌穿 80 太深后风险扩大。",
  }),
  s({
    name: "Jade Lizard",
    cn: "玉蜥蜴",
    category: "收租",
    outlook: "中性偏多",
    difficulty: "Advanced",
    legs: [option("put", "short", 1, 90, 45, 0.34), option("call", "short", 1, 105, 45, 0.34), option("call", "long", 1, 110, 45, 0.34)],
    money:
      "赚的是短 Put 和短 Call Spread 的总权利金；如果收到的信用大于 Call Spread 宽度，理论上消除上方亏损。",
    risk:
      "主要风险在下方短 Put；股价大跌会产生类似裸卖 Put 的亏损和指派风险。",
    when:
      "适合中性偏多、高 IV，并且最担心下跌而不是上涨的收租结构。",
    example: "卖 90P，同时卖 105C/买 110C。上方被 Call Spread 限定，下方短 Put 是主要风险。",
  }),
  s({
    name: "Reverse Jade Lizard",
    cn: "反向玉蜥蜴",
    category: "收租",
    outlook: "中性偏空",
    difficulty: "Advanced",
    legs: [option("call", "short", 1, 110, 45, 0.34), option("put", "short", 1, 95, 45, 0.34), option("put", "long", 1, 90, 45, 0.34)],
    money:
      "赚的是短 Call 和短 Put Spread 的权利金；结构把下方风险限定，把主要尾部风险留在上方短 Call。",
    risk:
      "主要风险是股价大涨导致裸短 Call 承压；下方由 Put Spread 限定。",
    when:
      "适合中性偏空、高 IV，并且更愿意承担上方而非下方尾部风险。",
    example: "卖 110C，同时卖 95P/买 90P。下跌风险被限定，上涨突破 110 后风险扩大。",
  }),
  s({
    name: "Call Ratio Spread",
    cn: "Call 比率价差",
    category: "复杂",
    outlook: "温和看涨",
    difficulty: "Expert",
    legs: [option("call", "long", 1, 100), option("call", "short", 2, 110)],
    money:
      "赚的是温和上涨到短 Call 执行价附近；额外卖出 Call 降低成本甚至收信用。",
    risk:
      "股价大涨后，额外短 Call 会造成无限上行风险；最大盈利区通常很窄。",
    when:
      "适合认为会小涨但不会暴涨，并能严格处理上方突破风险。",
    example: "买 100C、卖 2 张 110C。到期在 110 附近最好，远高于 110 后风险迅速变大。",
  }),
  s({
    name: "Put Ratio Spread",
    cn: "Put 比率价差",
    category: "复杂",
    outlook: "温和看跌",
    difficulty: "Expert",
    legs: [option("put", "long", 1, 100), option("put", "short", 2, 90)],
    money:
      "赚的是温和下跌到短 Put 执行价附近；额外卖 Put 降低成本或收信用。",
    risk:
      "股价暴跌后，额外短 Put 会带来巨大下行风险；跌得太多反而转差。",
    when:
      "适合看温和下跌但不认为会崩盘，并能承受/管理短 Put 风险。",
    example: "买 100P、卖 2 张 90P。到期在 90 附近较好，跌到 70 则短 Put 风险暴露。",
  }),
  s({
    name: "Long Synthetic Future",
    cn: "合成多头",
    category: "合成",
    outlook: "看涨",
    difficulty: "Expert",
    legs: [option("call", "long", 1, 100), option("put", "short", 1, 100)],
    money:
      "赚的是复制近似正股多头的线性上涨收益；买 Call 加卖 Put 形成接近 +1 Delta。",
    risk:
      "下跌风险接近持有正股，且短 Put 有保证金和指派风险；并不是有限风险结构。",
    when:
      "适合理解 Put-Call parity，或在资金效率、融券限制、合约市场中复制多头。",
    example: "买 100C、卖 100P。股价从 100 涨到 120 约赚 20，跌到 80 约亏 20。",
  }),
  s({
    name: "Short Synthetic Future",
    cn: "合成空头",
    category: "合成",
    outlook: "看跌",
    difficulty: "Expert",
    legs: [option("call", "short", 1, 100), option("put", "long", 1, 100)],
    money:
      "赚的是复制近似正股空头的线性下跌收益；卖 Call 加买 Put 形成接近 -1 Delta。",
    risk:
      "上行风险理论无限，短 Call 也有保证金和指派风险。",
    when:
      "适合想用期权复制做空，或学习合成关系与风险暴露的人。",
    example: "卖 100C、买 100P。股价跌到 80 约赚 20，涨到 120 约亏 20。",
  }),
  s({
    name: "Synthetic Put",
    cn: "合成 Put",
    category: "合成",
    outlook: "看跌保护",
    difficulty: "Expert",
    legs: [stock("short"), option("call", "long", 1, 100)],
    money:
      "赚的是用卖空股票加买 Call 复制 Long Put 的下行收益，同时用 Call 限制上行风险。",
    risk:
      "需要能卖空股票；借券成本、分红和强平规则会影响结果。",
    when:
      "适合学习合成期权，或在 Put 定价异常时比较替代结构。",
    example: "卖空股票 100，同时买 100C。股价下跌盈利，上涨风险由 Call 对冲。",
  }),
  s({
    name: "Long Combo",
    cn: "多头组合 / 风险反转别名",
    category: "合成",
    outlook: "看涨",
    difficulty: "Expert",
    legs: [option("call", "long", 1, 105), option("put", "short", 1, 95)],
    money:
      "赚的是上涨时 Long Call 的上行收益，并用卖 Put 的权利金补贴 Call 成本。",
    risk:
      "下跌时短 Put 会带来接货或大亏风险；结构比单买 Call 更像带下方义务的多头。",
    when:
      "适合强看涨且愿意在下方买入标的，常用于低成本看涨表达。",
    example: "买 105C、卖 95P。涨破 105 后受益，跌破 95 后承担买入义务。",
  }),
  s({
    name: "Short Combo",
    cn: "空头组合",
    category: "合成",
    outlook: "看跌",
    difficulty: "Expert",
    legs: [option("call", "short", 1, 105), option("put", "long", 1, 95)],
    money:
      "赚的是下跌时 Long Put 的收益，并用卖 Call 的权利金补贴成本。",
    risk:
      "上涨时短 Call 可能带来无限风险；不是简单的有限风险看跌结构。",
    when:
      "适合强看跌且能管理上方风险，或用于构造近似合成空头。",
    example: "卖 105C、买 95P。跌破 95 后受益，涨破 105 后短 Call 承压。",
  }),
  s({
    name: "Strip",
    cn: "偏空跨式",
    category: "波动率",
    outlook: "偏空大波动",
    difficulty: "Expert",
    legs: [option("put", "long", 2, 100), option("call", "long", 1, 100)],
    money:
      "赚的是大波动，且下跌方向权重更大；两张 Put 让下行收益斜率高于上行。",
    risk:
      "权利金成本更高；如果价格横盘或 IV 回落，三张长权利金都会衰减。",
    when:
      "适合预期大波动但认为下跌概率或幅度更大。",
    example: "买 2 张 100P 和 1 张 100C。大跌比大涨赚得更多，横盘亏总权利金。",
  }),
  s({
    name: "Strap",
    cn: "偏多跨式",
    category: "波动率",
    outlook: "偏多大波动",
    difficulty: "Expert",
    legs: [option("call", "long", 2, 100), option("put", "long", 1, 100)],
    money:
      "赚的是大波动，且上涨方向权重更大；两张 Call 让上行收益斜率高于下行。",
    risk:
      "成本高、Theta 重；价格不动或 IV Crush 会让组合快速失血。",
    when:
      "适合预期大波动但认为上涨概率或幅度更大。",
    example: "买 2 张 100C 和 1 张 100P。大涨比大跌赚得更多，横盘亏总权利金。",
  }),
  s({
    name: "Guts",
    cn: "买入内跨式",
    category: "波动率",
    outlook: "大波动",
    difficulty: "Expert",
    legs: [option("call", "long", 1, 95), option("put", "long", 1, 105)],
    money:
      "赚的是大波动；买入 ITM Call 和 ITM Put，初始成本高但中间也有内在价值。",
    risk:
      "成本很高，横盘时亏损来自时间价值和 IV 回落；需要更认真比较隐含波动定价。",
    when:
      "适合想用 ITM 期权构造双向波动敞口，或市场深度让 ITM 定价更合适时。",
    example: "买 95C 和 105P。价格大幅离开中间区域才有明显收益，横盘会亏时间价值。",
  }),
  s({
    name: "Short Guts",
    cn: "卖出内跨式",
    category: "收租",
    outlook: "中性",
    difficulty: "Expert",
    legs: [option("call", "short", 1, 95, 45, 0.34), option("put", "short", 1, 105, 45, 0.34)],
    money:
      "赚的是卖出 ITM Call 和 ITM Put 的高权利金与时间价值；希望价格留在中间并且 IV 回落。",
    risk:
      "两侧尾部风险巨大，且 ITM 期权提前行权概率更高；保证金压力通常很大。",
    when:
      "只适合非常熟悉指派、保证金和动态对冲的高级交易。",
    example: "卖 95C 和 105P。横盘或轻微波动可能保留权利金，单边大动会快速亏损。",
  }),
  s({
    name: "Double Diagonal",
    cn: "双斜跨价差",
    category: "跨期",
    outlook: "中性区间",
    difficulty: "Expert",
    legs: [
      option("put", "short", 1, 90, 30, 0.34),
      option("put", "long", 1, 85, 60, 0.3),
      option("call", "short", 1, 110, 30, 0.34),
      option("call", "long", 1, 115, 60, 0.3),
    ],
    money:
      "赚的是近月两侧短腿衰减，同时远月翼保留保护和 Vega；类似跨期版 Iron Condor。",
    risk:
      "价格快速突破任一短腿会让近月受压；近远月 IV 关系变化会显著影响净值。",
    when:
      "适合短期区间震荡、远月仍希望保留保护或事件后继续滚动的情形。",
    example: "近月卖 90P/110C，远月买 85P/115C。近月到期时股价仍在 90-110 内较理想。",
  }),
  s({
    name: "Vega 套利",
    cn: "波动率期限结构向导",
    category: "向导",
    outlook: "交易 IV",
    difficulty: "Framework",
    legs: [
      option("put", "short", 1, 90, 30, 0.36),
      option("put", "long", 1, 85, 60, 0.3),
      option("call", "short", 1, 110, 30, 0.36),
      option("call", "long", 1, 115, 60, 0.3),
    ],
    money:
      "赚的是近月高 IV 回落、事件后 IV Crush、或期限结构收敛；可用 Calendar、Double Diagonal、Iron Condor 等表达。",
    risk:
      "IV 不按预期变化、标的价格穿越短腿、或远月 Vega 被错误定价都会让结构亏损。",
    when:
      "适合研究财报、宏观事件、期限结构倒挂和短期 IV 明显高估的场景。",
    example: "财报前近月 IV 很高，可卖近月、买远月做 Calendar；财报后近月 IV 回落即可能盈利。",
    manage:
      "重点跟踪近远月 IV 差、事件日期和短腿 Delta；事件结束后不要把 Vega 交易误拿成方向交易。",
  }),
  s({
    name: "Delta Neutral（Delta 中性）",
    cn: "Delta 中性向导",
    category: "向导",
    outlook: "风险控制",
    difficulty: "Framework",
    legs: [
      option("put", "long", 1, 85, 45, 0.32),
      option("put", "short", 1, 90, 45, 0.32),
      option("call", "short", 1, 110, 45, 0.32),
      option("call", "long", 1, 115, 45, 0.32),
    ],
    money:
      "赚的不是方向本身，而是把净 Delta 控制在接近 0 后，专注交易 Theta、Vega 或 Gamma。",
    risk:
      "Delta 会随价格和时间变化漂移；如果不再平衡，所谓中性会变成隐形方向仓位。",
    when:
      "适合方向难判但想交易波动率、时间价值，或需要控制组合方向暴露的时候。",
    example: "Iron Condor 初始 Delta 接近 0。若股价上涨使组合 Delta 变负，可通过调腿或股票对冲重新中性。",
    manage:
      "定期看组合净 Delta、Gamma 和短腿距离；中性策略的核心不是一次开仓，而是持续再平衡。",
  }),
  s({
    name: "Covered Put",
    cn: "备兑 Put",
    source: "补充",
    category: "股票覆盖",
    outlook: "中性偏空",
    difficulty: "Advanced",
    legs: [stock("short"), option("put", "short", 1, 95, 45, 0.34)],
    money:
      "赚的是卖空股票下跌收益和卖出 Put 的权利金；若股价稳定或小跌，Put 衰减也贡献收益。",
    risk:
      "上行风险理论无限，因为卖空股票会随股价上涨亏损；短 Put 还会在下跌时限制部分继续获利。",
    when:
      "适合已建立空头股票仓位、认为短期不会大幅下跌但想收取权利金的高级交易者。",
    example: "卖空股票 100，同时卖 95P。股价跌到 96，空头和权利金都较有利；若涨到 125，空头亏损很大。",
  }),
  s({
    name: "Stock Repair / Covered Ratio Spread",
    cn: "股票修复 / 备兑比率价差",
    source: "补充",
    category: "股票覆盖",
    outlook: "修复持股",
    difficulty: "Advanced",
    legs: [stock("long"), option("call", "short", 2, 105), option("call", "long", 1, 115)],
    money:
      "赚的是持股小幅反弹到短 Call 附近，同时用卖出两张 Call 的权利金降低持仓回本价。",
    risk:
      "大涨时额外短 Call 可能限制甚至伤害收益；大跌时仍有持股亏损，只是权利金略微缓冲。",
    when:
      "适合股票被套后希望在温和反弹中更快修复成本，但愿意牺牲大涨空间。",
    example: "持股成本 120、现价 100，卖 2 张 105C、买 115C。若反弹到 105 附近，修复效果最好。",
  }),
  s({
    name: "Double Bull Spread",
    cn: "双牛市价差",
    source: "补充",
    category: "复杂",
    outlook: "看涨",
    difficulty: "Advanced",
    legs: [
      option("call", "long", 1, 100),
      option("call", "short", 1, 110),
      option("put", "short", 1, 95),
      option("put", "long", 1, 90),
    ],
    money:
      "赚的是牛市 Call 借记价差的上涨收益，加上牛市 Put 信用价差的收租收益。",
    risk:
      "方向错了会同时伤到 Call 借记和 Put 信用；下跌穿过 Put 价差时亏损会快速接近上限。",
    when:
      "适合较强看涨但希望一部分成本由 Put 信用价差补贴的结构化表达。",
    example: "买 100C/卖 110C，同时卖 95P/买 90P。上涨有利，跌破 95 后 Put 价差开始亏损。",
  }),
  s({
    name: "Double Bear Spread",
    cn: "双熊市价差",
    source: "补充",
    category: "复杂",
    outlook: "看跌",
    difficulty: "Advanced",
    legs: [
      option("put", "long", 1, 100),
      option("put", "short", 1, 90),
      option("call", "short", 1, 105),
      option("call", "long", 1, 110),
    ],
    money:
      "赚的是熊市 Put 借记价差的下跌收益，加上熊市 Call 信用价差的收租收益。",
    risk:
      "如果股价上涨，Put 借记亏成本，Call 信用价差也会受压；亏损可能来自两边叠加。",
    when:
      "适合较强看跌、上方压力明确，并希望用 Call 信用价差补贴 Put 成本。",
    example: "买 100P/卖 90P，同时卖 105C/买 110C。下跌有利，突破 105 后 Call 价差亏损。",
  }),
  s({
    name: "Box Spread",
    cn: "盒式价差",
    source: "补充",
    category: "合成",
    outlook: "融资 / 利率",
    difficulty: "Expert",
    legs: [
      option("call", "long", 1, 95),
      option("call", "short", 1, 105),
      option("put", "long", 1, 105),
      option("put", "short", 1, 95),
    ],
    money:
      "赚的不是方向，而是用期权合成固定到期现金流；价格低于理论现值时类似放贷，高于理论值时类似借款。",
    risk:
      "理论 payoff 固定，但实际风险在成交价、提前行权、美式期权、手续费、保证金和利率变化。",
    when:
      "适合专业账户比较期权隐含融资利率，通常更适合欧式指数期权而非容易提前行权的美式股票期权。",
    example: "95/105 Box 到期理论支付 10。若能以 9.70 买入，到期收 10 的差额近似利息收益。",
    manage:
      "只在理解行权制度、资金占用和提前指派后使用；普通学习中把它当作 Put-Call parity 的现金流示例。",
  }),
  s({
    name: "Short Call Calendar Spread",
    cn: "卖出 Call 日历价差",
    source: "补充",
    category: "跨期",
    outlook: "突破 / 远月 IV 下行",
    difficulty: "Expert",
    legs: [option("call", "long", 1, 100, 30, 0.32), option("call", "short", 1, 100, 60, 0.3)],
    money:
      "赚的是价格远离执行价，或远月 IV 相对下跌；它是常见 Long Calendar 的反向结构。",
    risk:
      "远月短 Call 暴露更长时间风险，价格回到执行价附近或远月 IV 上升都不利。",
    when:
      "适合认为标的会快速离开当前价格，或认为远月波动率偏高需要回落。",
    example: "买 30 天 100C、卖 60 天 100C。若短期大涨或大跌离开 100，结构可能改善；若停在 100，远月短腿很危险。",
  }),
  s({
    name: "Short Put Calendar Spread",
    cn: "卖出 Put 日历价差",
    source: "补充",
    category: "跨期",
    outlook: "突破 / 远月 IV 下行",
    difficulty: "Expert",
    legs: [option("put", "long", 1, 100, 30, 0.32), option("put", "short", 1, 100, 60, 0.3)],
    money:
      "赚的是价格快速远离执行价，或远月 Put 波动率下行；方向不是核心，期限结构是核心。",
    risk:
      "远月短 Put 会在下跌中带来更长尾部风险；价格贴近执行价且远月 IV 上升时亏损明显。",
    when:
      "适合专业交易者表达反日历观点，普通账户通常更容易用定义风险结构替代。",
    example: "买 30 天 100P、卖 60 天 100P。短期离开 100 有利，长期停在 100 附近不利。",
  }),
  s({
    name: "Risk Reversal",
    cn: "风险反转",
    source: "补充",
    category: "合成",
    outlook: "方向 + 偏斜",
    difficulty: "Advanced",
    legs: [option("call", "long", 1, 105), option("put", "short", 1, 95)],
    money:
      "看涨风险反转赚的是上方 Call 突破收益，同时用卖 Put 的权利金降低或抵消成本；也可反向做看跌。",
    risk:
      "下跌时短 Put 会带来接货和大亏风险；本质上用承担一侧尾部风险换另一侧方向敞口。",
    when:
      "适合强方向观点、愿意在不利方向承担义务，并想利用波动率偏斜降低成本。",
    example: "买 105C、卖 95P。若涨到 125，Call 盈利；若跌到 80，短 Put 产生明显亏损。",
  }),
  s({
    name: "Wheel Strategy",
    cn: "轮动收租策略",
    source: "补充",
    category: "向导",
    outlook: "长期偏多收租",
    difficulty: "Intermediate",
    legs: [option("put", "short", 1, 95, 45, 0.34)],
    money:
      "赚的是循环卖现金担保 Put 和备兑 Call 的权利金；被指派后持股，再卖 Call 收租。",
    risk:
      "核心风险不是期权腿复杂，而是标的长期下跌导致接货后越套越深；上涨太快也会被 Call 叫走。",
    when:
      "适合愿意长期持有某只股票、能接受分批接货和卖出，并且不追求吃完整个单边上涨的人。",
    example: "先卖 95P 收租；若跌破 95 被指派持股，再卖 105C；若涨过 105 股票被卖出，回到卖 Put 阶段。",
    manage:
      "标的选择比结构更重要；每次卖 Put 前都要问自己是否真的愿意按执行价持有股票。",
  }),
  s({
    name: "Seagull / Fence",
    cn: "海鸥 / 围栏保护",
    source: "补充",
    category: "股票覆盖",
    outlook: "低成本保护",
    difficulty: "Advanced",
    legs: [stock("long"), option("put", "long", 1, 95), option("put", "short", 1, 85), option("call", "short", 1, 110)],
    money:
      "赚的是正股在保护区间内的上涨；卖出低执行价 Put 和上方 Call 用来补贴保护性 Put。",
    risk:
      "上涨被 Call 封顶；极端下跌穿过低执行价短 Put 后，保护不再完整，尾部风险重新打开。",
    when:
      "适合想降低保险成本、愿意接受上方封顶和极端下方部分自留风险的持股者。",
    example: "持股 100，买 95P、卖 85P、卖 110C。85-95 有保护，低于 85 后继续承担下行。",
  }),
  s({
    name: "Poor Man's Covered Call",
    cn: "穷人备兑 Call",
    source: "补充",
    category: "跨期",
    outlook: "温和看涨收租",
    difficulty: "Intermediate",
    legs: [option("call", "long", 1, 80, 365, 0.28), option("call", "short", 1, 110, 30, 0.34)],
    money:
      "赚的是深度 ITM 远月 Call 的类股票 Delta，以及反复卖近月 OTM Call 的权利金。",
    risk:
      "远月 Call 仍会随股价下跌而亏损；短 Call 被突破时要滚动，否则上行收益被限制。",
    when:
      "适合想用更少资金替代持股做备兑 Call，但理解 LEAPS、Delta 和滚动管理的人。",
    example: "买一年期 80C，卖 30 天 110C。股价缓慢上涨并不过快突破短 Call 时较理想。",
  }),
];
