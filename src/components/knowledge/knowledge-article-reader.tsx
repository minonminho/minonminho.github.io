"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Download, ExternalLink } from "lucide-react";
import { useBriefLanguage } from "@/components/daily-brief/language";
import { AlphaCompositingDemo } from "./alpha-compositing-demo";
import type { KnowledgeConcept } from "@/lib/knowledge/types";

export function KnowledgeArticleReader({ concepts, apiBaseUrl = "" }: { concepts: KnowledgeConcept[]; apiBaseUrl?: string }) {
  const { language, copy } = useBriefLanguage();
  const [slug, setSlug] = useState(concepts[0]?.slug ?? "");
  const [remoteConcept, setRemoteConcept] = useState<KnowledgeConcept | null>(null);
  const [remoteError, setRemoteError] = useState(false);

  useEffect(() => {
    const requestedSlug = new URLSearchParams(window.location.search).get("slug");
    if (requestedSlug && /^[a-z0-9-]+$/.test(requestedSlug)) setSlug(requestedSlug);
  }, []);

  const localConcept = concepts.find((concept) => concept.slug === slug);
  useEffect(() => {
    setRemoteConcept(null);
    setRemoteError(false);
    if (localConcept || !apiBaseUrl || !slug) return;
    const controller = new AbortController();
    fetch(`${apiBaseUrl.replace(/\/$/, "")}/knowledge/concepts/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<KnowledgeConcept> : Promise.reject(new Error("Concept not found")))
      .then(setRemoteConcept)
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setRemoteError(true); });
    return () => controller.abort();
  }, [apiBaseUrl, localConcept, slug]);

  const concept = localConcept ?? remoteConcept;
  if (!concept) return <main className="site-shell flex-1 py-16">
    <Link href="/knowledge/" className="inline-flex min-h-10 items-center gap-2 text-sm text-signal-ice"><ArrowLeft className="size-4" aria-hidden="true" />{copy("Knowledge Library", "Knowledge 목록")}</Link>
    <p className="mt-10 text-sm text-text-secondary">{remoteError ? copy("This concept is not available in the local library or configured Knowledge service.", "이 개념은 로컬 라이브러리나 연결된 Knowledge 서비스에서 찾을 수 없습니다.") : copy("Loading concept…", "개념을 불러오는 중…")}</p>
  </main>;

  return <main lang={language} className={`site-shell flex-1 pb-20 pt-10 md:pb-28 md:pt-14 ${language === "ko" ? "break-keep" : ""}`}>
    <Link href="/knowledge/" className="inline-flex min-h-10 items-center gap-2 text-sm text-text-secondary hover:text-signal-ice"><ArrowLeft className="size-4" aria-hidden="true" />{copy("Knowledge Library", "Knowledge 목록")}</Link>
    <header className="mt-8 max-w-5xl border-b-2 border-border-strong pb-9 md:mt-12 md:pb-12">
      <p className="text-eyebrow text-signal-mint">TECHNICAL CONCEPT BRIEF / {concept.domain.join(" · ").toUpperCase()}</p>
      <h1 className="text-display-xl mt-5 leading-tight">{concept.canonicalName[language]}</h1>
      <p className="mt-5 max-w-3xl text-subhead">{concept.dek[language]}</p>
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-text-tertiary"><span>{copy("VERSION", "버전")} {concept.version}</span><span>·</span><span>{copy("UPDATED", "업데이트")} {concept.lastUpdated}</span><span>·</span><span>{copy("CANONICAL ID", "표준 ID")} {concept.id}</span></div>
    </header>

    <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-16">
      <article className="min-w-0 space-y-10">
        {concept.sections.map((section) => <section key={section.id} id={section.id} className="scroll-mt-28 border-t border-border-subtle pt-6">
          <h2 className="text-headline">{section.heading[language]}</h2>
          <div className="mt-4 space-y-4">{section.paragraphs.map((paragraph, index) => <p key={index} className="text-body leading-8 text-text-secondary">{paragraph[language]}</p>)}</div>
          {section.id === "visualization" && <div className="mt-6 space-y-4">
            {concept.id === "concept:alpha-compositing" && <AlphaCompositingDemo />}
            <figure className="overflow-hidden border border-border-default bg-surface-01"><img src={concept.visualAsset.path ?? concept.visualAsset.url ?? ""} alt={concept.visualAsset.alt[language]} className="h-auto w-full" /><figcaption className="border-t border-border-subtle px-4 py-3 text-xs leading-6 text-text-secondary">{concept.visualAsset.caption[language]} <span className="text-text-tertiary">{concept.visualAsset.credit}</span></figcaption></figure>
          </div>}
          {section.comparison && <div className="mt-5 overflow-x-auto border border-border-default"><table className="w-full min-w-[520px] border-collapse text-left text-sm"><thead className="bg-surface-02"><tr><th className="border-b border-border-default px-4 py-3 font-mono text-xs">{copy("CONCEPT", "개념")}</th><th className="border-b border-border-default px-4 py-3 font-mono text-xs">{copy("QUESTION IT ANSWERS", "답하는 질문")}</th></tr></thead><tbody>{section.comparison.map((row) => <tr key={row.term.en} className="odd:bg-surface-01 even:bg-background"><th scope="row" className="border-b border-border-subtle px-4 py-4 font-medium text-text-primary">{row.term[language]}</th><td className="border-b border-border-subtle px-4 py-4 leading-7 text-text-secondary">{row.question[language]}</td></tr>)}</tbody></table></div>}
        </section>)}
      </article>
      <aside className="space-y-8">
        <section className="border-t border-border-strong pt-4"><h2 className="text-eyebrow">{copy("ONE-PAGER", "개념 한 장 요약")}</h2><p className="mt-3 text-sm leading-7 text-text-secondary">{copy("A separate Korean business-friendly document is available in PDF and DOCX when generated.", "비기술 직군을 위한 한글 문서는 별도로 제공됩니다.")}</p>{(concept.onePager.pdfPath || concept.onePager.docxPath) && <div className="mt-4 flex flex-wrap gap-3">{concept.onePager.pdfPath && <a href={concept.onePager.pdfPath} className="inline-flex min-h-10 items-center gap-2 border border-border-default px-3 text-xs text-text-primary hover:border-signal-ice"><Download className="size-3.5" aria-hidden="true" />PDF</a>}{concept.onePager.docxPath && <a href={concept.onePager.docxPath} className="inline-flex min-h-10 items-center gap-2 border border-border-default px-3 text-xs text-text-primary hover:border-signal-ice"><Download className="size-3.5" aria-hidden="true" />DOCX</a>}</div>}</section>
        <section className="border-t border-border-strong pt-4"><h2 className="text-eyebrow">{copy("LINKED PAPERS", "연결된 논문")}</h2><ul className="mt-3 space-y-3">{concept.sourcePapers.map((paperId) => {
          const paper = concept.sourcePaperReviews?.find((item) => item.id === paperId);
          return <li key={paperId}><p className="text-sm text-text-primary">{paper?.title[language] ?? paperId}</p>{paper && <Link href={paper.reviewUrl} className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm text-signal-ice hover:text-text-primary">{copy("Read the paper review", "논문 리뷰 읽기")}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>}</li>;
        })}</ul></section>
        <section className="border-t border-border-strong pt-4"><h2 className="text-eyebrow">{copy("REFERENCES", "참고 자료")}</h2><ul className="mt-3 space-y-4">{concept.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm leading-6 text-signal-ice underline decoration-border-default underline-offset-4">{source.label[language]}<ExternalLink className="mt-1 size-3 shrink-0" aria-hidden="true" /></a><p className="mt-1 text-xs text-text-tertiary">{source.publisher}</p></li>)}</ul></section>
      </aside>
    </div>
  </main>;
}
