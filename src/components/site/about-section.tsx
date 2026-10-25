import { FadeIn } from "@/components/motion/fade-in";
import { ProfileSection } from "@/components/site/profile-section";
import { profile, sectionTitles } from "@/lib/data";

export function AboutSection() {
  return (
    <ProfileSection id="about" title={sectionTitles.about} index="01" accent="ice">
      <FadeIn className="summary-panel space-y-5 text-body text-text-secondary">
        {profile.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </FadeIn>
    </ProfileSection>
  );
}
