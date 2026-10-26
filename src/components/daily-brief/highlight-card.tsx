"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { useState } from "react";
import { useBriefLanguage } from "./language";
import type { HighlightSummary } from "@/lib/daily-brief/highlights";
import { formatBriefDate } from "@/lib/daily-brief/types";

export function PaperHighlightCard({ highlight, featured = false }: { highlight: HighlightSummary; featured?: boolean }) {
  const { language, text, copy } = useBriefLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  return <Link href={`/daily-brief/highlight/${highlight.date}/`} className={`group grid overflow-hidden border border-border-default bg-surface-01 transition-colors hover:border-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice ${featured ? "lg:grid-cols-[1.05fr_1fr]" : "sm:grid-cols-[240px_minmax(0,1fr)]"}`}>
    <div className={`relative overflow-hidden bg-surface-02 ${featured ? "aspect-[2/1] lg:aspect-auto lg:min-h-[330px]" : "aspect-[2/1] sm:aspect-auto sm:min-h-[160px]"}`}>
      {!imageFailed ? <Image src={highlight.figure.url} width={highlight.figure.width} height={highlight.figure.height} alt={text(highlight.figure.alt)} unoptimized loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : <div className="flex h-full min-h-40 items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--color-surface-03),_var(--color-background))]"><span className="font-mono text-xs tracking-[0.25em] text-signal-ice">{copy("ORIGINAL PAPER FIGURE", "논문 원문 그림")}</span></div>}
      <span className="absolute left-4 top-4 inline-flex items-center gap-2 border border-signal-ice/50 bg-background/90 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-signal-ice"><Star className="size-3" aria-hidden="true" /> {highlight.editorialStatus === "metadata-digest" ? copy("Preliminary spotlight", "예비 하이라이트") : copy("Paper highlight", "논문 하이라이트")}</span>
    </div>
    <div className={`flex flex-col justify-center ${featured ? "p-6 md:p-10" : "p-6"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] tracking-wide text-text-secondary"><span className="text-signal-mint">HF DAILY #{highlight.dailyRank}</span><span aria-hidden="true">/</span><time dateTime={highlight.dailyDate}>{formatBriefDate(highlight.dailyDate, false, language)}</time><span aria-hidden="true">/</span><span>{highlight.upvotesAtSelection} {copy("upvotes", "표")}</span></div>
      <h2 className={`${featured ? "text-display-lg" : "text-headline"} mt-5 max-w-2xl leading-tight group-hover:text-signal-ice`}>{text(highlight.title)}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">{text(highlight.dek)}</p>
      <span className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-signal-ice">{highlight.editorialStatus === "metadata-digest" ? copy("Read preliminary article", "예비 분석 읽기") : copy("Read the spotlight", "하이라이트 읽기")} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /></span>
    </div>
  </Link>;
}
