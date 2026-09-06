type SectionHeadingProps = {
  title: string;
};

export function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <div className="mb-10 border-b-2 border-border-strong pb-4 md:mb-12">
      <h2 className="text-display-lg max-w-3xl">{title}</h2>
    </div>
  );
}
