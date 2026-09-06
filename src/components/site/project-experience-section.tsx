import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { projects, sectionTitles } from "@/lib/data";

export function ProjectExperienceSection() {
  return (
    <section
      id="projects"
      className="site-shell section-space scroll-mt-20"
    >
      <SectionHeading title={sectionTitles.projectExperience} />

      <FadeInStagger>
        {projects.map((project) => (
          <FadeInItem key={`${project.period}-${project.title}`}>
            <article className="grid gap-3 border-t border-border-subtle py-8 last:border-b md:grid-cols-[180px_1fr] md:gap-10">
              <p className="text-caption pt-1 text-text-secondary">{project.period}</p>
              <div>
                <h3 className="text-headline">{project.title}</h3>
                {project.subtitle && (
                  <p className="text-body-sm mt-1 font-medium text-text-secondary">
                    {project.subtitle}
                  </p>
                )}
                <div className="mt-4 max-w-4xl space-y-3 text-text-secondary">
                  {project.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="text-body-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {project.href && project.ctaLabel && (
                  <Button asChild variant="outline" size="sm" className="mt-5">
                    <Link href={project.href}>
                      {project.ctaLabel}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </div>
            </article>
          </FadeInItem>
        ))}
      </FadeInStagger>
    </section>
  );
}
