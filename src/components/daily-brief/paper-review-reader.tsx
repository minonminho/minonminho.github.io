"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, ExternalLink } from "lucide-react";
import { useBriefLanguage } from "./language";
import type { PaperReview } from "@/lib/daily-brief/paper-reviews";
import { formatBriefDate } from "@/lib/daily-brief/types";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type KnowledgeLink = { id: string; slug: string; title: { en: string; ko: string }; aliases: string[]; href: string };

function headingId(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

function plainText(value: string, links: KnowledgeLink[], offset: number): ReactNode[] {
  if (!links.length) return [value];
  const aliases = links.flatMap((link) => link.aliases.map((alias) => ({ alias, href: link.href }))).sort((a, b) => b.alias.length - a.alias.length);
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matcher = new RegExp(`(${aliases.map(({ alias }) => escape(alias)).join("|")})`, "giu");
  const result: ReactNode[] = [];
  let cursor = 0;
  for (const match of value.matchAll(matcher)) {
    const index = match.index ?? 0;
    if (index > cursor) result.push(value.slice(cursor, index));
    const found = aliases.find(({ alias }) => alias.toLocaleLowerCase() === match[0].toLocaleLowerCase());
    if (found) result.push(<Link key={`concept-${offset}-${index}`} href={found.href} className="text-signal-ice underline decoration-border-default underline-offset-4 hover:text-text-primary">{match[0]}</Link>);
    else result.push(match[0]);
    cursor = index + match[0].length;
  }
  if (cursor < value.length) result.push(value.slice(cursor));
  return result;
}

function inline(markdown: string, knowledgeLinks: KnowledgeLink[] = []): ReactNode[] {
  const tokens = /\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)/g;
  const result: ReactNode[] = [];
  let cursor = 0;
  for (const match of markdown.matchAll(tokens)) {
    const index = match.index ?? 0;
    if (index > cursor) result.push(...plainText(markdown.slice(cursor, index), knowledgeLinks, cursor));
    const token = match[0];
    if (token.startsWith("**")) result.push(<strong key={index} className="font-semibold text-text-primary">{token.slice(2, -2)}</strong>);
    else if (token.startsWith("*")) result.push(<em key={index}>{token.slice(1, -1)}</em>);
    else if (token.startsWith("`")) result.push(<code key={index} className="border border-border-subtle bg-surface-02 px-1.5 py-0.5 font-mono text-[0.9em] text-signal-ice">{token.slice(1, -1)}</code>);
    else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = link?.[2] ?? "#";
      const safeHref = href.startsWith("#") || /^https?:\/\//i.test(href) ? href : "#";
      result.push(<a key={index} href={safeHref} target={safeHref.startsWith("http") ? "_blank" : undefined} rel={safeHref.startsWith("http") ? "noopener noreferrer" : undefined} className="text-signal-ice underline decoration-border-default underline-offset-4 hover:text-text-primary">{link?.[1] ?? token}</a>);
    }
    cursor = index + token.length;
  }
  if (cursor < markdown.length) result.push(...plainText(markdown.slice(cursor), knowledgeLinks, cursor));
  return result;
}

function tableCells(row: string) {
  return row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function MarkdownBlocks({ markdown, knowledgeLinks }: { markdown: string; knowledgeLinks: KnowledgeLink[] }) {
  const lines = markdown.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }

    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
    if (image) {
      index += 1;
      let caption = "";
      if (lines[index]?.trim().startsWith("*") && lines[index]?.trim().endsWith("*")) {
        caption = lines[index].trim().slice(1, -1);
        index += 1;
      }
      blocks.push(<figure key={`figure-${index}`} className="overflow-hidden border border-border-default bg-surface-01"><a href={image[2]} target="_blank" rel="noopener noreferrer" aria-label="Open original paper figure"><img src={image[2]} alt={image[1]} loading="lazy" className="h-auto w-full" /></a>{caption && <figcaption className="border-t border-border-subtle px-4 py-3 text-xs leading-6 text-text-secondary sm:px-5">{inline(caption, knowledgeLinks)}</figcaption>}</figure>);
      continue;
    }

    const codeFence = line.match(/^```(.*)$/);
    if (codeFence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) codeLines.push(lines[index++]);
      index += 1;
      blocks.push(<pre key={`code-${index}`} className="overflow-x-auto border border-border-default bg-void p-5 font-mono text-xs leading-7 text-signal-mint"><code>{codeLines.join("\n")}</code></pre>);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const id = headingId(text);
      blocks.push(level === 3
        ? <h3 key={`heading-${index}`} id={id} className="scroll-mt-28 pt-3 text-lg font-semibold leading-7 text-text-primary">{inline(text, knowledgeLinks)}</h3>
        : <h2 key={`heading-${index}`} id={id} className="scroll-mt-28 border-t border-border-subtle pt-10 text-headline leading-tight text-text-primary">{inline(text, knowledgeLinks)}</h2>);
      index += 1;
      continue;
    }

    if (line.startsWith("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = tableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) rows.push(tableCells(lines[index++]));
      blocks.push(<div key={`table-${index}`} className="overflow-x-auto border border-border-default"><table className="w-full min-w-[680px] border-collapse text-left text-xs leading-6"><thead className="bg-surface-02"><tr>{headers.map((cell, cellIndex) => <th key={cellIndex} scope="col" className="border-b border-border-default px-3 py-3 font-mono font-medium text-text-primary">{inline(cell, knowledgeLinks)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="odd:bg-surface-01 even:bg-background">{headers.map((_, cellIndex) => <td key={cellIndex} className="border-b border-border-subtle px-3 py-3 text-text-secondary">{inline(row[cellIndex] ?? "", knowledgeLinks)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) items.push(lines[index++].replace(/^\s*[-*]\s+/, ""));
      blocks.push(<ul key={`list-${index}`} className="list-disc space-y-2 pl-6 text-body leading-8 text-text-secondary">{items.map((item, itemIndex) => <li key={itemIndex}>{inline(item, knowledgeLinks)}</li>)}</ul>);
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) quote.push(lines[index++].trim().replace(/^>\s?/, ""));
      blocks.push(<blockquote key={`quote-${index}`} className="border-l-2 border-signal-mint bg-surface-01 px-5 py-4 text-sm leading-7 text-text-secondary sm:px-6">{quote.map((part, partIndex) => <p key={partIndex} className={partIndex ? "mt-3" : ""}>{inline(part, knowledgeLinks)}</p>)}</blockquote>);
      continue;
    }

    if (/^---+$/.test(line)) {
      blocks.push(<hr key={`hr-${index}`} className="border-border-subtle" />);
      index += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const next = lines[index].trim();
      if (!next || /^(#{1,3})\s+/.test(next) || /^[-*]\s+/.test(next) || next.startsWith("> ") || next.startsWith("![") || next.startsWith("```") || /^\|/.test(next) || /^---+$/.test(next)) break;
      paragraph.push(next);
      index += 1;
    }
    if (paragraph.length) blocks.push(<p key={`paragraph-${index}`} className="text-body leading-8 text-text-secondary">{paragraph.map((part, partIndex) => <span key={partIndex}>{partIndex ? " " : ""}{inline(part, knowledgeLinks)}</span>)}</p>);
    else index += 1;
  }

  return <div className="space-y-6">{blocks}</div>;
}

export function PaperReviewReader({ review, knowledgeLinks, apiBaseUrl = "" }: { review: PaperReview; knowledgeLinks: KnowledgeLink[]; apiBaseUrl?: string }) {
  const [remoteLinks, setRemoteLinks] = useState<KnowledgeLink[]>([]);
  useEffect(() => {
    if (!apiBaseUrl) return;
    const controller = new AbortController();
    fetch(`${apiBaseUrl.replace(/\/$/, "")}/knowledge/concepts`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ concepts: Array<{ id: string; slug: string; canonicalName: { en: string; ko: string }; aliases?: string[]; sourcePapers?: string[] }> }> : Promise.reject(new Error("Knowledge unavailable")))
      .then((value) => setRemoteLinks(value.concepts.filter((concept) => concept.sourcePapers?.includes(review.canonicalId)).map((concept) => ({
        id: concept.id,
        slug: concept.slug,
        title: concept.canonicalName,
        aliases: concept.aliases ?? [],
        href: `/knowledge/article/?slug=${encodeURIComponent(concept.slug)}`,
      }))))
      .catch(() => { if (!controller.signal.aborted) setRemoteLinks([]); });
    return () => controller.abort();
  }, [apiBaseUrl, review.canonicalId]);
  const allKnowledgeLinks = [...new Map([...knowledgeLinks, ...remoteLinks].map((item) => [item.id, item])).values()];
  const { language, text, copy } = useBriefLanguage();
  const body = review.body[language];
  const isHuggingFace = review.sourceType.startsWith("huggingface-");
  const cadence = review.sourceType === "huggingface-weekly" ? copy("WEEKLY PAPER", "주간 논문") : review.sourceType === "huggingface-monthly" ? copy("MONTHLY PAPER", "월간 논문") : copy("DAILY PAPER", "일간 논문");
  const period = review.periodLabel ?? review.dailyDate;
  const rank = review.periodRank ?? review.dailyRank;
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);

  return <div lang={language} className={`site-shell pb-20 pt-10 md:pb-28 md:pt-14 ${language === "ko" ? "break-keep" : ""}`}>
    <Link href="/daily-brief/papers/" className="inline-flex min-h-10 items-center gap-2 text-sm text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><ArrowLeft className="size-4" aria-hidden="true" /> {copy("Back to paper briefs", "논문 Brief 목록으로 돌아가기")}</Link>

    <header className="mt-8 border-b-2 border-border-strong pb-9 md:mt-12 md:pb-12">
      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-wide text-text-secondary">
        <span className="inline-flex items-center gap-2 text-signal-mint"><StarIcon />{isHuggingFace ? `${cadence} / ${review.editorialStatus === "metadata-digest" ? copy("SOURCE DIGEST", "원문 요약") : copy("FIRST READ", "먼저 읽기")}` : copy("FOUNDATIONAL SEED PAPER", "기반 Seed 논문")}</span>
        {isHuggingFace && <>
          <span aria-hidden="true">/</span><span>HF #{rank}</span>
          {period && <><span aria-hidden="true">/</span><time dateTime={period}>{review.sourceType === "huggingface-daily" ? formatBriefDate(period, false, language) : period}</time></>}
          {review.upvotesAtSelection !== null && <><span aria-hidden="true">/</span><span>{review.upvotesAtSelection} {copy("votes at selection", "선정 당시 추천")}</span></>}
        </>}
        {review.reviewStatus === "draft" && <span className="border border-border-default px-2 py-1 text-text-secondary">{copy("LOCAL TEST DRAFT", "로컬 테스트 초안")}</span>}
      </div>
      <h1 className={`text-display-xl mt-7 max-w-5xl leading-[1.1] ${language === "ko" ? "break-keep" : ""}`}>{text(review.title)}</h1>
      <p className="mt-6 max-w-3xl text-subhead leading-8 text-text-secondary">{text(review.dek)}</p>
      <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary"><span>{review.authors}</span><span aria-hidden="true">·</span><span>{review.canonicalId}</span><span aria-hidden="true">·</span><time dateTime={review.publishedDate}>{formatBriefDate(review.publishedDate, false, language)}</time><a href={`https://arxiv.org/abs/${review.version}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-signal-ice underline decoration-border-default underline-offset-4">{copy("Original paper", "논문 원문")}<ExternalLink className="size-3.5" aria-hidden="true" /></a></div>
    </header>

    <div className="grid gap-10 py-9 md:py-12 lg:grid-cols-[190px_minmax(0,850px)] lg:gap-16 xl:gap-24">
      <aside aria-label={copy("In this review", "리뷰 목차")}>
        <nav className="lg:sticky lg:top-36"><h2 className="text-eyebrow">{copy("IN THIS REVIEW", "이 글의 구성")}</h2><ol className="mt-4 flex flex-wrap gap-x-5 gap-y-3 lg:flex-col">{headings.map((heading, index) => <li key={heading}><a href={`#${headingId(heading)}`} className="text-xs leading-6 text-text-secondary hover:text-signal-ice focus-visible:outline-2 focus-visible:outline-signal-ice"><span className="mr-2 font-mono text-[10px]">0{index + 1}</span>{heading}</a></li>)}</ol><p className="mt-8 hidden items-center gap-2 text-[10px] leading-5 text-text-tertiary lg:flex"><BookOpen className="size-3.5" aria-hidden="true" />{copy("Original paper first; analysis is labeled.", "원문 근거와 검토 의견을 구분합니다.")}</p></nav>
      </aside>

      <article className="min-w-0">
        {review.editorialStatus === "metadata-digest" && <p className="mb-7 border-l-2 border-signal-orbit bg-surface-01 px-5 py-4 text-sm leading-7 text-text-secondary">{copy("Automated source digest, not an independent research review. This text comes from discovery metadata and the author abstract. Verify methods, baselines, and results in the original paper.", "독립적인 논문 리뷰가 아닌 자동 원문 요약입니다. 발견 서비스 메타데이터와 저자 초록에 기반하며 방법론, Baseline, 결과는 논문 원문에서 별도로 검증해야 합니다.")}</p>}
        <figure className="overflow-hidden border border-border-default bg-surface-01">
          <a href={review.hero.url} target="_blank" rel="noopener noreferrer" className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-ice"><img src={review.hero.url} alt={text(review.hero.alt)} className="h-auto w-full" fetchPriority="high" /></a>
          <figcaption className="border-t border-border-subtle px-4 py-4 sm:px-5"><p className="text-eyebrow text-signal-ice">{copy("ORIGINAL AUTHOR FIGURE", "저자 원문 그림")}</p><p className="mt-2 text-xs leading-6 text-text-secondary">{text(review.hero.caption)}</p><p className="mt-1 font-mono text-[10px] text-text-tertiary">{review.hero.license} · {review.version}</p></figcaption>
        </figure>
        <div className="mt-9"><MarkdownBlocks markdown={body} knowledgeLinks={allKnowledgeLinks} /></div>
        {allKnowledgeLinks.length > 0 && <section className="mt-14 border-t-2 border-border-strong pt-7" aria-labelledby="related-knowledge-title">
          <p className="text-eyebrow text-signal-mint">PAPER → KNOWLEDGE</p>
          <h2 id="related-knowledge-title" className="mt-3 text-headline">{copy("Concepts connected to this paper", "이 논문에서 연결된 개념")}</h2>
          <ul className="mt-4 space-y-3">{allKnowledgeLinks.map((item) => <li key={item.id}><Link href={item.href} className="inline-flex min-h-11 items-center gap-2 text-sm text-signal-ice hover:text-text-primary">{item.title[language]}<ArrowUpRight className="size-4" aria-hidden="true" /></Link></li>)}</ul>
        </section>}
    <Link href="/daily-brief/papers/" className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm text-signal-ice hover:text-text-primary focus-visible:outline-2 focus-visible:outline-signal-ice"><ArrowLeft className="size-4" aria-hidden="true" />{copy("Back to all paper briefs", "전체 논문 Brief로 돌아가기")}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </article>
    </div>
  </div>;
}

function StarIcon() {
  return <span aria-hidden="true" className="text-base leading-none">✳</span>;
}
