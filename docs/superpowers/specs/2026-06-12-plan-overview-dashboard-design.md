# 转型计划 Overview → Progress Dashboard — Design

**Date:** 2026-06-12
**Status:** Approved (direction + design confirmed by user)
**Scope:** Rework the 转型计划 "总览" view from a static duplicate of the sector spine into a progress dashboard, and remove the vestigial 开放/未开放 gating. Presentation + small data cleanup only; no content/schema changes.

---

## Problem

In the new IA, the 转型计划 destination has a sector spine (总览 · A · B · C · D · E · 🏁冲刺). Selecting **总览** renders `renderLearningRoadmap()` — six roadmap cards (A–E + Sprint) that **duplicate** the six spine tabs directly above them. Worse, each card shows an 开放/未开放 status from the roadmap data, where A–E are `active` ("开放") but Sprint is `locked` ("未开放"). The "SPRINT · 未开放" label **contradicts** the new navigation: 🏁冲刺 is a freely clickable spine item (`applySector("sprint")` has no gate), so the lock is misleading. The 开放/未开放 concept is a vestige of an old phased-unlock design; the redesigned navigation has no gating.

## Solution

Turn 总览 into a **progress dashboard** that earns its place instead of mirroring the spine:

1. **Overall progress + continue CTA** at the top: the existing aggregate metrics (模块 X/30 · 场景 X/211 · 演练 X/20 · 专业冲刺 X/60 · 研究演练 X/15) plus a **"继续学习 → <next incomplete sector>"** button that calls `applySector(nextSector)`.
2. **Six sector cards, reworked** — each is now an **actionable entry point**:
   - **Clickable** → `applySector(sector)` (jumps to that sector; complements the always-visible spine).
   - **Per-sector progress**: A/B/C/E show modules-done/total for that sector (e.g. "Sector C · 3/11 模块") with a thin progress bar; D shows research drills "X/15"; Sprint shows "X/60".
   - Keep the focus summary + deliverables list.
   - **No 开放/未开放 label** — removed entirely.
3. **Data cleanup**: remove the sprint roadmap item's `status: "locked"` and the four vestigial `window.D1_LEARNING_CONTENT.roadmap[N].status = "active"` mutations in `data/learning-content.js` (they are now either no-ops or the cause of the Sprint contradiction).

## Definitions

- **Per-sector module progress** (A/B/C/E): `completedModules ∩ {modules with that sector}` over the count of modules in that sector. Sectors and their module counts come from the live data (e.g., A=9, B=4, C=11, E=6); compute, don't hardcode.
- **Sector D progress**: `completedViewToTradeDrills` over the count of `viewToTradeDrills` (15).
- **Sprint progress**: `completedSprintQuestions` over the sprint question total (60).
- **Next incomplete sector** (for the CTA): the first sector in spine order `A, B, C, D, E, sprint` whose progress is < 100%. If all are complete, the CTA reads "全部完成 🎉" and points to 练习场 (or is hidden) — implementer's choice, kept simple.

## Architecture

- All changes are in `renderLearningRoadmap()` (app.js) — rebuilt to render the dashboard — plus a small helper to compute per-sector progress, and the data cleanup in `data/learning-content.js`.
- Reuse existing state: `state.learning.completedModules`, `completedScenarios`, `completedClientDrills`, `completedSprintQuestions`, `completedViewToTradeDrills`; `learningContent().modules/roadmap/viewToTradeDrills`.
- Card clicks reuse the existing delegated `[data-sector-spine]` handler? No — cards use a distinct attribute (e.g. `data-sector-jump`) handled by `applySector`, OR reuse `data-sector-spine` since the action is identical. Use `data-sector-spine` so one handler serves both spine and cards (DRY).
- No schema changes; the roadmap data keeps its `title/focus/deliverables/sector`; only `status` (and its mutations) are removed.

## Out of Scope

- Changing the sector spine, other destinations, or any learning content.
- Per-module-level content folding (separate future refinement).
- New progress metrics beyond what state already tracks.

## Acceptance Criteria

1. `node --check app.js` + `node --check data/learning-content.js` clean; `npm test` green; `git diff --check` clean.
2. 总览 shows the aggregate progress + a "继续学习" CTA that jumps to the next incomplete sector.
3. Each of the six sector cards is clickable and jumps to its sector via `applySector`; cards show per-sector progress (A/B/C/E modules x/total, D research drills x/15, Sprint x/60).
4. The string "未开放" / "开放" no longer appears on any 总览 card; "SPRINT · 未开放" is gone.
5. `data/learning-content.js` no longer contains `status: "locked"` on the sprint roadmap item nor the four `roadmap[N].status = "active"` mutations.
6. Easy/Pro skins both render the dashboard legibly (CSS uses tokens).
