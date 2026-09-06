import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/site/section-heading";
import { profile, sectionTitles } from "@/lib/data";

export function AboutSection() {
  return (
    <section
      id="about"
      className="site-shell section-space scroll-mt-20"
    >
      <FadeIn>
        <SectionHeading title={sectionTitles.about} />
        <div className="space-y-6 text-text-secondary">
          {profile.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-body-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
