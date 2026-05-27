# D1 to Derivatives Trader Learning System Design

**Date**: 2026-05-27  
**Status**: Approved  
**Topic**: Comprehensive learning platform redesign for Commodities D1 Trader transitioning to Equity Derivatives Trader

---

## Context

**User Profile:**
- **Current Role**: Commodities D1 Trader (LME/CME metals, oil, precious metals, agriculture)
- **Experience**: 
  - Physical hedging for clients
  - Asian options (monthly average price options)
  - LME 3M forward with Euro (currency swap)
  - Hedging without full visibility of client positions
- **Target Role**: Equity Derivatives Trader (primary), with understanding of Commodities Derivatives, Market Making, Structuring, and Vol Trading
- **Timeline**: 6 months preparation
- **Study Time**: 2 hours per day
- **Learning Style**: Hybrid approach - systematic learning from basics + leveraging commodities experience for analogies

**Current System Gaps:**

1. **No D1 → Options Bridge** - Missing transition content from linear to non-linear trading
2. **Insufficient Dealer Perspective** - Limited market making and hedging workflow content
3. **Weak Vol Trading Framework** - Vol Surface is educational only, lacks trading logic
4. **Limited Real-World Scenarios** - Not enough stress scenarios and trade ideas
5. **No Commodities Context** - Doesn't leverage user's existing LME/CME experience
6. **Shallow Greeks Intuition** - Knows definitions but lacks practical application understanding

---

## Solution: Dual-Track Parallel Learning System

### Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Learning Path Navigation Hub             │
│  ┌──────────────┐              ┌──────────────┐         │
│  │  Main Track  │              │  Practice     │         │
│  │  (Systematic)│◄────────────►│  Track        │         │
│  └──────────────┘              └──────────────┘         │
│         │                              │                 │
│         ▼                              ▼                 │
│  ┌──────────────────────────────────────────┐          │
│  │      Commodities Bridge Module            │          │
│  │  (LME/CME → Equity Knowledge Transfer)   │          │
│  └──────────────────────────────────────────┘          │
│         │                              │                 │
│         ▼                              ▼                 │
│  ┌──────────────┐              ┌──────────────┐         │
│  │ Greeks       │              │ Interview     │         │
│  │ Intuition    │              │ Scenario      │         │
│  │ Builder      │              │ Bank          │         │
│  └──────────────┘              └──────────────┘         │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │         Progress Dashboard                   │        │
│  │  - Knowledge graph completion                │        │
│  │  - Weakness identification                   │        │
│  │  - Study time tracking                       │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## Main Track: 6-Month Systematic Curriculum

### Month 1: Greeks Fundamentals & Intuition

**Week 1: Delta (From D1 to Options)**
- Delta as directional exposure (familiar concept)
- Delta vs D1 position: similarities and differences
- Delta hedging basics
- Commodities comparison: Delta in futures vs options
- Practice: Calculate Delta for various strikes and DTEs

**Week 2: Gamma (The Essence of Non-Linear Risk)**
- Why Gamma matters: Delta changes as spot moves
- Gamma vs D1 thinking: convexity vs linearity
- Long gamma vs short gamma P&L profiles
- Gamma scalping introduction
- Commodities comparison: Gamma in commodity options (backwardation/contango effects)

**Week 3: Vega (Volatility Sensitivity)**
- Vega as vol exposure
- Why Vega doesn't exist in D1 world
- Vega vs Gamma relationship
- Commodities comparison: Equity vol skew (put skew) vs Commodity vol skew (call skew for supply disruption)
- Practice: Vega hedging across different strikes

**Week 4: Theta (Time Decay) + Rho**
- Theta as time value erosion
- Gamma-Theta tradeoff (fundamental relationship)
- Theta collection strategies
- Rho (interest rate sensitivity) - less important but needed for interviews
- Commodities comparison: Carry in commodities (storage cost, convenience yield) vs equity (dividends, borrow cost)

**Deliverables:**
- Greeks Intuition Builder tool (interactive sliders)
- 20 practice problems with solutions
- Commodities Bridge: "Greeks in LME Copper Options vs SPY Options"

---

### Month 2: Basic Strategies & Combinations

**Week 1: Spreads (Bull/Bear, Calendar, Diagonal)**
- Vertical spreads: defined risk/reward
- Calendar spreads: vol term structure play
- Diagonal spreads: combining directional + vol views
- When to use each type
- Practice: Construct spreads for different market views

**Week 2: Straddles/Strangles (Vol Trading Intro)**
- Long straddle/strangle: betting on movement
- Short straddle/strangle: collecting premium
- Breakeven analysis
- IV Rank/Percentile usage
- Practice: Earnings vol crush trade

**Week 3: Butterflies/Condors (Profit Optimization)**
- Iron Condor: range-bound income
- Iron Butterfly: precision betting
- Risk/reward optimization
- Adjustment techniques
- Practice: Manage Iron Condor through spot movement

**Week 4: Collars/Protective (Risk Management)**
- Protective put: downside protection
- Collar: zero-cost hedge
- Seagull/Fence: asymmetric protection
- Client hedging scenarios
- Commodities comparison: Hedging physical copper position with options vs futures

**Deliverables:**
- Strategy comparison matrix
- 30 practice scenarios
- Client inquiry simulator: "Client wants X, recommend Y"

---

### Month 3: Volatility Trading Framework

**Week 1: Realized Vol vs Implied Vol**
- What is Realized Vol? (historical volatility calculation)
- What is Implied Vol? (market's expectation)
- Vol arbitrage: RV < IV → sell options + delta hedge
- Vol risk premium concept
- Practice: Calculate RV from historical data, compare to IV

**Week 2: Vol Skew (Equity Put Skew vs Commodity Call Skew)**
- Why equity put skew exists (crash protection, leverage effect)
- Why commodity call skew exists (supply disruption risk)
- Trading skew: Risk Reversal, Butterfly spreads
- Skew changes and portfolio impact
- Commodities Bridge: LME copper skew vs SPY skew analysis

**Week 3: Vol Term Structure (Calendar Spread in Practice)**
- Normal term structure (upward sloping)
- Inverted term structure (event-driven)
- Calendar spread as term structure trade
- Roll yield in vol trading
- Practice: Earnings calendar spread (short front-month, long back-month)

**Week 4: Vol Surface & Arbitrage Opportunities**
- Vol surface visualization (strike × DTE)
- Put-call parity arbitrage
- Box spread arbitrage
- Conversion/reversal trades
- Transaction cost considerations

**Deliverables:**
- Vol Surface interactive tool (3D visualization)
- RV vs IV calculator
- 25 vol trading scenarios
- Commodities Bridge: "Vol Trading in Commodities vs Equities"

---

### Month 4: Dynamic Hedging & Market Making

**Week 1: Delta Hedging Basics**
- Why delta hedge? (isolate other Greeks)
- Hedging frequency tradeoffs
- Transaction costs vs risk
- Slippage and market impact
- Practice: Delta hedge a straddle through spot movement

**Week 2: Gamma Scalping (When to Rehedge)**
- Gamma P&L mechanics
- Rehedging decision tree (Delta threshold, Gamma size, transaction costs)
- Long gamma: profit from rehedging
- Short gamma: loss from rehedging
- Practice: Simulate gamma scalping with different rehedge frequencies

**Week 3: Vega Hedging (Cross-Option Hedging)**
- Vega hedging with different strikes
- Vega hedging with different DTEs
- Vega-Gamma correlation
- Portfolio vega management
- Practice: Construct vega-neutral portfolio

**Week 4: Market Making Perspective**
- Bid-ask spread pricing (Greeks-based)
- Inventory management (how to guide client flow)
- P&L attribution (Delta P&L, Gamma P&L, Vega P&L, Theta P&L)
- When to refuse client orders
- Practice: MM simulation - manage inventory through client orders

**Deliverables:**
- Enhanced Gamma P&L simulator (realistic dealer workflow)
- Bid-ask spread calculator
- P&L attribution tool
- 30 MM scenarios
- Dealer perspective case studies

---

### Month 5: Exotic Options & Structured Products

**Week 1: Asian Options (Leverage Your Experience)**
- Arithmetic vs geometric average
- Path dependency and vol impact
- Pricing considerations
- Hedging challenges
- Commodities Bridge: Your LME monthly average price options experience
- Practice: Price and hedge Asian call

**Week 2: Barrier Options (Knock-in/Knock-out)**
- Barrier types (up-and-in, down-and-out, etc.)
- Barrier monitoring (continuous vs discrete)
- Rebate features
- Hedging near barriers
- Practice: Construct barrier option for cost reduction

**Week 3: Quanto Options (Currency Risk)**
- Quanto mechanics (foreign underlying, domestic payout)
- Correlation risk (asset vs FX)
- Pricing adjustments
- Commodities Bridge: Your LME 3M forward with Euro experience
- Practice: Price quanto call on Nikkei (JPY underlying, USD payout)

**Week 4: Structured Products (Client Need → Product Design)**
- Principal protection notes
- Yield enhancement products
- Participation notes
- Autocallables
- Practice: Design product for client scenario

**Deliverables:**
- Exotic options pricing tools
- Structured product builder
- 20 exotic scenarios
- Commodities Bridge: "Exotic Options in Commodities vs Equities"

---

### Month 6: Portfolio Management & Interview Sprint

**Week 1: Portfolio Greeks Limits**
- Why set Greeks limits? (risk management)
- Delta limit (directional risk)
- Gamma limit (rehedging cost)
- Vega limit (vol risk)
- Theta target (income generation)
- Practice: Construct portfolio within limits

**Week 2: Risk Management (VaR, Stress Testing)**
- VaR calculation (parametric method)
- Stress testing scenarios
- Tail risk management
- Correlation and diversification
- Practice: Run stress tests on portfolio

**Week 3: Interview High-Frequency Scenarios**
- Stress scenarios (50+ questions)
  - "Spot drops 10%, your Iron Condor is breached, what do you do?"
  - "IV spikes 50%, your short straddle is underwater, how to adjust?"
- Trade ideas (30+ questions)
  - "Client bullish but worried about downside, recommend what?"
  - "Earnings in 2 weeks, IV elevated, how to trade?"
- Greeks relationship (20+ questions)
  - "Why are Gamma and Theta usually opposite signs?"
  - "Why is ATM option Vega highest?"

**Week 4: Mock Interview**
- Full mock interview simulation
- Technical questions (Greeks, strategies, vol trading)
- Scenario questions (client inquiry, risk management)
- Behavioral questions (why derivatives, why this desk)
- Feedback and improvement areas

**Deliverables:**
- Portfolio risk dashboard
- Interview question bank (200+ questions)
- Mock interview simulator
- Final assessment and gap analysis

---

## Practice Track: Real-World Scenarios (Weekly)

### Scenario Categories

**1. Client Inquiry Scenarios (30+ scenarios)**

Examples:
- "Client is bullish on AAPL but worried about 10% downside, what do you recommend?"
  - Answer: Bull call spread or collar
  - Follow-up: How to choose strike prices? What if client wants zero cost?

- "Client wants to earn theta but doesn't want unlimited risk, what structure?"
  - Answer: Iron Condor, Iron Butterfly, or Credit Spreads
  - Follow-up: How to size position? What's max loss?

- "Client thinks TSLA will move big but doesn't know direction, what to do?"
  - Answer: Long straddle or strangle
  - Follow-up: How to choose ATM vs OTM? What's breakeven?

**2. Risk Management Scenarios (30+ scenarios)**

Examples:
- "You're short 1000 ATM straddles, spot suddenly jumps 5%, what do you do?"
  - Answer: Delta hedge immediately, assess gamma exposure, consider closing
  - Follow-up: How much stock to buy? What if IV also spikes?

- "Spot is approaching your short put strike with 2 days to expiry, how to handle pin risk?"
  - Answer: Close position before expiry, or prepare for assignment
  - Follow-up: What if liquidity is poor? What's the cost of closing?

- "Your portfolio is Delta-neutral but losing money, why?"
  - Answer: Could be Gamma P&L (if short gamma), Vega P&L (if IV drops), or Theta P&L (if long options)
  - Follow-up: How to diagnose? How to fix?

**3. P&L Attribution Scenarios (20+ scenarios)**

Examples:
- "Today's P&L is +$50k. Spot up 2%, IV down 5%, 1 day passed. Break down P&L sources."
  - Answer: Delta P&L = Delta × Spot move, Vega P&L = Vega × IV change, Theta P&L = Theta × 1 day
  - Follow-up: Which contributed most? Is this expected?

- "You're long gamma but lost money today despite spot moving 3%, why?"
  - Answer: Vega loss (IV dropped) or Theta decay exceeded Gamma P&L
  - Follow-up: How to prevent this? Should you hedge Vega?

**4. Market Making Scenarios (20+ scenarios)**

Examples:
- "You're long 5000 deltas from client trades, how do you adjust bid-ask spread?"
  - Answer: Widen offer (discourage buying), tighten bid (encourage selling)
  - Follow-up: By how much? What if client is price-sensitive?

- "Client wants to buy 10,000 OTM calls, how do you price?"
  - Answer: Consider mid price + spread + inventory cost + gamma risk
  - Follow-up: What if you're already long gamma? What if liquidity is poor?

---

## Commodities Bridge Module

### Purpose
Leverage user's existing LME/CME experience to accelerate learning by drawing parallels and highlighting differences between commodities and equity derivatives.

### Key Topics

**1. Vol Skew Direction**
- **Equity**: Put skew (OTM puts expensive) - crash protection, leverage effect
- **Commodity**: Call skew (OTM calls expensive) - supply disruption risk
- **Why it matters**: Affects strategy selection (Risk Reversal direction, Butterfly positioning)

**2. Carry & Cost of Carry**
- **Equity**: Dividends (positive carry for long stock), borrow cost (negative carry for short stock)
- **Commodity**: Storage cost (negative carry), convenience yield (positive carry)
- **Why it matters**: Affects forward pricing, early exercise decisions, calendar spread pricing

**3. Liquidity & Market Structure**
- **Equity**: Deep liquidity in major names (SPY, AAPL), tight bid-ask spreads
- **Commodity**: Varies widely (LME copper liquid, but many strikes illiquid)
- **Why it matters**: Affects execution, hedging frequency, spread width

**4. Seasonality & Event Risk**
- **Equity**: Earnings (quarterly), dividends (quarterly/annual)
- **Commodity**: Harvest seasons (agriculture), weather (energy), geopolitical (oil)
- **Why it matters**: Vol term structure patterns, event-driven trading

**5. Physical Delivery vs Cash Settlement**
- **Equity**: Mostly cash-settled (index options) or stock delivery (equity options)
- **Commodity**: Physical delivery common (LME), logistics matter
- **Why it matters**: Assignment risk, delivery costs, squeeze risk

**6. Asian Options (Your Strength)**
- **Your experience**: LME monthly average price options
- **Equity equivalent**: Rare, but used in structured products
- **Key insight**: Path dependency reduces vol impact, harder to hedge

**7. Quanto Options (Your Strength)**
- **Your experience**: LME 3M forward with Euro (currency swap)
- **Equity equivalent**: Quanto index options (e.g., Nikkei in USD)
- **Key insight**: Correlation risk (asset vs FX), pricing adjustments

### Implementation
- Dedicated "Commodities Bridge" tab in each module
- Side-by-side comparison tables
- Real examples from LME copper vs SPY
- Highlight when to apply commodities intuition vs when to unlearn

---

## Greeks Intuition Builder

### Purpose
Transform theoretical Greeks knowledge into practical intuition through interactive visualization and real-time feedback.

### Features

**1. Interactive Sliders**
- Adjust: Spot, Strike, DTE, IV, Rate, Dividend
- See real-time updates: Option Price, Delta, Gamma, Vega, Theta, Rho
- Visualize: Payoff diagram, Greeks curves

**2. Scenario Simulator**
- "What if spot moves 5%?" → See Delta P&L, new Delta, Gamma P&L
- "What if IV spikes 10%?" → See Vega P&L, new Vega
- "What if 7 days pass?" → See Theta P&L, new Greeks

**3. Greeks Relationship Explorer**
- Gamma-Theta tradeoff visualization
- Vega-Gamma correlation
- Delta-Gamma relationship (Delta changes as spot moves)
- Moneyness effects (ATM vs ITM vs OTM)

**4. Hedging Simulator**
- Start with a position (e.g., short 100 ATM calls)
- Spot moves randomly
- You decide: hedge now or wait?
- See P&L impact of your decisions
- Learn optimal rehedging frequency

**5. Quiz Mode**
- "This option has Delta 0.6, Gamma 0.05, Theta -0.3. Spot moves up $1. What's new Delta?"
- "You're short gamma. Spot is volatile. What happens to your P&L?"
- Immediate feedback with explanations

### Implementation
- Enhance existing Greeks six-panel chart
- Add interactive controls
- Add scenario comparison (before/after)
- Add quiz mode with 100+ questions

---

## Interview Scenario Bank

### Structure

**Level 1: Fundamentals (50 questions)**
- Greeks definitions and relationships
- Basic strategy mechanics
- Simple hedging scenarios

**Level 2: Intermediate (80 questions)**
- Strategy comparisons
- Vol trading concepts
- Client inquiry scenarios
- P&L attribution

**Level 3: Advanced (70 questions)**
- Stress scenarios
- Complex hedging
- Market making
- Exotic options

**Level 4: Expert (50 questions)**
- Multi-leg portfolio management
- Correlation trading
- Structured products design
- Real-world edge cases

### Question Types

**1. Technical Questions**
- "Explain gamma-theta tradeoff"
- "Why is ATM option vega highest?"
- "How does dividend affect call vs put pricing?"

**2. Scenario Questions**
- "Client wants X, what do you recommend?"
- "Your position is losing money, what do you do?"
- "How would you hedge this exposure?"

**3. Market Questions**
- "Why is equity vol skew negative?"
- "What drives vol term structure inversion?"
- "How do you price bid-ask spread?"

**4. Behavioral Questions**
- "Why derivatives trading?"
- "Why this desk?"
- "Describe a trade that went wrong"

### Features
- Filter by: Level, Type, Topic
- Track: Attempted, Correct, Review Later
- Spaced repetition: Review weak areas
- Mock interview mode: Random selection, timed

---

## Progress Dashboard

### Metrics Tracked

**1. Knowledge Graph Completion**
- Greeks: 4/4 completed (Delta, Gamma, Vega, Theta)
- Strategies: 15/30 completed
- Vol Trading: 2/4 modules completed
- Exotic Options: 0/4 completed

**2. Weakness Identification**
- Weak areas: Vega hedging, Barrier options
- Recommended focus: Week 3 Month 4, Week 2 Month 5
- Practice scenarios: 10 Vega hedging scenarios

**3. Study Time Tracking**
- Total: 120 hours (60 days × 2 hours)
- Main track: 80 hours
- Practice track: 40 hours
- This week: 14 hours (on track)

**4. Interview Readiness**
- Questions attempted: 150/250
- Accuracy: 75%
- Weak topics: Vol skew, Exotic options
- Estimated readiness: 60% (4 more weeks needed)

### Visualization
- Progress bars for each module
- Heatmap of knowledge areas (green = strong, red = weak)
- Time series of study hours
- Accuracy trend over time

---

## Learning Rhythm (Daily 2 Hours)

### Weekly Schedule

**Monday-Wednesday: Main Track + Practice**
- 1 hour: Main track learning (video/reading/interactive)
- 1 hour: Related practice scenarios (3-5 scenarios)

**Thursday: Practice Track Deep Dive**
- 2 hours: Complex scenarios integrating the week's learning
- Focus on weak areas identified by dashboard

**Friday: Review + Interview Prep**
- 1 hour: Review week's content, quiz mode
- 1 hour: Interview questions (10-15 questions)

**Weekend: Flexible**
- Rest or catch up on missed content
- Explore advanced topics of interest
- Mock interview practice (once per month)

### Monthly Milestones

**End of Month 1:**
- Master all 4 Greeks
- Complete 20 basic strategy scenarios
- Attempt 30 Level 1 interview questions

**End of Month 2:**
- Master 10 basic strategies
- Complete 30 client inquiry scenarios
- Attempt 40 Level 2 interview questions

**End of Month 3:**
- Understand vol trading framework
- Complete 25 vol trading scenarios
- Attempt 30 Level 2 interview questions

**End of Month 4:**
- Master dynamic hedging
- Complete 30 MM scenarios
- Attempt 30 Level 3 interview questions

**End of Month 5:**
- Understand exotic options
- Complete 20 exotic scenarios
- Attempt 20 Level 3 interview questions

**End of Month 6:**
- Portfolio management proficiency
- Complete 1 full mock interview
- Attempt 50 Level 4 interview questions
- Interview ready!

---

## Success Criteria

After 6 months, user should be able to:

**1. Greeks Mastery**
- Explain all Greeks intuitively (not just definitions)
- Predict P&L changes from spot/vol/time moves
- Design hedging strategies for any Greeks exposure

**2. Strategy Proficiency**
- Recommend appropriate strategy for any client scenario
- Explain risk/reward tradeoffs
- Adjust strategies under stress

**3. Vol Trading Understanding**
- Distinguish RV vs IV
- Trade vol skew and term structure
- Identify arbitrage opportunities

**4. Dealer Perspective**
- Think like a market maker
- Price bid-ask spreads
- Manage inventory and P&L

**5. Interview Confidence**
- Answer 80%+ of interview questions correctly
- Handle stress scenarios calmly
- Articulate trade ideas clearly

**6. Commodities Advantage**
- Leverage LME/CME experience in interviews
- Explain exotic options (Asian, Quanto) from experience
- Stand out from pure equity candidates

---

## Implementation Priorities

### Phase 1: Foundation (Weeks 1-4)
1. Commodities Bridge module (highest priority - unique value)
2. Greeks Intuition Builder (core learning tool)
3. Month 1 main track content (Greeks fundamentals)
4. 30 basic practice scenarios

### Phase 2: Core Content (Weeks 5-12)
1. Month 2-3 main track content (strategies + vol trading)
2. 60 intermediate practice scenarios
3. Interview Scenario Bank Level 1-2 (130 questions)
4. Progress Dashboard basic version

### Phase 3: Advanced Content (Weeks 13-20)
1. Month 4-5 main track content (hedging + exotics)
2. 50 advanced practice scenarios
3. Interview Scenario Bank Level 3-4 (120 questions)
4. Enhanced Gamma P&L simulator

### Phase 4: Interview Prep (Weeks 21-24)
1. Month 6 main track content (portfolio + interview)
2. Mock interview simulator
3. Progress Dashboard advanced features
4. Final review and gap filling

---

## Key Differentiators

This learning system is unique because:

1. **Commodities Bridge** - No other platform helps commodities traders transition to equity derivatives
2. **Dual-Track System** - Balances systematic learning with practical scenarios
3. **Greeks Intuition Builder** - Goes beyond definitions to build real intuition
4. **Dealer Perspective** - Teaches market making and hedging workflows, not just client-side trading
5. **Interview Focus** - 250+ interview questions directly aligned with real interviews
6. **Personalized Dashboard** - Tracks progress and identifies weaknesses automatically
7. **Realistic Timeline** - 6 months is achievable, not rushed or dragged out
8. **Leverages Existing Strength** - Asian options and Quanto experience become advantages

---

## Next Steps

1. **User approval** of this design
2. **Write implementation plan** using writing-plans skill
3. **Execute in phases** over next 4-6 weeks of development
4. **User begins learning** with completed Phase 1 content
5. **Iterate based on feedback** as user progresses through curriculum
