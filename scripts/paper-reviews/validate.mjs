import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { assertNoDuplicatePaperIds, parseReviewMetadata, readPaperHistory } from "./history.mjs";

const root = process.cwd();
const directory = path.join(root, "content/paper-reviews");
const titles = {
  daily: {
    en: ["TL;DR", "Research Problem", "Key Contributions", "Method Overview", "Key Results", "Limitations & Implications", "References"],
    ko: ["핵심 요약 (TL;DR)", "연구 문제", "핵심 기여", "방법론 개요", "주요 실험 결과", "한계와 시사점", "참고 자료"],
  },
  highlighted: {
    en: ["Executive Summary", "Background & Motivation", "Core Innovation", "Architecture & Methodology", "Experiments & Results", "Critical Analysis", "Engineering Insights", "Future Directions", "References & Resources"],
    ko: ["핵심 요약", "배경과 연구 동기", "핵심 혁신", "아키텍처와 방법론", "실험과 결과", "비판적 분석", "엔지니어링 인사이트", "향후 연구 방향", "참고 자료와 리소스"],
  },
};

function reviewSections(text, filename, kind) {
  const markers = ["<!-- locale: en -->", "<!-- locale: ko -->"];
  if (!markers.every((marker) => text.includes(marker))) throw new Error(`${filename}: bilingual locale markers required`);
  const english = text.split(markers[0])[1].split(markers[1])[0];
  const korean = text.split(markers[1])[1];
  for (const [lang, body] of [["en", english], ["ko", korean]]) {
    const matches = [...body.matchAll(/^## (.+)$/gm)];
    const headings = matches.map((item) => item[1].trim());
    if (JSON.stringify(headings) !== JSON.stringify(titles[kind][lang])) {
      throw new Error(`${filename}: ${lang} ${kind} headings must match editorial outline in order. Found ${headings.join(" / ")}`);
    }
    for (let i = 0; i < matches.length; i += 1) {
      const section = body.slice(matches[i].index + matches[i][0].length, matches[i + 1]?.index ?? body.length).trim();
      if (section.length < 25) throw new Error(`${filename}: empty or trivial section ${headings[i]} (${lang})`);
    }
  }
}

for (const [kind, template] of [["daily", "templates/daily-paper-template.md"], ["highlighted", "templates/highlighted-review-template.md"]]) {
  const full = path.join(directory, template);
  if (!existsSync(full)) throw new Error(`Missing review template: ${template}`);
  reviewSections(readFileSync(full, "utf8"), template, kind);
}

const foundational = new Map([
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
]);

assertNoDuplicatePaperIds(readPaperHistory(root));
let daily = 0, highlighted = 0, digests = 0;
for (const file of readdirSync(directory).filter((name) => name.endsWith(".md"))) {
  const text = readFileSync(path.join(directory, file), "utf8");
  const metadata = parseReviewMetadata(text);
  const kind = metadata.reviewFormat === "highlighted" ? "highlighted" : "daily";
  reviewSections(text, file, kind);
  if (kind === "highlighted") highlighted += 1; else daily += 1;
  if (!metadata.hero?.url?.startsWith("https://") || !metadata.hero?.license || !metadata.hero?.caption?.en || !metadata.hero?.caption?.ko) {
    throw new Error(`${file}: original figure and attribution must be present`);
  }
  if (!text.includes("https://arxiv.org/")) throw new Error(`${file}: original paper link required`);
  if (metadata.translationModel) {
    if (metadata.editorialStatus !== "metadata-digest") throw new Error(`${file}: machine-generated summaries must be labeled metadata-digest`);
    digests += 1;
  }
  if (foundational.has(file)) {
    if (metadata.canonicalId !== foundational.get(file) || metadata.sourceType !== "foundational-seed" || metadata.reviewStatus !== "published") {
      throw new Error(`${file}: original foundational metadata must remain intact`);
    }
    if (metadata.dailyDate !== null || metadata.dailyRank !== null || metadata.upvotesAtSelection !== null) {
      throw new Error(`${file}: foundational seeds must not claim HF Daily ranking`);
    }
    foundational.delete(file);
  }
}
if (foundational.size) throw new Error(`Missing foundational papers: ${[...foundational.keys()].join(", ")}`);
console.log(`Paper reviews valid: ${daily} daily/foundational, ${highlighted} highlighted drafts, ${digests} explicitly labeled metadata digests.`);
