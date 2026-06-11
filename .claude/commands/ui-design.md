# Option Strategy — UI Design System

This project uses a **dark-mode-only, SVG-based** design system. No build step.
Follow these rules exactly when writing HTML, CSS, or inline SVG.

---

## Skin Architecture

The stylesheet has **three CSS layers**. Always be aware of which layer you are writing into.

1. **Base (unscoped)** — shared skeleton and legacy dark values. Applies to every skin. This is what the "Color Tokens", "Layout", and most sections below document. Do **not** remove or rename these rules — they are the authored fallback and serve as Easy skin defaults.

2. **`body.skin-pro` — Heritage Terminal overrides** — collected at the **end** of `styles.css`. Overrides base tokens for the Pro skin: amber `#ffb000` primary accent (replaces `--cyan`), OLED `#050505` background, warm text palette, 2 px radii everywhere, no panel shadows, IBM Plex Mono with `tabular-nums` on all data values. The base values documented below still apply to Easy but are overridden in Pro — see the Pro token table in the next section.

3. **`body.skin-easy` — Light overrides** — also at the end of `styles.css`. White cards, blue primary, bright background.

**Rule for every new visible component:** write base styles first, then check whether either skin section requires an override. In practice:
- Radius/shadow: base uses 8 px + shadow; Pro overrides to 2 px + none; Easy inherits base.
- Accent color: base `var(--cyan)` is `#39c7e5`; in Pro scope `--cyan` resolves to `#ffb000`.

### Leg colors

Per-leg colors live in CSS tokens `--leg-0` … `--leg-5` (defined in `:root`) and are consumed by `.payoff-leg-N` SVG path classes. In JS, `LEG_COLORS` in `app.js` holds the strings `"var(--leg-0)"` … `"var(--leg-5)"` — these must only be injected into inline `style="..."` properties (e.g. legend swatches, tooltip badges), **never** into SVG presentation attributes (`stroke=`). The Pro skin remaps `--leg-2` from `#39c7e5` to `#639bff` (blue theta) — if you hardcode a hex in JS or in an SVG attribute you will break this.

### Pro skin token overrides

| Token | Base (Easy) value | Pro Terminal value |
|---|---|---|
| `--bg` | `#0b0c10` | `#050505` (OLED near-black) |
| `--rail` | `#0d1017` | `#070708` |
| `--panel` | `#151720` | `#0c0d10` |
| `--panel-2` | `#1c202b` | `#12141a` |
| `--panel-3` | `#10131a` | `#08090b` |
| `--line` | `#303646` | `#23262f` |
| `--cyan` | `#39c7e5` | **`#ffb000`** (amber — identity swap) |
| `--text` | `#f4f6fb` | `#f2f0e9` (warm white) |
| `--muted` | `#aeb6c7` | `#a8a496` (warm grey) |
| `--subtle` | `#778195` | `#6e6a5e` (warm grey) |
| `--shadow` | `0 18px 46px rgba(0,0,0,.28)` | **none** (flat terminal) |
| `--leg-2` | `#39c7e5` | `#639bff` (blue theta) |

Additional Pro-only rules: spot/current-price SVG line → warm-white dashed `rgba(242,240,233,0.55)` (avoids amber-on-amber collision), stress tables → zebra odd-row tint `rgba(255,176,0,0.03)` with amber header border, tab rows → F-key prefixes via CSS counters `::before` (zero JS), topbar strategy title → mono uppercase with amber `▮` prefix, font stack → `'IBM Plex Mono', 'SF Mono', Monaco, Consolas, monospace` with `font-variant-numeric: tabular-nums` on all numeric data.

---

## Color Tokens

Always use CSS variables — never hardcode hex values inline.

These are the **base (unscoped) values** — what Easy skin inherits. In the Pro skin `body.skin-pro` overrides several of these; see the Skin Architecture section above for the full Pro token table.

```css
/* Backgrounds */
--bg:       #0b0c10   /* page background          — Pro: #050505 */
--rail:     #0d1017   /* left sidebar             — Pro: #070708 */
--panel:    #151720   /* primary card surface     — Pro: #0c0d10 */
--panel-2:  #1c202b   /* secondary surface        — Pro: #12141a */
--panel-3:  #10131a   /* inset surface, charts    — Pro: #08090b */

/* Borders */
--line:     #303646   /* 1px solid default border — Pro: #23262f */

/* Text */
--text:     #f4f6fb   /* primary                  — Pro: #f2f0e9 warm white */
--muted:    #aeb6c7   /* secondary / labels       — Pro: #a8a496 warm grey */
--subtle:   #778195   /* tertiary / timestamps    — Pro: #6e6a5e warm grey */

/* Accent palette */
--cyan:     #39c7e5   /* primary action, active state, headings — Pro: #ffb000 amber */
--green:    #48d47a   /* profit / positive / buy */
--red:      #f06474   /* loss / negative / sell / warning */
--amber:    #e6b84a   /* neutral alert, greek labels (unchanged in Pro) */
--violet:   #9f83ff   /* gamma / delta-related, probability */
--blue:     #639bff   /* info / neutral lines */

/* Leg colors (overrideable per skin) */
--leg-0:    #48d47a
--leg-1:    #f06474
--leg-2:    #39c7e5   /* Pro: #639bff (blue theta, avoids amber collision) */
--leg-3:    #e6b84a
--leg-4:    #c084fc
--leg-5:    #f08c4a
```

Semantic uses:
- Profit / positive value → `var(--green)` (#48d47a)
- Loss / negative value → `var(--red)` (#f06474)
- Active tab / focus ring / section headings → `var(--cyan)` (base: #39c7e5; Pro: #ffb000)
- Decay / theta / warning → `var(--amber)` (#e6b84a)
- Probability / gamma → `var(--violet)` (#9f83ff)

Fill areas (profit/loss zones in charts):
```
Profit fill:  rgba(72, 212, 122, 0.13)   /* --green at 13% */
Loss fill:    rgba(240, 100, 116, 0.12)  /* --red at 12% */
Probability:  rgba(192, 132, 252, 0.18)  /* --violet at 18% */
Cyan tint:    rgba(57, 199, 229, 0.12)   /* for active/hover states */
Amber tint:   rgba(230, 184, 74, 0.12)   /* for warning states */
```

---

## Typography

```
Font stack: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Monospace:  'SF Mono', 'Monaco', 'Consolas', monospace  (for numbers/data)
```

Rules:
- Weights: **400** (regular) and **500** only for body. **700–800** only for specific headings/kickers.
- Section kickers (eyebrow labels): `12px, font-weight: 800, text-transform: uppercase, color: var(--muted)`
- Panel headings (h3): `18px, font-weight: default`
- Body copy: `13px, line-height: 1.5–1.6, color: var(--muted)`
- Numeric values: `font-family: monospace, font-weight: 600`
- Never use ALL CAPS except `.eyebrow` / `.learning-kicker` kicker elements.

---

## Layout & Spacing

App shell: `340px sidebar + minmax(780px, 1fr) main area`

Standard panel (base / Easy skin):
```css
.panel {
  border: 1px solid var(--line);
  border-radius: 8px;           /* Pro: 2px */
  background: var(--panel);
  box-shadow: 0 18px 46px rgba(0,0,0,0.28);  /* Pro: none */
  padding: 18px;                /* Pro: 14px */
}
```

Metric / stat cards:
```css
.metric / .stat {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel-3);
  padding: 10px;
}
.metric span { font-size: 12px; color: var(--muted); display: block; }
.metric strong { font-size: 18px; display: block; margin-top: 6px; }
.metric.positive strong { color: var(--green); }
.metric.negative strong { color: var(--red); }
```

Card grids: `display: grid; gap: 12px` — never use flexbox for card grids.

Standard gaps:
- Between panels: `18px`
- Between cards in a grid: `12px`
- Between form fields: `10–14px`
- Padding inside cards: `14–18px`

---

## SVG Charts

This project uses **hand-rolled SVG**, not Chart.js or D3. Follow these patterns:

Chart backgrounds:
```css
background: #090c12;   /* slightly darker than --panel-3 */
border: 1px solid rgba(244,246,251,0.16);
border-radius: 8px;
overflow: hidden;
```

Grid and axes:
```
Grid lines:  stroke: rgba(244,246,251,0.12), stroke-width: 1
Zero line:   stroke: rgba(244,246,251,0.75), stroke-width: 1.2
Spot line:   stroke: var(--amber), stroke-width: 1.2, stroke-dasharray: 4 4
             (Pro skin override: rgba(242,240,233,0.55) warm-white dashed — amber is already
              the main P&L line in Pro so the spot line shifts to white to stay distinct)
Tick text:   fill: var(--muted), font-size: 11px
```

Payoff curves:
```
Net P&L (current):   stroke: var(--cyan),   stroke-width: 2.6, fill: none
                     (Pro: var(--cyan) = #ffb000 amber — Bloomberg signature)
Net P&L (expiry):    stroke: var(--green),  stroke-width: 2.4, fill: none
Entry reference:     stroke: var(--muted),  stroke-width: 1.7, stroke-dasharray: 7 6
Per-leg lines:       stroke-width: 1.6, colors via --leg-0..5 tokens (CSS classes .payoff-leg-N)
                     Never hardcode the hex values — use the CSS token so Pro skin overrides work.
Combined leg:        stroke: #fff, stroke-width: 2.8

Greeks curves:
  Risk:    stroke: var(--green)
  Delta:   stroke: var(--red)
  Gamma:   stroke: var(--violet)
  Theta:   stroke: var(--cyan)   (Pro: --cyan = amber, but --leg-2 and the Pro theta override
                                  remap this to var(--blue) #639bff via skin-scoped CSS)
  Vega:    stroke: var(--green), stroke-dasharray: 6 4
  Rho:     stroke: var(--amber)
  (all stroke-width: 1.8–2.2)
```

Profit/loss fill areas:
```xml
<!-- Above zero: green -->
<path class="profit-area" .../>   <!-- fill: rgba(72,212,122,0.13) -->
<!-- Below zero: red -->
<path class="loss-area" .../>     <!-- fill: rgba(240,100,116,0.12) -->
```

Custom legends (always HTML, never SVG `<text>` for legends):
```html
<div class="legend">
  <span class="legend-item">
    <span class="legend-line" style="background:var(--cyan)"></span>
    Label text
  </span>
</div>
```
Legend lines: `width: 28px; height: 3px; border-radius: 999px`
Dashed variant: use `repeating-linear-gradient`

---

## Interactive Components

**Tabs** (both tool tabs and learning tabs):
```css
border-bottom: 1px solid var(--line);
/* inactive */ color: var(--muted); border-bottom: 2px solid transparent;
/* active   */ color: var(--cyan);  border-bottom: 2px solid var(--cyan);
/* hover    */ background: var(--panel-2);
```

**Filter pills** (rounded, in filter rows):
```css
/* base    */ border: 1px solid var(--line); border-radius: 999px; background: var(--panel-2); color: var(--muted);
/* active  */ border-color: var(--cyan); color: var(--cyan);
padding: 6px 10px; font-size: 12px;
```

**Toggle buttons** (chart view toggles):
```css
/* base   */ border: 1px solid var(--line); border-radius: 6px; background: var(--panel-3); color: var(--muted);
/* active */ border-color: var(--cyan); color: var(--cyan); background: rgba(57,199,229,0.12);
padding: 4px 12px; font-size: 12px;
```

**Mode toggle** (segmented control at top):
```css
/* wrapper */ background: var(--panel-3); border-radius: 6px; padding: 3px; display: flex; gap: 4px;
/* active  */ background: var(--cyan); color: #000;
/* inactive*/ color: var(--muted);
padding: 6px 14px; border-radius: 4px;
```

**Inputs and selects**:
```css
background: var(--panel-3); border: 1px solid var(--line); border-radius: 8px;
color: var(--text); padding: 0 10px; min-height: 38px;
/* focus */ border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(57,199,229,0.18);
```

**Range sliders**: `accent-color: var(--cyan); width: 100%`

**Focus rings**: `outline: 2px solid var(--cyan); outline-offset: 2px`

---

## Difficulty Badges

8px × 8px circles, `border-radius: 50%`:
```
novice:       #48d47a  (--green)
intermediate: #e6b84a  (--amber)
advanced:     #f08c4a  (orange)
expert:       #f06474  (--red)
framework:    #39c7e5  (--cyan)
```

---

## Left-border Accent Pattern

For emphasized cards (Q&A, stress cases, interview items):
```css
border-left: 3px solid var(--cyan);   /* info / questions */
border-left: 3px solid var(--red);    /* worst case / risk */
border-left: 3px solid var(--green);  /* best case / profit */
```

---

## Do NOT

- Use `box-shadow` for depth except the single panel shadow (`0 18px 46px rgba(0,0,0,0.28)`) — **skin-conditional**: base/Easy only; Pro skin suppresses all panel shadows (`box-shadow: none`)
- Use `border-radius` above 8 px in base styles — **skin-conditional**: base/Easy use 8 px; Pro skin applies 2 px to every component via `body.skin-pro` overrides
- Use gradients except on the primary action button
- Use font weights above 800
- Use light mode colours or white backgrounds in base styles (Easy skin intentionally introduces a light palette under `body.skin-easy`)
- Import external chart libraries — use hand-rolled SVG
- Use `var(--border)` — it's not defined; use `var(--line)` instead
- Add colour to a card background — colour goes on the value or left border only
- Hardcode leg hex colours in JS or SVG attributes — use `var(--leg-N)` tokens so Pro skin remaps work correctly
