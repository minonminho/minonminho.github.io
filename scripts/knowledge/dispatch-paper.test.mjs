import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildEvent } from "./dispatch-paper.mjs";

const draftReview = readFileSync(new URL("../../content/paper-reviews/layereditor.md", import.meta.url), "utf8");

test("the dispatcher skips drafts and passes the existing bilingual terminology without re-extraction", () => {
  assert.equal(buildEvent(draftReview), null);
  const publishedReview = draftReview.replace('"reviewStatus": "draft"', '"reviewStatus": "published"');
  const event = buildEvent(publishedReview);
  assert.equal(event.paper.canonicalId, "arxiv:2610.24738");
  assert.equal(event.paper.hero.url, "https://arxiv.org/html/2610.24738v1/teaser.png");
  assert.equal(event.terminology.length, 5);
  assert.equal(event.terminology[1].term, "Alpha compositing");
  assert.equal(event.terminology[1].definition.ko, "투명도에 따라 앞 레이어와 뒤 이미지를 섞는 계산");
  assert.equal(event.sources.some((source) => source.url === event.paper.url), true);
  assert.match(event.revision, /^[a-f0-9]{64}$/);
});
