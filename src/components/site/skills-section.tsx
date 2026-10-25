import { SkillExplorer } from "@/components/site/skill-explorer";
import { ProfileSection } from "@/components/site/profile-section";
import { sectionTitles, skillGroups } from "@/lib/data";

export function SkillsSection() {
  return (
    <ProfileSection id="skills" title={sectionTitles.skills} index="02" accent="mint">
      <SkillExplorer groups={skillGroups} />
    </ProfileSection>
  );
}
