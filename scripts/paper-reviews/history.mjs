import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export function normalizePaperId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:www\.)?arxiv\.org\/(?:abs|html|pdf)\//, "")
    .replace(/^arxiv:/, "")
    .replace(/v\d+$/, "");
}

export function parseReviewMetadata(markdown) {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!match) throw new Error("Paper review is missing its JSON/YAML frontmatter block.");
  let metadata;
  try {
    metadata = JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Paper review frontmatter must be valid JSON: ${error.message}`);
  }
  if (!metadata || typeof metadata !== "object" || !metadata.canonicalId || !metadata.slug) {
    throw new Error("Paper review frontmatter needs canonicalId and slug.");
  }
  return metadata;
}

export function readPaperHistory(root = process.cwd()) {
  const history = [];
  const legacyDirectory = path.join(root, "content/daily-brief/highlights");
  const reviewDirectory = path.join(root, "content/paper-reviews");

  for (const file of readdirSync(legacyDirectory).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))) {
    const record = JSON.parse(readFileSync(path.join(legacyDirectory, file), "utf8"));
    if (!record.paperId) throw new Error(`${file} is missing paperId.`);
    history.push({ paperId: record.paperId, source: `legacy highlight ${file}`, kind: "highlight" });
  }

  for (const file of readdirSync(reviewDirectory).filter((name) => name.endsWith(".md"))) {
    const metadata = parseReviewMetadata(readFileSync(path.join(reviewDirectory, file), "utf8"));
    history.push({ paperId: metadata.canonicalId, source: `paper review ${file}`, kind: "review" });
  }

  return history;
}

export function assertNoDuplicatePaperIds(entries) {
  const owners = new Map();
  for (const entry of entries) {
    const normalized = normalizePaperId(entry.paperId);
    if (!normalized) throw new Error(`Missing canonical paper ID in ${entry.source ?? "paper history"}.`);
    // A paper can have both a concise brief and a separate Highlight article.
    // Deduplicate each collection independently so neither can repeat itself.
    const collection = entry.kind ?? "shared";
    const key = `${collection}:${normalized}`;
    const previous = owners.get(key);
    if (previous) {
      throw new Error(`Paper ${normalized} appears twice: ${previous} and ${entry.source ?? "paper history"}.`);
    }
    owners.set(key, entry.source ?? "paper history");
  }
}
