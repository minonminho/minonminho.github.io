import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { sectionTitles, skillGroups } from "@/lib/data";

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="site-shell section-space scroll-mt-20"
    >
      <SectionHeading title={sectionTitles.skills} />
      <div className="grid gap-8 md:grid-cols-3 md:gap-6">
        {skillGroups.map((group) => (
          <FadeIn key={group.label} className="border-t border-border-subtle pt-4">
            <p className="text-caption">{group.label}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item}>
                  <Badge variant="outline">{item}</Badge>
                </li>
              ))}
            </ul>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
