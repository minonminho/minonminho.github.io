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
      <div className="print:hidden flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
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
