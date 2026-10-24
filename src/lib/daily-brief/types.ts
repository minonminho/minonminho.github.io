export type Visual = "verification" | "workflow" | "systems" | "models" | "proof-pipeline" | "security-gates";

export type StoryVisual = {
  variant: Visual;
  caption: string;
  image: {
    url: string;
    width: number;
    height: number;
    alt: string;
    sourceId: string;
  } | null;
};

export type BriefItem = {
  title: string;
  publishedDate: string | null;
  status: "research" | "available" | "preview" | "announced" | "case-study";
  summary: string;
  change: string;
  availability: string;
  limitation: string;
  implication: string;
  sourceIds: string[];
  visual: StoryVisual;
  resources: { kind: "paper" | "code" | "docs" | "demo" | "benchmark"; title: string; url: string }[];
};

export type Brief = {
  schemaVersion: 1;
  date: string;
  publishedAt: string;
  title: string;
  dek: string;
  focus: string;
  visual: Visual;
  topics: string[];
  editorialNote: string;
  sections: {
    id: "signals" | "tools" | "practice" | "engineering";
    label: string;
    items: BriefItem[];
  }[];
  experiment: { title: string; minutes: number; steps: string[]; measure: string };
  glossary: { id: number; term: string; ko: string; explanation: string; example: string }[];
  sources: { id: string; title: string; publisher: string; url: string; publishedDate: string | null }[];
};

export type BriefSummary = Pick<Brief, "date" | "title" | "dek" | "topics"> & { readingMinutes: number };

export function formatBriefDate(date: string, long = false) {
  return new Intl.DateTimeFormat("en-US", {
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
  ].join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
}
