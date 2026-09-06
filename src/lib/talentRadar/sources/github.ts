import { selectTalentEcosystem } from "@/lib/talentRadar/query";
import {
  detectDomainSignals,
  getPrimaryLanguages,
  hasRecentActivity,
  relevantRepository,
  scoreGitHubCandidate,
} from "@/lib/talentRadar/github/rules";
import {
  GitHubApiError,
  GitHubClient,
  type GitHubClientOptions,
  type GitHubContributorResponse,
  type GitHubRepositoryResponse,
  type GitHubUserResponse,
} from "@/lib/talentRadar/github/api";
import type {
  Candidate,
  CandidateSourceProfile,
  CompactCandidateProfile,
  DetailedTalentSource,
  RepositorySignal,
  TalentSearchQuery,
  TalentSearchResult,
} from "@/lib/talentRadar/types";

export { GitHubApiError } from "@/lib/talentRadar/github/api";

export const TALENT_RADAR_LIMITS = {
  maxRepositories: 3,
  contributorsPerRepository: 25,
  maxUniqueCandidates: 50,
  maxEnrichedCandidates: 20,
  maxResults: 10,
  repositoriesPerCandidate: 5,
} as const;

const MIN_RULE_SCORE = 20;

type ContributorRecord = {
  login: string;
  contributions: number;
  repositories: string[];
  avatarUrl?: string;
  profileUrl?: string;
};

type RepositoryIndex = Map<string, GitHubRepositoryResponse>;

function compactText(value: string | null | undefined, maxLength = 180) {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

function isNoiseContributor(contributor: GitHubContributorResponse) {
  const login = contributor.login?.toLowerCase().trim();
  if (!login) return true;
  if (contributor.type?.toLowerCase() === "bot") return true;
  if (login.endsWith("[bot]")) return true;
  return /^(dependabot|renovate|github-actions|semantic-release)([-[]|$)/.test(login);
}

function isRateLimitedResult(result: PromiseSettledResult<unknown>) {
  return result.status === "rejected" &&
    result.reason instanceof GitHubApiError &&
    result.reason.rateLimited;
}

function toRepositorySignal(repository: GitHubRepositoryResponse): RepositorySignal {
  return {
    name: repository.full_name,
    ...(repository.description ? { description: repository.description } : {}),
    ...(repository.language ? { language: repository.language } : {}),
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    ...(repository.updated_at ? { updatedAt: repository.updated_at } : {}),
    ...(repository.topics?.length ? { topics: repository.topics.slice(0, 8) } : {}),
  };
}

function normalizeRepositorySignals(
  record: ContributorRecord,
  repositoryIndex: RepositoryIndex,
  userRepositories: readonly GitHubRepositoryResponse[],
  ecosystemKeywords: readonly string[],
) {
  const targetRepositories = record.repositories
    .map((fullName) => repositoryIndex.get(fullName.toLowerCase()))
    .filter((repository): repository is GitHubRepositoryResponse => Boolean(repository));
  const relevantUserRepositories = userRepositories.filter((repository) =>
    relevantRepository(toRepositorySignal(repository), ecosystemKeywords),
  );

  const combined = [...targetRepositories, ...relevantUserRepositories];
  const seen = new Set<string>();
  return combined
    .filter((repository) => {
      if (seen.has(repository.full_name)) return false;
      seen.add(repository.full_name);
      return true;
    })
    .slice(0, TALENT_RADAR_LIMITS.repositoriesPerCandidate)
    .map(toRepositorySignal);
}

function toCandidateSignal(
  type: string,
  label: string,
  strength: number,
) {
  return { type, label, strength: Math.max(0, Math.min(1, strength)) };
}

function buildCandidate(
  record: ContributorRecord,
  user: GitHubUserResponse,
  repositorySignals: readonly RepositorySignal[],
  ecosystemLabel: string,
): { candidate: Candidate; compactProfile: CompactCandidateProfile } {
  const headline = compactText(user.bio);
  const profileText = [
    headline ?? "",
    ecosystemLabel,
    ...repositorySignals.flatMap((repository) => [
      repository.name,
      repository.description ?? "",
      ...(repository.topics ?? []),
    ]),
  ];
  const primaryLanguages = getPrimaryLanguages(repositorySignals);
  const domainSignals = detectDomainSignals(profileText);
  const recentActivity = hasRecentActivity(repositorySignals);
  const activitySignals = {
    publicRepos: user.public_repos,
    followers: user.followers,
    recentActivity,
  };
  const ruleResult = scoreGitHubCandidate({
    primaryLanguages,
    domainSignals,
    repositorySignals,
    contributedRepositoryCount: record.repositories.length,
    recentActivity,
  });
  const evidence = [
    ...record.repositories.map((repository) => `Contributor to ${repository}`),
    ...(primaryLanguages.length
      ? [`${primaryLanguages.join(", ")} appear across public repositories`]
      : []),
    ...(domainSignals.length
      ? [`${domainSignals.join(", ")} signals found in repository metadata`]
      : []),
    ...(recentActivity ? ["Public repositories updated within the last 6 months"] : []),
  ];
  const concerns = [
    "GitHub activity does not establish production ownership or hiring suitability",
  ];
  if (!user.company) concerns.push("No company is listed on the public profile");
  if (!user.location) concerns.push("No location is listed on the public profile");

  const compactProfile: CompactCandidateProfile = {
    id: `github-${user.login}`,
    source: "github",
    name: user.name?.trim() || user.login,
    username: user.login,
    ...(headline ? { headline } : {}),
    ...(user.company ? { company: user.company.trim() } : {}),
    ...(user.location ? { location: user.location.trim() } : {}),
    profileUrl: user.html_url,
    avatarUrl: user.avatar_url,
    primaryLanguages,
    domainSignals,
    repositorySignals,
    activitySignals,
    ruleScore: ruleResult.score,
    ruleReasons: ruleResult.reasons,
    evidence,
  };

  const candidate: Candidate = {
    id: compactProfile.id,
    source: "github",
    name: compactProfile.name,
    username: user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    role: headline || "GitHub contributor",
    company: user.company?.trim() || "Company not listed",
    location: user.location?.trim() || "Location not listed",
    experience: `${user.public_repos} public repositories · ${user.followers} followers`,
    skills: [...primaryLanguages, ...domainSignals.map((signal) => signal[0].toUpperCase() + signal.slice(1))],
    evidence,
    concerns,
    signals: [
      toCandidateSignal("github", `@${user.login}`, 1),
      toCandidateSignal(
        "repository",
        `${repositorySignals.length} relevant public repositories`,
        Math.min(1, repositorySignals.length / 5),
      ),
      toCandidateSignal(
        "open-source",
        `Contributor to ${record.repositories.length} target repositor${record.repositories.length === 1 ? "y" : "ies"}`,
        Math.min(1, record.repositories.length / 3),
      ),
      toCandidateSignal(
        "activity",
        recentActivity ? "Updated within the last 6 months" : "No update in the last 6 months",
        recentActivity ? 1 : 0.2,
      ),
    ],
    aiReasonCodes: [],
    ruleReasons: ruleResult.reasons,
    primaryLanguages,
    domainSignals,
    repositorySignals,
    activitySignals,
    compactProfile,
    ruleScore: ruleResult.score,
    aiScore: null,
    fitScore: ruleResult.score,
  };

  return { candidate, compactProfile };
}

export class GitHubTalentSource implements DetailedTalentSource {
  private readonly clientOptions: GitHubClientOptions;

  constructor(options: GitHubClientOptions = {}) {
    this.clientOptions = options;
  }

  async search(query: TalentSearchQuery): Promise<readonly CandidateSourceProfile[]> {
    const result = await this.searchDetailed(query);
    return result.candidates;
  }

  async searchDetailed(query: TalentSearchQuery): Promise<TalentSearchResult> {
    const client = new GitHubClient(this.clientOptions);
    let rateLimitEncountered = false;
    const ecosystem = selectTalentEcosystem(query);
    const repositories = ecosystem.repositories.slice(0, TALENT_RADAR_LIMITS.maxRepositories);
    const repositoryResults = await Promise.allSettled(
      repositories.map((repository) => client.getRepository(repository)),
    );
    const successfulRepositories = repositoryResults.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    const failedRepositories = repositoryResults.filter((result) => result.status === "rejected");
    rateLimitEncountered ||= repositoryResults.some(isRateLimitedResult);

    if (!successfulRepositories.length) {
      const rateLimitError = repositoryResults.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected" && result.reason instanceof GitHubApiError && result.reason.rateLimited,
      )?.reason;
      if (rateLimitError) throw rateLimitError;
      throw new GitHubApiError("No configured GitHub repositories could be read.", 502);
    }

    const repositoryIndex: RepositoryIndex = new Map(
      successfulRepositories.map((repository) => [repository.full_name.toLowerCase(), repository]),
    );
    const contributorResults = await Promise.allSettled(
      successfulRepositories.map((repository) =>
        client.getContributors(repository.full_name, TALENT_RADAR_LIMITS.contributorsPerRepository),
      ),
    );
    rateLimitEncountered ||= contributorResults.some(isRateLimitedResult);
    const contributorsDiscovered = contributorResults.reduce(
      (total, result) => total + (result.status === "fulfilled" ? result.value.length : 0),
      0,
    );
    const candidateMap = new Map<string, ContributorRecord>();

    contributorResults.forEach((result, index) => {
      if (result.status !== "fulfilled") return;
      const repository = successfulRepositories[index];
      for (const contributor of result.value) {
        if (
          isNoiseContributor(contributor) ||
          !contributor.login ||
          (!contributor.avatar_url && !contributor.html_url)
        ) continue;
        const loginKey = contributor.login.toLowerCase();
        const existing = candidateMap.get(loginKey);
        if (existing) {
          existing.contributions += contributor.contributions ?? 0;
          if (!existing.repositories.includes(repository.full_name)) {
            existing.repositories.push(repository.full_name);
          }
          continue;
        }
        if (candidateMap.size >= TALENT_RADAR_LIMITS.maxUniqueCandidates) continue;
        candidateMap.set(loginKey, {
          login: contributor.login,
          contributions: contributor.contributions ?? 0,
          repositories: [repository.full_name],
          ...(contributor.avatar_url ? { avatarUrl: contributor.avatar_url } : {}),
          ...(contributor.html_url ? { profileUrl: contributor.html_url } : {}),
        });
      }
    });

    const shortlist = [...candidateMap.values()]
      .sort((a, b) => b.repositories.length - a.repositories.length || b.contributions - a.contributions)
      .slice(0, TALENT_RADAR_LIMITS.maxEnrichedCandidates);
    const enrichmentResults = await Promise.allSettled(
      shortlist.map(async (record) => {
        const user = await client.getUser(record.login);
        let userRepositories: readonly GitHubRepositoryResponse[] = [];
        try {
          userRepositories = await client.getUserRepositories(
            record.login,
            TALENT_RADAR_LIMITS.repositoriesPerCandidate,
          );
        } catch (error) {
          // Profile data remains useful if the optional repository listing fails.
          rateLimitEncountered ||= error instanceof GitHubApiError && error.rateLimited;
        }
        const repositorySignals = normalizeRepositorySignals(
          record,
          repositoryIndex,
          userRepositories,
          ecosystem.keywords,
        );
        return buildCandidate(record, user, repositorySignals, ecosystem.label);
      }),
    );
    const enriched = enrichmentResults.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    rateLimitEncountered ||= enrichmentResults.some(isRateLimitedResult);
    if (rateLimitEncountered && !enriched.length) {
      throw new GitHubApiError(
        "GitHub API rate limit reached while enriching candidates.",
        429,
        true,
      );
    }
    const rulePassed = enriched
      .filter(({ candidate }) => candidate.ruleScore >= MIN_RULE_SCORE)
      .sort((a, b) => b.candidate.fitScore - a.candidate.fitScore)
      .slice(0, TALENT_RADAR_LIMITS.maxResults);
    const candidates = rulePassed.map(({ candidate }) => candidate);
    const compactProfiles = rulePassed.map(({ compactProfile }) => compactProfile);
    const warningParts = [
      !client.hasToken
        ? "GITHUB_TOKEN is not configured; unauthenticated GitHub rate limits apply."
        : undefined,
      failedRepositories.length
        ? "Some configured repositories could not be read; available sources were used."
        : undefined,
      rateLimitEncountered
        ? "GitHub rate limits were reached during enrichment; successful profiles are shown."
        : undefined,
    ].filter((warning): warning is string => Boolean(warning));
    const metrics = {
      repositoriesScanned: successfulRepositories.length,
      contributorsDiscovered,
      uniqueCandidates: candidateMap.size,
      candidatesAfterRules: enriched.filter(({ candidate }) => candidate.ruleScore >= MIN_RULE_SCORE).length,
      enrichedCandidates: enriched.length,
      returnedCandidates: candidates.length,
      githubRequestsPerformed: client.requestsPerformed,
    };

    console.info("[talent-radar] GitHub search", {
      ecosystem: ecosystem.id,
      repositoriesScanned: metrics.repositoriesScanned,
      githubRequestsPerformed: metrics.githubRequestsPerformed,
      contributorsDiscovered: metrics.contributorsDiscovered,
      uniqueCandidates: metrics.uniqueCandidates,
      enrichedCandidates: metrics.enrichedCandidates,
      returnedCandidates: metrics.returnedCandidates,
      cache: this.clientOptions.cacheSeconds
        ? "Next fetch cache, 15 minutes"
        : "Worker response cache, 15 minutes",
    });

    return {
      candidates,
      compactProfiles,
      metrics,
      ...(warningParts.length ? { warning: warningParts.join(" ") } : {}),
    };
  }
}
