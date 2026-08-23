import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { ColorBlock } from "@/components/site/color-block";
import { SectionHeading } from "@/components/site/section-heading";
import { projects, sectionTitles } from "@/lib/data";

export function ProjectExperienceSection() {
  return (
    <section
      id="projects"
      className="mx-auto max-w-7xl scroll-mt-20 px-0 md:px-6 lg:px-12"
    >
      <ColorBlock tone="cream">
        <SectionHeading title={sectionTitles.projectExperience} />

        <FadeInStagger>
          {projects.map((project) => (
            <FadeInItem key={`${project.period}-${project.title}`}>
              <article className="grid gap-1 border-t border-ink/15 py-6 first:border-t last:border-b last:border-t-0 md:grid-cols-[160px_1fr] md:gap-8">
                <p className="text-caption pt-1">{project.period}</p>
                <div>
                  <h3 className="text-headline">{project.title}</h3>
                  <div className="mt-3 space-y-3">
                    {project.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="text-body-sm font-[330]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </ColorBlock>
    </section>
  );
}
