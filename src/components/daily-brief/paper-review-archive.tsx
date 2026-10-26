"use client";

import { PaperReviewCard } from "@/components/daily-brief/paper-review-card";
import type { PaperReviewSummary } from "@/lib/daily-brief/paper-reviews";
import { useBriefLanguage } from "@/components/daily-brief/language";

export function PaperReviewArchive({ reviews }: { reviews: PaperReviewSummary[] }) {
  const { language, copy } = useBriefLanguage();
  const daily = reviews.filter((review) => review.sourceType === "huggingface-daily");
  const weekly = reviews.filter((review) => review.sourceType === "huggingface-weekly");
  const monthly = reviews.filter((review) => review.sourceType === "huggingface-monthly");
  const foundational = reviews.filter((review) => review.sourceType === "foundational-seed");
  const sections = [
    { id: "daily-papers-heading", eyebrow: "HUGGING FACE / DAILY", title: copy("Daily selections", "Daily 선정 논문"), empty: copy("No Daily briefs are published yet. The next update runs at 06:00 KST.", "아직 Daily Brief가 없습니다. 다음 갱신은 한국 시간 오전 6시입니다."), items: daily, className: "" },
    { id: "weekly-papers-heading", eyebrow: "HUGGING FACE / WEEKLY", title: copy("Weekly selections", "Weekly 선정 논문"), empty: copy("No Weekly briefs are published yet. The next update runs Tuesday at 07:00 KST.", "아직 Weekly Brief가 없습니다. 다음 갱신은 한국 시간 화요일 오전 7시입니다."), items: weekly, className: "border-t border-border-subtle" },
    { id: "monthly-papers-heading", eyebrow: "HUGGING FACE / MONTHLY", title: copy("Monthly selections", "Monthly 선정 논문"), empty: copy("No Monthly briefs are published yet. The next update runs on the 7th at 08:00 KST.", "아직 Monthly Brief가 없습니다. 다음 갱신은 매월 7일 한국 시간 오전 8시입니다."), items: monthly, className: "border-t border-border-subtle" },
  ];

  return <main lang={language} className={`site-shell flex-1 pb-20 pt-10 md:pb-28 md:pt-14 ${language === "ko" ? "break-keep" : ""}`}>
    <header className="border-b-2 border-border-strong pb-9 md:pb-12">
      <p className="text-eyebrow text-signal-mint">SIDE PROJECT / DAILY BRIEF / PAPERS</p>
      <h1 className="text-display-xl mt-5">{copy("Daily Paper Briefs", "Daily Paper Briefs")}<span className="text-signal-ice">.</span></h1>
      <p className="mt-5 max-w-3xl text-subhead">{copy("Bilingual research notes. Automated Hugging Face selections are labeled metadata digests, not independent paper reviews.", "영어·한국어 논문 읽기 자료입니다. Hugging Face 자동 수집 글은 독립적인 리뷰와 구분해 메타데이터 요약으로 표시합니다.")}</p>
      <p className="mt-4 font-mono text-[11px] text-text-tertiary">{copy(`${reviews.length} PAPER BRIEFS`, `논문 Brief ${reviews.length}편`)}</p>
    </header>

    {sections.map((section) => <section key={section.id} className={`py-10 md:py-14 ${section.className}`} aria-labelledby={section.id}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-4"><div><p className="text-eyebrow text-signal-mint">{section.eyebrow}</p><h2 id={section.id} className="text-headline mt-2">{section.title}</h2></div><span className="font-mono text-xs text-text-tertiary">{String(section.items.length).padStart(2, "0")}</span></div>
      {section.items.length > 0 ? <div className="grid gap-5">{section.items.map((review) => <PaperReviewCard key={review.canonicalId} review={review} />)}</div> : <p className="border border-border-subtle bg-surface-01 px-5 py-4 text-sm leading-7 text-text-secondary">{section.empty}</p>}
    </section>)}

    {foundational.length > 0 && <section id="foundational-papers" className="scroll-mt-28 border-t border-border-subtle py-10 md:py-14" aria-labelledby="foundational-papers-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-4"><div><p className="text-eyebrow text-signal-ice">FOUNDATIONAL READING SERIES</p><h2 id="foundational-papers-heading" className="text-headline mt-2">{copy("Foundational papers", "기반 논문")}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">{copy("A curated seed list for building a reusable AI terminology base. These reviews carry no Daily Paper rank.", "재사용 가능한 AI 용어 Knowledge의 토대가 되는 Seed 논문입니다. Hugging Face Daily 순위를 부여하지 않습니다.")}</p></div><span className="font-mono text-xs text-text-tertiary">{String(foundational.length).padStart(2, "0")}</span></div>
      <div className="grid gap-5">{foundational.map((review) => <PaperReviewCard key={review.canonicalId} review={review} />)}</div>
    </section>}
  </main>;
}
