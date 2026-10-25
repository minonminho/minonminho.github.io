import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { assertNoDuplicatePaperIds, parseReviewMetadata, readPaperHistory } from "./history.mjs";

const root = process.cwd();
const reviewDirectory = path.join(root, "content/paper-reviews");
const files = [
  "templates/daily-paper-template.md",
  "templates/highlighted-review-template.md",
  "layereditor.md",
];
for (const file of files) {
  if (!existsSync(path.join(reviewDirectory, file))) throw new Error(`Missing paper review file: ${file}`);
}

const review = readFileSync(path.join(reviewDirectory, "layereditor.md"), "utf8");
const metadata = parseReviewMetadata(review);
assertNoDuplicatePaperIds(readPaperHistory(root));

for (const marker of ["<!-- locale: en -->", "<!-- locale: ko -->"]) {
  if (!review.includes(marker)) throw new Error(`Review is missing locale marker ${marker}.`);
}
for (const section of ["Why this paper matters", "How the method works", "What the experiments show", "Limits and engineering implications", "Terminology", "References and figure credits"]) {
  if (!review.includes(section)) throw new Error(`Review is missing required section: ${section}`);
}
if (metadata.reviewStatus !== "draft") throw new Error("The sample review must remain a local draft in this test.");
if (!String(metadata.canonicalId).includes("2610.24738")) throw new Error("The sample review paper ID changed unexpectedly.");
if (!review.includes("https://arxiv.org/html/2610.24738v1/flowchart.png")) throw new Error("The sample review must include an original paper figure.");
if (!review.includes("CC BY 4.0")) throw new Error("The sample review must record figure attribution and license.");

console.log(`Paper review content valid: ${metadata.canonicalId} (${metadata.reviewStatus})`);
