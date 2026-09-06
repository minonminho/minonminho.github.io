import type {
  Candidate,
  CandidateSourceProfile,
  RuleScoreResult,
  TalentSearchQuery,
} from "@/lib/talentRadar/types";

const TECHNICAL_LANGUAGES = ["python", "rust", "go"];
const TRADING_SIGNALS = [
  "trading",
  "execution",
  "market microstructure",
  "market data",
  "exchange",
  "order book",
  "low latency",
];

function containsAny(value: string, terms: readonly string[]) {
  return terms.some((term) => value.includes(term));
}

function profileText(profile: CandidateSourceProfile) {
  return [
    profile.role,
    profile.company,
    profile.location,
    profile.experience,
    ...profile.skills,
    ...profile.evidence,
    ...profile.signals.map((signal) => signal.label),
  ]
    .join(" ")
    .toLowerCase();
}

export function calculateRuleScore(
  profile: CandidateSourceProfile,
  query: TalentSearchQuery,
): RuleScoreResult {
  const text = profileText(profile);
  const queryText = [query.role, ...query.tags].join(" ").toLowerCase();
  const scoreParts: { points: number; reason: string }[] = [];

  if (profile.location.toLowerCase().includes("korea")) {
    scoreParts.push({ points: 10, reason: "Korea location" });
  }

  if (profile.skills.some((skill) => TECHNICAL_LANGUAGES.includes(skill.toLowerCase()))) {
    scoreParts.push({ points: 10, reason: "Python / Rust / Go" });
  }

  if (containsAny(queryText, ["trading", "low latency", "execution", "market"])) {
    if (containsAny(text, TRADING_SIGNALS)) {
      scoreParts.push({ points: 20, reason: "Trading infrastructure signal" });
    }
  }

  if (queryText.includes("crypto") && text.includes("crypto")) {
    scoreParts.push({ points: 10, reason: "Crypto signal" });
  }

  if (
    profile.signals.some((signal) =>
      ["github", "pull-request", "repository", "open-source"].includes(signal.type),
    )
  ) {
    scoreParts.push({ points: 20, reason: "Open-source contribution" });
  }

  if (profile.signals.some((signal) => signal.type === "activity")) {
    scoreParts.push({ points: 10, reason: "Recent activity" });
  }

  if (containsAny(text, ["startup", "scale-up", "early-stage", "first infrastructure"])) {
    scoreParts.push({ points: 10, reason: "Startup experience" });
  }

  return {
    score: Math.min(100, scoreParts.reduce((total, part) => total + part.points, 0)),
    reasons: scoreParts.map((part) => part.reason),
  };
}

export function calculateFitScore(ruleScore: number, aiScore: number) {
  return Math.round(ruleScore * 0.45 + aiScore * 0.55);
}

export function rankCandidates(
  profiles: readonly CandidateSourceProfile[],
  query: TalentSearchQuery,
): Candidate[] {
  return profiles
    .map((profile) => {
      const ruleResult = calculateRuleScore(profile, query);
      const { simulatedAiScore: rawSimulatedAiScore, ...candidateProfile } = profile;
      const simulatedAiScore = rawSimulatedAiScore ?? 0;

      return {
        ...candidateProfile,
        ruleScore: ruleResult.score,
        aiScore: simulatedAiScore ?? null,
        fitScore: calculateFitScore(ruleResult.score, simulatedAiScore),
        ruleReasons: ruleResult.reasons,
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);
}
