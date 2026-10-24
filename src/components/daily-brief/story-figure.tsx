"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import type { Brief, StoryVisual } from "@/lib/daily-brief/types";
import { BriefArtwork } from "./artwork";

type Source = Brief["sources"][number];

export function StoryFigure({ visual, source }: { visual: StoryVisual; source?: Source }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const picture = visual.image;

  if (!picture || failedUrl === picture.url) {
    return <div className="mt-6">
      <BriefArtwork variant={visual.variant} compact />
      <div className="border-x border-b border-border-subtle bg-surface-01 px-5 py-4">
        <p className="text-sm leading-6 text-text-secondary">{picture ? "The original figure could not be loaded. This conceptual overview is shown instead." : visual.caption}</p>
        {picture && <a href={picture.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm text-signal-ice underline underline-offset-4">Open original figure <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
      </div>
    </div>;
  }

  return <figure className="mt-6 overflow-hidden border border-border-default bg-surface-01">
    <a href={picture.url} target="_blank" rel="noopener noreferrer" aria-label={`Open original figure at full size: ${picture.alt}`} className="group relative block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal-ice">
      <Image src={picture.url} width={picture.width} height={picture.height} alt={picture.alt} unoptimized loading="lazy" className="h-auto w-full" onError={() => setFailedUrl(picture.url)} />
      <span className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 border border-border-default bg-background px-3 text-xs text-text-primary"><Maximize2 className="size-3.5" aria-hidden="true" /> Full size</span>
    </a>
    <figcaption className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"><span className="text-eyebrow text-signal-ice">Original figure</span>{source && <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1.5 text-xs text-signal-ice underline underline-offset-4">{source.publisher} · View source <ArrowUpRight className="size-3" aria-hidden="true" /></a>}</div>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{visual.caption}</p>
    </figcaption>
  </figure>;
}
