import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { ColorBlock } from "@/components/site/color-block";
import { SectionHeading } from "@/components/site/section-heading";
import { jobs, sectionTitles } from "@/lib/data";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="mx-auto max-w-7xl scroll-mt-20 px-0 md:px-6 lg:px-12"
    >
      {/* DESIGN-figma.md color-block-section-navy: 유일한 역상 스토리 블록 */}
      <ColorBlock tone="navy">
        <SectionHeading title={sectionTitles.workHistory} />

        <FadeInStagger>
          {jobs.map((job) => (
            <FadeInItem key={`${job.period}-${job.title}`}>
              <article className="grid gap-1 border-t border-white/25 py-6 first:border-t last:border-b last:border-t-0 md:grid-cols-[160px_1fr] md:gap-8">
                <p className="text-caption pt-1">{job.period}</p>
                <div>
                  <h3 className="text-headline">{job.title}</h3>
                  <p className="text-body-sm font-[330]">{job.company}</p>
                  {job.badge && (
                    <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-[450]">
                      {job.badge}
                    </span>
                  )}
                  <ul className="mt-5 space-y-4">
                    {job.bullets.map((bullet) => (
                      <li
                        key={bullet.heading}
                        className="text-body-sm relative pl-5 before:absolute before:left-0 before:top-1.5 before:content-['–']"
                      >
                        <p className="font-[480]">{bullet.heading}</p>
                        <p className="mt-0.5 font-[330]">{bullet.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </ColorBlock>
    </section>
  );
}
