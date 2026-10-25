import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { processPaper } from "./process-paper.mjs";

test("a paper creates one concept, and a repeated event is idempotent", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "knowledge-pipeline-"));
  try {
    const sourceRoot = process.cwd();
    for (const directory of ["content/paper-reviews", "content/knowledge", "public/knowledge"]) {
      cpSync(path.join(sourceRoot, directory), path.join(root, directory), { recursive: true });
    }
    writeFileSync(path.join(root, "content/knowledge/registry.json"), JSON.stringify({
      schemaVersion: 1,
      concepts: [],
      paperConcepts: [],
      termsIndex: [{ id: "concept:alpha-compositing", slug: "alpha-compositing", canonicalName: { en: "Alpha compositing", ko: "Alpha 합성" }, aliases: ["alpha blending", "알파 합성"], definition: { en: "Existing English definition", ko: "기존 한국어 정의" }, priorityScore: 1, sourcePapers: [], firstSeenAt: "2026-01-01T00:00:00.000Z", lastSeenAt: "2026-01-01T00:00:00.000Z", briefStatus: "awaiting_configuration" }],
      paperTerms: [],
      generationQueue: [],
    }));
    writeFileSync(path.join(root, "content/knowledge/jobs.json"), JSON.stringify({ jobs: [] }));
    const first = processPaper({ root, paperId: "arxiv:2610.24738", allowDraft: true, maxNewConcepts: 1 });
    const second = processPaper({ root, paperId: "arxiv:2610.24738", allowDraft: true, maxNewConcepts: 1 });
    const registry = JSON.parse(readFileSync(path.join(root, "content/knowledge/registry.json"), "utf8"));
    const jobs = JSON.parse(readFileSync(path.join(root, "content/knowledge/jobs.json"), "utf8"));
    assert.equal(first.created, 1);
    assert.equal(first.idempotent, false);
    assert.equal(first.indexed, 5);
    assert.equal(first.queued, 4);
    assert.equal(second.created, 0);
    assert.equal(second.idempotent, true);
    assert.equal(registry.concepts.length, 1);
    assert.equal(registry.paperConcepts.length, 1);
    assert.equal(registry.termsIndex.length, 5);
    assert.equal(registry.paperTerms.length, 5);
    assert.equal(registry.generationQueue.length, 4);
    assert.equal(jobs.jobs.length, 1);
    assert.equal(jobs.jobs[0].modelCalls, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
