export type LocalizedText = { en: string; ko: string };

export type KnowledgeComparison = {
  term: LocalizedText;
  question: LocalizedText;
};

export type KnowledgeSection = {
  id: string;
  heading: LocalizedText;
  paragraphs: LocalizedText[];
  comparison?: KnowledgeComparison[];
};

export type KnowledgeSource = {
  label: LocalizedText;
  url: string;
  publisher: string;
  type: string;
};

export type KnowledgeConcept = {
  id: string;
  slug: string;
  canonicalName: LocalizedText;
  dek: LocalizedText;
  domain: string[];
  version: number;
  lastUpdated: string;
  sourcePapers: string[];
  sourcePaperReviews?: { id: string; title: LocalizedText; reviewUrl: string; url: string }[];
  relatedConcepts?: { id: string; relation: string; evidence: string }[];
  visualAsset: {
    path?: string;
    url?: string;
    alt: LocalizedText;
    caption: LocalizedText;
    credit?: string;
    license?: string;
  };
  sections: KnowledgeSection[];
  sources: KnowledgeSource[];
  onePager: {
    title?: string;
    subtitle?: string;
    oneLine: string;
    sections: { heading: string; body: string }[];
    sources: string[];
    status?: "ready" | "pending";
    pdfPath?: string | null;
    docxPath?: string | null;
  };
};

export type KnowledgeConceptSummary = Pick<KnowledgeConcept,
  "id" | "slug" | "canonicalName" | "dek" | "domain" | "version" | "lastUpdated" | "sourcePapers"
> & {
  aliases: string[];
  status: "published" | "draft";
  briefPath: string;
  onePager: {
    status: "ready" | "pending";
    pdfPath: string | null;
    docxPath: string | null;
  };
};

export type KnowledgeJob = {
  id: string;
  idempotencyKey: string;
  paperId: string;
  status: "queued" | "processing" | "validated" | "published" | "awaiting_configuration" | "failed";
  environment: "local-validation" | "cloud";
  selectedConceptIds: string[];
  termsSeen: number;
  newConcepts: number;
  modelCalls: number;
  estimatedTokens: number;
  actualInputTokens?: number | null;
  actualOutputTokens?: number | null;
  cachedInputTokens?: number | null;
  modelId?: string | null;
  estimatedCostUsd?: number | null;
  actualCostUsd?: number | null;
  startedAt: string;
  finishedAt: string | null;
  message: string;
};

export type KnowledgeTermIndexRecord = {
  id: string;
  slug: string;
  canonicalName: LocalizedText;
  aliases: string[];
  definition: LocalizedText;
  priorityScore: number;
  sourcePapers: string[];
  briefStatus: "indexed" | "queued" | "processing" | "published" | "awaiting_configuration" | "failed";
  firstSeenAt: string;
  lastSeenAt: string;
};
