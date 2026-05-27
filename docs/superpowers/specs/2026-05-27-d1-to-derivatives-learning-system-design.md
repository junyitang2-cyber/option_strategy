# D1 to Derivatives Trader Learning System Design

**Date**: 2026-05-27
**Status**: Approved for Phase 1 implementation
**Topic**: Learning platform upgrade for a Commodities D1 Trader preparing for Equity Derivatives interviews

---

## Executive Decision

The full six-month learning system remains the long-term vision, but implementation must start with a smaller Phase 1 MVP.

Phase 1 should build a **D1-to-Derivatives Learning Hub** inside the existing static app. It should help the user translate current commodities D1 experience into options intuition, dealer language, and interview-ready answers.

The system must not become a second generic options course. The unique value is the bridge:

- Linear D1 exposure -> option Greeks and convexity.
- Physical/client hedging -> structured client suitability and risk disclosure.
- LME/CME/Asian options/FX-linked hedges -> equity derivatives, vol surface, and exotics interview edge.
- Trading execution instincts -> dealer risk management, P&L attribution, and market-making framing.

---

## User Context

**Current background**

- Commodities D1 trader.
- Familiar with LME/CME metals, oil, precious metals, and agriculture.
- Handles client physical hedging and futures/forward exposure.
- Has experience with Asian options, monthly average price optionality, LME 3M forwards, and FX/currency swap components.
- Often hedges client needs without seeing the client's full book.

**Target**

- Primary target: Equity Derivatives Trader interviews.
- Secondary knowledge areas: commodities derivatives, market making, structuring, volatility trading, and risk management.
- Preparation rhythm: about 2 hours per day over six months.

---

## Current App Baseline

The app already has a strong base:

- 71 strategies.
- Interactive payoff, probability cone, per-leg decomposition, Greeks six-panel chart, scenario controls, and leg editor.
- Professional mode with Trader Memo, stress test, parity, portfolio Greeks, Gamma P&L, vol surface, and Greeks Decay.
- Interview mode with 141 Q&A records.
- LocalStorage progress for strategy completion.
- Playwright regression tests.

Phase 1 must extend this base rather than duplicate it.

---

## Scope

### Phase 1 MVP

Build these pieces first:

1. **Learning Hub panel**
   - A new guided panel in the workspace.
   - Shows the six-month roadmap but unlocks only Month 1 content in the first implementation.
   - Links each concept to current strategy lab tools when relevant.

2. **Month 1 Greeks curriculum**
   - Week 1: Delta from D1 directional exposure.
   - Week 2: Gamma as non-linear exposure and rehedging risk.
   - Week 3: Vega as implied volatility exposure.
   - Week 4: Theta/Rho and carry analogies.

3. **Commodities Bridge**
   - Side-by-side comparison of D1 commodities concepts and equity derivatives concepts.
   - Explicit guidance on which instincts transfer and which need to be unlearned.
   - Keep statements regime-aware: commodity skew and seasonality vary by product and market state.

4. **Scenario Bank MVP**
   - 30 scenarios across client inquiry, risk management, P&L attribution, and market-making.
   - Each scenario includes prompt, expected answer, follow-up, tags, and difficulty.
   - Users can filter scenarios and mark them as understood/review-later.

5. **Progress tracking**
   - LocalStorage-based progress.
   - Track completed modules, completed scenarios, review-later scenarios, and last active learning tab.
   - No account system and no backend.

6. **Test coverage**
   - Add a Playwright suite for Learning Hub rendering, tab switching, filters, answer reveal, and progress persistence.
   - Existing tests must continue to pass.

### Later Phases

Later phases are intentionally deferred until Phase 1 is useful:

- Month 2-3 strategies and volatility trading expansion.
- Month 4 dynamic hedging and market-making simulations.
- Month 5 exotics and structured products.
- Month 6 mock interview sprint and readiness dashboard.
- Advanced spaced repetition, study-time analytics, and weakness heatmaps.

The detailed post-Phase-1 roadmap is maintained in:

- `docs/superpowers/specs/2026-05-27-d1-to-derivatives-master-roadmap.md`

### Non-Goals For Phase 1

- No real market data connection.
- No broker-grade margin engine.
- No live option chain import.
- No advanced exotics pricing implementation.
- No full 250-question interview bank yet.
- No backend, login, database, or cloud sync.

---

## Product Architecture

### Existing Files To Reuse

- `index.html`: Add the Learning Hub panel and load the new data file.
- `styles.css`: Add Learning Hub, bridge, scenario, and progress styles.
- `app.js`: Add state, render functions, event handlers, and progress persistence.
- `data/professional-content.js`: Keep current strategy-level Trader Memo and Q&A.
- `tests/*.spec.js`: Keep existing regression tests.

### New Files

- `data/learning-content.js`
  - Owns D1 learning modules, bridge comparisons, scenario bank, and roadmap data.
  - Exposes a single global object, for example `window.D1_LEARNING_CONTENT`.

- `tests/learning-hub.spec.js`
  - Owns Playwright tests for the new learning experience.

### Data Boundary

Learning content should live in `data/learning-content.js`, not inside `app.js`.
`app.js` should only render and manage state.

---

## Data Model

### `roadmap`

Each roadmap item should include:

- `month`: number.
- `title`: string.
- `status`: `"active" | "locked"`.
- `focus`: short description.
- `deliverables`: array of strings.

Only Month 1 is active in Phase 1.

### `modules`

Each module should include:

- `id`: stable string, for example `delta-d1`.
- `week`: number.
- `title`: string.
- `coreQuestion`: one sentence.
- `d1Anchor`: how the user already thinks about this in commodities D1.
- `derivativesUpgrade`: what changes in options.
- `dealerLens`: how a dealer or market maker thinks about it.
- `interviewTakeaway`: answer framing for interviews.
- `strategyLinks`: array of strategy ids that already exist in `data/strategies.js`.
- `practiceIds`: scenario ids tied to this module.

### `bridgeComparisons`

Each comparison should include:

- `id`
- `topic`
- `d1World`
- `equityDerivativesWorld`
- `transferableInstinct`
- `unlearnOrRefine`
- `interviewLine`

### `scenarios`

Each scenario should include:

- `id`
- `category`: `"client" | "risk" | "pnl" | "market-making"`.
- `level`: `"foundation" | "intermediate" | "advanced"`.
- `title`
- `prompt`
- `expectedAnswer`
- `followUp`
- `commonMistake`
- `tags`
- `linkedModuleIds`

### LocalStorage

Use a new key:

```text
os_d1_learning
```

Shape:

```json
{
  "completedModules": ["delta-d1"],
  "completedScenarios": ["client-collar-hedge"],
  "reviewLaterScenarios": ["mm-short-gamma-gap"],
  "activeLearningTab": "modules",
  "scenarioFilter": "all"
}
```

This must be separate from existing `os_learning` strategy progress.

---

## UI Design

### Placement

Add the Learning Hub after the existing `learningPathBar` and before the main chart grid. It should be visible in all modes because it is the new study command center.

The hub should be compact enough not to bury the current strategy analysis tools. Use tabs inside one panel:

- `Roadmap`
- `Month 1 Greeks`
- `Commodities Bridge`
- `Scenario Bank`

### Roadmap Tab

Shows all six months as a compact track:

- Month 1 active.
- Months 2-6 locked with short preview text.
- Includes daily study rhythm: 1 hour concept, 1 hour scenarios.

### Month 1 Greeks Tab

Shows four module cards:

- Delta: from D1 directional exposure to option delta.
- Gamma: from linear exposure to convexity and rehedging risk.
- Vega: from no direct linear exposure to implied-vol exposure.
- Theta/Rho: time decay, carry, dividends, rates, borrow, storage, convenience yield.

Each card should have:

- D1 anchor.
- Options upgrade.
- Dealer lens.
- Interview takeaway.
- Linked strategies.
- Mark completed button.

### Commodities Bridge Tab

Shows comparison rows:

- Directional exposure vs dynamic delta.
- Forward curve/carry vs option forward input.
- Commodity skew vs equity index/equity skew.
- Physical delivery/logistics vs cash/stock settlement.
- Asian options vs vanilla equity options.
- Quanto/FX-linked hedges vs equity quanto products.

### Scenario Bank Tab

Shows filter pills and scenario cards:

- All
- Client
- Risk
- P&L
- Market-making

Each scenario card should have:

- Prompt.
- Hidden answer that can be revealed.
- Follow-up question.
- Common mistake.
- Mark understood button.
- Review later toggle.

---

## Content Accuracy Rules

The content must use interview-ready but precise language.

1. Do not say "Vega does not exist in D1" without qualification. Use: "linear outright D1 futures exposure has no direct Vega, but client optionality and embedded structures can introduce volatility exposure."

2. Do not describe commodity call skew as universal. Use: "many supply-shock-sensitive commodity markets can show call skew, while the shape is product- and regime-dependent."

3. Do not reduce vol selling to "RV < IV, sell options." Include transaction costs, jump risk, rehedging frequency, liquidity, and vol risk premium.

4. Distinguish client risk management from prop views. A client hedge recommendation must mention objective, horizon, liquidity, downside tolerance, and suitability.

5. Keep all calculations labeled educational. The app is not a trading system.

---

## Phase 1 Curriculum

### Week 1: Delta

Core question: "How does a linear D1 trader translate directional exposure into option delta?"

Required teaching points:

- Futures D1 has roughly constant directional exposure.
- Option delta changes with spot, strike, DTE, IV, and moneyness.
- Long call, short put, and stock/futures can all create positive delta, but the risk profile differs.
- Dealer hedge language: client buys calls -> dealer sells calls -> dealer is short delta/short gamma and may buy underlying to hedge.

### Week 2: Gamma

Core question: "What changes when exposure is no longer linear?"

Required teaching points:

- Gamma is the change in delta as spot moves.
- Long gamma benefits from movement but pays theta.
- Short gamma collects theta but must manage adverse delta drift.
- Rehedging is a trade-off between risk, cost, and liquidity.

### Week 3: Vega

Core question: "What does it mean to trade implied volatility instead of only direction?"

Required teaching points:

- Vega measures sensitivity to implied volatility.
- Linear futures positions do not have direct Vega, but options and structured client hedges do.
- RV vs IV is useful, but not a complete trade signal.
- Equity index skew, single-name event vol, and commodity skew need separate mental models.

### Week 4: Theta/Rho And Carry

Core question: "How does time value connect to carry, funding, dividends, storage, and convenience yield?"

Required teaching points:

- Theta is time-value decay.
- Gamma and theta are linked by no-arbitrage intuition.
- Rho matters more for longer-dated/deeper ITM structures.
- Commodity carry analogies help, but equity options add dividends, borrow cost, and early exercise considerations.

---

## Acceptance Criteria

Phase 1 is done when:

1. The Learning Hub appears on page load and does not break the existing strategy lab.
2. The four Learning Hub tabs switch without console errors.
3. Month 1 shows four complete module cards with D1 anchor, options upgrade, dealer lens, and interview takeaway.
4. Commodities Bridge shows at least six comparison rows with precise caveats.
5. Scenario Bank contains exactly 30 scenarios across the four categories.
6. Scenario answers can be revealed.
7. Module completion and scenario progress persist after page refresh.
8. Existing Professional/Interview modes still work.
9. `node --check app.js`, `node --check data/professional-content.js`, `node --check data/learning-content.js`, and `npm test` pass.
10. `README.md`, `USER_GUIDE.md`, `docs/PROJECT_STATUS.md`, and `docs/IMPLEMENTATION_HISTORY.md` are updated if the UI is implemented.

---

## Implementation Handoff

Implementation plan:

- `docs/superpowers/plans/2026-05-27-d1-learning-hub-phase1.md`

Long-term roadmap:

- `docs/superpowers/specs/2026-05-27-d1-to-derivatives-master-roadmap.md`

Recommended execution style:

1. Build data and tests first.
2. Add static UI scaffold.
3. Add rendering and progress state.
4. Add scenario interactions.
5. Run browser verification and full Playwright regression.

The plan should be executed as Phase 1 only. Do not start exotics, full mock interview, or advanced dashboard work until the user has used and reviewed the MVP.
