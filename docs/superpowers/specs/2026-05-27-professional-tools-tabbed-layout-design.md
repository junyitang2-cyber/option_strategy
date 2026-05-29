# Professional Tools Tabbed Layout Design

**Date**: 2026-05-27  
**Status**: Approved  
**Topic**: Redesign professional tools layout from 6 stacked panels to single tabbed interface

---

## Problem

Current professional mode has 6 separate panels stacked vertically:
1. Stress Test (压力测试矩阵)
2. Put-Call Parity (教学计算器)
3. Portfolio (组合 Greeks 聚合器)
4. Gamma P&L (动态对冲模拟)
5. Vol Surface (波动率曲面)
6. Greeks Decay (Greeks 随时间衰减)

**Issues:**
- Excessive vertical scrolling (~600px+ of panel chrome)
- Each panel has redundant padding, margins, and headers
- Poor space efficiency for professional workflow
- User must scroll extensively to access different tools

---

## Solution

Consolidate 6 panels into **one tabbed interface** with horizontal tabs.

### Architecture

**Single panel structure:**
```html
<section class="panel professional-tools-panel pro-content" id="professionalToolsPanel" style="display:none">
  <div class="panel-heading compact">
    <div>
      <p class="eyebrow">Professional Tools</p>
      <h3>专业工具</h3>
    </div>
  </div>
  
  <div class="tools-tabs">
    <button class="tool-tab active" data-tool="stress">压力测试</button>
    <button class="tool-tab" data-tool="parity">Put-Call Parity</button>
    <button class="tool-tab" data-tool="portfolio">组合管理</button>
    <button class="tool-tab" data-tool="gamma">Gamma P&L</button>
    <button class="tool-tab" data-tool="vol">波动率曲面</button>
    <button class="tool-tab" data-tool="decay">Greeks Decay</button>
  </div>
  
  <div class="tool-content">
    <div class="tool-panel active" data-tool="stress">
      <!-- Stress Test content -->
    </div>
    <div class="tool-panel" data-tool="parity">
      <!-- Parity content -->
    </div>
    <div class="tool-panel" data-tool="portfolio">
      <!-- Portfolio content -->
    </div>
    <div class="tool-panel" data-tool="gamma">
      <!-- Gamma P&L content -->
    </div>
    <div class="tool-panel" data-tool="vol">
      <!-- Vol Surface content -->
    </div>
    <div class="tool-panel" data-tool="decay">
      <!-- Greeks Decay content -->
    </div>
  </div>
</section>
```

### Tab Behavior

- **Default state**: First tab (Stress Test) active on load
- **Switching**: Click tab → update active states, show/hide content
- **Persistence**: Save last active tab to `localStorage` as `activeTool`
- **Visual feedback**: Active tab gets cyan underline + bright text color

### Content Migration

Each tool's existing content moves into its corresponding `.tool-panel`:
- Keep all existing IDs (`stressTestResults`, `parityResults`, `portfolioContent`, etc.)
- Keep all existing buttons and controls
- No changes to rendering functions (`renderStressTestResults()`, `renderGammaPnL()`, etc.)
- Only the container structure changes

---

## Implementation

### CSS (styles.css)

Add new styles:

```css
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
```

### JavaScript (app.js)

**State management:**

```javascript
// Add to state object
state.activeTool = localStorage.getItem('activeTool') || 'stress';

// Tab switching function
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

**Event binding:**

Add to `handleClick()`:

```javascript
if (event.target.matches('.tool-tab')) {
  switchTool(event.target.dataset.tool);
  return;
}
```

**Initialization:**

In `handleModeToggle()` when switching to professional mode:

```javascript
if (mode === 'professional' || mode === 'advanced-professional') {
  // ... existing code ...
  switchTool(state.activeTool); // Restore last active tool
}
```

### HTML (index.html)

**Remove these 6 sections:**
- `<section class="panel stress-test-panel pro-content" id="stressTestPanel">`
- `<section class="panel parity-panel pro-content" id="parityPanel">`
- `<section class="panel portfolio-panel pro-content" id="portfolioPanel">`
- `<section class="panel gamma-pnl-panel pro-content" id="gammaPnlPanel">`
- `<section class="panel vol-surface-panel pro-content" id="volSurfacePanel">`
- `<section class="panel greeks-decay-panel pro-content" id="greeksDecayPanel">`

**Add new consolidated panel** (insert after the professional practice panel):

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

---

## Benefits

### Space Efficiency
- **Before**: ~600px+ of panel chrome (6 × panel padding/margin/heading)
- **After**: ~100px (1 panel + 40px tab bar)
- **Net savings**: ~500px vertical space

### User Experience
- No scrolling needed to access different tools
- Clear visual organization
- Familiar tab pattern (like browser tabs)
- Remembers last used tool

### Maintainability
- Easier to add new tools (just add tab + panel)
- Centralized tool management
- No changes to existing rendering logic

---

## Testing

### Manual Testing
1. Switch to Professional mode
2. Verify all 6 tabs are visible
3. Click each tab, verify content switches correctly
4. Verify buttons and controls work in each tool
5. Refresh page, verify last active tab is restored
6. Switch to Basic mode and back, verify state persists

### Automated Testing
- Existing Playwright tests should pass without modification
- Add new test: verify tab switching works in professional mode

---

## Migration Notes

### Backward Compatibility
- All existing IDs preserved (`stressTestResults`, `portfolioContent`, etc.)
- All rendering functions unchanged
- localStorage key `activeTool` is new (won't conflict)

### Rollback Plan
If issues arise, can quickly revert by:
1. Restore 6 separate panel sections in HTML
2. Remove tabbed panel and CSS
3. Remove `switchTool()` and related JS

---

## Future Enhancements

Potential improvements (not in scope for this design):
- Keyboard shortcuts (1-6 to switch tabs)
- Tab badges showing status (e.g., "Portfolio: 3 positions")
- Drag-and-drop tab reordering
- Collapsible tab bar for more vertical space
