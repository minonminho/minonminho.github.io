// Shared by the build, content validator, and publishing tests. No API key needed.
const string = { type: "string", minLength: 1 };
const date = { ...string, pattern: "^\\d{4}-\\d{2}-\\d{2}$" };
const nullableDate = { anyOf: [date, { type: "null" }] };
const array = (items, minItems = 0, maxItems = 30) => ({ type: "array", items, minItems, maxItems });
const object = (properties) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });

export const primaryDomains = ["openai.com", "developers.openai.com", "help.openai.com", "anthropic.com", "platform.claude.com", "support.claude.com", "deepmind.google", "blog.google", "research.google", "ai.google.dev", "cloud.google.com", "microsoft.com", "learn.microsoft.com", "nvidia.com", "research.nvidia.com", "ai.meta.com", "about.fb.com", "huggingface.co", "arxiv.org", "github.com", "docs.github.com", "developers.googleblog.com", "developers.google.com", "pytorch.org", "vllm.ai", "sglang.ai", "lmsys.org", "mistral.ai", "qwen.ai", "aws.amazon.com", "artificialanalysis.ai", "mlcommons.org"];

export const briefSchema = object({
  schemaVersion: { type: "integer", enum: [1] },
  date,
  publishedAt: string,
  title: string,
  dek: string,
  focus: string,
  visual: { type: "string", enum: ["verification", "workflow", "systems", "models"] },
  topics: array({ type: "string", enum: ["Models & tools", "Workflows", "Systems & inference", "Research"] }, 1, 4),
  editorialNote: string,
  sections: array(object({
    id: { type: "string", enum: ["signals", "tools", "practice", "engineering"] },
    label: string,
    items: array(object({
      title: string, publishedDate: nullableDate,
      status: { type: "string", enum: ["research", "available", "preview", "announced", "case-study"] },
      summary: string, change: string, availability: string, limitation: string, implication: string,
      sourceIds: array(string, 1, 3),
    }), 0, 3),
  }), 4, 4),
  experiment: object({ title: string, minutes: { type: "integer", minimum: 10, maximum: 20 }, steps: array(string, 3, 5), measure: string }),
  glossary: array(object({ id: { type: "integer", minimum: 1, maximum: 20 }, term: string, ko: string, explanation: string, example: string }), 3, 12),
  sources: array(object({ id: { ...string, pattern: "^[a-z0-9-]+$" }, title: string, publisher: string, url: string, publishedDate: nullableDate }), 0, 12),
});

function validate(value, schema, location = "brief") {
  if (schema.anyOf) {
    if (!schema.anyOf.some((option) => { try { validate(value, option, location); return true; } catch { return false; } })) throw new Error(`${location}: invalid nullable value`);
    return;
  }
  const actual = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  if (schema.type === "integer" ? !Number.isInteger(value) : actual !== schema.type) throw new Error(`${location}: expected ${schema.type}`);
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`${location}: invalid enum`);
  if (schema.type === "string") {
    if (!value.trim() || value.length > 6000 || (schema.pattern && !new RegExp(schema.pattern).test(value))) throw new Error(`${location}: invalid string`);
  } else if (schema.type === "object") {
    if (Object.keys(value).some((key) => !Object.hasOwn(schema.properties, key))) throw new Error(`${location}: unexpected field`);
    for (const key of schema.required) validate(value[key], schema.properties[key], `${location}.${key}`);
  } else if (schema.type === "array") {
    if (value.length < schema.minItems || value.length > schema.maxItems) throw new Error(`${location}: invalid length`);
    value.forEach((entry, i) => validate(entry, schema.items, `${location}[${i}]`));
  } else if (schema.type === "integer" && (value < schema.minimum || value > schema.maximum)) throw new Error(`${location}: out of range`);
}

export function isPrimaryUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && primaryDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch { return false; }
}

export function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) if (key.startsWith("utm_") || key === "trk") url.searchParams.delete(key);
  return url.toString().replace(/\/$/, "");
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function validateBrief(brief, expectedDate = brief?.date) {
  validate(brief, briefSchema);
  if (!validDate(brief.date) || brief.date !== expectedDate) throw new Error("Issue date must match its filename and requested date");
  if (!Number.isFinite(Date.parse(brief.publishedAt)) || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(brief.publishedAt)) !== brief.date) throw new Error("publishedAt must be a timestamp on the issue's Korean date");
  if (brief.sections.map((section) => section.id).join(",") !== "signals,tools,practice,engineering") throw new Error("Expected the four sections in editorial order");
  if (brief.sections.slice(1).some((section) => section.items.length > 1)) throw new Error("Only the signals section may contain more than one story");
  const dates = [...brief.sources.map((source) => source.publishedDate), ...brief.sections.flatMap((section) => section.items.map((item) => item.publishedDate))].filter(Boolean);
  if (dates.some((value) => !validDate(value) || value > brief.date)) throw new Error("Invalid or future-dated source/story");
  const sourceIds = new Set(brief.sources.map((source) => source.id));
  const sourceUrls = new Set(brief.sources.map((source) => normalizeUrl(source.url)));
  if (sourceIds.size !== brief.sources.length || sourceUrls.size !== brief.sources.length) throw new Error("Duplicate sources");
  if (brief.sources.some((source) => !isPrimaryUrl(source.url))) throw new Error("Only HTTPS primary-source URLs are allowed");
  const items = brief.sections.flatMap((section) => section.items);
  if (items.some((item) => item.sourceIds.some((id) => !sourceIds.has(id)))) throw new Error("Unresolved source reference");
  if (brief.sources.some((source) => !items.some((item) => item.sourceIds.includes(source.id)))) throw new Error("Unused source");
  const notes = new Set(brief.glossary.map((note) => note.id));
  if (notes.size !== brief.glossary.length || brief.glossary.some((note, i) => note.id !== i + 1)) throw new Error("Vocabulary numbering must be consecutive");
  if (brief.glossary.some((note) => !/[가-힣]/.test(note.ko + note.explanation + note.example))) throw new Error("Vocabulary notes must contain Korean");
  const prose = JSON.stringify([brief.focus, ...items.map(({ title, summary, change, availability, limitation, implication }) => [title, summary, change, availability, limitation, implication]), brief.experiment]);
  // Only these rendered fields may contain note markers (titles are plain text).
  if (items.some((item) => /\[\d+\]/.test(item.title)) || /\[\d+\]/.test(brief.experiment.title)) throw new Error("Put note markers in body text, not titles");
  const refs = [...prose.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));
  if (refs.some((id) => !notes.has(id)) || [...notes].some((id) => !refs.includes(id))) throw new Error("Unresolved or unused vocabulary reference");
  return brief;
}
