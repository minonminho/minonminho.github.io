import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/site/section-heading";
import { profile, sectionTitles } from "@/lib/data";

export function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl scroll-mt-20 px-6 lg:px-12"
    >
      <FadeIn>
        <SectionHeading title={sectionTitles.about} />
        <div className="space-y-5">
          {profile.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-body-lg font-[330]">
              {paragraph}
            </p>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
