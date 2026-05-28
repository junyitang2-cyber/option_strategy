# D1 Phase 2B Client Recommendation Drill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Month 2 client recommendation drill that trains users to convert client objectives and constraints into suitable option structures.

**Architecture:** Extend the existing static Learning Hub with a new `client-drills` tab, a `clientDrills` data array, Chinese localization entries, and localStorage-backed completion/step progress. Reuse existing strategy-link chips and Learning Hub rendering patterns so the feature stays static and browser-only.

**Tech Stack:** Static HTML/CSS/JavaScript, existing `data/learning-content.js`, localStorage, Playwright tests.

---

### Task 1: Lock Phase 2B Behavior With Playwright

**Files:**
- Modify: `tests/learning-hub.spec.js`

- [ ] Add a test that opens the Client Recommendation tab, expects 20 drill cards, verifies the first drill exposes only the objective initially, advances one step at a time, marks a drill complete, reloads, and checks progress persists.
- [ ] Add a test assertion that a drill strategy chip selects the existing strategy and renders the chart.
- [ ] Run `npx playwright test tests/learning-hub.spec.js` and confirm the new test fails because the tab and drills do not exist yet.

### Task 2: Add Learning Hub Shell For Client Drills

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`

- [ ] Add a `client-drills` Learning Hub tab and panel.
- [ ] Extend Learning Hub UI text with CN/EN labels for client drills, progress, drill step labels, and actions.
- [ ] Add `completedClientDrills` and `clientDrillStepCounts` defaults to `defaultD1LearningProgress()`.
- [ ] Add `renderLearningClientDrills()` and wire it into `renderLearningHub()`.
- [ ] Add click handlers for reveal, reset, complete, and strategy chips.
- [ ] Add compact grid/card/step styling consistent with existing Learning Hub cards.

### Task 3: Add Phase 2B Drill Data

**Files:**
- Modify: `data/learning-content.js`

- [ ] Add `window.D1_LEARNING_CONTENT.clientDrills` with 20 Month 2 drills.
- [ ] Add matching `window.D1_LEARNING_CONTENT_ZH.clientDrills` entries.
- [ ] Each drill includes objective, client profile, constraints, candidates, preferred recommendation, risk disclosure, dealer note, professional expression, follow-up questions, and strategy links.
- [ ] Keep visible wording as professional training rather than public-facing interview preparation.

### Task 4: Update User Docs And Status

**Files:**
- Modify: `README.md`
- Modify: `USER_GUIDE.md`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/IMPLEMENTATION_HISTORY.md`

- [ ] Record Phase 2B as implemented.
- [ ] Update counts to include 20 client recommendation drills.
- [ ] Set the next roadmap implementation to Phase 3 volatility trading framework.

### Task 5: Verify And Commit

**Files:**
- All touched files

- [ ] Run `node --check app.js`.
- [ ] Run `node --check data/professional-content.js`.
- [ ] Run `node --check data/learning-content.js`.
- [ ] Run `git diff --check`.
- [ ] Run `npx playwright test tests/learning-hub.spec.js`.
- [ ] Run `npm test`.
- [ ] Do a browser text sanity check for the new tab in CN and EN.
- [ ] Commit and push to `origin/main`.
