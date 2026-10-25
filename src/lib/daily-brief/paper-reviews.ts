import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { assertNoDuplicatePaperIds, parseReviewMetadata, readPaperHistory } from "../../../scripts/paper-reviews/history.mjs";
import type { LocalizedText } from "./highlights";

export type PaperReview = {
  slug: string;
  canonicalId: string;
  version: string;
  reviewStatus: "draft" | "published";
  sourceType: "huggingface-daily" | "foundational-seed";
  publishedDate: string;
  dailyDate: string | null;
  dailyRank: number | null;
  upvotesAtSelection: number | null;
  authors: string;
  title: LocalizedText;
  dek: LocalizedText;
  hero: {
    url: string;
    alt: LocalizedText;
    caption: LocalizedText;
    license: string;
  };
  body: LocalizedText;
};

export type PaperReviewSummary = Pick<PaperReview,
  "slug" | "canonicalId" | "reviewStatus" | "sourceType" | "publishedDate" | "dailyDate" | "dailyRank" | "upvotesAtSelection" | "title" | "dek" | "hero"
>;

const directory = path.join(process.cwd(), "content/paper-reviews");
const englishMarker = "<!-- locale: en -->";
const koreanMarker = "<!-- locale: ko -->";

function parseReview(markdown: string, file: string): PaperReview {
  const metadata = parseReviewMetadata(markdown) as Omit<PaperReview, "body">;
  const start = markdown.indexOf("---", 3);
  const body = markdown.slice(start + 3).trim();
  const localeParts = body.split(koreanMarker);
  if (localeParts.length !== 2 || !localeParts[0].includes(englishMarker)) {
    throw new Error(`${file} must contain English and Korean locale sections.`);
  }
  const english = localeParts[0].slice(localeParts[0].indexOf(englishMarker) + englishMarker.length).trim();
  const korean = localeParts[1].trim();
  if (!english || !korean) throw new Error(`${file} has an empty language section.`);
  if (!metadata.title?.en || !metadata.title?.ko || !metadata.dek?.en || !metadata.dek?.ko) {
    throw new Error(`${file} is missing bilingual title or dek metadata.`);
  }
  if (metadata.reviewStatus !== "draft" && metadata.reviewStatus !== "published") {
    throw new Error(`${file} reviewStatus must be draft or published.`);
  }
  const sourceType = metadata.sourceType ?? "huggingface-daily";
  if (sourceType !== "huggingface-daily" && sourceType !== "foundational-seed") {
    throw new Error(`${file} sourceType must be huggingface-daily or foundational-seed.`);
  }
  if (sourceType === "huggingface-daily" && (typeof metadata.dailyRank !== "number" || !Number.isInteger(metadata.dailyRank) || metadata.dailyRank < 1 || typeof metadata.dailyDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.dailyDate))) {
    throw new Error(`${file} needs a dated Hugging Face rank.`);
  }
  if (sourceType === "foundational-seed" && (metadata.dailyRank !== null || metadata.dailyDate !== null || metadata.upvotesAtSelection !== null)) {
    throw new Error(`${file} must not claim Hugging Face ranking for a foundational seed paper.`);
  }
  if (!metadata.hero?.url || !metadata.hero?.license || !metadata.hero?.alt?.en || !metadata.hero?.alt?.ko) {
    throw new Error(`${file} needs a licensed hero image with bilingual alt text.`);
  }
  if (!/^[a-z0-9-]+$/.test(metadata.slug) || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.publishedDate)) {
    throw new Error(`${file} has an invalid slug or publishedDate.`);
  }
  return { ...metadata, sourceType, body: { en: english, ko: korean } };
}

export const getPaperReviews = cache((): PaperReview[] => {
  assertNoDuplicatePaperIds(readPaperHistory());
  return readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => parseReview(readFileSync(path.join(directory, file), "utf8"), file))
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
});

export function getPaperReview(slug: string) {
  return getPaperReviews().find((review) => review.slug === slug);
}

export function getPaperReviewSummaries(): PaperReviewSummary[] {
  return getPaperReviews().map((review) => {
    const summary = { ...review };
    Reflect.deleteProperty(summary, "body");
    return summary;
  });
}
