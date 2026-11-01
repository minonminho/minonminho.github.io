"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useBriefLanguage } from "./language";
import { PaperHighlightCard } from "./highlight-card";
import { PaperReviewCard } from "./paper-review-card";
import type { HighlightSummary } from "@/lib/daily-brief/highlights";
import type { PaperReviewSummary } from "@/lib/daily-brief/paper-reviews";

export function HighlightArchive({ reviews, highlights }: { reviews: PaperReviewSummary[]; highlights: HighlightSummary[] }) {
  const { language, copy } = useBriefLanguage();
  const published = reviews.filter((review) => review.reviewStatus === "published");
  const drafts = reviews.filter((review) => review.reviewStatus === "draft");

  return <main lang={language} className={`site-shell flex-1 pb-20 pt-12 md:pb-28 md:pt-16 ${language === "ko" ? "break-keep" : ""}`}>
    <Link href="/daily-brief/" className="inline-flex min-h-10 items-center gap-2 text-sm text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice">
      <ArrowLeft className="size-4" aria-hidden="true" />
      {copy("Back to Daily Brief", "Daily Brief로 돌아가기")}
    </Link>

    <header className="mt-10 border-b-2 border-border-strong pb-10">
      <p className="text-eyebrow text-signal-mint">{copy("PAPERS / HIGHLIGHTED", "논문 / 심층 리뷰")}</p>
      <h1 className="text-display-xl mt-5">{copy("Highlighted Paper Reviews", "주요 논문 심층 리뷰")}<span className="text-signal-ice">.</span></h1>
      <p className="mt-5 max-w-3xl text-subhead">
        {copy(
          "In-depth reviews of selected research papers. Older, automatically summarized highlights are kept below as preliminary reading, not presented as completed reviews.",
          "주요 논문을 선정해 깊이 있게 분석한 글을 모았습니다. 과거 자동 요약 기반 하이라이트는 완료된 리뷰와 구분해 아래에 보관합니다."
        )}
      </p>
    </header>

    <section className="py-10 md:py-14" aria-labelledby="highlight-reviewed-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <p className="text-eyebrow text-signal-mint">{copy("SOURCE-REVIEWED ARTICLES", "원문 검토를 거친 리뷰")}</p>
          <h2 id="highlight-reviewed-title" className="text-headline mt-2">{copy("Published reviews", "게시된 심층 리뷰")}</h2>
        </div>
        <span className="font-mono text-xs text-text-tertiary">{String(published.length).padStart(2, "0")}</span>
      </div>
      {published.length > 0
        ? <div className="grid gap-5">{published.map((review) => <PaperReviewCard key={review.canonicalId} review={review} />)}</div>
        : <p className="border border-border-subtle bg-surface-01 px-5 py-5 text-sm leading-7 text-text-secondary">
            {copy("No completed highlighted reviews have been published yet. Drafts and earlier previews are listed separately below.", "아직 게시 완료된 심층 리뷰는 없습니다. 검토 중인 초안과 과거 예비 하이라이트는 아래에 구분해 표시합니다.")}
          </p>}
    </section>

    {drafts.length > 0 && <section className="border-t border-border-subtle py-10 md:py-14" aria-labelledby="highlight-drafts-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <p className="text-eyebrow text-signal-ice">{copy("WORK IN PROGRESS", "작성 중")}</p>
          <h2 id="highlight-drafts-title" className="text-headline mt-2">{copy("Review drafts", "심층 리뷰 초안")}</h2>
        </div>
        <span className="font-mono text-xs text-text-tertiary">{String(drafts.length).padStart(2, "0")}</span>
      </div>
      <div className="grid gap-5">{drafts.map((review) => <PaperReviewCard key={review.canonicalId} review={review} />)}</div>
    </section>}

    {highlights.length > 0 && <section className="border-t border-border-subtle py-10 md:py-14" aria-labelledby="highlight-legacy-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <p className="text-eyebrow text-text-secondary">{copy("PREVIOUS FORMAT", "이전 형식")}</p>
          <h2 id="highlight-legacy-title" className="text-headline mt-2">{copy("Earlier paper highlights", "과거 논문 하이라이트")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
            {copy("Retained for reading history. Articles marked preliminary were derived from paper summaries and are not verified in-depth reviews.", "읽기 기록 보존을 위한 이전 형식의 글입니다. 예비 하이라이트는 요약을 기반으로 작성되어 원문 검증을 마친 심층 리뷰가 아닙니다.")}
          </p>
        </div>
        <span className="font-mono text-xs text-text-tertiary">{String(highlights.length).padStart(2, "0")}</span>
      </div>
      <div className="grid gap-5">{highlights.map((highlight) => <PaperHighlightCard key={highlight.paperId} highlight={highlight} />)}</div>
    </section>}
  </main>;
}
