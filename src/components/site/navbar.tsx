"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Menu, X, FileDown, BookOpen, BookOpenText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nav, profile } from "@/lib/data";

const navLinks = [
  { href: "/#about", label: nav.about },
  { href: "/#skills", label: nav.skills },
  { href: "/#experience", label: nav.experience },
  { href: "/#education", label: nav.education },
];

const researchMenus = [
  {
    label: "Papers",
    items: [
      { label: "Daily", href: "/daily-brief/" },
      { label: "Weekly", planned: true },
      { label: "Monthly", planned: true },
      { label: "Highlighted", href: "/daily-brief/highlight/" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { label: "All Concepts", href: "/knowledge/" },
      { label: "By Domain", href: "/knowledge/#domains" },
      { label: "Learning Paths", planned: true },
      { label: "Knowledge Graph", planned: true },
    ],
  },
  {
    label: "Landmarks",
    items: [
      { label: "Foundational Papers", planned: true },
      { label: "Timeline", planned: true },
      { label: "Research Lineage", planned: true },
      { label: "Emerging Candidates", planned: true },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Saved Papers", planned: true },
      { label: "Concept One-Pagers", href: "/knowledge/documents/" },
      { label: "Reading History", planned: true },
    ],
  },
];

const labLinkClassName =
  "inline-flex min-h-10 items-center gap-2 border-b border-transparent text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-signal-ice hover:text-text-primary focus-visible:border-signal-ice focus-visible:outline-none";

const navLinkClassName =
  "inline-flex min-h-10 items-center border-b border-transparent text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-signal-ice hover:text-text-primary focus-visible:border-signal-ice focus-visible:outline-none";

export function Navbar({ showCvDownload = true }: { showCvDownload?: boolean }) {
  const [open, setOpen] = useState(false);
  const [activeResearchMenu, setActiveResearchMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const labActive = pathname.startsWith("/lab");
  const briefActive = pathname.startsWith("/daily-brief");
  const knowledgeActive = pathname.startsWith("/knowledge");
  const researchWorkspaceActive = briefActive || knowledgeActive;

  useEffect(() => {
    setActiveResearchMenu(null);
    setOpen(false);
  }, [pathname]);

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
          {researchWorkspaceActive ? researchMenus.map((menu) => {
            const active = menu.label === "Papers" ? briefActive : menu.label === "Knowledge" ? knowledgeActive : false;
            const expanded = activeResearchMenu === menu.label;
            return <div key={menu.label} className="relative">
              <button
                type="button"
                className={`${labLinkClassName} ${active ? "border-signal-ice text-text-primary" : ""}`}
                aria-expanded={expanded}
                aria-haspopup="menu"
                onClick={() => setActiveResearchMenu(expanded ? null : menu.label)}
              >
                {menu.label}<ChevronDown className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {expanded && <div role="menu" aria-label={`${menu.label} menu`} className="absolute left-0 top-full z-50 mt-2 min-w-56 border border-border-default bg-surface-01 p-2 shadow-xl">
                {menu.items.map((item) => item.href
                  ? <Link key={item.label} href={item.href} role="menuitem" onClick={() => setActiveResearchMenu(null)} className="flex min-h-10 items-center px-3 text-sm text-text-secondary transition-colors hover:bg-surface-02 hover:text-text-primary">{item.label}</Link>
                  : <span key={item.label} role="menuitem" aria-disabled="true" className="flex min-h-10 items-center justify-between gap-5 px-3 text-sm text-text-tertiary"><span>{item.label}</span><span className="font-mono text-[9px] uppercase tracking-wide">Planned</span></span>)}
              </div>}
            </div>;
          }) : <>
            <Link href="/knowledge/" className={`${labLinkClassName} ${knowledgeActive ? "border-signal-ice text-text-primary" : ""}`} aria-current={knowledgeActive ? "page" : undefined}>
              <BookOpenText className="size-4" aria-hidden="true" />
              Knowledge
            </Link>
            <Link href="/daily-brief/" className={`${labLinkClassName} ${briefActive ? "border-signal-ice text-text-primary" : ""}`} aria-current={briefActive ? "page" : undefined}>
              <BookOpen className="size-4" aria-hidden="true" />
              Daily Brief
            </Link>
          </>}
          <Link
            href="/lab"
            className={`${labLinkClassName} ${labActive ? "border-signal-ice text-text-primary" : ""}`}
            aria-current={labActive ? "page" : undefined}
          >
            <FlaskConical className="size-4" aria-hidden="true" />
            Lab
          </Link>
          {!researchWorkspaceActive && navLinks.map((link) => (
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
            {researchWorkspaceActive ? <div className="mt-2 border-y border-border-subtle py-2">
              {researchMenus.map((menu) => <details key={menu.label} className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm text-text-secondary [&::-webkit-details-marker]:hidden">
                  {menu.label}<ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="pb-2 pl-3">
                  {menu.items.map((item) => item.href
                    ? <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="flex min-h-10 items-center px-3 text-sm text-text-secondary hover:text-text-primary">{item.label}</Link>
                    : <span key={item.label} aria-disabled="true" className="flex min-h-10 items-center justify-between gap-5 px-3 text-sm text-text-tertiary"><span>{item.label}</span><span className="font-mono text-[9px] uppercase tracking-wide">Planned</span></span>)}
                </div>
              </details>)}
            </div> : <>
              <Link href="/daily-brief/" onClick={() => setOpen(false)} className={`${navLinkClassName} ${briefActive ? "border-signal-ice text-text-primary" : ""} w-fit gap-2 py-3`} aria-current={briefActive ? "page" : undefined}>
                <BookOpen className="size-4" aria-hidden="true" />
                Daily Brief
              </Link>
              <Link href="/knowledge/" onClick={() => setOpen(false)} className={`${navLinkClassName} ${knowledgeActive ? "border-signal-ice text-text-primary" : ""} w-fit gap-2 py-3`} aria-current={knowledgeActive ? "page" : undefined}>
                <BookOpenText className="size-4" aria-hidden="true" />
                Knowledge
              </Link>
            </>}
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
