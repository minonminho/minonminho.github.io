import type { AiScoreResult, Candidate } from "@/lib/talentRadar/types";

export async function scoreCandidate(candidate: Candidate): Promise<AiScoreResult> {
  // TODO: Send only this compact candidate profile to a lightweight model in production.
  // Deep analysis should be a separate, lazy call for the final recommended candidates.
  if (candidate.aiScore === null) {
    return {
      score: candidate.ruleScore,
      reasonCodes: [],
    };
  }
  return {
    score: candidate.aiScore,
    reasonCodes: candidate.aiReasonCodes,
  };
}
