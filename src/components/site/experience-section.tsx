import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { jobs, sectionTitles } from "@/lib/data";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="site-shell section-space scroll-mt-20"
    >
      <SectionHeading title={sectionTitles.workHistory} />

      <FadeInStagger>
        {jobs.map((job) => (
          <FadeInItem key={`${job.period}-${job.title}`}>
            <article className="grid gap-3 border-t border-border-subtle py-8 last:border-b md:grid-cols-[180px_1fr] md:gap-10">
              <p className="text-caption pt-1 text-text-secondary">{job.period}</p>
              <div>
                <h3 className="text-headline">{job.title}</h3>
                <p className="text-body-sm mt-1 text-text-secondary">{job.company}</p>
                {job.badge && (
                  <Badge variant="secondary" className="mt-4">
                    {job.badge}
                  </Badge>
                )}
                <ul className="mt-6 space-y-5">
                  {job.bullets.map((bullet) => (
                    <li key={bullet.heading} className="text-body-sm grid gap-1 md:grid-cols-[220px_1fr] md:gap-6">
                      <p className="font-medium text-text-primary">{bullet.heading}</p>
                      <p className="text-text-secondary">{bullet.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </FadeInItem>
        ))}
      </FadeInStagger>
    </section>
  );
}
