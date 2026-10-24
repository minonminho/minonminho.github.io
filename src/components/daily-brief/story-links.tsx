import { ArrowUpRight, BookOpen, Code2, FileText, Link2 } from "lucide-react";
import type { Brief, BriefItem } from "@/lib/daily-brief/types";

const resourceLabels = { paper: "Paper / PDF", code: "Code", docs: "Docs", demo: "Demo", benchmark: "Benchmark" };

export function StoryLinks({ item, sources }: { item: BriefItem; sources: Brief["sources"] }) {
  return <div className="mt-5 space-y-3">
    {item.sourceIds.map((id, index) => {
      const source = sources.find((entry) => entry.id === id)!;
      return <a key={id} href={source.url} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[minmax(0,1fr)_20px] gap-4 border border-border-subtle border-l-2 border-l-signal-ice bg-surface-01 px-4 py-4 transition-colors hover:border-signal-ice focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-ice">
        <span><span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-signal-ice"><BookOpen className="size-3.5" aria-hidden="true" />{index === 0 ? "Read original" : "Related original"} · {source.publisher}</span><span className="mt-2 block text-sm leading-6 text-text-primary group-hover:text-signal-ice">{source.title}</span><span className="mt-1 block text-xs text-text-secondary">{new URL(source.url).hostname}</span></span>
        <ArrowUpRight className="mt-1 size-4 text-signal-ice" aria-hidden="true" />
      </a>;
    })}
    {item.resources.length > 0 && <div className="flex flex-wrap gap-2 pt-1" aria-label="Paper, code, and documentation links">{item.resources.map((resource) => {
      const Icon = resource.kind === "code" ? Code2 : resource.kind === "paper" ? FileText : Link2;
      return <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-border-default px-3 py-2 text-xs leading-5 text-text-secondary transition-colors hover:border-signal-ice hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-ice"><Icon className="size-4 shrink-0" aria-hidden="true" /><span><span className="text-signal-ice">{resourceLabels[resource.kind]} / </span>{resource.title}</span><ArrowUpRight className="size-3 shrink-0" aria-hidden="true" /></a>;
    })}</div>}
  </div>;
}
