import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/site/section-heading";
import { education, sectionTitles } from "@/lib/data";

export function EducationSection() {
  return (
    <section
      id="education"
      className="site-shell section-space scroll-mt-20"
    >
      <SectionHeading title={sectionTitles.education} />
      <FadeInStagger>
        {education.map((item) => (
          <FadeInItem key={item.year}>
            <div className="grid gap-3 border-t border-border-subtle py-8 last:border-b md:grid-cols-[180px_1fr] md:gap-10">
              <p className="text-caption pt-1 text-text-secondary">{item.year}</p>
              <div>
                <p className="text-headline">{item.degree}</p>
                <p className="text-body-sm mt-1 text-text-secondary">{item.school}</p>
                {item.content && (
                  <div className="mt-4 max-w-4xl space-y-2 text-text-secondary">
                    {item.content.map((para, i) => (
                      <p key={i} className="text-body-sm">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FadeInItem>
        ))}
      </FadeInStagger>
    </section>
  );
}
