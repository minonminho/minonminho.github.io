// Shared Markdown readers for the dispatcher and local Knowledge processor.
export function localeBlock(markdown, locale) {
  const marker = `<!-- locale: ${locale} -->`;
  const start = markdown.indexOf(marker);
  if (start < 0) return "";
  const bodyStart = start + marker.length;
  const next = markdown.indexOf("<!-- locale:", bodyStart);
  return markdown.slice(bodyStart, next < 0 ? undefined : next);
}

export function sectionBody(markdown, locale, titles) {
  const body = localeBlock(markdown, locale);
  const headings = [...body.matchAll(/^(#{1,6})[ \t]+(.+?)[ \t]*\r?$/gm)];
  const names = new Set(titles.map((title) => title.toLowerCase()));
  const index = headings.findIndex((heading) => names.has(heading[2].trim().toLowerCase()));
  if (index < 0) return "";
  const heading = headings[index];
  const next = headings.slice(index + 1).find((item) => item[1].length <= heading[1].length);
  return body.slice(heading.index + heading[0].length, next?.index ?? body.length);
}

export function terminologyRows(markdown, locale) {
  const titles = locale === "ko" ? ["Knowledge 용어 정리", "용어 정리"] : ["Terminology for Knowledge", "Terminology"];
  const section = sectionBody(markdown, locale, titles);
  const cells = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  const lines = section.split(/\r?\n/);
  const header = lines.findIndex((line, index) => line.trim().startsWith("|") &&
    cells(lines[index + 1] ?? "").every((cell) => /^:?-{3,}:?$/.test(cell)));
  if (header < 0) return [];
  const rows = [];
  for (const line of lines.slice(header + 2)) {
    if (!line.trim().startsWith("|")) break;
    const [term, definition, context] = cells(line);
    if (term && definition && context) rows.push({ term, definition, context });
  }
  return rows;
}
