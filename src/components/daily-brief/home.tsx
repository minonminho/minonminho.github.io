"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { StoryFigure } from "@/components/daily-brief/story-figure";
import { BriefArchive } from "@/components/daily-brief/archive";
import { PaperHighlightCard } from "@/components/daily-brief/highlight-card";
import { useBriefLanguage } from "./language";
import type { Brief, BriefSummary } from "@/lib/daily-brief/types";
import type { HighlightSummary } from "@/lib/daily-brief/highlights";
import { formatBriefDate, readingMinutes } from "@/lib/daily-brief/types";

export function BriefHome({ latest, issues, spotlight }: { latest?: Brief; issues: BriefSummary[]; spotlight?: HighlightSummary }) {
  const { language, text, copy } = useBriefLanguage();
  const leadVisual = latest?.sections.flatMap((section) => section.items).find((item) => item.visual.image)?.visual;
  return <>
    <main lang={language} id="brief-main" className={`flex-1 ${language === "ko" ? "break-keep" : ""}`}>
      <section className="site-shell border-b-2 border-border-strong pb-16 pt-16 md:pb-20 md:pt-24">
        <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-eyebrow">{copy("AI / Engineering notes", "AI / 엔지니어링 브리핑")}</p><p className="font-mono text-[11px] tracking-wider text-text-secondary">{copy("ENGLISH / 한국어 NOTES", "한국어 / 영어 전환 가능")}</p></div>
        <h1 className="text-display-xl mt-8">Daily Brief<span className="text-signal-ice">.</span></h1>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-2xl text-subhead">{copy("What changed in AI. How it works. What you can build.", "AI의 변화, 작동 원리, 직접 구현할 수 있는 것.")}<br className="hidden sm:block" />{copy("Models, developer tools, inference, and experiments worth running.", "모델·개발 도구·추론 기술과 직접 해볼 실험을 정리합니다.")}</p>
          <a href="#archive" className="inline-flex min-h-10 items-center gap-3 text-sm text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice">{copy("Explore the archive", "지난 브리핑 보기")} <ArrowDown className="size-4" aria-hidden="true" /></a>
        </div>
      </section>
      {spotlight && <section className="site-shell border-b border-border-subtle py-12 md:py-16" aria-labelledby="spotlight-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-eyebrow text-signal-mint">{copy("Start here", "먼저 읽기")}</p><h2 id="spotlight-title" className="text-headline mt-2">{copy("Today’s paper highlight", "오늘의 논문 하이라이트")}</h2></div><Link href="/daily-brief/highlight/" className="min-h-10 text-sm text-text-secondary underline underline-offset-4 hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice">{copy("Highlight archive", "하이라이트 기록")} <span aria-hidden="true">↗</span></Link></div>
        <PaperHighlightCard highlight={spotlight} featured />
      </section>}
      {latest ? <section className="site-shell section-space border-b border-border-subtle" aria-labelledby="latest-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <p className="text-eyebrow flex flex-wrap items-center gap-x-4 gap-y-2"><span className="text-signal-mint">{copy("Latest edition", "최신 브리핑")}</span><span aria-hidden="true">/</span><time dateTime={latest.date}>{formatBriefDate(latest.date, false, language)}</time></p>
            <h2 id="latest-title" className={`text-display-lg mt-6 max-w-xl ${language === "ko" ? "leading-[1.3]" : ""}`}><Link href={`/daily-brief/${latest.date}/`} className="hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice">{text(latest.title)}</Link></h2>
            <p className="mt-6 max-w-xl text-body-lg text-text-secondary">{text(latest.dek)}</p>
            <p className="mt-8 font-mono text-xs text-text-secondary">{copy(`${readingMinutes(latest)} MIN READ`, `약 ${readingMinutes(latest)}분 읽기`)} <span className="mx-3 text-text-tertiary">/</span> {copy(`${latest.glossary.length} VOCABULARY NOTES`, `용어 설명 ${latest.glossary.length}개`)}</p>
            <Link href={`/daily-brief/${latest.date}/`} className="mt-8 inline-flex min-h-11 items-center gap-8 border-b border-signal-ice text-sm font-medium text-signal-ice transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-ice">{copy("Read the brief", "브리핑 읽기")} <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <StoryFigure visual={leadVisual ?? { variant: latest.visual, caption: latest.focus, image: null }} source={latest.sources.find((source) => source.id === leadVisual?.image?.sourceId)} />
        </div>
      </section> : <section className="site-shell section-space"><h2 className="text-headline">{copy("The first edition is on its way.", "첫 브리핑을 준비하고 있습니다.")}</h2><p className="mt-4 text-text-secondary">{copy("Published briefs will appear here, with sources and Korean vocabulary notes.", "원문 링크와 용어 설명을 포함한 브리핑이 이곳에 올라옵니다.")}</p></section>}
      <BriefArchive issues={issues} />
      <section className="border-t border-border-subtle bg-surface-01"><div className="site-shell grid gap-6 py-10 md:grid-cols-[1fr_2fr]"><h2 className="text-eyebrow">{copy("A note on the brief", "브리핑의 기준")}</h2><p className="max-w-2xl text-sm leading-7 text-text-secondary">{copy("Primary sources first. Announcements and actual availability are kept separate. Interpretation is labeled, older context is dated, and quiet news days stay quiet. Technical terms link to plain Korean explanations.", "공식 원문을 우선 확인하고 발표와 실제 사용 가능 여부를 구분합니다. 사실과 해석을 나누고, 과거 소식에는 날짜를 표시합니다. 전문 용어에는 쉬운 한국어 설명을 붙입니다.")}</p></div></section>
    </main>
  </>;
}
