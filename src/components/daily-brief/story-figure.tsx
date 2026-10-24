"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import type { Brief, StoryVisual } from "@/lib/daily-brief/types";
import { BriefArtwork } from "./artwork";
import { useBriefLanguage } from "./language";

type Source = Brief["sources"][number];

export function StoryFigure({ visual, source }: { visual: StoryVisual; source?: Source }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const picture = visual.image;
  const { text, copy } = useBriefLanguage();

  if (!picture || failedUrl === picture.url) {
    return <div className="mt-6">
      <BriefArtwork variant={visual.variant} compact />
      <div className="border-x border-b border-border-subtle bg-surface-01 px-5 py-4">
        <p className="text-sm leading-6 text-text-secondary">{picture ? copy("The original figure could not be loaded. This conceptual overview is shown instead.", "원본 이미지를 불러오지 못해 개념도로 보여드립니다.") : text(visual.caption)}</p>
        {picture && <a href={picture.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm text-signal-ice underline underline-offset-4">{copy("Open original figure", "원본 그림 열기")} <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
      </div>
    </div>;
  }

  return <figure className="mt-6 overflow-hidden border border-border-default bg-surface-01">
    <a href={picture.url} target="_blank" rel="noopener noreferrer" aria-label={copy(`Open original figure at full size: ${text(picture.alt)}`, `원본 크기로 보기: ${text(picture.alt)}`)} className="group relative block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal-ice">
      <Image src={picture.url} width={picture.width} height={picture.height} alt={text(picture.alt)} unoptimized loading="lazy" className="h-auto w-full" onError={() => setFailedUrl(picture.url)} />
      <span className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 border border-border-default bg-background px-3 text-xs text-text-primary"><Maximize2 className="size-3.5" aria-hidden="true" /> {copy("Full size", "원본 크기")}</span>
    </a>
    <figcaption className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"><span className="text-eyebrow text-signal-ice">{copy("Original figure", "원문 이미지")}</span>{source && <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1.5 text-xs text-signal-ice underline underline-offset-4">{source.publisher} · {copy("View source", "원문 보기")} <ArrowUpRight className="size-3" aria-hidden="true" /></a>}</div>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{text(visual.caption)}</p>
    </figcaption>
  </figure>;
}
