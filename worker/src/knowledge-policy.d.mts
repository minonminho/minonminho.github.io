export type KnowledgePolicyEnv = {
  AI?: unknown;
  KNOWLEDGE_AI_ENABLED?: string;
  KNOWLEDGE_MONTHLY_AI_BUDGET_USD?: string;
  KNOWLEDGE_MAX_BRIEF_COST_USD?: string;
  KNOWLEDGE_WEEKLY_MAX_NEW_BRIEFS?: string;
  KNOWLEDGE_MAX_RETRIES?: string;
};

export function numericSetting(value: string | undefined, fallback?: number): number;
export function generationConfigured(env?: KnowledgePolicyEnv): boolean;
export function weeklyBriefLimit(env?: KnowledgePolicyEnv): number;
export function maxRetries(env?: KnowledgePolicyEnv): number;
export function weekStartUtc(date: Date): string;
