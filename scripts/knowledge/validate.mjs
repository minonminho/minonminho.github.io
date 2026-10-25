import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { assertNoDuplicatePaperIds, normalizePaperId, readPaperHistory } from "../paper-reviews/history.mjs";

const root = process.cwd();
const registry = JSON.parse(readFileSync(path.join(root, "content/knowledge/registry.json"), "utf8"));
const jobs = JSON.parse(readFileSync(path.join(root, "content/knowledge/jobs.json"), "utf8"));
const papers = readPaperHistory(root);
assertNoDuplicatePaperIds(papers);

const ids = new Set();
const slugs = new Set();
for (const concept of registry.concepts) {
  if (ids.has(concept.id) || slugs.has(concept.slug)) throw new Error(`Duplicate concept identity: ${concept.id}.`);
  if (!concept.dek?.en || !concept.dek?.ko) throw new Error(`Knowledge summary ${concept.slug} is missing bilingual description text.`);
  ids.add(concept.id);
  slugs.add(concept.slug);
  const articlePath = path.join(root, "content/knowledge", `${concept.slug}.json`);
  if (!existsSync(articlePath)) throw new Error(`Missing concept article ${concept.slug}.json.`);
  const article = JSON.parse(readFileSync(articlePath, "utf8"));
  if (article.id !== concept.id || article.slug !== concept.slug) throw new Error(`Registry/article identity mismatch for ${concept.slug}.`);
  if (!article.sections || article.sections.length < 7 || !article.sections.some((section) => section.id === "visualization")) throw new Error(`${concept.slug} is missing required brief sections or visualization.`);
  if (!article.visualAsset?.alt?.ko || !article.visualAsset?.caption?.ko || !article.visualAsset?.credit) throw new Error(`${concept.slug} is missing visualization accessibility or attribution.`);
  if (article.sources.length < 2 || article.sources.some((source) => !/^https:\/\//.test(source.url))) throw new Error(`${concept.slug} needs valid HTTPS source references.`);
  for (const sourcePaper of concept.sourcePapers) {
    if (!papers.some((paper) => normalizePaperId(paper.paperId) === normalizePaperId(sourcePaper))) throw new Error(`${concept.slug} references an untracked paper: ${sourcePaper}.`);
  }
  const image = path.join(root, "public", article.visualAsset.path.replace(/^\//, ""));
  if (!existsSync(image)) throw new Error(`Missing visual asset ${article.visualAsset.path}.`);
  if (!article.onePager || article.onePager.sections.length < 5) throw new Error(`${concept.slug} is missing its separate One-Pager content.`);
  for (const [format, documentPath, signature] of [
    ["PDF", concept.onePager.pdfPath, "%PDF-"],
    ["DOCX", concept.onePager.docxPath, "PK"],
  ]) {
    if (!documentPath || !documentPath.startsWith("/knowledge/")) throw new Error(`${concept.slug} has no published ${format} One-Pager path.`);
    const file = path.join(root, "public", documentPath.replace(/^\//, ""));
    if (!existsSync(file) || !readFileSync(file).subarray(0, signature.length).equals(Buffer.from(signature))) throw new Error(`${concept.slug} has an invalid or missing ${format} One-Pager.`);
  }
}

const jobKeys = new Set();
for (const job of jobs.jobs) {
  if (jobKeys.has(job.idempotencyKey)) throw new Error(`Duplicate Knowledge job key: ${job.idempotencyKey}.`);
  jobKeys.add(job.idempotencyKey);
  if (!Array.isArray(job.selectedConceptIds)) throw new Error(`Invalid concept links in Knowledge job ${job.id}.`);
}

for (const edge of registry.paperConcepts ?? []) {
  if (!ids.has(edge.conceptId) || !papers.some((paper) => normalizePaperId(paper.paperId) === normalizePaperId(edge.paperId))) throw new Error(`Invalid paper-to-concept edge: ${edge.paperId} → ${edge.conceptId}.`);
  if (!edge.evidence || !edge.relation) throw new Error(`Paper-to-concept edge has no evidence or relation: ${edge.conceptId}.`);
}

console.log(`Knowledge registry valid: ${registry.concepts.length} concept(s), ${jobs.jobs.length} job(s), ${registry.paperConcepts?.length ?? 0} paper link(s).`);
