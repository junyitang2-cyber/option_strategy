# Option Strategy — Project Guide for Claude Code

## Project Overview

Static single-page options strategy teaching and professional training tool.
**No build step** — edits to `.js`/`.css`/`.html` take effect immediately on file save.

Tech: Vanilla JS (ES5-style globals), inline SVG charts, Playwright e2e tests.

## Key Files

| File | Role |
|---|---|
| `app.js` | All UI logic and rendering (~5000+ lines) |
| `index.html` | Single-page entry point |
| `styles.css` | All CSS — single file, CSS variables at top |
| `data/learning-content.js` | Learning Hub modules, scenarios, client drills |
| `data/professional-content.js` | 257 professional Q&A, Trader Memos, common mistakes |
| `data/phase6-content.js` | Professional Sprint questions (60) |
| `tests/` | Playwright specs |

## Acceptance Check (run before every commit)

```bash
node --check app.js
node --check data/professional-content.js
node --check data/learning-content.js
npm test
git diff --check
```

## UI & Visualisation Rules

**Before writing any HTML, CSS, SVG, or JS that produces visible output, read `.claude/commands/ui-design.md` and follow it exactly.**

Summary of the most critical rules:
- Dark mode only. Use CSS variables from `styles.css :root` — never hardcode hex values.
- Charts are hand-rolled SVG — do not introduce Chart.js, D3, or any other chart library.
- Profit areas: `rgba(72,212,122,0.13)`. Loss areas: `rgba(240,100,116,0.12)`.
- Active / focus accent: `var(--cyan)` (#39c7e5).
- Card backgrounds: `var(--panel-2)` or `var(--panel-3)`. Never white or light.
- Font weights: 400 and 500 for body; 700–800 only for kickers and headings.
- `var(--line)` for borders — never `var(--border)` (not defined).

## Code Style

- ES5-style globals: no `import`/`export`, no `class`, no arrow functions in render paths.
- All render functions write to `innerHTML` or return HTML strings.
- State persists in `localStorage` under the key `os_d1_learning`.
- No comments unless the WHY is non-obvious.

## Documentation Rules

- Current feature status → `docs/PROJECT_STATUS.md`
- User instructions → `USER_GUIDE.md`
- Install / test → `README.md`
- Historical process → `docs/IMPLEMENTATION_HISTORY.md`
- Do NOT create new `PHASE*_SUMMARY.md` or `BUGFIX_*.md` files in the root.
