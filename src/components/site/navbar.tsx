"use client";

import { useState } from "react";
import { Menu, X, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nav, profile } from "@/lib/data";

const navLinks = [
  { href: "#about", label: nav.about },
  { href: "#skills", label: nav.skills },
  { href: "#experience", label: nav.experience },
  { href: "#education", label: nav.education },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-canvas">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* 정적 호스팅이라 서버 렌더링 PDF 불가 → 네이티브 인쇄로 CV(PDF) 저장 */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
        >
          <FileDown className="size-4" />
          CV Download
        </Button>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body-sm font-[330] underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
          <Button asChild>
            <a href={`mailto:${profile.email}`}>{nav.getInTouch}</a>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      {open && (
        <div className="border-t border-hairline bg-canvas md:hidden">
          <div className="flex flex-col px-4 py-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-headline py-3"
              >
                {link.label}
              </a>
            ))}
            <Button asChild className="mt-4 w-full">
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
