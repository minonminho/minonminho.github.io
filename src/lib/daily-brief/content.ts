import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Brief, BriefSummary } from "./types";
import { readingMinutes } from "./types";
import { validateBrief } from "../../../scripts/daily-brief/schema.mjs";

const directory = path.join(process.cwd(), "content/daily-brief");

export const getBriefs = cache((): Brief[] =>
  readdirSync(directory)
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .map((file) => {
      const data = JSON.parse(readFileSync(path.join(directory, file), "utf8"));
      validateBrief(data, file.slice(0, -5));
      return data as Brief;
    })
    .sort((a, b) => b.date.localeCompare(a.date)),
);

export function getBrief(date: string) {
  return getBriefs().find((brief) => brief.date === date);
}

export function getBriefSummaries(): BriefSummary[] {
  return getBriefs().map((brief) => ({
    date: brief.date, title: brief.title, dek: brief.dek,
    topics: brief.topics, readingMinutes: readingMinutes(brief),
  }));
}
