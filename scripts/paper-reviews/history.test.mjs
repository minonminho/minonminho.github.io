import test from "node:test";
import assert from "node:assert/strict";
import { assertNoDuplicatePaperIds, normalizePaperId, parseReviewMetadata } from "./history.mjs";

test("canonical IDs normalize arXiv prefixes and version suffixes", () => {
  assert.equal(normalizePaperId("arXiv:2610.24738v1"), "2610.24738");
  assert.equal(normalizePaperId("https://arxiv.org/abs/2610.24738v2"), "2610.24738");
});

test("review frontmatter can be read from Markdown", () => {
  const parsed = parseReviewMetadata('---\n{"slug":"sample","canonicalId":"arxiv:2610.00001"}\n---\n# body');
  assert.equal(parsed.slug, "sample");
  assert.equal(parsed.canonicalId, "arxiv:2610.00001");
});

test("history deduplication rejects a paper already featured in another format", () => {
  assert.throws(() => assertNoDuplicatePaperIds([
    { paperId: "2610.24738", source: "legacy highlight" },
    { paperId: "arxiv:2610.24738v1", source: "markdown review" },
  ]), /appears twice/);
});
