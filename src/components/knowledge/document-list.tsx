"use client";

import { ArrowDownToLine, ExternalLink } from "lucide-react";
import { useBriefLanguage } from "@/components/daily-brief/language";
import type { KnowledgeConceptSummary } from "@/lib/knowledge/types";

export function DocumentList({ concepts }: { concepts: KnowledgeConceptSummary[] }) {
  const { language, copy } = useBriefLanguage();
  const ready = concepts.filter((concept) => concept.onePager.status === "ready");
  return <div className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
    {ready.map((concept) => <article key={concept.id} className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div><h2 className="text-card-title">{concept.canonicalName[language]}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{copy("A4 Concept One-Pager · Korean · one page", "A4 Concept One-Pager · 한글 · 1페이지")}</p></div>
      <div className="flex flex-wrap gap-3"><a href={concept.onePager.pdfPath ?? undefined} className="inline-flex min-h-11 items-center gap-2 border border-border-default px-4 text-sm text-text-primary hover:border-signal-ice"><ArrowDownToLine className="size-4" aria-hidden="true" />PDF</a><a href={concept.onePager.docxPath ?? undefined} className="inline-flex min-h-11 items-center gap-2 border border-border-default px-4 text-sm text-text-primary hover:border-signal-ice"><ArrowDownToLine className="size-4" aria-hidden="true" />DOCX</a><a href={`/knowledge/article/?slug=${encodeURIComponent(concept.slug)}`} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-signal-ice">{copy("Brief", "Brief")}<ExternalLink className="size-3.5" aria-hidden="true" /></a></div>
    </article>)}
    {ready.length === 0 && <p className="py-10 text-sm text-text-secondary">{copy("No documents have been generated.", "생성된 문서가 없습니다.")}</p>}
  </div>;
}
