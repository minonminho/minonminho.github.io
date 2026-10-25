import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { profile } from "@/lib/data";
import { PracticeExplorer } from "@/components/site/practice-explorer";

export function Hero() {
  return (
    <section aria-labelledby="profile-name" className="site-shell profile-hero">
      <FadeIn>
        <p className="text-eyebrow mb-7 flex items-center gap-2.5"><span className="hero-status" aria-hidden="true" />People, systems & technology</p>
        <h1 id="profile-name" className="text-display-xl">{profile.name}</h1>
        <p className="mt-5 text-body-lg text-text-secondary">{profile.title}</p>
        <a href="https://maps.app.goo.gl/LwT4y2jooJ837js27" target="_blank" rel="noreferrer" title={profile.location} className="editorial-link mt-2 text-sm text-text-tertiary">
          <MapPin className="size-3.5" aria-hidden="true" />{profile.eyebrow}
        </a>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm">
          <a href={`mailto:${profile.email}`} className="contact-action">
            {profile.email}<ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
          <a href="#experience" className="editorial-link text-text-secondary">
            View experience<ArrowDown className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </FadeIn>
      <FadeIn delay={0.08}><PracticeExplorer /></FadeIn>
    </section>
  );
}
