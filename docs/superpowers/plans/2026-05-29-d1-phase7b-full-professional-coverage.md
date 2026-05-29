# D1 Phase 7B Full Professional Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete professional Trader Memo, professional Q&A, and common wrong-expression coverage for all remaining strategies.

**Status:** Implemented on 2026-05-29. Professional Trader Memo coverage is now 71/71 and strategy-level professional Q&A count is 234.

**Architecture:** Extend `data/professional-content.js` using the existing Phase 7A `phase7aMemo` helper. Expand content tests to assert 71/71 coverage and add browser coverage for newly filled synthetic/framework strategies.

**Tech Stack:** Plain JavaScript, static HTML/CSS, Playwright, Node syntax checks.

---

## Target Strategies

```js
const PHASE7B_TARGET_IDS = [
  "bull-call-ladder",
  "bear-call-ladder",
  "bull-put-ladder",
  "bear-put-ladder",
  "short-synthetic-future",
  "synthetic-put",
  "long-combo",
  "short-combo",
  "short-guts",
  "double-diagonal",
  "vega-套利",
  "delta-neutraldelta-中性",
  "covered-put",
  "stock-repair-covered-ratio-spread",
  "double-bull-spread",
  "double-bear-spread",
  "short-call-calendar-spread",
  "short-put-calendar-spread",
];
```

## Tasks

### Task 1: Expand Content Coverage Tests

- [x] Add `PHASE7B_TARGET_IDS` to `tests/professional-content.spec.js`.
- [x] Add a test requiring every Phase 7B target to have professional content, at least 3 Q&A items, and at least 3 common mistakes.
- [x] Change the coverage count expectation from 53 to 71 and assert no current strategies are missing.
- [x] Run `npx playwright test tests/professional-content.spec.js` and confirm RED before adding content.

### Task 2: Expand Browser Tests

- [x] Update the Phase 7A browser test fallback strategy from `Short Synthetic Future` to a Phase 7B-covered expectation.
- [x] Add browser assertions for `Short Synthetic Future` and `Vega 套利`.
- [x] Run `npx playwright test tests/professional.spec.js --grep "phase 7"` and confirm RED before adding content.

### Task 3: Add Phase 7B Professional Content

- [x] Add 18 `phase7aMemo({...})` entries to `data/professional-content.js`.
- [x] Ensure every entry has strategy-specific exposure, P&L logic, client suitability, dealer risk, `commonMistakes`, and 3 Q&A items.
- [x] Run `node --check data\professional-content.js`.
- [x] Run the Phase 7B targeted tests until GREEN.

### Task 4: Update Documentation

- [x] Update README professional coverage from 53 to 71 and Q&A count from 180 to 234.
- [x] Add Phase 7B status to `docs/PROJECT_STATUS.md`.
- [x] Add Phase 7B implementation entry to `docs/IMPLEMENTATION_HISTORY.md`.

### Task 5: Full Verification and Commit

- [x] Run `node --check app.js`.
- [x] Run `node --check data\professional-content.js`.
- [x] Run `node --check data\learning-content.js`.
- [x] Run `node --check data\phase6-content.js`.
- [x] Run `git diff --check`.
- [x] Run `npm test`.
- [x] Commit with `feat: add D1 phase 7B full professional coverage`.
