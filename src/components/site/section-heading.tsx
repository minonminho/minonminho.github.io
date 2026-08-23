type SectionHeadingProps = {
  title: string;
};

export function SectionHeading({ title }: SectionHeadingProps) {
  return <h2 className="text-display-lg mb-10 max-w-3xl md:mb-14">{title}</h2>;
}
