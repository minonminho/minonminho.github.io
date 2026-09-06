import { talentRadarCandidates } from "@/data/talentRadarCandidates";
import type {
  CandidateSourceProfile,
  TalentSearchQuery,
  TalentSource,
} from "@/lib/talentRadar/types";

export class MockTalentSource implements TalentSource {
  async search(query: TalentSearchQuery): Promise<readonly CandidateSourceProfile[]> {
    // The mock keeps the source boundary identical to a future GitHub adapter.
    void query;
    return talentRadarCandidates;
  }
}

export const mockTalentSource = new MockTalentSource();

// Future adapters can implement TalentSource without changing the demo UI:
// GitHubTalentSource, WebTalentSource, and ConferenceTalentSource.
