import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { AboutSection } from "@/components/site/about-section";
import { SkillsSection } from "@/components/site/skills-section";
import { ExperienceSection } from "@/components/site/experience-section";
import { ProjectExperienceSection } from "@/components/site/project-experience-section";
import { EducationSection } from "@/components/site/education-section";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* DESIGN-figma.md {spacing.section}: 주요 섹션 간 세로 리듬은 96px 통일 */}
      <main className="flex-1 space-y-24">
        <Hero />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectExperienceSection />
        <EducationSection />
      </main>
      <Footer />
    </>
  );
}
