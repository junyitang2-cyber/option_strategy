# Pro Skin Terminal Upgrade — "Heritage Terminal" Design

**Date:** 2026-06-11
**Status:** Approved direction (Direction B, full Bloomberg-ization confirmed by user)
**Scope:** Visual upgrade of the Pro skin only. Easy skin pixel-identical. No content/data changes.

---

## Background

The current Pro skin is a consumer-grade dark theme (8px radii, soft 46px shadow, Inter everywhere, relaxed padding). The user wants a true trading-terminal aesthetic: amber-on-black Bloomberg heritage, monospace numerals, flat density.

User decisions already made:
1. Direction B over A/C — full identity change, not just form tightening.
2. Amber replaces cyan **everywhere** including chart main lines (not chrome-only).

## Architecture Principle

**Every rule in this upgrade is scoped under `body.skin-pro`.** The Easy skin (`body.skin-easy`) and the base (unscoped) CSS are untouched, mirroring how the Easy skin was layered. `body.skin-pro` is applied before first paint by the inline FOUC script, so the terminal look has no flash.

This works because Easy already overrides tokens under `body.skin-easy` — Pro now does the same under `body.skin-pro`, and the unscoped base CSS becomes the shared fallback skeleton.

---

## Token Overrides (`body.skin-pro`)

| Token | Current (base) | Pro Terminal | Rationale |
|---|---|---|---|
| `--bg` | #0b0c10 | **#050505** | OLED near-black |
| `--rail` | #0d1017 | **#070708** | |
| `--panel` | #151720 | **#0c0d10** | |
| `--panel-2` | #1c202b | **#12141a** | |
| `--panel-3` | #10131a | **#08090b** | |
| `--line` | #303646 | **#23262f** | tighter hairline |
| `--cyan` | #39c7e5 | **#ffb000** | THE identity swap — every active/focus/heading/tab/current-line picks it up automatically |
| `--amber` | #e6b84a | **#e6b84a** (unchanged) | stays for rho/warnings; see collision fixes |
| `--text` | #f4f6fb | **#f2f0e9** | warm white (amber-friendly) |
| `--muted` | #aeb6c7 | **#a8a496** | warm grey |
| `--subtle` | #778195 | **#6e6a5e** | warm grey |
| `--shadow` | 0 18px 46px… | **none** | terminals are flat |

green/red/violet/blue tokens unchanged (P&L semantics universal).

## Chart Collision Fixes (Pro scope only)

With `--cyan` → amber, three collisions must be resolved:

| Element | Current | Pro Terminal fix |
|---|---|---|
| Spot/current-price line | `var(--amber)` dashed | **white dashed** `rgba(242,240,233,0.55)`, dasharray 4 4 |
| Theta curve (was cyan via token) | would become amber → clashes with rho gold | **`var(--blue)` #639bff** via Pro-scoped stroke override |
| Breakeven lines | `var(--amber)` dashed | keep amber dashed — now reads as "strategy reference geometry" family with the amber main line; distinct from white spot line |

Main payoff current line = amber (Bloomberg signature). Expiry line stays green. Profit/loss fills unchanged.

## Typography

- Import `IBM Plex Mono` via a non-blocking Google Fonts `<link>` in the `index.html` `<head>` (CSS `@import` cannot live at the end of styles.css — it is only valid at the top of a stylesheet). Full offline fallback stack: `'IBM Plex Mono', 'SF Mono', Monaco, Consolas, monospace` — the app must remain fully usable offline.
- Pro scope applies mono + `font-variant-numeric: tabular-nums` to: metric values, chart tick text, stress/data tables, sidebar item meta, badges, sprint scores, portfolio numbers, topbar strategy tag.
- Body copy and ALL Chinese text stay Inter (CJK in mono is unacceptable).
- Kickers: letter-spacing 1.5px → 2px, size down 1px in Pro.

## Form & Density (from Direction A, Pro scope)

| Element | Current | Pro Terminal |
|---|---|---|
| Panel/card/button radius | 8px | **2px** |
| Panel shadow | 0 18px 46px rgba(0,0,0,.28) | **none** |
| Panel padding | 18px | **14px** |
| Metric card padding | 10px | **8px 10px** |
| Chart container bg | #090c12, radius 8 | **#050505, radius 0, flush** (border kept 1px hairline) |
| Sidebar strategy items | padding 10px, radius 8 | **padding 7px 9px, radius 2** |
| Data tables (stress etc.) | flat rows | **zebra striping** odd rows `rgba(255,176,0,0.03)`, header bottom border amber |

## Terminal Chrome

1. **Topbar → status bar:** strategy title in Pro renders mono uppercase with letter-spacing and an amber `▮` prefix block (CSS ::before, no JS). Subtitle stays sans muted.
2. **F-key tabs:** Pro-scope CSS counters prefix tool tabs and learning tabs with `F1 ` … `Fn ` (`counter-increment` on the tab row, `::before` content). Zero JS, zero test impact (text assertions use `toContainText`, prefixes don't break containment).
3. **Skin toggle pill:** Pro-active button color changes from `#39c7e5` to `#ffb000` (one string in `renderSkinToggle()` in app.js — the only JS change in this feature).

## Out of Scope

- Easy skin (zero changes)
- Any data/content files
- Glow/scanline effects (rejected Direction C)
- Layout/grid restructuring, responsive work
- Renaming the `--cyan` token (cosmetic debt accepted; rename would touch the whole file)

## Acceptance Criteria

1. `node --check app.js` clean; `npm test` all pass (32); `git diff --check` clean.
2. Easy skin pixel-identical: every new rule scoped `body.skin-pro` (greppable); Easy screenshots before/after match.
3. Pro skin: near-black bg, amber active states/tabs/focus/headings, amber P&L main line, white dashed spot line, blue theta curve, mono tabular numerals on all data, 2px radii, no panel shadow, zebra tables, F-key tab prefixes.
4. Offline run (file://, no network): app fully usable with fallback mono stack.
5. Skin toggle Pro-active shows amber.
6. Contrast: amber #ffb000 on #050505 ≈ 9.4:1, warm white on panels ≥ 12:1 — all AA+.
