import type { Candidate, CompactCandidateProfile } from "@/lib/talentRadar/types";

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Converts the public API's compact shape into the existing card view model. */
export function candidateFromCompactProfile(profile: CompactCandidateProfile): Candidate {
  const signals = [
    {
      type: "github",
      label: "@" + profile.username,
      strength: 1,
    },
    {
      type: "repository",
      label: String(profile.repositorySignals.length) + " relevant public repositories",
      strength: Math.min(1, profile.repositorySignals.length / 5),
    },
    {
      type: "activity",
      label: profile.activitySignals.recentActivity
        ? "Updated within the last 6 months"
        : "No update in the last 6 months",
      strength: profile.activitySignals.recentActivity ? 1 : 0.2,
    },
  ];
  const languages = [...profile.primaryLanguages];
  const domains = profile.domainSignals.map(titleCase);

  return {
    id: profile.id,
    source: "github",
    name: profile.name,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    profileUrl: profile.profileUrl,
    role: profile.headline ?? "GitHub contributor",
    company: profile.company ?? "Company not listed",
    location: profile.location ?? "Location not listed",
    experience: String(profile.activitySignals.publicRepos) + " public repositories",
    skills: [...languages, ...domains],
    evidence: [...profile.evidence],
    concerns: [
      "GitHub activity does not establish production ownership or hiring suitability",
    ],
    signals,
    aiReasonCodes: [],
    ruleReasons: [...(profile.ruleReasons ?? [])],
    primaryLanguages: languages,
    domainSignals: [...profile.domainSignals],
    repositorySignals: [...profile.repositorySignals],
    activitySignals: profile.activitySignals,
    compactProfile: profile,
    ruleScore: profile.ruleScore,
    aiScore: null,
    fitScore: profile.ruleScore,
  };
}
