import assert from "node:assert/strict";
import test from "node:test";
import { sectionBody, terminologyRows } from "./paper-sections.mjs";

const table = (term) => `| Term | Meaning | Context |\n| --- | --- | --- |\n| ${term} | Definition | Context |`;

for (const [en, ko] of [
  ["## Terminology", "## 용어 정리"],
  ["### Terminology for Knowledge", "### Knowledge 용어 정리"],
]) {
  test(`reads bilingual terminology using ${en}`, () => {
    const markdown = `<!-- locale: en -->\n${en}\n${table("Alpha compositing")}\n<!-- locale: ko -->\n${ko}\n${table("Alpha 합성")}`;
    assert.equal(terminologyRows(markdown, "en")[0].term, "Alpha compositing");
    assert.equal(terminologyRows(markdown, "ko")[0].term, "Alpha 합성");
  });
}

test("terminology does not consume sibling tables or another locale", () => {
  const markdown = `<!-- locale: en -->\n### Terminology for Knowledge\n${table("First")}\n### Other table\n${table("Second")}\n<!-- locale: ko -->\n## Terminology\n${table("Third")}`;
  assert.deepEqual(terminologyRows(markdown, "en").map((row) => row.term), ["First"]);
  assert.deepEqual(terminologyRows(markdown, "ko"), []);
  assert.deepEqual(terminologyRows(markdown.replace("### Terminology for Knowledge", "### Missing"), "en"), []);
});

for (const heading of ["References", "References & Resources", "References and figure credits"]) {
  test(`reads ${heading} without crossing the locale boundary`, () => {
    const markdown = `<!-- locale: en -->\n## ${heading}\nhttps://arxiv.org/abs/2610.24738\n<!-- locale: ko -->\n## 참고 자료\nhttps://example.com/korean-only`;
    const section = sectionBody(markdown, "en", ["References", "References & Resources", "References and figure credits"]);
    assert.match(section, /arxiv\.org/);
    assert.doesNotMatch(section, /korean-only/);
  });
}
