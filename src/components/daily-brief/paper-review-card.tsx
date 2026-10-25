"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { useBriefLanguage } from "./language";
import type { PaperReviewSummary } from "@/lib/daily-brief/paper-reviews";
import { formatBriefDate } from "@/lib/daily-brief/types";

export function PaperReviewCard({ review, featured = false }: { review: PaperReviewSummary; featured?: boolean }) {
  const { language, text, copy } = useBriefLanguage();
  const isHuggingFace = review.sourceType.startsWith("huggingface-");
  const cadence = review.sourceType === "huggingface-weekly" ? copy("WEEKLY", "주간") : review.sourceType === "huggingface-monthly" ? copy("MONTHLY", "월간") : copy("DAILY", "일간");
  const period = review.periodLabel ?? review.dailyDate;
  const rank = review.periodRank ?? review.dailyRank;
  return <Link href={`/daily-brief/papers/${review.slug}/`} className={`group grid overflow-hidden border border-border-default bg-surface-01 transition-colors hover:border-signal-mint focus-visible:outline-2 focus-visible:outline-signal-mint ${featured ? "lg:grid-cols-[1.05fr_1fr]" : "sm:grid-cols-[240px_minmax(0,1fr)]"}`}>
    <div className={`relative overflow-hidden bg-surface-02 ${featured ? "aspect-[2/1] lg:aspect-auto lg:min-h-[330px]" : "aspect-[2/1] sm:aspect-auto sm:min-h-[160px]"}`}>
      <img src={review.hero.url} alt={text(review.hero.alt)} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
      <span className="absolute left-4 top-4 inline-flex items-center gap-2 border border-signal-mint/50 bg-background/90 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-signal-mint"><Star className="size-3" aria-hidden="true" /> {copy("First read", "먼저 읽기")}</span>
      {review.reviewStatus === "draft" && <span className="absolute bottom-3 right-3 border border-border-default bg-background/95 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-secondary">{copy("Test draft", "테스트 초안")}</span>}
    </div>
    <div className={`flex flex-col justify-center ${featured ? "p-6 md:p-10" : "p-6"}`}>
      {isHuggingFace ? <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] tracking-wide text-text-secondary"><span className="text-signal-mint">HF {cadence} #{rank}</span><span aria-hidden="true">/</span>{period && <time dateTime={period}>{review.sourceType === "huggingface-daily" ? formatBriefDate(period, false, language) : period}</time>}{review.upvotesAtSelection !== null && <><span aria-hidden="true">/</span><span>{review.upvotesAtSelection} {copy("upvotes at selection", "선정 당시 추천")}</span></>}</div> : <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] tracking-wide text-text-secondary"><span className="text-signal-mint">{copy("FOUNDATIONAL PAPER", "기반 논문")}</span><span aria-hidden="true">/</span><time dateTime={review.publishedDate}>{formatBriefDate(review.publishedDate, false, language)}</time></div>}
      <h2 className={`${featured ? "text-display-lg" : "text-headline"} mt-5 max-w-2xl leading-tight group-hover:text-signal-mint`}>{text(review.title)}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">{text(review.dek)}</p>
      <span className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-signal-mint">{copy("Read the review", "리뷰 읽기")} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /></span>
    </div>
  </Link>;
}
