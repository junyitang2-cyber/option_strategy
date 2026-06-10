# Option Strategy — UI Design System

This project uses a **dark-mode-only, SVG-based** design system. No build step.
Follow these rules exactly when writing HTML, CSS, or inline SVG.

---

## Color Tokens

Always use CSS variables — never hardcode hex values inline.

```css
/* Backgrounds */
--bg:       #0b0c10   /* page background */
--rail:     #0d1017   /* left sidebar */
--panel:    #151720   /* primary card surface */
--panel-2:  #1c202b   /* secondary surface, nested cards */
--panel-3:  #10131a   /* inset surface, chart backgrounds */

/* Borders */
--line:     #303646   /* 1px solid default border */

/* Text */
--text:     #f4f6fb   /* primary */
--muted:    #aeb6c7   /* secondary / labels */
--subtle:   #778195   /* tertiary / timestamps */

/* Accent palette */
--cyan:     #39c7e5   /* primary action, active state, headings */
--green:    #48d47a   /* profit / positive / buy */
--red:      #f06474   /* loss / negative / sell / warning */
--amber:    #e6b84a   /* neutral alert, greek labels, spot line */
--violet:   #9f83ff   /* gamma / delta-related, probability */
--blue:     #639bff   /* info / neutral lines */
```

Semantic uses:
- Profit / positive value → `var(--green)` (#48d47a)
- Loss / negative value → `var(--red)` (#f06474)
- Active tab / focus ring / section headings → `var(--cyan)` (#39c7e5)
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

Standard panel:
```css
.panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  box-shadow: 0 18px 46px rgba(0,0,0,0.28);
  padding: 18px;
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
Tick text:   fill: var(--muted), font-size: 11px
```

Payoff curves:
```
Net P&L (current):   stroke: var(--cyan),   stroke-width: 2.6, fill: none
Net P&L (expiry):    stroke: var(--green),  stroke-width: 2.4, fill: none
Entry reference:     stroke: var(--muted),  stroke-width: 1.7, stroke-dasharray: 7 6
Per-leg lines:       stroke-width: 1.6, colors: green/red/cyan/amber/violet/#f08c4a (in order)
Combined leg:        stroke: #fff, stroke-width: 2.8

Greeks curves:
  Risk:    stroke: var(--green)
  Delta:   stroke: var(--red)
  Gamma:   stroke: var(--violet)
  Theta:   stroke: var(--cyan)
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

- Use `box-shadow` for depth except the single panel shadow (`0 18px 46px rgba(0,0,0,0.28)`)
- Use gradients except on the primary action button
- Use font weights above 800
- Use light mode colours or white backgrounds
- Import external chart libraries — use hand-rolled SVG
- Use `var(--border)` — it's not defined; use `var(--line)` instead
- Add colour to a card background — colour goes on the value or left border only
