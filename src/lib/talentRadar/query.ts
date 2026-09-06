import {
  DEFAULT_ECOSYSTEM_ID,
  getTalentEcosystem,
  TALENT_ECOSYSTEMS,
  type TalentEcosystem,
} from "@/lib/talentRadar/ecosystems";
import type { TalentSearchQuery } from "@/lib/talentRadar/types";

const MAX_ROLE_LENGTH = 120;
const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 40;

export function parseTalentSearchQuery(value: unknown): TalentSearchQuery | null {
  if (!value || typeof value !== "object") return null;

  const input = value as { role?: unknown; tags?: unknown };
  if (typeof input.role !== "string") return null;

  const role = input.role.trim();
  if (!role || role.length > MAX_ROLE_LENGTH) return null;

  if (input.tags === undefined) return { role, tags: [] };
  if (!Array.isArray(input.tags)) return null;
  const tags = input.tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0 && tag.length <= MAX_TAG_LENGTH)
    .slice(0, MAX_TAGS);

  if (tags.length !== input.tags.length) return null;
  return { role, tags };
}

export function selectTalentEcosystem(query: TalentSearchQuery): TalentEcosystem {
  const queryText = [query.role, ...query.tags].join(" ").toLowerCase();
  const matched = TALENT_ECOSYSTEMS.find((ecosystem) =>
    ecosystem.keywords.some((keyword) => queryText.includes(keyword)),
  );

  return matched ?? getTalentEcosystem(DEFAULT_ECOSYSTEM_ID)!;
}
