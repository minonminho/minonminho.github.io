"use client";

import { useState } from "react";
import { useBriefLanguage } from "./language";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { BriefSummary } from "@/lib/daily-brief/types";
import { formatBriefDate } from "@/lib/daily-brief/types";

export function BriefArchive({ issues }: { issues: BriefSummary[] }) {
  const { language, text, copy } = useBriefLanguage();
  const topicLabel = (name: string) => copy(name, ({"All topics":"전체 주제", "Models & tools":"모델·도구", "Workflows":"구현·활용", "Systems & inference":"시스템·추론", "Research":"연구"} as Record<string,string>)[name] ?? name);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All topics");
  const topics = ["All topics", ...new Set(issues.flatMap((issue) => issue.topics))];
  const filtered = issues.filter((issue) =>
    (topic === "All topics" || issue.topics.includes(topic)) &&
    `${issue.title.ko} ${issue.title.en} ${issue.dek.ko} ${issue.dek.en} ${issue.date} ${issue.topics.map(topicLabel).join(" ")} ${issue.topics.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section id="archive" aria-labelledby="archive-title" className="site-shell section-space">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div><p className="text-eyebrow">{copy("The reading room", "지난 브리핑")}</p><h2 id="archive-title" className="text-display-lg mt-3">{copy("All editions", "전체 브리핑")}</h2></div>
        <div className="w-full sm:w-80">
          <label htmlFor="brief-search" className="mb-2 block text-xs text-text-secondary">{copy("Search by topic, title, or date", "주제·제목·날짜로 검색")}</label>
          <div className="flex items-center gap-3 border border-border-default px-3 focus-within:border-signal-ice">
            <Search className="size-4 shrink-0 text-text-secondary" aria-hidden="true" />
            <input id="brief-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy("Search editions", "브리핑 검색")} className="min-h-11 w-full min-w-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary" />
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={copy("Filter editions by topic", "주제별로 보기")}>
        {topics.map((name) => <button type="button" key={name} aria-pressed={topic === name} onClick={() => setTopic(name)} className={`min-h-10 border px-4 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-ice ${topic === name ? "border-signal-ice text-signal-ice" : "border-border-subtle text-text-secondary hover:border-border-default"}`}>{topicLabel(name)}</button>)}
      </div>
      <p className="mt-6 text-xs text-text-secondary" role="status">{copy(`${filtered.length} ${filtered.length === 1 ? "edition" : "editions"}`, `브리핑 ${filtered.length}개`)}</p>
      <div className="mt-4 border-t border-border-default">
        {filtered.map((issue) => <Link key={issue.date} href={`/daily-brief/${issue.date}/`} className="group grid gap-4 border-b border-border-subtle py-7 transition-colors hover:bg-surface-01 focus-visible:outline-2 focus-visible:outline-signal-ice md:grid-cols-[160px_minmax(0,1fr)_40px] md:gap-8">
          <div className="text-xs leading-6 text-text-secondary"><time dateTime={issue.date} className="font-mono">{formatBriefDate(issue.date, false, language)}</time><p>{copy(`${issue.readingMinutes} min read`, `약 ${issue.readingMinutes}분 읽기`)}</p><p>{copy("Updated", "최종 수정")} <time dateTime={issue.updatedAt}>{formatBriefDate(issue.updatedAt, false, language)}</time></p></div>
          <div><h3 className="text-headline group-hover:text-signal-ice">{text(issue.title)}</h3><p className="mt-3 max-w-3xl text-body text-text-secondary">{text(issue.dek)}</p><p className="mt-4 text-xs text-signal-ice">{issue.topics.map(topicLabel).join(" / ")}</p></div>
          <ArrowUpRight className="size-5 text-text-secondary md:justify-self-end" aria-hidden="true" />
        </Link>)}
        {filtered.length === 0 && <div className="py-16"><p className="text-body text-text-secondary">{copy("No editions match your search.", "검색 결과가 없습니다.")}</p><button type="button" onClick={() => { setQuery(""); setTopic("All topics"); }} className="mt-4 min-h-10 text-sm text-signal-ice underline underline-offset-4">{copy("Clear filters", "검색 초기화")}</button></div>}
      </div>
    </section>
  );
}
