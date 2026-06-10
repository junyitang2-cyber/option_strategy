# Easy / Pro Dual-Skin System Design

**Date:** 2026-06-10
**Status:** Approved
**Scope:** Add a visual skin toggle (Easy / Pro) to the existing option strategy platform. Pure CSS-layer change — no content logic, no JS data changes.

---

## Background

The platform currently has a single dark visual style and a 3-mode content toggle (Basic / Advanced / Professional). Users want the option to switch between two visually distinct experiences:

- **Easy skin** — light mode, bright colors, friendly for beginners or casual review
- **Pro skin** — deep dark terminal style, monospace numbers, data-dense, for professional use

These are orthogonal to content depth. A user studying in Professional content mode may prefer the Easy visual skin for readability, or the Pro skin for terminal authenticity.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Toggle model | Pure visual skin (Option C) | Existing 3-mode content toggle unchanged; minimal code impact |
| Toggle placement | Floating pill, bottom-right corner | Doesn't add to topbar clutter; always visible; feels like a global preference |
| Content mode location | Top-right (unchanged) | Basic / Advanced / Professional stays where it is |
| Scope | All 4 UI areas | Sidebar rail, charts, metric panels, Learning Hub |

---

## Color Systems

### Easy Skin (Light Mode)

| Token | Value | Usage |
|---|---|---|
| `--easy-bg` | `#F8FAFC` | Page and panel background |
| `--easy-surface` | `#FFFFFF` | Card / panel surface |
| `--easy-border` | `#E2E8F0` | All borders |
| `--easy-text` | `#0F172A` | Primary text |
| `--easy-muted` | `#64748B` | Labels, secondary text |
| `--easy-primary` | `#2563EB` | Accent, active tabs, chart current line |
| `--easy-green` | `#16A34A` | Profit, positive values |
| `--easy-red` | `#DC2626` | Loss, negative values |
| `--easy-green-bg` | `#F0FDF4` | Profit card tint |
| `--easy-green-border` | `#BBF7D0` | Profit card border |
| `--easy-red-bg` | `#FFF1F2` | Loss card tint |
| `--easy-red-border` | `#FECACA` | Loss card border |
| `--easy-primary-bg` | `#EFF6FF` | Primary/neutral card tint |
| `--easy-primary-border` | `#BFDBFE` | Primary/neutral card border |
| `--easy-shadow` | `0 1px 4px rgba(0,0,0,0.06)` | Card shadows |
| `--easy-sector-a` | `#2563EB` | Sector A (Risk Mechanics) stripe |
| `--easy-sector-b` | `#6366F1` | Sector B (Trade Construction) stripe |
| `--easy-sector-c` | `#7C3AED` | Sector C (Market Dynamics) stripe |
| `--easy-sector-d` | `#D97706` | Sector D (Research Bridge) stripe |
| `--easy-sector-e` | `#059669` | Sector E (Complex Products) stripe |

### Pro Skin (Terminal Dark — existing system, unchanged)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0b0c10` | Page background |
| `--panel` | `#151720` | Primary panel |
| `--panel-2` | `#1c202b` | Secondary surface |
| `--panel-3` | `#10131a` | Inset / chart bg |
| `--line` | `#303646` | Borders |
| `--text` | `#f4f6fb` | Primary text |
| `--muted` | `#aeb6c7` | Secondary text |
| `--cyan` | `#39c7e5` | Accent / active |
| `--green` | `#48d47a` | Profit |
| `--red` | `#f06474` | Loss |
| `--amber` | `#e6b84a` | Warning / breakeven |

---

## Component Specifications

### 1. Floating Easy/Pro Toggle

**Placement:** Fixed, bottom-right corner (`position: fixed; bottom: 20px; right: 20px; z-index: 50`)

```
Easy skin active:          Pro skin active:
┌─────────────────────┐    ┌─────────────────────┐
│ [Easy]   Pro        │    │  Easy   [Pro]        │
└─────────────────────┘    └─────────────────────┘
Pill background: #1c202b (dark) in both modes — always visible against any bg
Active side: filled, colored; inactive side: muted text only
```

- Easy active: filled `#2563EB`, white text
- Pro active: filled `#39c7e5`, black text
- Pill wrapper background: always `#1c202b` (dark) regardless of active skin — ensures visibility against both light and dark page backgrounds
- Pill border: `1px solid #303646`
- Border-radius: `999px`
- Padding: `4px 5px` wrapper, `5px 14px` per button
- Font: `11px, font-weight: 700`
- Persists in `localStorage` under `os_d1_skin` key (`"easy"` | `"pro"`)
- Default: `"pro"` (preserves existing look for returning users)

---

### 2. Strategy Rail (Sidebar)

**Pro skin** (current behavior, unchanged):
- Background: `var(--rail)` `#0d1017`
- Strategy items: `background: var(--panel-2)`, `border: 1px solid var(--line)`, `border-radius: 8px`
- Selected: `border-color: rgba(57,199,229,0.75)`, `background: rgba(57,199,229,0.12)`
- Text: `var(--text)` primary, `var(--muted)` secondary

**Easy skin** changes:
- Background: `#F1F5F9`
- Strategy items: `background: #FFFFFF`, `border: 1.5px solid #E2E8F0`, `border-radius: 12px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.05)`
- Selected: `background: #EFF6FF`, `border-color: #BFDBFE`
- Text: `#0F172A` primary, `#64748B` secondary
- Category/eyebrow labels: `color: #94A3B8`
- Filter pills active: `background: #DBEAFE`, `border-color: #93C5FD`, `color: #1D4ED8`

---

### 3. Charts (SVG)

Both skins share the same SVG structure. Only fill colors and stroke colors change via CSS variables or inline style overrides applied by the skin class on `<body>`.

**Profit/loss fills — both skins always present:**

| Element | Easy | Pro |
|---|---|---|
| Profit area fill | `rgba(22,163,74,0.22)` gradient | `rgba(72,212,122,0.18)` gradient |
| Loss area fill | `rgba(220,38,38,0.18)` gradient | `rgba(240,100,116,0.18)` gradient |
| Breakeven line | `#F59E0B` dashed | `#e6b84a` dashed, labeled `BE` |

**Curve colors:**

| Element | Easy | Pro |
|---|---|---|
| Current P&L line | `#2563EB`, 2.5px | `#39c7e5`, 2px |
| Expiry line | `#16A34A`, 1.8px dashed | `#48d47a`, 1.5px dashed |
| Zero axis | `#CBD5E1` 1px | `rgba(244,246,251,0.2)` 1px |
| Grid lines | `#E2E8F0` 0.5px | `#161b26` 0.5px |
| Tick labels | `#94A3B8` 11px | `#303646` 7px monospace |

**Chart container:**

| | Easy | Pro |
|---|---|---|
| Background | `#FAFBFE` | `#050709` |
| Border | `1.5px solid #E2E8F0` | `1px solid #1e2535` |
| Border-radius | `16px` | `0` (flush) |

**Greeks mini-charts** follow the same color rules. Greek color assignments unchanged — Delta=red, Gamma=violet, Theta=cyan, Vega=green, Rho=amber — only the stroke/background adapt to skin.

---

### 4. Metric Cards

**Pro skin** (current):
- `background: var(--panel-3)`, `border-left: 3px solid <greek-color>`
- Labels: `8px, uppercase, letter-spacing: 1.5px, color: var(--muted)`
- Values: `18-20px, font-weight: 700, font-family: monospace, color: <semantic-color>`

**Easy skin**:
- Positive card: `background: #F0FDF4`, `border: 1.5px solid #BBF7D0`, `border-radius: 16px`
- Negative card: `background: #FFF1F2`, `border: 1.5px solid #FECACA`, `border-radius: 16px`
- Neutral card: `background: #EFF6FF`, `border: 1.5px solid #BFDBFE`, `border-radius: 16px`
- Labels: `10px, font-weight: 700, color: <semantic-color>` (green/red/blue)
- Values: `24-28px, font-weight: 800, color: #0F172A` (dark, not colored)
- Sub-labels: colored badge pill (e.g. `background: #DCFCE7; color: #16A34A`)
- No `border-left` accent in Easy — full tinted background does the job
- `box-shadow: 0 1px 4px rgba(0,0,0,0.04)`

---

### 5. Panel / Card Containers

**Pro skin**: `background: var(--panel)`, `border: 1px solid var(--line)`, `border-radius: 8px`, `box-shadow: 0 18px 46px rgba(0,0,0,0.28)`

**Easy skin**: `background: #FFFFFF`, `border: 1.5px solid #E2E8F0`, `border-radius: 16px`, `box-shadow: 0 1px 4px rgba(0,0,0,0.06)`

---

### 6. Tabs & Filters

**Pro skin** (current): underline tab, `border-bottom: 2px solid var(--cyan)` when active, dark background

**Easy skin**:
- Active tab: `color: #2563EB`, `border-bottom: 2px solid #2563EB`, `background: transparent`
- Inactive tab: `color: #64748B`
- Tab bar border: `1px solid #E2E8F0`
- Filter pills: `background: #F1F5F9`, `border: 1px solid #E2E8F0`; active: `background: #DBEAFE`, `border-color: #93C5FD`, `color: #1D4ED8`

---

### 7. Learning Hub

Same structural layout in both skins. Component-level changes only:

**Roadmap cards:**
- Easy: white card, `border-radius: 16px`, sector letter badge in `#2563EB` pill
- Pro: `var(--panel-2)` card, `border-radius: 8px`, sector letter in `var(--cyan)` text

**Module / scenario cards:**
- Easy: white card, colored left stripe per sector (A=blue, B=indigo, C=violet, D=amber, E=emerald), soft shadow
- Pro: `var(--panel-2)` card, cyan label, unchanged

**Sprint questions:**
- Easy: white card, `border-left: 3px solid #2563EB`, rubric reveal in light green background
- Pro: current dark card, left cyan border, unchanged

---

## State Management

```js
// Read on page load
function uiSkin() {
  return localStorage.getItem('os_d1_skin') || 'pro';
}

// Apply to <body>
function applySkin(skin) {
  document.body.classList.toggle('skin-easy', skin === 'easy');
  document.body.classList.toggle('skin-pro', skin !== 'easy');
  localStorage.setItem('os_d1_skin', skin);
}
```

All Easy-skin CSS rules scoped under `body.skin-easy`. Pro skin = default (no scoping class needed — preserves all existing CSS unchanged).

---

## CSS Architecture

```css
/* Pro skin = existing CSS, no changes needed */

/* Easy skin overrides — all scoped */
body.skin-easy {
  background: #F8FAFC;
  color: #0F172A;
}
body.skin-easy .panel { background: #FFFFFF; border-color: #E2E8F0; border-radius: 16px; }
body.skin-easy .metric { background: #FFFFFF; border-color: #E2E8F0; border-radius: 16px; }
body.skin-easy .metric.positive { background: #F0FDF4; border-color: #BBF7D0; }
body.skin-easy .metric.negative { background: #FFF1F2; border-color: #FECACA; }
body.skin-easy .metric strong { color: #0F172A; font-family: inherit; }
body.skin-easy .metric span { color: #64748B; }
/* ... all other component overrides ... */
```

Zero changes to Pro-skin CSS. Zero changes to JS logic beyond `applySkin()` call and skin toggle render.

---

## Files Changed

| File | Change |
|---|---|
| `styles.css` | Add `body.skin-easy { ... }` override block at end of file |
| `app.js` | Add `applySkin()`, `uiSkin()`, `renderSkinToggle()` helpers; call `applySkin(uiSkin())` on init; add skin toggle render in topbar area |
| `index.html` | Add `<div id="skinToggle">` fixed container |

No changes to data files, no changes to test specs.

---

## Affected Areas Summary

| Area | Pro changes | Easy changes |
|---|---|---|
| Strategy rail | None | Light bg, white cards, blue active state |
| P&L / Greeks charts | Add profit/loss fills + BE markers (parity fix) | Light bg, blue/green curves, saturated fills |
| Metric panels | None | Tinted bg per semantic color, dark text, badge pills |
| Learning Hub | None | White cards, sector color stripes, blue active tabs |
| Floating toggle | New element | New element |

---

## Acceptance Criteria

1. `node --check app.js` passes
2. `npm test` passes (no new test failures — skin toggle is visual only)
3. `git diff --check` passes
4. Pro skin: visually identical to current app (no regression)
5. Easy skin: light `#F8FAFC` background, white cards, blue primary, colored metric tints
6. Toggle persists across page reload via `localStorage`
7. Default skin is `pro` for returning users
8. Profit/loss fill areas visible in both skins on all P&L charts
9. Breakeven lines visible in both skins

---

## Out of Scope

- Changes to Basic / Advanced / Professional content logic
- Changes to EN / 中 language toggle
- Responsive / mobile layout changes
- Animation or transition between skins (can be added later)
- Any new content, strategies, or learning materials
