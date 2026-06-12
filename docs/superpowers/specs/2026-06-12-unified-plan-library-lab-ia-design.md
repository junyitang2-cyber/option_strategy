# Unified IA: Transformation Plan + Strategy Library + Lab + Practice — Design

**Date:** 2026-06-12
**Status:** Approved (structure + architecture + phasing confirmed by user)
**Scope:** Information-architecture redesign of the single-page app. Reorganize how existing content is presented; no new learning content, no data-shape rewrites. Phased across 4 implementation PRs.

---

## Problem

Today the app is two glued-together worlds stacked vertically:

1. A **strategy browser** — left rail (71 strategies, search + 8 category filters) drives a main workspace showing the selected strategy's payoff chart, Greeks, and metrics.
2. A **Learning Hub** — a large panel below, with 12 flat tabs (roadmap, modules, bridge, construction, client-drills, vol-framework, dealer-desk, exotics-bridge, exotics-risk, research-bridge, professional-sprint, scenarios).

They share data but feel disconnected. Modules already declare `strategyLinks` (each module lists the strategies it teaches — 100 links across 25 modules) and `practiceIds` (linked scenarios), and clicking a strategy link already calls `selectStrategy()`. The connective tissue exists in the data; it just isn't the spine of the UI.

**Goal:** Make the app a single **trader transformation plan**. Strategies are embedded into the modules that teach them (learning mode). The strategy library and the interactive lab also stand alone as independent destinations for use after learning.

---

## Decisions (locked)

| # | Decision | Choice |
|---|---|---|
| 1 | Top-level model | Four destinations: **转型计划 / 策略库 / 实验室 / 练习场**. Learning embeds strategies (pattern A); Library + Lab stand alone (pattern C) — coexist. |
| 2 | Sector internal layout | **Module stream** (no sub-tabs). Opening a Sector shows a vertical stream of its modules; sector-specific deep content folds into the owning module. |
| 3 | Practice placement | **Sprint = capstone** at the end of the plan (after Sector E). **Scenario Bank (211) = standalone 练习场** destination. Modules still surface relevant scenarios inline. |
| 4 | Lab access | One reusable Lab component, three entry points: plan chip → **overlay**; library item → fills Lab; Lab destination → **fullscreen**. |
| 5 | Default landing | **转型计划** (replaces "open to a strategy"). |
| 6 | Preserved orthogonal features | 初级/进阶/专业 content-depth toggle, CN/EN language, Easy/Pro skin — all unchanged, all still apply across destinations. |

---

## Top-Level Structure

Left primary nav with four destinations; main area renders the active destination. The existing top controls (CN/EN, 初级/进阶/专业, Easy/Pro pill) remain.

```
转型计划   ← default. Learning spine.
策略库     ← 71-strategy searchable grid (standalone).
实验室     ← full chart/Greeks/slider lab, fullscreen (standalone).
练习场     ← Scenario Bank 211, sector-filterable (standalone).
```

### 转型计划 (Plan)

- **Sector spine:** A 风险机制 · B 策略构建 · C 市场动态 · D 研究桥接 · E 复杂产品 · 🏁 专业冲刺 (capstone).
- Opening a Sector → **module stream**: a vertical list of that sector's modules.
- Each **module card** = concept (D1 anchor / derivatives upgrade / dealer lens / interview takeaway) + **embedded strategy chips** (from `strategyLinks`) + **inline practice** (from `practiceIds`) + **folded sector-specific content** expandable in place:
  - Sector C modules fold in the Vol-framework calculator and Dealer workflow / P&L-attribution content.
  - Sector D modules fold in the Research-bridge cases / view-to-trade drills.
  - Sector E modules fold in the Exotics bridge / structuring / model-limit content.
  - Sectors A/B modules fold in the D1-bridge comparisons, strategy-construction, and client-drill content.
- Clicking a strategy chip → **opens the Lab overlay** (user stays in plan context).
- The 12 old learning tabs dissolve entirely into this sector → module hierarchy.

### 策略库 (Library)

- Reuses the current strategy list rendering, presented as a filterable grid: search + the 8 existing categories (复杂/收租/波动率/跨期/合成/方向/向导/股票覆盖).
- Clicking any strategy → switches to the **实验室 destination (fullscreen)** with that strategy loaded (sets `state.labStrategy` + `state.destination="lab"`). The overlay form is reserved for the in-plan chip flow.

### 实验室 (Lab)

- The full interactive analysis surface: payoff chart, Greeks mini-charts, metric cards, scenario sliders, leg editor — the current strategy-detail workspace, unchanged in capability.
- Reachable directly as a destination (fullscreen) for day-to-day use after learning.

### 练习场 (Practice)

- The Scenario Bank: 211 scenarios, sector filter (第 A/B/C/D/E 区) + topic filter — reuses the current scenario rendering.
- Sprint (60) does **not** live here; it is the plan's capstone. Practice = drillable question bank for ongoing use.

---

## Architecture

ES5-style globals, render-to-innerHTML, no build step — consistent with the existing codebase.

### Lab as a reusable component

The current strategy-detail view is tightly coupled to a fixed workspace slot and the `selectStrategy → renderAll → full-workspace re-render` path. Extract a container-agnostic renderer:

```js
renderLab(containerEl, strategyId)   // render the full lab (chart + greeks + metrics + controls) into any container
openLabOverlay(strategyId)           // show a fixed-position overlay host and renderLab into it
closeLabOverlay()                    // hide overlay
```

- Two host containers, identical `renderLab` output:
  - **Fullscreen:** the 实验室 destination's main region.
  - **Overlay:** a `position:fixed` drawer/modal with backdrop; closed by a button, backdrop click, or Esc.
- **New state** (added to the existing `os_d1_learning` localStorage blob):
  - `state.labStrategy` — strategy id currently loaded in the lab.
  - `state.labOverlayOpen` — overlay visibility.
- Routing on strategy click: in plan context → `openLabOverlay(id)`; in library/lab context → `renderLab(destinationMain, id)`.

### Navigation shell

- `state.destination ∈ {"plan","library","lab","practice"}`, persisted; defaults to `"plan"`.
- `renderShell()` renders the four-item left nav and dispatches to the active destination renderer.
- Four destination renderers, maximizing reuse of existing code:
  - `renderPlan()` — **new**: sector spine + module stream (composes existing module/bridge/vol/dealer/exotics/research/client-drill renderers as folded module content).
  - `renderLibrary()` — reuse the current strategy-list rendering as a grid.
  - `renderLabView()` — `renderLab(mainEl, state.labStrategy)` fullscreen.
  - `renderPractice()` — reuse the current scenario-bank rendering.

### Data reuse (no data-shape changes)

- `D1_LEARNING_CONTENT.modules[].strategyLinks` → the embedded strategy chips.
- `D1_LEARNING_CONTENT.modules[].practiceIds` → inline practice.
- `D1_LEARNING_CONTENT.roadmap` (sectors A–E + sprint) → the sector spine.
- `STRATEGIES` (71) → library grid and lab.
- `D1_LEARNING_CONTENT.scenarios` (211) → 练习场; existing sector filter reused.
- Sprint content → plan capstone.

---

## Phasing

Each phase is an independently shippable PR with tests green, executed via subagent-driven-development (implementer → spec review → quality review).

| Phase | Content | User-visible change | Risk |
|---|---|---|---|
| **P1 — Lab componentization** | Extract `renderLab(container, id)` + overlay host; still rendered in the current slot. Pure refactor. | None | High code / zero UX — lay the foundation, tests guard against regression. |
| **P2 — Nav shell + Library + Lab** | Four-destination left nav, `state.destination` (default plan), 策略库 grid, 实验室 fullscreen. Plan + Practice temporarily host the existing Learning Hub content as-is. | New top-level skeleton appears; old content still reachable. | Medium |
| **P3 — Plan = module stream + embedded chips + overlay** | Rebuild 转型计划: sector spine → module stream, strategy chips → Lab overlay, folded sector content. The 12 old tabs dissolve here. | Core new experience ships. | Medium-high (content reorg) |
| **P4 — Practice + Sprint capstone + cleanup** | 练习场 (scenario bank 211), Sprint as plan capstone, retire the old 12-tab Learning Hub shell, localStorage migration, tests + docs. | Polish + retirement of old shell. | Low |

P1 first means the riskiest refactor is locked in before any UX churn; later phase boundaries can shift without disturbing the foundation.

---

## Migration / Compatibility

- **Default landing** changes from a selected strategy to 转型计划; first-run and returning users open to the plan.
- **localStorage** key `os_d1_learning` gains `destination`, `labStrategy`, `labOverlayOpen`; loader tolerates their absence (defaults applied) so existing saved state never breaks.
- **Existing data** (71 strategies, 25 modules, 211 scenarios, 60 sprint, roadmap) is unchanged — only its presentation is reorganized.
- **Orthogonal features** (初级/进阶/专业, CN/EN, Easy/Pro) keep working across all destinations.
- **Tests:** existing Playwright specs that assert the old 12-tab Learning Hub will be updated in the phase that retires it (P3/P4); each phase keeps the suite green.

---

## Out of Scope

- New learning content, strategies, or scenarios.
- Data-shape rewrites (module/scenario/strategy schemas unchanged).
- The Pro terminal / Easy skin visual systems (untouched).
- Responsive/mobile layout work.
- Changes to the 初级/进阶/专业 or CN/EN logic.

---

## Acceptance Criteria

1. `node --check app.js` clean; `npm test` green at the end of every phase; `git diff --check` clean.
2. App opens to 转型计划 by default; left nav switches between 转型计划 / 策略库 / 实验室 / 练习场.
3. In the plan, opening a Sector shows a module stream; module cards show embedded strategy chips and inline practice; sector-specific content (vol/dealer/exotics/research) appears folded in the owning module — no standalone 12-tab shell remains after P4.
4. Clicking a strategy chip in the plan opens the Lab overlay without leaving the plan; the Library and the Lab destination use the same Lab component (fullscreen).
5. 练习场 shows the 211-scenario bank with the existing sector filter; Sprint appears as the plan capstone after Sector E.
6. 初级/进阶/专业, CN/EN, and Easy/Pro continue to work across destinations.
7. Returning users with pre-existing `os_d1_learning` state load without error (new fields default).
