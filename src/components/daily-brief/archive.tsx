"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { BriefSummary } from "@/lib/daily-brief/types";
import { formatBriefDate } from "@/lib/daily-brief/types";

export function BriefArchive({ issues }: { issues: BriefSummary[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All topics");
  const topics = ["All topics", ...new Set(issues.flatMap((issue) => issue.topics))];
  const filtered = issues.filter((issue) =>
    (topic === "All topics" || issue.topics.includes(topic)) &&
    `${issue.title} ${issue.dek} ${issue.date} ${issue.topics.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section id="archive" aria-labelledby="archive-title" className="site-shell section-space">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div><p className="text-eyebrow">The reading room</p><h2 id="archive-title" className="text-display-lg mt-3">All editions</h2></div>
        <div className="w-full sm:w-80">
          <label htmlFor="brief-search" className="mb-2 block text-xs text-text-secondary">Search by topic, title, or date</label>
          <div className="flex items-center gap-3 border border-border-default px-3 focus-within:border-signal-ice">
            <Search className="size-4 shrink-0 text-text-secondary" aria-hidden="true" />
            <input id="brief-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search editions" className="min-h-11 w-full min-w-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary" />
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter editions by topic">
        {topics.map((name) => <button type="button" key={name} aria-pressed={topic === name} onClick={() => setTopic(name)} className={`min-h-10 border px-4 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-ice ${topic === name ? "border-signal-ice text-signal-ice" : "border-border-subtle text-text-secondary hover:border-border-default"}`}>{name}</button>)}
      </div>
      <p className="mt-6 text-xs text-text-secondary" role="status">{filtered.length} {filtered.length === 1 ? "edition" : "editions"}</p>
      <div className="mt-4 border-t border-border-default">
        {filtered.map((issue) => <Link key={issue.date} href={`/daily-brief/${issue.date}/`} className="group grid gap-4 border-b border-border-subtle py-7 transition-colors hover:bg-surface-01 focus-visible:outline-2 focus-visible:outline-signal-ice md:grid-cols-[160px_minmax(0,1fr)_40px] md:gap-8">
          <div className="text-xs leading-6 text-text-secondary"><time dateTime={issue.date} className="font-mono">{formatBriefDate(issue.date)}</time><p>{issue.readingMinutes} min read</p></div>
          <div><h3 className="text-headline group-hover:text-signal-ice">{issue.title}</h3><p className="mt-3 max-w-3xl text-body text-text-secondary">{issue.dek}</p><p className="mt-4 text-xs text-signal-ice">{issue.topics.join(" / ")}</p></div>
          <ArrowUpRight className="size-5 text-text-secondary md:justify-self-end" aria-hidden="true" />
        </Link>)}
        {filtered.length === 0 && <div className="py-16"><p className="text-body text-text-secondary">No editions match your search.</p><button type="button" onClick={() => { setQuery(""); setTopic("All topics"); }} className="mt-4 min-h-10 text-sm text-signal-ice underline underline-offset-4">Clear filters</button></div>}
      </div>
    </section>
  );
}
