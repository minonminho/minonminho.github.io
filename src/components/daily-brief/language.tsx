"use client";

import { useSyncExternalStore } from "react";
import type { Language, LocalizedText } from "@/lib/daily-brief/types";
import { DailyBriefWorkspaceNav } from "@/components/daily-brief/workspace-nav";

const storageKey = "daily-brief-language";
const changeEvent = "daily-brief-language-change";
let memoryLanguage: Language = "ko";

function snapshot(): Language {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "ko" || stored === "en") return stored;
  } catch { /* Keep the switch working when storage is unavailable. */ }
  return memoryLanguage;
}

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(changeEvent, notify);
  };
}

export function useBriefLanguage() {
  const language = useSyncExternalStore(subscribe, snapshot, () => "ko" as Language);
  return {
    language,
    text: (value: LocalizedText) => value[language],
    copy: (en: string, ko: string) => language === "ko" ? ko : en,
    setLanguage: (next: Language) => {
      memoryLanguage = next;
      try { window.localStorage.setItem(storageKey, next); } catch { /* Session preference still works. */ }
      window.dispatchEvent(new Event(changeEvent));
    },
  };
}

export function LanguageBar() {
  const { language, copy, setLanguage } = useBriefLanguage();
  return <>
    <div className="sticky top-[66px] z-40 border-b border-border-subtle bg-background">
      <div className="site-shell flex min-h-14 items-center justify-between gap-4 py-1">
        <p lang={language} className="text-xs text-text-secondary">{copy("AI trends, through an engineer’s lens", "엔지니어의 시선으로 읽는 AI 트렌드")}</p>
        <div className="flex shrink-0 border border-border-default" role="group" aria-label={copy("Briefing language", "브리핑 언어 선택")}>
          {(["ko", "en"] as const).map((value) => <button key={value} type="button" lang={value} aria-label={value === "ko" ? "한국어로 읽기" : "Read in English"} aria-pressed={language === value} onClick={() => setLanguage(value)} className={`min-h-11 min-w-14 px-3 font-mono text-xs transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-ice ${language === value ? "bg-signal-ice text-void" : "text-text-secondary hover:text-text-primary"}`}>{value === "ko" ? "KOR" : "ENG"}</button>)}
        </div>
      </div>
    </div>
    <DailyBriefWorkspaceNav language={language} />
  </>;
}
