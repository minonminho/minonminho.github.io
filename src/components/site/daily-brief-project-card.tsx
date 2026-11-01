import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

export function DailyBriefProjectCard() {
  return (
    <Link href="/daily-brief/" className="summary-panel group block transition-colors hover:border-signal-mint focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-mint">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex size-11 items-center justify-center rounded-lg border border-border-subtle bg-surface-02 text-signal-mint"><BookOpen className="size-5" aria-hidden="true" /></span>
        <ArrowUpRight className="size-5 text-text-tertiary transition-colors group-hover:text-signal-mint" aria-hidden="true" />
      </div>
      <p className="text-caption mt-6">AI paper deep dive / English + 한국어</p>
      <h2 className="mt-3 text-2xl font-medium tracking-tight">Daily Brief</h2>
      <p className="text-body mt-4 text-text-secondary">One important AI research paper every day. Read a detailed technical analysis, then click unfamiliar concepts to learn their meaning, background, and practical examples.</p>
      <span className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-signal-mint">Read Daily Brief<ArrowUpRight className="size-4" aria-hidden="true" /></span>
    </Link>
  );
}
