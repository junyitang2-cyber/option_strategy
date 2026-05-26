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

  // Long Put - 买入看跌期权
  "long-put": {
    exposure: {
      directional: "-Delta (看跌方向暴露)",
      volatility: "+Vega (做多波动率)",
      time: "-Theta (时间衰减是敌人)",
      convexity: "+Gamma (正凸性，价格下跌加速盈利)"
    },

    profitLogic: {
      makesMoneyFrom: "标的下跌带来的Delta收益 + 恐慌时IV上升带来的Vega收益",
      losesMoneyFrom: "时间流逝(Theta) + IV下跌 + 标的不跌或上涨",
      bestMarketCondition: "低IV环境买入，预期标的会快速下跌且IV可能飙升(恐慌)",
      worstScenario: "横盘不动或缓慢上涨，Theta持续侵蚀，IV回落"
    },

    clientPerspective: {
      whyClientDoes: [
        "看跌但不想承担卖空股票的无限上行风险和借券成本",
        "用有限亏损(权利金)换取下行杠杆",
        "对冲现有多头仓位(保护性Put)",
        "事件驱动(财报、监管风险)预期下跌",
        "恐慌时期做多波动率"
      ],
      clientType: "散户投机、机构对冲、对冲基金事件驱动、尾部风险保护",
      suitability: "理解期权、能承受全部权利金损失、有明确下跌预期或对冲需求"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer卖出Long Put给客户后，面临：",
      exposure: "+Delta (多Delta，标的下跌亏损), -Gamma (需要追跌对冲), -Vega (IV上升亏损), +Theta (时间流逝盈利)",
      hedging: [
        "Delta对冲：卖空Delta数量的股票(如ATM put delta=-0.5，卖空50股/张)",
        "Gamma管理：股价下跌时Delta变得更负，需要继续卖空股票；上涨时回补",
        "Vega对冲：Put的Vega在恐慌时飙升，Dealer可能买入其他期权对冲",
        "恐慌溢价：市场下跌时IV skew陡峭，OTM put非常贵，Dealer面临巨大Vega风险"
      ],
      profitSource: "Bid-ask价差 + 客户付出的IV溢价 + Put skew溢价(OTM put通常高估)"
    },

    interviewQuestions: [
      {
        q: "Long Put和卖空股票有什么区别？",
        a: "Long Put有限亏损(权利金)，卖空股票理论上无限亏损。Long Put有正Vega，恐慌时IV上升会增值；卖空股票没有Vega暴露。Long Put有负Theta，时间流逝亏损；卖空股票没有时间衰减。Long Put不需要借券，卖空需要。"
      },
      {
        q: "为什么Put的IV通常比Call高(Put skew)？",
        a: "市场对下行风险的恐慌大于上行。机构持有股票需要买Put保护，需求推高Put价格。股市下跌通常快速且剧烈(crash)，上涨缓慢(grind)，realized vol在下跌时更高。这种不对称性导致OTM put的IV明显高于同等moneyness的OTM call。"
      },
      {
        q: "Dealer卖出ATM put后如何对冲？",
        a: "初始：卖空约50股(delta=-0.5)。股价下跌：delta变为-0.6，再卖空10股。股价继续跌：delta到-0.7，再卖空10股。这是追跌对冲 - 被迫'低卖高买'。对于short gamma position，如果realized vol高(尤其是下跌时)，动态对冲会亏损。Dealer赚的是Put skew溢价和bid-ask。"
      },
      {
        q: "什么时候用Long Put做保护比用Stop Loss好？",
        a: "1) 担心跳空gap down，stop loss无法执行；2) 想保留上行潜力，stop loss会完全退出；3) 财报或事件前，预期波动但方向不确定；4) 长期持仓不想频繁交易。但Long Put有成本(权利金)，如果没发生下跌就是纯损失。"
      },
      {
        q: "如何选择Put的strike和DTE？",
        a: "保护性Put: strike选择能接受的最大亏损点(如5-10% OTM)，DTE覆盖风险期。投机Put: ATM或略ITM胜率高但贵；OTM便宜但需要大跌。DTE: 30-60天平衡Theta和成本。恐慌时期IV高，可以考虑卖出更远DTE的Put做calendar spread降低成本。"
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
        "比Iron Condor更精确的目标价表达(盈利区间更窄但成本更低)"
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
        a: "1) 有非常明确的目标价(技术分析、事件驱动)；2) IV偏高，预期会回落；3) 想用小成本赌一个精确结果；4) 作为Iron Condor的替代(如果想要更窄的盈利区间和更低的成本)。不适合：方向不明确、预期大波动、需要高胜率。"
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
        a: "如果C - P ≠ S - K·e^(-rT)，存在套利。例如：C - P = $1.50，但S - K·e^(-rT) = $1.00。Synthetic forward贵了$0.50。套利：sell synthetic (sell call, buy put)收$1.50，buy stock付$S。到期时：如果S_T > K，call被exercise你交股票收K；如果S_T < K，你exercise put交股票收K。Net = $1.50 - ($S - K·e^(-rT)) = $0.50 risk-free。实际中这种机会很少且很小，因为市场很有效且有交易成本。"
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
      losesMoneyFrom: "反向移动(short side风险很大：bullish RR的short put下行到0，bearish RR的short call理论无限上行)",
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
      suitability: "有强烈方向观点、理解short option风险、能管理大幅反向移动"
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
        a: "因为你在'反转'风险方向。例如bullish RR：你放弃了下行保护(sell put = 下行风险到0)来获得上行exposure(buy call)。你把'下行有限、上行有限'的profile反转成'下行大幅风险、上行unlimited'，类似synthetic long但成本更低。"
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
        a: "Short option side的大幅风险。Bullish RR：如果股价暴跌到0，short put最大亏损 = strike × 100。Bearish RR：如果股价暴涨，short call理论上unlimited upside risk。这不是'defined risk'策略。必须有严格止损和风险管理。很多人被'zero cost'吸引，忽略了short option的风险。"
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

  // Bear Call Spread - 熊市看涨价差
  "bear-call-spread": {
    exposure: {
      directional: "-Delta (看跌方向暴露)",
      volatility: "-Vega (做空波动率，但有限)",
      time: "+Theta (时间衰减是朋友)",
      convexity: "-Gamma (负凸性，价格上涨不利)"
    },

    profitLogic: {
      makesMoneyFrom: "标的下跌或横盘 + 时间衰减 + IV下跌",
      losesMoneyFrom: "标的上涨突破short call strike",
      bestMarketCondition: "温和看跌或横盘，IV回落",
      worstScenario: "标的快速上涨突破long call strike，亏损max loss"
    },

    clientPerspective: {
      whyClientDoes: [
        "看跌但不想承担naked short call的无限风险",
        "用有限风险换取收租收益",
        "比bull put spread更aggressive的看跌表达",
        "对冲现有多头仓位"
      ],
      clientType: "散户收租、机构方向性表达、对冲基金",
      suitability: "理解有限盈利和亏损、能承受max loss、有明确看跌预期"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer卖出Bear Call Spread给客户(即Dealer买入spread)：",
      exposure: "Dealer long short call + short long call，net long call spread(bull call spread)",
      hedging: [
        "Dealer是long call spread，这是+delta, +gamma, +vega",
        "Delta对冲：卖空股票对冲long delta",
        "如果股价上涨，Dealer盈利；如果下跌，Dealer亏损(但有限)",
        "Bear call spread对Dealer来说是标准产品，风险可控"
      ],
      profitSource: "Bid-ask价差(两个call各收一次)"
    },

    interviewQuestions: [
      {
        q: "Bear Call Spread和Bear Put Spread有什么区别？",
        a: "都是看跌策略，但构建方式不同：Bear Call Spread是credit spread（卖低strike call，买高strike call，收到net credit），适合温和看跌且预期IV下降。Bear Put Spread是debit spread（买高strike put，卖低strike put，支付net debit），适合明确看跌且预期快速下跌。Credit spread收Theta，debit spread付Theta。实际中，credit spread因为收入在手、保证金更低，更受欢迎。"
      },
      {
        q: "为什么用Bear Call Spread而不是直接Short Call？",
        a: "Short Call: 无限风险，保证金高，max profit = premium。Bear Call Spread: 有限风险(max loss = width - credit)，保证金低，max profit = credit。虽然max profit更低，但风险可控，适合账户较小或风险厌恶的交易员。"
      },
      {
        q: "如何选择Bear Call Spread的strikes？",
        a: "Short call: 选择阻力位或认为价格不会突破的点，通常delta 0.30-0.40。Long call: 在short call上方，width决定max loss。Narrow spread(如$5)：max profit高但max loss也高。Wide spread(如$10)：max profit低但max loss大。通常选择width = 2-3倍credit。"
      },
      {
        q: "什么时候调整Bear Call Spread？",
        a: "1) 价格接近short call(如距离<10%)：roll up整个spread或roll out到下个月；2) 快速盈利(如赚到max profit的50-70%)：考虑提前平仓；3) 价格突破short call：可以roll up and out，或止损；4) 不要等到到期 - 最后一周Gamma风险大。"
      },
      {
        q: "Bear Call Spread vs Short Put，如何选择？",
        a: "Bear Call Spread: 看跌策略，收credit，max profit有限。Short Put: 看涨策略，收credit，风险更大。如果看跌，用Bear Call Spread；如果温和看涨或想低价接货，用Short Put。Bear Call Spread更适合明确看跌，Short Put更适合收租或想持股。"
      }
    ]
  },

  // Short Strangle - 卖出宽跨式
  "short-strangle": {
    exposure: {
      directional: "~0 Delta (OTM call和put的delta部分抵消)",
      volatility: "-Vega (做空波动率)",
      time: "+Theta (时间衰减是朋友)",
      convexity: "-Gamma (负凸性，但比short straddle小)"
    },

    profitLogic: {
      makesMoneyFrom: "价格停在两个strike之间 + 时间衰减 + IV下跌",
      losesMoneyFrom: "价格突破任一strike + IV上升",
      bestMarketCondition: "高IV环境开仓，随后IV回落，价格区间震荡",
      worstScenario: "突发事件导致价格跳空突破strike，IV飙升"
    },

    clientPerspective: {
      whyClientDoes: [
        "预期标的会在区间内震荡",
        "比short straddle更保守的收租策略",
        "赚取OTM期权的时间价值和IV溢价",
        "定期收入策略(如每月卖strangle)"
      ],
      clientType: "专业期权交易员、收租策略投资者、有风险管理的散户",
      suitability: "理解无限风险、有足够保证金、能监控、有止损纪律"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer卖出Short Strangle给客户(即Dealer买入strangle)：",
      exposure: "Dealer long OTM call + long OTM put，long gamma, long vega, short theta",
      hedging: [
        "Dealer是long gamma，但因为OTM，gamma较小",
        "Delta hedge：根据net delta调整股票仓位",
        "如果realized vol > implied vol，Dealer可以盈利",
        "Short strangle对Dealer来说是好产品 - 客户承担主要风险"
      ],
      profitSource: "Bid-ask价差 + 如果realized vol > implied vol"
    },

    interviewQuestions: [
      {
        q: "Short Strangle和Short Straddle有什么区别？",
        a: "Short Strangle: strikes分开(OTM)，profit zone更宽，max profit更低，风险稍小。Short Straddle: strikes都在ATM，profit zone更窄，max profit更高，风险更大。Strangle更适合保守交易员，Straddle更aggressive。"
      },
      {
        q: "如何选择Short Strangle的strikes？",
        a: "通常选择delta 0.20-0.30的OTM期权。例如：16 delta call和16 delta put，理论上有68%概率两个都到期OTM。更aggressive：选择delta 0.30(更接近ATM)，max profit更高但风险更大。更保守：选择delta 0.10-0.15(更远OTM)，max profit更低但profit zone更宽。"
      },
      {
        q: "Short Strangle的保证金要求是多少？",
        a: "Reg-T: 两个naked short中较大的一个(通常是short put，因为equity put skew) + 另一个的premium。Portfolio Margin: 基于stress test，通常比Reg-T低20-40%。具体数字高度依赖于broker、spot price、strikes、IV、账户类型。这是broker-specific，无法给出通用公式。教育性估算：可能是strike价值的15-25%，但实际请咨询broker。"
      },
      {
        q: "什么时候调整Short Strangle？",
        a: "1) 价格接近任一strike(如距离<5%)：roll strike away或convert to iron strangle；2) IV飙升：考虑平仓止损；3) 时间衰减加速(最后2周)：可以close获利或roll到下个月；4) Delta失衡：调整一侧strike保持中性。不要等到被突破才调整。"
      },
      {
        q: "Short Strangle vs Iron Condor，如何选择？",
        a: "Short Strangle: 无限风险，保证金高，max profit高，适合有经验的交易员。Iron Condor: 有限风险(有long wings保护)，保证金低，max profit低，适合保守交易员。如果账户小或风险承受力低，用Iron Condor；如果账户大且有经验，Short Strangle的risk/reward更好。"
      }
    ]
  },

  // Short Straddle - 卖出跨式
  "short-straddle": {
    exposure: {
      directional: "0 Delta (ATM call和put的delta抵消)",
      volatility: "-Vega (做空波动率，IV下跌盈利)",
      time: "+Theta (时间衰减是朋友，ATM期权Theta最高)",
      convexity: "-Gamma (负凸性，价格大幅波动快速亏损)"
    },

    profitLogic: {
      makesMoneyFrom: "价格停在ATM + 时间衰减 + IV下跌",
      losesMoneyFrom: "价格大幅偏离ATM(任何方向) + IV上升",
      bestMarketCondition: "高IV环境开仓，随后IV崩溃，价格横盘",
      worstScenario: "突发事件导致价格跳空，IV飙升，理论上无限亏损"
    },

    clientPerspective: {
      whyClientDoes: [
        "预期标的会横盘不动(如重要支撑/阻力位)",
        "财报后IV crush交易(预期价格反应平淡)",
        "赚取ATM期权的最高时间价值和IV溢价",
        "专业交易员的高风险高收益策略"
      ],
      clientType: "专业期权交易员、做市商、对冲基金(有严格风险管理)",
      suitability: "理解无限风险、有足够保证金、能24/7监控、有止损纪律"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer卖出Short Straddle给客户(即Dealer买入straddle)：",
      exposure: "Dealer long ATM call + long ATM put，这是long gamma, long vega, short theta",
      hedging: [
        "Dealer是long gamma，这是好的 - 可以通过gamma scalping盈利",
        "Dealer delta hedge：卖空股票对冲call的delta，买入股票对冲put的delta",
        "如果realized vol > implied vol，Dealer通过rehedging盈利",
        "Short straddle对Dealer来说是理想产品 - 客户承担无限风险"
      ],
      profitSource: "Bid-ask价差 + 如果realized vol > implied vol(gamma scalping profit)"
    },

    interviewQuestions: [
      {
        q: "Short Straddle的最大风险是什么？",
        a: "理论上无限亏损 - 如果价格大幅上涨，short call亏损无限；如果价格大幅下跌，short put亏损巨大(到零)。而且是naked short，保证金要求高。最危险的是gap risk - 价格跳空，无法及时止损。这是为什么只有专业交易员才做short straddle。"
      },
      {
        q: "Short Straddle和Short Strangle有什么区别？",
        a: "Short Straddle: strikes都在ATM，max profit更高，但profit zone更窄，风险更大。Short Strangle: strikes分开(OTM call和OTM put)，max profit更低，但profit zone更宽，风险稍小。Straddle更aggressive，Strangle更保守。"
      },
      {
        q: "什么时候做Short Straddle最合适？",
        a: "1) IV rank非常高(>80)，IV溢价明显；2) 预期价格会横盘(如重要技术位、财报后无surprise)；3) 有能力24/7监控和快速止损；4) 账户有足够保证金承受波动。不适合：低IV环境、重大事件前、无法监控时。"
      },
      {
        q: "如何管理Short Straddle的风险？",
        a: "1) 止损：如果亏损超过max profit的2-3倍，立即平仓；2) Delta hedge：保持delta中性，避免方向性风险；3) 转换：如果价格突破，convert to iron butterfly(买入wings)限制亏损；4) 时间管理：不要hold到最后一周，Gamma风险太大；5) Position sizing：不要超过账户的5-10%。"
      },
      {
        q: "Dealer为什么喜欢客户做Short Straddle？",
        a: "因为Dealer是对手方 - long straddle，这是long gamma position。如果realized vol高，Dealer可以通过gamma scalping(动态delta hedge)盈利。而且客户承担无限风险，Dealer风险有限(最多亏掉收到的premium)。Short straddle是Dealer最喜欢的客户交易之一。"
      }
    ]
  },

  // Collar - 领口策略
  "collar": {
    exposure: {
      directional: "~+Delta (持股 + protective put - covered call，略减少)",
      volatility: "~0 Vega (long put和short call的Vega部分抵消)",
      time: "~0 Theta (long put的负Theta被short call的正Theta抵消)",
      convexity: "有限上行和下行(类似bull call spread但基于持股)"
    },

    profitLogic: {
      makesMoneyFrom: "股票在put strike和call strike之间上涨",
      losesMoneyFrom: "股票跌破put strike(但亏损有限) 或 涨破call strike(上行被封顶)",
      bestMarketCondition: "温和上涨，停在call strike附近",
      worstScenario: "大幅上涨突破call strike，错过大部分上行"
    },

    clientPerspective: {
      whyClientDoes: [
        "持有股票但担心下跌，又不想支付protective put的全部成本",
        "用卖call的收入支付买put的成本(zero-cost或low-cost collar)",
        "锁定利润区间，适合已有盈利的持仓",
        "税务原因不能卖出，但需要限制风险",
        "机构portfolio保护的标准做法"
      ],
      clientType: "长期投资者、机构、高净值个人、公司高管(锁定股票收益)",
      suitability: "持有股票、能接受上行被封顶、想要低成本或零成本保护"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer面对Collar客户(客户买put卖call)，Dealer是：",
      exposure: "卖put给客户(Dealer +delta) + 买call从客户(Dealer +delta)，Dealer整体long delta",
      hedging: [
        "Dealer需要卖空股票对冲long delta",
        "Put和Call的Greeks部分抵消，net exposure较小",
        "如果是zero-cost collar，put和call的premium相等，Dealer主要赚bid-ask",
        "Collar对Dealer来说是相对简单的产品，风险可控"
      ],
      profitSource: "Bid-ask价差(put和call各收一次) + skew(put通常比call贵)"
    },

    interviewQuestions: [
      {
        q: "Collar和Protective Put有什么区别？",
        a: "Protective Put: 保留全部上行，但有成本(put premium)。Collar: 卖call支付put成本，zero-cost或low-cost，但上行被封顶在call strike。选择取决于：如果认为上行有限或想降低成本，用Collar；如果想保留上行潜力，用Protective Put。"
      },
      {
        q: "如何构建zero-cost collar？",
        a: "选择put strike(下行保护点)，然后调整call strike直到call premium = put premium。通常call strike会比较接近当前价格(如5% OTM)，put strike较远(如10% OTM)。如果想要更多下行保护(put strike更高)，就要接受更低的call strike(更早被封顶)。"
      },
      {
        q: "Collar适合什么市场环境？",
        a: "1) 高IV环境：put和call都贵，容易构建zero-cost collar；2) 不确定方向但想限制风险；3) 已有盈利想锁定；4) 预期温和上涨但担心下跌。不适合：低IV环境(难以zero-cost)、预期大幅上涨(会错过上行)。"
      },
      {
        q: "公司高管为什么常用Collar？",
        a: "高管持有大量公司股票，但有lock-up period或税务原因不能卖出。Collar可以：1) 锁定当前价值，避免股价暴跌；2) 保留部分上行(到call strike)；3) zero-cost，不需要额外资金；4) 不触发税务事件(没有卖出股票)。这是高管常用的风险管理工具。"
      },
      {
        q: "Collar的最大风险是什么？",
        a: "机会成本 - 如果股价大幅上涨，上行被call strike封顶，错过大部分收益。而且如果提前平仓collar，可能需要支付成本(Greeks变化导致put和call的价值不再相等)。另一个风险是assignment：short call可能被提前行权，尤其是分红前。"
      }
    ]
  },

  // Iron Butterfly - 铁蝴蝶
  "iron-butterfly": {
    exposure: {
      directional: "0 Delta (完全中性，ATM short straddle + OTM long wings)",
      volatility: "-Vega (做空波动率，比Iron Condor更aggressive)",
      time: "+Theta (时间衰减是朋友，peak theta at ATM)",
      convexity: "-Gamma (负凸性，价格大幅波动不利)"
    },

    profitLogic: {
      makesMoneyFrom: "价格停在ATM(short straddle strike) + 时间衰减 + IV下跌",
      losesMoneyFrom: "价格突破任一wing + IV上升 + 大幅波动",
      bestMarketCondition: "高IV环境开仓，随后IV崩溃，价格钉在ATM",
      worstScenario: "突发事件导致价格跳空突破wing，IV同时飙升"
    },

    clientPerspective: {
      whyClientDoes: [
        "预期标的会停在特定价格(如重要支撑/阻力位)",
        "财报后IV crush交易(预期价格不动但IV暴跌)",
        "比Iron Condor更aggressive的收租策略",
        "赚取ATM期权的最高时间价值"
      ],
      clientType: "专业期权交易员、做市商、高频IV交易者",
      suitability: "理解short gamma风险、能承受快速亏损、有风险管理纪律"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer卖出Iron Butterfly给客户后，面临：",
      exposure: "客户short ATM straddle + long wings，Dealer是对手方：long ATM straddle + short wings",
      hedging: [
        "Dealer实际上是long gamma(long ATM straddle)，这是好的",
        "但Dealer short wings，如果价格大幅波动到wings之外，Dealer亏损",
        "通常Dealer会hedge掉delta，保留gamma和vega exposure",
        "Iron Butterfly对Dealer来说是相对安全的产品(客户承担主要风险)"
      ],
      profitSource: "Bid-ask价差 + 如果客户在亏损时panic close"
    },

    interviewQuestions: [
      {
        q: "Iron Butterfly和Iron Condor有什么区别？",
        a: "Iron Butterfly: short strikes都在ATM，profit zone更窄，max profit更高，更aggressive。Iron Condor: short strikes分开(OTM call和OTM put)，profit zone更宽，max profit更低，更保守。Butterfly适合强烈认为价格不动；Condor适合认为价格在区间内。"
      },
      {
        q: "为什么Iron Butterfly的Theta比Iron Condor高？",
        a: "因为short strikes在ATM，ATM期权的时间价值最高，Theta也最高。Iron Condor的short strikes在OTM，时间价值较低。但Iron Butterfly的风险也更高 - ATM的Gamma最大，价格稍微偏离就快速亏损。"
      },
      {
        q: "什么时候用Iron Butterfly做IV crush交易？",
        a: "财报前：IV elevated，买入Iron Butterfly。财报后：如果价格没有大幅波动(符合预期)，IV崩溃，Iron Butterfly快速盈利。关键是：1) IV要足够高(IV rank > 70)；2) 预期财报结果不会surprise；3) 在财报当天或次日平仓，不要持有太久。"
      },
      {
        q: "Iron Butterfly的最大风险是什么？",
        a: "Gap risk - 如果价格跳空突破wing，亏损接近max loss。因为short strikes在ATM，任何方向的大幅波动都会快速亏损。而且Iron Butterfly的short gamma非常集中在ATM，需要频繁调整。不适合overnight hold在重大事件前。"
      },
      {
        q: "如何调整亏损的Iron Butterfly？",
        a: "1) 价格突破上方：roll up整个结构，或convert to call butterfly；2) 价格突破下方：roll down，或convert to put butterfly；3) IV飙升：可以close short straddle，保留long wings作为long strangle；4) 止损：如果亏损超过max profit的2-3倍，直接平仓。不要'希望'价格回来。"
      }
    ]
  },

  // Protective Put - 保护性看跌期权
  "protective-put": {
    exposure: {
      directional: "~+Delta (接近持股，略减少因为买Put)",
      volatility: "+Vega (买入Put带来正Vega)",
      time: "-Theta (Put的时间衰减)",
      convexity: "+Gamma (Put提供下行保护的凸性)"
    },

    profitLogic: {
      makesMoneyFrom: "股票上涨 - Put权利金成本",
      losesMoneyFrom: "股票下跌(但Put限制最大亏损) + Put权利金 + 时间衰减",
      bestMarketCondition: "温和上涨，Put不被触发但提供安心",
      worstScenario: "横盘不动，股票不涨不跌，Put权利金白付"
    },

    clientPerspective: {
      whyClientDoes: [
        "持有股票但担心短期下跌风险(财报、市场波动)",
        "不想卖出股票(税务、长期看好)但需要下行保护",
        "替代stop loss，避免被震出后错过反弹",
        "事件驱动保护(如持有科技股过财报季)"
      ],
      clientType: "长期投资者、机构portfolio保护、高净值个人",
      suitability: "持有股票、能承受保护成本、有明确风险事件或时间窗口"
    },

    dealerPerspective: {
      whenDealerSells: "Dealer卖出Protective Put(即卖Put给持股客户)后，面临：",
      exposure: "+Delta (多Delta，股价下跌亏损), -Gamma, -Vega, +Theta",
      hedging: [
        "Delta对冲：卖空股票对冲Put的short delta",
        "Gamma管理：股价下跌时Put的delta变得更负，需要继续卖空",
        "Vega风险：市场恐慌时Put的IV飙升，Dealer面临mark-to-market亏损",
        "Put skew：OTM put通常有skew溢价，Dealer可以赚取这部分"
      ],
      profitSource: "Bid-ask价差 + Put skew溢价 + 如果realized vol < implied vol"
    },

    interviewQuestions: [
      {
        q: "Protective Put和Stop Loss有什么区别？",
        a: "Protective Put: 1) 保留上行潜力，股价上涨仍能获利；2) 避免被gap down震出；3) 有确定的最大亏损；4) 有成本(权利金)。Stop Loss: 1) 触发后完全退出，错过反弹；2) gap down无法执行；3) 无前期成本；4) 可能被intraday波动触发。"
      },
      {
        q: "如何选择Protective Put的strike？",
        a: "取决于能接受的最大亏损。ATM put最贵但保护最全；5-10% OTM put便宜但有deductible；15-20% OTM put很便宜但只保护极端下跌。类比保险：高strike = 低免赔额高保费，低strike = 高免赔额低保费。"
      },
      {
        q: "Protective Put的成本如何计算？",
        a: "直接成本是Put权利金。机会成本是如果股价不跌，权利金就白付了。年化成本 = (权利金/股价) × (365/DTE)。例如：股价$100，买3个月95P花$3，年化成本约12%。这就是为什么长期持有者通常不用Protective Put - 太贵。"
      },
      {
        q: "什么时候用Protective Put最合适？",
        a: "1) 短期事件风险(财报、FDA批准、选举)；2) 市场波动加剧但长期看好；3) 已有大幅盈利想锁定；4) 税务原因不能卖出但需要保护；5) IV相对便宜时买入。不适合：长期保护(太贵)、已经大幅下跌后(马后炮)。"
      },
      {
        q: "Protective Put vs Collar，如何选择？",
        a: "Protective Put: 保留全部上行，但有成本。Collar: 卖出upside call来支付put成本，zero-cost或low-cost，但上行被封顶。选择取决于：如果认为上行有限，用Collar；如果想保留上行潜力且能承受成本，用Protective Put。"
      }
    ]
  },

  // Short Put - 卖出看跌期权
  "short-put": {
    exposure: {
      directional: "+Delta (标的上涨盈利)",
      volatility: "-Vega (做空波动率)",
      time: "+Theta (时间流逝是朋友)",
      convexity: "-Gamma (负凸性，方向不利时亏损加速)"
    },
    profitLogic: {
      makesMoneyFrom: "时间流逝 + IV下降 + 标的不跌或上涨。权利金是主要收益来源。",
      losesMoneyFrom: "标的暴跌 + IV飙升。亏损可能很大（向下到零）。",
      bestMarketCondition: "中性偏多，高IV环境卖出，IV从高位回落。",
      worstScenario: "标的崩盘式下跌，同时IV飙升，双重打击。"
    },
    clientPerspective: {
      whyClientDoes: [
        "想低价买入标的（如果被行权）= 变相限价单",
        "获取权利金收入（收租策略核心）",
        "认为标的不会跌破某价位",
        "Wheel Strategy 的第一步"
      ],
      clientType: "收入导向投资者、价值投资者（愿意在低价买入）、收租策略交易者",
      suitability: "愿意以行权价买入标的，有足够资金接货，不恐慌于短期下跌"
    },
    dealerPerspective: {
      whenDealerSells: "Dealer买入Short Put（客户卖出put）后，面临：",
      exposure: "+Delta (长Delta)，-Gamma (需要追卖对冲)，+Vega (IV上升盈利)，-Theta (时间流逝亏损)",
      hedging: [
        "Delta对冲：卖出Delta数量的股票",
        "Gamma管理：Dealer是long put = long gamma，需要在股价下跌时卖更多、上涨时买回",
        "Vega管理：Dealer long put = long vega，客户卖出put = short vega。Dealer通过bid-ask价差赚取vega溢价"
      ],
      profitSource: "Bid-ask价差 + Vega溢价（Dealer买入的IV低于卖给下一个客户的IV）"
    },
    interviewQuestions: [
      { q: "Short Put vs Covered Call，有什么区别？", a: "盈亏图完全相同（Put-Call Parity: S - P = C - K·e^(-rT)）。区别在于：Short Put用保证金、不持有股票；Covered Call持有股票+卖出call。实际选择取决于资金效率、保证金要求和税务。" },
      { q: "Short Put最大的风险是什么？", a: "尾事件风险：标的暴跌远超行权价。例如卖出$150 put，标的跌到$100。亏损$50 - 权利金。这种亏损远超权利金收入。需要严格止损或接受被行权。" },
      { q: "如何选择Short Put的行权价和DTE？", a: "行权价：Delta 20-30（约80-70%概率OTM到期）。DTE：30-45天，Theta decay加速期。关键是在权利金收入和接货意愿之间权衡。" },
      { q: "为什么说Short Put是'想低价买入'？", a: "卖出$145 put收$3权利金，如果被行权，实际成本=145-3=$142。这相当于设了一个$142的限价买单。如果本来就想在$142买入，这就是白赚权利金。" },
      { q: "Short Put被行权后怎么办？", a: "三个选项：1) 持有股票（如果看好长期）；2) 卖出Covered Call（转入Wheel Strategy第二步）；3) 立即卖出股票止损。关键是行权前就要想好plan B。" }
    ]
  },

  // Short Call - 卖出看涨期权
  "short-call": {
    exposure: {
      directional: "-Delta (标的下跌盈利)",
      volatility: "-Vega (做空波动率)",
      time: "+Theta (时间流逝是朋友)",
      convexity: "-Gamma (负凸性，上涨时亏损加速)"
    },
    profitLogic: {
      makesMoneyFrom: "时间流逝 + IV下降 + 标的不涨或下跌。",
      losesMoneyFrom: "标的暴涨 + IV飙升。理论上行亏损无限。",
      bestMarketCondition: "中性偏空，高IV，预期标的横盘或小幅下跌。",
      worstScenario: "标的暴涨远超行权价，short gamma导致Delta越来越负，亏损加速。"
    },
    clientPerspective: {
      whyClientDoes: [
        "获取权利金收入",
        "认为标的不会大涨",
        "Covered Call的组成部分",
        "价差策略的卖出腿"
      ],
      clientType: "有经验的交易者，通常作为价差的一部分而非裸卖",
      suitability: "裸卖call只适合极有经验的交易者。大多数人通过spread限制风险。"
    },
    dealerPerspective: {
      whenDealerSells: "Dealer买入Short Call（客户卖出call）后，面临：",
      exposure: "-Delta (短Delta)，-Gamma (追涨亏损)，+Vega (IV上升盈利)，-Theta (时间流逝亏损)",
      hedging: [
        "Delta对冲：买入股票来hedge短Delta",
        "Gamma管理：Dealer long call = long gamma，股价上涨时delta增加，自动'追涨'。但客户卖出call = short gamma"
      ],
      profitSource: "Bid-ask价差 + Vega/Skew溢价"
    },
    interviewQuestions: [
      { q: "Naked Call vs Call Spread，风险差异有多大？", a: "Naked Call理论亏损无限（标的可以无限上涨）。Call Spread最大亏损=spread width - credit。差异是灾难性的。大多数经纪商不允许零售客户裸卖call。" },
      { q: "Short Call的Gamma风险是什么？", a: "股价上涨→Delta变得更负→需要买更多股票对冲→股价继续涨→Delta继续变负→恶性循环。这就是'被Gamma碾压'。Short gamma是option seller最大的噩梦。" },
      { q: "什么情况下Short Call比买Put更好？", a: "1) 预期横盘而不是大跌时（Short Call赚Theta+IV跌，Long Put亏Theta+IV跌）；2) IV极高时卖出权利金更有吸引力；3) 作为价差或Covered Call的一部分。" },
      { q: "如何管理Short Call的尾事件风险？", a: "1) 永远不要裸卖（用spread限制风险）；2) 设止损（价格跌破某水平时平仓）；3) 控制仓位（单腿不超过账户2%）；4) 避免财报等事件前。" },
      { q: "为什么做市商可以裸卖Call而散户不行？", a: "做市商：1) 持续Delta对冲（不是裸卖后不管）；2) 组合层面管理（不是单腿赌方向）；3) 有资本和风控系统；4) 赚的是bid-ask和vol spread，不是方向性赌注。" }
    ]
  },

  // Calendar Put Spread - 日历看跌价差
  "calendar-put-spread": {
    exposure: {
      directional: "Delta接近中性（可通过调整strike偏向方向）",
      volatility: "+Vega (远月vega更大 → 做多波动率期限结构)",
      time: "+Theta on near month / -Theta on far month (net depends on structure)",
      convexity: "近月Gamma效应更强，远月较缓"
    },
    profitLogic: {
      makesMoneyFrom: "近月时间衰减快于远月 + 波动率期限结构变化 + 标的在近月行权价附近的微小移动",
      losesMoneyFrom: "标的远离行权价 + IV整体下降 + 近远月IV差收窄",
      bestMarketCondition: "预期标的短期横盘、近月时间价值快速衰减，远月保留价值",
      worstScenario: "标的在近月到期前大幅移动，两个期权的内在价值差异缩小"
    },
    clientPerspective: {
      whyClientDoes: [
        "认为近月IV被高估（相对远月）",
        "想从时间衰减差异中获利",
        "比单一方向性put风险更低",
        "日历价差是理解波动率期限结构的基础"
      ],
      clientType: "中级以上交易者，理解波动率期限结构",
      suitability: "需要理解近远月IV关系和时间衰减差异"
    },
    dealerPerspective: {
      whenDealerSells: "Dealer对冲Calendar Put Spread时关注：",
      exposure: "Vega集中在远月，Gamma集中在近月。需要用不同工具管理不同月份的风险。",
      hedging: ["近月Gamma用标的对冲（频率高）", "远月Vega用其他远月期权对冲", "监视近远月IV差的变化"],
      profitSource: "Volatility term structure mispricing"
    },
    interviewQuestions: [
      { q: "Calendar Spread赚钱的核心逻辑是什么？", a: "三个来源：1) 时间衰减差异（近月Theta > 远月Theta，net positive）；2) 波动率期限结构变化；3) 如果标的在近月到期时接近strike，近月归零但远月仍有时间价值。" },
      { q: "Calendar vs Diagonal Spread的区别？", a: "Calendar: 同strike不同DTE。Diagonal: 不同strike不同DTE。Diagonal多了一个strike维度，可以做方向性倾斜+时间衰减。" },
      { q: "什么时候Calendar Spread会亏钱？", a: "1) 标的剧烈移动远离strike；2) IV整体大幅下降（远月vega损失>近月vega收益）；3) 近远月IV差收窄（contango变backwardation）。" }
    ]
  },

  // Diagonal Call Spread - 对角看涨价差
  "diagonal-call-spread": {
    exposure: {
      directional: "+Delta (通常——远月/strike选择可调整方向)",
      volatility: "远月Vega > 近月Vega（净做多波动率）",
      time: "近月Theta衰减 > 远月Theta衰减（净赚时间价值）",
      convexity: "近月Gamma更强，提供短期凸性保护"
    },
    profitLogic: {
      makesMoneyFrom: "时间流逝（近月快于远月）+ 标的温和上涨 + IV期限结构有利",
      losesMoneyFrom: "标的下跌 + IV整体崩塌 + 近远月IV差压缩",
      bestMarketCondition: "温和看涨，近月IV偏高，预期标的缓慢上行",
      worstScenario: "标的下跌，近月IV spike而远月不动（calendar risk反转）"
    },
    clientPerspective: {
      whyClientDoes: [
        "比直接Long Call资金效率更高（有近月short leg补贴）",
        "Poor Man's Covered Call的逻辑基础",
        "看涨但不想全额付远月权利金"
      ],
      clientType: "方向性看涨但想降低成本的中级交易者",
      suitability: "理解calendar spread原理+方向性判断"
    },
    dealerPerspective: {
      whenDealerSells: "Diagonal spread的Delta/Vega/Gamma分布在两个不同月份：",
      exposure: "Delta和Gamma主要来自近月（因为近月gamma更大），Vega主要来自远月",
      hedging: ["Delta对冲要考虑两个leg的综合Delta", "近月Gamma风险更大，需要更高频对冲"],
      profitSource: "为客户提供杠杆化方向表达时收取的spread"
    },
    interviewQuestions: [
      { q: "Diagonal Call Spread和Poor Man's Covered Call的关系？", a: "Poor Man's Covered Call就是Diagonal Call Spread的一个特例：买远月ITM call（delta~0.8-0.9，模拟股票）+ 卖近月OTM call。因为有远月deep ITM call替代持股，所以叫'穷人的Covered Call'。" },
      { q: "选择strike时有什么考虑？", a: "远月leg：Delta越高越像持股（但成本高），越低越像裸买call。近月leg：strike越接近远月strike，最大盈利空间越小但credit越大。需要权衡credit收入vs上行空间。" }
    ]
  },

  // Diagonal Put Spread - 对角看跌价差
  "diagonal-put-spread": {
    exposure: {
      directional: "-Delta (看跌)",
      volatility: "远月Vega > 近月Vega (净做多波动率)",
      time: "近月Theta > 远月Theta (净正Theta)",
      convexity: "近月Gamma提供下行保护"
    },
    profitLogic: {
      makesMoneyFrom: "时间衰减差异 + 标的温和下跌 + IV期限结构有利",
      losesMoneyFrom: "标的上涨 + IV崩塌",
      bestMarketCondition: "温和看跌，高IV环境",
      worstScenario: "标的上涨，IV下降，双重不利"
    },
    clientPerspective: {
      whyClientDoes: [
        "比直接Long Put成本更低",
        "看跌但想降低时间衰减成本",
        "利用波动率期限结构获利"
      ],
      clientType: "温和看跌的中级交易者",
      suitability: "需要同时判断方向和波动率期限结构"
    },
    dealerPerspective: {
      whenDealerSells: "与Diagonal Call对称，但方向相反",
      exposure: "-Delta + +Vega (远月主导) + +Gamma (近月主导)",
      hedging: ["Delta对冲（买入股票）", "监视近远月波动率差"],
      profitSource: "客户的方向性和波动率观点在spread中体现，Dealer从spread中获利"
    },
    interviewQuestions: [
      { q: "Diagonal Put Spread vs Calendar Put Spread？", a: "Diagonal多了一个strike维度：Diagonal可以做方向性倾斜。Calendar是同strike，纯时间/波动率交易。Diagonal更适合有方向性观点的场景。" }
    ]
  },

  // Wheel Strategy - 轮转策略
  "wheel-strategy": {
    exposure: {
      directional: "+Delta (两个阶段都暴露于上涨)",
      volatility: "第一阶段Short Put: -Vega；第二阶段Covered Call: -Vega",
      time: "两个阶段都是+Theta",
      convexity: "两个阶段都是-Gamma"
    },
    profitLogic: {
      makesMoneyFrom: "Short Put的权利金 + Covered Call的权利金 + 可能的股票增值",
      losesMoneyFrom: "标的持续下跌（被行权买入后股票贬值）+ 标的暴涨（Covered Call封顶）",
      bestMarketCondition: "温和牛市或震荡市，IV中等偏高",
      worstScenario: "标的持续阴跌——被行权后继续跌，Covered Call权利金不够弥补股票亏损"
    },
    clientPerspective: {
      whyClientDoes: [
        "系统性的收租策略，重复执行",
        "不追求timing the market，靠概率和重复获利",
        "适合有耐心、愿意长期持有的投资者"
      ],
      clientType: "收入导向零售交易者、退休账户策略",
      suitability: "选择你愿意长期持有的标的，不要在垃圾股上做Wheel"
    },
    dealerPerspective: {
      whenDealerSells: "Wheel是纯客户侧策略。Dealer在这个策略的另一侧：",
      exposure: "客户不断卖出put和call → Dealer不断买入 → Dealer是long gamma/long vega侧",
      hedging: ["Delta对冲客户的每笔put/call", "累积的short vega需要管理"],
      profitSource: "Bid-ask spread（每轮客户都要交易）"
    },
    interviewQuestions: [
      { q: "Wheel Strategy为什么受散户欢迎？", a: "1) 逻辑简单：卖put收租→被行权→卖call收租→被call走→重复；2) 不需要精准timing；3) 持续现金流（每月/每轮收权利金）；4) 比直接买股票心理压力小。" },
      { q: "Wheel Strategy的致命弱点？", a: "1) 标的持续下跌：被行权后股票浮亏，covered call的权利金不够弥补；2) 牛市踏空：股票被call走，错过后续大涨；3) 频繁交易成本。Tastytrade研究：选择基本面好的标的+坚持纪律，长期期望值为正。" },
      { q: "Wheel vs Buy and Hold？", a: "震荡/温和牛市：Wheel更优（持续收租）。单边大牛：Buy-and-Hold更优（Wheel会提前被call走踏空）。单边大熊：两者都亏，但Wheel有权利金缓冲。关键在于市场环境。" }
    ]
  },

  // Poor Man's Covered Call - 穷人的备兑看涨
  "poor-man-s-covered-call": {
    exposure: {
      directional: "+Delta (远月ITM call delta 0.7-0.9)",
      volatility: "+Vega (远月) - Vega (近月) → 通常净做多Vega",
      time: "+Theta (近月) - Theta (远月) → 通常净正Theta",
      convexity: "远月leg有Gamma，近月leg有Gamma（但近月更大）"
    },
    profitLogic: {
      makesMoneyFrom: "标的温和上涨 + 近月时间衰减 + 远月期权增值",
      losesMoneyFrom: "标的下跌（远月ITM call贬值）+ IV崩塌 + 暴涨（近月short call封顶）",
      bestMarketCondition: "温和上涨、预期标的不会超过近月short strike",
      worstScenario: "标的暴跌（远月ITM call深度亏损）或暴涨突破short strike（利润被限定）"
    },
    clientPerspective: {
      whyClientDoes: [
        "用更少资金模拟Covered Call（不用买入100股）",
        "利用远月期权替代持股",
        "小资金账户也能做收租策略"
      ],
      clientType: "资金有限、想降低capital requirement的零售交易者",
      suitability: "需要深刻理解Diagonal spread和杠杆风险"
    },
    dealerPerspective: {
      whenDealerSells: "两个calendar legs的Delta/Gamma在不同月份：",
      exposure: "Delta net通常正但小于1.0。Gamma sign取决于远近月leg的net。",
      hedging: ["两个月份的Delta分别hedge", "近月Gamma风险更大"],
      profitSource: "两个leg的bid-ask + 客户的方向性观点mispricing"
    },
    interviewQuestions: [
      { q: "Poor Man's Covered Call vs 传统Covered Call？", a: "传统CC：买100股+卖call。资金需求=100×股价-权利金。PMCC：买远月ITM call+卖近月OTM call。资金需求=远月call成本-近月权利金。PMCC资金效率高（可能只需20-30%的资金），但多了远月期权的时间衰减风险。" },
      { q: "PMCC的strike选择有什么讲究？", a: "远月leg：选ITM越多delta越高（越像持股），但extrinsic value越低效率越差。通常选delta 0.7-0.85的ITM call。近月leg：strike要高于远月strike（否则是倒挂），且要确保credit能补偿远月的时间衰减。" }
    ]
  },

  // Jade Lizard - 翡翠蜥蜴
  "jade-lizard": {
    exposure: {
      directional: "中性偏多（结构有净credit）",
      volatility: "-Vega (做空波动率)",
      time: "+Theta",
      convexity: "-Gamma (负凸性)"
    },
    profitLogic: {
      makesMoneyFrom: "时间流逝 + IV下降 + 标的在short strikes之间",
      losesMoneyFrom: "标的跌破put spread的long strike或暴涨突破naked call",
      bestMarketCondition: "震荡或温和上涨，IV偏高的环境",
      worstScenario: "标的暴跌（put spread全额亏损）"
    },
    clientPerspective: {
      whyClientDoes: [
        "Tastytrade推广的高胜率收租策略",
        "下行保护（有put spread），上行不要保护（裸call取更高credit）",
        "在标的温和上涨时没有上行封顶（naked call端）"
      ],
      clientType: "Tastytrade流派的收租交易者",
      suitability: "需要承受naked call的无限风险（虽然概率低）"
    },
    dealerPerspective: {
      whenDealerSells: "Jade Lizard = Short Put Spread + Short Naked Call",
      exposure: "Short gamma集中在两个short strikes附近",
      hedging: ["整体Delta管理", "Put spread侧的Gamma比naked call侧更危险（下行风险更大）"],
      profitSource: "三腿的bid-ask汇总"
    },
    interviewQuestions: [
      { q: "Jade Lizard和Iron Condor的区别？", a: "Jade Lizard是3腿（short put spread + naked call），Iron Condor是4腿（两个spreads）。Jade Lizard的上行是裸的（更大风险、更高credit），Iron Condor上下都被保护。" },
      { q: "Jade Lizard的上行风险怎么管理？", a: "1) 选delta足够低的call strike（如delta 10-15）；2) 设止损（标的突破某价位时买入call对冲）；3) 只在波动率足够高时卖出（credit够大才能补偿裸call风险）。" }
    ]
  },

  // Long Call Condor - 买入看涨鹰式价差
  "long-call-condor": {
    exposure: {
      directional: "中性（四个strikes对称分布）",
      volatility: "+Vega (买入翅膀，做多波动率)",
      time: "-Theta (四个leg，时间衰减成本高)",
      convexity: "正Gamma在strikes附近"
    },
    profitLogic: {
      makesMoneyFrom: "标的在某个strike区间之外大幅移动 + IV上升",
      losesMoneyFrom: "标的横盘不动（四腿theta侵蚀）+ IV下降",
      bestMarketCondition: "预期大波动但不确定方向，IV低时买入",
      worstScenario: "标的完全不动，所有时间价值耗尽"
    },
    clientPerspective: {
      whyClientDoes: [
        "比Straddle更便宜的大波动策略",
        "定义的亏损（四个leg都是有限风险）",
        "比裸买straddle更精确（可以定制盈利区间）"
      ],
      clientType: "想买波动率但不想付straddle高价的交易者",
      suitability: "IV必须够低，否则四腿的theta和bid-ask成本太高"
    },
    dealerPerspective: {
      whenDealerSells: "客户买入long condor = Dealer卖出四腿：",
      exposure: "Short vega, short gamma (Dealer承担尾部风险)",
      hedging: ["四腿的净Greeks汇总hedge", "Wing的gamma风险需管理"],
      profitSource: "四腿的spread汇总 + 客户对vol的错误定价"
    },
    interviewQuestions: [
      { q: "Long Call Condor和Iron Condor的区别？", a: "名字容易混淆。Long Call Condor = 买波动率（期望突破），等距的四个call strikes。Iron Condor = 卖波动率（期望横盘），Short Put Spread + Short Call Spread。两者结构完全相反。" },
      { q: "Condor vs Butterfly的核心区别？", a: "Butterfly的body是同一个strike（3个strikes），Condor的body是两个相邻strikes（4个strikes）。Condor的盈利平台更宽（两个body strikes之间的区域），但credit/cost更低。" }
    ]
  },

  // Long Put Condor - 买入看跌鹰式价差
  "long-put-condor": {
    exposure: {
      directional: "中性",
      volatility: "+Vega (做多波动率)",
      time: "-Theta",
      convexity: "正Gamma，strikes附近凸性"
    },
    profitLogic: {
      makesMoneyFrom: "标的突破condor范围 + IV上升",
      losesMoneyFrom: "横盘 + IV下降 + 时间流逝",
      bestMarketCondition: "预期大波动，IV低位",
      worstScenario: "标的在condor body范围内不动"
    },
    clientPerspective: {
      whyClientDoes: [
        "用put侧构建的波动率买入策略",
        "与call condor对称",
        "适合有put skew的市场（put wing更便宜）"
      ],
      clientType: "大波动预期的交易者",
      suitability: "注意put skew对各个leg定价的影响"
    },
    dealerPerspective: {
      whenDealerSells: "与Call Condor对称，在put侧。",
      exposure: "Short vega/short gamma",
      hedging: ["Put skew使得不同strike的IV不同 → 对冲时要考虑skew"],
      profitSource: "Put skew带来的额外spread"
    },
    interviewQuestions: [
      { q: "Put Condor vs Call Condor，在有put skew的市场中哪个更便宜？", a: "通常在equity市场（put skew），Put Condor的wing更便宜（因为OTM put IV更高 → 买wing反而划算）。但body strikes的IV差异也需要考虑。" }
    ]
  },

  // Inverse Iron Condor - 逆向铁鹰
  "inverse-iron-condor": {
    exposure: {
      directional: "中性",
      volatility: "+Vega (买翅膀，做多波动率)",
      time: "-Theta",
      convexity: "+Gamma (正凸性)"
    },
    profitLogic: {
      makesMoneyFrom: "标的突破Iron Condor区间 + IV大幅上升",
      losesMoneyFrom: "横盘不动 + IV下降 + 时间流逝",
      bestMarketCondition: "低IV买入，等待波动爆发",
      worstScenario: "市场安静横盘，IV持续下降"
    },
    clientPerspective: {
      whyClientDoes: [
        "比Straddle便宜的波动率买入方式",
        "有限亏损（四个leg都有限）",
        "预期有catalyst但不确定方向"
      ],
      clientType: "想买波动率但预算有限的交易者",
      suitability: "需要IV够低才能有好的盈亏比"
    },
    dealerPerspective: {
      whenDealerSells: "客户买入inverse iron condor = Dealer卖出四腿 → short gamma + short vega",
      exposure: "承担tail risk（客户在极端波动时盈利）",
      hedging: ["Delta hedge四腿净暴露", "Tail risk需要特别注意"],
      profitSource: "通常交易量小，spread较宽"
    },
    interviewQuestions: [
      { q: "Inverse Iron Condor什么时候比Straddle更好？", a: "1) 你觉得波动会大但不够大到cover straddle的成本时；2) 想精确限定风险（straddle+两翼保护=max loss defined）。代价是最大盈利有上限（straddle理论无限）。" }
    ]
  },

  // Inverse Iron Butterfly - 逆向铁蝶
  "inverse-iron-butterfly": {
    exposure: {
      directional: "中性",
      volatility: "+Vega (做多波动率)",
      time: "-Theta",
      convexity: "+Gamma"
    },
    profitLogic: {
      makesMoneyFrom: "标的突破butterfly的body区域 + IV上升",
      losesMoneyFrom: "标的精确停在body strike(s) + IV下降",
      bestMarketCondition: "低IV买入，预期大幅移动",
      worstScenario: "标的不动"
    },
    clientPerspective: {
      whyClientDoes: [
        "比裸straddle更便宜（有wing保护降低了成本）",
        "定义的亏损",
        "预期catalyst事件"
      ],
      clientType: "事件驱动交易者",
      suitability: "IV必须低。不要在高IV环境买入inverse butterfly。"
    },
    dealerPerspective: {
      whenDealerSells: "客户买入 = Dealer卖出 → short gamma/short vega",
      exposure: "如果事件发生导致大波动，Dealer亏损",
      hedging: ["在事件前可能需要提前hedge或调整价格"],
      profitSource: "事件前后的IV spread"
    },
    interviewQuestions: [
      { q: "Inverse Iron Butterfly和Inverse Iron Condor的区别？", a: "Butterfly的body是一个strike（3个strikes架构），Condor的body是两个strikes（4个strikes）。Butterfly更精确（盈利区间窄），但成本也更低。" }
    ]
  },

  // Short Call Butterfly - 卖出看涨蝶式
  "short-call-butterfly": {
    exposure: {
      directional: "中性",
      volatility: "-Vega (做空波动率)",
      time: "+Theta",
      convexity: "-Gamma (负凸性)"
    },
    profitLogic: {
      makesMoneyFrom: "时间流逝 + 标的区间震荡",
      losesMoneyFrom: "标的突破butterfly范围",
      bestMarketCondition: "区间震荡，IV下降",
      worstScenario: "标的突破wing strikes"
    },
    clientPerspective: {
      whyClientDoes: [
        "收租金（short body，long wings保护）",
        "比short straddle风险更低（有wing保护）",
        "预期标的在body附近小幅波动"
      ],
      clientType: "区间交易者",
      suitability: "理解butterfly的pin risk"
    },
    dealerPerspective: {
      whenDealerSells: "客户卖出butterfly = Dealer买入 → long gamma/long vega",
      exposure: "Body strike的gamma集中",
      hedging: ["在body附近频繁Delta对冲"],
      profitSource: "客户对波动率的误判"
    },
    interviewQuestions: [
      { q: "Short Butterfly vs Iron Butterfly？", a: "Short Butterfly是call-only或put-only的三腿结构。Iron Butterfly用call+put构建（四腿）。Short Butterfly更简单但可能不对称。Iron Butterfly更干净对称。" }
    ]
  },

  // Short Put Butterfly - 卖出看跌蝶式
  "short-put-butterfly": {
    exposure: {
      directional: "中性",
      volatility: "-Vega",
      time: "+Theta",
      convexity: "-Gamma"
    },
    profitLogic: {
      makesMoneyFrom: "标的在body strike附近 + 时间流逝",
      losesMoneyFrom: "标的突破",
      bestMarketCondition: "区间震荡",
      worstScenario: "标的远离body"
    },
    clientPerspective: {
      whyClientDoes: [
        "与short call butterfly对称，用put侧构建",
        "在put skew环境中可能定价更有利"
      ],
      clientType: "区间交易者",
      suitability: "理解skew对put侧定价的影响"
    },
    dealerPerspective: {
      whenDealerSells: "与call butterfly对称",
      exposure: "Put skew影响各个strike的IV → Greeks不对称",
      hedging: ["考虑put skew的Delta hedge调整"],
      profitSource: "Skew带来的额外利润"
    },
    interviewQuestions: [
      { q: "Short Put Butterfly vs Short Call Butterfly？", a: "理论盈亏相同（如果有Put-Call Parity），但实践中put skew可能使得put侧更便宜（或更贵）。在equity市场（put skew大），put butterfly的wing可能更贵，影响定价。" }
    ]
  },

  // Call Ratio Backspread - 看涨比率反向价差
  "call-ratio-backspread": {
    exposure: {
      directional: "+Delta (bullish bias)",
      volatility: "+Vega (net long options → long vega)",
      time: "-Theta (net long → time decay cost)",
      convexity: "+Gamma (net long → 正凸性)"
    },
    profitLogic: {
      makesMoneyFrom: "标的暴涨 + IV上升。盈利潜力无限（long calls > short calls）",
      losesMoneyFrom: "标的横盘或小幅上涨（short ATM call亏损 + long OTM calls吃theta）",
      bestMarketCondition: "低IV买入，预期有极端上行",
      worstScenario: "标的在小幅上涨区间横盘（最大亏损点）"
    },
    clientPerspective: {
      whyClientDoes: [
        "强烈看涨但想降低净成本（通过卖出ATM call补贴）",
        "预期有大的上行catalyst",
        "比直接买call更便宜（但有小幅上涨的亏损区间）"
      ],
      clientType: "激进看涨的交易者",
      suitability: "需要对大幅上涨有强烈信心。如果判断错（标的横盘），亏损可能比裸买call更大。"
    },
    dealerPerspective: {
      whenDealerSells: "客户做Call Ratio Backspread = Short 1 ATM call + Long 2 OTM calls",
      exposure: "Net long gamma (long calls > short call)",
      hedging: ["Gamma集中在OTM strikes附近", "Delta hedge需要考虑ratio"],
      profitSource: "客户对波动率和方向的联合判断"
    },
    interviewQuestions: [
      { q: "Ratio Backspread的精髓是什么？", a: "用ratio（如1:2）来创造'免费'杠杆：卖1个ATM call获得credit，买2个OTM calls。如果标的暴涨，2个long calls跑赢1个short call。如果标的下跌，net credit提供了缓冲。但如果在short strike附近小幅上涨，short call亏但long calls还没赚——这是最大亏损区。" },
      { q: "如何选择ratio？", a: "1:2（标准）：卖1买2，需要较大涨幅才能盈利。1:3：更激进，更大杠杆。1:1.5：较保守。关键是要算好在哪个价格开始盈利。Zero-cost backspread是理想状态：short leg的credit完全cover long legs的成本。" }
    ]
  },

  // Put Ratio Backspread - 看跌比率反向价差
  "put-ratio-backspread": {
    exposure: {
      directional: "-Delta (bearish bias)",
      volatility: "+Vega",
      time: "-Theta",
      convexity: "+Gamma"
    },
    profitLogic: {
      makesMoneyFrom: "标的暴跌 + IV飙升。盈利潜力大（long puts > short put）",
      losesMoneyFrom: "横盘或小幅下跌（最大亏损区）",
      bestMarketCondition: "低IV买入，预期黑天鹅事件",
      worstScenario: "标的在short strike附近波动"
    },
    clientPerspective: {
      whyClientDoes: [
        "强烈看跌但降低成本",
        "预期有下行catalyst",
        "正Gamma在暴跌时加速盈利"
      ],
      clientType: "激进看跌的交易者",
      suitability: "在put skew环境中，long puts更贵，需要更强的下跌幅度来break even"
    },
    dealerPerspective: {
      whenDealerSells: "客户做Put Ratio Backspread = Short 1 ATM put + Long 2 OTM puts",
      exposure: "Net long gamma, long vega",
      hedging: ["Put skew使得OTM puts更贵 → backspread成本更高"],
      profitSource: "Put skew溢价"
    },
    interviewQuestions: [
      { q: "Put Ratio Backspread vs 直接买Put？", a: "Backspread便宜（short ATM put补贴），但有最大亏损区（标的停在short strike附近）。裸买Put没有亏损区但成本更高。选择取决于：你对'会有大跌'vs'不会不大不小'的判断。" }
    ]
  },

  // Strip - 条式价差
  "strip": {
    exposure: {
      directional: "-Delta (bearish bias —— 2 puts vs 1 call)",
      volatility: "+Vega (做多波动率)",
      time: "-Theta",
      convexity: "+Gamma"
    },
    profitLogic: {
      makesMoneyFrom: "标的剧烈移动（特别是下跌——2 puts使得下行盈利更大）",
      losesMoneyFrom: "标的横盘（三腿theta侵蚀）",
      bestMarketCondition: "预期大波动，偏向下行风险更大。IV低时买入。",
      worstScenario: "标的不动"
    },
    clientPerspective: {
      whyClientDoes: [
        "比Straddle更偏下行（2:1 put:call ratio）",
        "预期波动率会很高且下行风险更大",
        "对下行有不对称保护"
      ],
      clientType: "预期大波动但偏bearish的交易者",
      suitability: "理解ratio带来的不对称盈亏"
    },
    dealerPerspective: {
      whenDealerSells: "Strip = 1 ATM Call + 2 ATM Puts → Dealer short 3 legs",
      exposure: "Net short gamma/short vega，偏short delta (因为2 puts)",
      hedging: ["净Delta偏负，需要买股票对冲", "Gamma管理：3个ATM legs gamma都很高"],
      profitSource: "客户为不对称波动保护付出的溢价"
    },
    interviewQuestions: [
      { q: "Strip vs Straddle vs Strap？", a: "Straddle：1C+1P（对称）。Strip：1C+2P（偏下行）。Strap：2C+1P（偏上行）。选择取决于你对波动方向的判断。Strip最贵（2个puts），Strap次之（2个calls）。" },
      { q: "为什么有人做Strip而不是买Straddle+额外Put？", a: "通常Strip的定价更好（做为一个package），且保证金计算更有效率。但从盈亏角度看，确实是straddle+额外put的组合。" }
    ]
  },

  // Strap - 带式价差
  "strap": {
    exposure: {
      directional: "+Delta (bullish bias —— 2 calls vs 1 put)",
      volatility: "+Vega",
      time: "-Theta",
      convexity: "+Gamma"
    },
    profitLogic: {
      makesMoneyFrom: "标的剧烈移动（特别是上涨——2 calls使得上行盈利更大）",
      losesMoneyFrom: "横盘不动",
      bestMarketCondition: "预期大波动，偏向上行。IV低。",
      worstScenario: "标的横盘"
    },
    clientPerspective: {
      whyClientDoes: [
        "比Straddle更偏上行（2:1 call:put ratio）",
        "看涨且预期大波动",
        "上行杠杆更大"
      ],
      clientType: "激进看涨的波动率买家",
      suitability: "需要标的真正大幅上涨来盈利（2个calls成本高）"
    },
    dealerPerspective: {
      whenDealerSells: "Strap = 2 ATM Calls + 1 ATM Put → Dealer short 3 legs",
      exposure: "Net short gamma/short vega，偏short delta (因为2 calls)",
      hedging: ["净Delta偏正，需要卖股票对冲", "Gamma管理"],
      profitSource: "客户的bullish vol观点mispricing"
    },
    interviewQuestions: [
      { q: "Strap什么时候比Straddle好？", a: "当你确信波动会来但方向偏向上行时。但代价是：如果下跌（1个put），盈利不如straddle（1C+1P）。如果横盘，亏损比straddle大（3腿theta vs 2腿）。" }
    ]
  },

  // Seagull / Fence - 海鸥/围栏策略
  "seagull-fence": {
    exposure: {
      directional: "取决于结构，通常是bullish（保护下行、卖上行）",
      volatility: "净Vega取决于三条腿的相对IV",
      time: "净Theta取决于结构",
      convexity: "结构性的——在保护区内有Gamma保护"
    },
    profitLogic: {
      makesMoneyFrom: "标的在long put和short call之间的区域 + 时间流逝（如果net credit）",
      losesMoneyFrom: "标的跌破put protection（但有保护）或暴涨突破short call（上行封顶）",
      bestMarketCondition: "温和看涨，高IV卖出call补贴put成本",
      worstScenario: "标的暴跌（但有put保护）或暴涨（封顶）"
    },
    clientPerspective: {
      whyClientDoes: [
        "Zero-cost collar的变体（三腿：Long underlying + Long OTM put + Short OTM call）",
        "保护下行 + 卖出上行来支付保护成本",
        "企业和机构常用的对冲策略"
      ],
      clientType: "机构投资者、企业财务（对冲持仓）、私人银行客户",
      suitability: "持有大量标的且有明确的价格保护目标"
    },
    dealerPerspective: {
      whenDealerSells: "Dealer在Seagull的反侧：",
      exposure: "Dealer买入客户的short call → short delta。Dealer卖出客户的long put → long delta。净Delta取决于结构。",
      hedging: ["Delta hedge净暴露", "Vega集中在OTM wings"],
      profitSource: "结构化产品的spread（通常比单腿宽）"
    },
    interviewQuestions: [
      { q: "Seagull/Fence策略的商业应用是什么？", a: "企业用Seagull对冲外汇或商品风险：买入put保护不利方向，卖出call（放弃有利方向的超额收益）来zero-cost。例如：航空公司想保护油价上涨风险，卖出油价下跌的call来支付put的成本。" },
      { q: "Seagull和Collar的区别？", a: "Collar是两腿（Long underlying + Long put + Short call）。Seagull是Collar的一种叫法/变体。有些定义中Seagull=三腿（无underlying，纯期权腿构建），Collar=两腿+underlying。实践中经常混用。" }
    ]
  },

  // Guts - 胆识策略
  "guts": {
    exposure: {
      directional: "取决于结构（Long Guts = 买ITM call + 买ITM put）",
      volatility: "+Vega (做多波动率)",
      time: "-Theta (两条腿的时间衰减)",
      convexity: "+Gamma (正凸性)"
    },
    profitLogic: {
      makesMoneyFrom: "标的剧烈移动（ITM options delta更高 → 对移动更敏感）",
      losesMoneyFrom: "横盘（ITM options extrinsic value持续衰减）",
      bestMarketCondition: "预期大波动，IV低",
      worstScenario: "标的停在两个ITM strikes之间"
    },
    clientPerspective: {
      whyClientDoes: [
        "比Straddle有更高的Delta（ITM legs delta之和 > 1.0）",
        "对标的移动更敏感",
        "但成本也更高（ITM options更贵）"
      ],
      clientType: "强烈预期大波动的交易者",
      suitability: "需要理解ITM options的特性（高Delta、低extrinsic value、高成本）"
    },
    dealerPerspective: {
      whenDealerSells: "客户做Long Guts = 买ITM Call + ITM Put → Dealer short 两个ITM legs",
      exposure: "ITM options delta接近1 → 两个方向的Delta接近对冲。但Gamma和Vega仍然暴露。",
      hedging: ["ITM options liquidity通常较差（大部分volume在ATM/OTM）", "Wider spreads"],
      profitSource: "ITM options的wider spreads"
    },
    interviewQuestions: [
      { q: "Guts vs Straddle的核心区别？", a: "Straddle使用ATM options（strike=spot），Guts使用ITM options（call strike < spot，put strike > spot）。Guts的Delta更高（更敏感），但extrinsic value更少（时间价值占比小），且bid-ask更宽（ITM流动性差）。" },
      { q: "谁会做Guts策略？", a: "极少人做纯Guts（成本高、流动性差）。更常见的是Short Guts（卖出ITM options获取高premium，但风险也大）。Guts更多是理解option moneyness和定价的教学工具。" },
      { q: "Short Guts的动机是什么？", a: "卖出ITM call+ITM put获取大额premium（ITM options权利金高）。如果标的在两个strikes之间不动，两者都归零赚全部premium。但如果大幅移动，亏损也大。本质是极高Theta换取高风险。" }
    ]
  },

  // Generic Professional Trading Concepts
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
