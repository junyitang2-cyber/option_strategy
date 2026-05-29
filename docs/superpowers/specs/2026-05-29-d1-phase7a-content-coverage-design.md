# D1 Phase 7A Content Coverage Design

**Date**: 2026-05-29
**Status**: Proposed
**Goal**: Fill the highest-value professional content gaps before expanding market-data realism.

## Context

The platform currently has 71 option strategies. Professional Trader Memo and professional Q&A content covers 40 strategies, leaving 31 strategies without dedicated professional content. Phase 7A should not attempt to fill every remaining gap at once. The first slice should prioritize strategies that are common enough to matter and nuanced enough to teach risk, suitability, and dealer exposure well.

## Recommended Scope

Phase 7A will add professional coverage for the first high-value wave of 13 strategies:

1. `bull-put-spread`
2. `long-put-butterfly`
3. `put-broken-wing`
4. `inverse-call-broken-wing`
5. `call-broken-wing`
6. `inverse-put-broken-wing`
7. `covered-short-straddle`
8. `covered-short-strangle`
9. `short-call-condor`
10. `short-put-condor`
11. `reverse-jade-lizard`
12. `call-ratio-spread`
13. `put-ratio-spread`

These cover credit spreads, butterfly variants, broken-wing structures, covered short-vol structures, short condors, jade-lizard variants, and ratio spreads. This is the best first slice because it improves the professional layer for strategies that frequently create misunderstanding around max loss, assignment, short gamma, skew, and client suitability.

## Content Standard

Each selected strategy should receive:

- Trader Memo fields matching the existing `PROFESSIONAL_CONTENT` structure:
  - `exposure`
  - `profitLogic`
  - `clientPerspective`
  - `dealerPerspective`
  - `interviewQuestions`
- 3 to 5 professional Q&A items.
- A new `commonMistakes` or equivalent field for common wrong expressions, for example:
  - calling defined-risk structures "low risk" without discussing max loss probability
  - treating ratio spreads as simple cheap spreads while hiding naked tail risk
  - saying covered short-vol is hedged just because stock is held
  - ignoring assignment, dividend, liquidity, and margin constraints

The visible page should keep the current external wording style: use "专业问答", "专业表达", "常见误区", "风险拆解", and avoid making the module visibly look like interview prep.

## UI Design

The professional panel should continue to show Trader Memo first, then professional Q&A. If `commonMistakes` exists for a strategy, render a compact "常见错误表达" section in the professional panel. Existing strategies without the new field should continue to render normally.

The professional Q&A section should remain strategy-specific and should not change the broader Phase 6 Professional Sprint flow.

## Data Flow

The implementation should stay static and local:

- Add records to `data/professional-content.js`.
- Keep strategy IDs aligned with `data/strategies.js`.
- Update app rendering only if needed for `commonMistakes`.
- Do not add backend, live market data, or external API calls.

## Out Of Scope

Phase 7A will not:

- Fill all remaining 31 uncovered strategies.
- Add real option-chain imports, bid/ask modeling, IV Rank, or market-data tools.
- Rewrite existing Professional Content architecture.
- Change existing strategy payoff calculations.
- Rename the current Professional mode or Phase 6 Professional Sprint.

## Acceptance Criteria

Phase 7A is complete when:

1. The 13 target strategies all have Trader Memo content.
2. Each target strategy has at least 3 professional Q&A items.
3. Each target strategy has visible common wrong-expression guidance.
4. Existing 40 covered strategies still render normally.
5. The fallback message for uncovered strategies still works for strategies outside Phase 7A.
6. Tests verify coverage counts and at least one rendered target strategy.
7. Documentation updates identify Phase 7A as content coverage, not market realism.

## Verification Plan

Run:

- `node --check app.js`
- `node --check data/professional-content.js`
- `node --check data/learning-content.js`
- `node --check data/phase6-content.js`
- `git diff --check`
- `npm test`

Add or update Playwright coverage for:

- selecting a newly covered strategy such as `Bull Put Spread`
- Professional panel rendering Trader Memo
- professional Q&A rendering at least 3 items
- common wrong-expression section rendering
- an uncovered strategy still showing the fallback state

## Follow-Up Phase

After Phase 7A, Phase 7B can either:

- cover the remaining 18 strategies without professional content, or
- normalize sparse existing content so every covered strategy has at least 3 professional Q&A items.

