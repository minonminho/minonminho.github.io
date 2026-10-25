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
const history = readPaperHistory(root);
assertNoDuplicatePaperIds(history);

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

const foundational = [
  ["attention-is-all-you-need.md", "arxiv:1706.03762"],
  ["deep-residual-learning.md", "arxiv:1512.03385"],
  ["bert-pretraining.md", "arxiv:1810.04805"],
  ["language-models-few-shot-learners.md", "arxiv:2005.14165"],
  ["retrieval-augmented-generation.md", "arxiv:2005.11401"],
  ["lora-low-rank-adaptation.md", "arxiv:2106.09685"],
  ["instructgpt-human-feedback.md", "arxiv:2203.02155"],
  ["vision-transformer.md", "arxiv:2010.11929"],
  ["clip-contrastive-vision-language.md", "arxiv:2103.00020"],
  ["denoising-diffusion-probabilistic-models.md", "arxiv:2006.11239"],
];
const requiredEnglishSections = [
  "The contribution in one minute",
  "Method and evidence",
  "Limits and engineering implications",
  "Terminology",
  "References and figure credits",
];
const requiredKoreanSections = ["1분 핵심 요약", "방법과 근거", "한계와 엔지니어 관점", "용어 정리", "참고 자료와 그림 출처"];

for (const [file, paperId] of foundational) {
  const markdown = readFileSync(path.join(reviewDirectory, file), "utf8");
  const paper = parseReviewMetadata(markdown);
  if (paper.canonicalId !== paperId || paper.reviewStatus !== "published" || paper.sourceType !== "foundational-seed") {
    throw new Error(`${file} must be a published foundational paper review for ${paperId}.`);
  }
  if (paper.dailyDate !== null || paper.dailyRank !== null || paper.upvotesAtSelection !== null) {
    throw new Error(`${file} must not claim a Hugging Face Daily ranking.`);
  }
  if (!paper.hero?.url?.startsWith("https://") || !paper.hero?.alt?.en || !paper.hero?.alt?.ko || !paper.hero?.caption?.en || !paper.hero?.caption?.ko || !paper.hero?.license) {
    throw new Error(`${file} needs a source-linked, accessible bilingual figure with attribution guidance.`);
  }
  for (const section of requiredEnglishSections) {
    if (!markdown.includes(`## ${section}`)) throw new Error(`${file} is missing English section: ${section}`);
  }
  for (const section of requiredKoreanSections) {
    if (!markdown.includes(`## ${section}`)) throw new Error(`${file} is missing Korean section: ${section}`);
  }
  if (!markdown.includes("https://arxiv.org/abs/")) throw new Error(`${file} is missing the original paper reference.`);
}

console.log(`Paper review content valid: ${metadata.canonicalId} (${metadata.reviewStatus}); ${foundational.length} published foundational briefs.`);
