import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { StoryFigure } from "@/components/daily-brief/story-figure";
import { BriefArchive } from "@/components/daily-brief/archive";
import { getBriefs, getBriefSummaries } from "@/lib/daily-brief/content";
import { formatBriefDate, readingMinutes } from "@/lib/daily-brief/types";

export const metadata = {
  title: "Daily Brief · Minho Lee",
  description: "AI trends through an engineer's lens: models, developer tools, inference, and practical experiments. In English, with Korean vocabulary notes.",
};

export default function DailyBriefPage() {
  const latest = getBriefs()[0];
  const leadVisual = latest?.sections.flatMap((section) => section.items).find((item) => item.visual.image)?.visual;
  return <>
    <Navbar showCvDownload={false} />
    <main id="brief-main" className="flex-1">
      <section className="site-shell border-b-2 border-border-strong pb-16 pt-16 md:pb-20 md:pt-24">
        <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-eyebrow">AI / Engineering notes</p><p className="font-mono text-[11px] tracking-wider text-text-secondary">ENGLISH / 한국어 NOTES</p></div>
        <h1 className="text-display-xl mt-8">Daily Brief<span className="text-signal-ice">.</span></h1>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-2xl text-subhead">What changed in AI. How it works. What you can build.<br className="hidden sm:block" /> Models, developer tools, inference, and experiments worth running.</p>
          <a href="#archive" className="inline-flex min-h-10 items-center gap-3 text-sm text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice">Explore the archive <ArrowDown className="size-4" aria-hidden="true" /></a>
        </div>
      </section>
      {latest ? <section className="site-shell section-space border-b border-border-subtle" aria-labelledby="latest-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <p className="text-eyebrow flex flex-wrap items-center gap-x-4 gap-y-2"><span className="text-signal-mint">Latest edition</span><span aria-hidden="true">/</span><time dateTime={latest.date}>{formatBriefDate(latest.date)}</time></p>
            <h2 id="latest-title" className="text-display-lg mt-6 max-w-xl"><Link href={`/daily-brief/${latest.date}/`} className="hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice">{latest.title}</Link></h2>
            <p className="mt-6 max-w-xl text-body-lg text-text-secondary">{latest.dek}</p>
            <p className="mt-8 font-mono text-xs text-text-secondary">{readingMinutes(latest)} MIN READ <span className="mx-3 text-text-tertiary">/</span> {latest.glossary.length} VOCABULARY NOTES</p>
            <Link href={`/daily-brief/${latest.date}/`} className="mt-8 inline-flex min-h-11 items-center gap-8 border-b border-signal-ice text-sm font-medium text-signal-ice transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-ice">Read the brief <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <StoryFigure visual={leadVisual ?? { variant: latest.visual, caption: latest.focus, image: null }} source={latest.sources.find((source) => source.id === leadVisual?.image?.sourceId)} />
        </div>
      </section> : <section className="site-shell section-space"><h2 className="text-headline">The first edition is on its way.</h2><p className="mt-4 text-text-secondary">Published briefs will appear here, with sources and Korean vocabulary notes.</p></section>}
      <BriefArchive issues={getBriefSummaries()} />
      <section className="border-t border-border-subtle bg-surface-01"><div className="site-shell grid gap-6 py-10 md:grid-cols-[1fr_2fr]"><h2 className="text-eyebrow">A note on the brief</h2><p className="max-w-2xl text-sm leading-7 text-text-secondary">Primary sources first. Announcements and actual availability are kept separate. Interpretation is labeled, older context is dated, and quiet news days stay quiet. Technical terms link to plain Korean explanations.</p></div></section>
    </main>
    <Footer />
  </>;
}
