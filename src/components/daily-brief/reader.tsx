"use client";

import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { Fragment, useEffect } from "react";
import { StoryFigure } from "./story-figure";
import { StoryLinks } from "./story-links";
import { useBriefLanguage } from "./language";
import type { Brief } from "@/lib/daily-brief/types";
import { formatBriefDate, readingMinutes } from "@/lib/daily-brief/types";

function NoteText({ text, brief }: { text: string; brief: Brief }) {
  const { copy } = useBriefLanguage();
  return <>{text.split(/(\[\d+\])/g).map((part, index) => {
    const match = /^\[(\d+)\]$/.exec(part);
    const note = match && brief.glossary.find((entry) => entry.id === Number(match[1]));
    return note ? <sup key={index} className="ml-0.5"><a href={`#note-${note.id}`} title={`${note.term} — ${note.ko}`} aria-label={copy(`Note ${note.id}: ${note.term}, ${note.ko}`, `${note.id}번 용어 설명: ${note.ko}`)} className="inline-block scroll-mt-24 px-0.5 text-xs font-medium text-signal-ice underline decoration-signal-ice/50 underline-offset-2 focus-visible:outline-2 focus-visible:outline-signal-ice">[{note.id}]</a></sup> : <Fragment key={index}>{part}</Fragment>;
  })}</>;
}

export function BriefReader({ brief, older, newer }: { brief: Brief; older?: Brief; newer?: Brief }) {
  const duration = readingMinutes(brief);
  const { language, text, copy } = useBriefLanguage();
  useEffect(() => { document.title = `${text(brief.title)} · Daily Brief`; }, [language, brief.title]);
  return <div lang={language} className={language === "ko" ? "break-keep" : undefined}>
    <header className="site-shell border-b-2 border-border-strong pb-12 pt-12 md:pb-16 md:pt-16">
      <Link href="/daily-brief/" className="inline-flex min-h-10 items-center gap-2 text-sm text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><ArrowLeft className="size-4" aria-hidden="true" /> {copy("All editions", "전체 브리핑")}</Link>
      <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-text-secondary"><span className="text-eyebrow text-signal-ice">Daily Brief</span><time dateTime={brief.date}>{formatBriefDate(brief.date, true, language)}</time><span className="inline-flex items-center gap-2"><Clock3 className="size-3.5" aria-hidden="true" /> {copy(`${duration} min read`, `약 ${duration}분 읽기`)}</span><a href="#vocabulary" className="min-h-6 underline underline-offset-4 hover:text-signal-ice">{copy(`${brief.glossary.length} Korean notes`, `용어 설명 ${brief.glossary.length}개`)}</a><a href="#sources" className="min-h-6 text-signal-ice underline underline-offset-4">{copy(`${brief.sources.length} original sources ↗`, `원문 ${brief.sources.length}개 ↗`)}</a></div>
      <h1 className={`text-display-xl mt-6 max-w-4xl ${language === "ko" ? "leading-[1.25]" : ""}`}>{text(brief.title)}</h1>
      <p className="mt-6 max-w-3xl text-subhead">{text(brief.dek)}</p>
    </header>
    <div className="site-shell grid gap-12 py-12 lg:grid-cols-[200px_minmax(0,840px)] lg:gap-16 lg:py-16 xl:gap-24">
      <aside aria-label={copy("In this edition", "이번 브리핑 목차")}>
        <nav className="lg:sticky lg:top-36"><h2 className="text-eyebrow">{copy("In this edition", "이번 브리핑")}</h2><ol className="mt-5 flex flex-wrap gap-x-6 gap-y-4 lg:flex-col">{brief.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="text-sm leading-6 text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><span className="mr-3 font-mono text-xs">0{index + 1}</span>{text(section.label)}</a></li>)}<li><a href="#experiment" className="text-sm leading-6 text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><span className="mr-3 font-mono text-xs">05</span>{copy("Try it yourself", "직접 해보기")}</a></li><li><a href="#vocabulary" className="text-sm text-signal-ice underline underline-offset-4">{copy("Vocabulary & notes", "용어 설명")}</a></li><li><a href="#sources" className="text-sm text-signal-ice underline underline-offset-4">{copy("Original sources ↗", "원문 모아보기 ↗")}</a></li></ol></nav>
      </aside>
      <article id="reading" className="min-w-0">
        <p className="mt-6 border-l-2 border-signal-ice pl-5 text-body-lg leading-8"><NoteText text={text(brief.focus)} brief={brief} /></p>
        <p className="mt-5 text-xs leading-6 text-text-secondary">{text(brief.editorialNote)}</p>
        {brief.sections.map((section, index) => <section key={section.id} id={section.id} aria-labelledby={`heading-${section.id}`} className="scroll-mt-24 border-b border-border-subtle py-12">
          <h2 id={`heading-${section.id}`} className="text-eyebrow text-signal-ice">0{index + 1} / {text(section.label)}</h2>
          {section.items.length === 0 && <p className="mt-6 text-body text-text-secondary">{copy("No material update found for this edition.", "이번에는 주목할 만한 새 소식이 확인되지 않았습니다.")}</p>}
          <div className="space-y-12">{section.items.map((item) => <div key={text(item.title)}>
            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-secondary">{item.publishedDate && <time dateTime={item.publishedDate}>{formatBriefDate(item.publishedDate, false, language)}</time>}<span className="border border-border-default px-2 py-1">{copy(item.status.replace("-", " "), ({research:"연구",available:"사용 가능",preview:"사전 제공",announced:"발표", "case-study":"활용 사례"})[item.status])}</span></div>
            <h3 className="text-headline mt-4">{text(item.title)}</h3>
            <StoryLinks item={item} sources={brief.sources} />
            <StoryFigure visual={item.visual} source={brief.sources.find((source) => source.id === item.visual.image?.sourceId)} />
            <p className="mt-5 text-body-lg leading-8 text-text-secondary"><NoteText text={text(item.summary)} brief={brief} /></p>
            <dl className="mt-6 space-y-4 text-body leading-7"><div><dt className="inline font-medium text-text-primary">{copy("What changed. ", "달라진 점. ")}</dt><dd className="inline text-text-secondary"><NoteText text={text(item.change)} brief={brief} /></dd></div><div><dt className="inline font-medium text-text-primary">{copy("Access today. ", "지금 사용할 수 있나. ")}</dt><dd className="inline text-text-secondary"><NoteText text={text(item.availability)} brief={brief} /></dd></div><div><dt className="inline font-medium text-text-primary">{copy("The limit. ", "한계와 확인할 점. ")}</dt><dd className="inline text-text-secondary"><NoteText text={text(item.limitation)} brief={brief} /></dd></div></dl>
            <div className="mt-6 border-l border-signal-orbit pl-5"><p className="font-mono text-[11px] uppercase tracking-wider text-signal-orbit">{copy("Interpretation / Why it matters", "해석 / 엔지니어에게 중요한 이유")}</p><p className="mt-2 text-body leading-7 text-text-secondary"><NoteText text={text(item.implication)} brief={brief} /></p></div>
          </div>)}</div>
        </section>)}
        <section id="experiment" aria-labelledby="experiment-title" className="scroll-mt-24 border-b border-border-subtle py-12">
          <p className="text-eyebrow text-signal-mint">{copy(`05 / Try it yourself · ${brief.experiment.minutes} minutes`, `05 / 직접 해보기 · ${brief.experiment.minutes}분`)}</p><h2 id="experiment-title" className="text-headline mt-5">{text(brief.experiment.title)}</h2><ol className="mt-6 list-decimal space-y-4 pl-5 text-body-lg leading-8 text-text-secondary">{brief.experiment.steps.map((step, i) => <li key={i} className="pl-2 marker:font-mono marker:text-sm marker:text-signal-mint"><NoteText text={text(step)} brief={brief} /></li>)}</ol><p className="mt-6 border-l border-signal-mint pl-5 text-body leading-7 text-text-secondary"><span className="font-medium text-text-primary">{copy("What to measure. ", "확인할 결과. ")}</span><NoteText text={text(brief.experiment.measure)} brief={brief} /></p>
        </section>
        <section id="vocabulary" aria-labelledby="vocabulary-title" className="scroll-mt-24 py-12">
          <p className="text-eyebrow">{copy("Read. Understand. Use.", "읽고, 이해하고, 활용하기")}</p><h2 id="vocabulary-title" className="text-display-lg mt-4">{copy("Vocabulary & notes", "용어 설명")}</h2><p lang="ko" className="mt-4 text-sm leading-7 text-text-secondary">본문의 번호를 누르면 쉬운 설명과 예시를 확인할 수 있어요.</p>
          <dl className="mt-8 border-t border-border-default">{brief.glossary.map((note) => <div key={note.id} id={`note-${note.id}`} tabIndex={-1} className="scroll-mt-24 border-b border-border-subtle py-6 target:border-signal-ice target:bg-surface-01 focus-visible:outline-2 focus-visible:outline-signal-ice sm:grid sm:grid-cols-[36px_1fr] sm:gap-4"><dt className="text-sm font-medium sm:col-span-2"><span className="mr-4 font-mono text-xs text-signal-ice">[{note.id}]</span>{note.term}<span lang="ko" className="ml-3 font-normal text-text-secondary">{note.ko}</span></dt><dd lang="ko" className="mt-3 text-sm leading-7 text-text-secondary sm:col-start-2 sm:mt-0"><p>{note.explanation}</p><p className="mt-2"><span className="text-signal-ice">예시 / </span>{note.example}</p></dd></div>)}</dl>
          <a href="#reading" className="mt-5 inline-flex min-h-10 items-center text-xs text-signal-ice underline underline-offset-4">{copy("Back to the brief ↑", "본문으로 돌아가기 ↑")}</a>
        </section>
        <section id="sources" aria-labelledby="sources-title" className="border-t border-border-default py-10"><h2 id="sources-title" className="text-eyebrow">{copy("Original sources", "원문 모아보기")}</h2><ol className="mt-5 space-y-5">{brief.sources.map((source, index) => <li key={source.id} className="text-sm leading-6"><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-text-secondary underline underline-offset-4 hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><span className="mr-2 font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>{text(source.title)} ↗</a><p className="mt-1 text-xs text-text-secondary">{source.publisher}{source.publishedDate ? ` / ${formatBriefDate(source.publishedDate, false, language)}` : copy(" / Undated documentation", " / 발행일 미표기 문서")}</p></li>)}</ol><p className="mt-8 font-mono text-[11px] leading-6 text-text-secondary">{copy("PUBLISHED", "게시")} {new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-GB", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(brief.publishedAt))} KST</p></section>
        <nav aria-label={copy("More editions", "다른 날짜 브리핑")} className="grid gap-6 border-t border-border-default pt-8 sm:grid-cols-2">{older && <Link href={`/daily-brief/${older.date}/`} className="text-sm text-text-secondary hover:text-signal-ice"><span className="text-caption block">{copy("← Earlier edition", "← 이전 브리핑")}</span><span className="mt-2 block">{text(older.title)}</span></Link>}{newer && <Link href={`/daily-brief/${newer.date}/`} className="text-sm text-text-secondary hover:text-signal-ice sm:col-start-2 sm:text-right"><span className="text-caption block">{copy("Later edition →", "다음 브리핑 →")}</span><span className="mt-2 block">{text(newer.title)}</span></Link>}</nav>
      </article>
    </div>
  </div>;
}
