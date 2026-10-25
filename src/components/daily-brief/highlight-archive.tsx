"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useBriefLanguage } from "./language";
import { PaperHighlightCard } from "./highlight-card";
import type { HighlightSummary } from "@/lib/daily-brief/highlights";

export function HighlightArchive({ highlights }: { highlights: HighlightSummary[] }) {
  const { language, copy } = useBriefLanguage();
  return <main lang={language} className={`site-shell flex-1 pb-20 pt-12 md:pb-28 md:pt-16 ${language === "ko" ? "break-keep" : ""}`}>
    <Link href="/daily-brief/" className="inline-flex min-h-10 items-center gap-2 text-sm text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><ArrowLeft className="size-4" aria-hidden="true" /> {copy("Daily Brief", "Daily Brief로 돌아가기")}</Link>
    <div className="mt-10 border-b-2 border-border-strong pb-10"><p className="text-eyebrow text-signal-ice">{copy("ONE PAPER TO START WITH", "먼저 읽을 논문 한 편")}</p><h1 className="text-display-xl mt-5">{copy("Paper Highlights", "논문 하이라이트")}</h1><p className="mt-5 max-w-2xl text-subhead">{copy("A blog-style read on one notable paper, selected from the daily list. The archive keeps a record so a paper is not featured twice.", "Daily 논문 중 한 편을 골라 블로그 글처럼 읽습니다. 이미 소개한 논문은 이 기록과 대조해 다시 고르지 않습니다.")}</p></div>
    <div className="mt-8 flex items-center justify-between gap-4 text-xs text-text-secondary"><p>{copy("HIGHLIGHT ARCHIVE", "하이라이트 기록")}</p><p className="font-mono">{String(highlights.length).padStart(2, "0")} {copy(highlights.length === 1 ? "ARTICLE" : "ARTICLES", "편")}</p></div>
    <div className="mt-4 space-y-5">{highlights.map((highlight) => <PaperHighlightCard key={highlight.paperId} highlight={highlight} />)}</div>
  </main>;
}
