"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Locale, Localized } from "@/lib/research/types";
const key = "research-reading-language";
const eventName = "research-reading-language-change";
let fallback: Locale = "en";
function read(): Locale {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === "en" || stored === "ko") return stored;
  } catch {}
  return fallback;
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventName, callback);
  };
}
export function useResearchLanguage() {
  const language = useSyncExternalStore(subscribe, read, () => "en" as Locale);
  return {
    language,
    local: (value: Localized) => value[language],
    copy: (en: string, ko: string) => language === "en" ? en : ko,
    setLanguage: (next: Locale) => {
      fallback = next;
      try { window.localStorage.setItem(key, next); } catch {}
      window.dispatchEvent(new Event(eventName));
    },
  };
}
export function ResearchBar() {
  const { language, copy, setLanguage } = useResearchLanguage();
  return <nav className="border-b border-border-subtle bg-background" aria-label="Research reading navigation">
    <div className="site-shell flex min-h-14 flex-wrap items-center justify-between gap-3 py-2">
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <Link href="/daily-brief/" className="text-text-primary hover:text-signal-ice">{copy("Daily Deep Dive", "오늘의 논문")}</Link>
        <Link href="/knowledge/" className="text-text-secondary hover:text-signal-ice">{copy("Knowledge", "개념 학습")}</Link>
      </div>
      <div role="group" aria-label={copy("Reading language", "읽기 언어")} className="flex border border-border-default">
        {(["en", "ko"] as const).map((next) => <button type="button" key={next} lang={next} aria-pressed={language === next} onClick={() => setLanguage(next)}
          className={language === next ? "min-h-10 min-w-14 bg-signal-ice px-3 font-mono text-xs text-void" : "min-h-10 min-w-14 px-3 font-mono text-xs text-text-secondary hover:text-text-primary"}>
          {next === "en" ? "ENG" : "KOR"}
        </button>)}
      </div>
    </div>
  </nav>;
}
