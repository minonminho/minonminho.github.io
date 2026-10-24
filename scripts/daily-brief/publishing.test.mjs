import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateBrief, isPrimaryUrl } from "./schema.mjs";

const fixture = JSON.parse(await readFile(new URL("../../content/daily-brief/2026-10-24.json", import.meta.url), "utf8"));
const copy = () => structuredClone(fixture);

function rejects(mutations) {
  for (const mutate of mutations) {
    const brief = copy();
    mutate(brief);
    assert.throws(() => validateBrief(brief));
  }
}

test("the inaugural edition resolves all citations and Korean notes", () => {
  assert.equal(validateBrief(copy(), "2026-10-24").date, "2026-10-24");
});

test("a filename/date mismatch cannot create an incorrectly dated route", () => {
  assert.throws(() => validateBrief(copy(), "2026-10-25"), /filename/);
});

test("invalid calendar dates and future-dated evidence cannot be published", () => {
  rejects([
    (brief) => { brief.date = "2026-02-30"; },
    (brief) => { brief.sources[0].publishedDate = "2099-01-01"; },
    (brief) => { brief.sections[0].items[0].publishedDate = "2026-13-01"; },
    (brief) => { brief.publishedAt = "2026-10-23T00:00:00Z"; },
  ]);
});

test("primary-source URLs reject scripts, credentials, and lookalike domains", () => {
  assert.equal(isPrimaryUrl("https://openai.com/index/oracle/"), true);
  for (const url of ["javascript:alert(1)", "https://openai.com.evil.example/article", "http://openai.com/", "https://someone:secret@openai.com/", "https://127.0.0.1/private"]) {
    assert.equal(isPrimaryUrl(url), false);
    const brief = copy(); brief.sources[0].url = url;
    assert.throws(() => validateBrief(brief));
  }
});

test("unresolved, unused, or duplicate sources block publication", () => {
  rejects([
    (brief) => { brief.sections[0].items[0].sourceIds = ["missing-source"]; },
    (brief) => { brief.sources.push({ ...brief.sources[0] }); },
    (brief) => { brief.sections[1].items[0].sourceIds = ["google-preview"]; },
  ]);
});

test("broken glossary references and unreadable note locations are rejected", () => {
  rejects([
    (brief) => { brief.focus += " Missing note[99]."; },
    (brief) => { brief.glossary.pop(); },
    (brief) => { brief.glossary[0].id = 2; },
    (brief) => { brief.sections[0].items[0].title += "[1]"; },
  ]);
});

test("a quiet edition may omit all news without manufacturing stories or sources", () => {
  const brief = copy();
  brief.sections.forEach((section) => { section.items = []; });
  brief.sources = [];
  brief.glossary = brief.glossary.slice(0, 3);
  brief.focus = "No material development was verified today. Use the experiment to practice formal verification[1], defining an invariant[2], and assessing a private preview[3].";
  brief.experiment.steps = ["Choose a small public function.", "Define inputs and expected outputs.", "Run the tests and inspect failures."];
  brief.experiment.measure = "Count how many claims you could verify from the original public documents.";
  assert.doesNotThrow(() => validateBrief(brief));
});
