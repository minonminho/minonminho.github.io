import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";

export type Highlight = {
  date: string;
  paperId: string;
  paperDate: string;
  dailyDate: string;
  dailyRank: number;
  upvotesAtSelection: number;
  title: LocalizedText;
  dek: LocalizedText;
  selectionReason: LocalizedText;
  summary: LocalizedText;
  summaryAttribution: LocalizedText;
  figure: {
    url: string;
    width: number;
    height: number;
    alt: LocalizedText;
    caption: LocalizedText;
  };
  sections: { id: string; heading: LocalizedText; paragraphs: LocalizedText[] }[];
  takeaway: LocalizedText;
  terminology: { term: string; koTerm: string; description: LocalizedText; example: LocalizedText }[];
  sources: { label: LocalizedText; url: string; publisher: string }[];
};

export type LocalizedText = { en: string; ko: string };

export type HighlightSummary = Pick<Highlight, "date" | "paperId" | "dailyDate" | "title" | "dek" | "figure" | "dailyRank" | "upvotesAtSelection">;

const directory = path.join(process.cwd(), "content/daily-brief/highlights");

export const getHighlights = cache((): Highlight[] => {
  const highlights = readdirSync(directory)
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .map((file) => JSON.parse(readFileSync(path.join(directory, file), "utf8")) as Highlight)
    .sort((a, b) => b.date.localeCompare(a.date));

  const paperIds = new Set<string>();
  for (const highlight of highlights) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(highlight.date) || !highlight.paperId || !highlight.title?.en || !highlight.title?.ko) {
      throw new Error(`Invalid paper Highlight record for ${highlight.date || "unknown date"}`);
    }
    if (paperIds.has(highlight.paperId)) {
      throw new Error(`Paper ${highlight.paperId} already has a Highlight. Check spotlight history before publishing another post.`);
    }
    paperIds.add(highlight.paperId);
  }

  return highlights;
});

export function getHighlight(date: string) {
  return getHighlights().find((highlight) => highlight.date === date);
}

export function getHighlightSummaries(): HighlightSummary[] {
  return getHighlights().map(({ date, paperId, dailyDate, title, dek, figure, dailyRank, upvotesAtSelection }) => ({ date, paperId, dailyDate, title, dek, figure, dailyRank, upvotesAtSelection }));
}
