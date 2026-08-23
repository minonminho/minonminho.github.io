import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { profile } from "@/lib/data";
import { Mail, MapPin, type LucideIcon } from "lucide-react";

const MAPS_URL = "https://maps.app.goo.gl/LwT4y2jooJ837js27";

type ContactChip = {
  icon: LucideIcon;
  label: string;
  href?: string;
  variant: "default" | "secondary";
};

// DESIGN-figma.md: 블랙 pill(button-primary)은 페이지에서 단 하나 — email CTA.
const contactChips: readonly ContactChip[] = [
  {
    icon: Mail,
    label: profile.email,
    href: `mailto:${profile.email}`,
    variant: "default",
  },
  {
    icon: MapPin,
    label: profile.location,
    href: MAPS_URL,
    variant: "secondary",
  },
];

export function Hero() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 lg:px-12">
        <FadeIn>
          <p className="text-eyebrow mb-6">{profile.eyebrow}</p>
          <h1 className="text-display-xl mb-4">{profile.name}</h1>
          <p className="text-link">{profile.title}</p>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-8 flex flex-wrap gap-3">
          {contactChips.map((chip) => {
            const Icon = chip.icon;
            const external = chip.href?.startsWith("http");
            const content = (
              <>
                <Icon className="size-4" />
                {chip.label}
              </>
            );
            return (
              <Button
                key={chip.label}
                asChild
                variant={chip.variant}
                className={
                  chip.variant === "secondary"
                    ? "bg-canvas hover:bg-surface-soft"
                    : undefined
                }
              >
                <a
                  href={chip.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                >
                  {content}
                </a>
              </Button>
            );
          })}
        </FadeIn>
      </div>
    </section>
  );
}
