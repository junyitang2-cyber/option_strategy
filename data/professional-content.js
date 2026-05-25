// Professional Trading Content for Core Strategies
// Trader Memo: Exposure, P&L Logic, Client Perspective, Dealer Hedging

const PROFESSIONAL_CONTENT = {
  // Long Call - 买入看涨期权
  "long-call": {
    exposure: {
      directional: "+Delta (看涨方向暴露)",
      volatility: "+Vega (做多波动率)",
      time: "-Theta (时间衰减是敌人)",
      convexity: "+Gamma (正凸性，价格上涨加速盈利)"
    },

    profitLogic: {
      makesMoneyFrom: "标的上涨带来的Delta收益 + IV上升带来的Vega收益",
      losesMoneyFrom: "时间流逝(Theta) + IV下跌 + 标的不涨或下跌",
      bestMarketCondition: "低IV环境买入，预期标的会快速上涨且IV可能上升",
      worstScenario: "横盘不动，Theta持续侵蚀，IV回落"
    },

    clientPerspective: {
      whyClientDoes: [
        "看涨但不想承担买入股票的全部资金成本",
        "用有限亏损(权利金)换取上行杠杆",
        "事件驱动(财报、产品发布)预期上涨",
        "对冲现有空头仓位"
      ],
      clientType: "散户投机、机构方向性表达、对冲基金事件驱动",
      suitability: "理解期权、能承受全部权利金损失、有明确上涨预期"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer卖出Long Call给客户后，面临：",
      exposure: "-Delta (短Delta，标的上涨亏损), -Gamma (需要追涨对冲), -Vega (IV上升亏损), +Theta (时间流逝盈利)",
      hedging: [
        "Delta对冲：买入Delta数量的股票(如ATM call delta=0.5，买50股/张)",
        "Gamma管理：股价上涨时Delta增加，需要继续买股票；下跌时卖股票",
        "Vega对冲：如果不想承担IV风险，买入其他期权对冲Vega",
        "动态再平衡：Gamma越大，再平衡频率越高，成本越高"
      ],
      profitSource: "Bid-ask价差 + 客户付出的IV溢价(如果realized vol < implied vol)"
    },

    interviewQuestions: [
      {
        q: "Long Call的最大风险是什么？",
        a: "最大亏损是支付的权利金。但真正的风险是机会成本：如果标的横盘，Theta每天侵蚀价值，即使方向判断对但速度不够快，仍然亏损。"
      },
      {
        q: "为什么ATM call的Gamma最高？",
        a: "ATM期权处于最大不确定性：小幅价格变动就能让它从OTM变ITM或反之。这意味着Delta变化最快，即Gamma最高。远离ATM后，期权要么明显会到期ITM(Delta接近1)，要么明显会归零(Delta接近0)，不确定性降低，Gamma下降。"
      },
      {
        q: "Dealer卖出ATM call后如何对冲？",
        a: "初始：买入约50股(delta=0.5)。股价上涨：delta增加到0.6，再买10股。股价继续涨：delta到0.7，再买10股。这就是Gamma对冲 - 被迫'追涨杀跌'。对于short gamma position，如果realized vol高，这个动态对冲过程会亏损(高买低卖)；Dealer赚的是客户支付的implied vol溢价(bid-ask + IV > realized vol)。"
      },
      {
        q: "什么时候Long Call比买股票更好？",
        a: "1) 资金有限但想要杠杆；2) 有明确催化剂(财报)且时间窗口短；3) 想要有限亏损而非股票的无限下行风险；4) 预期IV会上升(事件前)。但如果是长期看涨，买股票通常更好，因为没有Theta损耗。"
      },
      {
        q: "如何选择strike和DTE？",
        a: "Strike: ATM或略ITM提高胜率但更贵；OTM便宜但需要更大涨幅。DTE: 太短Theta太重，太长权利金太贵。通常30-60天平衡Theta和成本。如果是事件驱动，DTE要覆盖事件日期。"
      }
    ]
  },

  // Iron Condor - 铁秃鹰
  "iron-condor": {
    exposure: {
      directional: "~0 Delta (接近中性，轻微偏向)",
      volatility: "-Vega (做空波动率，IV下跌盈利)",
      time: "+Theta (时间流逝是朋友，每天收租)",
      convexity: "-Gamma (负凸性，价格大幅波动不利)"
    },

    profitLogic: {
      makesMoneyFrom: "时间衰减(Theta) + IV下跌(Vega) + 价格停在两个短腿之间",
      losesMoneyFrom: "价格突破任一短腿 + IV上升 + 大幅波动",
      bestMarketCondition: "高IV环境开仓，随后IV回落，价格区间震荡",
      worstScenario: "突发事件导致价格跳空突破短腿，IV同时飙升"
    },

    clientPerspective: {
      whyClientDoes: [
        "预期标的在区间内震荡，赚取时间价值",
        "高IV环境下收租策略",
        "不想承担单边方向风险",
        "定期收入策略(每月卖Iron Condor)"
      ],
      clientType: "收入型投资者、中性策略交易员、高级散户",
      suitability: "能监控仓位、理解最大亏损、有足够保证金、接受assignment风险"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer卖Iron Condor给客户，实际上是从客户手中买入(客户卖给市场)：",
      exposure: "+Vega (客户短Vega，Dealer长Vega), -Theta (客户收Theta，Dealer付Theta), +Gamma (客户短Gamma，Dealer长Gamma)",
      hedging: [
        "Dealer实际上是买入了客户的Iron Condor，所以Dealer是Long Vega + Long Gamma",
        "如果Dealer不想要这个exposure，需要卖出其他期权来对冲",
        "通常Dealer会aggreg多个客户的订单，net exposure可能很小",
        "如果net short Vega，Dealer会买入Straddle或其他Long Vega结构对冲"
      ],
      profitSource: "Bid-ask价差(每条腿0.05-0.10) × 4条腿 = 显著利润"
    },

    interviewQuestions: [
      {
        q: "Iron Condor的最大风险在哪里？",
        a: "最大亏损是价差宽度减去收到的credit。但真正风险是：1) 突破后的Gamma风险(Delta快速变化)；2) Assignment风险(短腿ITM可能被提前行权)；3) 流动性风险(需要平仓时价差可能很宽)；4) 黑天鹅事件(跳空gap直接穿过短腿)。"
      },
      {
        q: "为什么Iron Condor在高IV时更好？",
        a: "高IV时期权更贵，收到的credit更多。更重要的是，高IV往往会mean revert(回归均值) - IV Crush对short Vega有利。但要注意：高IV通常有原因(事件、不确定性)，如果IV继续上升或实现波动率很高，Iron Condor会亏损。"
      },
      {
        q: "如何管理Iron Condor？何时调整？",
        a: "1) 获利了结：收回50-70% max profit时平仓；2) 止损：亏损达到2x credit或短腿被突破时；3) 滚动：价格接近短腿时，可以roll短腿到更远strike或更远DTE；4) 不要贪最后一点credit - 到期前一周Gamma风险很高。"
      },
      {
        q: "Iron Condor vs Short Strangle有什么区别？",
        a: "Iron Condor有Long wings保护，最大亏损有限，保证金需求更低。Short Strangle理论上unlimited risk(call side)，保证金需求高得多，但收到的credit更多。Iron Condor适合defined-risk账户，Short Strangle只适合能承受大亏损的专业账户。"
      },
      {
        q: "如何选择wing width(翼宽)？",
        a: "窄翼(5-wide)：收到的credit更多，但最大亏损也更大，盈亏比差。宽翼(10-15 wide)：credit少，但最大亏损相对小，盈亏比好。通常10-wide是平衡点。还要考虑：账户大小(不要让单个trade风险超过2%)、标的流动性、保证金占用。"
      }
    ]
  },

  // Covered Call - 备兑看涨
  "covered-call": {
    exposure: {
      directional: "+Delta (持有股票，看涨暴露，但被short call限制)",
      volatility: "-Vega (short call是短波动率)",
      time: "+Theta (short call收取时间价值)",
      convexity: "-Gamma (short call是负凸性)"
    },

    profitLogic: {
      makesMoneyFrom: "股票上涨(到short call strike为止) + 收取call权利金 + 股息(如果有)",
      losesMoneyFrom: "股票下跌(权利金只能部分缓冲) + 大涨时收益被cap",
      bestMarketCondition: "温和上涨或横盘，IV偏高时卖call",
      worstScenario: "股票大跌(仍承担大部分下行风险) 或 暴涨(错过上涨收益)"
    },

    clientPerspective: {
      whyClientDoes: [
        "已持有股票，想增加收入",
        "愿意在目标价卖出股票",
        "认为短期上涨空间有限",
        "降低持股成本(用权利金抵消部分成本)"
      ],
      clientType: "长期投资者、收入型投资者、Wheel策略执行者",
      suitability: "已持有或愿意持有标的股票、接受上涨被cap、理解assignment"
    },

    dealerPerspective: {
      whenDealerSells: "客户卖Covered Call，Dealer买入该call：",
      exposure: "+Delta (long call), +Gamma, +Vega, -Theta",
      hedging: [
        "Dealer买入客户的call后，需要hedge long delta",
        "最简单：short股票来hedge delta",
        "或者：卖出其他call来对冲",
        "Dealer的profit来自bid-ask spread和aggregating多个客户订单"
      ],
      profitSource: "Bid-ask价差 + order flow信息(知道客户在卖covered call，可能意味着股票短期不会大涨)"
    },

    interviewQuestions: [
      {
        q: "Covered Call的真实风险是什么？",
        a: "最大风险不是'上涨被cap'，而是股票大跌。权利金只能缓冲很小一部分下跌(通常2-5%)。如果股票跌20%，covered call仍然亏15-18%。很多人误以为covered call是'低风险'，实际上它仍然是股票风险。"
      },
      {
        q: "什么时候应该卖Covered Call？",
        a: "1) IV偏高时(IV Rank > 50)，权利金更值得；2) 你本来就计划在某个价格卖出股票；3) 预期短期横盘或温和上涨；4) 作为Wheel策略的一部分。不应该：在低IV时为了一点权利金卖call，或者在强势上涨趋势中限制收益。"
      },
      {
        q: "如何选择strike？",
        a: "ATM/ITM call：权利金多，但很可能被call away，适合想卖股票的人。OTM call：权利金少，但保留更多上涨空间，适合想继续持股的人。常见选择：0.30 delta(约70%概率到期OTM)或0.20 delta(约80%概率)。还要考虑技术阻力位。"
      },
      {
        q: "被assignment了怎么办？",
        a: "这不是'坏事'，而是策略的一部分。你按照预定价格卖出了股票，还收到了权利金。如果还想持有该股票，可以：1) 在市场回购(如果股价回落)；2) 卖Put等待接回来(Wheel策略)；3) 接受profit并寻找下一个机会。"
      },
      {
        q: "Covered Call vs Cash-Secured Put有什么关系？",
        a: "它们是synthetic equivalent。Covered Call(long stock + short call) = Short Put(在相同strike)。这是Put-Call Parity的应用。两者有相同的payoff，但税务处理、保证金、assignment timing可能不同。Covered Call需要持有股票，CSP需要现金。"
      }
    ]
  },

  // Cash-Secured Put - 现金担保卖Put
  "cash-secured-put": {
    exposure: {
      directional: "-Delta (看涨暴露，类似持股但未持有)",
      volatility: "-Vega (做空波动率)",
      time: "+Theta (收取时间价值)",
      convexity: "-Gamma (负凸性)"
    },

    profitLogic: {
      makesMoneyFrom: "时间衰减 + IV下跌 + 股价维持在strike之上",
      losesMoneyFrom: "股价大跌 + IV上升",
      bestMarketCondition: "高IV环境，预期股价不会大跌或愿意在strike价格买入",
      worstScenario: "股价暴跌，被迫以高于市价的strike接货"
    },

    clientPerspective: {
      whyClientDoes: [
        "想以更低价格买入股票(strike - premium)",
        "收取权利金作为收入",
        "Wheel策略的第一步",
        "比直接买股票获得更好的入场价"
      ],
      clientType: "价值投资者、收入型投资者、Wheel策略执行者",
      suitability: "有足够现金承担assignment、真正愿意持有该股票、理解下行风险"
    },

    dealerPerspective: {
      whenDealerSells: "客户卖CSP，Dealer买入该put：",
      exposure: "+Delta (long put = short delta), +Gamma, +Vega, -Theta",
      hedging: [
        "Dealer买入put后是long put = bearish exposure",
        "需要hedge：买入股票或卖出其他put",
        "通常Dealer会aggregate多个客户订单，net exposure管理",
        "如果net long put，可能卖出其他put或买入stock来hedge"
      ],
      profitSource: "Bid-ask价差 + 如果realized vol < implied vol则盈利"
    },

    interviewQuestions: [
      {
        q: "CSP和Covered Call有什么关系？",
        a: "它们是synthetic equivalent(合成等价)。Short Put = Long Stock + Short Call(相同strike)。这是Put-Call Parity。两者payoff相同，但CSP需要现金，CC需要股票。CSP的优势：不需要先买股票，可以等待更好入场价。"
      },
      {
        q: "如何选择strike？",
        a: "选择你真正愿意买入股票的价格。常见方法：1) 技术支撑位；2) 0.30 delta(约70%概率到期OTM)；3) 比当前价低5-10%。不要只看权利金高低 - 如果不愿意持有该股票，不要卖put。"
      },
      {
        q: "被assignment后怎么办？",
        a: "这是策略的一部分，不是'失败'。你以预定价格买入了股票，实际成本是strike - premium。接下来：1) 持有股票，卖Covered Call(Wheel策略)；2) 如果股价继续跌，可以继续卖put降低成本；3) 如果不想持有，在反弹时卖出。"
      },
      {
        q: "CSP的真实风险是什么？",
        a: "最大风险接近股票归零(strike × 100 - premium)。很多人以为'收租很安全'，但如果股票跌50%，CSP也亏接近50%。这不是'低风险'策略，而是'有限收益、大幅下行风险'的策略。只在真正看好该股票时使用。"
      },
      {
        q: "什么时候CSP比直接买股票更好？",
        a: "1) 当前价格偏高，想等待更好入场价；2) IV偏高，权利金值得收；3) 不确定是否要买，用权利金作为'等待的补偿'；4) 作为Wheel策略的一部分。但如果强烈看涨且想立即参与上涨，直接买股票更好。"
      }
    ]
  },

  // Bull Call Spread - 牛市看涨价差
  "bull-call-spread": {
    exposure: {
      directional: "+Delta (看涨，但被short call限制)",
      volatility: "~0 Vega (long和short call部分抵消)",
      time: "-Theta (net debit，时间流逝不利)",
      convexity: "+Gamma在低strike，-Gamma在高strike"
    },

    profitLogic: {
      makesMoneyFrom: "股价上涨到high strike附近",
      losesMoneyFrom: "股价不涨或下跌 + 时间流逝",
      bestMarketCondition: "温和看涨，目标价明确",
      worstScenario: "股价横盘或下跌，损失全部debit"
    },

    clientPerspective: {
      whyClientDoes: [
        "看涨但觉得Long Call太贵",
        "有明确目标价，不需要unlimited upside",
        "降低成本和Vega风险",
        "定义最大亏损和最大盈利"
      ],
      clientType: "方向性交易者、成本敏感的投资者",
      suitability: "有明确上涨预期和目标价、能接受有限收益"
    },

    dealerPerspective: {
      whenDealerSells: "客户买Bull Call Spread，Dealer卖spread：",
      exposure: "-Delta (short spread), ~0 Vega, +Theta",
      hedging: [
        "Dealer short spread后需要hedge delta",
        "可以买入股票hedge，或买入其他call",
        "因为是spread，net delta比naked call小，hedge更容易",
        "Dealer profit主要来自bid-ask(两条腿都有spread)"
      ],
      profitSource: "Bid-ask价差 × 2条腿 + Theta(如果客户持有到接近到期)"
    },

    interviewQuestions: [
      {
        q: "Bull Call Spread vs Long Call，什么时候用哪个？",
        a: "Long Call：强烈看涨，想要unlimited upside，能承受高权利金和Theta。Bull Call Spread：温和看涨，有目标价，想降低成本。Spread的breakeven更低，但max profit被cap。如果股价暴涨远超high strike，Long Call更好；如果涨到目标价附近，Spread更划算。"
      },
      {
        q: "如何选择strikes？",
        a: "Low strike：通常选ATM或略OTM(你的入场点)。High strike：你的目标价或阻力位。Width：窄spread(5-wide)成本低但max profit小；宽spread(10-15 wide)成本高但max profit大。常见：10-wide，low strike在当前价，high strike在+10%。"
      },
      {
        q: "什么时候应该提前平仓？",
        a: "1) 达到max profit的50-70%时(不要贪最后一点)；2) 股价突破high strike继续涨(考虑roll到更高strikes)；3) 方向判断错误，及时止损；4) 到期前一周，避免assignment复杂性。"
      },
      {
        q: "为什么Vega接近0？",
        a: "Long call是+Vega，short call是-Vega，两者部分抵消。但不是完全抵消：如果两个strikes距离较远或DTE不同，net Vega可能不是0。通常ATM附近Vega最高，所以如果low strike是ATM，high strike是OTM，net Vega略positive。"
      },
      {
        q: "Bull Call Spread vs Bull Put Spread？",
        a: "Bull Call Spread是debit spread(付钱)，Bull Put Spread是credit spread(收钱)。Call spread在股价上涨时value增加；Put spread在股价不跌时value减少(Theta收益)。Call spread更aggressive(需要上涨才赚钱)，Put spread更defensive(只要不跌就赚钱)。"
      }
    ]
  },

  // Bear Put Spread - 熊市看跌价差
  "bear-put-spread": {
    exposure: {
      directional: "-Delta (看跌，但被short put限制)",
      volatility: "~0 Vega (long和short put部分抵消)",
      time: "-Theta (net debit，时间流逝不利)",
      convexity: "+Gamma在high strike，-Gamma在low strike"
    },

    profitLogic: {
      makesMoneyFrom: "股价下跌到low strike附近",
      losesMoneyFrom: "股价不跌或上涨 + 时间流逝",
      bestMarketCondition: "温和看跌，目标价明确",
      worstScenario: "股价横盘或上涨，损失全部debit"
    },

    clientPerspective: {
      whyClientDoes: [
        "看跌但觉得Long Put太贵",
        "有明确下跌目标价",
        "降低成本和Vega风险",
        "对冲现有多头仓位"
      ],
      clientType: "方向性交易者、对冲者",
      suitability: "有明确下跌预期和目标价、能接受有限收益"
    },

    dealerPerspective: {
      whenDealerSells: "客户买Bear Put Spread，Dealer卖spread：",
      exposure: "+Delta (short put spread = bullish), ~0 Vega, +Theta",
      hedging: [
        "Dealer short put spread后是bullish exposure",
        "需要short股票或sell call来hedge",
        "或者买入其他put spread来对冲",
        "Net delta比naked put小，更容易管理"
      ],
      profitSource: "Bid-ask价差 × 2条腿 + Theta"
    },

    interviewQuestions: [
      {
        q: "Bear Put Spread vs Long Put？",
        a: "Long Put：强烈看跌，想要大幅下跌收益，能承受高权利金。Bear Put Spread：温和看跌，有目标价，想降低成本。Spread的breakeven更高(更容易盈利)，但max profit被cap。如果股价暴跌远超low strike，Long Put更好；如果跌到目标价，Spread更划算。"
      },
      {
        q: "为什么用Put Spread而不是Short Call？",
        a: "Bear Put Spread是defined risk(最大亏损=debit)，Short Call是unlimited risk。Put Spread需要付钱但风险有限；Short Call收钱但如果股价暴涨亏损无限。Put Spread适合方向性看跌；Short Call适合预期横盘或小跌。"
      },
      {
        q: "如何选择strikes？",
        a: "High strike：通常选ATM或略ITM(你认为股价会跌破的位置)。Low strike：你的目标价或支撑位。Width：5-10 wide常见。High strike越ITM，debit越高但胜率越高；越OTM，debit越低但需要更大跌幅。"
      },
      {
        q: "什么时候Bear Put Spread比做空股票更好？",
        a: "1) 不想承担做空的unlimited risk；2) 难以借券或借券成本高；3) 有明确目标价，不需要unlimited downside；4) 想要defined risk和limited capital。但如果强烈看跌且想要full downside exposure，做空股票或Long Put更直接。"
      },
      {
        q: "到期时如何处理？",
        a: "如果股价在两个strikes之间：复杂，可能只有一条腿被exercise。最好在到期前平仓避免assignment。如果股价低于low strike：两条腿都ITM，net value = spread width。如果高于high strike：两条腿都OTM，归零。"
      }
    ]
  },

  // Straddle - 买入跨式
  "straddle": {
    exposure: {
      directional: "~0 Delta (初始中性，但Gamma会让delta随价格变化)",
      volatility: "+Vega (强烈做多波动率)",
      time: "-Theta (双倍时间衰减)",
      convexity: "+Gamma (强正凸性，大幅波动有利)"
    },

    profitLogic: {
      makesMoneyFrom: "任意方向的大幅波动 + IV上升",
      losesMoneyFrom: "横盘不动 + 时间流逝 + IV Crush",
      bestMarketCondition: "低IV买入，预期大事件(财报、FDA、选举)导致大波动",
      worstScenario: "事件后股价不动，IV Crush，双重打击"
    },

    clientPerspective: {
      whyClientDoes: [
        "预期大波动但不确定方向",
        "事件驱动交易(财报、FDA批准)",
        "认为市场低估了未来波动(realized vol > implied vol)",
        "对冲其他仓位的方向风险"
      ],
      clientType: "事件驱动交易者、波动率交易者、对冲基金",
      suitability: "理解IV和Vega、能承受全部权利金损失、有明确事件催化剂"
    },

    dealerPerspective: {
      whenDealerSells: "客户买Straddle，Dealer卖straddle：",
      exposure: "~0 Delta, -Vega (short vol), +Theta, -Gamma",
      hedging: [
        "Dealer short straddle后是short vol + short gamma",
        "最大风险：股价大幅波动，Gamma loss很大",
        "Delta hedge：股价上涨时买股票，下跌时卖股票(追涨杀跌)",
        "Vega hedge：买入其他期权来对冲short vega",
        "这是Dealer最不喜欢的trade之一 - short gamma风险高"
      ],
      profitSource: "Bid-ask价差 × 2 + 如果realized vol < implied vol(客户overpaid for vol)"
    },

    interviewQuestions: [
      {
        q: "Long Straddle的盈亏平衡点在哪里？",
        a: "上方BEP = strike + total premium；下方BEP = strike - total premium。例如：100 straddle花$8，BEP是92和108。股价必须移动超过$8才开始盈利。这就是为什么需要'大'波动 - 小波动不够覆盖双倍权利金。"
      },
      {
        q: "什么是IV Crush？为什么对Straddle致命？",
        a: "IV Crush是事件后IV急剧下降。财报前IV可能40%，财报后降到25%。Straddle是+Vega，IV下降直接导致value下降。即使股价移动了，如果IV Crush够大，straddle仍然亏损。这就是'买入预期，卖出事实'。"
      },
      {
        q: "Long Straddle vs Long Strangle？",
        a: "Straddle：买ATM call和put，成本高，需要的移动小。Strangle：买OTM call和put，成本低，需要的移动大。Straddle适合预期moderate-large move；Strangle适合预期extreme move或想降低成本。Straddle的Gamma和Vega更高。"
      },
      {
        q: "如何管理Long Straddle？",
        a: "1) 事件前买入，事件后立即平仓(不管方向)，避免IV Crush；2) 如果一个方向盈利，可以平掉盈利的一边，留下另一边作为free trade；3) 如果横盘，及时止损，不要等到Theta吃光所有value；4) 可以卖出更远OTM的options来收回部分成本(转成Iron Butterfly)。"
      },
      {
        q: "Dealer如何hedge short straddle的Gamma风险？",
        a: "Short straddle = short gamma，股价波动时被迫追涨杀跌。例如：股价从100涨到105，delta从0变成+30，Dealer需要买30股(买在高点)。如果又跌回100，delta回到0，Dealer需要卖30股(卖在低点)。这就是Gamma loss。Dealer只能：1) 动态rehedge；2) 买入其他options来hedge gamma；3) 收取足够高的premium来compensate这个风险。"
      }
    ]
  },

  // Strangle - 买入宽跨式
  "strangle": {
    exposure: {
      directional: "~0 Delta (初始中性)",
      volatility: "+Vega (做多波动率)",
      time: "-Theta (双倍时间衰减)",
      convexity: "+Gamma (正凸性)"
    },

    profitLogic: {
      makesMoneyFrom: "极端方向的大幅波动 + IV上升",
      losesMoneyFrom: "价格停在两个strikes之间 + 时间流逝 + IV Crush",
      bestMarketCondition: "低IV买入，预期极端波动",
      worstScenario: "横盘在两个strikes之间，两个期权都归零"
    },

    clientPerspective: {
      whyClientDoes: [
        "预期极端波动但想降低成本(vs Straddle)",
        "不确定方向但认为会有大动作",
        "事件驱动但预算有限",
        "认为当前IV低估了真实风险"
      ],
      clientType: "成本敏感的波动率交易者、事件驱动交易者",
      suitability: "能承受全部权利金损失、理解需要更大波动才能盈利"
    },

    dealerPerspective: {
      whenDealerSells: "客户买Strangle，Dealer卖strangle：",
      exposure: "~0 Delta, -Vega, +Theta, -Gamma",
      hedging: [
        "类似short straddle，但strikes更远，Gamma风险略小",
        "仍然需要动态delta hedge",
        "如果股价在两个strikes之间，Dealer收Theta很舒服",
        "如果突破任一strike，开始面临Gamma loss"
      ],
      profitSource: "Bid-ask × 2 + Theta + 如果realized vol < implied vol"
    },

    interviewQuestions: [
      {
        q: "Strangle vs Straddle，什么时候用哪个？",
        a: "Straddle：预期moderate-large move(10-15%)，愿意付更高premium。Strangle：预期extreme move(20%+)，想降低成本。Strangle的BEP更远，需要更大波动。例如：100 straddle花$8(BEP 92/108)，95/105 strangle花$5(BEP 90/110)。Strangle便宜40%但需要更大移动。"
      },
      {
        q: "如何选择strikes？",
        a: "常见：0.25-0.30 delta的OTM options(约70-75%概率到期OTM)。例如股价100，可能选95 put和105 call。Width越宽，成本越低但需要的移动越大。要考虑：1) 预算；2) 预期波动幅度；3) 技术支撑/阻力位。"
      },
      {
        q: "Strangle的最大风险是什么？",
        a: "不是'损失全部premium'(这是已知的)，而是：1) 错误判断波动幅度 - 股价动了但不够远；2) IV Crush - 事件后IV暴跌；3) 时间衰减 - 如果事件延迟，Theta持续侵蚀；4) 方向判断对但timing错 - 股价最终大动但在到期后。"
      },
      {
        q: "什么时候应该平仓Strangle？",
        a: "1) 事件发生后立即平仓，不管盈亏(避免IV Crush)；2) 一边盈利后，可以平掉盈利的一边，让另一边成为free trade；3) 如果横盘且接近到期，及时止损；4) 达到目标利润(如50-100% return)时获利了结。"
      },
      {
        q: "为什么Strangle比Straddle更常见？",
        a: "成本更低，风险更defined。很多交易者宁愿买便宜的Strangle赌extreme move，也不愿买贵的Straddle。而且Strangle的Vega exposure略小(因为OTM options的Vega比ATM低)，对IV变化不那么敏感。但需要更大的移动才能盈利。"
      }
    ]
  },

  // Butterfly - 蝶式价差
  "long-call-butterfly": {
    exposure: {
      directional: "~0 Delta (中性，赌价格停在middle strike)",
      volatility: "-Vega (做空波动率)",
      time: "+Theta (时间流逝有利，如果价格在middle strike附近)",
      convexity: "+Gamma在middle strike，-Gamma在wings"
    },

    profitLogic: {
      makesMoneyFrom: "价格到期停在middle strike附近 + IV下跌 + 时间流逝",
      losesMoneyFrom: "价格远离middle strike + IV上升",
      bestMarketCondition: "有明确目标价，预期横盘到该价格",
      worstScenario: "价格大幅波动远离middle strike"
    },

    clientPerspective: {
      whyClientDoes: [
        "有明确目标价预期",
        "想用低成本表达range-bound观点",
        "预期IV会下降",
        "不想承担Iron Condor的unlimited risk(虽然butterfly也有limited profit)"
      ],
      clientType: "精确目标价交易者、低成本中性策略爱好者",
      suitability: "有明确价格预期、理解盈利窗口很窄、能接受低胜率高赔率"
    },

    dealerPerspective: {
      whenDealerSells: "客户买Butterfly，Dealer卖butterfly：",
      exposure: "~0 Delta, +Vega, -Theta",
      hedging: [
        "Butterfly是3条腿，Dealer需要hedge net exposure",
        "通常net exposure很小(因为是balanced structure)",
        "主要profit来自bid-ask × 3条腿",
        "如果价格停在middle strike，Dealer的short butterfly会亏损"
      ],
      profitSource: "Bid-ask × 3条腿(可能是总premium的20-30%)"
    },

    interviewQuestions: [
      {
        q: "Butterfly的结构是什么？",
        a: "Buy 1 low strike call, Sell 2 middle strike calls, Buy 1 high strike call。通常等距：如95/100/105。这创造了一个'tent'形状的payoff - 在middle strike达到max profit，向两边递减到0。本质上是Bull Call Spread + Bear Call Spread的组合。"
      },
      {
        q: "为什么Butterfly成本这么低？",
        a: "因为卖出2张middle strike calls收到的premium几乎抵消了买入两个wings的成本。Net debit通常只有spread width的10-30%。例如：5-wide butterfly可能只花$0.50-1.50。这就是为什么它是'low cost, low probability, high reward'策略。"
      },
      {
        q: "Butterfly vs Iron Condor？",
        a: "Butterfly：低成本debit，盈利窗口窄(集中在middle strike)，max loss = debit。Iron Condor：收credit，盈利窗口宽(两个short strikes之间)，max loss = spread width - credit。Butterfly适合精确目标价；Iron Condor适合range-bound但不确定具体价格。"
      },
      {
        q: "什么时候应该用Butterfly？",
        a: "1) 有非常明确的目标价(技术分析、事件驱动)；2) IV偏高，预期会回落；3) 想用小成本赌一个精确结果；4) 作为Iron Condor的替代(如果不想收credit或担心unlimited risk)。不适合：方向不明确、预期大波动、需要高胜率。"
      },
      {
        q: "如何管理Butterfly？",
        a: "1) 达到max profit的50-70%时平仓(不要贪最后一点)；2) 如果价格远离middle strike且接近到期，及时止损；3) 可以调整middle strike(roll)如果目标价改变；4) 到期前一周，如果价格在middle strike附近，考虑平仓避免assignment复杂性。Butterfly的Gamma在到期前会变得极端尖锐。"
      }
    ]
  },

  // Calendar Spread - 日历价差
  "calendar-call-spread": {
    exposure: {
      directional: "~0 Delta (初始接近中性)",
      volatility: "+Vega (net long vol，尤其是long-term vol)",
      time: "+Theta (near-term theta decay有利)",
      convexity: "复杂(取决于价格相对strike的位置)"
    },

    profitLogic: {
      makesMoneyFrom: "近月期权快速衰减 + 远月期权保留价值 + 价格停在strike附近 + 远月IV上升",
      losesMoneyFrom: "价格远离strike + 近远月IV差缩小 + 远月IV下跌",
      bestMarketCondition: "近月IV高(事件前)，远月IV低，预期价格停在strike",
      worstScenario: "价格快速远离strike，两条腿都失去价值"
    },

    clientPerspective: {
      whyClientDoes: [
        "交易IV term structure(近月vs远月)",
        "预期近月事件后IV Crush但远月保持",
        "想收近月Theta同时保留远月exposure",
        "中性策略但保留调整灵活性"
      ],
      clientType: "波动率交易者、term structure交易者、高级期权交易者",
      suitability: "理解IV term structure、能监控和调整、理解near-term expiration风险"
    },

    dealerPerspective: {
      whenDealerSells: "客户买Calendar，Dealer卖calendar：",
      exposure: "-Vega (net short vol), -Theta",
      hedging: [
        "Calendar是不同DTE的options，hedge比较复杂",
        "需要分别hedge near-term和long-term exposure",
        "通常Dealer会用其他calendar或time spread来hedge",
        "主要风险：near-term expiration时的Gamma spike"
      ],
      profitSource: "Bid-ask × 2条腿 + 如果term structure按预期变化"
    },

    interviewQuestions: [
      {
        q: "Calendar Spread的核心逻辑是什么？",
        a: "交易time decay的差异。Near-term options衰减快(high theta)，long-term options衰减慢(low theta)。卖near-term收高theta，买long-term保留exposure。理想情况：near-term到期时价格在strike，near-term归零，long-term仍有价值。"
      },
      {
        q: "为什么Calendar Spread是Vega trade？",
        a: "因为你在交易near-term vs long-term IV的差异。如果near-term IV高(事件前)，long-term IV正常，卖near-term买long-term可以capture这个差异。事件后near-term IV Crush，但long-term IV不变，calendar盈利。这是'term structure arbitrage'。"
      },
      {
        q: "Calendar Spread vs Diagonal Spread？",
        a: "Calendar：相同strike，不同DTE，接近delta-neutral。Diagonal：不同strike AND不同DTE，有方向bias。Calendar适合中性+vol trade；Diagonal适合温和方向+vol trade。Diagonal可以是bullish(long higher strike long-term, short lower strike near-term)或bearish。"
      },
      {
        q: "Near-term expiration时如何处理？",
        a: "这是Calendar最关键的时刻。如果价格在strike附近：near-term快速衰减，perfect。如果价格远离strike：两条腿都失去价值，考虑提前平仓。Near-term到期后，你剩下long-term option，可以：1) 继续持有；2) 卖出另一个near-term(roll calendar)；3) 平仓获利/止损。"
      },
      {
        q: "什么时候Calendar Spread最有效？",
        a: "1) 财报前：near-term IV elevated，财报后Crush；2) FOMC/重大事件前；3) Near-term IV Rank高，long-term IV Rank低；4) 预期价格会停在某个关键位(技术支撑/阻力)。不适合：预期大幅波动、near-term和long-term IV都很低、不想管理near-term expiration。"
      }
    ]
  },

  // Synthetic Future - 合成期货
  "long-synthetic-future": {
    exposure: {
      directional: "+Delta ≈ +1.0 (等同于持有股票)",
      volatility: "~0 Vega (long call和short put的Vega抵消)",
      time: "~0 Theta (两者抵消)",
      convexity: "~0 Gamma (两者抵消)"
    },

    profitLogic: {
      makesMoneyFrom: "股价上涨(线性，类似持股)",
      losesMoneyFrom: "股价下跌(线性，类似持股)",
      bestMarketCondition: "想要股票exposure但用期权实现(资金效率、融资成本、做空限制)",
      worstScenario: "股价大跌，亏损接近持股"
    },

    clientPerspective: {
      whyClientDoes: [
        "想要股票exposure但不想占用大量资金",
        "利用期权的杠杆效应",
        "绕过做空限制(synthetic short)",
        "理解Put-Call Parity并利用mispricing"
      ],
      clientType: "套利交易者、资金效率优化者、专业交易员",
      suitability: "理解Put-Call Parity、能管理short put的保证金和assignment风险"
    },

    dealerPerspective: {
      whenDealerSells: "客户买Synthetic Long，Dealer卖synthetic：",
      exposure: "-Delta (short stock equivalent)",
      hedging: [
        "Dealer卖synthetic = short stock exposure",
        "最简单hedge：买入股票",
        "或者：买入其他synthetic long来对冲",
        "Synthetic的好处：Vega/Gamma/Theta都接近0，只需要hedge Delta"
      ],
      profitSource: "Bid-ask × 2条腿 + 如果synthetic mispriced(违反Put-Call Parity)"
    },

    interviewQuestions: [
      {
        q: "什么是Put-Call Parity？",
        a: "C - P = S - K·e^(-rT)。Call价格减Put价格等于Forward价格。Long Call + Short Put = Long Stock(synthetic)。这是无套利定价的基础。如果等式不成立，存在套利机会(Box Spread就是利用这个)。"
      },
      {
        q: "Synthetic Long vs 直接买股票？",
        a: "Synthetic：资金效率高(只需要short put保证金)，但有assignment风险，需要管理保证金。Stock：简单，无assignment风险，有投票权和股息，但占用全部资金。Synthetic适合：杠杆需求、短期交易、资金有限。Stock适合：长期持有、想要股息、不想管理期权。"
      },
      {
        q: "为什么Synthetic的Greeks都接近0？",
        a: "Long Call：+Vega, -Theta, +Gamma。Short Put：-Vega, +Theta, -Gamma。两者相加，Greeks互相抵消，只剩下Delta。这就是为什么Synthetic的payoff是线性的，像股票一样。这也是为什么Synthetic是'pure directional play'，不受IV或time decay影响。"
      },
      {
        q: "Synthetic的风险在哪里？",
        a: "1) Short put的assignment风险(如果股价跌破strike)；2) 保证金要求(short put需要保证金)；3) Early assignment(美式期权)；4) Dividend risk(synthetic不收股息，但如果put被exercise，你会被assigned stock并需要付股息)；5) 如果mispricing消失，可能需要调整。"
      },
      {
        q: "如何用Synthetic做套利？",
        a: "如果C - P ≠ S - K·e^(-rT)，存在套利。例如：C - P = $1.50，但S - K·e^(-rT) = $1.00。买便宜的(synthetic)，卖贵的(stock)。Buy call, sell put(花$1.50), sell stock(收$S)。到期时net payoff = $0.50 risk-free。但实际中这种机会很少且很小，因为市场很有效。"
      }
    ]
  },

  // Risk Reversal - 风险反转
  "risk-reversal": {
    exposure: {
      directional: "+Delta (强烈看涨) 或 -Delta (强烈看跌)",
      volatility: "~0 Vega (long和short期权部分抵消)",
      time: "~0 Theta (部分抵消)",
      convexity: "+Gamma在long side, -Gamma在short side"
    },

    profitLogic: {
      makesMoneyFrom: "朝预期方向的大幅移动",
      losesMoneyFrom: "反向移动(unlimited risk on short side)",
      bestMarketCondition: "强烈方向观点 + 想用short option降低成本",
      worstScenario: "方向判断错误，朝short option方向大幅移动"
    },

    clientPerspective: {
      whyClientDoes: [
        "强烈方向观点但想降低成本",
        "愿意承担反向风险来换取更低入场成本",
        "利用volatility skew(put skew或call skew)",
        "作为现有仓位的方向性对冲"
      ],
      clientType: "方向性交易者、对冲基金、专业交易员",
      suitability: "有强烈方向观点、理解unlimited risk、能管理short option"
    },

    dealerPerspective: {
      whenDealerSells: "客户买Risk Reversal，Dealer卖RR：",
      exposure: "-Delta (反向方向)",
      hedging: [
        "Dealer需要hedge directional exposure",
        "可以买入/卖出股票，或用其他options",
        "Risk Reversal是常见的客户订单，Dealer通常能找到对手方",
        "Profit来自bid-ask + skew trading"
      ],
      profitSource: "Bid-ask × 2 + 如果能利用volatility skew mispricing"
    },

    interviewQuestions: [
      {
        q: "Risk Reversal的结构是什么？",
        a: "Bullish RR: Buy OTM call, Sell OTM put(相同DTE)。Bearish RR: Buy OTM put, Sell OTM call。通常选择相同delta的strikes(如25-delta)，使得cost接近0(zero-cost collar)或small debit/credit。本质上是用short option的premium来fund long option。"
      },
      {
        q: "为什么叫'Risk Reversal'？",
        a: "因为你在'反转'风险方向。例如bullish RR：你放弃了下行保护(sell put = unlimited downside)来获得上行exposure(buy call)。你把'下行有限、上行有限'的profile反转成'下行unlimited、上行unlimited'，类似synthetic long但成本更低。"
      },
      {
        q: "Risk Reversal vs Synthetic Long？",
        a: "Synthetic Long: ATM call + ATM put，delta ≈ 1.0，cost = forward price。Risk Reversal: OTM call + OTM put，delta < 1.0，cost ≈ 0。RR更便宜但需要更大移动才能盈利。RR适合强烈方向观点但预算有限；Synthetic适合想要full stock exposure。"
      },
      {
        q: "如何用Risk Reversal交易volatility skew？",
        a: "Equity通常有put skew(OTM puts贵)。如果你认为skew过度，可以：Sell expensive OTM put, Buy cheap OTM call = collect skew premium。如果skew normalize(put IV下降，call IV上升)，RR盈利。这是'skew arbitrage'，但需要方向也对才能真正盈利。"
      },
      {
        q: "Risk Reversal的最大风险是什么？",
        a: "Short option side的unlimited risk。Bullish RR：如果股价暴跌，short put亏损巨大。Bearish RR：如果股价暴涨，short call亏损unlimited。这不是'defined risk'策略。必须有严格止损和风险管理。很多人被'zero cost'吸引，忽略了unlimited risk。"
      }
    ]
  },

  // Box Spread - 盒式价差
  "box-spread": {
    exposure: {
      directional: "0 Delta (完全中性)",
      volatility: "0 Vega (所有Greeks抵消)",
      time: "0 Theta (理论上)",
      convexity: "0 Gamma (完全对冲)"
    },

    profitLogic: {
      makesMoneyFrom: "Put-Call Parity mispricing + 利率套利",
      losesMoneyFrom: "Transaction costs + Early assignment + Mispricing消失",
      bestMarketCondition: "发现Put-Call Parity违反 + 流动性好 + 低transaction cost",
      worstScenario: "Early assignment导致结构破坏 + Transaction costs吃掉利润"
    },

    clientPerspective: {
      whyClientDoes: [
        "套利Put-Call Parity违反",
        "作为融资工具(synthetic borrowing/lending)",
        "理论学习和理解期权定价",
        "极少数情况下的真实套利机会"
      ],
      clientType: "套利交易者、做市商、专业交易员、学术研究",
      suitability: "深刻理解Put-Call Parity、能处理early assignment、有低transaction cost"
    },

    dealerPerspective: {
      whenDealerSells: "Box Spread通常是专业交易员之间的交易：",
      exposure: "理论上0 exposure(完全对冲)",
      hedging: [
        "Box Spread是self-hedging structure",
        "Dealer不需要额外hedge",
        "主要风险：early assignment破坏结构",
        "Profit来自：capturing mispricing或作为financing tool"
      ],
      profitSource: "Put-Call Parity mispricing(通常很小，几美分) + 作为融资工具的利率差"
    },

    interviewQuestions: [
      {
        q: "Box Spread的结构是什么？",
        a: "Bull Call Spread + Bear Put Spread(相同strikes)。例如：Buy 95 call, Sell 105 call, Buy 105 put, Sell 95 put。到期payoff = strike difference(这里是10)，无论股价在哪里。这是'synthetic zero-coupon bond' - 今天付出X，到期收到固定金额。"
      },
      {
        q: "为什么Box Spread是risk-free？",
        a: "因为到期payoff固定 = high strike - low strike，与股价无关。所有Greeks都抵消(delta=0, gamma=0, vega=0, theta=0)。理论上是pure financing trade。但实际风险：1) Early assignment(美式期权)；2) Transaction costs；3) Counterparty risk；4) Execution risk(4条腿不能同时成交)。"
      },
      {
        q: "如何用Box Spread套利？",
        a: "如果Box价格 < PV(strike difference)：买Box，到期收strike difference，profit = difference - cost。如果Box价格 > PV(strike difference)：卖Box，今天收premium，到期付strike difference，profit = premium - PV(strike difference)。但实际中这种机会极少，因为市场很有效。"
      },
      {
        q: "为什么Box Spread在实际中很少用？",
        a: "1) Mispricing极小(几美分)，transaction costs(bid-ask × 4条腿)通常更大；2) Early assignment风险(美式期权)会破坏结构；3) 需要大量资金才能让小mispricing有意义；4) 欧式期权(如SPX)更适合，但散户难以access；5) 专业做市商已经在做，散户很难竞争。"
      },
      {
        q: "Box Spread教会我们什么？",
        a: "1) Put-Call Parity是fundamental - 违反它就有套利；2) 期权定价不是孤立的，call和put价格相互关联；3) 理论上的'risk-free'在实际中有很多摩擦(costs, assignment, execution)；4) 市场通常很有效，真正的套利机会很少且很小；5) 理解Box Spread帮助理解synthetic positions和hedging。"
      }
    ]
  },

  // 通用专业交易概念
  professionalConcepts: {
    greeksRelationships: {
      gammaThetaTradeoff: {
        concept: "Gamma和Theta是同一枚硬币的两面",
        explanation: "高Gamma(凸性收益)必然伴随高Theta(时间成本)。Long gamma = 付Theta买convexity。Short gamma = 收Theta承担rehedging risk。",
        formula: "Gamma P&L ≈ 0.5 × Gamma × (ΔS)²。如果realized vol > implied vol，long gamma盈利。",
        interview: "面试中常问：'为什么不能既有high gamma又有low theta？' 答案：违反无套利原则。"
      },
      vegaGammaCorrelation: {
        concept: "Vega和Gamma都在ATM附近最高",
        explanation: "ATM期权有最大不确定性 → 最高time value → 最高Vega。同时Delta变化最快 → 最高Gamma。",
        interview: "Long ATM straddle = long gamma + long vega + short theta。这是'买波动率'的纯粹表达。"
      },
      realizedVsImplied: {
        concept: "Realized vol vs Implied vol决定期权交易盈亏",
        explanation: "Implied vol是市场对未来波动的预期(期权价格隐含)。Realized vol是实际发生的波动。",
        profitLogic: "Long options: 如果realized > implied，盈利(即使方向错)。Short options: 如果realized < implied，盈利。",
        interview: "Gamma scalping就是利用这个：如果realized vol高，动态rehedging能盈利，即使期权本身亏损。"
      }
    },

    clientTypes: {
      hedger: {
        goal: "降低现有仓位风险，不是speculation",
        commonStrategies: ["Protective Put(对冲多头)", "Collar(限制上下行)", "Bear Put Spread(对冲下跌)"],
        dealerApproach: "理解客户的underlying position，提供合适的hedge structure，关注cost efficiency"
      },
      incomeSeeker: {
        goal: "定期收入，愿意承担有限风险",
        commonStrategies: ["Covered Call", "Cash-Secured Put", "Iron Condor", "Wheel Strategy"],
        dealerApproach: "强调risk-reward，解释max loss，确保客户理解assignment和margin"
      },
      speculator: {
        goal: "方向性或波动率speculation，追求高回报",
        commonStrategies: ["Long Call/Put", "Spreads", "Straddle/Strangle", "Butterfly"],
        dealerApproach: "确保客户理解leverage和risk，提供defined-risk alternatives"
      },
      arbitrageur: {
        goal: "捕捉mispricing，risk-free或low-risk profit",
        commonStrategies: ["Box Spread", "Conversion/Reversal", "Synthetic arbitrage"],
        dealerApproach: "通常是专业交易员，需要快速execution和低costs"
      }
    },

    dealerHedgingPrinciples: {
      deltaHedging: {
        concept: "用underlying hedge方向风险",
        method: "Short options → buy stock。Long options → sell stock。动态调整as delta changes。",
        frequency: "Gamma越大，rehedge越频繁。ATM near expiry可能需要每小时rehedge。",
        cost: "Rehedging cost = gamma loss(如果realized vol > 0)。这是short gamma的主要风险。"
      },
      vegaHedging: {
        concept: "用其他options hedge波动率风险",
        method: "Short vega → buy other options。Long vega → sell other options。",
        challenge: "不同strikes和DTEs的vega不完全相同，需要vega-weighted hedge。",
        interview: "Dealer通常不hedge每个客户订单的vega，而是aggregate整个book的net vega exposure。"
      },
      gammaManagement: {
        concept: "Gamma是最难hedge的Greek",
        challenge: "Gamma随价格和时间快速变化，需要持续监控和调整。",
        approach: "1) 动态delta hedge；2) 用其他options hedge gamma；3) 收取足够premium compensate gamma risk。",
        interview: "Short gamma是做市商最大的风险。这就是为什么ATM near expiry options的bid-ask spread很宽。"
      }
    },

    marginAndCapital: {
      regTBasics: {
        longOptions: "Premium × qty × multiplier(全额付款)",
        shortNaked: "Max(premium + 20% underlying - OTM amount, premium + 10% underlying)",
        definedRiskSpreads: "Max loss between legs(通常是spread width - credit)",
        note: "这是教育性估算。实际保证金由broker决定，可能更高。参考FINRA Rule 4210。"
      },
      portfolioMarginConcept: {
        concept: "基于风险的保证金(vs strategy-based Reg-T)",
        method: "计算多个stress scenarios下的最大理论亏损",
        requirements: "$125k minimum account, approved by broker",
        benefit: "通常比Reg-T低20-40%，但在volatile markets会增加",
        warning: "这是broker-specific，不是固定公式。PM可以intraday变化。"
      },
      positionSizing: {
        maxRiskPerTrade: "通常2-5% of account",
        greeksLimits: "Portfolio delta ±10%, gamma 5%, vega 15% of account",
        concentrationRisk: "不要把所有仓位放在一个underlying或一个策略",
        interview: "Position sizing比strategy selection更重要。好的strategy + 过大仓位 = 灾难。"
      }
    }
  }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PROFESSIONAL_CONTENT };
}
