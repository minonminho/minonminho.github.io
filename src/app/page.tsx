import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { AboutSection } from "@/components/site/about-section";
import { SkillsSection } from "@/components/site/skills-section";
import { ExperienceSection } from "@/components/site/experience-section";
import { ProjectExperienceSection } from "@/components/site/project-experience-section";
import { EducationSection } from "@/components/site/education-section";
import { Footer } from "@/components/site/footer";
import { CvDocument } from "@/components/site/cv-document";

export default function Home() {
  return (
    <>
      {/* On-screen portfolio — hidden when printing so only the CV document is exported */}
      <div className="print:hidden">
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
      </div>

      {/* Print-only formal CV (CV Download button → window.print()) */}
      <CvDocument />
    </>
  );
}
