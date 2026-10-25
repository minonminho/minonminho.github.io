"use client";

import { useState } from "react";
import { useBriefLanguage } from "@/components/daily-brief/language";

export function AlphaCompositingDemo() {
  const [alpha, setAlpha] = useState(55);
  const { language, copy } = useBriefLanguage();
  const opacity = alpha / 100;
  return <figure className="border border-border-default bg-surface-01 p-5 sm:p-7">
    <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
      <div>
        <p className="text-eyebrow text-signal-mint">01 / {copy("FOREGROUND", "전경")}</p>
        <div className="mt-3 flex aspect-[5/3] items-center justify-center overflow-hidden border border-border-default" style={{ backgroundImage: "linear-gradient(45deg,#252a30 25%,transparent 25%),linear-gradient(-45deg,#252a30 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#252a30 75%),linear-gradient(-45deg,transparent 75%,#252a30 75%)", backgroundSize: "24px 24px", backgroundPosition: "0 0,0 12px,12px -12px,-12px 0" }}>
          <div className="size-24 rounded-full border border-white/30 bg-[#d58d9b] shadow-xl" style={{ opacity }} aria-label={copy(`Foreground opacity ${alpha} percent`, `전경 불투명도 ${alpha}%`)} />
        </div>
        <p className="mt-2 text-xs text-text-secondary">{copy("RGBA layer", "RGBA 레이어")}</p>
      </div>
      <span className="hidden text-2xl text-signal-ice md:block" aria-hidden="true">+</span>
      <div>
        <p className="text-eyebrow text-signal-mint">02 / {copy("BACKDROP", "배경")}</p>
        <div className="mt-3 flex aspect-[5/3] items-center justify-center border border-border-default bg-[#54728b]"><span className="font-mono text-sm text-white/80">Cᵦ</span></div>
        <p className="mt-2 text-xs text-text-secondary">{copy("Opaque blue background", "불투명한 파란 배경")}</p>
      </div>
      <span className="hidden text-2xl text-signal-ice md:block" aria-hidden="true">→</span>
      <div>
        <p className="text-eyebrow text-signal-mint">03 / {copy("COMPOSITE", "합성 결과")}</p>
        <div className="mt-3 flex aspect-[5/3] items-center justify-center border border-border-default bg-[#54728b]"><div className="size-24 rounded-full border border-white/30 bg-[#d58d9b] shadow-xl" style={{ opacity }} aria-hidden="true" /></div>
        <p className="mt-2 text-xs text-text-secondary">{copy("The visible output", "최종 화면")}</p>
      </div>
    </div>
    <label className="mt-7 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center" htmlFor="alpha-control">
      <span className="text-sm text-text-primary">{copy("Foreground Alpha", "전경 Alpha")}</span>
      <input id="alpha-control" type="range" min="0" max="100" value={alpha} onChange={(event) => setAlpha(Number(event.currentTarget.value))} className="w-full accent-[#a9c7d8]" aria-valuetext={`${alpha}%`} />
      <output htmlFor="alpha-control" className="min-w-14 font-mono text-sm text-signal-ice" aria-live="polite">{alpha}%</output>
    </label>
    <p className="mt-5 overflow-x-auto border-t border-border-subtle pt-4 font-mono text-sm leading-7 text-signal-ice" aria-label={copy("Compositing equation for an opaque backdrop", "불투명 배경에서의 합성식")}>
      Cₒ = {opacity.toFixed(2)}Cₛ + {(1 - opacity).toFixed(2)}Cᵦ
    </p>
    <figcaption className="mt-3 text-xs leading-6 text-text-secondary">{copy("Interactive source-over example. The backdrop is opaque; changing Alpha adjusts the foreground contribution and the remaining backdrop contribution.", "Source-over 합성을 보여주는 조작형 예시입니다. 배경은 불투명하며, Alpha를 바꾸면 전경과 배경의 기여 비율이 달라집니다.")}</figcaption>
  </figure>;
}
