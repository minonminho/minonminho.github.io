import {
  profile,
  skillGroups,
  jobs,
  projects,
  education,
  sectionTitles,
} from "@/lib/data";

/**
 * Print-only CV document. Hidden on screen, shown when printing (CV Download button → window.print()).
 * Formal black & white template, compact type, print-friendly layout.
 */
export function CvDocument() {
  return (
    <div className="hidden print:block print:bg-white print:text-black">
      <div className="mx-auto max-w-[780px] p-6 text-[11px] leading-relaxed text-black">
        {/* Header */}
        <div className="mb-4 border-b border-black pb-2">
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          <p className="text-base font-semibold">{profile.title}</p>
          <p className="mt-1 text-[10px]">
            {profile.email} · {profile.location}
          </p>
        </div>

        {/* Professional Summary */}
        <section className="mb-4">
          <h2 className="mb-1 border-b border-gray-400 text-sm font-bold uppercase tracking-wide">
            {sectionTitles.about}
          </h2>
          {profile.summary.map((para, i) => (
            <p key={i} className="mb-1">
              {para}
            </p>
          ))}
        </section>

        {/* Core Skills */}
        <section className="mb-4">
          <h2 className="mb-1 border-b border-gray-400 text-sm font-bold uppercase tracking-wide">
            {sectionTitles.skills}
          </h2>
          {skillGroups.map((group) => (
            <p key={group.label} className="mb-0.5">
              <span className="font-bold">{group.label}:</span>{" "}
              {group.items.join(", ")}
            </p>
          ))}
        </section>

        {/* Work History */}
        <section className="mb-4">
          <h2 className="mb-1 border-b border-gray-400 text-sm font-bold uppercase tracking-wide">
            {sectionTitles.workHistory}
          </h2>
          {jobs.map((job) => (
            <div key={job.period} className="mb-2 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-bold">
                  {job.title}
                  {job.badge ? ` (${job.badge})` : ""}
                </span>
                <span className="whitespace-nowrap text-[10px]">{job.period}</span>
              </div>
              <p className="mb-1 text-[10px] italic">{job.company}</p>
              <ul className="ml-4 list-disc">
                {job.bullets.map((bullet) => (
                  <li key={bullet.heading} className="mb-0.5">
                    <span className="font-semibold">{bullet.heading}.</span>{" "}
                    {bullet.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Project Experience */}
        <section className="mb-4">
          <h2 className="mb-1 border-b border-gray-400 text-sm font-bold uppercase tracking-wide">
            {sectionTitles.projectExperience}
          </h2>
          {projects.map((project) => (
            <div key={project.title} className="mb-2 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-bold">{project.title}</span>
                <span className="whitespace-nowrap text-[10px]">{project.period}</span>
              </div>
              {project.paragraphs.map((para, i) => (
                <p key={i} className="mb-1">
                  {para}
                </p>
              ))}
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="mb-4">
          <h2 className="mb-1 border-b border-gray-400 text-sm font-bold uppercase tracking-wide">
            {sectionTitles.education}
          </h2>
          {education.map((edu) => (
            <div key={edu.year} className="mb-2 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-bold">{edu.degree}</span>
                <span className="whitespace-nowrap text-[10px]">{edu.year}</span>
              </div>
              <p className="mb-1 text-[10px] italic">{edu.school}</p>
              {edu.content?.map((para, i) => (
                <p key={i} className="mb-1">
                  {para}
                </p>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
