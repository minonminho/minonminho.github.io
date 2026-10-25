import { WorkflowEntrypoint } from "cloudflare:workers";
import { generationConfigured, maxRetries, numericSetting, weekStartUtc, weeklyBriefLimit } from "./knowledge-policy.mjs";

type Localized = { en: string; ko: string };
type TermInput = {
  term: string;
  definition: Localized;
  context: Localized;
  priority: number;
  aliases: string[];
};
export type PaperEvent = {
  revision: string;
  generationOnly?: boolean;
  paper: {
    canonicalId: string;
    slug: string;
    title: Localized;
    authors: string;
    url: string;
    reviewUrl: string;
    excerpt: Localized;
    hero: { url: string; alt: Localized; caption: Localized; license: string };
  };
  terminology: TermInput[];
  sources: { url: string; label: Localized; publisher: string; type: string }[];
};

type D1Row = Record<string, unknown>;
type D1Result = { success: boolean; meta?: { changes?: number }; results?: D1Row[] };
type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T = D1Row>(): Promise<T | null>;
  all<T = D1Row>(): Promise<{ results: T[] }>;
  run(): Promise<D1Result>;
};
type D1Database = { prepare(sql: string): D1Statement };
type WorkflowBinding = { create(options: { id: string; params: PaperEvent }): Promise<{ id: string }> };
type AI = { run(model: string, input: { prompt: string; max_tokens: number; temperature: number }): Promise<unknown> };

export type KnowledgeEnv = {
  KNOWLEDGE_DB?: D1Database;
  KNOWLEDGE_WORKFLOW?: WorkflowBinding;
  AI?: AI;
  KNOWLEDGE_INGEST_TOKEN?: string;
  KNOWLEDGE_AI_ENABLED?: string;
  KNOWLEDGE_MODEL?: string;
  KNOWLEDGE_MODEL_LIGHTWEIGHT?: string;
  KNOWLEDGE_MODEL_STANDARD?: string;
  KNOWLEDGE_MODEL_DEEP?: string;
  KNOWLEDGE_MAX_NEW_CONCEPTS?: string;
  KNOWLEDGE_WEEKLY_MAX_NEW_BRIEFS?: string;
  KNOWLEDGE_MONTHLY_AI_BUDGET_USD?: string;
  KNOWLEDGE_MAX_BRIEF_COST_USD?: string;
  KNOWLEDGE_INPUT_USD_PER_MILLION?: string;
  KNOWLEDGE_OUTPUT_USD_PER_MILLION?: string;
  KNOWLEDGE_MAX_RETRIES?: string;
  ALLOWED_ORIGINS?: string;
};

type GeneratedConcept = {
  id: string;
  slug: string;
  canonicalName: Localized;
  aliases: string[];
  dek: Localized;
  domain: string[];
  version: number;
  status: "published";
  sourcePapers: string[];
  relatedConcepts: { id: string; relation: string; evidence: string }[];
  sections: { id: string; heading: Localized; paragraphs: Localized[] }[];
  visualAsset: { url: string; alt: Localized; caption: Localized; credit: string; license: string };
  sources: { label: Localized; url: string; publisher: string; type: string }[];
  onePager: { title?: string; subtitle?: string; oneLine: string; sections: { id?: string; heading: string; body: string }[]; sources: string[]; pdfPath?: string | null; docxPath?: string | null };
  generatedAt: string;
  lastUpdated?: string;
  sourcePaperReviews?: { id: string; title: Localized; reviewUrl: string; url: string }[];
};

const DEFAULT_ORIGINS = ["https://minonminho.github.io", "http://localhost:3000"];
const REQUIRED_SECTION_IDS = ["definition", "architecture", "visualization", "comparison", "implementation", "limitations", "takeaway"];
const GENERIC_TERMS = new Set(["model", "method", "framework", "performance", "image", "layer", "data", "training", "result", "baseline"]);
const EXPLICIT_ALIASES = new Map<string, string>([
  ["alpha compositing", "concept:alpha-compositing"],
  ["alpha blending", "concept:alpha-compositing"],
  ["alpha 합성", "concept:alpha-compositing"],
  ["알파 합성", "concept:alpha-compositing"],
  ["large language model", "concept:large-language-model"],
  ["large language models", "concept:large-language-model"],
  ["llm", "concept:large-language-model"],
  ["mixture of experts", "concept:mixture-of-experts"],
  ["mixture of expert", "concept:mixture-of-experts"],
  ["moe", "concept:mixture-of-experts"],
  ["retrieval augmented generation", "concept:retrieval-augmented-generation"],
  ["rag", "concept:retrieval-augmented-generation"],
  ["reinforcement learning", "concept:reinforcement-learning"],
  ["rl", "concept:reinforcement-learning"],
]);

function json(value: unknown, request: Request, env: KnowledgeEnv, status = 200) {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(value), { status, headers });
}

function corsHeaders(request: Request, env: KnowledgeEnv) {
  const origin = request.headers.get("Origin");
  const allowed = new Set([...DEFAULT_ORIGINS, ...(env.ALLOWED_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean)]);
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  });
  if (origin && allowed.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function originAllowed(request: Request, env: KnowledgeEnv) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  const allowed = new Set([...DEFAULT_ORIGINS, ...(env.ALLOWED_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean)]);
  return allowed.has(origin);
}

function asText(value: unknown, max = 12000): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max ? value.trim() : null;
}

function isLocalized(value: unknown): value is Localized {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return Boolean(asText(candidate.en, 10000) && asText(candidate.ko, 10000));
}

function validatePaperEvent(value: unknown): PaperEvent | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<PaperEvent>;
  const paper = candidate.paper;
  if (!/^[a-f0-9]{64}$/i.test(String(candidate.revision ?? ""))) return null;
  if (!paper || !/^arxiv:\d{4}\.\d{4,5}$/i.test(paper.canonicalId) || !/^[a-z0-9-]+$/.test(paper.slug)) return null;
  if (!isLocalized(paper.title) || !isLocalized(paper.excerpt) || !asText(paper.authors, 1200)) return null;
  if (!/^https:\/\/arxiv\.org\/abs\//.test(paper.url) || !/^\/[a-z0-9/-]+\/$/.test(paper.reviewUrl)) return null;
  if (!paper.hero || !/^https:\/\//.test(paper.hero.url) || !isLocalized(paper.hero.alt) || !isLocalized(paper.hero.caption) || !asText(paper.hero.license, 100)) return null;
  if (!Array.isArray(candidate.terminology) || candidate.terminology.length > 40 || candidate.terminology.length === 0) return null;
  const terminology = candidate.terminology.filter((term): term is TermInput => Boolean(
    term && asText(term.term, 100) && isLocalized(term.definition) && isLocalized(term.context) && Number.isFinite(term.priority) && Array.isArray(term.aliases) && term.aliases.length <= 12,
  ));
  if (terminology.length !== candidate.terminology.length) return null;
  if (!Array.isArray(candidate.sources) || candidate.sources.length === 0 || candidate.sources.length > 20) return null;
  const sources = candidate.sources.filter((source) => Boolean(source && /^https:\/\//.test(String(source.url)) && isLocalized(source.label) && asText(source.publisher, 250) && asText(source.type, 60)));
  if (sources.length !== candidate.sources.length || !sources.some((source) => source.url === paper.url)) return null;
  return { revision: candidate.revision!, generationOnly: candidate.generationOnly === true, paper: paper as PaperEvent["paper"], terminology, sources };
}

function normalizeName(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase().replace(/[^a-z0-9\p{Script=Hangul}]+/gu, " ").trim();
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function slugFromTerm(value: string) {
  return normalizeName(value).replace(/\s+/g, "-").slice(0, 72).replace(/^-|-$/g, "");
}

function canonicalIdForTerm(term: TermInput) {
  const normalizedNames = [term.term, ...term.aliases].map(normalizeName);
  const explicit = normalizedNames.map((name) => EXPLICIT_ALIASES.get(name)).find(Boolean);
  return explicit ?? `concept:${slugFromTerm(term.term)}`;
}

function candidateTerms(event: PaperEvent, existingIds: Set<string>, maxNew: number, aliasIds: Map<string, string> = new Map()) {
  const titleWords = normalizeName(`${event.paper.title.en} ${event.paper.title.ko}`);
  const ranked = event.terminology
    .map((term) => ({ term, id: resolveCanonicalId(term, aliasIds), name: normalizeName(term.term) }))
    .filter((item) => item.name.length >= 3 && !GENERIC_TERMS.has(item.name) && (item.term.priority > 0 || titleWords.includes(item.name)))
    .sort((a, b) => b.term.priority - a.term.priority || a.name.localeCompare(b.name))
    .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index);
  const existing = ranked.filter((item) => existingIds.has(item.id));
  const newConcepts = ranked.filter((item) => !existingIds.has(item.id)).slice(0, Math.min(1, Math.max(1, maxNew)));
  return [...existing, ...newConcepts].map((item) => ({ ...item, isExisting: existingIds.has(item.id) }));
}

function resolveCanonicalId(term: TermInput, aliasIds: Map<string, string>) {
  const known = [term.term, ...term.aliases].map(normalizeName).map((name) => aliasIds.get(name)).find(Boolean);
  return known ?? canonicalIdForTerm(term);
}

async function loadTermAliases(db: D1Database) {
  const rows = await db.prepare("SELECT canonical_id, canonical_name_en, canonical_name_ko, aliases_json FROM knowledge_term_index").all<{ canonical_id: string; canonical_name_en: string; canonical_name_ko: string; aliases_json: string }>();
  const aliases = new Map<string, string>();
  for (const row of rows.results) {
    for (const name of [row.canonical_name_en, row.canonical_name_ko, ...(JSON.parse(row.aliases_json || "[]") as string[])]) {
      const normalized = normalizeName(name);
      if (normalized && !aliases.has(normalized)) aliases.set(normalized, row.canonical_id);
    }
  }
  return aliases;
}

async function reserveWeeklyBrief(db: D1Database, weekStart: string, limit: number) {
  await db.prepare("INSERT OR IGNORE INTO knowledge_weekly_budget (week_start) VALUES (?)").bind(weekStart).run();
  const result = await db.prepare("UPDATE knowledge_weekly_budget SET reserved_briefs = reserved_briefs + 1 WHERE week_start = ? AND reserved_briefs + used_briefs < ?").bind(weekStart, limit).run();
  return Number(result.meta?.changes ?? 0) === 1;
}

async function settleWeeklyBrief(db: D1Database, weekStart: string, succeeded: boolean) {
  await db.prepare("UPDATE knowledge_weekly_budget SET reserved_briefs = MAX(0, reserved_briefs - 1), used_briefs = used_briefs + ? WHERE week_start = ?").bind(succeeded ? 1 : 0, weekStart).run();
}

async function reserveMonthlyCost(db: D1Database, monthKey: string, amount: number, limit: number) {
  await db.prepare("INSERT OR IGNORE INTO knowledge_monthly_budget (month_key) VALUES (?)").bind(monthKey).run();
  const result = await db.prepare("UPDATE knowledge_monthly_budget SET reserved_usd = reserved_usd + ? WHERE month_key = ? AND reserved_usd + used_usd + ? <= ?")
    .bind(amount, monthKey, amount, limit).run();
  return Number(result.meta?.changes ?? 0) === 1;
}

async function settleMonthlyCost(db: D1Database, monthKey: string, reservation: number, charged: number) {
  await db.prepare("UPDATE knowledge_monthly_budget SET reserved_usd = MAX(0, reserved_usd - ?), used_usd = used_usd + ? WHERE month_key = ?")
    .bind(reservation, charged, monthKey).run();
}

function actualUsage(result: unknown) {
  if (!result || typeof result !== "object") return { input: null, output: null, cached: null };
  const record = result as Record<string, unknown>;
  const usage = (record.usage && typeof record.usage === "object" ? record.usage :
    record.result && typeof record.result === "object" && (record.result as Record<string, unknown>).usage && typeof (record.result as Record<string, unknown>).usage === "object"
      ? (record.result as Record<string, unknown>).usage : {}) as Record<string, unknown>;
  const read = (...keys: string[]) => {
    const value = keys.map((key) => usage[key]).find((item) => typeof item === "number" && Number.isFinite(item));
    return typeof value === "number" ? Math.max(0, Math.floor(value)) : null;
  };
  return {
    input: read("prompt_tokens", "input_tokens"),
    output: read("completion_tokens", "output_tokens"),
    cached: read("cached_input_tokens", "cached_tokens"),
  };
}

function configuredActualCost(env: KnowledgeEnv, input: number | null, output: number | null, cached: number | null) {
  const inputRate = Number(env.KNOWLEDGE_INPUT_USD_PER_MILLION);
  const outputRate = Number(env.KNOWLEDGE_OUTPUT_USD_PER_MILLION);
  if (input === null || output === null || !Number.isFinite(inputRate) || !Number.isFinite(outputRate) || inputRate < 0 || outputRate < 0) return null;
  const billableInput = Math.max(0, input - (cached ?? 0));
  return (billableInput * inputRate + output * outputRate) / 1_000_000;
}

async function indexTerms(db: D1Database, event: PaperEvent, now: string, indexOnly: boolean) {
  const aliasIds = await loadTermAliases(db);
  const unique = new Map<string, TermInput>();
  for (const term of event.terminology) {
    const id = resolveCanonicalId(term, aliasIds);
    const current = unique.get(id);
    if (!current) unique.set(id, term);
    else {
      const preferred = term.priority > current.priority ? term : current;
      unique.set(id, { ...preferred, aliases: [...new Set([current.term, ...current.aliases, term.term, ...term.aliases])] });
    }
    for (const alias of [term.term, ...term.aliases]) {
      const normalized = normalizeName(alias);
      if (normalized && !aliasIds.has(normalized)) aliasIds.set(normalized, id);
    }
  }
  const ids: string[] = [];
  for (const [id, term] of unique) {
    const slug = id.replace(/^concept:/, "");
    const koreanAlias = term.aliases.find((alias) => /\p{Script=Hangul}/u.test(alias)) ?? term.term;
    const existing = await db.prepare("SELECT aliases_json, first_seen_at, paper_count, brief_status, priority_score FROM knowledge_term_index WHERE canonical_id = ?").bind(id)
      .first<{ aliases_json: string; first_seen_at: string; paper_count: number; brief_status: string; priority_score: number }>();
    const linked = await db.prepare("SELECT term_id FROM paper_term_index WHERE paper_id = ? AND term_id = ?").bind(event.paper.canonicalId, id).first();
    const aliases = [...new Set([...(existing ? JSON.parse(existing.aliases_json || "[]") as string[] : []), term.term, ...term.aliases])];
    const score = Math.max(term.priority, Number(existing?.priority_score ?? 0)) +
      (`${event.paper.title.en} ${event.paper.title.ko}`.toLocaleLowerCase().includes(term.term.toLocaleLowerCase()) ? 20 : 0) +
      Math.min(10, (Number(existing?.paper_count ?? 0) + (linked ? 0 : 1)) * 2);
    const briefRow = await db.prepare("SELECT status FROM knowledge_concepts WHERE canonical_id = ? AND status = 'published'").bind(id).first<{ status: string }>();
    const normalizedName = normalizeName(term.term);
    const isGenerationCandidate = normalizedName.length >= 3 && !GENERIC_TERMS.has(normalizedName) && (term.priority > 0 || normalizeName(`${event.paper.title.en} ${event.paper.title.ko}`).includes(normalizedName));
    const briefStatus = briefRow ? "published" : isGenerationCandidate ? (indexOnly ? "awaiting_configuration" : "queued") : "indexed";
    const sourceUrls = event.sources.map((source) => source.url);
    await db.prepare("INSERT INTO knowledge_term_index (canonical_id, slug, canonical_name_en, canonical_name_ko, aliases_json, definition_en, definition_ko, first_seen_at, last_seen_at, paper_count, priority_score, brief_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?) ON CONFLICT(canonical_id) DO UPDATE SET aliases_json = excluded.aliases_json, definition_en = excluded.definition_en, definition_ko = excluded.definition_ko, last_seen_at = excluded.last_seen_at, paper_count = knowledge_term_index.paper_count + ?, priority_score = MAX(knowledge_term_index.priority_score, excluded.priority_score), brief_status = CASE WHEN knowledge_term_index.brief_status = 'published' THEN 'published' ELSE excluded.brief_status END")
      .bind(id, slug, term.term, koreanAlias, JSON.stringify(aliases), term.definition.en, term.definition.ko, existing?.first_seen_at ?? now, now, score, briefStatus, linked ? 0 : 1).run();
    await db.prepare("INSERT INTO paper_term_index (paper_id, term_id, definition_en, definition_ko, context_en, context_ko, priority_score, source_urls_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(paper_id, term_id) DO UPDATE SET definition_en = excluded.definition_en, definition_ko = excluded.definition_ko, context_en = excluded.context_en, context_ko = excluded.context_ko, priority_score = MAX(paper_term_index.priority_score, excluded.priority_score), source_urls_json = excluded.source_urls_json")
      .bind(event.paper.canonicalId, id, term.definition.en, term.definition.ko, term.context.en, term.context.ko, score, JSON.stringify(sourceUrls), now).run();
    if (briefRow) {
      await db.prepare("INSERT INTO paper_concepts (paper_id, concept_id, relation, evidence, created_at) VALUES (?, ?, 'USES', ?, ?) ON CONFLICT(paper_id, concept_id) DO UPDATE SET evidence = excluded.evidence")
        .bind(event.paper.canonicalId, id, term.context.en, now).run();
    }
    ids.push(id);
  }
  return { ids, aliasIds };
}

function aiResponseText(result: unknown) {
  if (typeof result === "string") return result;
  if (!result || typeof result !== "object") return null;
  const response = (result as Record<string, unknown>).response;
  if (typeof response === "string") return response;
  const inner = (result as Record<string, unknown>).result;
  if (inner && typeof inner === "object" && typeof (inner as Record<string, unknown>).response === "string") return (inner as Record<string, string>).response;
  return null;
}

function parseModelJson(value: string): unknown {
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(cleaned); } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("The model did not return a JSON object.");
  }
}

function validateGeneratedConcept(raw: unknown, selected: { term: TermInput; id: string }, event: PaperEvent): GeneratedConcept {
  if (!raw || typeof raw !== "object") throw new Error("Generated concept is not an object.");
  const item = raw as Partial<GeneratedConcept>;
  const slug = selected.id.replace(/^concept:/, "");
  if (item.id !== selected.id || item.slug !== slug || !isLocalized(item.canonicalName) || !isLocalized(item.dek)) throw new Error("Generated concept identity or localized title is invalid.");
  if (!Array.isArray(item.sections) || !REQUIRED_SECTION_IDS.every((id) => item.sections?.some((section) => section.id === id && isLocalized(section.heading) && Array.isArray(section.paragraphs) && section.paragraphs.length > 0 && section.paragraphs.every(isLocalized)))) throw new Error("Generated brief is missing a required section or language.");
  if (!Array.isArray(item.sources) || item.sources.length === 0) throw new Error("Generated brief has no sources.");
  if (!Array.isArray(item.aliases) || item.aliases.length > 24 || item.aliases.some((alias) => !asText(alias, 100))) throw new Error("Generated concept aliases are invalid.");
  const allowedSources = new Set(event.sources.map((source) => source.url));
  if (item.sources.some((source) => !source || !allowedSources.has(source.url) || !isLocalized(source.label) || !asText(source.publisher, 250))) throw new Error("Generated citations must refer only to the provided original paper.");
  if (!item.visualAsset || item.visualAsset.url !== event.paper.hero.url || item.visualAsset.license !== event.paper.hero.license || !isLocalized(item.visualAsset.alt) || !isLocalized(item.visualAsset.caption)) throw new Error("Generated visualization must reuse and attribute the provided paper figure.");
  if (!item.onePager || !asText(item.onePager.oneLine, 300) || !Array.isArray(item.onePager.sections) || item.onePager.sections.length !== 6 || item.onePager.sections.some((section) => !asText(section.heading, 100) || !asText(section.body, 1400)) || !Array.isArray(item.onePager.sources) || item.onePager.sources.some((source) => !allowedSources.has(source))) throw new Error("Generated One-Pager is incomplete or contains an unapproved source.");
  if (!item.domain || !Array.isArray(item.domain) || !item.domain.every((domain) => typeof domain === "string" && domain.length <= 80)) throw new Error("Generated concept domain is invalid.");
  return {
    ...(item as GeneratedConcept),
    aliases: [...new Set([...selected.term.aliases, ...(item.aliases ?? [])])],
    version: 1,
    status: "published",
    sourcePapers: [event.paper.canonicalId],
    generatedAt: new Date().toISOString(),
    sourcePaperReviews: [{ id: event.paper.canonicalId, title: event.paper.title, reviewUrl: event.paper.reviewUrl, url: event.paper.url }],
  };
}

function promptFor(event: PaperEvent, selected: { term: TermInput; id: string }[]) {
  return `Create one concise bilingual technical concept record for each selected term. Return JSON only: {"concepts":[...]}. Ground technical claims in the supplied paper excerpt and supplied references. Cite only URLs in the supplied source list; never invent a citation, figure, result, or benchmark. Reuse the supplied paper figure URL and license and write original alt text/caption. Explain the concept, not just the paper. Include these exact article section IDs: ${REQUIRED_SECTION_IDS.join(", ")}. Each article section needs en and ko heading objects and at least one en/ko paragraph pair. The One-Pager is Korean, has oneLine plus exactly six sections with heading/body, and sources array containing only supplied URLs. Include a meaningful comparison and limitations grounded in the excerpt or cited sources. If the paper does not support a claim, qualify or omit it. The HR implication may say the link is weak.

Paper: ${JSON.stringify({ canonicalId: event.paper.canonicalId, title: event.paper.title, url: event.paper.url, excerpt: event.paper.excerpt, hero: event.paper.hero })}
Supplied sources: ${JSON.stringify(event.sources)}
Selected terms: ${JSON.stringify(selected.map(({ id, term }) => ({ id, term: term.term, definition: term.definition, context: term.context, aliases: term.aliases })))}

For each concept use: id, slug, canonicalName, aliases, dek, domain, sections, visualAsset, sources, onePager. The id and slug must exactly match the selected term identity. Use only supplied sources.`;
}

function maxConcepts(env: KnowledgeEnv) {
  const value = Number(env.KNOWLEDGE_MAX_NEW_CONCEPTS ?? "1");
  return Number.isFinite(value) ? Math.min(1, Math.max(1, Math.floor(value))) : 1;
}

type KnowledgeWorkflowStep = {
  do<T>(name: string, callback: () => Promise<T>): Promise<T>;
};

export class KnowledgePaperWorkflow extends WorkflowEntrypoint<KnowledgeEnv, PaperEvent> {
  async run(event: { payload: PaperEvent; instanceId: string }, step: KnowledgeWorkflowStep) {
    const db = this.env.KNOWLEDGE_DB;
    if (!db) throw new Error("KNOWLEDGE_DB binding is not configured.");
    const input = validatePaperEvent(event.payload);
    if (!input) throw new Error("Paper payload is invalid.");
    const idempotencyKey = `paper:${input.paper.canonicalId}:review:${input.revision}:knowledge:v1`;
    const currentJob = await db.prepare("SELECT attempt FROM knowledge_jobs WHERE idempotency_key = ?").bind(idempotencyKey).first<{ attempt: number }>();
    const retryCount = Math.max(0, Number(currentJob?.attempt ?? 1) - 1);

    await step.do("mark-paper-job-processing", async () => {
      await db.prepare("UPDATE knowledge_jobs SET status = 'processing', updated_at = ? WHERE idempotency_key = ? AND status IN ('queued', 'failed')").bind(new Date().toISOString(), idempotencyKey).run();
      return { status: "processing" };
    });

    let pendingBudget: { weekStart: string; monthKey: string; reserveCost: number; ledgerId: string } | null = null;
    let weeklyReserved = false;
    let monthlyReserved = false;
    let ledgerStatus: "reserved" | "succeeded" | "failed" | "blocked" = "blocked";
    let actualInputTokens: number | null = null;
    let actualOutputTokens: number | null = null;
    let cachedInputTokens: number | null = null;
    let estimatedCostUsd: number | null = null;
    let actualCostUsd: number | null = null;
    let aiWasCalled = false;
    let skipReason = "";
    try {
      const existing = await step.do("load-existing-concept-ids", async () => {
        const rows = await db.prepare("SELECT canonical_id FROM knowledge_concepts WHERE status = 'published'").all<{ canonical_id: string }>();
        return rows.results.map((row) => row.canonical_id);
      });
      const generationEnabled = input.generationOnly === true && generationConfigured(this.env);
      const indexed = await step.do("index-all-reviewed-terms", () => indexTerms(db, input, new Date().toISOString(), !generationEnabled));
      const indexedTermIds = indexed.ids;
      const chosen = generationEnabled ? candidateTerms(input, new Set(existing), maxConcepts(this.env), indexed.aliasIds) : [];
      const newTerms = chosen.filter((item) => !item.isExisting);
      let estimatedInputTokens = 0;
      let estimatedOutputTokens = 0;
      let createdConcepts: GeneratedConcept[] = [];

      if (newTerms.length > 0) {
        const prompt = promptFor(input, newTerms);
        estimatedInputTokens = Math.ceil(prompt.length / 4);
        estimatedOutputTokens = 5000;
        if (!generationEnabled) {
          skipReason = "AI generation is disabled or its spending policy is not configured";
        } else {
          const model = this.env.KNOWLEDGE_MODEL_STANDARD ?? this.env.KNOWLEDGE_MODEL ?? "@cf/meta/llama-3.1-8b-instruct-fp8-fast";
          const weeklyLimit = weeklyBriefLimit(this.env);
          const monthlyLimit = numericSetting(this.env.KNOWLEDGE_MONTHLY_AI_BUDGET_USD);
          const configuredReserve = numericSetting(this.env.KNOWLEDGE_MAX_BRIEF_COST_USD);
          const inputRate = Number(this.env.KNOWLEDGE_INPUT_USD_PER_MILLION);
          const outputRate = Number(this.env.KNOWLEDGE_OUTPUT_USD_PER_MILLION);
          estimatedCostUsd = Number.isFinite(inputRate) && Number.isFinite(outputRate) && inputRate >= 0 && outputRate >= 0
            ? (estimatedInputTokens * inputRate + estimatedOutputTokens * outputRate) / 1_000_000
            : null;
          const reserveCost = Math.max(configuredReserve, estimatedCostUsd ?? 0);
          if (weeklyLimit < 1 || reserveCost <= 0 || reserveCost > monthlyLimit) {
            skipReason = "weekly or monthly Knowledge budget is exhausted or too small";
          } else {
            const now = new Date();
            const weekStart = weekStartUtc(now);
            const monthKey = now.toISOString().slice(0, 7);
            const gotWeekly = await step.do(`reserve-weekly-brief-${weekStart}`, () => reserveWeeklyBrief(db, weekStart, weeklyLimit));
            if (!gotWeekly) {
              skipReason = "the weekly Technical Brief quota is full";
            } else {
              weeklyReserved = true;
              const gotMonthly = await step.do(`reserve-monthly-ai-budget-${monthKey}`, () => reserveMonthlyCost(db, monthKey, reserveCost, monthlyLimit));
              if (!gotMonthly) {
                await settleWeeklyBrief(db, weekStart, false);
                weeklyReserved = false;
                skipReason = "the configured monthly AI budget is full";
              } else {
                monthlyReserved = true;
                const ledgerId = `${idempotencyKey}:ai:${event.instanceId}`;
                pendingBudget = { weekStart, monthKey, reserveCost, ledgerId };
                await db.prepare("INSERT OR IGNORE INTO knowledge_token_ledger (id, job_id, workflow_type, model_id, estimated_input_tokens, estimated_output_tokens, reserved_cost_usd, estimated_cost_usd, status, retry_count, created_at) VALUES (?, ?, 'technical-brief', ?, ?, ?, ?, ?, 'reserved', 1, ?)")
                  .bind(ledgerId, idempotencyKey, model, estimatedInputTokens, estimatedOutputTokens, reserveCost, estimatedCostUsd, new Date().toISOString()).run();
                ledgerStatus = "reserved";
                await db.prepare("UPDATE knowledge_token_ledger SET retry_count = ? WHERE id = ?").bind(retryCount, ledgerId).run();
                const generated = await step.do("generate-one-budgeted-technical-brief", async () => {
                  aiWasCalled = true;
                  const result = await this.env.AI!.run(model, { prompt, max_tokens: 5000, temperature: 0.15 });
                  const text = aiResponseText(result);
                  if (!text) throw new Error("Workers AI returned an empty result.");
                  return { text, usage: actualUsage(result) };
                });
                actualInputTokens = generated.usage.input;
                actualOutputTokens = generated.usage.output;
                cachedInputTokens = generated.usage.cached;
                actualCostUsd = configuredActualCost(this.env, actualInputTokens, actualOutputTokens, cachedInputTokens);
                const parsed = parseModelJson(generated.text) as { concepts?: unknown[] };
                if (!Array.isArray(parsed.concepts) || parsed.concepts.length !== newTerms.length) throw new Error("Workers AI did not return the requested number of concepts.");
                createdConcepts = parsed.concepts.map((concept, index) => validateGeneratedConcept(concept, newTerms[index], input));
                const charged = actualCostUsd ?? reserveCost;
                await settleMonthlyCost(db, monthKey, reserveCost, charged);
                monthlyReserved = false;
                await settleWeeklyBrief(db, weekStart, true);
                weeklyReserved = false;
                ledgerStatus = "succeeded";
                await db.prepare("UPDATE knowledge_token_ledger SET actual_input_tokens = ?, actual_output_tokens = ?, cached_input_tokens = ?, actual_cost_usd = ?, status = 'succeeded', completed_at = ? WHERE id = ?")
                  .bind(actualInputTokens, actualOutputTokens, cachedInputTokens, actualCostUsd, new Date().toISOString(), ledgerId).run();
              }
            }
          }
        }
      }

      await step.do("validate-and-publish-concepts", async () => {
        const now = new Date().toISOString();
        await db.prepare("UPDATE knowledge_jobs SET status = 'validated', terms_seen = ?, concepts_created = ?, model_calls = ?, estimated_input_tokens = ?, estimated_output_tokens = ?, actual_input_tokens = ?, actual_output_tokens = ?, cached_input_tokens = ?, model_id = ?, estimated_cost_usd = ?, actual_cost_usd = ?, selected_concept_ids = ?, updated_at = ? WHERE idempotency_key = ?")
          .bind(input.terminology.length, createdConcepts.length, aiWasCalled ? 1 : 0, estimatedInputTokens, estimatedOutputTokens, actualInputTokens, actualOutputTokens, cachedInputTokens, aiWasCalled ? this.env.KNOWLEDGE_MODEL_STANDARD ?? this.env.KNOWLEDGE_MODEL ?? "@cf/meta/llama-3.1-8b-instruct-fp8-fast" : null, estimatedCostUsd, actualCostUsd, JSON.stringify(indexedTermIds), now, idempotencyKey).run();

        for (const concept of createdConcepts) {
          await db.prepare("INSERT INTO knowledge_concepts (canonical_id, slug, status, version, article_json, created_at, updated_at) VALUES (?, ?, 'published', 1, ?, ?, ?) ON CONFLICT(canonical_id) DO NOTHING")
            .bind(concept.id, concept.slug, JSON.stringify(concept), now, now).run();
          await db.prepare("UPDATE knowledge_term_index SET brief_status = 'published' WHERE canonical_id = ?").bind(concept.id).run();
        }
        for (const item of chosen.filter((entry) => entry.isExisting || createdConcepts.some((concept) => concept.id === entry.id))) {
          await db.prepare("INSERT INTO paper_concepts (paper_id, concept_id, relation, evidence, created_at) VALUES (?, ?, 'USES', ?, ?) ON CONFLICT(paper_id, concept_id) DO UPDATE SET evidence = excluded.evidence")
            .bind(input.paper.canonicalId, item.id, item.term.context.en, now).run();
        }
        if (newTerms.length > 0 && skipReason) {
          const queueStatus = generationEnabled ? "queued" : "awaiting_configuration";
          await db.prepare("UPDATE knowledge_term_index SET brief_status = ? WHERE canonical_id = ? AND brief_status != 'published'").bind(queueStatus, newTerms[0].id).run();
        }
        const queued = await db.prepare("SELECT COUNT(*) AS count FROM knowledge_term_index WHERE brief_status IN ('queued', 'awaiting_configuration')").first<{ count: number }>();
        const status = input.generationOnly && newTerms.length > 0 && !generationEnabled ? "awaiting_configuration" : "published";
        const message = `Indexed ${indexedTermIds.length} term(s); ${Number(queued?.count ?? 0)} candidate(s) remain queued${createdConcepts.length ? `; published ${createdConcepts.length} Technical Brief` : ""}${skipReason ? `; ${skipReason}` : "."} ${aiWasCalled ? "Provider-reported usage is recorded separately from estimates." : "No model call was made."}`;
        await db.prepare("UPDATE knowledge_jobs SET status = ?, updated_at = ?, finished_at = ?, public_message = ? WHERE idempotency_key = ?")
          .bind(status, now, now, status === "awaiting_configuration" ? `${message} Generation awaits explicit AI configuration.` : message, idempotencyKey).run();
        if (status === "awaiting_configuration") await db.prepare("UPDATE knowledge_jobs SET status = 'awaiting_configuration' WHERE idempotency_key = ?").bind(idempotencyKey).run();
        return { indexed: indexedTermIds.length, published: createdConcepts.length, queued: Number(queued?.count ?? 0) };
      });
    } catch (error) {
      if (pendingBudget && (weeklyReserved || monthlyReserved)) {
        try {
          if (monthlyReserved) await settleMonthlyCost(db, pendingBudget.monthKey, pendingBudget.reserveCost, actualCostUsd ?? pendingBudget.reserveCost);
          if (weeklyReserved) await settleWeeklyBrief(db, pendingBudget.weekStart, false);
          if (ledgerStatus === "reserved") await db.prepare("UPDATE knowledge_token_ledger SET actual_input_tokens = ?, actual_output_tokens = ?, cached_input_tokens = ?, actual_cost_usd = ?, status = 'failed', completed_at = ? WHERE id = ?")
            .bind(actualInputTokens, actualOutputTokens, cachedInputTokens, actualCostUsd, new Date().toISOString(), pendingBudget.ledgerId).run();
        } catch { console.error("[knowledge-workflow] budget settlement failed", { paperId: input.paper.canonicalId }); }
      }
      const detail = (error instanceof Error ? error.message : "Knowledge processing failed.").slice(0, 500);
      console.error("[knowledge-workflow] processing failed", { paperId: input.paper.canonicalId, detail });
      const safeMessage = detail.toLowerCase().includes("citation")
        ? "Citation validation failed; no article was published. Update the reviewed source list before retrying."
        : detail.toLowerCase().includes("ai")
          ? "The language model request failed; no article was published. Retry after the service recovers."
          : "Concept validation or publication failed; no article was published. Retry after correcting the review data.";
      await db.prepare("UPDATE knowledge_jobs SET status = 'failed', actual_input_tokens = ?, actual_output_tokens = ?, cached_input_tokens = ?, actual_cost_usd = ?, updated_at = ?, finished_at = ?, public_message = ? WHERE idempotency_key = ?")
        .bind(actualInputTokens, actualOutputTokens, cachedInputTokens, actualCostUsd, new Date().toISOString(), new Date().toISOString(), safeMessage, idempotencyKey).run();
      if (input.generationOnly) {
        for (const term of input.terminology) await db.prepare("UPDATE knowledge_term_index SET brief_status = 'queued' WHERE canonical_id = ? AND brief_status = 'processing'").bind(canonicalIdForTerm(term)).run();
      }
      throw error;
    }
  }
}

function publicJob(row: D1Row) {
  return {
    id: row.id,
    idempotencyKey: row.idempotency_key,
    paperId: row.paper_id,
    status: row.status,
    environment: "cloud",
    selectedConceptIds: JSON.parse(String(row.selected_concept_ids ?? "[]")),
    termsSeen: Number(row.terms_seen ?? 0),
    newConcepts: Number(row.concepts_created ?? 0),
    modelCalls: Number(row.model_calls ?? 0),
    estimatedTokens: Number(row.estimated_input_tokens ?? 0) + Number(row.estimated_output_tokens ?? 0),
    actualInputTokens: row.actual_input_tokens == null ? null : Number(row.actual_input_tokens),
    actualOutputTokens: row.actual_output_tokens == null ? null : Number(row.actual_output_tokens),
    cachedInputTokens: row.cached_input_tokens == null ? null : Number(row.cached_input_tokens),
    modelId: row.model_id ?? null,
    estimatedCostUsd: row.estimated_cost_usd == null ? null : Number(row.estimated_cost_usd),
    actualCostUsd: row.actual_cost_usd == null ? null : Number(row.actual_cost_usd),
    startedAt: row.created_at,
    finishedAt: row.finished_at ?? null,
    message: row.public_message ?? "Knowledge processing is in progress.",
  };
}

function publicConcept(row: D1Row) {
  const article = JSON.parse(String(row.article_json)) as GeneratedConcept;
  const allowedSiteOrigin = (DEFAULT_ORIGINS[0] ?? "https://minonminho.github.io");
  return {
    ...article,
    lastUpdated: article.generatedAt?.slice(0, 10) ?? (article as GeneratedConcept & { lastUpdated?: string }).lastUpdated ?? "",
    visualAsset: {
      ...article.visualAsset,
      url: article.visualAsset.url ?? ((article.visualAsset as GeneratedConcept["visualAsset"] & { path?: string }).path
        ? new URL((article.visualAsset as GeneratedConcept["visualAsset"] & { path?: string }).path!, allowedSiteOrigin).toString()
        : ""),
    },
    onePager: {
      ...article.onePager,
      status: article.onePager.pdfPath && article.onePager.docxPath ? "ready" : "pending",
      pdfPath: article.onePager.pdfPath ?? null,
      docxPath: article.onePager.docxPath ?? null,
    },
    briefPath: `/knowledge/article/?slug=${encodeURIComponent(article.slug)}`,
  };
}

export async function handleKnowledgeRequest(request: Request, env: KnowledgeEnv): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/knowledge")) return null;
  if (!originAllowed(request, env)) return new Response("Origin not allowed.", { status: 403 });
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  if (request.method === "GET" && url.pathname === "/knowledge/health") return json({ ok: Boolean(env.KNOWLEDGE_DB && env.KNOWLEDGE_WORKFLOW) }, request, env);
  if (!env.KNOWLEDGE_DB) return json({ error: "Knowledge storage is not configured." }, request, env, 503);
  const db = env.KNOWLEDGE_DB;

  if (request.method === "POST" && url.pathname === "/knowledge/seed") {
    if (!env.KNOWLEDGE_INGEST_TOKEN) return json({ error: "Knowledge ingest authentication is not configured." }, request, env, 503);
    if (request.headers.get("Authorization") !== `Bearer ${env.KNOWLEDGE_INGEST_TOKEN}`) return json({ error: "Unauthorized." }, request, env, 401);
    const length = Number(request.headers.get("Content-Length") ?? "0");
    if (length > 1_000_000) return json({ error: "Seed payload is too large." }, request, env, 413);
    let seed: unknown;
    try {
      const raw = await request.text();
      if (raw.length > 1_000_000) return json({ error: "Seed payload is too large." }, request, env, 413);
      seed = JSON.parse(raw);
    } catch { return json({ error: "Invalid seed JSON." }, request, env, 400); }
    if (!seed || typeof seed !== "object") return json({ error: "Invalid seed payload." }, request, env, 400);
    const concepts = (seed as { concepts?: unknown }).concepts;
    const edges = (seed as { paperConcepts?: unknown }).paperConcepts ?? [];
    if (!Array.isArray(concepts) || concepts.length > 100 || !Array.isArray(edges) || edges.length > 500) return json({ error: "Invalid seed payload." }, request, env, 400);
    const validConcepts = concepts.filter((item): item is GeneratedConcept => Boolean(
      item && typeof item === "object" && /^concept:[a-z0-9-]+$/.test(String((item as GeneratedConcept).id)) && /^[a-z0-9-]+$/.test(String((item as GeneratedConcept).slug)) &&
      isLocalized((item as GeneratedConcept).canonicalName) && isLocalized((item as GeneratedConcept).dek) && Array.isArray((item as GeneratedConcept).sections) &&
      Array.isArray((item as GeneratedConcept).sources) && (item as GeneratedConcept).sources.length > 0 &&
      Array.isArray((item as GeneratedConcept).sourcePapers) && (item as GeneratedConcept).sourcePapers.length > 0 &&
      Array.isArray((item as GeneratedConcept).domain) && Boolean((item as GeneratedConcept).visualAsset) && Boolean((item as GeneratedConcept).onePager),
    ));
    if (validConcepts.length !== concepts.length) return json({ error: "A seeded concept failed schema validation." }, request, env, 400);
    const validEdges = (edges as Array<{ paperId?: unknown; conceptId?: unknown; relation?: unknown; evidence?: unknown }>).filter((item): item is { paperId: string; conceptId: string; relation: string; evidence: string } => Boolean(
      typeof item.paperId === "string" && /^arxiv:\d{4}\.\d{4,5}$/i.test(item.paperId) && typeof item.conceptId === "string" && /^concept:[a-z0-9-]+$/.test(item.conceptId) &&
      ["USES", "INTRODUCES", "EVALUATES"].includes(String(item.relation).toUpperCase()) && typeof item.evidence === "string" && item.evidence.length > 0 && item.evidence.length <= 2000,
    ));
    if (validEdges.length !== edges.length) return json({ error: "A paper-concept relationship failed schema validation." }, request, env, 400);
    const knownConceptIds = new Set(validConcepts.map((concept) => concept.id));
    for (const item of validEdges) {
      if (!knownConceptIds.has(item.conceptId)) {
        const exists = await db.prepare("SELECT canonical_id FROM knowledge_concepts WHERE canonical_id = ?").bind(item.conceptId).first();
        if (!exists) return json({ error: "A paper-concept relationship references a missing concept." }, request, env, 400);
      }
    }
    let inserted = 0;
    for (const concept of validConcepts) {
      const now = new Date().toISOString();
      const result = await db.prepare("INSERT OR IGNORE INTO knowledge_concepts (canonical_id, slug, status, version, article_json, created_at, updated_at) VALUES (?, ?, 'published', ?, ?, ?, ?)")
        .bind(concept.id, concept.slug, concept.version || 1, JSON.stringify({ ...concept, status: "published", generatedAt: concept.generatedAt ?? now }), now, now).run();
      inserted += Number(result.meta?.changes ?? 0);
    }
    for (const item of validEdges) {
      await db.prepare("INSERT INTO paper_concepts (paper_id, concept_id, relation, evidence, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(paper_id, concept_id) DO UPDATE SET relation = excluded.relation, evidence = excluded.evidence")
        .bind(item.paperId, item.conceptId, item.relation.toUpperCase(), item.evidence, new Date().toISOString()).run();
    }
    return json({ ok: true, seeded: inserted, linked: validEdges.length }, request, env);
  }

  if (request.method === "POST" && url.pathname === "/knowledge/generate") {
    if (!env.KNOWLEDGE_INGEST_TOKEN) return json({ error: "Knowledge generation authentication is not configured." }, request, env, 503);
    if (request.headers.get("Authorization") !== `Bearer ${env.KNOWLEDGE_INGEST_TOKEN}`) return json({ error: "Unauthorized." }, request, env, 401);
    if (!generationConfigured(env)) return json({ error: "AI generation is disabled or its monthly spending policy is not configured." }, request, env, 409);
    if (!env.KNOWLEDGE_WORKFLOW) return json({ error: "Knowledge Workflow binding is not configured." }, request, env, 503);
    const weekStart = weekStartUtc(new Date());
    const weekLimit = weeklyBriefLimit(env);
    const weeklyUse = await db.prepare("SELECT reserved_briefs + used_briefs AS total FROM knowledge_weekly_budget WHERE week_start = ?").bind(weekStart).first<{ total: number }>();
    if (weekLimit < 1 || Number(weeklyUse?.total ?? 0) >= weekLimit) return json({ error: "The weekly Technical Brief quota is full; candidates remain queued." }, request, env, 429);
    const monthKey = new Date().toISOString().slice(0, 7);
    const monthlyLimit = numericSetting(env.KNOWLEDGE_MONTHLY_AI_BUDGET_USD);
    const perBriefReserve = numericSetting(env.KNOWLEDGE_MAX_BRIEF_COST_USD);
    const monthlyUse = await db.prepare("SELECT reserved_usd + used_usd AS total FROM knowledge_monthly_budget WHERE month_key = ?").bind(monthKey).first<{ total: number }>();
    if (perBriefReserve <= 0 || perBriefReserve > monthlyLimit || Number(monthlyUse?.total ?? 0) + perBriefReserve > monthlyLimit) return json({ error: "The configured monthly AI budget is full; candidates remain queued." }, request, env, 429);

    const candidate = await db.prepare("SELECT term.canonical_id, term.slug, paper.paper_id, event.event_json FROM knowledge_term_index AS term JOIN paper_term_index AS paper ON paper.term_id = term.canonical_id JOIN knowledge_paper_events AS event ON event.paper_id = paper.paper_id WHERE term.brief_status IN ('queued', 'awaiting_configuration') ORDER BY term.priority_score DESC, term.paper_count DESC, paper.priority_score DESC, event.updated_at DESC LIMIT 1")
      .first<{ canonical_id: string; slug: string; paper_id: string; event_json: string }>();
    if (!candidate) return json({ queued: 0, message: "No eligible Knowledge Brief candidates are queued." }, request, env);

    let original: PaperEvent | null = null;
    try { original = validatePaperEvent(JSON.parse(candidate.event_json)); } catch { original = null; }
    const aliases = await loadTermAliases(db);
    const matchingTerm = original?.terminology.find((term) => resolveCanonicalId(term, aliases) === candidate.canonical_id);
    if (!original || !matchingTerm) {
      await db.prepare("UPDATE knowledge_term_index SET brief_status = 'failed' WHERE canonical_id = ?").bind(candidate.canonical_id).run();
      return json({ error: "The queued term has no valid cached paper source; it remains visible for manual review." }, request, env, 409);
    }

    const revision = await sha256Hex(`${original.revision}:technical-brief:v1:${candidate.canonical_id}:${weekStart}`);
    const payload: PaperEvent = { ...original, revision, generationOnly: true, terminology: [matchingTerm] };
    const idempotencyKey = `paper:${payload.paper.canonicalId}:review:${payload.revision}:knowledge:v1`;
    const workflowBase = `knowledge-gen-${candidate.slug}-${weekStart}`.toLowerCase();
    const now = new Date().toISOString();
    const existingJob = await db.prepare("SELECT id, idempotency_key, paper_id, status, attempt, created_at, updated_at, finished_at, selected_concept_ids, terms_seen, concepts_created, model_calls, estimated_input_tokens, estimated_output_tokens, actual_input_tokens, actual_output_tokens, cached_input_tokens, model_id, estimated_cost_usd, actual_cost_usd, public_message FROM knowledge_jobs WHERE idempotency_key = ?")
      .bind(idempotencyKey).first<{ id: string; status: string; attempt: number } & D1Row>();
    let workflowId = `${workflowBase}-a1`;
    let attempt = 1;
    if (existingJob && existingJob.status !== "failed") {
      return json({ job: publicJob(existingJob), deduplicated: true }, request, env);
    }
    if (existingJob?.status === "failed" && Number(existingJob.attempt) > maxRetries(env)) {
      await db.prepare("UPDATE knowledge_term_index SET brief_status = 'failed' WHERE canonical_id = ?").bind(candidate.canonical_id).run();
      return json({ job: publicJob(existingJob), retryLimitReached: true }, request, env, 429);
    }
    const reservedTerm = await db.prepare("UPDATE knowledge_term_index SET brief_status = 'processing' WHERE canonical_id = ? AND brief_status IN ('queued', 'awaiting_configuration')")
      .bind(candidate.canonical_id).run();
    if (Number(reservedTerm.meta?.changes ?? 0) !== 1) return json({ error: "The selected candidate is already being processed." }, request, env, 409);
    if (existingJob?.status === "failed") {
      attempt = Number(existingJob.attempt) + 1;
      workflowId = `${workflowBase}-a${attempt}`;
      await db.prepare("UPDATE knowledge_jobs SET id = ?, attempt = ?, status = 'queued', updated_at = ?, finished_at = NULL, public_message = 'Retry queued for Knowledge generation.' WHERE idempotency_key = ?")
        .bind(workflowId, attempt, now, idempotencyKey).run();
    } else {
      const inserted = await db.prepare("INSERT OR IGNORE INTO knowledge_jobs (id, idempotency_key, paper_id, review_revision, attempt, status, created_at, updated_at, selected_concept_ids, public_message) VALUES (?, ?, ?, ?, ?, 'queued', ?, ?, ?, 'Queued for selective Technical Brief generation.')")
        .bind(workflowId, idempotencyKey, payload.paper.canonicalId, payload.revision, attempt, now, now, JSON.stringify([candidate.canonical_id])).run();
      if (Number(inserted.meta?.changes ?? 0) !== 1) {
        await db.prepare("UPDATE knowledge_term_index SET brief_status = 'queued' WHERE canonical_id = ? AND brief_status = 'processing'").bind(candidate.canonical_id).run();
        const duplicate = await db.prepare("SELECT id, idempotency_key, paper_id, status, attempt, created_at, updated_at, finished_at, selected_concept_ids, terms_seen, concepts_created, model_calls, estimated_input_tokens, estimated_output_tokens, actual_input_tokens, actual_output_tokens, cached_input_tokens, model_id, estimated_cost_usd, actual_cost_usd, public_message FROM knowledge_jobs WHERE idempotency_key = ?").bind(idempotencyKey).first();
        return json({ job: duplicate ? publicJob(duplicate) : null, deduplicated: true }, request, env);
      }
    }
    try {
      await env.KNOWLEDGE_WORKFLOW.create({ id: workflowId, params: payload });
      return json({ jobId: workflowId, idempotencyKey, termId: candidate.canonical_id, status: "queued", deduplicated: false }, request, env, 202);
    } catch (error) {
      await db.prepare("UPDATE knowledge_term_index SET brief_status = 'queued' WHERE canonical_id = ?").bind(candidate.canonical_id).run();
      await db.prepare("UPDATE knowledge_jobs SET status = 'failed', updated_at = ?, finished_at = ?, public_message = 'Cloud workflow could not start; retry is bounded by the configured limit.' WHERE idempotency_key = ?")
        .bind(new Date().toISOString(), new Date().toISOString(), idempotencyKey).run();
      console.error("[knowledge-api] generation workflow could not start", { termId: candidate.canonical_id, error: error instanceof Error ? error.message : "unknown" });
      return json({ error: "Knowledge generation Workflow could not start." }, request, env, 503);
    }
  }

  if (request.method === "POST" && url.pathname === "/knowledge/papers") {
    if (!env.KNOWLEDGE_INGEST_TOKEN) return json({ error: "Knowledge ingest authentication is not configured." }, request, env, 503);
    if (request.headers.get("Authorization") !== `Bearer ${env.KNOWLEDGE_INGEST_TOKEN}`) return json({ error: "Unauthorized." }, request, env, 401);
    if (!env.KNOWLEDGE_WORKFLOW) return json({ error: "Knowledge Workflow binding is not configured." }, request, env, 503);
    const length = Number(request.headers.get("Content-Length") ?? "0");
    if (length > 50000) return json({ error: "Payload is too large." }, request, env, 413);
    let rawBody: string;
    try { rawBody = await request.text(); } catch { return json({ error: "Invalid JSON request body." }, request, env, 400); }
    if (rawBody.length > 50000) return json({ error: "Payload is too large." }, request, env, 413);
    let body: unknown;
    try { body = JSON.parse(rawBody); } catch { return json({ error: "Invalid JSON request body." }, request, env, 400); }
    const parsedPayload = validatePaperEvent(body);
    if (!parsedPayload) return json({ error: "Invalid paper payload." }, request, env, 400);
    const payload: PaperEvent = { ...parsedPayload, generationOnly: false };
    await db.prepare("INSERT INTO knowledge_paper_events (paper_id, review_revision, event_json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(paper_id, review_revision) DO UPDATE SET event_json = excluded.event_json, updated_at = excluded.updated_at")
      .bind(payload.paper.canonicalId, payload.revision, JSON.stringify(payload), new Date().toISOString()).run();
    const idempotencyKey = `paper:${payload.paper.canonicalId}:review:${payload.revision}:knowledge:v1`;
    const workflowBase = `knowledge-${payload.paper.canonicalId.replace(/[^a-z0-9]+/gi, "-")}-${payload.revision.slice(0, 12)}`.toLowerCase();
    let workflowId = `${workflowBase}-a1`;
    const now = new Date().toISOString();
    const insert = await db.prepare("INSERT OR IGNORE INTO knowledge_jobs (id, idempotency_key, paper_id, review_revision, attempt, status, created_at, updated_at, selected_concept_ids, public_message) VALUES (?, ?, ?, ?, 1, 'queued', ?, ?, '[]', 'Queued for Knowledge processing.')")
      .bind(workflowId, idempotencyKey, payload.paper.canonicalId, payload.revision, now, now).run();
    if (Number(insert.meta?.changes ?? 0) === 0) {
      const current = await db.prepare("SELECT id, idempotency_key, paper_id, status, attempt, created_at, updated_at, finished_at, selected_concept_ids, terms_seen, concepts_created, model_calls, estimated_input_tokens, estimated_output_tokens, actual_input_tokens, actual_output_tokens, cached_input_tokens, model_id, estimated_cost_usd, actual_cost_usd, public_message FROM knowledge_jobs WHERE idempotency_key = ?")
        .bind(idempotencyKey).first<{ id: string; status: string; attempt: number } & D1Row>();
      if (current?.status === "failed") {
        const retryLimit = maxRetries(env);
        if (Number(current.attempt) > retryLimit) return json({ job: publicJob(current), deduplicated: true, retryLimitReached: true }, request, env, 200);
        const nextAttempt = Number(current.attempt) + 1;
        workflowId = `${workflowBase}-a${nextAttempt}`;
        const retry = await db.prepare("UPDATE knowledge_jobs SET id = ?, attempt = ?, status = 'queued', updated_at = ?, finished_at = NULL, public_message = 'Retry queued for Knowledge processing.' WHERE idempotency_key = ? AND status = 'failed' AND attempt = ?")
          .bind(workflowId, nextAttempt, now, idempotencyKey, current.attempt).run();
        if (Number(retry.meta?.changes ?? 0) === 0) {
          const row = await db.prepare("SELECT id, idempotency_key, paper_id, status, created_at, updated_at, finished_at, selected_concept_ids, terms_seen, concepts_created, model_calls, estimated_input_tokens, estimated_output_tokens, actual_input_tokens, actual_output_tokens, cached_input_tokens, model_id, estimated_cost_usd, actual_cost_usd, public_message FROM knowledge_jobs WHERE idempotency_key = ?").bind(idempotencyKey).first();
          return json({ job: row ? publicJob(row) : null, deduplicated: true }, request, env, 200);
        }
      } else {
        return json({ job: current ? publicJob(current) : null, deduplicated: true }, request, env, 200);
      }
    }
    try {
      await env.KNOWLEDGE_WORKFLOW.create({ id: workflowId, params: payload });
      return json({ jobId: workflowId, idempotencyKey, status: "queued", deduplicated: false }, request, env, 202);
    } catch (error) {
      console.error("[knowledge-api] workflow could not start", { paperId: payload.paper.canonicalId, error: error instanceof Error ? error.message : "unknown" });
      const message = "Cloud workflow could not start. Retry the published paper review.";
      await db.prepare("UPDATE knowledge_jobs SET status = 'failed', updated_at = ?, finished_at = ?, public_message = ? WHERE idempotency_key = ?")
        .bind(new Date().toISOString(), new Date().toISOString(), message, idempotencyKey).run();
      return json({ error: "Knowledge Workflow could not start.", jobId: workflowId }, request, env, 503);
    }
  }

  if (request.method === "GET" && url.pathname === "/knowledge/jobs") {
    const rows = await db.prepare("SELECT id, idempotency_key, paper_id, status, created_at, updated_at, finished_at, selected_concept_ids, terms_seen, concepts_created, model_calls, estimated_input_tokens, estimated_output_tokens, actual_input_tokens, actual_output_tokens, cached_input_tokens, model_id, estimated_cost_usd, actual_cost_usd, public_message FROM knowledge_jobs ORDER BY created_at DESC LIMIT 50").all();
    return json({ jobs: rows.results.map(publicJob) }, request, env);
  }

  if (request.method === "GET" && url.pathname === "/knowledge/terms") {
    const rows = await db.prepare("SELECT canonical_id, slug, canonical_name_en, canonical_name_ko, aliases_json, definition_en, definition_ko, first_seen_at, last_seen_at, paper_count, priority_score, brief_status, (SELECT group_concat(paper_id, '|') FROM paper_term_index WHERE term_id = knowledge_term_index.canonical_id) AS source_papers FROM knowledge_term_index ORDER BY priority_score DESC, paper_count DESC, canonical_name_en COLLATE NOCASE LIMIT 500").all();
    return json({ terms: rows.results.map((row) => ({
      id: row.canonical_id,
      slug: row.slug,
      canonicalName: { en: row.canonical_name_en, ko: row.canonical_name_ko },
      aliases: JSON.parse(String(row.aliases_json ?? "[]")),
      definition: { en: row.definition_en, ko: row.definition_ko },
      firstSeenAt: row.first_seen_at,
      lastSeenAt: row.last_seen_at,
      paperCount: Number(row.paper_count ?? 0),
      priorityScore: Number(row.priority_score ?? 0),
      briefStatus: row.brief_status,
      sourcePapers: String(row.source_papers ?? "").split("|").filter(Boolean),
      briefPath: row.brief_status === "published" ? `/knowledge/article/?slug=${encodeURIComponent(String(row.slug))}` : null,
    })) }, request, env);
  }

  if (request.method === "GET" && url.pathname === "/knowledge/ledger") {
    if (!env.KNOWLEDGE_INGEST_TOKEN) return json({ error: "Knowledge ledger authentication is not configured." }, request, env, 503);
    if (request.headers.get("Authorization") !== `Bearer ${env.KNOWLEDGE_INGEST_TOKEN}`) return json({ error: "Unauthorized." }, request, env, 401);
    const rows = await db.prepare("SELECT id, job_id, workflow_type, model_id, estimated_input_tokens, estimated_output_tokens, actual_input_tokens, actual_output_tokens, cached_input_tokens, reserved_cost_usd, estimated_cost_usd, actual_cost_usd, status, retry_count, created_at, completed_at FROM knowledge_token_ledger ORDER BY created_at DESC LIMIT 200").all();
    return json({ entries: rows.results }, request, env);
  }

  if (request.method === "GET" && url.pathname === "/knowledge/concepts") {
    const rows = await db.prepare("SELECT article_json FROM knowledge_concepts WHERE status = 'published' ORDER BY updated_at DESC LIMIT 200").all<{ article_json: string }>();
    return json({ concepts: rows.results.map((row) => publicConcept(row)) }, request, env);
  }

  const conceptMatch = url.pathname.match(/^\/knowledge\/concepts\/([a-z0-9-]+)\/?$/);
  if (request.method === "GET" && conceptMatch) {
    const row = await db.prepare("SELECT article_json FROM knowledge_concepts WHERE slug = ? AND status = 'published' LIMIT 1").bind(conceptMatch[1]).first<{ article_json: string }>();
    return row ? json(publicConcept(row), request, env) : json({ error: "Concept not found." }, request, env, 404);
  }
  if (request.method !== "GET" && request.method !== "POST") return json({ error: "Method not allowed." }, request, env, 405);
  return json({ error: "Not found." }, request, env, 404);
}
