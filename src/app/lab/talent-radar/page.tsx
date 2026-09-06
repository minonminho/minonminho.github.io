import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { TalentRadarDemo } from "@/components/site/talent-radar-demo";

export const metadata: Metadata = {
  title: "Talent Radar · Minho Lee",
  description:
    "Find high-signal talent using public evidence, deterministic filtering, and selective AI reasoning.",
};

export default function TalentRadarPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="site-shell section-space border-b-2 border-border-strong">
          <Link
            href="/lab"
            className="inline-flex items-center gap-2 text-body-sm font-medium text-text-secondary underline-offset-4 hover:text-signal-ice hover:underline focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            AX Lab
          </Link>
          <div className="reading-width mt-12">
            <h1 className="text-display-lg">Talent Radar</h1>
            <p className="text-subhead mt-6">
              Find high-signal talent using public evidence, deterministic filtering, and selective AI reasoning.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-sm border border-border-subtle bg-surface-01 px-3 py-1.5 text-caption text-text-secondary">
                PUBLIC-SOURCE PATTERN
              </span>
              <span className="rounded-sm border border-border-subtle bg-surface-01 px-3 py-1.5 text-caption text-text-secondary">
                DETERMINISTIC FIRST
              </span>
              <span className="rounded-sm border border-border-subtle bg-surface-01 px-3 py-1.5 text-caption text-text-secondary">
                HUMAN IN THE LOOP
              </span>
            </div>
          </div>
        </section>

        <TalentRadarDemo />
      </main>

      <Footer />
    </>
  );
}
