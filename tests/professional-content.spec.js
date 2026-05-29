const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PHASE7A_TARGET_IDS = [
  "bull-put-spread",
  "long-put-butterfly",
  "put-broken-wing",
  "inverse-call-broken-wing",
  "call-broken-wing",
  "inverse-put-broken-wing",
  "covered-short-straddle",
  "covered-short-strangle",
  "short-call-condor",
  "short-put-condor",
  "reverse-jade-lizard",
  "call-ratio-spread",
  "put-ratio-spread",
];

function loadStrategies() {
  const strategyPath = path.resolve(__dirname, "../data/strategies.js");
  const code = fs.readFileSync(strategyPath, "utf8") + "\n;globalThis.__STRATEGIES = STRATEGIES;";
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.__STRATEGIES;
}

test("phase 7A target strategies have professional content coverage", () => {
  const strategies = loadStrategies();
  const { PROFESSIONAL_CONTENT } = require("../data/professional-content.js");
  const strategyIds = new Set(strategies.map((strategy) => strategy.id));

  for (const id of PHASE7A_TARGET_IDS) {
    expect(strategyIds.has(id), `${id} should exist in strategies.js`).toBe(true);
    const content = PROFESSIONAL_CONTENT[id];
    expect(content, `${id} should have professional content`).toBeTruthy();
    expect(content.exposure).toEqual(expect.objectContaining({
      directional: expect.any(String),
      volatility: expect.any(String),
      time: expect.any(String),
      convexity: expect.any(String),
    }));
    expect(content.profitLogic).toEqual(expect.objectContaining({
      makesMoneyFrom: expect.any(String),
      losesMoneyFrom: expect.any(String),
      bestMarketCondition: expect.any(String),
      worstScenario: expect.any(String),
    }));
    expect(content.clientPerspective.whyClientDoes.length).toBeGreaterThanOrEqual(3);
    expect(content.dealerPerspective.hedging.length).toBeGreaterThanOrEqual(3);
    expect(content.interviewQuestions.length).toBeGreaterThanOrEqual(3);
    expect(content.commonMistakes.length).toBeGreaterThanOrEqual(3);
  }
});

test("phase 7A increases professional strategy coverage while leaving later gaps", () => {
  const strategies = loadStrategies();
  const { PROFESSIONAL_CONTENT } = require("../data/professional-content.js");
  const professionalIds = Object.keys(PROFESSIONAL_CONTENT).filter((id) => id !== "professionalConcepts");
  const coveredIds = new Set(professionalIds);
  const missing = strategies.filter((strategy) => !coveredIds.has(strategy.id));

  expect(professionalIds.length).toBe(53);
  expect(missing.map((strategy) => strategy.id)).toContain("short-synthetic-future");
  expect(missing.map((strategy) => strategy.id)).not.toContain("bull-put-spread");
});
