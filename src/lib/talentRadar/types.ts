export type CandidateSignal = {
  type: string;
  label: string;
  strength: number;
};

export type CandidateSource = "mock" | "github";

export type RepositorySignal = {
  name: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  updatedAt?: string;
  topics?: readonly string[];
};

export type ActivitySignals = {
  publicRepos: number;
  followers: number;
  recentActivity: boolean;
};

/** Deliberately compact output for a future reasoning layer. */
export type CompactCandidateProfile = {
  id: string;
  source: "github";
  name: string;
  username: string;
  headline?: string;
  company?: string;
  location?: string;
  profileUrl: string;
  avatarUrl?: string;
  primaryLanguages: readonly string[];
  domainSignals: readonly string[];
  repositorySignals: readonly RepositorySignal[];
  activitySignals: ActivitySignals;
  ruleScore: number;
  ruleReasons?: readonly string[];
  evidence: readonly string[];
};

export type CandidateSourceProfile = {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  experience: string;
  skills: readonly string[];
  evidence: readonly string[];
  concerns: readonly string[];
  signals: readonly CandidateSignal[];
  simulatedAiScore?: number;
  aiReasonCodes: readonly string[];
  ruleReasons?: readonly string[];
  source?: CandidateSource;
  username?: string;
  avatarUrl?: string;
  profileUrl?: string;
  primaryLanguages?: readonly string[];
  domainSignals?: readonly string[];
  repositorySignals?: readonly RepositorySignal[];
  activitySignals?: ActivitySignals;
  compactProfile?: CompactCandidateProfile;
};

export type Candidate = Omit<CandidateSourceProfile, "simulatedAiScore"> & {
  ruleScore: number;
  aiScore: number | null;
  fitScore: number;
  ruleReasons: readonly string[];
};

export type TalentSearchQuery = {
  role: string;
  tags: readonly string[];
};

export type RuleScoreResult = {
  score: number;
  reasons: readonly string[];
};

export type AiScoreResult = {
  score: number;
  reasonCodes: readonly string[];
};

export type TalentSearchMetrics = {
  repositoriesScanned: number;
  contributorsDiscovered: number;
  uniqueCandidates: number;
  candidatesAfterRules: number;
  enrichedCandidates: number;
  returnedCandidates: number;
  githubRequestsPerformed?: number;
};

export type TalentSearchResult = {
  candidates: readonly Candidate[];
  compactProfiles: readonly CompactCandidateProfile[];
  metrics: TalentSearchMetrics;
  warning?: string;
};

export type TalentRadarApiResponse = {
  candidates: readonly CompactCandidateProfile[];
  metrics: TalentSearchMetrics;
  warning?: string;
  error?: string;
};

export interface TalentSource {
  search(query: TalentSearchQuery): Promise<readonly CandidateSourceProfile[]>;
}

export interface DetailedTalentSource extends TalentSource {
  searchDetailed(query: TalentSearchQuery): Promise<TalentSearchResult>;
}
