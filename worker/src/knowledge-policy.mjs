export function numericSetting(value, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function generationConfigured(env = {}) {
  return env.KNOWLEDGE_AI_ENABLED === "true" && Boolean(env.AI) &&
    numericSetting(env.KNOWLEDGE_MONTHLY_AI_BUDGET_USD) > 0 && numericSetting(env.KNOWLEDGE_MAX_BRIEF_COST_USD) > 0;
}

export function weeklyBriefLimit(env = {}) {
  return Math.floor(numericSetting(env.KNOWLEDGE_WEEKLY_MAX_NEW_BRIEFS, 2));
}

export function maxRetries(env = {}) {
  return Math.floor(numericSetting(env.KNOWLEDGE_MAX_RETRIES, 3));
}

export function weekStartUtc(date) {
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}
