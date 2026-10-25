import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { execFileSync } from "node:child_process";
import type { Brief, BriefSummary } from "./types";
import { readingMinutes } from "./types";
import { validateBrief } from "../../../scripts/daily-brief/schema.mjs";

const directory = path.join(process.cwd(), "content/daily-brief");
const fileUpdateCache = new Map<string, string>();

function getUpdatedAt(file: string, publishedDate: string): string {
  const existing = fileUpdateCache.get(file);
  if (existing) return existing;
  let updatedAt = publishedDate;
  try {
    const gitDate = execFileSync("git", ["log", "-1", "--format=%cI", "--", `content/daily-brief/${file}`], {
      cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (gitDate && Number.isFinite(Date.parse(gitDate))) {
      const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
      }).format(new Date(gitDate));
      if (date > publishedDate) updatedAt = date;
    }
  } catch {
    // Source archives without Git metadata fall back to the known publication date.
  }
  fileUpdateCache.set(file, updatedAt);
  return updatedAt;
}

export const getBriefs = cache((): Brief[] =>
  readdirSync(directory)
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .map((file) => {
      const data = JSON.parse(readFileSync(path.join(directory, file), "utf8"));
      validateBrief(data, file.slice(0, -5));
      return { ...data, updatedAt: getUpdatedAt(file, data.date) } as Brief;
    })
    .sort((a, b) => b.date.localeCompare(a.date)),
);

export function getBrief(date: string) {
  return getBriefs().find((brief) => brief.date === date);
}

export function getBriefSummaries(): BriefSummary[] {
  return getBriefs().map((brief) => ({
    date: brief.date, updatedAt: brief.updatedAt, title: brief.title, dek: brief.dek,
    topics: brief.topics, readingMinutes: readingMinutes(brief),
  }));
}
