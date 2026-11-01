"use client";
import Link from "next/link";
import { ArrowUpRight, BookOpen, GraduationCap } from "lucide-react";
import { useResearchLanguage } from "./language";
import type { ResearchReview } from "@/lib/research/types";

export function ResearchHome({ reviews }: { reviews: ResearchReview[] }) {
  const { language, local, copy } = useResearchLanguage();
  const latest = reviews[0];
  return <main lang={language} className={language === "ko" ? "flex-1 break-keep" : "flex-1"}>
    <header className="site-shell border-b-2 border-border-strong pb-12 pt-16 md:pb-16 md:pt-24">
      <p className="text-eyebrow text-signal-mint">{copy("ONE PAPER. EVERY DAY. UNDERSTAND IT DEEPLY.", "하루 한 편, 깊이 있게 이해하는 AI 논문")}</p>
      <h1 className="text-display-xl mt-7">Daily Brief<span className="text-signal-ice">.</span></h1>
      <p className="mt-7 max-w-3xl text-subhead">{copy(
        "One important AI paper, analyzed in depth. Understand its motivation, mechanism, experiments, and limits. Tap any marked term for the background you need.",
        "매일 중요한 AI 논문 한 편을 깊이 읽습니다. 연구 배경부터 작동 원리, 실험, 한계까지 분석하고 모르는 용어는 눌러서 바로 배웁니다."
      )}</p>
    </header>
    {latest ? <section className="site-shell border-b border-border-subtle py-14 md:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-eyebrow text-signal-ice">{copy("LATEST RESEARCH DEEP DIVE", "최신 논문 심층 분석")}</p>
        <time className="font-mono text-xs text-text-secondary" dateTime={latest.date}>{latest.date}</time>
      </div>
      <p className="mt-8 text-sm text-signal-mint">{latest.paper.title}</p>
      <h2 className="text-display-lg mt-5 max-w-4xl">{local(latest.headline)}</h2>
      <p className="mt-6 max-w-3xl text-body-lg text-text-secondary">{local(latest.abstract)}</p>
      <p className="mt-6 font-mono text-xs text-text-tertiary">{latest.readingMinutes} MIN READ <span className="mx-3">/</span> {latest.sections.length} CHAPTERS <span className="mx-3">/</span> {latest.concepts.length} CONCEPTS</p>
      <Link className="mt-8 inline-flex min-h-12 items-center gap-3 border-b border-signal-ice text-sm font-semibold text-signal-ice hover:text-text-primary" href={"/daily-brief/" + latest.slug + "/"}>
        {copy("Read the full paper analysis", "논문 전체 분석 읽기")} <ArrowUpRight className="size-4" />
      </Link>
      <p className="mt-7 max-w-3xl border-l-2 border-border-default pl-4 text-xs leading-6 text-text-secondary">{local(latest.selection)}</p>
    </section> : <section className="site-shell py-20">
      <h2 className="text-headline">{copy("The first reviewed paper will appear here.", "첫 번째 검토 완료 논문이 이곳에 올라옵니다.")}</h2>
      <p className="mt-4 text-text-secondary">{copy("We publish only when the original evidence has been checked.", "원문 근거를 확인한 글만 게시합니다.")}</p>
    </section>}
    <section className="site-shell grid gap-8 border-b border-border-subtle py-14 md:grid-cols-2">
      <div className="border border-border-subtle bg-surface-01 p-6">
        <BookOpen className="size-5 text-signal-mint" />
        <h2 className="mt-5 text-headline">{copy("Understand the paper", "논문을 제대로 읽기")}</h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{copy("Background, mechanism, results, critical analysis, and engineering meaning—not a news roundup or a translated abstract.", "뉴스 모음이나 초록 번역이 아닌 배경·방법론·실험 결과·비판적 분석·구현 의미까지 읽습니다.")}</p>
      </div>
      <Link href="/knowledge/" className="group border border-border-subtle bg-surface-01 p-6 hover:border-signal-ice">
        <GraduationCap className="size-5 text-signal-ice" />
        <h2 className="mt-5 flex items-center gap-2 text-headline">{copy("Learn as you read", "읽으면서 배우기")} <ArrowUpRight className="size-4" /></h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{copy("Definitions, prerequisites, examples, and AI-assisted questions are connected directly to the paper.", "용어의 뜻, 필요한 배경지식, 예시, AI 추가 질문을 논문과 직접 연결합니다.")}</p>
      </Link>
    </section>
    {reviews.length > 1 && <section className="site-shell py-14">
      <h2 className="text-headline">{copy("Previous research", "이전에 읽은 논문")}</h2>
      <div className="mt-5 divide-y divide-border-subtle border-t border-border-subtle">
        {reviews.slice(1).map((review) => <Link key={review.slug} href={"/daily-brief/" + review.slug + "/"} className="group flex items-start justify-between gap-6 py-6 hover:text-signal-ice">
          <div><p className="font-mono text-xs text-text-tertiary">{review.date}</p><h3 className="mt-2 text-lg font-medium">{review.paper.title}</h3><p className="mt-2 text-sm text-text-secondary">{local(review.headline)}</p></div><ArrowUpRight className="mt-2 size-4 shrink-0 text-text-tertiary" />
        </Link>)}
      </div>
    </section>}
  </main>;
}
