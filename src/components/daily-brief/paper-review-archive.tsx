"use client";

import { PaperReviewCard } from "@/components/daily-brief/paper-review-card";
import type { PaperReviewSummary } from "@/lib/daily-brief/paper-reviews";
import { useBriefLanguage } from "@/components/daily-brief/language";

export function PaperReviewArchive({ reviews }: { reviews: PaperReviewSummary[] }) {
  const { language, copy } = useBriefLanguage();
  const daily = reviews.filter((review) => review.sourceType === "huggingface-daily");
  const foundational = reviews.filter((review) => review.sourceType === "foundational-seed");

  return <main lang={language} className={`site-shell flex-1 pb-20 pt-10 md:pb-28 md:pt-14 ${language === "ko" ? "break-keep" : ""}`}>
    <header className="border-b-2 border-border-strong pb-9 md:pb-12">
      <p className="text-eyebrow text-signal-mint">SIDE PROJECT / DAILY BRIEF / PAPERS</p>
      <h1 className="text-display-xl mt-5">{copy("Daily Paper Briefs", "Daily Paper Briefs")}<span className="text-signal-ice">.</span></h1>
      <p className="mt-5 max-w-3xl text-subhead">{copy("Concise, bilingual reviews of research papers. Foundation papers are labeled separately from Hugging Face Daily rankings.", "논문을 영어와 한국어로 간결하게 정리합니다. 기반 논문과 Hugging Face Daily 순위 논문을 구분해 표시합니다.")}</p>
      <p className="mt-4 font-mono text-[11px] text-text-tertiary">{copy(`${reviews.length} PAPER BRIEFS`, `논문 Brief ${reviews.length}편`)}</p>
    </header>

    {daily.length > 0 && <section className="py-10 md:py-14" aria-labelledby="huggingface-papers-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-4"><div><p className="text-eyebrow text-signal-mint">HUGGING FACE / DAILY</p><h2 id="huggingface-papers-heading" className="text-headline mt-2">{copy("Daily selections", "Daily 선정 논문")}</h2></div><span className="font-mono text-xs text-text-tertiary">{String(daily.length).padStart(2, "0")}</span></div>
      <div className="grid gap-5">{daily.map((review) => <PaperReviewCard key={review.canonicalId} review={review} />)}</div>
    </section>}

    {foundational.length > 0 && <section id="foundational-papers" className="scroll-mt-28 border-t border-border-subtle py-10 md:py-14" aria-labelledby="foundational-papers-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-4"><div><p className="text-eyebrow text-signal-ice">FOUNDATIONAL READING SERIES</p><h2 id="foundational-papers-heading" className="text-headline mt-2">{copy("Foundational papers", "기반 논문")}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">{copy("A curated seed list for building a reusable AI terminology base. These reviews carry no Daily Paper rank.", "재사용 가능한 AI 용어 Knowledge의 토대가 되는 Seed 논문입니다. Hugging Face Daily 순위를 부여하지 않습니다.")}</p></div><span className="font-mono text-xs text-text-tertiary">{String(foundational.length).padStart(2, "0")}</span></div>
      <div className="grid gap-5">{foundational.map((review) => <PaperReviewCard key={review.canonicalId} review={review} />)}</div>
    </section>}
  </main>;
}
