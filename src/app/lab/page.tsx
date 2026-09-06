import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

const labProjects = [
  {
    id: "01",
    title: "Talent Radar",
    subtitle: "AI-powered Talent Sourcing & Intelligence",
    description:
      "A lightweight talent intelligence prototype that combines deterministic filtering, public professional signals, and selective AI reasoning to identify high-signal candidates while minimizing token usage.",
    href: "/lab/talent-radar",
  },
] as const;

export const metadata = {
  title: "Lab · Minho Lee",
  description:
    "How can a 1-person HR team operate like a 5-person HR team with AI?",
};

export default function LabPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="site-shell section-space border-b-2 border-border-strong">
          <div>
            <div className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-body-sm font-medium text-text-secondary underline-offset-4 hover:text-signal-ice hover:underline focus-visible:outline-none"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Profile
              </Link>
            </div>
            <h1 className="text-display-lg mt-12">
              How can a 1-person HR team operate like a 5-person HR team with
              AI?
            </h1>
            <p className="text-subhead mt-6">
              An ongoing exploration of how thoughtful systems and AI can
              multiply the impact of a lean HR team.
            </p>
          </div>
        </section>

        <section className="site-shell section-space">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-display-lg">In the lab</h2>
            </div>
            <p className="text-body-sm max-w-md text-text-secondary">
              Small, practical experiments in HR systems and AI.
            </p>
          </div>

          <div className="mt-12 border-t border-border-subtle">
            {labProjects.map((project) => (
              <Link
                key={project.href}
                href={project.href}
                className="group grid gap-4 border-b border-border-subtle py-6 transition-colors duration-150 hover:bg-surface-01 focus-visible:bg-surface-01 focus-visible:outline-none md:grid-cols-[80px_minmax(0,1fr)_auto] md:items-start md:gap-8"
              >
                <p className="text-caption pt-1">{project.id}</p>
                <div>
                  <h3 className="text-headline transition-colors duration-150 group-hover:text-signal-ice">
                    {project.title}
                  </h3>
                  <p className="text-caption mt-2">{project.subtitle}</p>
                  <p className="text-body-sm mt-4 max-w-3xl text-text-secondary">
                    {project.description}
                  </p>
                </div>
                <ArrowUpRight
                  className="size-5 text-text-tertiary transition-colors duration-150 group-hover:text-signal-ice md:mt-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-body-sm font-medium text-text-secondary underline-offset-4 hover:text-signal-ice hover:underline focus-visible:outline-none"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to profile
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
