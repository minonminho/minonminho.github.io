# Paper review editorial contract

Daily Brief contains two distinct workflows:

1. **Discovery / metadata digest**: the GitHub Action `update-paper-briefs.yml` gathers Hugging Face Papers metadata, AI-generated summaries, author abstracts and bilingual translations. This is **not an independently authored paper review**. Always label these files with `editorialStatus: "metadata-digest"`. No source-derived experiment table, critical assessment or engineer recommendation may be invented from the abstract. Discovery can run every day/week/month.
2. **Reviewed article**: a reviewer reads and checks the original paper, comparison tables, limitations, figures, code and citations; labels paper claims versus their interpretation; and may publish an independent Daily Paper or Highlighted Paper Review. Use `editorialStatus: "reviewed"` on independently verified content. A featured Highlight is published **only** after this step, never directly from the Hugging Face AI summary.

## Daily Paper Review — 7 chapters

| # | English | Korean | Required substance |
| --- | --- | --- | --- |
| 01 | TL;DR | 핵심 요약 (TL;DR) | Problem, Core idea, Why it matters |
| 02 | Research Problem | 연구 문제 | Prior baseline and the precise gap |
| 03 | Key Contributions | 핵심 기여 | New ideas and author claims |
| 04 | Method Overview | 방법론 개요 | Architecture, algorithm and mechanism |
| 05 | Key Results | 주요 실험 결과 | Baselines, datasets, conditions and actual evidence |
| 06 | Limitations & Implications | 한계와 시사점 | Limits, reviewer analysis and engineering implications |
| 07 | References | 참고 자료 | Original paper, code and figure attribution |

Target reading time: roughly 3–5 minutes for an independently authored Daily Paper. Knowledge terminology may appear as an H3 subsection, not an extra top-level numbered chapter.

## Highlighted Paper Review — 9 chapters

| # | English | Korean |
| --- | --- | --- |
| 01 | Executive Summary | 핵심 요약 |
| 02 | Background & Motivation | 배경과 연구 동기 |
| 03 | Core Innovation | 핵심 혁신 |
| 04 | Architecture & Methodology | 아키텍처와 방법론 |
| 05 | Experiments & Results | 실험과 결과 |
| 06 | Critical Analysis | 비판적 분석 |
| 07 | Engineering Insights | 엔지니어링 인사이트 |
| 08 | Future Directions | 향후 연구 방향 |
| 09 | References & Resources | 참고 자료와 리소스 |

Target reading time: roughly 10–15 minutes **only when full source analysis is available**. Technical terms link to Knowledge and may also appear in an unnumbered appendix. Do not publish an abbreviated abstract as a deep review.

## Accuracy & publication gates

- Identify original evidence, year/date, versions, baselines, metrics and test conditions. Cite primary sources and mark any missing comparisons as unverified.
- Label **Paper claim**, **Reviewer analysis**, and **Engineering implication** distinctly. Do not present opinions or speculative extensions as measured paper results.
- Embed genuine, attributed original figures and cite reuse terms. Never create fake benchmark charts.
- Write English and Korean bodies with the same factual assertions and qualifications. English is the site's default.
- Extract terminology, deduplicate against existing Knowledge, and link concepts. Do not force invented terminology.
- Templates live at `content/paper-reviews/templates/daily-paper-template.md` and `content/paper-reviews/templates/highlighted-review-template.md`; `npm run paper:validate` enforces their seven- and nine-section order for markdown files. Highlight JSON is additionally checked by `src/lib/daily-brief/highlights.ts`.
- The automated Hugging Face fetcher may publish labeled **digests** but cannot mark them `reviewed`, and **must not publish new Highlight articles** until a full-paper review workflow exists.
- Historical metadata-only items remain visible but transparently labeled; restructuring their headings is not equivalent to independently fact-checking their contents.
