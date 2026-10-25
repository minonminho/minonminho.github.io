import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { EntryDetails } from "@/components/site/entry-details";
import { ProfileSection } from "@/components/site/profile-section";
import { Button } from "@/components/ui/button";
import { projects, sectionTitles } from "@/lib/data";

export function ProjectExperienceSection() {
  return (
    <ProfileSection id="projects" title={sectionTitles.projectExperience} index="04" accent="dust">
      <FadeInStagger className="space-y-3">
        {projects.map((project, index) => (
          <FadeInItem key={`${project.period}-${project.title}`}>
            <EntryDetails title={project.title} period={project.period} subtitle={project.subtitle} defaultOpen={index === 0}>
              <div className="mt-4 max-w-4xl space-y-3 text-text-secondary">
                {project.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-body">
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
            </EntryDetails>
          </FadeInItem>
        ))}
      </FadeInStagger>
    </ProfileSection>
  );
}
