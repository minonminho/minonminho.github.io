import assert from "node:assert/strict";
import test from "node:test";
import { generationConfigured, maxRetries, weekStartUtc, weeklyBriefLimit } from "../../worker/src/knowledge-policy.mjs";

test("billable Knowledge generation remains off until every explicit gate is set", () => {
  const configured = {
    AI: { run() {} },
    KNOWLEDGE_AI_ENABLED: "true",
    KNOWLEDGE_MONTHLY_AI_BUDGET_USD: "1.00",
    KNOWLEDGE_MAX_BRIEF_COST_USD: "0.10",
  };
  assert.equal(generationConfigured({ ...configured, KNOWLEDGE_AI_ENABLED: "false" }), false);
  assert.equal(generationConfigured({ ...configured, KNOWLEDGE_MONTHLY_AI_BUDGET_USD: "0" }), false);
  assert.equal(generationConfigured({ ...configured, KNOWLEDGE_MAX_BRIEF_COST_USD: "0" }), false);
  assert.equal(generationConfigured({ ...configured, AI: undefined }), false);
  assert.equal(generationConfigured(configured), true);
});

test("Knowledge budgets default to two briefs per week and three retries", () => {
  assert.equal(weeklyBriefLimit({}), 2);
  assert.equal(maxRetries({}), 3);
  assert.equal(weeklyBriefLimit({ KNOWLEDGE_WEEKLY_MAX_NEW_BRIEFS: "4" }), 4);
  assert.equal(maxRetries({ KNOWLEDGE_MAX_RETRIES: "0" }), 0);
});

test("weekly budget keys always use the Monday UTC date", () => {
  assert.equal(weekStartUtc(new Date("2026-10-25T12:00:00.000Z")), "2026-10-19");
  assert.equal(weekStartUtc(new Date("2026-10-26T00:00:00.000Z")), "2026-10-26");
});
