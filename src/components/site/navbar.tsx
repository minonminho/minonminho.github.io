"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, FileDown, BookOpen, BrainCircuit, PanelsTopLeft, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nav, profile } from "@/lib/data";

const iconNavLinkClassName =
  "inline-flex min-h-10 items-center gap-2 border-b border-transparent text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-signal-ice hover:text-text-primary focus-visible:border-signal-ice focus-visible:outline-none";

const navLinkClassName =
  "inline-flex min-h-10 items-center border-b border-transparent text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-signal-ice hover:text-text-primary focus-visible:border-signal-ice focus-visible:outline-none";

const utilityButtonClassName = "text-xs text-text-tertiary";

export function Navbar({ showCvDownload = true }: { showCvDownload?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const briefActive = pathname.startsWith("/daily-brief");
  const knowledgeActive = pathname.startsWith("/knowledge");
  const projectsActive = pathname.startsWith("/side-projects");
  const profileActive = pathname === "/";

  const primaryLinks = [
    { href: "/daily-brief/", label: "Daily Brief", icon: BookOpen, active: briefActive },
    { href: "/knowledge/", label: "Knowledge", icon: BrainCircuit, active: knowledgeActive },
    { href: "/side-projects/", label: "Side Projects", icon: PanelsTopLeft, active: projectsActive },
    { href: "/#about", label: "Profile", icon: UserRound, active: profileActive },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border-strong bg-background">
      <nav aria-label="Primary navigation" className="site-shell flex min-h-16 items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="text-eyebrow shrink-0 text-text-primary transition-colors hover:text-signal-ice"
          >
            MINHO LEE
          </Link>
        </div>

        <div className="hidden items-center gap-5 xl:flex">
          {primaryLinks.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`${iconNavLinkClassName} ${active ? "border-signal-ice text-text-primary" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
          {showCvDownload && <Button type="button" variant="ghost" size="sm" className={utilityButtonClassName} onClick={() => window.print()}>
            <FileDown className="size-3.5" aria-hidden="true" />CV
          </Button>}
          <Button asChild size="sm">
            <a href={`mailto:${profile.email}`}>{nav.getInTouch}</a>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden text-text-secondary"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      {open && (
        <div id="mobile-navigation" className="border-t border-border-subtle bg-surface-01 xl:hidden">
          <div className="site-shell flex flex-col py-4">
            {primaryLinks.map(({ href, label, icon: Icon, active }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`${navLinkClassName} w-fit gap-2 py-3 ${active ? "border-signal-ice text-text-primary" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
            {showCvDownload && <Button type="button" variant="ghost" size="sm" className="mt-2 w-fit text-xs text-text-tertiary" onClick={() => { setOpen(false); window.print(); }}>
              <FileDown className="size-3.5" aria-hidden="true" />CV
            </Button>}
            <Button asChild size="sm" className="mt-4 w-full">
              <a href={`mailto:${profile.email}`} onClick={() => setOpen(false)}>
                {nav.getInTouch}
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
