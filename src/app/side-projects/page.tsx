import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { DailyBriefProjectCard } from "@/components/site/daily-brief-project-card";
import { sectionTitles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Side Project · Minho Lee",
  description: "Independent explorations of AI and useful tools, including bilingual Daily Brief editions and paper highlights.",
};

export default function SideProjectsPage() {
  return (
    <>
      <Navbar showCvDownload={false} />
      <main className="flex-1">
        <section className="site-shell border-b border-border-subtle py-16 md:py-20" aria-labelledby="side-projects-title">
          <Link href="/" className="editorial-link min-h-10 text-sm text-text-secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to profile</Link>
          <p className="text-eyebrow mt-10">Independent explorations</p>
          <h1 id="side-projects-title" className="text-display-lg mt-4">{sectionTitles.sideProjects}</h1>
          <p className="text-subhead mt-6 max-w-2xl">Small projects exploring AI, useful tools, and the way we work.</p>
        </section>
        <section className="site-shell grid gap-6 py-12 md:grid-cols-2 md:py-16" aria-label="Side projects">
          <DailyBriefProjectCard />
        </section>
      </main>
      <Footer />
    </>
  );
}
