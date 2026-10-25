export type PaperHistoryEntry = { paperId: string; source: string };
export function normalizePaperId(value: string): string;
export function parseReviewMetadata(markdown: string): Record<string, unknown> & { canonicalId: string; slug: string };
export function readPaperHistory(root?: string): PaperHistoryEntry[];
export function assertNoDuplicatePaperIds(entries: PaperHistoryEntry[]): void;
