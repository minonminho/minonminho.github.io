import { FadeInStagger, FadeInItem } from "@/components/motion/fade-in";
import { EntryDetails } from "@/components/site/entry-details";
import { ProfileSection } from "@/components/site/profile-section";
import { jobs, sectionTitles } from "@/lib/data";

export function ExperienceSection() {
  return (
    <ProfileSection id="experience" title={sectionTitles.workHistory} index="03" accent="orbit">
      <FadeInStagger className="space-y-3">
        {jobs.map((job, index) => (
          <FadeInItem key={`${job.period}-${job.title}`}>
            <EntryDetails title={job.title} period={job.period} subtitle={job.company} defaultOpen={index === 0}>
              {job.badge && (
                <p className="mt-3 text-xs font-medium text-signal-mint">
                  {job.badge}
                </p>
              )}
              <ul className="mt-5 space-y-5">
                {job.bullets.map((bullet) => (
                  <li key={bullet.heading} className="text-body grid gap-1">
                    <p className="font-medium text-text-primary">{bullet.heading}</p>
                    <p className="text-text-secondary">{bullet.description}</p>
                  </li>
                ))}
              </ul>
            </EntryDetails>
          </FadeInItem>
        ))}
      </FadeInStagger>
    </ProfileSection>
  );
}
