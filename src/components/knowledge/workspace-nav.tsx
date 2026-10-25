"use client";

import Link from "next/link";
import { Activity, BookOpenText, FileDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useBriefLanguage } from "@/components/daily-brief/language";

const tabs = [
  { href: "/knowledge/", icon: BookOpenText, label: { en: "Knowledge", ko: "Knowledge" } },
  { href: "/knowledge/documents/", icon: FileDown, label: { en: "Documents", ko: "문서" } },
  { href: "/knowledge/agent-status/", icon: Activity, label: { en: "Agent status", ko: "에이전트 상태" } },
];

export function KnowledgeWorkspaceNav() {
  const pathname = usePathname();
  const { language } = useBriefLanguage();
  return <nav aria-label={language === "ko" ? "Knowledge 메뉴" : "Knowledge workspace"} className="flex flex-wrap gap-2 border-b border-border-subtle pb-4">
    {tabs.map(({ href, icon: Icon, label }) => {
      const active = pathname === href || (href === "/knowledge/" && pathname === "/knowledge/article/");
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-ice ${active ? "border-signal-ice bg-surface-02 text-text-primary" : "border-border-default text-text-secondary hover:text-text-primary"}`}>
        <Icon className="size-4" aria-hidden="true" />{label[language]}
      </Link>;
    })}
  </nav>;
}
