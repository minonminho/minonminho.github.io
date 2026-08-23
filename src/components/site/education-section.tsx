import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/site/section-heading";
import { education, sectionTitles } from "@/lib/data";

export function EducationSection() {
  return (
    <section
      id="education"
      className="mx-auto max-w-7xl scroll-mt-20 px-6 lg:px-12"
    >
      <SectionHeading title={sectionTitles.education} />
      <FadeInStagger>
        {education.map((item) => (
          <FadeInItem key={item.year}>
            <div className="grid gap-1 border-t border-hairline py-6 first:border-hairline last:border-b last:border-hairline md:grid-cols-[160px_1fr] md:gap-8">
              <p className="text-caption pt-1">{item.year}</p>
              <div>
                <p className="text-xl font-[540] tracking-tight">{item.degree}</p>
                <p className="text-body-sm font-[330]">{item.school}</p>
              </div>
            </div>
          </FadeInItem>
        ))}
      </FadeInStagger>
    </section>
  );
}
