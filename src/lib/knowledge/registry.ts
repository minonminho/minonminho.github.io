import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { KnowledgeConcept, KnowledgeConceptSummary, KnowledgeJob, KnowledgeTermIndexRecord } from "./types";

type Registry = { schemaVersion: number; concepts: KnowledgeConceptSummary[]; termsIndex?: KnowledgeTermIndexRecord[] };
type Jobs = { jobs: KnowledgeJob[] };

const contentRoot = path.join(process.cwd(), "content/knowledge");

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(contentRoot, file), "utf8")) as T;
}

export function getKnowledgeConceptSummaries(): KnowledgeConceptSummary[] {
  const registry = readJson<Registry>("registry.json");
  return registry.concepts
    .filter((concept) => concept.status === "published")
    .sort((a, b) => a.canonicalName.en.localeCompare(b.canonicalName.en));
}

export function getKnowledgeTermIndex(): KnowledgeTermIndexRecord[] {
  const registry = readJson<Registry>("registry.json");
  return (registry.termsIndex ?? []).filter((term) => term.briefStatus !== "published")
    .sort((a, b) => b.priorityScore - a.priorityScore || a.canonicalName.en.localeCompare(b.canonicalName.en));
}

export function getKnowledgeConcept(slug: string): KnowledgeConcept | undefined {
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
  const registry = getKnowledgeConceptSummaries();
  if (!registry.some((concept) => concept.slug === slug)) return undefined;
  return readJson<KnowledgeConcept>(`${slug}.json`);
}

export function getKnowledgeJobs(): KnowledgeJob[] {
  return readJson<Jobs>("jobs.json").jobs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function getKnowledgeLinksForPaper(paperId: string) {
  return getKnowledgeConceptSummaries()
    .filter((concept) => concept.sourcePapers.includes(paperId))
    .map((concept) => ({
      id: concept.id,
      slug: concept.slug,
      title: concept.canonicalName,
      aliases: [...concept.aliases],
      href: `/knowledge/article/?slug=${encodeURIComponent(concept.slug)}`,
    }));
}
