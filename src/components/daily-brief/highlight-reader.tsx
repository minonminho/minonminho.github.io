"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, ExternalLink, Star } from "lucide-react";
import { useBriefLanguage } from "./language";
import type { Highlight } from "@/lib/daily-brief/highlights";
import { formatBriefDate } from "@/lib/daily-brief/types";

const articleSections = [
  { id: "paper-summary", en: "Executive Summary", ko: "핵심 요약" },
  { id: "background", en: "Background & Motivation", ko: "배경과 연구 동기" },
  { id: "innovation", en: "Core Innovation", ko: "핵심 혁신" },
  { id: "methodology", en: "Architecture & Methodology", ko: "아키텍처와 방법론" },
  { id: "experiments", en: "Experiments & Results", ko: "실험과 결과" },
  { id: "critical", en: "Critical Analysis", ko: "비판적 분석" },
  { id: "insights", en: "Engineering Insights", ko: "엔지니어링 인사이트" },
  { id: "future", en: "Future Directions", ko: "향후 연구 방향" },
  { id: "sources", en: "References & Resources", ko: "참고 자료와 리소스" },
];

export function HighlightReader({ highlight }: { highlight: Highlight }) {
  const { language, text, copy } = useBriefLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => { document.title = `${language === "ko" ? highlight.title.ko : highlight.title.en} · Paper Highlight`; }, [language, highlight.title.en, highlight.title.ko]);

  return <div lang={language} className={`flex-1 ${language === "ko" ? "break-keep" : ""}`}>
    <header className="site-shell border-b-2 border-border-strong pb-12 pt-12 md:pb-16 md:pt-16">
      <Link href="/daily-brief/highlight/" className="inline-flex min-h-10 items-center gap-2 text-sm text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><ArrowLeft className="size-4" aria-hidden="true" /> {copy("All paper highlights", "전체 논문 하이라이트")}</Link>
      <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-text-secondary"><span className="inline-flex items-center gap-2 font-mono uppercase tracking-wider text-signal-ice"><Star className="size-3.5" aria-hidden="true" /> {copy("Highlighted paper review", "논문 심층 리뷰")}</span><time dateTime={highlight.date}>{formatBriefDate(highlight.date, true, language)}</time><span className="inline-flex items-center gap-2"><Clock3 className="size-3.5" aria-hidden="true" /> {copy("6 min read", "약 6분 읽기")}</span><a href="#terminology" className="underline underline-offset-4 hover:text-signal-ice">{copy(`${highlight.terminology.length} terminology notes`, `용어 설명 ${highlight.terminology.length}개`)}</a></div>
      <h1 className={`text-display-xl mt-6 max-w-5xl ${language === "ko" ? "leading-[1.25]" : ""}`}>{text(highlight.title)}</h1>
      <p className="mt-6 max-w-3xl text-subhead">{text(highlight.dek)}</p>
      <div className="mt-8 flex flex-wrap gap-3"><a href={`https://huggingface.co/papers/${highlight.paperId}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-signal-ice px-4 text-sm text-signal-ice hover:bg-signal-ice hover:text-void focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-ice">{copy("Open on Hugging Face", "Hugging Face에서 보기")} <ExternalLink className="size-3.5" aria-hidden="true" /></a><a href={`https://arxiv.org/abs/${highlight.paperId}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-border-default px-4 text-sm text-text-secondary hover:border-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-ice">arXiv:{highlight.paperId} <ExternalLink className="size-3.5" aria-hidden="true" /></a></div>
    </header>

    <div className="site-shell grid gap-12 py-10 md:py-14 lg:grid-cols-[200px_minmax(0,840px)] lg:gap-16 xl:gap-24">
      <aside aria-label={copy("In this article", "글 목차")}>
        <nav className="lg:sticky lg:top-36"><h2 className="text-eyebrow">{copy("IN THIS ARTICLE", "글 목차")}</h2><ol className="mt-5 flex flex-wrap gap-x-6 gap-y-4 lg:flex-col">{articleSections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="text-sm leading-6 text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><span className="mr-3 font-mono text-xs">0{index + 1}</span>{copy(section.en, section.ko)}</a></li>)}</ol></nav>
      </aside>

      <article className="min-w-0">
        {highlight.editorialStatus === "metadata-digest" && <p className="mb-6 border-l-2 border-signal-orbit bg-surface-01 px-5 py-4 text-sm leading-7 text-text-secondary">{copy("Preliminary metadata highlight. This article began from the Hugging Face AI summary and is not an independently verified deep review. The experiment and critical-analysis sections disclose what remains unchecked.", "메타데이터 기반 예비 하이라이트입니다. Hugging Face AI 요약에서 출발한 글로 독립 검증을 거친 심층 리뷰는 아닙니다. 실험·비판적 분석 항목에 확인되지 않은 근거를 명시했습니다.")}</p>}
        <div className="flex flex-wrap items-start gap-4 border-l-2 border-signal-mint bg-surface-01 px-5 py-5 sm:px-6"><Star className="mt-0.5 size-4 shrink-0 text-signal-mint" aria-hidden="true" /><div><p className="text-eyebrow text-signal-mint">{copy("WHY THIS PAPER", "선정 이유")}</p><p className="mt-2 text-sm leading-7 text-text-secondary">{text(highlight.selectionReason)}</p></div></div>

        <figure className="mt-8 overflow-hidden border border-border-default bg-surface-01">
          <a href={highlight.figure.url} target="_blank" rel="noopener noreferrer" aria-label={copy("Open the original paper figure at full size", "논문 원본 그림을 크게 보기")} className="group relative block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal-ice">
            {!imageFailed ? <Image src={highlight.figure.url} width={highlight.figure.width} height={highlight.figure.height} alt={text(highlight.figure.alt)} unoptimized priority onError={() => setImageFailed(true)} className="h-auto w-full" /> : <div className="flex min-h-64 items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--color-surface-03),_var(--color-background))]"><span className="font-mono text-xs tracking-[0.25em] text-signal-ice">{copy("ORIGINAL PAPER FIGURE", "논문 원문 그림")}</span></div>}
            <span className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 border border-border-default bg-background px-3 text-xs text-text-primary"><ExternalLink className="size-3.5" aria-hidden="true" /> {copy("Open original", "원문 크게 보기")}</span>
          </a>
          <figcaption className="border-t border-border-subtle px-5 py-4"><p className="text-eyebrow text-signal-ice">{copy("AUTHORS’ FIGURE · REUSED FROM HUGGING FACE", "저자 원문 그림 · Hugging Face에서 재사용")}</p><p className="mt-2 text-sm leading-6 text-text-secondary">{text(highlight.figure.caption)}</p></figcaption>
        </figure>

        <section id="paper-summary" aria-labelledby="summary-title" className="scroll-mt-24 border-b border-border-subtle py-10">
          <p className="text-eyebrow text-signal-ice">01 / {copy("EXECUTIVE SUMMARY", "핵심 요약")}</p><h2 id="summary-title" className="text-headline mt-4">{copy("Executive Summary", "핵심 요약")}</h2><p className="mt-5 text-body-lg leading-8 text-text-secondary">{text(highlight.summary)}</p><p className="mt-4 text-xs leading-6 text-text-secondary">{text(highlight.summaryAttribution)}</p>
        </section>

        {highlight.sections.map((section, index) => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24 border-b border-border-subtle py-10 md:py-12">
          <p className="text-eyebrow text-signal-ice">0{index + 2} / {copy(articleSections[index + 1].en, articleSections[index + 1].ko)}</p><h2 id={`${section.id}-title`} className="text-headline mt-4">{copy(articleSections[index + 1].en, articleSections[index + 1].ko)}</h2><h3 className="mt-3 text-base font-medium text-text-primary">{text(section.heading)}</h3><div className="mt-5 space-y-5">{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="text-body leading-8 text-text-secondary">{text(paragraph)}</p>)}</div>
        </section>)}

        <aside className="my-10 border border-signal-orbit/50 bg-surface-01 p-6 md:p-8"><p className="text-eyebrow text-signal-orbit">{copy("THE ENGINEERING TAKEAWAY", "엔지니어를 위한 한 줄")}</p><p className="mt-4 text-body-lg leading-8 text-text-primary">{text(highlight.takeaway)}</p></aside>

        <section id="terminology" aria-labelledby="terminology-title" className="scroll-mt-24 border-b border-border-subtle py-10 md:py-12">
          <p className="text-eyebrow">{copy("READ. UNDERSTAND. USE.", "읽고, 이해하고, 활용하기")}</p><h2 id="terminology-title" className="text-display-lg mt-4">{copy("Terminology", "용어 정리")}</h2><p className="mt-4 text-sm leading-7 text-text-secondary">{copy("Short definitions for the terms used in the paper and this review.", "논문과 이 글에 나온 기술 용어를 짧게 정리했습니다.")}</p>
          <dl className="mt-8 border-t border-border-default">{highlight.terminology.map((entry) => <div key={entry.term} className="border-b border-border-subtle py-6"><dt className="text-sm font-medium">{entry.term}<span lang="ko" className="ml-3 font-normal text-text-secondary">{entry.koTerm}</span></dt><dd className="mt-3 text-sm leading-7 text-text-secondary">{text(entry.description)}<p className="mt-2"><span className="text-signal-ice">{copy("Example / ", "예시 / ")}</span>{text(entry.example)}</p></dd></div>)}</dl>
        </section>

        <section id="sources" aria-labelledby="sources-title" className="scroll-mt-24 border-b border-border-subtle py-10 md:py-12">
          <p className="text-eyebrow">09 / {copy("GO TO THE SOURCE", "원문과 자료 확인하기")}</p><h2 id="sources-title" className="text-headline mt-4">{copy("References & Resources", "참고 자료와 리소스")}</h2><ol className="mt-6 border-t border-border-default">{highlight.sources.map((source, index) => <li key={source.url} className="border-b border-border-subtle py-5"><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-sm text-text-primary underline decoration-border-default underline-offset-4 hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><span className="font-mono text-xs text-text-secondary">0{index + 1}</span>{text(source.label)}<ArrowUpRight className="size-4 text-signal-ice" aria-hidden="true" /></a><p className="mt-1 pl-8 text-xs text-text-secondary">{source.publisher}</p></li>)}</ol>
        </section>

        <Link href="/daily-brief/highlight/" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-signal-ice hover:text-text-primary focus-visible:outline-2 focus-visible:outline-signal-ice"><ArrowLeft className="size-4" aria-hidden="true" /> {copy("Back to all highlights", "전체 하이라이트로 돌아가기")}</Link>
      </article>
    </div>
  </div>;
}
