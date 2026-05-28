# D1 to Derivatives Master Roadmap

**Date**: 2026-05-27
**Status**: Active roadmap after Phase 2A
**Owner Goal**: Help a Commodities D1 Trader prepare for Equity Derivatives, Vol Trading, Market Making, Structuring, and Derivatives Risk interviews.

---

## Purpose

This roadmap preserves the larger six-month blueprint after the Phase 1 MVP. It converts the long-term vision into implementation phases that can be built one at a time without losing the strategic direction.

The guiding principle is:

> Turn commodities D1 experience into derivatives interview advantage, then deepen into equity options, volatility, dealer risk, exotics, and mock interview readiness.

---

## Current Baseline

Phase 1 and Phase 2A are implemented:

- Learning Hub panel.
- Six-month roadmap display.
- Month 1 Greeks modules.
- Commodities Bridge.
- Month 2 Strategy Construction modules.
- Strategy Construction comparison cards.
- 70 scenario bank records.
- Scenario filters by category, month, and topic.
- LocalStorage progress via `os_d1_learning`.
- Playwright coverage in `tests/learning-hub.spec.js`.

Existing platform foundation:

- 71 strategies.
- 40 professional Trader Memos.
- 141 strategy-level interview Q&A.
- Professional tools: stress test, parity, portfolio Greeks, Gamma P&L, vol surface, Greeks Decay.
- Static frontend only: `index.html`, `styles.css`, `app.js`, `data/*.js`.

---

## Master Phase Order

### Phase 1: Foundation - Completed

**Goal**: Build the learning command center and Month 1 Greeks foundation.

**Status**: Implemented.

**Delivered**

- Roadmap, Month 1 Greeks, bridge comparisons, scenario bank.
- Progress tracking for modules/scenarios/review-later/current tab/filter.
- Regression tests.

**Do not expand Phase 1 further** except for bug fixes and content corrections. New learning content should move into Phase 2+.

---

### Phase 2A: Month 2 Strategy Construction

**Goal**: Teach how to select and construct option strategies from client objectives, risk budget, and market views.

**Status**: Implemented on 2026-05-28.

**Learning modules**

1. Vertical spreads: defined-risk directional expression.
2. Straddles and strangles: movement and vol exposure.
3. Butterflies and condors: range, convexity, and payoff shaping.
4. Collars, protective puts, seagulls/fences: client hedge design.

**UI deliverables**

- Add Month 2 module cards to the existing Learning Hub.
- Add a Strategy Construction tab or section inside the Learning Hub.
- Add strategy comparison cards:
  - Straddle vs Strangle.
  - Iron Condor vs Short Strangle.
  - Collar vs Protective Put.
  - Bull Call Spread vs Long Call.
  - Calendar Spread vs Vertical Spread.

**Data deliverables**

- Extend `data/learning-content.js` with Month 2 modules.
- Add 40 new scenarios:
  - 15 client structure recommendation.
  - 10 strategy comparison.
  - 10 risk adjustment.
  - 5 common interview traps.

**Interview outcomes**

- User can translate a client objective into 2-3 candidate structures.
- User can state max loss, max gain, Greeks, assignment/margin issues, and suitability.
- User can explain why a cheaper structure is not necessarily better.

**Acceptance criteria**

- Learning Hub shows Month 2 as active/completed-available after implementation.
- Strategy comparison cards render and link to existing strategies.
- Scenario Bank supports Month/topic filtering, not only category filtering.
- Existing `npm test` suite passes with expanded learning tests.

---

### Phase 2B: Client Recommendation Drill

**Goal**: Convert strategy knowledge into professional client advisory workflows.

**Core workflow**

Client objective -> constraints -> candidate structures -> trade-offs -> recommendation -> risks -> follow-up questions.

**UI deliverables**

- A guided drill panel with prompts such as:
  - Bullish but wants downside protection.
  - Wants income but cannot take unlimited risk.
  - Expects event move but direction is uncertain.
  - Holds concentrated stock and wants tax-aware protection.
  - Commodity producer/consumer analogy translated into equity hedge.

**Data deliverables**

- Add `clientDrills` or extend `scenarios` with `workflowSteps`.
- Each drill must include:
  - objective,
  - constraints,
  - recommended structure,
  - acceptable alternatives,
  - suitability warning,
  - dealer hedge note,
  - interview answer outline.

**Acceptance criteria**

- User can reveal the answer step by step.
- Progress persists per drill.
- At least 20 drills are included.
- Tests cover drill rendering, step reveal, progress persistence, and strategy links.

---

### Phase 3: Month 3 Volatility Trading Framework

**Goal**: Teach volatility as a tradable risk factor, not just a pricing input.

**Learning modules**

1. Realized volatility vs implied volatility.
2. Event volatility and IV crush.
3. Equity put skew vs regime-dependent commodity skew.
4. Term structure and calendar/diagonal logic.
5. Vol surface reading: strike, expiry, smile/skew, and surface shifts.

**UI deliverables**

- Add Month 3 modules to Learning Hub.
- Add a Vol Framework panel linked to the existing Vol Surface tool.
- Add RV/IV conceptual calculator:
  - historical realized volatility from sample static series,
  - implied volatility input,
  - expected move,
  - breakeven realized vol explanation.
- Add skew/term-structure cards with scenario examples.

**Content accuracy rules**

- Never reduce vol trading to "RV < IV, sell options."
- Always include jump risk, hedging frequency, transaction costs, liquidity, event risk, and vol risk premium.
- Commodity call skew must be described as product- and regime-dependent.

**Data deliverables**

- Add 40-50 vol scenarios:
  - earnings,
  - macro event,
  - skew steepening/flattening,
  - term-structure inversion,
  - vol crush,
  - false arbitrage.

**Acceptance criteria**

- Vol Framework explains at least RV/IV, skew, term structure, and event vol.
- Scenario Bank can filter by `vol`, `skew`, `term-structure`, and `event`.
- Existing Vol Surface remains educationally labeled.
- Tests cover new filters and a representative RV/IV calculation.

---

### Phase 4: Month 4 Dealer Hedging And Market Making

**Goal**: Build a dealer book management view: client flow, inventory, quote skew, hedge decisions, and P&L attribution.

**Learning modules**

1. Client flow and dealer inventory.
2. Delta hedging and rehedging triggers.
3. Gamma scalping with transaction costs.
4. Vega hedging across strike and expiry.
5. Bid/ask compensation and quote skewing.
6. P&L attribution: delta, gamma, vega, theta, carry, residual.

**UI deliverables**

- Dealer Workflow panel:
  - client order card,
  - dealer exposure after trade,
  - hedge action,
  - quote adjustment,
  - residual risk.
- Enhanced Gamma P&L view:
  - rehedge threshold,
  - transaction cost assumption,
  - static vs dynamic P&L,
  - realized vs implied vol explanation.
- P&L Attribution educational panel.

**Data deliverables**

- Add 40 dealer/market-making scenarios.
- Add quote adjustment drills.
- Add P&L attribution examples with explicit assumptions.

**Acceptance criteria**

- Dealer perspective is clearly separated from client perspective.
- User can answer "client buys X, what is dealer short/long?"
- Tests cover dealer exposure rendering and at least one P&L attribution example.

---

### Phase 5: Month 5 Exotics And Structuring Bridge

**Goal**: Use the user's commodities background as an edge for exotics and structured product interviews.

**Learning modules**

1. Asian options: averaging, path dependency, hedging challenge.
2. Barrier options: knock-in/out, monitoring, gap risk, barrier hedging.
3. Quanto options: asset/FX/correlation risk.
4. Digital options: discontinuous payoff and pin/gap risk.
5. Structured products: payoff decomposition, suitability, issuer/dealer risk.
6. Autocallables: coupon, barrier, callability, short vol/rates/correlation exposures.

**Scope guard**

Phase 5 is educational. Do not build a production exotics pricer.

**UI deliverables**

- Exotics Bridge tab.
- Payoff diagrams for simplified examples.
- "How to explain in interview" cards.
- Structuring workflow:
  - client objective,
  - payoff design,
  - embedded option legs,
  - key risks,
  - disclosure language.

**Data deliverables**

- Add 30-40 exotics/structuring scenarios.
- Add direct bridge examples from:
  - LME monthly average price options -> Asian options.
  - LME/FX-linked hedge -> quanto thinking.
  - physical delivery/logistics -> settlement and barrier/event risk.

**Acceptance criteria**

- Every exotic page labels model limits.
- Asian and quanto modules explicitly connect to user experience.
- Tests cover tab rendering, payoff visibility, and scenario answer reveal.

---

### Phase 6: Month 6 Interview Sprint And Readiness Dashboard

**Goal**: Turn accumulated learning into interview performance.

**Learning modules**

1. High-frequency technical questions.
2. Scenario interviews.
3. Trade idea articulation.
4. Risk manager challenge questions.
5. Behavioral framing: why derivatives, why desk, why your background matters.

**UI deliverables**

- Mock Interview mode:
  - timed session,
  - random or topic-filtered questions,
  - reveal rubric,
  - mark weak topic.
- Readiness Dashboard:
  - modules completed,
  - scenarios completed,
  - review-later count,
  - topic coverage,
  - weak areas,
  - suggested next session.
- Wrong-answer / review notebook.

**Data deliverables**

- Expand interview bank toward 250+ total learning/interview prompts across strategy, vol, dealer, exotics, and behavioral categories.
- Add answer rubrics:
  - must mention,
  - strong answer,
  - red-flag answer,
  - follow-up.

**Acceptance criteria**

- Dashboard is educational and does not overstate readiness.
- Readiness score is transparent and based on local progress only.
- Mock interview progress persists locally.
- Tests cover session creation, answer reveal, marking weak topics, and dashboard count updates.

---

## Cross-Cutting Product Rules

### Data Model Evolution

Keep learning content separate from app behavior:

- `data/learning-content.js` remains the learning data source.
- Add new arrays only when needed:
  - `strategyComparisons`
  - `clientDrills`
  - `volModules`
  - `dealerDrills`
  - `exoticsModules`
  - `mockInterviewQuestions`

Do not move large content bodies into `app.js`.

### Progress State

Use localStorage until there is a strong reason for a backend.

Current key:

- `os_d1_learning`

Future fields can include:

- `completedComparisons`
- `completedClientDrills`
- `weakTopics`
- `mockInterviewSessions`
- `readinessHistory`

Progress data must stay backward-compatible. New fields should merge with defaults.

### Testing Rules

Each phase must add or update Playwright tests for:

- rendering,
- tab/filter behavior,
- answer reveal or drill step reveal,
- progress persistence,
- links to existing strategy/tool panels,
- no regression in professional/interview modes.

Required commands before each completion:

```bash
node --check app.js
node --check data/professional-content.js
node --check data/learning-content.js
npm test
git diff --check
```

### Documentation Rules

Each phase must update:

- `README.md` for capability summary.
- `USER_GUIDE.md` for user-facing workflow.
- `docs/PROJECT_STATUS.md` for current status and next priorities.
- `docs/IMPLEMENTATION_HISTORY.md` for implementation history and verification.
- `docs/superpowers/plans/` with a task-level implementation plan before code changes.

### Financial Content Accuracy Rules

- Label simplified calculations as educational.
- Do not imply recommendations are trading advice.
- Distinguish client hedge, prop trade, and dealer hedge.
- Include liquidity, bid/ask, transaction cost, assignment, and margin where relevant.
- Do not universalize commodity skew.
- Do not present theoretical arbitrage as executable without costs and operational checks.

---

## Recommended Next Implementation

The next implementation should be **Phase 3: Month 3 Volatility Trading Framework**.

Reason:

- Phase 2B has now bridged strategy comparison into client recommendation language, suitability, risk disclosure, and follow-up questioning.
- The next capability gap is volatility as a tradable risk factor, not just a pricing input.
- RV/IV, event vol, skew, and term structure are the natural next layer after strategy construction and client structure selection.

Suggested next plan file:

```text
docs/superpowers/plans/2026-05-28-d1-phase3-volatility-trading-framework.md
```

Suggested first acceptance target:

- RV vs IV module and checklist.
- Event volatility and IV crush scenarios.
- Skew and term-structure reading drills.
- Strategy links into straddles, strangles, calendars, diagonals, collars, and verticals.
- Playwright coverage for new modules, scenarios, filters, progress persistence, and strategy links.
