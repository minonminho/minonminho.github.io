"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Menu, X, FileDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nav, profile } from "@/lib/data";

const navLinks = [
  { href: "/#about", label: nav.about },
  { href: "/#skills", label: nav.skills },
  { href: "/#experience", label: nav.experience },
  { href: "/#education", label: nav.education },
];

const labLinkClassName =
  "inline-flex min-h-10 items-center gap-2 border-b border-transparent text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-signal-ice hover:text-text-primary focus-visible:border-signal-ice focus-visible:outline-none";

const navLinkClassName =
  "inline-flex min-h-10 items-center border-b border-transparent text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-signal-ice hover:text-text-primary focus-visible:border-signal-ice focus-visible:outline-none";

export function Navbar({ showCvDownload = true }: { showCvDownload?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const labActive = pathname.startsWith("/lab");
  const briefActive = pathname.startsWith("/daily-brief");

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
          {showCvDownload && <span className="hidden h-4 w-px bg-border-default sm:block" aria-hidden="true" />}
          {/* 정적 호스팅이라 서버 렌더링 PDF 불가 → 네이티브 인쇄로 CV(PDF) 저장 */}
          {showCvDownload && <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden text-xs text-text-tertiary sm:inline-flex"
            onClick={() => window.print()}
          >
            <FileDown className="size-3.5" aria-hidden="true" />
            CV Download
          </Button>}
        </div>

        <div className="hidden items-center gap-6 xl:flex">
          <Link href="/daily-brief/" className={`${labLinkClassName} ${briefActive ? "border-signal-ice text-text-primary" : ""}`} aria-current={briefActive ? "page" : undefined}>
            <BookOpen className="size-4" aria-hidden="true" />
            Daily Brief
          </Link>
          <Link
            href="/lab"
            className={`${labLinkClassName} ${labActive ? "border-signal-ice text-text-primary" : ""}`}
            aria-current={labActive ? "page" : undefined}
          >
            <FlaskConical className="size-4" aria-hidden="true" />
            Lab
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClassName}
            >
              {link.label}
            </Link>
          ))}
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
            {showCvDownload && <Button
              type="button"
              variant="outline"
              size="sm"
              className="mb-3 w-fit text-xs text-text-tertiary sm:hidden"
              onClick={() => window.print()}
            >
              <FileDown className="size-3.5" aria-hidden="true" />
              CV Download
            </Button>}
            <Link href="/daily-brief/" onClick={() => setOpen(false)} className={`${navLinkClassName} ${briefActive ? "border-signal-ice text-text-primary" : ""} w-fit gap-2 py-3`} aria-current={briefActive ? "page" : undefined}>
              <BookOpen className="size-4" aria-hidden="true" />
              Daily Brief
            </Link>
            <Link
              href="/lab"
              onClick={() => setOpen(false)}
              className={`${navLinkClassName} ${labActive ? "border-signal-ice text-text-primary" : ""} w-fit gap-2 py-3`}
              aria-current={labActive ? "page" : undefined}
            >
              <FlaskConical className="size-4" aria-hidden="true" />
              Lab
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`${navLinkClassName} w-fit py-3`}
              >
                {link.label}
              </Link>
            ))}
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
