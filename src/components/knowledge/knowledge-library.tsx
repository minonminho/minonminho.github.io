"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { useBriefLanguage } from "@/components/daily-brief/language";
import type { KnowledgeConceptSummary, KnowledgeTermIndexRecord } from "@/lib/knowledge/types";

export function KnowledgeLibrary({ concepts, terms = [], apiBaseUrl = "" }: { concepts: KnowledgeConceptSummary[]; terms?: KnowledgeTermIndexRecord[]; apiBaseUrl?: string }) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [remoteConcepts, setRemoteConcepts] = useState<KnowledgeConceptSummary[]>([]);
  const [remoteTerms, setRemoteTerms] = useState<KnowledgeTermIndexRecord[]>([]);
  const { language, copy } = useBriefLanguage();
  useEffect(() => {
    if (!apiBaseUrl) return;
    const controller = new AbortController();
    fetch(`${apiBaseUrl.replace(/\/$/, "")}/knowledge/concepts`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ concepts: KnowledgeConceptSummary[] }> : Promise.reject(new Error("Knowledge unavailable")))
      .then((value) => setRemoteConcepts(value.concepts))
      .catch(() => setRemoteConcepts([]));
    fetch(`${apiBaseUrl.replace(/\/$/, "")}/knowledge/terms`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ terms: KnowledgeTermIndexRecord[] }> : Promise.reject(new Error("Knowledge terms unavailable")))
      .then((value) => setRemoteTerms(value.terms))
      .catch(() => setRemoteTerms([]));
    return () => controller.abort();
  }, [apiBaseUrl]);
  const allConcepts = useMemo(() => {
    const byId = new Map(concepts.map((concept) => [concept.id, concept]));
    for (const concept of remoteConcepts) if (!byId.has(concept.id)) byId.set(concept.id, concept);
    return [...byId.values()];
  }, [concepts, remoteConcepts]);
  const domains = useMemo(() => [...new Set(allConcepts.flatMap((concept) => concept.domain))].sort(), [allConcepts]);
  const visible = useMemo(() => allConcepts.filter((concept) => {
    const text = [concept.canonicalName.en, concept.canonicalName.ko, concept.dek.en, concept.dek.ko, ...concept.aliases, ...concept.domain].join(" ").toLocaleLowerCase();
    return text.includes(query.trim().toLocaleLowerCase()) && (domain === "all" || concept.domain.includes(domain));
  }), [allConcepts, domain, query]);
  const allTerms = useMemo(() => {
    const byId = new Map(terms.map((term) => [term.id, term]));
    for (const term of remoteTerms) if (!byId.has(term.id)) byId.set(term.id, term);
    return [...byId.values()].filter((term) => term.briefStatus !== "published").sort((a, b) => b.priorityScore - a.priorityScore);
  }, [remoteTerms, terms]);
  const visibleTerms = useMemo(() => allTerms.filter((term) =>
    [term.canonicalName.en, term.canonicalName.ko, term.definition.en, term.definition.ko, ...term.aliases].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  ), [allTerms, query]);

  return <>
    <div className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
      <label className="flex min-h-12 items-center gap-3 border border-border-default bg-surface-01 px-4">
        <Search className="size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        <span className="sr-only">{copy("Search concepts", "개념 검색")}</span>
        <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={copy("Search concepts or aliases", "개념 또는 별칭 검색")} className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary" />
      </label>
      <label className="flex min-h-12 items-center gap-3 border border-border-default bg-surface-01 px-4 text-xs text-text-secondary">
        <span>{copy("Domain", "분야")}</span>
        <select value={domain} onChange={(event) => setDomain(event.currentTarget.value)} className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none">
          <option value="all">{copy("All domains", "전체 분야")}</option>
          {domains.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
    </div>
    <p className="mt-4 font-mono text-[11px] text-text-tertiary">{String(visible.length).padStart(2, "0")} {copy("CONCEPTS", "개념")}</p>
    <div className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
      {visible.map((concept, index) => <article key={concept.id} className="grid gap-5 py-6 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-start">
        <p className="font-mono text-xs text-signal-ice">{String(index + 1).padStart(2, "0")}</p>
        <div>
          <div className="flex flex-wrap items-center gap-3"><h2 className="text-card-title text-text-primary">{concept.canonicalName[language]}</h2>{concept.domain.map((item) => <span key={item} className="border border-border-default px-2 py-1 font-mono text-[10px] text-text-tertiary">{item}</span>)}</div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">{concept.dek[language]}</p>
          <p className="mt-3 text-xs text-text-tertiary">{copy("Linked paper", "연결 논문")}: {concept.sourcePapers.join(", ")}</p>
        </div>
        <Link href={`/knowledge/article/?slug=${encodeURIComponent(concept.slug)}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-signal-ice hover:text-text-primary focus-visible:outline-2 focus-visible:outline-signal-ice">
          {copy("Open brief", "Brief 읽기")} <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </article>)}
      {visible.length === 0 && <p className="py-12 text-sm text-text-secondary">{copy("No concepts match this search.", "검색 조건에 맞는 개념이 없습니다.")}</p>}
    </div>
    <section className="mt-14" aria-labelledby="indexed-terms-heading">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <p className="text-eyebrow text-signal-mint">INDEX FIRST / GENERATE SELECTIVELY</p>
          <h2 id="indexed-terms-heading" className="text-card-title mt-3 text-text-primary">{copy("Indexed terminology", "색인된 용어")}</h2>
        </div>
        <p className="font-mono text-[11px] text-text-tertiary">{String(visibleTerms.length).padStart(2, "0")} {copy("UNPUBLISHED TERMS", "Brief 미작성 용어")}</p>
      </header>
      <div className="divide-y divide-border-subtle">
        {visibleTerms.map((term) => <article key={term.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div>
            <h3 className="text-base font-semibold text-text-primary">{term.canonicalName[language]}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-text-secondary">{term.definition[language]}</p>
            {term.aliases.length > 0 && <p className="mt-2 text-xs text-text-tertiary">{copy("Also known as", "별칭")}: {term.aliases.join(" · ")}</p>}
          </div>
          <span className="w-fit border border-border-default px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
            {term.briefStatus === "awaiting_configuration" ? copy("AI config pending", "AI 설정 대기") : term.briefStatus === "processing" ? copy("Generating", "생성 중") : term.briefStatus === "failed" ? copy("Review needed", "확인 필요") : term.briefStatus === "indexed" ? copy("Indexed", "색인 완료") : copy("Queued", "대기 중")}
          </span>
        </article>)}
        {visibleTerms.length === 0 && <p className="py-8 text-sm text-text-secondary">{copy("No queued terms match this search.", "검색 조건에 맞는 대기 용어가 없습니다.")}</p>}
      </div>
    </section>
  </>;
}
