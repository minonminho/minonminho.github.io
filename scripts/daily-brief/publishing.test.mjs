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
    (brief) => { brief.focus.en += " Missing note[99]."; },
    (brief) => { brief.glossary.pop(); },
    (brief) => { brief.glossary[0].id = 2; },
    (brief) => { brief.sections[0].items[0].title.en += "[1]"; },
  ]);
});

test("a quiet edition may omit all news without manufacturing stories or sources", () => {
  const brief = copy();
  brief.sections.forEach((section) => { section.items = []; });
  brief.sources = [];
  brief.glossary = brief.glossary.slice(0, 3);
  brief.focus = { en: "No material development was verified today. Use the experiment to practice formal verification[1], defining an invariant[2], and assessing a private preview[3].", ko: "새로운 소식은 확인되지 않았습니다. 정형 검증[1], 불변 조건[2], 사전 제공[3] 개념을 확인해보세요." };
  brief.experiment.steps = [{en:"Choose a small public function.",ko:"작은 공개 함수를 고릅니다."}, {en:"Define inputs and expected outputs.",ko:"입력과 기대 결과를 정합니다."}, {en:"Run the tests and inspect failures.",ko:"테스트를 실행하고 실패를 확인합니다."}];
  brief.experiment.measure = {en:"Count how many claims you could verify from the original public documents.",ko:"원문으로 확인한 주장 수를 셉니다."};
  assert.doesNotThrow(() => validateBrief(brief));
});

test("original images require safe URLs, dimensions, and attribution to the story", () => {
  rejects([
    (brief) => { brief.sections[1].items[0].visual.image.url = "javascript:alert(1)"; },
    (brief) => { brief.sections[1].items[0].visual.image.width = 0; },
    (brief) => { brief.sections[1].items[0].visual.image.sourceId = "formal-verification"; },
    (brief) => { brief.sections[1].items[0].visual.image.url = "https://127.0.0.1/private.png"; },
  ]);
  const brief = copy();
  brief.sections[0].items[0].visual.image = null;
  assert.doesNotThrow(() => validateBrief(brief));
});

test("paper and code resources reject unsafe and duplicate links", () => {
  rejects([
    (brief) => { brief.sections[0].items[0].resources[0].url = "javascript:alert(1)"; },
    (brief) => { brief.sections[0].items[0].resources.push({ ...brief.sections[0].items[0].resources[0] }); },
  ]);
});


test("every edition requires Korean and English text with matching note references", () => {
  rejects([
    (brief) => { delete brief.sections[0].items[0].summary.ko; },
    (brief) => { brief.title.ko = ""; },
    (brief) => { brief.sections[0].items[0].summary.ko = brief.sections[0].items[0].summary.ko.replace("[1]", "[2]"); },
    (brief) => { brief.sections[0].items[0].visual.caption.ko = ""; },
  ]);
});
