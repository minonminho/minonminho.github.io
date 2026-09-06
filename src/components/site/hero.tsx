import { FadeIn } from "@/components/motion/fade-in";
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
    <section className="section-space border-b-2 border-border-strong">
      <div className="site-shell">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.5fr)] lg:gap-24">
          <FadeIn>
            <h1 className="text-display-xl">{profile.name}</h1>
            <p className="text-body-lg mt-6 text-text-secondary">{profile.title}</p>
            <p className="text-caption mt-3">{profile.eyebrow}</p>
          </FadeIn>

          <FadeIn
            delay={0.08}
            className="border-l border-border-default pl-5 lg:-ml-[60px] lg:flex lg:items-center"
          >
            <div className="space-y-6">
              {contactChips.map((chip) => {
                const Icon = chip.icon;
                const external = chip.href?.startsWith("http");
                return (
                  <div key={chip.label}>
                    <p className="text-caption mb-2">{chip.variant === "default" ? "Contact" : "Location"}</p>
                    <a
                      href={chip.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      className="text-body-sm inline-flex items-start gap-2 text-text-secondary transition-colors duration-150 hover:text-signal-ice focus-visible:text-signal-ice focus-visible:outline-none"
                    >
                      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span>{chip.label}</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
