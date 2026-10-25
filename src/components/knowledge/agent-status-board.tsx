"use client";

import { useEffect, useState } from "react";
import { useBriefLanguage } from "@/components/daily-brief/language";
import type { KnowledgeJob } from "@/lib/knowledge/types";

const statusCopy: Record<KnowledgeJob["status"], { en: string; ko: string }> = {
  queued: { en: "Queued", ko: "대기" },
  processing: { en: "Processing", ko: "처리 중" },
  validated: { en: "Validated", ko: "검증 완료" },
  published: { en: "Published", ko: "게시 완료" },
  awaiting_configuration: { en: "Awaiting AI config", ko: "AI 설정 대기" },
  failed: { en: "Failed", ko: "실패" },
};

export function AgentStatusBoard({ initialJobs, apiBaseUrl = "" }: { initialJobs: KnowledgeJob[]; apiBaseUrl?: string }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [connected, setConnected] = useState(false);
  const { language, copy } = useBriefLanguage();
  useEffect(() => {
    if (!apiBaseUrl) return;
    const controller = new AbortController();
    const refresh = () => fetch(`${apiBaseUrl.replace(/\/$/, "")}/knowledge/jobs`, { signal: controller.signal })
        .then((response) => response.ok ? response.json() as Promise<{ jobs: KnowledgeJob[] }> : Promise.reject(new Error("Status unavailable")))
        .then((value) => { setJobs(value.jobs); setConnected(true); })
        .catch(() => { if (!controller.signal.aborted) setConnected(false); });
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [apiBaseUrl]);

  return <>
    <div className="mt-8 border-l-2 border-signal-ice pl-4 text-sm leading-7 text-text-secondary">
      <p>{connected ? copy("Live status from the configured Knowledge Worker.", "연결된 Knowledge Worker의 실시간 상태입니다.") : copy("Showing the local validation record. Cloudflare Worker and D1 have not been deployed or connected.", "로컬 검증 기록을 표시합니다. Cloudflare Worker와 D1은 아직 배포·연결되지 않았습니다.")}</p>
    </div>
    <div className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
      {jobs.map((job) => <article key={job.id} className="grid gap-4 py-6 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-start">
        <p className="font-mono text-xs text-text-tertiary">{job.environment === "cloud" ? "CLOUD" : "LOCAL TEST"}</p>
        <div><h2 className="text-sm font-semibold text-text-primary">{job.paperId}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{job.message}</p><p className="mt-2 font-mono text-[10px] text-text-tertiary">{copy("Terms", "용어")} {job.termsSeen} · {copy("new concepts", "신규 개념")} {job.newConcepts} · {copy("model calls", "모델 호출")} {job.modelCalls} · {copy("estimated tokens", "추정 토큰")} {job.estimatedTokens}</p></div>
        <span className={`inline-flex min-h-8 items-center border px-3 font-mono text-[10px] uppercase tracking-wide ${job.status === "failed" ? "border-signal-dust text-signal-dust" : job.status === "awaiting_configuration" ? "border-border-default text-text-tertiary" : "border-signal-mint text-signal-mint"}`}>{statusCopy[job.status][language]}</span>
      </article>)}
      {jobs.length === 0 && <p className="py-12 text-sm text-text-secondary">{copy("No Knowledge jobs have run yet.", "아직 실행된 Knowledge 작업이 없습니다.")}</p>}
    </div>
  </>;
}
