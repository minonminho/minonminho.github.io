import type { ReactNode } from "react";
import { SectionHeading, type SectionAccent } from "@/components/site/section-heading";

type ProfileSectionProps = {
  id: string;
  title: string;
  index: string;
  accent: SectionAccent;
  children: ReactNode;
};

export function ProfileSection({ id, title, index, accent, children }: ProfileSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="site-shell profile-section">
      <SectionHeading id={`${id}-heading`} title={title} index={index} accent={accent} />
      <div className="min-w-0">{children}</div>
    </section>
  );
}
