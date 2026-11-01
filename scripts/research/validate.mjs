import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "content/research/reviews");
const sectionIds = ["summary", "background", "contributions", "method", "experiments", "critical", "engineering", "future", "references"];
const files = readdirSync(root).filter((name) => name.endsWith(".json"));
const selected = new Set();
for (const file of files) {
  const review = JSON.parse(readFileSync(path.join(root, file), "utf8"));
  const fail = (message) => { throw new Error(file + ": " + message); };
  const localized = (value, minLength = 10) => !!value && typeof value.en === "string" && value.en.trim().length >= minLength && typeof value.ko === "string" && value.ko.trim().length >= minLength;
  if (review.schemaVersion !== 1 || !/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(review.slug)) fail("invalid schema or slug");
  if (review.status !== "published" && review.status !== "draft") fail("status must be published or draft");
  if (selected.has(review.date) && review.status === "published") fail("more than one published paper for same date");
  if (review.status === "published") selected.add(review.date);
  if (!/^https:\/\/arxiv\.org\/abs\/\d{4}\.\d{4,5}$/.test(review.paper?.sourceUrl)) fail("primary arXiv paper link required");
  if (!localized(review.headline) || !localized(review.abstract) || !localized(review.selection)) fail("bilingual introduction required");
  if (JSON.stringify(review.sections?.map((s) => s.id)) !== JSON.stringify(sectionIds)) fail("must have exact nine-chapter outline");
  for (const section of review.sections) {
    if (!localized(section.title, 2) || !section.paragraphs?.length || !section.paragraphs.every(localized)) fail("incomplete " + section.id);
    if (!["mixed","author","analysis"].includes(section.evidence)) fail("missing source analysis label");
  }
  if (!Array.isArray(review.concepts) || review.concepts.length < 3) fail("at least three linked concepts required");
  const ids = new Set(review.concepts.map((concept) => concept.id));
  for (const concept of review.concepts) {
    if (!/^[a-z0-9-]+$/.test(concept.id) || !localized(concept.name, 2) || ![concept.plain,concept.background,concept.example,concept.why].every(localized)) fail("invalid concept " + concept.id);
  }
  for (const section of review.sections) {
    for (const paragraph of section.paragraphs) {
      for (const language of ["en","ko"]) {
        for (const marker of paragraph[language].matchAll(/\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g)) {
          if (!ids.has(marker[1])) fail("unresolved concept link " + marker[1]);
        }
      }
    }
  }
  if (!review.sources?.some((source) => source.url === review.paper.sourceUrl)) fail("original paper missing in source list");
  if (review.sources.some((source) => !/^https:\/\//.test(source.url))) fail("non-https source");
  const wordCount = review.sections.flatMap((section) => section.paragraphs.map((p) => p.en)).join(" ").split(/\s+/).length;
  if (review.status === "published" && wordCount < 1200) fail("insufficient detail for a published deep review");
  console.log("Validated:",review.date,review.paper.title,review.sections.length,"chapters,",wordCount,"English words.");
}
