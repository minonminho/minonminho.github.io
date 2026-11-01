"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, X } from "lucide-react";
import { useResearchLanguage } from "./language";
import type { ResearchConcept, ResearchReview } from "@/lib/research/types";

function Paragraph({ value, concepts, select }: { value: string; concepts: ResearchConcept[]; select: (concept: ResearchConcept) => void }) {
  return <p className="mt-5 text-base leading-8 text-text-secondary md:text-[17px]">
    {value.split(/(\[\[[^\]]+\]\])/g).map((part, index) => {
      const matched = /^\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]$/.exec(part);
      if (!matched) return <span key={index}>{part}</span>;
      const concept = concepts.find((item) => item.id === matched[1]);
      if (!concept) return <span key={index}>{matched[2] || matched[1]}</span>;
      return <button type="button" key={index} onClick={() => select(concept)}
        className="rounded-sm border-b border-dashed border-signal-ice font-medium text-signal-ice hover:text-text-primary focus-visible:outline-2 focus-visible:outline-signal-ice"
        aria-label={"Explain " + (matched[2] || concept.name.en)}>
        {matched[2] || concept.name.en}<sup className="ml-0.5 text-[10px]">?</sup>
      </button>;
    })}
  </p>;
}

export function ResearchReader({ review }: { review: ResearchReview }) {
  const { language, local, copy } = useResearchLanguage();
  const [selected, select] = useState<ResearchConcept | null>(null);
  const askQuestion = selected
    ? "I am reading '" + review.paper.title + "' (" + review.paper.sourceUrl + "). Explain '" + selected.name.en + "' step by step at beginner, intermediate and technical levels. Define prerequisites, give a worked example, explain its role in this paper, and distinguish paper claims from general background. Reply in " + (language === "ko" ? "Korean." : "English.")
    : "";

  return <main lang={language} className={language === "ko" ? "flex-1 break-keep" : "flex-1"}>
    <header className="site-shell border-b-2 border-border-strong pb-12 pt-12 md:pt-16">
      <Link className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-signal-ice" href="/daily-brief/"><ArrowLeft className="size-4" />{copy("All research", "Daily Brief로 돌아가기")}</Link>
      <div className="mt-10 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
        <span className="text-signal-mint">PAPER / DEEP DIVE</span><span>{review.date}</span><span>{review.readingMinutes} MIN READ</span><span>{review.concepts.length} KEY CONCEPTS</span>
      </div>
      <h1 className="text-display-xl mt-6 max-w-5xl">{local(review.headline)}</h1>
      <p className="mt-7 max-w-4xl text-subhead">{review.paper.title}</p>
      <p className="mt-5 max-w-4xl text-body-lg text-text-secondary">{local(review.abstract)}</p>
      <div className="mt-7 flex flex-wrap items-center gap-5 text-sm">
        <a href={review.paper.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-signal-ice underline underline-offset-4">{copy("Original paper", "논문 원문")} <ArrowUpRight className="size-4" /></a>
        <a href={review.paper.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-text-secondary underline underline-offset-4">{copy("Authors' project", "저자 프로젝트")} <ArrowUpRight className="size-4" /></a>
        <span className="text-xs text-text-tertiary">arXiv:{review.paper.arxivId}</span>
      </div>
      <div className="mt-8 border-l-2 border-signal-mint bg-surface-01 px-5 py-4 text-sm leading-7 text-text-secondary">{local(review.selection)}</div>
    </header>

    <div className="site-shell grid gap-12 py-12 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-16">
      <aside className="self-start lg:sticky lg:top-24">
        <p className="text-eyebrow text-signal-mint">{copy("IN THIS PAPER", "논문 목차")}</p>
        <nav aria-label={copy("Review chapters", "리뷰 목차")} className="mt-5 flex flex-wrap gap-4 lg:flex-col">
          {review.sections.map((section, i) => <a key={section.id} href={"#" + section.id} className="flex items-start gap-3 text-xs leading-6 text-text-secondary hover:text-signal-ice">
            <span className="font-mono text-signal-ice">{String(i + 1).padStart(2, "0")}</span><span>{local(section.title)}</span>
          </a>)}
        </nav>
        <p className="mt-8 hidden text-xs leading-6 text-text-tertiary lg:block">{copy("Underlined terms are interactive. Select any term to understand its background.", "밑줄 표시된 용어를 클릭하면 설명과 배경지식을 볼 수 있습니다.")}</p>
      </aside>

      <article className="min-w-0">
        <div className="border border-border-default bg-surface-01 px-5 py-5">
          <div className="flex items-center gap-3"><BookOpen className="size-4 text-signal-ice" /><p className="text-sm font-medium">{copy("Read with a learning companion", "개념 설명과 함께 읽기")}</p></div>
          <p className="mt-2 text-sm leading-7 text-text-secondary">{copy("Tap marked technical terms for a plain explanation, prerequisites, and examples. Continue with a contextual question in ChatGPT.", "표시된 전문 용어를 누르면 쉬운 설명과 선행 지식, 예시가 열립니다. ChatGPT에 해당 논문 맥락의 후속 질문도 할 수 있습니다.")}</p>
        </div>
        {review.sections.map((section, index) => <section className="scroll-mt-28 border-b border-border-subtle py-11 md:py-14" id={section.id} key={section.id}>
          <p className="font-mono text-xs text-signal-mint">{String(index + 1).padStart(2, "0")} / {section.evidence === "author" ? copy("PRIMARY SOURCES", "원문 근거") : copy("PAPER + ANALYSIS", "논문 + 해석")}</p>
          <h2 className="mt-4 text-headline">{local(section.title)}</h2>
          {section.paragraphs.map((paragraph, i) => <Paragraph key={i} value={local(paragraph)} concepts={review.concepts} select={select} />)}
        </section>)}
        <section className="py-12" aria-labelledby="research-sources">
          <h2 id="research-sources" className="text-headline">{copy("Source notebook", "원문 자료")}</h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">{copy("Measurements are attributed to the authors and are not a new benchmark reproduction.", "측정값은 저자 보고 내용이며 새로운 벤치마크 재현 결과가 아닙니다.")}</p>
          <ul className="mt-5 divide-y divide-border-subtle border-y border-border-subtle">
            {review.sources.map((source) => <li key={source.id} className="py-4"><a className="inline-flex items-center gap-2 text-sm text-signal-ice underline underline-offset-4" href={source.url} target="_blank" rel="noopener noreferrer">{source.name}<ArrowUpRight className="size-4" /></a></li>)}
          </ul>
        </section>
        <Link href="/knowledge/" className="inline-flex min-h-11 items-center gap-3 border-b border-signal-ice text-sm text-signal-ice">{copy("Explore the concepts in Knowledge", "Knowledge에서 개념 더 살펴보기")}<ArrowUpRight className="size-4" /></Link>
      </article>
    </div>

    {selected && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" onClick={() => select(null)}>
      <section role="dialog" aria-modal="true" aria-label={copy("Concept explained", "개념 설명")} className="max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-border-default bg-background px-6 py-7 shadow-2xl sm:rounded-lg sm:px-9" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-5">
          <div><p className="text-eyebrow text-signal-mint">KNOWLEDGE / CONTEXT</p><h2 className="text-headline mt-3">{local(selected.name)}</h2></div>
          <button className="flex size-10 shrink-0 items-center justify-center border border-border-default" aria-label={copy("Close explanation", "설명 닫기")} type="button" onClick={() => select(null)}><X className="size-4" /></button>
        </div>
        <p className="mt-6 text-base leading-8 text-text-primary">{local(selected.plain)}</p>
        <h3 className="text-eyebrow mt-8 text-signal-ice">{copy("PREREQUISITES", "이해에 필요한 배경")}</h3>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{local(selected.background)}</p>
        <h3 className="text-eyebrow mt-6 text-signal-ice">{copy("EXAMPLE", "구체적인 예시")}</h3>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{local(selected.example)}</p>
        <h3 className="text-eyebrow mt-6 text-signal-ice">{copy("IN THIS PAPER", "이 논문에서 중요한 이유")}</h3>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{local(selected.why)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={"https://chatgpt.com/?q=" + encodeURIComponent(askQuestion)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-signal-ice bg-signal-ice px-4 text-sm font-medium text-void">{copy("Ask AI about this", "AI에게 더 물어보기")}<ArrowUpRight className="size-4" /></a>
          <Link href={"/knowledge/#" + selected.id} onClick={() => select(null)} className="inline-flex min-h-11 items-center gap-2 border border-border-default px-4 text-sm text-text-secondary">{copy("Open in Knowledge", "Knowledge에서 보기")}</Link>
        </div>
        <p className="mt-4 text-xs leading-6 text-text-tertiary">{copy("ChatGPT opens with a prefilled question. Check any AI answer against the original paper.", "ChatGPT에 논문 맥락의 질문이 입력됩니다. AI 설명은 논문 원문과 대조하세요.")}</p>
      </section>
    </div>}
  </main>;
}
