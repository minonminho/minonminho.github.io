import type { ReactNode } from "react";

const SURFACE_CLASS = {
  base: "bg-surface-01",
  raised: "bg-surface-02",
  deep: "bg-surface-03",
} as const;

type SurfaceBlockProps = {
  tone: keyof typeof SURFACE_CLASS;
  children: ReactNode;
};

export function SurfaceBlock({ tone, children }: SurfaceBlockProps) {
  return (
    <div className={`${SURFACE_CLASS[tone]} rounded-lg border border-border-default px-5 py-8 md:p-10`}>
      {children}
    </div>
  );
}
