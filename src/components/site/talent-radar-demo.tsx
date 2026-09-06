"use client";

import { Fragment, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  FlaskConical,
  Search,
} from "lucide-react";

import { SurfaceBlock } from "@/components/site/surface-block";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockTalentSource } from "@/lib/talentRadar/sources";
import { scoreCandidate } from "@/lib/talentRadar/aiScoring";
import { calculateFitScore, rankCandidates } from "@/lib/talentRadar/scoring";
import { candidateFromCompactProfile } from "@/lib/talentRadar/presentation";
import type {
  Candidate,
  TalentSearchMetrics,
  TalentSearchQuery,
  TalentRadarApiResponse,
} from "@/lib/talentRadar/types";

const DEFAULT_ROLE = "Trading Platform Engineer";
const OPTIONAL_TAGS = [
  "Python",
  "Rust",
  "Distributed Systems",
  "Trading Infrastructure",
  "Crypto",
  "Low Latency",
];

const DEMO_METRICS: TalentSearchMetrics = {
  repositoriesScanned: 3,
  contributorsDiscovered: 1284,
  uniqueCandidates: 312,
  candidatesAfterRules: 18,
  enrichedCandidates: 67,
  returnedCandidates: 5,
};

const SOURCE_LABELS: Record<string, string> = {
  github: "GitHub profile",
  "pull-request": "Pull request",
  repository: "GitHub repository",
  "technical-writing": "Technical writing",
  conference: "Conference activity",
  "open-source": "Open-source community",
  community: "Community signal",
  activity: "Recent activity",
  startup: "Career context",
};

const RULE_REASON_LABELS: Record<string, string> = {
  RELEVANT_LANGUAGE: "Python, Rust, or Go signal",
  MULTIPLE_RELEVANT_LANGUAGES: "Multiple relevant languages",
  TRADING_SIGNAL: "Trading domain signal",
  CRYPTO_SIGNAL: "Crypto domain signal",
  INFRASTRUCTURE_SIGNAL: "Infrastructure signal",
  TARGET_REPO_CONTRIBUTOR: "Contributor to a target repository",
  MULTIPLE_RELEVANT_REPOSITORIES: "Multiple relevant repositories",
  RECENT_ACTIVITY: "Recent repository activity",
};

function readableRuleReason(reason: string) {
  return RULE_REASON_LABELS[reason] ?? reason;
}

function ScorePill({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="rounded-sm border border-border-subtle bg-surface-02 px-3 py-1.5 text-xs text-text-secondary">
      <span>{label}</span>{" "}
      <span className="font-mono font-semibold text-text-primary">{score ?? "-"}</span>
    </div>
  );
}

function CandidateAvatar({ candidate }: { candidate: Candidate }) {
  if (candidate.avatarUrl) {
    // GitHub avatars are public source data and are intentionally not optimized locally.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={candidate.avatarUrl} alt="" className="size-full object-cover" />;
  }

  return (
    <span aria-hidden="true">
      {candidate.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}

function Pipeline({
  metrics,
  mode,
}: {
  metrics: TalentSearchMetrics;
  mode: "live" | "demo";
}) {
  const stages = [
    {
      label: "Discovered",
      count: metrics.contributorsDiscovered,
      ai: "No LLM",
      description: String(metrics.repositoriesScanned) + " curated repositories",
    },
    {
      label: "Deduplicated",
      count: metrics.uniqueCandidates,
      ai: "No LLM",
      description: "Unique public profiles",
    },
    {
      label: "Enriched",
      count: metrics.enrichedCandidates,
      ai: "No LLM",
      description: "Compact GitHub profiles",
    },
    {
      label: "Rule-passed",
      count: metrics.candidatesAfterRules,
      ai: "No LLM",
      description: "Observable signal match",
    },
    {
      label: "Returned",
      count: metrics.returnedCandidates,
      ai: "No LLM",
      description: mode === "live" ? "Recruiter review queue" : "Fictional demo queue",
    },
  ] as const;

  return (
    <section className="site-shell section-space">
      <SurfaceBlock tone="deep">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-caption">Sourcing funnel</p>
            <h2 className="text-display-lg mt-4">Deterministic first.</h2>
          </div>
          <p className="text-body-sm max-w-md text-text-secondary">
            Every stage narrows the pool before model reasoning is introduced.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
          {stages.map((stage, index) => (
            <Fragment key={stage.label}>
              <div className="min-w-0 flex-1 rounded-md border border-border-default bg-surface-02 p-4">
                <p className="text-caption">{stage.label}</p>
                <p className="mt-4 font-mono text-3xl font-medium tracking-tight">
                  {stage.count.toLocaleString()}
                </p>
                <p className="mt-2 text-sm font-medium">{stage.ai}</p>
                <p className="mt-1 text-xs text-text-secondary">{stage.description}</p>
              </div>
              {index < stages.length - 1 && (
                <div className="flex items-center justify-center text-text-tertiary">
                  <ArrowRight className="hidden size-4 md:block" aria-hidden="true" />
                  <ArrowDown className="size-4 md:hidden" aria-hidden="true" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border-default pt-5 text-xs text-text-secondary">
          <span>
            <strong className="font-medium text-text-primary">No LLM</strong> - discovery,
            filtering, compression
          </span>
          <span>
            <strong className="font-medium text-text-primary">Phase 2</strong> -
            deterministic scoring only
          </span>
          <span>
            <strong className="font-medium text-text-primary">Human review</strong> - no
            automated hiring decision
          </span>
        </div>
        <p className="mt-5 text-xs text-text-tertiary">
          {mode === "live"
            ? "Metrics reflect this GitHub request. Public GitHub activity is a sourcing signal, not a hiring decision."
            : "Demo metrics are illustrative; the shortlist below uses fictional profiles."}
        </p>
      </SurfaceBlock>
    </section>
  );
}

function CandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: Candidate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={[
          "block w-full rounded-md border p-5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-ice/30",
          selected
            ? "border-signal-ice bg-surface-02"
            : "border-border-subtle bg-surface-01 hover:border-steel",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border-default bg-surface-03 font-mono text-xs text-text-secondary">
              <CandidateAvatar candidate={candidate} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-card-title">{candidate.name}</h3>
                {selected && <Badge variant="default">Selected</Badge>}
                {candidate.source === "github" && (
                  <Badge variant="outline">Public GitHub Data</Badge>
                )}
              </div>
              <p className="text-body-sm mt-1 font-medium">{candidate.role}</p>
              {candidate.username && (
                <p className="mt-1 font-mono text-xs text-text-tertiary">
                  @{candidate.username}
                </p>
              )}
              <p className="text-body-sm">
                {candidate.company} - {candidate.location}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-caption">Fit</p>
            <p className="mt-1 font-mono text-3xl font-medium tracking-tight">
              {candidate.fitScore}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <ScorePill label="Rule" score={candidate.ruleScore} />
          <ScorePill label="AI" score={candidate.aiScore} />
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-sm bg-surface-03">
          <div
            className="h-full rounded-sm bg-signal-ice"
            style={{ width: String(candidate.fitScore) + "%" }}
          />
        </div>

        <ul className="mt-5 space-y-2">
          {candidate.evidence.slice(0, 2).map((item) => (
            <li key={item} className="text-body-sm flex gap-2">
              <Check className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </button>

      {candidate.source === "github" && candidate.profileUrl && (
        <a
          href={candidate.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary underline-offset-4 hover:text-signal-ice hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-ice/30"
        >
          View GitHub Profile
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function WhyNot({ candidate, alternative }: { candidate: Candidate; alternative?: Candidate }) {
  if (!alternative) return null;

  const scoreDifference = Math.abs(candidate.ruleScore - alternative.ruleScore);
  const reason =
    alternative.source === "github" || candidate.source === "github"
      ? [
          alternative.name,
          " has ",
          String(scoreDifference),
          " fewer observable role signals in the deterministic layer (",
          String(alternative.ruleScore),
          " vs ",
          String(candidate.ruleScore),
          ").",
        ].join("")
      : alternative.ruleScore < candidate.ruleScore
        ? [
            alternative.name,
            " has strong ",
            alternative.skills.slice(0, 2).join(" and "),
            " depth, but the deterministic layer found ",
            String(scoreDifference),
            " fewer target-role signals (",
            String(alternative.ruleScore),
            " vs ",
            String(candidate.ruleScore),
            ").",
          ].join("")
        : [
            alternative.name,
            " has comparable rule-based coverage, but the lightweight AI score is lower (",
            String(alternative.aiScore),
            " vs ",
            String(candidate.aiScore),
            ") based on the strength of the available evidence.",
          ].join("");

  return (
    <div className="mt-8 border-t border-border-subtle pt-6">
      <p className="text-caption">Why not this candidate?</p>
      <p className="text-body-sm mt-3 text-text-secondary">{reason}</p>
      <p className="text-body-sm mt-3 text-text-tertiary">
        The ranking is decision support for a recruiter, not an automated hiring decision.
      </p>
    </div>
  );
}

function CandidateDetail({
  candidate,
  alternative,
}: {
  candidate: Candidate;
  alternative?: Candidate;
}) {
  const reasons = candidate.source === "github"
    ? candidate.ruleReasons
    : candidate.aiReasonCodes;

  return (
    <Card className="rounded-lg border-border-subtle bg-surface-01 shadow-none ring-0 lg:sticky lg:top-20">
      <CardHeader className="border-b border-border-subtle pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-caption">
              {candidate.source === "github" ? "Public GitHub data" : "Fictional demo data"}
            </p>
            <CardTitle className="mt-3 text-2xl font-medium">{candidate.name}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              {candidate.role} - {candidate.company}
            </CardDescription>
            <p className="mt-1 text-sm text-text-secondary">{candidate.location}</p>
            {candidate.username && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-text-tertiary">
                  @{candidate.username}
                </span>
                {candidate.profileUrl && (
                  <a
                    href={candidate.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary underline-offset-4 hover:text-signal-ice hover:underline focus-visible:outline-none"
                  >
                    View GitHub Profile
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="rounded-md bg-signal-ice px-3 py-2 text-center text-void">
            <p className="text-caption">Fit</p>
            <p className="font-mono text-2xl font-medium">{candidate.fitScore}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-7 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border-subtle bg-surface-02 p-3">
            <p className="text-caption">Rule score</p>
            <p className="mt-2 font-mono text-xl font-medium">{candidate.ruleScore}</p>
          </div>
          <div className="rounded-md border border-border-subtle bg-surface-02 p-3">
            <p className="text-caption">AI score</p>
            <p className="mt-2 font-mono text-xl font-medium">
              {candidate.aiScore ?? "Not run"}
            </p>
          </div>
        </div>

        {candidate.source === "github" && (
          <div className="space-y-4 border-y border-border-subtle py-5">
            <div>
              <p className="text-caption">Primary languages</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(candidate.primaryLanguages ?? []).map((language) => (
                  <Badge key={language} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-caption">Domain signals</p>
              <p className="text-body-sm mt-2 text-text-secondary">
                {(candidate.domainSignals ?? []).join(" - ") || "No matching domain keywords found"}
              </p>
            </div>
          </div>
        )}

        <section>
          <p className="text-caption">
            {candidate.source === "github"
              ? "Why this candidate - deterministic rules"
              : "Why this candidate"}
          </p>
          {reasons.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {reasons.map((reason) => (
                <li key={reason} className="text-body-sm flex gap-2">
                  <Check className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                  <span>{readableRuleReason(reason)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm mt-3 text-text-secondary">
              AI scoring is not connected for this data source.
            </p>
          )}
        </section>

        <section>
          <p className="text-caption">Observable signals</p>
          <div className="mt-4 space-y-3">
            {candidate.signals.map((signal) => (
              <div key={signal.type + "-" + signal.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{signal.label}</span>
                  <span className="font-mono text-xs">
                    {Math.round(signal.strength * 100)}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-sm bg-surface-03">
                  <div
                    className="h-full rounded-sm bg-signal-ice"
                    style={{ width: String(signal.strength * 100) + "%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-caption">Potential concerns</p>
          <ul className="mt-3 space-y-2">
            {candidate.concerns.map((concern) => (
              <li key={concern} className="text-body-sm text-text-secondary">
                - {concern}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-caption">Source evidence</p>
          <ul className="mt-3 space-y-2">
            {candidate.signals.map((signal) => (
              <li
                key={signal.type + "-source-" + signal.label}
                className="text-body-sm text-text-secondary"
              >
                <span className="font-medium">{SOURCE_LABELS[signal.type] ?? signal.type}</span>
                <span className="mx-2 text-text-tertiary">-</span>
                {signal.label}
              </li>
            ))}
          </ul>
        </section>

        {candidate.source === "github" && (candidate.repositorySignals?.length ?? 0) > 0 && (
          <section>
            <p className="text-caption">Repository evidence</p>
            <ul className="mt-3 space-y-3">
              {candidate.repositorySignals?.slice(0, 3).map((repository) => (
                <li
                  key={repository.name}
                  className="text-body-sm border-l border-border-default pl-3"
                >
                  <p className="font-medium text-text-primary">{repository.name}</p>
                  <p className="mt-1 text-text-secondary">
                    {[
                      repository.language,
                      repository.stars !== undefined
                        ? String(repository.stars.toLocaleString()) + " stars"
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <WhyNot candidate={candidate} alternative={alternative} />

        <div className="rounded-md border border-border-subtle bg-surface-02 p-4">
          <p className="text-caption">
            {candidate.source === "github" ? "Public GitHub data" : "Fictional demo data"}
          </p>
          <p className="text-body-sm mt-2 text-text-secondary">
            {candidate.source === "github"
              ? "Public profile and repository metadata only. GitHub activity is a sourcing signal, not a hiring decision."
              : "These identities and public-style evidence examples are fictional. No personal data is being sourced."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CostStrategy({
  metrics: searchMetrics,
  mode,
}: {
  metrics: TalentSearchMetrics;
  mode: "live" | "demo";
}) {
  const metrics = mode === "live"
    ? [
        ["Profiles discovered", searchMetrics.contributorsDiscovered.toLocaleString()],
        ["Profiles sent to LLM", "0"],
        ["Profiles sent to advanced model", "0"],
        ["LLM status", "Not connected"],
      ]
    : [
        ["Raw profiles discovered", "1,284"],
        ["Profiles sent to LLM", "67"],
        ["Profiles sent to advanced model", "5"],
        ["Estimated LLM reduction", "~95%"],
      ];

  return (
    <section className="site-shell section-space">
      <SurfaceBlock tone="deep">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <p className="text-caption">Token economics</p>
            <h2 className="text-display-lg mt-4">AI Cost Strategy</h2>
            <p className="text-body-sm mt-6 max-w-md text-text-secondary">
              LLM usage is intentionally delayed until deterministic filters have reduced the
              candidate pool.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border-default bg-border-default sm:grid-cols-2">
            {metrics.map(([label, value]) => (
              <div key={label} className="bg-surface-03 p-5">
                <p className="text-caption">{label}</p>
                <p className="mt-3 font-mono text-3xl font-medium tracking-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-8 border-t border-border-default pt-5 text-xs text-text-tertiary">
          {mode === "live"
            ? "Phase 2 makes no LLM calls. Compact profiles are prepared for the future scoring layer."
            : "Demo reduction is illustrative, not a production cost estimate."}
        </p>
      </SurfaceBlock>
    </section>
  );
}

export function TalentRadarDemo() {
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [metrics, setMetrics] = useState<TalentSearchMetrics | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedId);
  const selectedIndex = selectedCandidate
    ? candidates.findIndex((candidate) => candidate.id === selectedCandidate.id)
    : -1;
  const alternative = selectedIndex >= 0 ? candidates[selectedIndex + 1] : undefined;

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  function selectMode(nextMode: "live" | "demo") {
    setMode(nextMode);
    setHasSearched(false);
    setCandidates([]);
    setMetrics(null);
    setSelectedId(null);
    setSearchError(null);
    setWarning(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    setWarning(null);

    const query: TalentSearchQuery = {
      role: role.trim() || DEFAULT_ROLE,
      tags: selectedTags,
    };
    const configuredApiUrl = process.env.NEXT_PUBLIC_TALENT_RADAR_API_URL
      ?.trim()
      .replace(/\/+$/, "");
    let nextCandidates: Candidate[] = [];

    try {
      if (mode === "demo" || !configuredApiUrl) {
        if (mode === "live" && !configuredApiUrl) {
          setMode("demo");
          setWarning("Live API URL is not configured. Showing Demo Data instead.");
        }
        const profiles = await mockTalentSource.search(query);
        const ruleRanked = rankCandidates(profiles, query);
        const aiScores = await Promise.all(
          ruleRanked.map((candidate) => scoreCandidate(candidate)),
        );
        nextCandidates = ruleRanked
          .map((candidate, index) => ({
            ...candidate,
            aiScore: aiScores[index].score,
            aiReasonCodes: aiScores[index].reasonCodes,
            fitScore: calculateFitScore(candidate.ruleScore, aiScores[index].score),
          }))
          .sort((a, b) => b.fitScore - a.fitScore);
        setMetrics(DEMO_METRICS);
      } else {
        const response = await fetch(configuredApiUrl + "/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });
        const result = (await response.json()) as TalentRadarApiResponse;
        if (!response.ok || result.error) {
          throw new Error(result.error ?? "GitHub search is temporarily unavailable.");
        }
        nextCandidates = result.candidates.map(candidateFromCompactProfile);
        setMetrics(result.metrics);
        setWarning(result.warning ?? null);
      }

      setCandidates(nextCandidates);
      setSelectedId(nextCandidates[0]?.id ?? null);
      setHasSearched(true);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Search failed. Try again.");
      setCandidates([]);
      setMetrics(null);
      setSelectedId(null);
      setHasSearched(false);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <>
      <section className="site-shell section-space">
        <SurfaceBlock tone="raised">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="w-full max-w-3xl">
                <label htmlFor="talent-radar-role" className="text-caption">
                  Role definition
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="talent-radar-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="h-10 min-w-0 flex-1 rounded-md border border-border-default bg-surface-02 px-4 text-body-sm text-text-primary outline-none transition-colors duration-150 placeholder:text-text-tertiary focus:border-signal-ice focus:ring-2 focus:ring-signal-ice/20"
                    placeholder={DEFAULT_ROLE}
                  />
                  <Button type="submit" size="lg" disabled={isSearching}>
                    <Search className="size-4" aria-hidden="true" />
                    {isSearching ? "Scanning..." : "Find Talent"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <FlaskConical className="size-4 text-signal-ice" aria-hidden="true" />
                <div
                  className="flex rounded-sm border border-border-default bg-surface-02 p-0.5"
                  role="group"
                  aria-label="Search source"
                >
                  {(["live", "demo"] as const).map((searchMode) => (
                    <button
                      key={searchMode}
                      type="button"
                      aria-pressed={mode === searchMode}
                      onClick={() => selectMode(searchMode)}
                      className={[
                        "rounded-sm px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-ice/30",
                        mode === searchMode
                          ? "bg-signal-ice text-void"
                          : "text-text-secondary hover:text-text-primary",
                      ].join(" ")}
                    >
                      {searchMode === "live" ? "Live GitHub Search" : "Demo Data"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border-default pt-6">
              <p className="text-caption">Optional signals</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {OPTIONAL_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleTag(tag)}
                      className={[
                        "rounded-sm border px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-ice/30",
                        selected
                          ? "border-signal-ice bg-signal-ice text-void"
                          : "border-border-default bg-surface-02 text-text-secondary hover:border-steel hover:text-text-primary",
                      ].join(" ")}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {searchError && (
              <p
                role="alert"
                className="mt-6 border-l-2 border-signal-dust pl-3 text-body-sm text-signal-dust"
              >
                {searchError} Choose Demo Data to inspect the local fallback.
              </p>
            )}
            {warning && !searchError && (
              <p className="mt-6 border-l-2 border-signal-orbit pl-3 text-body-sm text-text-secondary">
                {warning}
              </p>
            )}
          </form>
        </SurfaceBlock>
      </section>

      {!hasSearched ? (
        <section className="site-shell section-space">
          <div className="border-t border-border-subtle pt-8">
            <p className="text-caption">Ready when you are</p>
            <p className="text-body-lg mt-4 max-w-2xl text-text-secondary">
              Define a target role and run the radar to see how deterministic filtering and
              selective AI reasoning work together.
            </p>
          </div>
        </section>
      ) : (
        <>
          <Pipeline metrics={metrics ?? DEMO_METRICS} mode={mode} />

          <section className="site-shell section-space">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-caption">Recruiter review queue</p>
                <h2 className="text-display-lg mt-4">
                  {mode === "live" ? "GitHub signals." : "Five recommendations."}
                </h2>
              </div>
              <span className="text-xs font-medium text-text-secondary">
                {mode === "live"
                  ? ["Public GitHub Data", candidates.length, "profiles"].join(" - ")
                  : ["Fictional demo data", 5, "profiles"].join(" - ")}
              </span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
              <div className="space-y-4">
                {candidates.length === 0 && (
                  <div className="border-l-2 border-border-default py-2 pl-4 text-body-sm text-text-secondary">
                    No candidates passed the deterministic filter for this search.
                  </div>
                )}
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    selected={candidate.id === selectedId}
                    onSelect={() => setSelectedId(candidate.id)}
                  />
                ))}
              </div>

              {selectedCandidate && (
                <CandidateDetail candidate={selectedCandidate} alternative={alternative} />
              )}
            </div>
          </section>

          <CostStrategy metrics={metrics ?? DEMO_METRICS} mode={mode} />
        </>
      )}

      <div className="site-shell flex justify-between gap-4 pb-24">
        <a
          href="#top"
          className="inline-flex items-center gap-2 text-body-sm font-medium text-text-secondary underline-offset-4 hover:text-signal-ice hover:underline focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to top
        </a>
        <p className="text-body-sm text-right text-text-tertiary">
          Human judgment stays in the loop.
        </p>
      </div>
    </>
  );
}
