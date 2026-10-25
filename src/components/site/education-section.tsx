import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { ProfileSection } from "@/components/site/profile-section";
import { education, sectionTitles } from "@/lib/data";

export function EducationSection() {
  return (
    <ProfileSection id="education" title={sectionTitles.education} index="05" accent="ice">
      <FadeInStagger>
        {education.map((item) => (
          <FadeInItem key={item.year}>
            <div className="profile-entry">
              <p className="text-xs leading-6 text-text-tertiary">{item.year}</p>
              <div>
                <p className="text-lg font-medium leading-7 tracking-tight">{item.degree}</p>
                <p className="text-body-sm mt-1 text-text-secondary">{item.school}</p>
                {item.content && (
                  <div className="mt-4 max-w-4xl space-y-2 text-text-secondary">
                    {item.content.map((para, i) => (
                      <p key={i} className="text-body">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FadeInItem>
        ))}
      </FadeInStagger>
    </ProfileSection>
  );
}
