# Daily Brief — one AI paper, understood deeply

## Product purpose

Publish **one** current, technically important AI paper per day, then let the reader explore its technical terms and prerequisite knowledge directly in the article. English is the initial reading language; Korean is a complete alternative. Knowledge is not an independently generated content feed; it comes from published papers and remains linked to each source.

## Source-neutral discovery

Monitor Hugging Face Daily/Trending Papers, Hacker News discussion links, Reddit r/MachineLearning and r/LocalLLaMA, plus official arXiv papers and author/project pages. Compare recent discussion and technical significance before choosing exactly one paper. Discovery data is collected by `scripts/research/discover.py` and kept in `content/research/discovery/latest.json`. Community engagement is a selection signal, **not** a scientific quality rating. The fetch is best-effort: Reddit or other public endpoints may block automated access.

Do not rank papers solely by one platform, number of votes, or GitHub stars. Prefer recent original ideas, credible evidence, applicability to systems, agents, multimodal models, or fundamental training/inference methods, and independent cross-community discussion. Deduplicate reviewed arXiv IDs across earlier dates.

## Editorial contract

Every *published* review must be independently checked against the full primary paper, not just a discovery site's AI summary or author abstract. Nine chapters in order:
1. Executive Summary
2. Background & Research Problem
3. Core Innovations
4. Architecture & Methodology
5. Experiments & Results (exact author-reported conditions, baselines and metrics)
6. Critical Analysis & Limitations
7. Engineering Implications
8. Future Directions
9. Sources & Further Reading

In each claim distinguish research-author claims, observations, and reviewer interpretation. Include original figures with attribution when verified and useful. Do not invent benchmarks, screenshots or missing experimental values. Cite the original paper and author sources. Provide bilingual complete prose, not machine-summary dumping. Require multiple source-grounded technical concepts, each with definition, prerequisites, example and paper-specific significance. Inline concept markers `[[concept-id]]` or `[[concept-id|custom label]]` must resolve to a concept in the review.

Content contract: `content/research/reviews/YYYY-MM-DD-paper-slug.json`. One published review per date; `npm run research:validate` enforces structural integrity. If full-paper verification is not possible, **do not label a candidate as a completed deep review**. Keep it in the discovery queue until review completion.

## Publishing and automation

GitHub Actions automatically refresh **candidate discovery only**, at 05:50 KST. It does not create a long-form AI article from an abstract. The separate ChatGPT daily deep-dive task researches and delivers a bilingual, evidence-checked review at 06:30 KST. Website publication requires writing a fully validated new review JSON file and successful GitHub Pages deployment. Do not claim site auto-publication if access, model inference, or verification is unavailable.

Knowledge explanations are currently editorial notes based on linked paper context. The **Ask AI about this** button opens ChatGPT with a prefilled question; it is not an embedded AI agent or a live paid-model API. Static hosting remains GitHub Pages.
