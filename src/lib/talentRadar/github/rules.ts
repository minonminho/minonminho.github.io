import type {
  RepositorySignal,
  RuleScoreResult,
} from "@/lib/talentRadar/types";

export const DOMAIN_KEYWORDS = {
  trading: [
    "trading",
    "exchange",
    "market making",
    "order book",
    "execution",
    "arbitrage",
    "market data",
  ],
  crypto: [
    "crypto",
    "blockchain",
    "ethereum",
    "bitcoin",
    "solana",
    "web3",
    "defi",
  ],
  infrastructure: [
    "distributed",
    "low latency",
    "streaming",
    "queue",
    "concurrency",
    "performance",
    "infrastructure",
  ],
} as const;

const LANGUAGE_KEYWORDS = ["python", "rust", "go"] as const;

function containsAny(value: string, keywords: readonly string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function repositoryText(repository: RepositorySignal) {
  return [repository.name, repository.description, ...(repository.topics ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function detectDomainSignals(values: readonly string[]) {
  const text = values.join(" ").toLowerCase();
  return (Object.entries(DOMAIN_KEYWORDS) as [keyof typeof DOMAIN_KEYWORDS, readonly string[]][])
    .filter(([, keywords]) => containsAny(text, keywords))
    .map(([category]) => category);
}

export function getPrimaryLanguages(repositories: readonly RepositorySignal[]) {
  const counts = new Map<string, number>();
  for (const repository of repositories) {
    if (!repository.language) continue;
    counts.set(repository.language, (counts.get(repository.language) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([language]) => language);
}

export function hasRecentActivity(
  repositories: readonly RepositorySignal[],
  now = Date.now(),
) {
  const recentWindow = 180 * 24 * 60 * 60 * 1000;
  return repositories.some((repository) => {
    if (!repository.updatedAt) return false;
    const updatedAt = Date.parse(repository.updatedAt);
    return Number.isFinite(updatedAt) && now - updatedAt <= recentWindow;
  });
}

export function relevantRepository(
  repository: RepositorySignal,
  ecosystemKeywords: readonly string[],
) {
  return containsAny(
    repositoryText(repository),
    [...ecosystemKeywords, ...Object.values(DOMAIN_KEYWORDS).flat()],
  );
}

export type GitHubRuleInput = {
  primaryLanguages: readonly string[];
  domainSignals: readonly string[];
  repositorySignals: readonly RepositorySignal[];
  contributedRepositoryCount: number;
  recentActivity: boolean;
};

export function scoreGitHubCandidate(input: GitHubRuleInput): RuleScoreResult {
  const scoreParts: { points: number; reason: string }[] = [];
  const languages = input.primaryLanguages.map((language) => language.toLowerCase());

  if (languages.some((language) => LANGUAGE_KEYWORDS.includes(language as (typeof LANGUAGE_KEYWORDS)[number]))) {
    scoreParts.push({ points: 10, reason: "RELEVANT_LANGUAGE" });
  }

  if (languages.filter((language) => LANGUAGE_KEYWORDS.includes(language as (typeof LANGUAGE_KEYWORDS)[number])).length >= 2) {
    scoreParts.push({ points: 5, reason: "MULTIPLE_RELEVANT_LANGUAGES" });
  }

  if (input.domainSignals.includes("trading")) {
    scoreParts.push({ points: 20, reason: "TRADING_SIGNAL" });
  }
  if (input.domainSignals.includes("crypto")) {
    scoreParts.push({ points: 10, reason: "CRYPTO_SIGNAL" });
  }
  if (input.domainSignals.includes("infrastructure")) {
    scoreParts.push({ points: 10, reason: "INFRASTRUCTURE_SIGNAL" });
  }
  if (input.contributedRepositoryCount > 0) {
    scoreParts.push({ points: 20, reason: "TARGET_REPO_CONTRIBUTOR" });
  }
  if (input.repositorySignals.length >= 2) {
    scoreParts.push({ points: 10, reason: "MULTIPLE_RELEVANT_REPOSITORIES" });
  }
  if (input.recentActivity) {
    scoreParts.push({ points: 10, reason: "RECENT_ACTIVITY" });
  }

  return {
    score: Math.min(100, scoreParts.reduce((total, part) => total + part.points, 0)),
    reasons: scoreParts.map((part) => part.reason),
  };
}
