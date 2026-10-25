import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseReviewMetadata } from "../paper-reviews/history.mjs";

const preferredConcepts = new Map([["alpha-compositing", 100]]);

function normalizeTerm(value) {
  return String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase().replace(/[^a-z0-9\p{Script=Hangul}]+/gu, "-").replace(/^-|-$/g, "");
}

function conceptSlugForTerm(value) {
  const normalized = normalizeTerm(value);
  if (["alpha-compositing", "alpha-blending", "alpha-합성", "알파-합성"].includes(normalized)) return "alpha-compositing";
  return normalized || null;
}

function terminologyRows(markdown, locale) {
  const block = markdown.split(`<!-- locale: ${locale} -->`)[1];
  if (!block) throw new Error(`Paper review has no ${locale} section.`);
  const title = locale === "ko" ? "용어 정리" : "Terminology";
  const section = block.split(new RegExp(`^##\\s+${title}\\s*$`, "m"))[1]?.split(/^##\s+/m)[0];
  if (!section) throw new Error(`Paper review has no ${title} section.`);
  const rows = section.split(/\r?\n/).filter((line) => line.trim().startsWith("|") && !/^\s*\|?\s*:?-{3,}/.test(line));
  return rows.slice(1).map((line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim())).filter((cells) => cells.length >= 3).map(([term, definition, context]) => ({ term, definition, context }));
}

function parseTerminologyRows(markdown) {
  const en = terminologyRows(markdown, "en");
  const ko = terminologyRows(markdown, "ko");
  if (en.length !== ko.length) throw new Error("Paper review has mismatched English and Korean terminology tables.");
  return en.map((row, index) => ({
    name: row.term,
    nameKo: ko[index].term,
    definition: { en: row.definition, ko: ko[index].definition },
    context: { en: row.context, ko: ko[index].context },
    slug: conceptSlugForTerm(row.term),
    aliases: [...new Set([row.term, ko[index].term])],
    priority: Math.max(1, 100 - index * 2),
  }));
}

function readJson(root, file) {
  return JSON.parse(readFileSync(path.join(root, file), "utf8"));
}

function writeJson(root, file, value) {
  writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function validateCuratedConcept(article, term, paperId, root) {
  if (!article || article.id !== `concept:${term.slug}` || article.slug !== term.slug) throw new Error(`Curated concept does not match terminology term: ${term.name}.`);
  if (!article.sections?.some((section) => section.id === "visualization") || article.sections.length < 7) throw new Error(`${article.slug} needs all seven brief sections and a visualization section.`);
  if (!article.sources?.length || article.sources.some((source) => !/^https:\/\//.test(source.url))) throw new Error(`${article.slug} needs HTTPS source references.`);
  if (!article.sourcePapers?.includes(paperId)) throw new Error(`${article.slug} is missing its source paper relationship.`);
  const asset = path.join(root, "public", article.visualAsset.path.replace(/^\//, ""));
  try { readFileSync(asset); } catch { throw new Error(`Missing concept visualization asset: ${article.visualAsset.path}.`); }
}

export function processPaper({ root = process.cwd(), paperId = "arxiv:2610.24738", allowDraft = false, maxNewConcepts = 1 } = {}) {
  if (!Number.isInteger(maxNewConcepts) || maxNewConcepts < 1 || maxNewConcepts > 5) throw new Error("maxNewConcepts must be between 1 and 5.");
  const normalizedPaperId = String(paperId).replace(/^arxiv:/i, "").replace(/v\d+$/i, "");
  const reviewPath = path.join(root, "content/paper-reviews/layereditor.md");
  const markdown = readFileSync(reviewPath, "utf8");
  const metadata = parseReviewMetadata(markdown);
  const canonicalId = `arxiv:${normalizedPaperId}`;
  if (metadata.canonicalId !== canonicalId) throw new Error(`Paper ID mismatch: expected ${canonicalId}, got ${metadata.canonicalId}.`);
  if (metadata.reviewStatus !== "published" && !allowDraft) throw new Error("Draft reviews require --allow-draft for local validation and are never sent by the production dispatcher.");

  const rawTerminology = parseTerminologyRows(markdown).filter((term) => term.slug);
  if (!rawTerminology.length) throw new Error("No eligible terminology was found in the paper review.");
  const registry = readJson(root, "content/knowledge/registry.json");
  const jobs = readJson(root, "content/knowledge/jobs.json");
  registry.termsIndex ??= [];
  registry.paperTerms ??= [];
  registry.generationQueue ??= [];
  const terminology = rawTerminology.map((term) => {
    const names = new Set([term.name, term.nameKo, ...term.aliases].map(normalizeTerm));
    const known = [...registry.termsIndex, ...registry.concepts].find((item) =>
      [item.canonicalName?.en, item.canonicalName?.ko, ...(item.aliases ?? [])].some((alias) => alias && names.has(normalizeTerm(alias))),
    );
    return { ...term, id: known?.id ?? `concept:${term.slug}`, slug: known?.slug ?? term.slug };
  });
  const idempotencyKey = `paper:${canonicalId}:knowledge:v1`;
  const existingJob = jobs.jobs.find((job) => job.idempotencyKey === idempotencyKey);

  const curatedCandidates = terminology
    .filter((term) => existsSync(path.join(root, "content/knowledge", `${term.slug}.json`)))
    .sort((a, b) => (preferredConcepts.get(b.slug) ?? 0) - (preferredConcepts.get(a.slug) ?? 0))
    .slice(0, maxNewConcepts);
  const selectedConceptIds = [];
  let created = 0;
  let linked = 0;
  const now = new Date().toISOString();

  for (const term of curatedCandidates) {
    const conceptId = term.id;
    let entry = registry.concepts.find((concept) => concept.id === conceptId);
    if (!entry) {
      const article = readJson(root, `content/knowledge/${term.slug}.json`);
      validateCuratedConcept(article, term, canonicalId, root);
      entry = {
        id: article.id,
        slug: article.slug,
        canonicalName: article.canonicalName,
        dek: article.dek,
        aliases: [...new Set([...term.aliases, ...(article.aliases ?? [])])],
        domain: article.domain,
        status: "published",
        version: article.version,
        sourcePapers: [...new Set(article.sourcePapers)],
        relatedConcepts: [],
        briefPath: `/knowledge/article/?slug=${article.slug}`,
        onePager: { status: "ready", pdfPath: `/knowledge/${article.slug}-one-pager.pdf`, docxPath: `/knowledge/${article.slug}-one-pager.docx` },
        lastUpdated: article.lastUpdated,
        contentSource: "curated-test",
      };
      registry.concepts.push(entry);
      created += 1;
    } else {
      entry.dek ??= readJson(root, `content/knowledge/${term.slug}.json`).dek;
      if (!entry.sourcePapers.includes(canonicalId)) {
        entry.sourcePapers.push(canonicalId);
        linked += 1;
      }
    }
    selectedConceptIds.push(conceptId);
    if (!registry.paperConcepts.some((edge) => edge.paperId === canonicalId && edge.conceptId === conceptId)) {
      registry.paperConcepts.push({ paperId: canonicalId, conceptId, relation: "USES", evidence: term.context.ko });
      linked += 1;
    }
  }

  for (const term of terminology) {
    const id = term.id;
    const existingTerm = registry.termsIndex.find((item) => item.id === id);
    const paperLink = registry.paperTerms.find((item) => item.paperId === canonicalId && item.termId === id);
    const score = term.priority + (metadata.title.en.toLocaleLowerCase().includes(term.name.toLocaleLowerCase()) ? 20 : 0) +
      Math.min(10, ((existingTerm?.sourcePapers?.length ?? 0) + (paperLink ? 0 : 1)) * 2);
    const concept = registry.concepts.find((item) => item.id === id && item.status === "published");
    const termRecord = {
      id,
      slug: term.slug,
      canonicalName: { en: term.name, ko: term.nameKo },
      aliases: [...new Set([...(existingTerm?.aliases ?? []), ...term.aliases])],
      definition: term.definition,
      priorityScore: Math.max(score, existingTerm?.priorityScore ?? 0),
      sourcePapers: [...new Set([...(existingTerm?.sourcePapers ?? []), canonicalId])],
      firstSeenAt: existingTerm?.firstSeenAt ?? now,
      lastSeenAt: now,
      briefStatus: concept ? "published" : "awaiting_configuration",
    };
    const priorTermIndex = registry.termsIndex.findIndex((item) => item.id === id);
    if (priorTermIndex < 0) registry.termsIndex.push(termRecord);
    else registry.termsIndex[priorTermIndex] = termRecord;
    const edge = {
      paperId: canonicalId,
      termId: id,
      definition: term.definition,
      context: term.context,
      priorityScore: score,
      sourceUrls: [`https://arxiv.org/abs/${normalizedPaperId}`],
      createdAt: paperLink?.createdAt ?? now,
    };
    if (!paperLink) registry.paperTerms.push(edge);
    else Object.assign(paperLink, edge);

    const queued = registry.generationQueue.find((item) => item.conceptId === id);
    if (concept) {
      if (queued) queued.status = "published";
      if (!concept.sourcePapers.includes(canonicalId)) concept.sourcePapers.push(canonicalId);
    } else if (queued) {
      queued.priorityScore = Math.max(queued.priorityScore ?? 0, score);
      queued.sourcePapers = [...new Set([...(queued.sourcePapers ?? []), canonicalId])];
      queued.updatedAt = now;
      queued.status = "awaiting_configuration";
    } else {
      registry.generationQueue.push({ conceptId: id, priorityScore: score, sourcePapers: [canonicalId], status: "awaiting_configuration", createdAt: now, updatedAt: now });
    }
  }

  if (existingJob) {
    existingJob.termsSeen = terminology.length;
    existingJob.modelCalls = 0;
    existingJob.estimatedTokens = 0;
    existingJob.message = `Indexed ${terminology.length} terminology records deterministically. ${registry.generationQueue.filter((item) => item.status === "awaiting_configuration").length} Brief candidate(s) await explicit AI configuration. Curated test content was reused; no model call or cloud job was run.`;
    writeJson(root, "content/knowledge/registry.json", registry);
    writeJson(root, "content/knowledge/jobs.json", jobs);
    return { created: 0, linked, idempotent: true, conceptIds: existingJob.selectedConceptIds, indexed: terminology.length, queued: registry.generationQueue.filter((item) => item.status === "awaiting_configuration").length };
  }

  const job = {
    id: `local-${normalizedPaperId.replaceAll(".", "-")}-knowledge-v1`,
    idempotencyKey,
    paperId: canonicalId,
    status: "published",
    environment: "local-validation",
    selectedConceptIds,
    termsSeen: terminology.length,
    newConcepts: created,
    modelCalls: 0,
    estimatedTokens: 0,
    startedAt: now,
    finishedAt: now,
    message: `Indexed ${terminology.length} terminology records deterministically. ${registry.generationQueue.filter((item) => item.status === "awaiting_configuration").length} Brief candidate(s) await explicit AI configuration. Curated test content was reused; no model call or cloud job was run.`,
  };
  jobs.jobs.push(job);
  writeJson(root, "content/knowledge/registry.json", registry);
  writeJson(root, "content/knowledge/jobs.json", jobs);
  return { created, linked, idempotent: false, conceptIds: selectedConceptIds, indexed: terminology.length, queued: registry.generationQueue.filter((item) => item.status === "awaiting_configuration").length, jobId: job.id };
}

function option(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((argument) => argument.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = processPaper({
      paperId: option("paper-id", "arxiv:2610.24738"),
      allowDraft: process.argv.includes("--allow-draft"),
      maxNewConcepts: Number(option("max-new", "1")),
    });
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
