# D1 Phase 7B Full Professional Coverage Design

**Date**: 2026-05-29
**Status**: Approved for implementation
**Goal**: Complete Trader Memo and professional Q&A coverage for every strategy in the platform.

## Context

Phase 7A raised professional coverage from 40 to 53 of 71 strategies. The remaining 18 strategies are concentrated in ladders, synthetics/combos, short guts, double diagonals, framework guides, stock-overlay structures, double spreads, and short calendars.

## Scope

Phase 7B covers the remaining 18 uncovered strategies:

1. `bull-call-ladder`
2. `bear-call-ladder`
3. `bull-put-ladder`
4. `bear-put-ladder`
5. `short-synthetic-future`
6. `synthetic-put`
7. `long-combo`
8. `short-combo`
9. `short-guts`
10. `double-diagonal`
11. `vega-套利`
12. `delta-neutraldelta-中性`
13. `covered-put`
14. `stock-repair-covered-ratio-spread`
15. `double-bull-spread`
16. `double-bear-spread`
17. `short-call-calendar-spread`
18. `short-put-calendar-spread`

Each strategy receives:

- Trader Memo fields matching the existing `PROFESSIONAL_CONTENT` shape.
- At least 3 professional Q&A items.
- At least 3 common wrong-expression guidance items.

## Out Of Scope

Phase 7B does not normalize older sparse strategies that already have professional content but fewer than 3 questions. That becomes Phase 7C quality normalization.

## Acceptance Criteria

1. Professional Trader Memo coverage reaches 71 of 71 strategies.
2. Phase 7B adds at least 54 new professional Q&A items.
3. Every Phase 7B target has `commonMistakes`.
4. The old uncovered-strategy fallback remains in code but no longer appears for any current strategy.
5. Browser tests verify one synthetic strategy and one framework strategy render professional content.
6. README, Project Status, and Implementation History reflect full professional coverage.

