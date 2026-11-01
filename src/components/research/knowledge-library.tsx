"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { useResearchLanguage } from "./language";
import type { LinkedConcept } from "@/lib/research/types";

export function ResearchKnowledge({ concepts }: { concepts: LinkedConcept[] }) {
  const { language, local, copy } = useResearchLanguage();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => concepts.filter((item) =>
    [item.name.en, item.name.ko, item.plain.en, item.plain.ko, item.background.en, item.background.ko]
      .join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  ), [concepts, query]);

  return <main lang={language} className={language === "ko" ? "site-shell flex-1 break-keep py-14 md:py-20" : "site-shell flex-1 py-14 md:py-20"}>
    <header className="border-b-2 border-border-strong pb-12">
      <p className="text-eyebrow text-signal-mint">RESEARCH / LEARNING COMPANION</p>
      <h1 className="text-display-xl mt-6">Knowledge<span className="text-signal-ice">.</span></h1>
      <p className="mt-6 max-w-3xl text-subhead">{copy(
        "The background knowledge you need to understand the papers you read. Every concept is linked to its source paper, with a definition, a prerequisite, and a worked example.",
        "읽고 있는 논문을 이해하는 데 필요한 배경지식을 모았습니다. 모든 개념은 원문 논문에 연결되며, 쉬운 정의·선행 지식·예시를 제공합니다."
      )}</p>
    </header>
    <label className="mt-9 flex min-h-12 items-center gap-3 border border-border-default bg-surface-01 px-4">
      <Search className="size-4 text-text-tertiary" aria-hidden="true" />
      <span className="sr-only">{copy("Search concepts", "개념 검색")}</span>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy("Search terminology and background knowledge", "전문 용어와 배경지식 검색")} className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary" />
    </label>
    <p className="mt-5 font-mono text-xs text-text-tertiary">{filtered.length} {copy("LINKED CONCEPTS", "개념")}</p>
    <div className="mt-5 divide-y divide-border-subtle border-y border-border-subtle">
      {filtered.map((concept, index) => <section id={concept.id} key={concept.id} className="scroll-mt-24 py-10 md:grid md:grid-cols-[70px_minmax(0,1fr)] md:gap-6">
        <span className="font-mono text-xs text-signal-ice">{String(index + 1).padStart(2, "0")}</span>
        <div className="mt-3 md:mt-0">
          <h2 className="text-headline">{local(concept.name)}</h2>
          <p className="mt-4 text-body leading-8 text-text-primary">{local(concept.plain)}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><h3 className="text-eyebrow text-signal-mint">{copy("BACKGROUND", "선행 지식")}</h3><p className="mt-2 text-sm leading-7 text-text-secondary">{local(concept.background)}</p></div>
            <div><h3 className="text-eyebrow text-signal-mint">{copy("EXAMPLE", "예시")}</h3><p className="mt-2 text-sm leading-7 text-text-secondary">{local(concept.example)}</p></div>
          </div>
          <p className="mt-5 text-sm leading-7 text-text-secondary">{copy("In the paper: ", "이 논문에서: ")}{local(concept.why)}</p>
          <Link href={"/daily-brief/" + concept.paperSlug + "/"} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm text-signal-ice underline underline-offset-4">{concept.paperTitle}<ArrowUpRight className="size-4" /></Link>
        </div>
      </section>)}
      {filtered.length === 0 && <p className="py-12 text-sm text-text-secondary">{copy("No matching concepts found.", "검색 조건에 맞는 개념이 없습니다.")}</p>}
    </div>
  </main>;
}
