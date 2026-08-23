import { FadeIn } from "@/components/motion/fade-in";
import { ColorBlock } from "@/components/site/color-block";
import { SectionHeading } from "@/components/site/section-heading";
import { sectionTitles, skillGroups } from "@/lib/data";

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="mx-auto max-w-7xl scroll-mt-20 px-0 md:px-6 lg:px-12"
    >
      <ColorBlock tone="lime">
        <SectionHeading title={sectionTitles.skills} />
        {/* 카테고리 라벨 = {typography.caption}(mono taxonomy), 항목 = canvas pill */}
        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((group) => (
            <FadeIn key={group.label}>
              <p className="text-caption mb-4">{group.label}</p>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center rounded-full bg-canvas px-4 py-2 text-body-sm font-[330]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
          ))}
        </div>
      </ColorBlock>
    </section>
  );
}
