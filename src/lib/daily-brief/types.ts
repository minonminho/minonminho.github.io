export type Visual = "verification" | "workflow" | "systems" | "models" | "proof-pipeline" | "security-gates";
export type Language = "ko" | "en";
export type LocalizedText = Record<Language, string>;

export type StoryVisual = {
  variant: Visual;
  caption: LocalizedText;
  image: {
    url: string;
    width: number;
    height: number;
    alt: LocalizedText;
    sourceId: string;
  } | null;
};

export type BriefItem = {
  title: LocalizedText;
  publishedDate: string | null;
  status: "research" | "available" | "preview" | "announced" | "case-study";
  summary: LocalizedText;
  change: LocalizedText;
  availability: LocalizedText;
  limitation: LocalizedText;
  implication: LocalizedText;
  sourceIds: string[];
  visual: StoryVisual;
  resources: { kind: "paper" | "code" | "docs" | "demo" | "benchmark"; title: LocalizedText; url: string }[];
};

export type Brief = {
  schemaVersion: 2;
  date: string;
  publishedAt: string;
  title: LocalizedText;
  dek: LocalizedText;
  focus: LocalizedText;
  visual: Visual;
  topics: string[];
  editorialNote: LocalizedText;
  sections: {
    id: "signals" | "tools" | "practice" | "engineering";
    label: LocalizedText;
    items: BriefItem[];
  }[];
  experiment: { title: LocalizedText; minutes: number; steps: LocalizedText[]; measure: LocalizedText };
  glossary: { id: number; term: string; ko: string; explanation: string; example: string }[];
  sources: { id: string; title: LocalizedText; publisher: string; url: string; publishedDate: string | null }[];
};

export type BriefSummary = Pick<Brief, "date" | "title" | "dek" | "topics"> & { readingMinutes: number };

export function formatBriefDate(date: string, long = false, language: Language = "en") {
  return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: long ? "long" : "short",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00+09:00`));
}

export function readingMinutes(brief: Brief) {
  const words = [brief.title, brief.dek, brief.focus,
    ...brief.sections.flatMap((section) => section.items.flatMap((item) =>
      [item.title, item.summary, item.change, item.availability, item.limitation, item.implication])),
    brief.experiment.title, ...brief.experiment.steps, brief.experiment.measure,
  ].map((value) => value.en).join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
}
