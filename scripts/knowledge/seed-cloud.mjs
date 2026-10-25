import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseReviewMetadata } from "../paper-reviews/history.mjs";

const root = process.cwd();
const apiUrl = process.env.KNOWLEDGE_API_URL?.trim().replace(/\/$/, "");
const token = process.env.KNOWLEDGE_INGEST_TOKEN;

function readJson(file) {
  return JSON.parse(readFileSync(path.join(root, file), "utf8"));
}

function sourceRecord(reference) {
  const source = String(reference);
  const start = source.lastIndexOf("https://");
  const url = start >= 0 ? source.slice(start).trim() : "";
  if (!url) throw new Error(`Knowledge source is missing an HTTPS URL: ${source.slice(0, 100)}`);
  const label = source.slice(0, start).replace(/[,:\s]+$/, "") || new URL(url).hostname;
  const publisher = new URL(url).hostname.replace(/^www\./, "");
  return { label: { en: label, ko: label }, url, publisher, type: url.includes("arxiv.org") ? "research-paper" : "reference" };
}

async function main() {
  if (!apiUrl || !token) throw new Error("Set KNOWLEDGE_API_URL and KNOWLEDGE_INGEST_TOKEN before seeding the cloud registry.");
  const registry = readJson("content/knowledge/registry.json");
  const reviewDirectory = path.join(root, "content/paper-reviews");
  const reviews = new Map();
  for (const file of readdirSync(reviewDirectory).filter((name) => name.endsWith(".md"))) {
    const markdown = readFileSync(path.join(reviewDirectory, file), "utf8");
    const metadata = parseReviewMetadata(markdown);
    reviews.set(metadata.canonicalId, metadata);
  }
  const concepts = registry.concepts.filter((concept) => concept.status === "published").map((summary) => {
    const article = readJson(`content/knowledge/${summary.slug}.json`);
    const sourcePaperReviews = summary.sourcePapers.map((id) => {
      const metadata = reviews.get(id);
      if (!metadata) return null;
      return { id, title: metadata.title, reviewUrl: `/daily-brief/papers/${metadata.slug}/`, url: `https://arxiv.org/abs/${id.replace(/^arxiv:/i, "")}` };
    }).filter(Boolean);
    return {
      ...article,
      aliases: summary.aliases,
      status: "published",
      sourcePaperReviews,
      generatedAt: `${article.lastUpdated}T00:00:00.000Z`,
      visualAsset: {
        ...article.visualAsset,
        url: article.visualAsset.url ?? new URL(article.visualAsset.path, "https://minonminho.github.io").toString(),
      },
      sources: article.sources.map(sourceRecord),
    };
  });
  const response = await fetch(`${apiUrl}/knowledge/seed`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ concepts, paperConcepts: registry.paperConcepts }),
  });
  if (!response.ok) throw new Error(`Cloud registry seed failed (HTTP ${response.status}).`);
  const result = await response.json();
  console.log(`Cloud registry seeded: ${result.seeded} new concept(s), ${result.linked} paper relationship(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Cloud registry seed failed.");
  process.exitCode = 1;
});
