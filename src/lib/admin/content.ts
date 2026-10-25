import { validateBrief } from "../../../scripts/daily-brief/schema.mjs";
import type { FileChange, GitFile } from "./github";

export type PostKind = "daily" | "highlight" | "paper" | "knowledge";

export type AdminPost = {
  path: string;
  sha: string | null;
  kind: PostKind;
  date: string;
  title: string;
  subtitle: string;
  status: string;
  href: string;
  content: string;
  isNew?: boolean;
};

type JsonObject = Record<string, unknown>;

export const kindLabels: Record<PostKind, { en: string; ko: string }> = {
  daily: { en: "Daily Brief", ko: "Daily Brief" },
  highlight: { en: "Highlighted Paper", ko: "Highlighted Paper" },
  paper: { en: "Paper Review", ko: "논문 리뷰" },
  knowledge: { en: "Knowledge", ko: "Knowledge" },
};

export function getKind(path: string): PostKind | null {
  if (/^content\/daily-brief\/\d{4}-\d{2}-\d{2}\.json$/.test(path)) return "daily";
  if (/^content\/daily-brief\/highlights\/\d{4}-\d{2}-\d{2}\.json$/.test(path)) return "highlight";
  if (/^content\/paper-reviews\/[a-z0-9-]+\.md$/.test(path)) return "paper";
  if (/^content\/knowledge\/[a-z0-9-]+\.json$/.test(path) && !/\/(?:registry|jobs)\.json$/.test(path)) return "knowledge";
  return null;
}

function frontmatter(content: string) {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!match) throw new Error("논문 리뷰의 JSON frontmatter를 찾을 수 없습니다.");
  return JSON.parse(match[1]) as JsonObject;
}

function jsonRecord(content: string) {
  const value = JSON.parse(content);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("게시물 파일의 최상위 값은 JSON 객체여야 합니다.");
  return value as JsonObject;
}

function objectValue(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
}

function objectArray(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter((entry): entry is JsonObject => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) : [];
}

function requireLocalized(value: unknown, label: string) {
  const localized = objectValue(value);
  if (typeof localized.en !== "string" || !localized.en.trim() || typeof localized.ko !== "string" || !localized.ko.trim()) {
    throw new Error(`${label}은 영어와 한국어를 모두 입력해 주세요.`);
  }
}

function textAt(value: unknown, language: "en" | "ko" = "en") {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const localized = value as Record<string, unknown>;
    return String(localized[language] ?? localized.en ?? localized.ko ?? "");
  }
  return "";
}

export function postFromFile(file: GitFile): AdminPost | null {
  const kind = getKind(file.path);
  if (!kind) return null;

  const dateMatch = file.path.match(/\d{4}-\d{2}-\d{2}/);
  let date = dateMatch?.[0] ?? "";
  let title = file.path.split("/").at(-1)?.replace(/\.(json|md)$/, "") ?? file.path;
  let subtitle = "";
  let status = "published";
  let href = "/daily-brief/";

  try {
    if (kind === "paper") {
      const metadata = frontmatter(file.content);
      date = String(metadata.publishedDate ?? "");
      title = textAt(metadata.title);
      subtitle = textAt(metadata.dek);
      status = metadata.reviewStatus === "draft" ? "draft" : "published";
      href = `/daily-brief/papers/${String(metadata.slug ?? "")}/`;
    } else {
      const record = jsonRecord(file.content);
      if (kind === "daily") {
        title = textAt(record.title);
        subtitle = textAt(record.dek);
        href = `/daily-brief/${String(record.date ?? "")}/`;
      } else if (kind === "highlight") {
        date = String(record.date ?? date);
        title = textAt(record.title);
        subtitle = textAt(record.dek);
        href = `/daily-brief/highlight/${String(record.date ?? "")}/`;
      } else {
        title = textAt(record.canonicalName);
        subtitle = textAt(record.dek);
        status = String(record.status ?? "published");
        href = `/knowledge/article/?slug=${encodeURIComponent(String(record.slug ?? ""))}`;
      }
    }
  } catch {
    subtitle = "파일을 읽을 수 없습니다. 내용을 확인해 주세요.";
    status = "invalid";
  }

  return { ...file, kind, date, title: title || file.path, subtitle, status, href };
}

export function makeStarterDaily(date: string) {
  const placeholder = (value: string) => ({ en: `Write this in English: ${value}`, ko: `한국어 초안을 작성하세요: ${value}` });
  const localized = (en: string, ko: string) => ({ en, ko });
  return {
    schemaVersion: 2,
    date,
    publishedAt: `${date}T06:00:00+09:00`,
    title: placeholder("issue title"),
    dek: placeholder("one-sentence summary"),
    focus: localized(
      "Write the editorial focus here. Add note markers [1], [2], and [3] while this starter glossary is present.",
      "오늘의 관점을 작성하세요. 기본 용어가 남아 있는 동안 [1], [2], [3] 표시를 넣어 주세요.",
    ),
    visual: "workflow",
    topics: ["Research"],
    editorialNote: placeholder("editorial note and research window"),
    sections: [
      ["signals", "Models & capabilities", "모델과 성능"],
      ["tools", "Developer tools", "개발 도구"],
      ["practice", "Engineering case", "구현 사례"],
      ["engineering", "Systems & inference", "시스템과 추론"],
    ].map(([id, en, ko]) => ({ id, label: localized(en, ko), items: [] })),
    experiment: {
      title: placeholder("small reproducible experiment"),
      minutes: 15,
      steps: [placeholder("step one"), placeholder("step two"), placeholder("step three")],
      measure: placeholder("success criterion and limitations"),
    },
    glossary: [1, 2, 3].map((id) => ({
      id,
      term: `Concept ${id}`,
      ko: `용어 ${id}`,
      explanation: `용어 ${id}의 설명을 작성하세요.`,
      example: `용어 ${id}의 짧은 예시를 작성하세요.`,
    })),
    sources: [],
  };
}

export function makeStarterHighlight(date: string) {
  const placeholder = (value: string) => ({ en: `[Write ${value} in English]`, ko: `[${value} 한국어 작성]` });
  return {
    date,
    paperId: "0000.00000",
    paperDate: date,
    dailyDate: date,
    dailyRank: 1,
    upvotesAtSelection: 0,
    title: placeholder("paper title"),
    dek: placeholder("one-sentence thesis"),
    selectionReason: placeholder("reason this paper deserves the highlight"),
    summary: placeholder("short paper summary"),
    summaryAttribution: placeholder("summary source and translation note"),
    figure: {
      url: "https://example.com/paper-figure.png",
      width: 1600,
      height: 900,
      alt: placeholder("figure alt text"),
      caption: placeholder("figure caption and attribution"),
    },
    sections: ["problem", "mechanism", "engineering"].map((id) => ({
      id,
      heading: placeholder(`${id} heading`),
      paragraphs: [placeholder(`${id} explanation`)],
    })),
    takeaway: placeholder("practical takeaway"),
    terminology: [1, 2, 3].map((index) => ({
      term: `Term ${index}`,
      koTerm: `용어 ${index}`,
      description: placeholder(`term ${index} explanation`),
      example: placeholder(`term ${index} example`),
    })),
    sources: [{ label: placeholder("source label"), url: "https://arxiv.org/abs/0000.00000", publisher: "arXiv" }],
  };
}

function containsPlaceholder(value: unknown): boolean {
  if (typeof value === "string") return /(write this in english|write .* in english|한국어 초안을 작성|한국어 작성|\[write |\[.*한국어 작성\]|0000\.00000|example\.com|todo)/i.test(value);
  if (Array.isArray(value)) return value.some(containsPlaceholder);
  if (value && typeof value === "object") return Object.values(value).some(containsPlaceholder);
  return false;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function normalizePaperId(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/^arxiv:/, "").replace(/v\d+$/, "");
}

export function validatePost(post: AdminPost, text: string, allPosts: AdminPost[]) {
  if (post.kind === "paper") {
    const metadata = frontmatter(text);
    const fileSlug = post.path.split("/").at(-1)?.replace(/\.md$/, "");
    const title = objectValue(metadata.title);
    const dek = objectValue(metadata.dek);
    if (!/^[a-z0-9-]+$/.test(String(metadata.slug ?? "")) || metadata.slug !== fileSlug) throw new Error("논문 slug는 파일명과 같아야 합니다.");
    if (!metadata.canonicalId || !title.en || !title.ko || !dek.en || !dek.ko) throw new Error("논문 ID, 한·영 제목과 한·영 소개를 모두 입력해 주세요.");
    if (post.sha && metadata.canonicalId !== frontmatter(post.content).canonicalId) throw new Error("기존 논문의 ID는 바꿀 수 없습니다. 새 논문은 Daily Paper 업데이트 흐름에서 추가해 주세요.");
    if (!text.includes("<!-- locale: en -->") || !text.includes("<!-- locale: ko -->")) throw new Error("영어와 한국어 본문 구분자 두 개를 유지해 주세요.");
    const id = normalizePaperId(metadata.canonicalId);
    const duplicate = allPosts.find((item) => item.kind === "paper" && item.path !== post.path && normalizePaperId(frontmatter(item.content).canonicalId) === id);
    if (duplicate) throw new Error(`같은 논문 ID가 이미 있습니다: ${duplicate.path}`);
    return;
  }

  const record = jsonRecord(text);
  if (containsPlaceholder(record)) throw new Error("템플릿 안내 문구를 실제 내용으로 바꾼 뒤 저장해 주세요.");

  if (post.kind === "daily") {
    if (record.date !== post.date) throw new Error("Daily Brief 날짜와 파일 경로의 날짜가 같아야 합니다.");
    validateBrief(record, post.date);
    return;
  }

  if (post.kind === "highlight") {
    if (record.date !== post.date || !validDate(record.date)) throw new Error("Highlight 날짜와 파일 경로의 날짜가 같아야 합니다.");
    if (!/^\d{4}\.\d{4,5}(?:v\d+)?$/.test(String(record.paperId ?? ""))) throw new Error("논문 ID는 arXiv 형식(예: 2610.12345)으로 입력해 주세요.");
    if (post.sha && record.paperId !== jsonRecord(post.content).paperId) throw new Error("기존 Highlight의 논문 ID는 바꿀 수 없습니다.");
    const duplicate = allPosts.find((item) => item.kind === "highlight" && item.path !== post.path && jsonRecord(item.content).paperId === record.paperId);
    const title = objectValue(record.title);
    const dek = objectValue(record.dek);
    const figure = objectValue(record.figure);
    if (duplicate) throw new Error(`이미 Highlight로 게시된 논문입니다: ${duplicate.path}`);
    requireLocalized(record.selectionReason, "선정 이유");
    requireLocalized(record.summary, "요약");
    requireLocalized(record.summaryAttribution, "요약 출처");
    requireLocalized(record.takeaway, "핵심 요점");
    requireLocalized(figure.alt, "그림 대체 텍스트");
    requireLocalized(figure.caption, "그림 설명");
    if (!title.en || !title.ko || !dek.en || !dek.ko || typeof figure.url !== "string" || !figure.url.startsWith("https://") || !Number.isInteger(figure.width) || Number(figure.width) < 1 || !Number.isInteger(figure.height) || Number(figure.height) < 1 || !validDate(record.paperDate) || !validDate(record.dailyDate) || !Number.isInteger(record.dailyRank) || Number(record.dailyRank) < 1 || !Number.isInteger(record.upvotesAtSelection) || Number(record.upvotesAtSelection) < 0) {
      throw new Error("Highlight의 날짜, 순위, 그림 정보 또는 한·영 제목/소개가 올바르지 않습니다.");
    }
    const sections = objectArray(record.sections);
    if (!Array.isArray(record.sections) || sections.length !== 3 || sections.length !== record.sections.length || sections.map((section) => section.id).join(",") !== "problem,mechanism,engineering") {
      throw new Error("Highlight 본문은 problem, mechanism, engineering 섹션을 순서대로 포함해야 합니다.");
    }
    sections.forEach((section) => {
      requireLocalized(section.heading, "섹션 제목");
      if (!Array.isArray(section.paragraphs) || !section.paragraphs.length) throw new Error("각 Highlight 섹션에는 본문 문단이 필요합니다.");
      section.paragraphs.forEach((paragraph) => requireLocalized(paragraph, "섹션 본문"));
    });
    const terminology = objectArray(record.terminology);
    if (!Array.isArray(record.terminology) || terminology.length < 1 || terminology.length !== record.terminology.length) throw new Error("Highlight에 용어 정리를 하나 이상 추가해 주세요.");
    terminology.forEach((entry) => {
      if (typeof entry.term !== "string" || !entry.term.trim() || typeof entry.koTerm !== "string" || !entry.koTerm.trim()) throw new Error("용어 이름을 영어와 한국어로 모두 입력해 주세요.");
      requireLocalized(entry.description, "용어 설명");
      requireLocalized(entry.example, "용어 예시");
    });
    const sources = objectArray(record.sources);
    if (!Array.isArray(record.sources) || !sources.length || sources.length !== record.sources.length) {
      throw new Error("Highlight에는 한 개 이상의 출처가 필요합니다.");
    }
    sources.forEach((source) => {
      requireLocalized(source.label, "출처 이름");
      if (typeof source.url !== "string" || !source.url.startsWith("https://") || typeof source.publisher !== "string" || !source.publisher.trim()) throw new Error("출처에는 HTTPS 링크와 발행처를 입력해 주세요.");
    });
    if (!title.en || !title.ko || !dek.en || !dek.ko) {
      throw new Error("Highlight에는 한·영 제목과 소개, HTTPS 그림, 본문 섹션, 출처가 필요합니다.");
    }
    return;
  }

  const fileSlug = post.path.split("/").at(-1)?.replace(/\.json$/, "");
  if (!/^[a-z0-9-]+$/.test(String(record.slug ?? "")) || record.slug !== fileSlug || !record.id) throw new Error("Knowledge ID와 slug를 유지하고 slug는 파일명과 같게 해 주세요.");
  if (post.sha) {
    const original = jsonRecord(post.content);
    if (record.id !== original.id || record.slug !== original.slug) throw new Error("기존 Knowledge 항목의 ID와 slug는 바꿀 수 없습니다.");
  }
}

export function prepareDeletion(post: AdminPost, files: GitFile[]): FileChange[] {
  const changes: FileChange[] = [{ path: post.path, content: null, expectedSha: post.sha }];
  if (post.kind !== "knowledge") return changes;

  const registryFile = files.find((file) => file.path === "content/knowledge/registry.json");
  const jobsFile = files.find((file) => file.path === "content/knowledge/jobs.json");
  if (!registryFile || !jobsFile) throw new Error("Knowledge 연결 파일을 찾지 못해 삭제를 중단했습니다.");
  const article = jsonRecord(post.content);
  const registry = jsonRecord(registryFile.content);
  const conceptId = String(article.id);
  const slug = String(article.slug);
  registry.concepts = objectArray(registry.concepts).filter((concept) => concept.id !== conceptId && concept.slug !== slug).map((concept) => ({
    ...concept,
    relatedConcepts: Array.isArray(concept.relatedConcepts) ? concept.relatedConcepts.filter((id): id is string => typeof id === "string" && id !== conceptId && id !== slug) : concept.relatedConcepts,
  }));
  registry.paperConcepts = objectArray(registry.paperConcepts).filter((edge) => edge.conceptId !== conceptId);
  if (Array.isArray(registry.termsIndex)) registry.termsIndex = objectArray(registry.termsIndex).filter((term) => term.id !== conceptId && term.slug !== slug);
  if (Array.isArray(registry.generationQueue)) registry.generationQueue = objectArray(registry.generationQueue).filter((entry) => entry.conceptId !== conceptId);

  const jobs = jsonRecord(jobsFile.content);
  jobs.jobs = objectArray(jobs.jobs).map((job) => ({
    ...job,
    selectedConceptIds: Array.isArray(job.selectedConceptIds) ? job.selectedConceptIds.filter((id): id is string => typeof id === "string" && id !== conceptId) : job.selectedConceptIds,
  }));

  changes.push(
    { path: registryFile.path, content: `${JSON.stringify(registry, null, 2)}\n`, expectedSha: registryFile.sha },
    { path: jobsFile.path, content: `${JSON.stringify(jobs, null, 2)}\n`, expectedSha: jobsFile.sha },
  );
  return changes;
}

export function canDeletePost(post: AdminPost, files: GitFile[]) {
  if (post.kind !== "paper") return { allowed: true };
  const metadata = frontmatter(post.content);
  const paperId = normalizePaperId(metadata.canonicalId);
  const registryFile = files.find((file) => file.path === "content/knowledge/registry.json");
  if (!registryFile) return { allowed: false, reason: "Knowledge 연결 파일을 확인할 수 없습니다." };
  const registry = jsonRecord(registryFile.content);
  const reference = objectArray(registry.concepts).find((concept) => Array.isArray(concept.sourcePapers) && concept.sourcePapers.some((id) => normalizePaperId(id) === paperId));
  if (reference) return { allowed: false, reason: `Knowledge 개념 “${textAt(reference.canonicalName)}”이 이 논문을 출처로 사용합니다.` };
  return { allowed: true };
}

export function buildFileChanges(post: AdminPost, content: string, files: GitFile[]): FileChange[] {
  if (post.isNew && files.some((file) => file.path === post.path)) throw new Error("같은 날짜의 파일이 main에 이미 있습니다. 새로고침한 뒤 해당 게시물을 편집해 주세요.");
  const changes: FileChange[] = [{ path: post.path, content, expectedSha: post.sha }];
  if (post.kind === "paper") {
    const metadata = frontmatter(content);
    const registryFile = files.find((file) => file.path === "content/knowledge/registry.json");
    if (registryFile) {
      const registry = jsonRecord(registryFile.content);
      const currentId = normalizePaperId(metadata.canonicalId);
      const originalId = post.sha ? normalizePaperId(frontmatter(post.content).canonicalId) : "";
      const linked = objectArray(registry.concepts).some((concept) => Array.isArray(concept.sourcePapers) && concept.sourcePapers.some((id) => normalizePaperId(id) === originalId));
      if (linked && currentId !== originalId) throw new Error("Knowledge가 이 논문 ID를 사용 중이라 ID를 바꾸면 연결이 끊깁니다.");
    }
  }
  return changes;
}
