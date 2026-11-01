import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { LinkedConcept, ResearchReview } from "./types";

const directory = path.join(process.cwd(), "content/research/reviews");

export const getResearchReviews = cache((): ResearchReview[] =>
  readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(path.join(directory, file), "utf8")) as ResearchReview)
    .filter((review) => review.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date)),
);

export function getResearchReview(slug: string) {
  return getResearchReviews().find((review) => review.slug === slug);
}

export function getResearchConcepts(): LinkedConcept[] {
  const byId = new Map<string, LinkedConcept>();
  for (const review of getResearchReviews()) {
    for (const concept of review.concepts) {
      if (!byId.has(concept.id)) byId.set(concept.id, { ...concept, paperSlug: review.slug, paperTitle: review.paper.title });
    }
  }
  return [...byId.values()].sort((a, b) => a.name.en.localeCompare(b.name.en));
}
