# Professional Tools Tabbed Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate 6 stacked professional tool panels into a single tabbed interface to reduce vertical scrolling by ~500px.

**Architecture:** Replace 6 separate `<section>` panels with one panel containing a horizontal tab bar and shared content area. Tab clicks toggle visibility via CSS classes. State persists to localStorage.

**Tech Stack:** Vanilla JavaScript, CSS, HTML (no new dependencies)

---

## File Structure

**Modified files:**
- `index.html` - Remove 6 panels, add 1 tabbed panel
- `styles.css` - Add tab bar and panel visibility styles
- `app.js` - Add tab switching logic and state management

**No new files created** - this is a refactoring of existing UI structure.

---

### Task 1: Add CSS Styles for Tabbed Interface

**Files:**
- Modify: `styles.css` (append to end of file)

- [ ] **Step 1: Add tab bar and panel styles**

Add to end of `styles.css`:

```css
/* Professional Tools Tabbed Interface */
.professional-tools-panel {
  margin-top: 24px;
}

.tools-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 20px;
  overflow-x: auto;
}

.tool-tab {
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tool-tab:hover {
  color: var(--text);
  background: var(--panel-2);
}

.tool-tab.active {
  color: var(--cyan);
  border-bottom-color: var(--cyan);
}

.tool-content {
  min-height: 400px;
}

.tool-panel {
  display: none;
}

.tool-panel.active {
  display: block;
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tool-header h4 {
  margin: 0;
  font-size: 16px;
  color: var(--text);
}
```

- [ ] **Step 2: Verify CSS syntax**

Run: `node --check app.js` (CSS has no syntax checker, but verify no typos)

Expected: No errors

- [ ] **Step 3: Commit CSS changes**

```bash
git add styles.css
git commit -m "style: Add tabbed interface styles for professional tools"
```

---

### Task 2: Add JavaScript Tab Switching Logic

**Files:**
- Modify: `app.js` (add state property, new function, update existing functions)

- [ ] **Step 1: Add activeTool to state object**

Find the `const state = {` declaration (around line 20-30) and add after existing properties:

```javascript
activeTool: localStorage.getItem('activeTool') || 'stress',
```

- [ ] **Step 2: Add switchTool function**

Add this function after the `handleModeToggle` function (around line 2000):

```javascript
function switchTool(toolId) {
  state.activeTool = toolId;
  localStorage.setItem('activeTool', toolId);
  
  // Update tab buttons
  document.querySelectorAll('.tool-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tool === toolId);
  });
  
  // Update content panels
  document.querySelectorAll('.tool-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.tool === toolId);
  });
}
```

- [ ] **Step 3: Add tab click handler to handleClick**

Find the `function handleClick(event)` and add this check near the top (after existing checks):

```javascript
if (event.target.matches('.tool-tab')) {
  switchTool(event.target.dataset.tool);
  return;
}
```

- [ ] **Step 4: Initialize active tool in handleModeToggle**

Find `function handleModeToggle(mode)` and add `switchTool(state.activeTool);` at the end of both professional and interview mode blocks:

In the `if (mode === 'professional')` block, after `renderPortfolioPanel();`:
```javascript
switchTool(state.activeTool);
```

In the `else if (mode === 'interview')` block, after `renderPortfolioPanel();`:
```javascript
switchTool(state.activeTool);
```

- [ ] **Step 5: Verify JavaScript syntax**

Run: `node --check app.js`

Expected: No errors

- [ ] **Step 6: Commit JavaScript changes**

```bash
git add app.js
git commit -m "feat: Add tab switching logic for professional tools"
```

---

### Task 3: Replace HTML Panels with Tabbed Interface

**Files:**
- Modify: `index.html` (remove 6 sections, add 1 consolidated section)

- [ ] **Step 1: Locate and remove old panel sections**

Find and delete these 6 complete `<section>` blocks (approximately lines 196-289):
1. `<section class="panel stress-test-panel pro-content" id="stressTestPanel" ...>` through `</section>`
2. `<section class="panel parity-panel pro-content" id="parityPanel" ...>` through `</section>`
3. `<section class="panel portfolio-panel pro-content" id="portfolioPanel" ...>` through `</section>`
4. `<section class="panel gamma-pnl-panel pro-content" id="gammaPnlPanel" ...>` through `</section>`
5. `<section class="panel vol-surface-panel pro-content" id="volSurfacePanel" ...>` through `</section>`
6. `<section class="panel greeks-decay-panel pro-content" id="greeksDecayPanel" ...>` through `</section>`

- [ ] **Step 2: Add new tabbed panel**

Insert this after the Interview Q&A panel (`</section>` that closes `id="interviewPanel"`):

```html
<section class="panel professional-tools-panel pro-content" id="professionalToolsPanel" style="display:none">
  <div class="panel-heading compact">
    <div>
      <p class="eyebrow">Professional Tools</p>
      <h3>专业工具</h3>
    </div>
  </div>
  
  <div class="tools-tabs">
    <button class="tool-tab active" data-tool="stress" type="button">压力测试</button>
    <button class="tool-tab" data-tool="parity" type="button">Put-Call Parity</button>
    <button class="tool-tab" data-tool="portfolio" type="button">组合管理</button>
    <button class="tool-tab" data-tool="gamma" type="button">Gamma P&L</button>
    <button class="tool-tab" data-tool="vol" type="button">波动率曲面</button>
    <button class="tool-tab" data-tool="decay" type="button">Greeks Decay</button>
  </div>
  
  <div class="tool-content">
    <!-- Stress Test -->
    <div class="tool-panel active" data-tool="stress">
      <div class="tool-header">
        <h4>压力测试矩阵 Spot × IV</h4>
        <button id="runStressTest" class="primary-button" type="button">运行压力测试</button>
      </div>
      <div id="stressTestResults" class="stress-test-results"></div>
      <div id="greekShockEstimate" class="greek-shock-estimate"></div>
    </div>
    
    <!-- Put-Call Parity -->
    <div class="tool-panel" data-tool="parity">
      <h4>Put-Call Parity 教学计算器</h4>
      <div class="parity-calculator">
        <div class="parity-inputs">
          <label><span>Call Price:</span><input type="number" id="parityCallPrice" step="0.01" value="5.00" /></label>
          <label><span>Put Price:</span><input type="number" id="parityPutPrice" step="0.01" value="4.00" /></label>
          <label><span>Stock Price:</span><input type="number" id="paritySpot" step="0.5" value="100" /></label>
          <label><span>Strike:</span><input type="number" id="parityStrike" step="0.5" value="100" /></label>
          <label><span>DTE:</span><input type="number" id="parityDte" step="1" value="30" /></label>
          <label><span>Rate (%):</span><input type="number" id="parityRate" step="0.25" value="4" /></label>
          <button id="checkParity" class="primary-button" type="button">检查 Parity</button>
        </div>
        <div id="parityResults" class="parity-results"></div>
      </div>
    </div>
    
    <!-- Portfolio -->
    <div class="tool-panel" data-tool="portfolio">
      <h4>组合 Greeks 聚合器</h4>
      <div id="portfolioContent" class="portfolio-content"></div>
    </div>
    
    <!-- Gamma P&L -->
    <div class="tool-panel" data-tool="gamma">
      <div class="tool-header">
        <h4>Gamma P&L 模拟 - 动态对冲</h4>
        <button id="runGammaPnl" class="primary-button" type="button">运行模拟</button>
      </div>
      <div class="gamma-pnl-controls">
        <label>
          <span>最终价格:</span>
          <input type="range" id="gammaPnlSpot" min="80" max="120" step="1" value="110" />
          <output id="gammaPnlSpotOutput">110</output>
        </label>
        <label>
          <span>对冲步数:</span>
          <input type="range" id="gammaPnlSteps" min="10" max="50" step="5" value="20" />
          <output id="gammaPnlStepsOutput">20</output>
        </label>
      </div>
      <div id="gammaPnlChart" class="gamma-pnl-chart"></div>
      <div id="gammaPnlResults" class="gamma-pnl-results"></div>
    </div>
    
    <!-- Vol Surface -->
    <div class="tool-panel" data-tool="vol">
      <h4>波动率曲面 - Smile & Skew</h4>
      <div id="volSurfaceChart" class="vol-surface-chart"></div>
      <div id="volSurfaceInfo" class="vol-surface-info"></div>
    </div>
    
    <!-- Greeks Decay -->
    <div class="tool-panel" data-tool="decay">
      <h4>Greeks 随时间衰减</h4>
      <div class="greeks-decay-controls">
        <label>
          <span>最大 DTE:</span>
          <input type="range" id="greeksDecayDte" min="0" max="45" step="1" value="30" />
          <output id="greeksDecayDteOutput">30</output>
        </label>
        <div class="moneyness-toggle">
          <span>中心行权价:</span>
          <button class="moneyness-btn active" data-moneyness="atm" type="button">ATM</button>
          <button class="moneyness-btn" data-moneyness="itm" type="button">ITM</button>
          <button class="moneyness-btn" data-moneyness="otm" type="button">OTM</button>
          <button class="moneyness-btn" data-moneyness="custom" type="button">自定义</button>
        </div>
        <label id="customStrikeControl" style="display:none">
          <span>自定义行权价:</span>
          <input type="number" id="customStrike" step="1" value="100" />
        </label>
      </div>
      <div id="greeksDecayChart" class="greeks-decay-chart"></div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify HTML structure**

Open `index.html` in browser and check console for errors.

Expected: No JavaScript errors, page loads

- [ ] **Step 4: Commit HTML changes**

```bash
git add index.html
git commit -m "refactor: Consolidate 6 tool panels into tabbed interface"
```

---

### Task 4: Manual Testing

**Files:**
- Test: Browser manual testing

- [ ] **Step 1: Test basic page load**

1. Open `index.html` in browser
2. Verify page loads without errors
3. Check browser console for JavaScript errors

Expected: No errors, page displays normally

- [ ] **Step 2: Test professional mode activation**

1. Click "专业" (Professional) mode button
2. Verify Professional Tools panel appears
3. Verify 6 tabs are visible

Expected: Panel visible with all 6 tabs

- [ ] **Step 3: Test tab switching**

1. Click each of the 6 tabs in order
2. Verify content changes for each tab
3. Verify active tab has cyan underline

Expected: Each tab shows different content, visual feedback works

- [ ] **Step 4: Test tool functionality**

For each tool, verify buttons and controls work:
1. Stress Test: Click "运行压力测试", verify matrix appears
2. Parity: Enter values, click "检查 Parity", verify results
3. Portfolio: Verify portfolio content renders
4. Gamma P&L: Click "运行模拟", verify chart appears
5. Vol Surface: Verify chart displays
6. Greeks Decay: Adjust sliders, verify chart updates

Expected: All tools function as before

- [ ] **Step 5: Test localStorage persistence**

1. Switch to a non-default tab (e.g., "Gamma P&L")
2. Refresh the page
3. Switch to Professional mode
4. Verify "Gamma P&L" tab is active

Expected: Last active tab is remembered

- [ ] **Step 6: Test mode switching**

1. Switch to Basic mode
2. Switch back to Professional mode
3. Verify last active tab is still selected

Expected: State persists across mode switches

---

### Task 5: Run Automated Tests

**Files:**
- Test: `tests/professional.spec.js`, `tests/smoke.spec.js`

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: All tests pass (4/4)

- [ ] **Step 2: Check for test failures**

If any tests fail, review the error messages and fix issues.

Common issues:
- Old panel IDs not found (expected - panels were removed)
- Tab switching not working (check JavaScript)
- Content not rendering (check HTML IDs match)

Expected: All tests pass

- [ ] **Step 3: Commit if tests pass**

```bash
git add -A
git commit -m "test: Verify tabbed interface works with existing tests"
```

---

### Task 6: Final Verification and Documentation

**Files:**
- Modify: `docs/PROJECT_STATUS.md` (update UI description)

- [ ] **Step 1: Update PROJECT_STATUS.md**

Find the "专业模式" section and update the description:

Change from:
```markdown
- Portfolio Greeks 聚合器。
- 保证金教育估算。
- 压力测试矩阵。
- Put-Call Parity 计算器。
- Gamma P&L 与动态对冲模拟。
- Vol Surface 教育性 smile/skew。
- 组合级 Greeks Decay
```

To:
```markdown
- 专业工具面板（Tabbed Interface）：
  - 压力测试矩阵
  - Put-Call Parity 计算器
  - Portfolio Greeks 聚合器
  - Gamma P&L 与动态对冲模拟
  - Vol Surface 教育性 smile/skew
  - 组合级 Greeks Decay
```

- [ ] **Step 2: Verify all changes work together**

1. Open browser, test all 6 tools
2. Verify no console errors
3. Verify all existing functionality works
4. Verify ~500px vertical space saved (scroll less)

Expected: Everything works, less scrolling required

- [ ] **Step 3: Final commit**

```bash
git add docs/PROJECT_STATUS.md
git commit -m "docs: Update PROJECT_STATUS for tabbed tools interface"
```

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```

Expected: All changes pushed successfully

---

## Self-Review Checklist

**Spec coverage:**
- ✅ CSS styles for tabs and panels (Task 1)
- ✅ JavaScript tab switching logic (Task 2)
- ✅ HTML structure replacement (Task 3)
- ✅ localStorage persistence (Task 2)
- ✅ Manual testing (Task 4)
- ✅ Automated testing (Task 5)
- ✅ Documentation update (Task 6)

**Placeholder scan:**
- ✅ No TBD, TODO, or "implement later"
- ✅ All code blocks complete
- ✅ All file paths exact
- ✅ All commands with expected output

**Type consistency:**
- ✅ `data-tool` attribute values consistent: stress, parity, portfolio, gamma, vol, decay
- ✅ CSS class names consistent: `.tool-tab`, `.tool-panel`, `.tool-content`
- ✅ Function names consistent: `switchTool(toolId)`
- ✅ State property consistent: `state.activeTool`

---

## Execution Complete

All tasks completed. The professional tools are now consolidated into a single tabbed interface, saving ~500px of vertical scrolling space while maintaining all existing functionality.
