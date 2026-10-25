import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseReviewMetadata } from "../paper-reviews/history.mjs";

const root = process.cwd();
const apiUrl = process.env.KNOWLEDGE_API_URL?.trim().replace(/\/$/, "");
const token = process.env.KNOWLEDGE_INGEST_TOKEN;

function changedReviewFiles(before, after) {
  const allZero = /^0+$/.test(before ?? "");
  const output = allZero
    ? execFileSync("git", ["ls-tree", "-r", "--name-only", after, "content/paper-reviews"], { encoding: "utf8" })
    : execFileSync("git", ["diff", "--name-only", `${before}...${after}`, "--", "content/paper-reviews"], { encoding: "utf8" });
  return output.split(/\r?\n/).map((file) => file.trim()).filter((file) => /^content\/paper-reviews\/.+\.md$/.test(file) && !file.includes("/templates/"));
}

function localeBlock(markdown, locale) {
  const marker = `<!-- locale: ${locale} -->`;
  const start = markdown.indexOf(marker);
  if (start < 0) return "";
  const bodyStart = start + marker.length;
  const next = markdown.indexOf("<!-- locale:", bodyStart);
  return markdown.slice(bodyStart, next < 0 ? undefined : next);
}

function terminologyRows(markdown, locale) {
  const body = localeBlock(markdown, locale);
  const heading = locale === "ko" ? "용어 정리" : "Terminology";
  const start = body.search(new RegExp(`^##\\s+${heading}\\s*$`, "mi"));
  if (start < 0) return [];
  const afterHeading = body.slice(start).replace(/^##[^\n]*\n/, "");
  const nextHeading = afterHeading.search(/^##\s+/m);
  const section = nextHeading < 0 ? afterHeading : afterHeading.slice(0, nextHeading);
  return section.split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|") && !/^\s*\|?\s*:?-{3,}/.test(line))
    .slice(1)
    .map((line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 3)
    .map(([term, definition, context]) => ({ term, definition, context }));
}

function sourcesFor(markdown, paperUrl) {
  const english = localeBlock(markdown, "en");
  const heading = english.search(/^##\s+References and figure credits\s*$/mi);
  const section = heading < 0 ? "" : english.slice(heading).replace(/^##[^\n]*\n/, "").split(/^##\s+/m)[0];
  const urls = new Set([paperUrl, ...[...section.matchAll(/https:\/\/[^\s)<>]+/g)].map((match) => match[0].replace(/[.,;]+$/, ""))]);
  return [...urls].filter((url) => /^https:\/\//.test(url)).map((url) => {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return { url, label: { en: host, ko: host }, publisher: host, type: url.includes("arxiv.org") ? "research-paper" : "reference" };
  });
}

export function buildEvent(markdown, file = "paper-review.md") {
  const metadata = parseReviewMetadata(markdown);
  if (metadata.reviewStatus !== "published") return null;
  const en = terminologyRows(markdown, "en");
  const ko = terminologyRows(markdown, "ko");
  if (!en.length || en.length !== ko.length) throw new Error(`${file} has mismatched English and Korean terminology tables.`);
  const canonicalId = String(metadata.canonicalId).replace(/v\d+$/i, "");
  const paperUrl = `https://arxiv.org/abs/${canonicalId.replace(/^arxiv:/i, "")}`;
  const terminology = en.map((row, index) => {
    const korean = ko[index];
    const term = row.term;
    const aliases = [...new Set([term, korean.term].filter(Boolean))];
    const priority = Math.max(1, 100 - index * 2 + (metadata.title.en.toLowerCase().includes(term.toLowerCase()) ? 20 : 0));
    return {
      term,
      definition: { en: row.definition, ko: korean.definition },
      context: { en: row.context, ko: korean.context },
      priority,
      aliases,
    };
  }).slice(0, 40);
  const revision = createHash("sha256").update(markdown).digest("hex");
  return {
    revision,
    paper: {
      canonicalId,
      slug: metadata.slug,
      title: metadata.title,
      authors: metadata.authors,
      url: paperUrl,
      reviewUrl: `/daily-brief/papers/${metadata.slug}/`,
      excerpt: metadata.dek,
      hero: metadata.hero,
    },
    terminology,
    sources: sourcesFor(markdown, paperUrl),
  };
}

async function main() {
  const files = changedReviewFiles(process.env.GITHUB_BEFORE ?? "", process.env.GITHUB_SHA ?? "");
  if (files.length === 0) {
    console.log("No changed paper review Markdown files; Knowledge dispatch skipped.");
    return;
  }
  if (!apiUrl || !token) {
    console.log("Knowledge API URL or ingest secret is not configured; no paper was dispatched.");
    return;
  }
  for (const file of files) {
    if (!existsSync(path.join(root, file))) continue;
    const markdown = readFileSync(path.join(root, file), "utf8");
    const payload = buildEvent(markdown, file);
    if (!payload) {
      console.log(`Skipped draft paper review: ${path.basename(file)}.`);
      continue;
    }
    const response = await fetch(`${apiUrl}/knowledge/papers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Knowledge dispatch failed for ${path.basename(file)} (HTTP ${response.status}).`);
    const result = await response.json();
    console.log(`Dispatched ${payload.paper.canonicalId}; status=${result.status ?? result.job?.status ?? "deduplicated"}.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Knowledge dispatch failed.");
    process.exitCode = 1;
  });
}
