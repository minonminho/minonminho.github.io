"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Language } from "@/lib/daily-brief/types";

type Copy = { en: string; ko: string };
type Item = { label: Copy; href?: string; planned?: boolean };

const menus: { id: string; label: Copy; items: Item[] }[] = [
  {
    id: "papers",
    label: { en: "Papers", ko: "논문" },
    items: [
      { label: { en: "Daily", ko: "Daily" }, href: "/daily-brief/papers/" },
      { label: { en: "Weekly", ko: "Weekly" }, href: "/daily-brief/papers/#weekly-papers-heading" },
      { label: { en: "Monthly", ko: "Monthly" }, href: "/daily-brief/papers/#monthly-papers-heading" },
      { label: { en: "Highlighted", ko: "Highlighted" }, href: "/daily-brief/highlight/" },
    ],
  },
  {
    id: "knowledge",
    label: { en: "Knowledge", ko: "Knowledge" },
    items: [
      { label: { en: "All Concepts", ko: "전체 개념" }, href: "/knowledge/" },
      { label: { en: "By Domain", ko: "분야별 보기" }, href: "/knowledge/#domains" },
      { label: { en: "Learning Paths", ko: "학습 경로" }, planned: true },
      { label: { en: "Knowledge Graph", ko: "지식 그래프" }, planned: true },
      { label: { en: "Agent Status", ko: "에이전트 상태" }, href: "/knowledge/agent-status/" },
    ],
  },
  {
    id: "landmarks",
    label: { en: "Landmarks", ko: "랜드마크 논문" },
    items: [
      { label: { en: "Foundational Papers", ko: "기반 논문" }, href: "/daily-brief/papers/#foundational-papers" },
      { label: { en: "Timeline", ko: "연구 타임라인" }, planned: true },
      { label: { en: "Research Lineage", ko: "연구 계보" }, planned: true },
      { label: { en: "Emerging Candidates", ko: "신규 후보" }, planned: true },
    ],
  },
  {
    id: "library",
    label: { en: "Library", ko: "라이브러리" },
    items: [
      { label: { en: "Saved Papers", ko: "저장한 논문" }, planned: true },
      { label: { en: "Concept One-Pagers", ko: "개념 한 장 요약" }, href: "/knowledge/documents/" },
      { label: { en: "Reading History", ko: "읽은 기록" }, planned: true },
    ],
  },
];

export function DailyBriefWorkspaceNav({ language }: { language: Language }) {
  const pathname = usePathname();
  const copy = (en: string, ko: string) => language === "ko" ? ko : en;

  function isActive(menuId: string) {
    if (menuId === "papers") return pathname.startsWith("/daily-brief/papers") || pathname.startsWith("/daily-brief/highlight");
    if (menuId === "knowledge") return pathname.startsWith("/knowledge") && !pathname.startsWith("/knowledge/documents");
    if (menuId === "library") return pathname.startsWith("/knowledge/documents");
    return false;
  }

  return <nav aria-label={copy("Daily Brief sections", "Daily Brief 메뉴")} className="border-b border-border-subtle bg-background">
    <div className="site-shell flex flex-wrap items-center gap-x-2 py-1">
      {menus.map((menu) => <details key={menu.id} className="group relative">
        <summary aria-current={isActive(menu.id) ? "page" : undefined} className={`flex min-h-11 cursor-pointer list-none items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-ice [&::-webkit-details-marker]:hidden ${isActive(menu.id) ? "border-signal-ice text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          {menu.label[language]}<ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="absolute left-0 top-full z-50 mt-1 w-64 border border-border-default bg-surface-01 p-2 shadow-xl">
          {menu.items.map((item) => item.href
            ? <Link key={item.label.en} href={item.href} className="flex min-h-10 items-center px-3 text-sm text-text-secondary transition-colors hover:bg-surface-02 hover:text-text-primary">{item.label[language]}</Link>
            : <span key={item.label.en} aria-disabled="true" className="flex min-h-10 items-center justify-between gap-4 px-3 text-sm text-text-tertiary"><span>{item.label[language]}</span><span className="font-mono text-[9px] uppercase tracking-wide">{copy("Planned", "준비 중")}</span></span>)}
        </div>
      </details>)}
    </div>
  </nav>;
}
