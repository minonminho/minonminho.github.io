export type SectionAccent = "ice" | "orbit" | "mint" | "dust";

type SectionHeadingProps = {
  id: string;
  title: string;
  index: string;
  accent: SectionAccent;
};

export function SectionHeading({ id, title, index, accent }: SectionHeadingProps) {
  return (
    <div className="profile-section-heading" data-accent={accent}>
      <p className="text-caption mb-3 flex items-center gap-2.5">
        <span className="section-marker" aria-hidden="true" />
        <span aria-hidden="true">{index}</span>
      </p>
      <h2 id={id} className="text-base font-medium leading-6 text-text-primary">{title}</h2>
    </div>
  );
}
